import React from 'react';
import { 
  Table, 
  LayoutGrid, 
  Folder, 
  Plus, 
  X, 
  ChevronDown, 
  Tag,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { DocItem, FolderCategory } from '../types';
import { formatBytes } from '../services/pdfReportService';

export type DatePreset = 'all' | 'fy-2026-27' | 'fy-2025-26' | 'year-2026' | 'year-2025' | 'last-90' | 'custom';

interface StatsOverviewProps {
  categories: FolderCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  onOpenNewCategoryModal: () => void;
  currentCategory: FolderCategory | null;
  allDocsCount: number;
  filteredDocs: DocItem[];
  docsByCategoryCount: Record<string, number>;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  availableTags: string[];
  datePreset: DatePreset;
  onDatePresetChange: (preset: DatePreset) => void;
  customStartDate: string;
  onCustomStartDateChange: (date: string) => void;
  customEndDate: string;
  onCustomEndDateChange: (date: string) => void;
  onExportCsv: () => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  onOpenNewCategoryModal,
  allDocsCount,
  filteredDocs,
  docsByCategoryCount,
  selectedTag,
  onSelectTag,
  availableTags,
  datePreset,
  onDatePresetChange,
  customStartDate,
  onCustomStartDateChange,
  customEndDate,
  onCustomEndDateChange,
  onExportCsv,
  viewMode,
  onViewModeChange,
}) => {
  const totalSize = filteredDocs.reduce((acc, d) => acc + (d.fileSize || 0), 0);
  const hasActiveFilters = activeCategoryId !== 'all' || selectedTag !== null || datePreset !== 'all';

  return (
    <div className="bg-white rounded-xl border border-[#D1D5DB] px-3.5 py-2 mb-2.5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left Side: Inline Compact Folder Dropdown, New Folder, Date/FY Filter & Tag Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Folder / Division Selector Dropdown */}
          <div className="relative inline-flex items-center">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#3B82F6]">
              <Folder className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <select
              value={activeCategoryId}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="appearance-none bg-white hover:bg-[#E5E7EB]/60 border border-[#D1D5DB] text-[#1F2937] text-xs sm:text-sm font-bold rounded-lg pl-8 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] cursor-pointer transition-colors"
            >
              <option value="all">
                All Corporate Divisions ({allDocsCount})
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({docsByCategoryCount[cat.id] || 0})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#6B7280]">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* New Folder Button (Soft Sky-Blue Surface Button) */}
          <button
            onClick={onOpenNewCategoryModal}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#1F2937] bg-[#BFDBFE]/70 hover:bg-[#BFDBFE] border border-[#3B82F6]/50 transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40"
            title="Create New Corporate Division Folder"
          >
            <Plus className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>New Folder</span>
          </button>

          {/* Date Range & Financial Year Filter */}
          <div className="relative inline-flex items-center">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#06B6D4]">
              <Calendar className="w-3.5 h-3.5 text-[#06B6D4]" />
            </div>
            <select
              value={datePreset}
              onChange={(e) => onDatePresetChange(e.target.value as DatePreset)}
              className={`appearance-none border text-xs font-semibold rounded-lg pl-7 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] cursor-pointer transition-colors ${
                datePreset !== 'all'
                  ? 'bg-[#CFFAFE]/70 border-[#06B6D4] text-[#1F2937] font-bold'
                  : 'bg-white hover:bg-[#E5E7EB]/60 border-[#D1D5DB] text-[#1F2937]'
              }`}
              title="Filter by Financial Year or Date Range"
            >
              <option value="all">All Dates / FY</option>
              <option value="fy-2026-27">FY 2026–27 (Apr 26 – Mar 27)</option>
              <option value="fy-2025-26">FY 2025–26 (Apr 25 – Mar 26)</option>
              <option value="year-2026">Calendar Year 2026</option>
              <option value="year-2025">Calendar Year 2025</option>
              <option value="last-90">Last 90 Days</option>
              <option value="custom">Custom Date Range...</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-[#6B7280]">
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          {/* Inline Custom Date Range Pickers */}
          {datePreset === 'custom' && (
            <div className="inline-flex items-center gap-1.5 bg-[#CFFAFE]/40 border border-[#06B6D4] px-2 py-1 rounded-lg text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => onCustomStartDateChange(e.target.value)}
                className="bg-white border border-[#D1D5DB] rounded px-1.5 py-0.5 text-xs text-[#1F2937] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                title="From Date"
              />
              <span className="text-[#6B7280] font-semibold">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => onCustomEndDateChange(e.target.value)}
                className="bg-white border border-[#D1D5DB] rounded px-1.5 py-0.5 text-xs text-[#1F2937] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                title="To Date"
              />
            </div>
          )}

          {/* Classification Tag Filter */}
          {availableTags.length > 0 && (
            <div className="relative inline-flex items-center">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#6B7280]">
                <Tag className="w-3.5 h-3.5 text-[#3B82F6]" />
              </div>
              <select
                value={selectedTag || ''}
                onChange={(e) => onSelectTag(e.target.value ? e.target.value : null)}
                className="appearance-none bg-white hover:bg-[#E5E7EB]/60 border border-[#D1D5DB] text-[#1F2937] text-xs font-semibold rounded-lg pl-7 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] cursor-pointer transition-colors"
              >
                <option value="">All Tags</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    #{tag}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-[#6B7280]">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          )}

          {/* Active Tag Pill with Clear button */}
          {selectedTag && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-[#BFDBFE]/60 text-[#1F2937] border border-[#3B82F6]/40">
              <span>#{selectedTag}</span>
              <button
                onClick={() => onSelectTag(null)}
                className="hover:text-[#2563EB] transition-colors"
                title="Clear classification filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Reset All Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                onSelectCategory('all');
                onSelectTag(null);
                onDatePresetChange('all');
                onCustomStartDateChange('');
                onCustomEndDateChange('');
              }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-[#EF4444] bg-red-50 hover:bg-red-100 border border-[#EF4444]/30 transition-colors"
              title="Reset all active filters"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Side: Export CSV, Compact Inline Summary Pill & View Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 1-Click CSV / Excel Export (Secondary Button) */}
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#1F2937] border border-[#D1D5DB] text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40"
            title="Export filtered records to Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-xs font-medium text-[#6B7280] border border-[#D1D5DB]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <strong className="tabular-nums text-[#1F2937] font-bold">{filteredDocs.length}</strong>
            <span className="text-[#6B7280]">/ {allDocsCount} records</span>
            <span className="text-[#D1D5DB]">•</span>
            <span className="font-mono tabular-nums text-[#3B82F6] font-bold">{formatBytes(totalSize)}</span>
          </span>

          {/* Table vs Grid Compact Switcher */}
          <div className="flex items-center bg-[#E5E7EB] p-0.5 rounded-lg border border-[#D1D5DB]">
            <button
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all ${
                viewMode === 'table'
                  ? 'bg-[#BFDBFE]/85 text-[#1F2937] border border-[#3B82F6]/50 shadow-2xs font-bold'
                  : 'text-[#1F2937] hover:bg-white/60 font-medium'
              }`}
              title="Corporate Ledger Table View"
            >
              <Table className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#BFDBFE]/85 text-[#1F2937] border border-[#3B82F6]/50 shadow-2xs font-bold'
                  : 'text-[#1F2937] hover:bg-white/60 font-medium'
              }`}
              title="Executive Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
