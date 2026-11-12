import React from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  FileText, 
  Github, 
  RefreshCw, 
  X
} from 'lucide-react';
import { GitHubRepoConfig } from '../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategoryName: string;
  totalFilteredDocs: number;
  onOpenUpload: () => void;
  onOpenPdfReport: () => void;
  onOpenGitHubSync: () => void;
  gitHubConfig: GitHubRepoConfig;
  isSyncing: boolean;
  onQuickSync: () => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenUpload,
  onOpenPdfReport,
  onOpenGitHubSync,
  gitHubConfig,
  isSyncing,
  onQuickSync,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#D1D5DB] shadow-xs">
      {/* Compact Executive Corporate Masthead */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-13 gap-3">
          {/* Compact Single-Line Official Corporate Brand Lockup */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#1F2937] tracking-tight text-base sm:text-lg leading-none">
                DocuHub
              </span>
              <span className="text-[10px] font-bold capitalize px-1.5 py-0.5 rounded bg-[#CFFAFE] text-[#1F2937] border border-[#06B6D4]/40">
                Enterprise
              </span>
            </div>
          </div>

          {/* Compact Global Search Bar */}
          <div className="flex-1 max-w-lg mx-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7280]">
                <Search className="w-3.5 h-3.5 text-[#3B82F6]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by Ref No., issuance date, subject, or authority..."
                className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-white hover:border-[#3B82F6]/60 focus:bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#6B7280] hover:text-[#1F2937]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Compact Corporate Action Suite */}
          <div className="flex items-center gap-2 shrink-0">
            {/* GitHub Repository Connection (Secondary Button) */}
            <button
              onClick={onOpenGitHubSync}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1F2937] bg-[#E5E7EB] hover:bg-[#D1D5DB] border border-[#D1D5DB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40"
              title="GitHub Repository Sync & CDN Settings"
            >
              <Github className="w-3.5 h-3.5 text-[#1F2937]" />
              <span className="truncate max-w-[130px]">
                {gitHubConfig.repo ? `${gitHubConfig.owner}/${gitHubConfig.repo}` : 'GitHub Sync'}
              </span>
              {gitHubConfig.syncStatus === 'synced' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" title="Synchronized" />
              )}
            </button>

            {gitHubConfig.repo && (
              <button
                type="button"
                onClick={onQuickSync}
                className={`p-1.5 text-[#1F2937] bg-[#E5E7EB] hover:bg-[#D1D5DB] border border-[#D1D5DB] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40 ${
                  isSyncing ? 'animate-spin text-[#3B82F6]' : ''
                }`}
                title="Refresh Documents from GitHub"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Automatic PDF Report Button (Secondary / Cyan Accent Button) */}
            <button
              onClick={onOpenPdfReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-[#06B6D4] text-[#1F2937] bg-[#CFFAFE]/70 hover:bg-[#CFFAFE] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40"
              title="Generate Official Corporate PDF Catalog"
            >
              <FileText className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Generate PDF Report</span>
            </button>

            {/* Add Document Button (Primary Bright Blue Button) */}
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Add Document</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
