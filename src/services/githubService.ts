import { DocItem, FolderCategory, GitHubRepoConfig } from '../types';

export interface GitHubFileEntry {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
}

/**
 * Parses smart metadata from file name if catalog.json is not present
 * e.g. "2026-03-15_CIR-ADM-042B_Paperless_Governance_Mandate.pdf"
 */
export function parseFileNameMetadata(fileName: string, subfolder?: string): Partial<DocItem> {
  const cleanName = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
  const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';

  // Check for ISO Date pattern at beginning: YYYY-MM-DD
  const dateMatch = cleanName.match(/^(\d{4}[-_]\d{2}[-_]\d{2})/);
  let letterDate = new Date().toISOString().split('T')[0];
  let remaining = cleanName;

  if (dateMatch) {
    letterDate = dateMatch[1].replace(/_/g, '-');
    remaining = remaining.substring(dateMatch[0].length).replace(/^[-_ ]+/, '');
  }

  // Check for Ref No pattern like: REF-123, CIR/ADM/042, LTR-2026-99
  const refMatch = remaining.match(/^([A-Z0-9]{2,6}[-_/][A-Z0-9-_/]+?)[-_ ]{2,}/i) ||
                   remaining.match(/^([A-Z0-9]{2,6}[-_][A-Z0-9]+)/i);
  let refNo = `DOC/${letterDate.slice(0, 4)}/${Math.floor(100 + Math.random() * 900)}`;

  if (refMatch) {
    refNo = refMatch[1].replace(/_/g, '-');
    remaining = remaining.substring(refMatch[0].length).replace(/^[-_ ]+/, '');
  }

  // The rest is the Subject
  const subject = remaining
    .replace(/[-_]+/g, ' ')
    .trim() || cleanName;

  // Capitalize properly
  const formattedSubject = subject.charAt(0).toUpperCase() + subject.slice(1);

  // Auto tags
  const autoTags = ['Public Document'];
  if (subfolder) autoTags.push(subfolder.replace(/[-_]/g, ' '));
  if (ext === 'pdf') autoTags.push('Official PDF');
  if (ext === 'xlsx' || ext === 'csv') autoTags.push('Data Sheet');

  return {
    refNo,
    letterDate,
    subject: formattedSubject,
    description: `Public document "${fileName}" hosted in repository archive. Category: ${subfolder || 'General Archive'}. Format: ${ext.toUpperCase()}. Available for public download without authentication.`,
    tags: autoTags,
    fileType: ext,
  };
}

/**
 * Fetches repository items using GitHub REST API v3
 */
export async function fetchGitHubRepoContents(config: GitHubRepoConfig): Promise<{
  docs: DocItem[];
  categories: FolderCategory[];
  rawCount: number;
}> {
  const { owner, repo, branch, folderPath, personalAccessToken } = config;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (personalAccessToken && personalAccessToken.trim() !== '') {
    headers.Authorization = `token ${personalAccessToken.trim()}`;
  }

  const cleanPath = folderPath.replace(/^\/+|\/+$/g, '');
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${cleanPath ? encodeURIComponent(cleanPath) : ''}?ref=${encodeURIComponent(branch || 'main')}`;

  const response = await fetch(apiUrl, { headers });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Repository or folder path not found: ${owner}/${repo}/${cleanPath}. Please check if the repository is public.`);
    } else if (response.status === 403) {
      throw new Error(`GitHub API rate limit exceeded. Please provide an optional GitHub Personal Access Token or try again later.`);
    }
    throw new Error(`GitHub API error (${response.status}): ${response.statusText}`);
  }

  const items: GitHubFileEntry[] = await response.json();

  if (!Array.isArray(items)) {
    throw new Error('Expected repository folder list, but received a single file.');
  }

  // 1. Look for a catalog.json or manifest.json in the repository
  const catalogEntry = items.find(
    (item) => item.type === 'file' && (item.name === 'catalog.json' || item.name === 'manifest.json')
  );

  if (catalogEntry && catalogEntry.download_url) {
    try {
      const catalogRes = await fetch(catalogEntry.download_url);
      if (catalogRes.ok) {
        const catalogData = await catalogRes.json();
        if (catalogData && Array.isArray(catalogData.documents)) {
          // Found structured catalog with categories!
          const parsedDocs: DocItem[] = catalogData.documents.map((d: any) => ({
            ...d,
            source: 'github' as const,
            downloadUrl: d.downloadUrl || `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${cleanPath ? cleanPath + '/' : ''}${d.fileName}`,
          }));

          const parsedCategories: FolderCategory[] = Array.isArray(catalogData.categories)
            ? catalogData.categories
            : [];

          return {
            docs: parsedDocs,
            categories: parsedCategories,
            rawCount: parsedDocs.length,
          };
        }
      }
    } catch (err) {
      console.warn('Failed to parse catalog.json, falling back to directory scan:', err);
    }
  }

  // 2. Directory scanning and smart file parsing
  const docs: DocItem[] = [];
  const discoveredCategories: Record<string, FolderCategory> = {};

  for (const item of items) {
    if (item.type === 'file') {
      // Ignore hidden or config files
      if (item.name.startsWith('.') || item.name === 'catalog.json' || item.name === 'manifest.json' || item.name === 'README.md') {
        continue;
      }

      const meta = parseFileNameMetadata(item.name, cleanPath || 'Repository Files');
      const ext = item.name.split('.').pop()?.toLowerCase() || 'file';
      const rawUrl = item.download_url || `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;

      docs.push({
        id: `gh-${item.sha.substring(0, 8)}`,
        refNo: meta.refNo || `GH/${item.name.slice(0, 8).toUpperCase()}`,
        letterDate: meta.letterDate || new Date().toISOString().split('T')[0],
        subject: meta.subject || item.name,
        category: cleanPath ? cleanPath.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'github-general',
        description: meta.description || `File "${item.name}" from GitHub repository ${owner}/${repo}.`,
        tags: meta.tags || ['GitHub', ext.toUpperCase()],
        fileName: item.name,
        fileSize: item.size || 0,
        fileType: ext,
        downloadUrl: rawUrl,
        source: 'github',
        sha256: item.sha,
        status: 'Public Notice',
        createdAt: new Date().toISOString(),
      });
    } else if (item.type === 'dir') {
      // It's a subfolder! Register as a Category
      const catId = item.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      discoveredCategories[catId] = {
        id: catId,
        name: item.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        description: `Documents and records located in the "${item.name}" repository directory`,
        icon: 'Folder',
        color: 'blue',
        gitHubPath: item.path,
      };
    }
  }

  // If we found a subfolder, we can also optionally scan 1 level deep for files
  for (const dirName of Object.keys(discoveredCategories)) {
    const dir = discoveredCategories[dirName];
    if (!dir.gitHubPath) continue;

    try {
      const subUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(dir.gitHubPath)}?ref=${encodeURIComponent(branch || 'main')}`;
      const subRes = await fetch(subUrl, { headers });
      if (subRes.ok) {
        const subItems: GitHubFileEntry[] = await subRes.json();
        if (Array.isArray(subItems)) {
          for (const sItem of subItems) {
            if (sItem.type === 'file' && !sItem.name.startsWith('.')) {
              const meta = parseFileNameMetadata(sItem.name, dir.name);
              const ext = sItem.name.split('.').pop()?.toLowerCase() || 'file';
              const rawUrl = sItem.download_url || `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${sItem.path}`;

              docs.push({
                id: `gh-${sItem.sha.substring(0, 8)}`,
                refNo: meta.refNo || `GH/${sItem.name.slice(0, 8).toUpperCase()}`,
                letterDate: meta.letterDate || new Date().toISOString().split('T')[0],
                subject: meta.subject || sItem.name,
                category: dir.id,
                description: meta.description || `Public file "${sItem.name}" in folder "${dir.name}".`,
                tags: meta.tags || ['GitHub', dir.name, ext.toUpperCase()],
                fileName: sItem.name,
                fileSize: sItem.size || 0,
                fileType: ext,
                downloadUrl: rawUrl,
                source: 'github',
                sha256: sItem.sha,
                status: 'Official',
                createdAt: new Date().toISOString(),
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn(`Could not fetch subfolder ${dir.name}:`, e);
    }
  }

  return {
    docs,
    categories: Object.values(discoveredCategories),
    rawCount: docs.length,
  };
}

/**
 * Creates a catalog.json string ready to commit to GitHub repo
 */
export function generateGitHubCatalogJson(docs: DocItem[], categories: FolderCategory[]): string {
  const exportData = {
    repositoryVersion: '1.0',
    generatedAt: new Date().toISOString(),
    totalDocuments: docs.length,
    categories: categories,
    documents: docs.map((doc) => ({
      id: doc.id,
      refNo: doc.refNo,
      letterDate: doc.letterDate,
      subject: doc.subject,
      category: doc.category,
      description: doc.description,
      tags: doc.tags,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      fileType: doc.fileType,
      downloadUrl: doc.source === 'github' ? doc.downloadUrl : undefined,
      senderDept: doc.senderDept,
      recipient: doc.recipient,
      status: doc.status,
      sha256: doc.sha256,
      createdAt: doc.createdAt,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Converts a File or Blob to a clean Base64 string (without data:... prefix)
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Encodes a UTF-8 string to Base64 for GitHub Contents API
 */
export function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Uploads or updates a file directly in the configured GitHub repository via REST API v3
 */
export async function uploadFileToGitHubRepo(params: {
  config: GitHubRepoConfig;
  targetPath: string;
  base64Content: string;
  commitMessage: string;
}): Promise<{
  downloadUrl: string;
  htmlUrl: string;
  sha: string;
}> {
  const { config, targetPath, base64Content, commitMessage } = params;
  const { owner, repo, branch, personalAccessToken } = config;

  if (!personalAccessToken || !personalAccessToken.trim()) {
    throw new Error(
      'A GitHub Personal Access Token (with repo / contents:write permission) is required to push files directly to GitHub.'
    );
  }

  const cleanToken = personalAccessToken.trim();
  const cleanBranch = (branch || 'main').trim();
  const cleanTargetPath = targetPath.replace(/^\/+|\/+$/g, '');
  const encodedPath = cleanTargetPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
    repo
  )}/contents/${encodedPath}`;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${cleanToken}`,
    'Content-Type': 'application/json',
  };

  // 1. Check if the file already exists so we can include its SHA for updating
  let existingSha: string | undefined;
  try {
    const checkRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(cleanBranch)}`, {
      method: 'GET',
      headers,
    });
    if (checkRes.ok) {
      const existingData = await checkRes.json();
      if (existingData && existingData.sha) {
        existingSha = existingData.sha;
      }
    }
  } catch {
    // File does not exist yet; proceed with creation
  }

  // 2. PUT the file to GitHub
  const bodyPayload: Record<string, any> = {
    message: commitMessage,
    content: base64Content,
    branch: cleanBranch,
  };
  if (existingSha) {
    bodyPayload.sha = existingSha;
  }

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(bodyPayload),
  });

  if (!putRes.ok) {
    let errText = putRes.statusText;
    try {
      const errJson = await putRes.json();
      if (errJson && errJson.message) errText = errJson.message;
    } catch {
      // ignore json parse error
    }
    throw new Error(`GitHub Commit Failed (${putRes.status}): ${errText}`);
  }

  const result = await putRes.json();
  const rawDownloadUrl =
    result?.content?.download_url ||
    `https://raw.githubusercontent.com/${owner}/${repo}/${cleanBranch}/${cleanTargetPath}`;

  return {
    downloadUrl: rawDownloadUrl,
    htmlUrl: result?.content?.html_url || `https://github.com/${owner}/${repo}/blob/${cleanBranch}/${cleanTargetPath}`,
    sha: result?.content?.sha || '',
  };
}

/**
 * Commits the updated catalog.json manifest directly to the GitHub repository
 */
export async function commitCatalogJsonToGitHub(
  config: GitHubRepoConfig,
  docs: DocItem[],
  categories: FolderCategory[]
): Promise<{ htmlUrl: string; sha: string }> {
  const cleanFolder = (config.folderPath || '').replace(/^\/+|\/+$/g, '');
  const catalogPath = cleanFolder ? `${cleanFolder}/catalog.json` : 'catalog.json';
  const jsonString = generateGitHubCatalogJson(docs, categories);
  const base64Content = utf8ToBase64(jsonString);

  const res = await uploadFileToGitHubRepo({
    config,
    targetPath: catalogPath,
    base64Content,
    commitMessage: `chore(catalog): sync ${docs.length} official corporate records via DocuHub Enterprise`,
  });

  return {
    htmlUrl: res.htmlUrl,
    sha: res.sha,
  };
}

/**
 * Generates ready-to-use GitHub Actions workflow file for zero-config GitHub Pages
 */
export function generateGitHubPagesWorkflow(): string {
  return `name: Deploy Document Portal to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm install --legacy-peer-deps
      - name: Build app
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
}

