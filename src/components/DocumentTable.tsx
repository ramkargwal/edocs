import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Eye, 
  ArrowUpDown, 
  CheckSquare, 
  Square, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Check,
  Pencil,
  Trash2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { DocItem, FolderCategory } from '../types';
import { formatBytes, formatLetterDate } from '../services/pdfReportService';

interface DocumentTableProps {
  docs: DocItem[];
  categories: FolderCategory[];
  onPreviewDoc: (doc: DocItem) => void;
  onDownloadDoc: (doc: DocItem) => void;
  onEditDoc?: (doc: DocItem) => void;
  onCategoryClick: (categoryId: string) => void;
  onAuthorityClick?: (authority: string) => void;
  onCopyRefNo?: (refNo: string) => void;
  onTagClick?: (tag: string) => void;
  selectedDocIds: string[];
  onToggleSelectDoc: (id: string) => void;
  onToggleSelectAll: () => void;
  onClearSelection?: () => void;
  onGenerateReportForSelected: () => void;
  onBatchDownload?: () => void;
  onBatchExportCsv?: () => void;
  onBatchDelete?: () => void;
}

type SortField = 'letterDate' | 'subject' | 'refNo' | 'fileSize' | 'category';
type SortOrder = 'asc' | 'desc';

export const DocumentTable: React.FC<DocumentTableProps> = ({
  docs,
  categories,
  onPreviewDoc,
  onDownloadDoc,
  onEditDoc,
  onCategoryClick,
  onAuthorityClick,
  onCopyRefNo,
  selectedDocIds,
  onToggleSelectDoc,
  onToggleSelectAll,
  onClearSelection,
  onGenerateReportForSelected,
  onBatchDownload,
  onBatchExportCsv,
  onBatchDelete,
}) => {
  const [sortField, setSortField] = useState<SortField>('letterDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedDescIds, setExpandedDescIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [docs.length, rowsPerPage]);

  const categoryMap = new Map<string, FolderCategory>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'subject' || field === 'category' ? 'asc' : 'desc');
    }
  };

  const toggleExpandDesc = (id: string) => {
    setExpandedDescIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyRef = (doc: DocItem) => {
    navigator.clipboard.writeText(doc.refNo);
    setCopiedId(doc.id);
    if (onCopyRefNo) onCopyRefNo(doc.refNo);
    setTimeout(() => {
      setCopiedId((prev) => (prev === doc.id ? null : prev));
    }, 1600);
  };

  const sortedDocs = [...docs].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'letterDate') {
      comparison = (a.letterDate || '').localeCompare(b.letterDate || '');
    } else if (sortField === 'subject') {
      comparison = (a.subject || '').localeCompare(b.subject || '');
    } else if (sortField === 'refNo') {
      comparison = (a.refNo || '').localeCompare(b.refNo || '');
    } else if (sortField === 'fileSize') {
      comparison = (a.fileSize || 0) - (b.fileSize || 0);
    } else if (sortField === 'category') {
      const catA = (categoryMap.get(a.category)?.name || a.category || '').toLowerCase();
      const catB = (categoryMap.get(b.category)?.name || b.category || '').toLowerCase();
      comparison = catA.localeCompare(catB);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const totalPages = rowsPerPage === 0 ? 1 : Math.max(1, Math.ceil(sortedDocs.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedDocs =
    rowsPerPage === 0
      ? sortedDocs
      : sortedDocs.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const allSelected = docs.length > 0 && selectedDocIds.length === docs.length;
  const selectedTotalBytes = docs
    .filter((d) => selectedDocIds.includes(d.id))
    .reduce((acc, d) => acc + (d.fileSize || 0), 0);

  // Fresh Aqua Gradient Category Badge Styling
  const getCategoryBadgeClass = (catId: string) => {
    switch (catId) {
      case 'circulars-notices':
        return 'bg-[#CFFAFE]/70 text-[#1F2937] border-[#06B6D4]/50 hover:bg-[#CFFAFE]';
      case 'executive-orders':
        return 'bg-[#BFDBFE]/60 text-[#1F2937] border-[#3B82F6]/50 hover:bg-[#BFDBFE]';
      case 'finance-budgets':
        return 'bg-[#D1FAE5]/70 text-[#1F2937] border-[#10B981]/50 hover:bg-[#D1FAE5]';
      case 'legal-contracts':
        return 'bg-sky-50 text-[#1F2937] border-sky-300 hover:bg-sky-100';
      case 'minutes-agendas':
        return 'bg-teal-50 text-[#1F2937] border-teal-300 hover:bg-teal-100';
      case 'technical-specs':
        return 'bg-cyan-50 text-[#1F2937] border-cyan-300 hover:bg-cyan-100';
      default:
        return 'bg-[#E5E7EB] text-[#1F2937] border-[#D1D5DB] hover:bg-[#D1D5DB]';
    }
  };

  // Fresh Aqua File Format Chip (First letter capital, other small letters)
  const getFormatBadge = (fileType: string) => {
    const t = fileType.toLowerCase();
    const label = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    if (t === 'pdf') {
      return (
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-50 text-[#EF4444] border border-[#EF4444]/30 shrink-0">
          {label}
        </span>
      );
    }
    if (t === 'xlsx' || t === 'csv') {
      return (
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#D1FAE5]/70 text-[#1F2937] border border-[#10B981]/40 shrink-0">
          {label}
        </span>
      );
    }
    if (t === 'docx' || t === 'doc') {
      return (
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#BFDBFE]/70 text-[#1F2937] border border-[#3B82F6]/40 shrink-0">
          Docx
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#CFFAFE]/70 text-[#1F2937] border border-[#06B6D4]/40 shrink-0">
        {label}
      </span>
    );
  };

  if (docs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#D1D5DB] p-16 text-center shadow-sm">
        <FileText className="w-10 h-10 text-[#6B7280] mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#1F2937]">No official records found</h3>
        <p className="text-sm text-[#6B7280] mt-1 max-w-sm mx-auto">
          Try adjusting your search query, date filter, or selecting a different corporate division from the dropdown above.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-[#D1D5DB] overflow-hidden shadow-sm">
      {/* Batch Selection Corporate Action Bar */}
      {selectedDocIds.length > 0 && (
        <div className="bg-gradient-to-r from-[#D1FAE5]/60 via-[#CFFAFE]/60 to-[#BFDBFE]/60 text-[#1F2937] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm animate-in fade-in border-b border-[#D1D5DB]">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              <strong className="text-[#3B82F6] font-extrabold tabular-nums">{selectedDocIds.length}</strong> record
              {selectedDocIds.length > 1 ? 's' : ''} selected
            </span>
            <span className="text-[#6B7280]">•</span>
            <span className="font-mono text-xs font-bold text-[#1F2937] tabular-nums">
              {formatBytes(selectedTotalBytes)}
            </span>
            {onClearSelection && (
              <button
                onClick={onClearSelection}
                className="inline-flex items-center gap-0.5 text-xs text-[#6B7280] hover:text-[#1F2937] ml-1 underline"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {onBatchDownload && (
              <button
                onClick={onBatchDownload}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#1F2937] font-bold transition-colors text-xs border border-[#D1D5DB]"
                title="Download all selected documents"
              >
                <Download className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Download ({selectedDocIds.length})</span>
              </button>
            )}
            {onBatchExportCsv && (
              <button
                onClick={onBatchExportCsv}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#1F2937] font-bold transition-colors text-xs border border-[#D1D5DB]"
                title="Export selected records to Excel / CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Export CSV</span>
              </button>
            )}
            <button
              onClick={onGenerateReportForSelected}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold transition-colors text-xs shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-white" />
              <span>PDF Report ({selectedDocIds.length})</span>
            </button>
            {onBatchDelete && (
              <button
                onClick={onBatchDelete}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-[#EF4444] font-bold transition-colors text-xs border border-[#EF4444]/30"
                title="Delete selected records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Structured Official Corporate Ledger Table (No horizontal slider needed) */}
      <div className="w-full overflow-hidden">
        <table className="w-full table-fixed text-left border-collapse">
          <thead>
            {/* Table Header Ribbon matching the Pdf badge theme (bg-red-50, text-[#EF4444], border-[#EF4444]/30) */}
            <tr className="bg-red-50 text-[#EF4444] text-xs sm:text-sm font-bold capitalize border-b border-[#EF4444]/30">
              {/* Checkbox column (Completely Center Aligned) */}
              <th className="py-2.5 px-0 w-12 text-center align-middle">
                <div className="flex items-center justify-center w-full">
                  <button
                    type="button"
                    onClick={onToggleSelectAll}
                    className="p-1 rounded text-[#EF4444] hover:text-red-700 transition-colors flex items-center justify-center"
                    title={allSelected ? 'Deselect all' : 'Select all'}
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#EF4444]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#EF4444]/70" />
                    )}
                  </button>
                </div>
              </th>

              {/* Merged Column: Ref No. & Date (Center Aligned, sorts by Letter Date by default) */}
              <th className="py-2.5 px-3.5 w-[19%] text-center">
                <button
                  onClick={() => handleSort('letterDate')}
                  className="inline-flex items-center justify-center gap-1.5 text-[#EF4444] hover:text-red-700 transition-colors font-bold capitalize truncate mx-auto"
                  title="Sort by Issuance Date (Default)"
                >
                  <span>Ref No. & Date</span>
                  <ArrowUpDown
                    className={`w-3.5 h-3.5 shrink-0 ${
                      sortField === 'letterDate' ? 'text-[#EF4444] opacity-100' : 'text-[#EF4444]/65 opacity-80'
                    }`}
                  />
                </button>
              </th>

              {/* Subject & Authority (Center Aligned) */}
              <th className="py-2.5 px-3.5 w-[31%] text-center">
                <button
                  onClick={() => handleSort('subject')}
                  className="inline-flex items-center justify-center gap-1.5 text-[#EF4444] hover:text-red-700 transition-colors font-bold capitalize truncate mx-auto"
                  title="Sort by Subject"
                >
                  <span>Subject & Authority</span>
                  <ArrowUpDown
                    className={`w-3.5 h-3.5 shrink-0 ${
                      sortField === 'subject' ? 'text-[#EF4444] opacity-100' : 'text-[#EF4444]/65 opacity-80'
                    }`}
                  />
                </button>
              </th>

              {/* Category (Center Aligned, Sortable) */}
              <th className="py-2.5 px-3.5 w-[16%] text-center">
                <button
                  onClick={() => handleSort('category')}
                  className="inline-flex items-center justify-center gap-1.5 text-[#EF4444] hover:text-red-700 transition-colors font-bold capitalize truncate mx-auto"
                  title="Sort by Category"
                >
                  <span>Category</span>
                  <ArrowUpDown
                    className={`w-3.5 h-3.5 shrink-0 ${
                      sortField === 'category' ? 'text-[#EF4444] opacity-100' : 'text-[#EF4444]/65 opacity-80'
                    }`}
                  />
                </button>
              </th>

              {/* Description (Center Aligned) */}
              <th className="py-2.5 px-3.5 w-[22%] text-center font-bold text-[#EF4444] capitalize">Description</th>

              {/* Merged Column: Size & Actions (Center Aligned, sorts by File Size) */}
              <th className="py-2.5 px-3 w-[12%] text-center">
                <button
                  onClick={() => handleSort('fileSize')}
                  className="inline-flex items-center justify-center gap-1.5 text-[#EF4444] hover:text-red-700 transition-colors mx-auto font-bold capitalize truncate"
                  title="Sort by File Size"
                >
                  <span>Size & Actions</span>
                  <ArrowUpDown
                    className={`w-3.5 h-3.5 shrink-0 ${
                      sortField === 'fileSize' ? 'text-[#EF4444] opacity-100' : 'text-[#EF4444]/65 opacity-80'
                    }`}
                  />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D1D5DB]/70 text-sm">
            {paginatedDocs.map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              const cat = categoryMap.get(doc.category);
              const isDescExpanded = expandedDescIds.has(doc.id);
              const categoryName = cat ? cat.name : doc.category;
              const isRefCopied = copiedId === doc.id;

              return (
                <tr
                  key={doc.id}
                  className={`group transition-colors border-b border-[#D1D5DB]/60 ${
                    isSelected
                      ? 'bg-[#BFDBFE]/35'
                      : 'bg-white hover:bg-[#E5E7EB]/55'
                  }`}
                >
                  {/* Checkbox (Completely Center Aligned) */}
                  <td className="py-3.5 px-0 align-middle text-center">
                    <div className="flex items-center justify-center w-full">
                      <button
                        type="button"
                        onClick={() => onToggleSelectDoc(doc.id)}
                        className="p-1 rounded text-[#6B7280] hover:text-[#3B82F6] transition-colors flex items-center justify-center"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#3B82F6]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#D1D5DB]" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Merged Cell: Letter Ref No & Date (Left-Center Aligned) */}
                  <td className="py-3.5 px-3.5 align-middle text-left">
                    {/* Format Badge before Letter Date (Left Aligned) */}
                    <div className="flex items-center justify-start gap-2 flex-wrap">
                      {getFormatBadge(doc.fileType)}
                      <span className="font-bold text-[#1F2937] text-xs sm:text-sm tabular-nums truncate">
                        {formatLetterDate(doc.letterDate)}
                      </span>
                    </div>

                    {/* Letter Ref No Badge (Left Aligned, 1-Click Copyable Aqua Box with Left-Aligned Text) */}
                    <div className="mt-1.5 flex items-center justify-start w-full">
                      <button
                        type="button"
                        onClick={() => handleCopyRef(doc)}
                        title={`Click to copy Reference No: ${doc.refNo}`}
                        className="max-w-full inline-flex items-center justify-start gap-1 text-left font-mono tabular-nums text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#CFFAFE]/65 text-[#1F2937] border border-[#06B6D4]/50 truncate shadow-2xs cursor-pointer hover:bg-[#CFFAFE] transition-colors"
                      >
                        <span className="truncate text-left">{doc.refNo}</span>
                        {isRefCopied && <Check className="w-3 h-3 text-[#10B981] shrink-0" />}
                      </button>
                    </div>
                  </td>

                  {/* Subject & Authority (Shows full text on hover via title) */}
                  <td className="py-3.5 px-3.5 align-top">
                    <button
                      onClick={() => onPreviewDoc(doc)}
                      title={doc.subject}
                      className="font-bold text-[#1F2937] hover:text-[#3B82F6] transition-colors text-left text-sm sm:text-base leading-snug line-clamp-2 break-words block"
                    >
                      {doc.subject}
                    </button>

                    {doc.senderDept && (
                      <button
                        type="button"
                        onClick={() => onAuthorityClick && onAuthorityClick(doc.senderDept!)}
                        title={`Filter by Issuing Authority: ${doc.senderDept}`}
                        className="text-xs text-[#6B7280] mt-1.5 font-medium truncate cursor-pointer flex items-center gap-1.5 hover:text-[#3B82F6] max-w-full text-left"
                      >
                        <span className="px-1.5 py-0.5 rounded bg-[#E5E7EB] text-[#1F2937] border border-[#D1D5DB] font-bold capitalize text-[10px] shrink-0">
                          Authority
                        </span>
                        <span className="text-[#6B7280] hover:text-[#3B82F6] font-semibold truncate">
                          {doc.senderDept}
                        </span>
                      </button>
                    )}
                  </td>

                  {/* Category Pill (Box centered in cell, text inside left-aligned) */}
                  <td className="py-3.5 px-3.5 align-middle text-center">
                    <div className="flex items-center justify-center w-full">
                      <button
                        onClick={() => onCategoryClick(doc.category)}
                        title={categoryName}
                        className={`min-w-[130px] max-w-full inline-flex items-center justify-start text-left px-3 py-1 rounded-lg text-xs font-bold border transition-colors truncate shadow-2xs ${getCategoryBadgeClass(
                          doc.category
                        )}`}
                      >
                        <span className="truncate text-left">{categoryName}</span>
                      </button>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-3.5 align-top">
                    <p
                      className={`text-xs sm:text-sm text-[#6B7280] leading-relaxed break-words font-normal ${
                        isDescExpanded ? '' : 'line-clamp-2'
                      }`}
                    >
                      {doc.description || 'No description provided.'}
                    </p>
                    {doc.description && doc.description.length > 95 && (
                      <button
                        onClick={() => toggleExpandDesc(doc.id)}
                        className="inline-flex items-center gap-0.5 text-xs text-[#3B82F6] hover:text-[#2563EB] mt-1 font-bold"
                      >
                        <span>{isDescExpanded ? 'Show less' : 'Read more'}</span>
                        {isDescExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </td>

                  {/* Merged Cell: Size & Action buttons (Center Aligned) */}
                  <td className="py-3.5 px-3 align-top text-center">
                    {/* File Size */}
                    <div className="mb-1.5 text-center">
                      <span className="inline-block font-mono tabular-nums text-xs font-bold text-[#1F2937] bg-[#E5E7EB]/70 border border-[#D1D5DB] px-2 py-0.5 rounded truncate">
                        {formatBytes(doc.fileSize)}
                      </span>
                    </div>

                    {/* Action Buttons (Secondary View, Primary Blue Download & Secondary Edit) */}
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onPreviewDoc(doc)}
                        className="p-1.5 rounded-lg text-[#1F2937] bg-[#E5E7EB] hover:bg-[#D1D5DB] border border-[#D1D5DB] transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40"
                        title="Inline PDF / Document Viewer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#1F2937]" />
                      </button>
                      <button
                        onClick={() => onDownloadDoc(doc)}
                        className="p-1.5 rounded-lg text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-all shadow-2xs font-bold focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40"
                        title="Direct Corporate Download (No Login Required)"
                      >
                        <Download className="w-3.5 h-3.5 text-white" />
                      </button>
                      {onEditDoc && (
                        <button
                          onClick={() => onEditDoc(doc)}
                          className="p-1.5 rounded-lg text-[#1F2937] bg-[#E5E7EB] hover:bg-[#D1D5DB] border border-[#D1D5DB] transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40"
                          title="Edit Record Metadata"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Compact Table Productivity & Pagination Bar */}
      <div className="px-4 py-2 bg-white border-t border-[#D1D5DB] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7280]">
        <div className="flex items-center gap-2">
          <span>
            Showing{' '}
            <strong className="text-[#1F2937] tabular-nums">
              {rowsPerPage === 0 ? 1 : (safePage - 1) * rowsPerPage + 1}
            </strong>
            –
            <strong className="text-[#1F2937] tabular-nums">
              {rowsPerPage === 0 ? sortedDocs.length : Math.min(safePage * rowsPerPage, sortedDocs.length)}
            </strong>{' '}
            of <strong className="text-[#1F2937] tabular-nums">{sortedDocs.length}</strong> records
          </span>
          <span className="text-[#D1D5DB] hidden sm:inline">•</span>
          <span className="text-[#6B7280] hidden sm:inline">Click any Ref No. to copy or Authority to filter</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[#6B7280]">Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-white border border-[#D1D5DB] rounded px-1.5 py-0.5 text-xs font-semibold text-[#1F2937] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={0}>All</option>
            </select>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded border border-[#D1D5DB] bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#1F2937] disabled:opacity-40"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-semibold text-[#1F2937] tabular-nums">
                {safePage} / {totalPages}
              </span>
              <button
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded border border-[#D1D5DB] bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#1F2937] disabled:opacity-40"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
