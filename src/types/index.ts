export type DocumentStatus = 'Official' | 'Circular' | 'Confidential' | 'Public Notice' | 'Archived' | 'Active';

export interface DocItem {
  id: string;
  refNo: string;            // Letter / Reference Number (e.g. "DIR/FIN/2025/089")
  letterDate: string;       // YYYY-MM-DD
  subject: string;          // Main title / subject of the document
  category: string;         // Folder / Category ID
  description: string;      // Comprehensive summary / abstract
  tags: string[];           // Searchable keywords
  fileName: string;         // e.g. "budget-allocation-2025.pdf"
  fileSize: number;         // bytes
  fileType: string;         // 'pdf' | 'docx' | 'xlsx' | 'txt' | 'csv' | 'md' | 'png' | 'jpg'
  downloadUrl?: string;     // URL to download directly (raw.githubusercontent.com or data URL)
  source: 'github' | 'local' | 'demo';
  senderDept?: string;      // Issuing Department / Ministry / Organization
  recipient?: string;       // Target audience / Recipient
  contentPreview?: string;  // Text or markdown content for direct preview
  status?: DocumentStatus;
  sha256?: string;          // File integrity hash
  createdAt: string;
}

export interface FolderCategory {
  id: string;
  name: string;
  description: string;
  icon: string;             // Lucide icon identifier
  color: string;            // Color theme class (blue, amber, emerald, purple, rose, cyan, etc.)
  gitHubPath?: string;      // Subdirectory in GitHub repo
}

export interface GitHubRepoConfig {
  owner: string;
  repo: string;
  branch: string;
  folderPath: string;
  personalAccessToken?: string;
  lastSyncedAt?: string;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  errorMessage?: string;
}

export interface PdfReportOptions {
  title: string;
  organization: string;
  department?: string;
  folderName: string;
  notes?: string;
  includeStats: boolean;
  includeDescription: boolean;
  includeRefNo: boolean;
  includeLetterDate: boolean;
  filterSummary?: string;
}
