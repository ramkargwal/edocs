import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle, 
  RefreshCw,
  Folder,
  Layers
} from 'lucide-react';
import { DocItem, FolderCategory, PdfReportOptions } from '../types';
import { 
  downloadFolderPdfReport, 
  generatePdfPreviewBlobUrl 
} from '../services/pdfReportService';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCategory: FolderCategory | null;
  categories: FolderCategory[];
  allDocs: DocItem[];
  filteredDocs: DocItem[];
  selectedDocIds: string[];
}

export const PdfReportModal: React.FC<PdfReportModalProps> = ({
  isOpen,
  onClose,
  currentCategory,
  categories,
  allDocs,
  filteredDocs,
  selectedDocIds,
}) => {
  const [scope, setScope] = useState<'current' | 'selected' | 'all'>('current');
  const [reportTitle, setReportTitle] = useState('');
  const [organization, setOrganization] = useState('Public Records & Archives Directorate');
  const [includeStats, setIncludeStats] = useState(true);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (selectedDocIds.length > 0) {
        setScope('selected');
        setReportTitle(`Executive Summary - ${selectedDocIds.length} Selected Documents`);
      } else if (currentCategory) {
        setScope('current');
        setReportTitle(`Folder Catalog: ${currentCategory.name}`);
      } else {
        setScope('all');
        setReportTitle('Consolidated Public Documents Catalog');
      }
    }
  }, [isOpen, currentCategory, selectedDocIds.length]);

  const targetDocs = useMemo(() => {
    if (scope === 'selected' && selectedDocIds.length > 0) {
      const idSet = new Set(selectedDocIds);
      return allDocs.filter((d) => idSet.has(d.id));
    }
    if (scope === 'current') {
      return filteredDocs;
    }
    return allDocs;
  }, [scope, selectedDocIds, allDocs, filteredDocs]);

  const folderName = useMemo(() => {
    if (scope === 'selected') return `Selected (${targetDocs.length} items)`;
    if (scope === 'current' && currentCategory) return currentCategory.name;
    return 'Entire Public Repository';
  }, [scope, currentCategory, targetDocs.length]);

  useEffect(() => {
    if (!isOpen || targetDocs.length === 0) return;

    let active = true;
    setIsGenerating(true);

    try {
      const options: PdfReportOptions = {
        title: reportTitle || 'Documents Catalog Report',
        organization: organization || 'DocuHub Repository',
        folderName,
        includeStats,
        includeDescription: true,
        includeRefNo: true,
        includeLetterDate: true,
      };

      const url = generatePdfPreviewBlobUrl(targetDocs, categories, options);
      if (active) {
        setPreviewBlobUrl(url);
        setIsGenerating(false);
      }
    } catch (err) {
      console.error('Failed to generate PDF preview:', err);
      setIsGenerating(false);
    }

    return () => {
      active = false;
    };
  }, [isOpen, targetDocs, categories, reportTitle, organization, folderName, includeStats]);

  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const options: PdfReportOptions = {
      title: reportTitle || 'Documents Catalog Report',
      organization: organization || 'DocuHub Repository',
      folderName,
      includeStats,
      includeDescription: true,
      includeRefNo: true,
      includeLetterDate: true,
    };
    downloadFolderPdfReport(targetDocs, categories, options);
  };

  const handlePrint = () => {
    const iframe = document.getElementById('pdf-preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1F2937]/45 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-[#D1D5DB] w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D1D5DB] flex items-center justify-between bg-gradient-to-r from-[#D1FAE5]/75 via-[#CFFAFE]/75 to-[#BFDBFE]/75">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-white flex items-center justify-center shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#1F2937] leading-tight">
                Corporate PDF Catalog & Executive Report Generator
              </h2>
              <p className="text-xs text-[#6B7280]">
                Generate an official, structured PDF disclosure ledger with issuance dates, reference numbers & summaries
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

        {/* Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Controls Panel */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#D1D5DB] p-5 overflow-y-auto space-y-4 bg-white shrink-0">
            <div>
              <label className="block text-xs font-bold text-[#1F2937] uppercase tracking-wider mb-2">
                Report Scope
              </label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setScope('current')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left border transition-all ${
                    scope === 'current'
                      ? 'bg-[#BFDBFE]/60 border-[#3B82F6] text-[#1F2937] shadow-2xs'
                      : 'border-[#D1D5DB] hover:bg-[#E5E7EB]/60 text-[#1F2937]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>Current Division View</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-white text-[11px] font-mono border border-[#D1D5DB] tabular-nums">
                    {filteredDocs.length}
                  </span>
                </button>

                {selectedDocIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setScope('selected')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left border transition-all ${
                      scope === 'selected'
                        ? 'bg-[#BFDBFE]/60 border-[#3B82F6] text-[#1F2937] shadow-2xs'
                        : 'border-[#D1D5DB] hover:bg-[#E5E7EB]/60 text-[#1F2937]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Selected Records</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-white text-[11px] font-mono text-[#3B82F6] border border-[#3B82F6]/40 tabular-nums">
                      {selectedDocIds.length}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left border transition-all ${
                    scope === 'all'
                      ? 'bg-[#BFDBFE]/60 border-[#3B82F6] text-[#1F2937] shadow-2xs'
                      : 'border-[#D1D5DB] hover:bg-[#E5E7EB]/60 text-[#1F2937]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#06B6D4]" />
                    <span>Entire Corporate Repository</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-white text-[11px] font-mono border border-[#D1D5DB] tabular-nums">
                    {allDocs.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g. Official Corporate Disclosure Catalog"
                className="w-full px-3 py-2 text-xs border border-[#D1D5DB] rounded-lg bg-white text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
              />
            </div>

            {/* Organization */}
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1">
                Company / Division Name
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Corporate Secretariat Division"
                className="w-full px-3 py-2 text-xs border border-[#D1D5DB] rounded-lg bg-white text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
              />
            </div>

            {/* Options Checkboxes */}
            <div className="pt-2 border-t border-[#D1D5DB] space-y-2">
              <label className="flex items-center gap-2 text-xs text-[#1F2937] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeStats}
                  onChange={(e) => setIncludeStats(e.target.checked)}
                  className="rounded border-[#D1D5DB] accent-[#3B82F6]"
                />
                <span className="font-medium">Include Executive Summary Banner</span>
              </label>
            </div>

            {/* Info note */}
            <div className="p-3 rounded-xl bg-[#CFFAFE]/35 border border-[#06B6D4]/40 text-[11px] text-[#6B7280] leading-relaxed">
              <span className="font-bold text-[#1F2937]">Vector PDF Formatting:</span> Table columns automatically align with issuance dates, reference IDs, issuing authorities, and wrapped executive summaries.
            </div>
          </div>

          {/* Live Preview Area */}
          <div className="flex-1 bg-[#E5E7EB] flex flex-col relative overflow-hidden">
            {isGenerating && (
              <div className="absolute inset-0 z-10 bg-white/75 backdrop-blur-xs flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#3B82F6]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Formatting Executive PDF Report...</span>
                </div>
              </div>
            )}

            {previewBlobUrl ? (
              <iframe
                id="pdf-preview-iframe"
                src={previewBlobUrl}
                className="w-full h-full border-none"
                title="PDF Report Live Preview"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#6B7280] text-xs">
                No documents selected for report.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#D1D5DB] bg-white flex items-center justify-between">
          <div className="text-xs text-[#6B7280] tabular-nums">
            Total records in report: <strong className="text-[#1F2937]">{targetDocs.length}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={targetDocs.length === 0}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#1F2937] bg-[#E5E7EB] hover:bg-[#D1D5DB] border border-[#D1D5DB] transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5 text-[#1F2937]" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={targetDocs.length === 0}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-2xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download PDF Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
