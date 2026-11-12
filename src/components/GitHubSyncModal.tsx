import React, { useState, useEffect } from 'react';
import { 
  X, 
  Github, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2,
  UploadCloud,
  ExternalLink
} from 'lucide-react';
import { GitHubRepoConfig, DocItem, FolderCategory } from '../types';
import { 
  generateGitHubCatalogJson, 
  generateGitHubPagesWorkflow,
  commitCatalogJsonToGitHub
} from '../services/githubService';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GitHubRepoConfig;
  onSaveConfig: (config: GitHubRepoConfig) => void;
  onTriggerSync: (config: GitHubRepoConfig) => Promise<void>;
  isSyncing: boolean;
  docs: DocItem[];
  categories: FolderCategory[];
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTriggerSync,
  isSyncing,
  docs,
  categories,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'export' | 'guide' | 'workflow'>('config');

  const [owner, setOwner] = useState(config.owner || 'sudarshan8555');
  const [repo, setRepo] = useState(config.repo || 'public-documents');
  const [branch, setBranch] = useState(config.branch || 'main');
  const [folderPath, setFolderPath] = useState(config.folderPath || 'documents');
  const [token, setToken] = useState(config.personalAccessToken || '');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const [isPushingCatalog, setIsPushingCatalog] = useState(false);
  const [catalogPushStatus, setCatalogPushStatus] = useState<{
    ok: boolean;
    message: string;
    htmlUrl?: string;
  } | null>(null);

  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [copiedCatalog, setCopiedCatalog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOwner(config.owner || 'sudarshan8555');
      setRepo(config.repo || 'public-documents');
      setBranch(config.branch || 'main');
      setFolderPath(config.folderPath || 'documents');
      setToken(config.personalAccessToken || '');
      setCatalogPushStatus(null);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const currentDraftConfig = (): GitHubRepoConfig => ({
    owner: owner.trim(),
    repo: repo.trim(),
    branch: branch.trim() || 'main',
    folderPath: folderPath.trim(),
    personalAccessToken: token.trim() || undefined,
    syncStatus: config.syncStatus,
  });

  const handleSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncMessage(null);
    setIsSuccess(null);

    const newConfig: GitHubRepoConfig = {
      ...currentDraftConfig(),
      syncStatus: 'syncing',
    };

    onSaveConfig(newConfig);

    try {
      await onTriggerSync(newConfig);
      setIsSuccess(true);
      setSyncMessage(`Successfully connected to ${owner}/${repo}! Repository folders and documents are synced.`);
    } catch (err: any) {
      setIsSuccess(false);
      setSyncMessage(err.message || 'Failed to sync with GitHub repository.');
    }
  };

  const handlePushCatalogToGitHub = async () => {
    setCatalogPushStatus(null);
    const cfg = currentDraftConfig();
    onSaveConfig(cfg);

    if (!cfg.personalAccessToken) {
      setCatalogPushStatus({
        ok: false,
        message: 'Please enter your GitHub Personal Access Token in the Repository Connection tab (or below) to commit directly to GitHub.',
      });
      return;
    }

    setIsPushingCatalog(true);
    try {
      const res = await commitCatalogJsonToGitHub(cfg, docs, categories);
      setCatalogPushStatus({
        ok: true,
        message: `Successfully committed catalog.json (${docs.length} records) to ${cfg.owner}/${cfg.repo}!`,
        htmlUrl: res.htmlUrl,
      });
    } catch (err: any) {
      setCatalogPushStatus({
        ok: false,
        message: err.message || 'Failed to push catalog.json to GitHub.',
      });
    } finally {
      setIsPushingCatalog(false);
    }
  };

  const handleDownloadCatalog = () => {
    const jsonStr = generateGitHubCatalogJson(docs, categories);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'catalog.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCatalog = () => {
    const jsonStr = generateGitHubCatalogJson(docs, categories);
    navigator.clipboard.writeText(jsonStr);
    setCopiedCatalog(true);
    setTimeout(() => setCopiedCatalog(false), 2000);
  };

  const handleCopyWorkflow = () => {
    const yml = generateGitHubPagesWorkflow();
    navigator.clipboard.writeText(yml);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1F2937]/45 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-[#D1D5DB] w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D1D5DB] flex items-center justify-between bg-gradient-to-r from-[#D1FAE5]/75 via-[#CFFAFE]/75 to-[#BFDBFE]/75">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-white flex items-center justify-center shadow-xs">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#1F2937] leading-tight">
                Two-Way GitHub Repository Sync & Direct Commit
              </h2>
              <p className="text-xs text-[#6B7280]">
                Pull files from GitHub or push new documents & <code className="font-mono">catalog.json</code> directly to your repository
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#6B7280] hover:text-[#1F2937] hover:bg-[#E5E7EB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#D1D5DB] bg-white px-6 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            1. Two-Way Connection & Token
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'export'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            2. Push / Commit catalog.json
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            How Two-Way Sync Works
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'workflow'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            GitHub Pages Deploy
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'config' && (
            <form onSubmit={handleSyncSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#CFFAFE]/35 border border-[#06B6D4]/50 text-xs text-[#1F2937] leading-relaxed">
                <strong className="text-[#3B82F6] block mb-0.5">Two-Way GitHub Integration:</strong>
                Public visitors can view and download all files with zero login. Providing your Personal Access Token below enables you to <strong>upload files and commit metadata directly to GitHub</strong> from the <em>Add Document</em> modal!
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    GitHub Username or Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="e.g. sudarshan8555"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    Repository Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    placeholder="e.g. public-documents"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    Documents Folder Path (optional)
                  </label>
                  <input
                    type="text"
                    value={folderPath}
                    onChange={(e) => setFolderPath(e.target.value)}
                    placeholder="documents (or leave empty for repo root)"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">
                  GitHub Personal Access Token (Required for Direct Upload / Commit)
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_... or github_pat_... (needs repo or contents:write permission)"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] font-mono"
                />
                <span className="text-[11px] text-[#6B7280] mt-1 block">
                  Saved securely in your browser so you can push new PDFs and <code className="font-mono">catalog.json</code> directly to <strong className="text-[#1F2937]">{owner}/{repo}</strong>.
                </span>
              </div>

              {syncMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                    isSuccess
                      ? 'bg-[#D1FAE5]/60 text-[#1F2937] border border-[#10B981]'
                      : 'bg-red-50 text-[#EF4444] border border-[#EF4444]/40'
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                  )}
                  <span>{syncMessage}</span>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSaveConfig(currentDraftConfig());
                    setIsSuccess(true);
                    setSyncMessage('Saved GitHub repository & token settings.');
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-[#1F2937] bg-[#E5E7EB] hover:bg-[#D1D5DB] border border-[#D1D5DB] transition-colors"
                >
                  Save Settings Only
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-5 py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-2xs transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Syncing with GitHub...</span>
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4 text-white" />
                      <span>Pull & Sync from GitHub</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4 text-xs sm:text-sm text-[#1F2937] leading-relaxed">
              <div className="p-4 rounded-xl bg-[#CFFAFE]/35 border border-[#06B6D4]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1F2937]">
                    Direct Commit <code>catalog.json</code> to {owner}/{repo}
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Pushes all <strong className="text-[#1F2937]">{docs.length}</strong> records and <strong className="text-[#1F2937]">{categories.length}</strong> folders directly to{' '}
                    <code className="font-mono text-[#3B82F6]">{folderPath ? `${folderPath}/catalog.json` : 'catalog.json'}</code> on branch <strong className="text-[#1F2937]">{branch || 'main'}</strong>.
                  </p>
                </div>
                <button
                  onClick={handlePushCatalogToGitHub}
                  disabled={isPushingCatalog}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-2xs transition-all inline-flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {isPushingCatalog ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Committing...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-white" />
                      <span>Commit catalog.json to GitHub</span>
                    </>
                  )}
                </button>
              </div>

              {!token.trim() && (
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    GitHub Personal Access Token (Required to commit directly)
                  </label>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_... or github_pat_..."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] font-mono"
                  />
                </div>
              )}

              {catalogPushStatus && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 ${
                    catalogPushStatus.ok
                      ? 'bg-[#D1FAE5]/60 text-[#1F2937] border border-[#10B981]'
                      : 'bg-red-50 text-[#EF4444] border border-[#EF4444]/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {catalogPushStatus.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                    )}
                    <span>{catalogPushStatus.message}</span>
                  </div>
                  {catalogPushStatus.htmlUrl && (
                    <a
                      href={catalogPushStatus.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-[#3B82F6] hover:underline shrink-0"
                    >
                      <span>View on GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              <div className="p-4 rounded-xl bg-[#1F2937] text-white font-mono text-xs max-h-52 overflow-y-auto">
                <pre>{generateGitHubCatalogJson(docs, categories).slice(0, 900)}...</pre>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleCopyCatalog}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#1F2937] bg-[#E5E7EB] hover:bg-[#D1D5DB] border border-[#D1D5DB] transition-colors flex items-center gap-1.5"
                >
                  {copiedCatalog ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCatalog ? 'Copied to Clipboard' : 'Copy catalog.json'}</span>
                </button>
                <button
                  onClick={handleDownloadCatalog}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download catalog.json File</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs sm:text-sm text-[#1F2937] leading-relaxed">
              <h3 className="text-base font-bold text-[#1F2937]">
                How Two-Way GitHub Document Synchronization Works
              </h3>
              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl bg-white border border-[#D1D5DB]">
                  <span className="font-bold text-[#3B82F6] block mb-1">
                    1. Direct Upload & Commit from "Add Document":
                  </span>
                  <p className="text-[#6B7280]">
                    When adding or editing any circular in DocuHub, check <strong className="text-[#1F2937]">Direct GitHub Upload & Commit</strong>. DocuHub pushes the uploaded PDF (or auto-generated official PDF) straight to <code>{folderPath || 'documents'}/&lt;division&gt;/&lt;filename&gt;</code> in your GitHub repository and updates <code>catalog.json</code> automatically.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#D1D5DB]">
                  <span className="font-bold text-[#3B82F6] block mb-1">
                    2. Pull & Auto-Discovery from GitHub Folders:
                  </span>
                  <p className="text-[#6B7280]">
                    You can also drop files directly into your GitHub repository on github.com using the naming convention <code>2026-03-15_REF-101_Subject_Title.pdf</code> and click the Sync icon in the top bar to pull them into DocuHub.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#D1D5DB]">
                  <span className="font-bold text-[#3B82F6] block mb-1">
                    3. Worldwide Zero-Login Downloads:
                  </span>
                  <p className="text-[#6B7280]">
                    Every file committed to your public GitHub repository is immediately downloadable by all visitors via <code>raw.githubusercontent.com</code> without requiring any login.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-4 text-xs sm:text-sm text-[#1F2937] leading-relaxed">
              <div>
                <h3 className="text-base font-bold text-[#1F2937] mb-1">
                  Host This Entire Website on GitHub Pages (Free)
                </h3>
                <p className="text-[#6B7280] text-xs">
                  Create a file named <code>.github/workflows/deploy.yml</code> in your repository, and GitHub will automatically build and publish your document portal website every time you push!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#1F2937] text-white font-mono text-xs max-h-64 overflow-y-auto">
                <pre>{generateGitHubPagesWorkflow()}</pre>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleCopyWorkflow}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  {copiedWorkflow ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedWorkflow ? 'Copied YAML!' : 'Copy deploy.yml Workflow'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#D1D5DB] bg-white flex items-center justify-between">
          <div className="text-xs text-[#6B7280]">
            Target Repository: <strong className="text-[#1F2937]">{owner}/{repo}</strong> ({branch || 'main'})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-[#1F2937] bg-[#E5E7EB] hover:bg-[#D1D5DB] border border-[#D1D5DB] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
