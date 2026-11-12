import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Share2, 
  Check, 
  FileText, 
  ShieldCheck, 
  Tag,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Pencil,
  Trash2,
  Copy
} from 'lucide-react';
import { DocItem, FolderCategory } from '../types';
import { 
  formatBytes, 
  formatLetterDate, 
  generateSingleDocumentPdfBlobUrl 
} from '../services/pdfReportService';

interface DocumentPreviewModalProps {
  doc: DocItem | null;
  category: FolderCategory | null;
  onClose: () => void;
  onDownload: (doc: DocItem) => void;
  onEditDoc?: (doc: DocItem) => void;
  onDeleteDoc?: (doc: DocItem) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  doc,
  category,
  onClose,
  onDownload,
  onEditDoc,
  onDeleteDoc,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);
  const [activeTab, setActiveTab] = useState<'viewer' | 'letterhead'>('viewer');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState<number>(100);

  const isImageFile = doc
    ? ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes((doc.fileType || '').toLowerCase())
    : false;

  useEffect(() => {
    if (!doc) {
      setPdfBlobUrl(null);
      return;
    }

    setImageZoom(100);
    setActiveTab('viewer');

    if (isImageFile) {
      setPdfBlobUrl(null);
      return;
    }

    if (doc.downloadUrl && doc.downloadUrl.startsWith('blob:') && doc.fileType.toLowerCase() === 'pdf') {
      setPdfBlobUrl(doc.downloadUrl);
      return;
    }

    const catName = category ? category.name : doc.category;
    const generatedUrl = generateSingleDocumentPdfBlobUrl(doc, catName);
    setPdfBlobUrl(generatedUrl);

    return () => {
      if (generatedUrl) {
        URL.revokeObjectURL(generatedUrl);
      }
    };
  }, [doc, category, isImageFile]);

  if (!doc) return null;

  const handleCopyLink = () => {
    const url = doc.downloadUrl || window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(doc.refNo);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCopySha = () => {
    if (doc.sha256) {
      navigator.clipboard.writeText(doc.sha256);
      setCopiedSha(true);
      setTimeout(() => setCopiedSha(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1F2937]/45 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-[#D1D5DB] w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Top Modal Header Bar */}
        <div className="px-5 py-3 border-b border-[#D1D5DB] flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-[#D1FAE5]/75 via-[#CFFAFE]/75 to-[#BFDBFE]/75">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyRef}
              title="Click to copy Reference No."
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-white hover:bg-[#E5E7EB] text-[#1F2937] border border-[#D1D5DB] tabular-nums transition-colors"
            >
              <span>{doc.refNo}</span>
              {copiedRef ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3 h-3 text-[#6B7280]" />}
            </button>
            <span className="text-xs text-[#6B7280] hidden md:inline">
              Division: <strong className="text-[#1F2937]">{category ? category.name : doc.category}</strong>
            </span>

            {/* Inline Viewer vs Letterhead Switcher */}
            <div className="flex items-center bg-white/90 p-0.5 rounded-lg border border-[#D1D5DB] ml-1">
              <button
                onClick={() => setActiveTab('viewer')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'viewer'
                    ? 'bg-[#3B82F6] text-white shadow-2xs'
                    : 'text-[#1F2937] hover:bg-[#E5E7EB]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isImageFile ? 'Inline Image Viewer' : 'Inline PDF Viewer'}</span>
              </button>
              <button
                onClick={() => setActiveTab('letterhead')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'letterhead'
                    ? 'bg-[#3B82F6] text-white shadow-2xs'
                    : 'text-[#1F2937] hover:bg-[#E5E7EB]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Official Transcript</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onEditDoc && (
              <button
                onClick={() => {
                  onClose();
                  onEditDoc(doc);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#1F2937] bg-[#E5E7EB] hover:bg-[#D1D5DB] border border-[#D1D5DB] transition-colors"
                title="Edit Record Metadata"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
            {onDeleteDoc && (
              <button
                onClick={() => {
                  onClose();
                  onDeleteDoc(doc);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#EF4444] bg-red-50 hover:bg-red-100 border border-[#EF4444]/30 transition-colors"
                title="Delete Record"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg text-[#1F2937] hover:bg-[#E5E7EB] transition-colors"
              title="Copy Public Download URL"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[#10B981]" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-[#1F2937] hover:bg-[#E5E7EB] transition-colors"
              title="Print Corporate Memorandum"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1F2937] hover:bg-[#E5E7EB] transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Modal Content Area */}
        {activeTab === 'viewer' ? (
          <div className="flex-1 bg-[#E5E7EB]/50 flex flex-col min-h-[62vh] overflow-hidden">
            {isImageFile ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Image Zoom Toolbar */}
                <div className="bg-white border-b border-[#D1D5DB] px-4 py-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1F2937] truncate">{doc.fileName}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setImageZoom((z) => Math.max(50, z - 25))}
                      className="p-1 rounded bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#1F2937]"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="font-mono font-bold w-12 text-center text-[#1F2937]">{imageZoom}%</span>
                    <button
                      onClick={() => setImageZoom((z) => Math.min(250, z + 25))}
                      className="p-1 rounded bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#1F2937]"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setImageZoom(100)}
                      className="p-1 rounded bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#1F2937]"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-white">
                  {doc.downloadUrl ? (
                    <img
                      src={doc.downloadUrl}
                      alt={doc.subject}
                      style={{ width: `${imageZoom}%`, maxWidth: 'none' }}
                      className="rounded-lg shadow-sm border border-[#D1D5DB] transition-all"
                    />
                  ) : (
                    <div className="text-center text-[#6B7280] text-sm">
                      Image preview unavailable. Click Download below to view file.
                    </div>
                  )}
                </div>
              </div>
            ) : pdfBlobUrl ? (
              <iframe
                src={pdfBlobUrl}
                title={`PDF Preview - ${doc.subject}`}
                className="w-full flex-1 min-h-[62vh] border-0"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-12 text-[#6B7280] text-sm">
                Preparing inline document preview...
              </div>
            )}
          </div>
        ) : (
          /* Official Letterhead & Verification View */
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 bg-white">
            {/* Official Corporate Letterhead Frame */}
            <div className="bg-white rounded-xl border border-[#D1D5DB] p-5 sm:p-7 shadow-2xs">
              {/* Header info */}
              <div className="border-b border-[#D1D5DB] pb-4 mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] uppercase font-extrabold tracking-wider text-[#3B82F6] block mb-1">
                    Official Corporate Record & Disclosure
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-[#1F2937] tracking-tight">
                    {doc.senderDept || 'Corporate Secretariat & Governance Division'}
                  </h2>
                  {doc.recipient && (
                    <p className="text-xs text-[#6B7280] mt-1">
                      Distribution: <span className="font-medium text-[#1F2937]">{doc.recipient}</span>
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right font-mono text-xs text-[#6B7280] shrink-0 tabular-nums">
                  <span className="font-bold text-[#3B82F6] block text-sm">{doc.refNo}</span>
                  <span>{formatLetterDate(doc.letterDate)}</span>
                </div>
              </div>

              {/* Subject */}
              <div className="mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
                  Subject
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#1F2937] leading-snug">
                  {doc.subject}
                </h3>
              </div>

              {/* Description Summary */}
              <div className="mb-5 p-3.5 rounded-lg bg-[#CFFAFE]/40 border border-[#06B6D4]/40 text-[#1F2937] text-xs sm:text-sm leading-relaxed">
                <strong className="text-[#3B82F6] font-bold block mb-0.5">Executive Summary:</strong>
                {doc.description}
              </div>

              {/* Document Body / Preview text */}
              {doc.contentPreview ? (
                <div className="prose max-w-none text-xs sm:text-sm text-[#1F2937] leading-relaxed space-y-3 whitespace-pre-wrap font-sans border-t border-[#D1D5DB] pt-4">
                  {doc.contentPreview}
                </div>
              ) : (
                <div className="border border-dashed border-[#D1D5DB] rounded-xl p-6 text-center text-[#6B7280] text-xs">
                  <FileText className="w-7 h-7 text-[#6B7280] mx-auto mb-1.5" />
                  <p className="font-semibold text-[#1F2937]">Digital Corporate Archive File</p>
                  <p className="mt-1">
                    Switch to the <strong className="text-[#3B82F6]">Inline PDF Viewer</strong> tab above or download in{' '}
                    <strong className="text-[#1F2937] uppercase">.{doc.fileType}</strong> format.
                  </p>
                </div>
              )}

              {/* Tags */}
              {doc.tags && doc.tags.length > 0 && (
                <div className="mt-5 pt-4 border-t border-[#D1D5DB] flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#6B7280] flex items-center gap-1 mr-1">
                    <Tag className="w-3 h-3" /> Classifications:
                  </span>
                  {doc.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-[#E5E7EB] text-[#1F2937] border border-[#D1D5DB]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Verification & Integrity Box */}
            <div className="bg-white rounded-xl border border-[#D1D5DB] p-4 shadow-2xs text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#1F2937]">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Corporate Compliance & Cryptographic Verification</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#6B7280] pt-1">
                <div>
                  <span className="text-[#6B7280] block text-[10px] uppercase">File Name & Size</span>
                  <span className="font-mono text-[#1F2937] tabular-nums">{doc.fileName} ({formatBytes(doc.fileSize)})</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[10px] uppercase">Distribution Endpoint</span>
                  <span className="text-[#1F2937] truncate block">
                    {doc.source === 'github' ? 'GitHub Raw Content Repository' : 'Corporate Repository Server'}
                  </span>
                </div>
              </div>

              {doc.sha256 && (
                <div className="pt-2 border-t border-[#D1D5DB] flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[#6B7280] block text-[10px] uppercase">SHA-256 Checksum</span>
                    <span className="font-mono text-[11px] text-[#6B7280] truncate block">
                      {doc.sha256}
                    </span>
                  </div>
                  <button
                    onClick={handleCopySha}
                    className="px-2.5 py-1 rounded text-[11px] font-semibold text-[#1F2937] bg-[#E5E7EB] hover:bg-[#D1D5DB] border border-[#D1D5DB] shrink-0"
                  >
                    {copiedSha ? 'Copied!' : 'Copy Hash'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#D1D5DB] bg-white flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-[#6B7280] truncate max-w-md">
            <strong className="text-[#1F2937]">{doc.subject}</strong> • {formatLetterDate(doc.letterDate)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#1F2937] bg-[#E5E7EB] hover:bg-[#D1D5DB] border border-[#D1D5DB] transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onDownload(doc)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-2xs transition-all flex items-center gap-1.5 tabular-nums"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Download ({formatBytes(doc.fileSize)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
