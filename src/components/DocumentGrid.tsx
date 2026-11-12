import React from 'react';
import { 
  Download, 
  Eye, 
  CheckSquare, 
  Square,
  Calendar
} from 'lucide-react';
import { DocItem, FolderCategory } from '../types';
import { formatBytes, formatLetterDate } from '../services/pdfReportService';

interface DocumentGridProps {
  docs: DocItem[];
  categories: FolderCategory[];
  onPreviewDoc: (doc: DocItem) => void;
  onDownloadDoc: (doc: DocItem) => void;
  onTagClick: (tag: string) => void;
  selectedDocIds: string[];
  onToggleSelectDoc: (id: string) => void;
}

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  docs,
  categories,
  onPreviewDoc,
  onDownloadDoc,
  selectedDocIds,
  onToggleSelectDoc,
}) => {
  const categoryMap = new Map<string, FolderCategory>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  const getCategoryBadgeClass = (catId: string) => {
    switch (catId) {
      case 'circulars-notices':
        return 'bg-[#CFFAFE]/70 text-[#1F2937] border-[#06B6D4]/50';
      case 'executive-orders':
        return 'bg-[#BFDBFE]/60 text-[#1F2937] border-[#3B82F6]/50';
      case 'finance-budgets':
        return 'bg-[#D1FAE5]/70 text-[#1F2937] border-[#10B981]/50';
      case 'legal-contracts':
        return 'bg-sky-50 text-[#1F2937] border-sky-300';
      case 'minutes-agendas':
        return 'bg-teal-50 text-[#1F2937] border-teal-300';
      case 'technical-specs':
        return 'bg-cyan-50 text-[#1F2937] border-cyan-300';
      default:
        return 'bg-[#E5E7EB] text-[#1F2937] border-[#D1D5DB]';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {docs.map((doc) => {
        const isSelected = selectedDocIds.includes(doc.id);
        const cat = categoryMap.get(doc.category);

        return (
          <div
            key={doc.id}
            className={`bg-white rounded-xl border transition-all p-5 flex flex-col justify-between shadow-sm ${
              isSelected
                ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/25'
                : 'border-[#D1D5DB] hover:border-[#3B82F6]/60 hover:shadow-md'
            }`}
          >
            <div>
              {/* Top row */}
              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-1.5 font-mono text-[#1F2937] font-bold">
                  <button
                    type="button"
                    onClick={() => onToggleSelectDoc(doc.id)}
                    className="text-[#6B7280] hover:text-[#3B82F6]"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#3B82F6]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#D1D5DB]" />
                    )}
                  </button>
                  <span className="px-2.5 py-0.5 rounded bg-[#CFFAFE]/70 text-[#1F2937] border border-[#06B6D4]/50 font-mono text-xs font-bold tabular-nums">
                    {doc.refNo}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-bold text-[#1F2937] text-xs tabular-nums">
                  <Calendar className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>{formatLetterDate(doc.letterDate)}</span>
                </div>
              </div>

              {/* Subject */}
              <h3
                onClick={() => onPreviewDoc(doc)}
                className="font-bold text-[#1F2937] hover:text-[#3B82F6] transition-colors cursor-pointer text-sm sm:text-base leading-snug line-clamp-2 mb-2"
              >
                {doc.subject}
              </h3>

              {cat && (
                <div className="mb-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold border ${getCategoryBadgeClass(
                      doc.category
                    )}`}
                  >
                    {cat.name}
                  </span>
                </div>
              )}

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#6B7280] line-clamp-3 leading-relaxed mb-4">
                {doc.description || 'No description provided.'}
              </p>
            </div>

            {/* Bottom Row */}
            <div className="pt-3 border-t border-[#D1D5DB] flex items-center justify-between text-xs sm:text-sm">
              <span className="font-mono text-xs font-bold text-[#1F2937] bg-[#E5E7EB]/70 px-2 py-0.5 rounded border border-[#D1D5DB] uppercase tabular-nums">
                {doc.fileType} • {formatBytes(doc.fileSize)}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onPreviewDoc(doc)}
                  className="p-1.5 rounded-lg text-[#1F2937] bg-[#E5E7EB] hover:bg-[#D1D5DB] border border-[#D1D5DB] transition-colors shadow-2xs"
                  title="View Official Record"
                >
                  <Eye className="w-4 h-4 text-[#1F2937]" />
                </button>
                <button
                  onClick={() => onDownloadDoc(doc)}
                  className="p-1.5 rounded-lg text-[#1F2937] bg-[#BFDBFE]/70 hover:bg-[#BFDBFE] border border-[#3B82F6]/50 transition-all shadow-2xs font-bold"
                  title="Direct Corporate Download"
                >
                  <Download className="w-4 h-4 text-[#2563EB]" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
