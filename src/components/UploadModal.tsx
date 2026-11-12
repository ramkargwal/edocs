import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Calendar, 
  Hash, 
  Folder, 
  Tag, 
  Building, 
  FileCheck,
  Pencil,
  Github,
  RefreshCw,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { DocItem, FolderCategory, DocumentStatus, GitHubRepoConfig } from '../types';
import { 
  parseFileNameMetadata, 
  blobToBase64, 
  uploadFileToGitHubRepo 
} from '../services/githubService';
import { buildSingleDocumentPdf } from '../services/pdfReportService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: FolderCategory[];
  activeCategoryId: string;
  onAddDocument: (doc: DocItem, pushedToGitHub?: boolean) => void;
  onUpdateDocument?: (doc: DocItem, pushedToGitHub?: boolean) => void;
  editingDoc?: DocItem | null;
  onOpenNewCategoryModal: () => void;
  gitHubConfig: GitHubRepoConfig;
  onUpdateGitHubConfig: (cfg: GitHubRepoConfig) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  categories,
  activeCategoryId,
  onAddDocument,
  onUpdateDocument,
  editingDoc,
  onOpenNewCategoryModal,
  gitHubConfig,
  onUpdateGitHubConfig,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [refNo, setRefNo] = useState('');
  const [letterDate, setLetterDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(activeCategoryId !== 'all' ? activeCategoryId : categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [senderDept, setSenderDept] = useState('');
  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState<DocumentStatus>('Official');
  const [contentPreview, setContentPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Two-Way GitHub Push state
  const [pushToGitHub, setPushToGitHub] = useState<boolean>(false);
  const [inlineToken, setInlineToken] = useState<string>('');
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [pushError, setPushError] = useState<string | null>(null);

  useEffect(() => {
    setInlineToken(gitHubConfig.personalAccessToken || '');
    setPushToGitHub(Boolean(gitHubConfig.personalAccessToken));
    setPushError(null);
    setIsPushing(false);

    if (editingDoc) {
      setUploadedFile(null);
      setRefNo(editingDoc.refNo || '');
      setLetterDate(editingDoc.letterDate || new Date().toISOString().split('T')[0]);
      setSubject(editingDoc.subject || '');
      setCategory(editingDoc.category || categories[0]?.id || '');
      setDescription(editingDoc.description || '');
      setTagsInput(editingDoc.tags ? editingDoc.tags.join(', ') : '');
      setSenderDept(editingDoc.senderDept || '');
      setRecipient(editingDoc.recipient || '');
      setStatus(editingDoc.status || 'Official');
      setContentPreview(editingDoc.contentPreview || '');
    } else {
      setUploadedFile(null);
      setRefNo('');
      setLetterDate(new Date().toISOString().split('T')[0]);
      setSubject('');
      setCategory(activeCategoryId !== 'all' ? activeCategoryId : categories[0]?.id || '');
      setDescription('');
      setTagsInput('');
      setSenderDept('');
      setRecipient('');
      setStatus('Official');
      setContentPreview('');
    }
  }, [editingDoc, isOpen, activeCategoryId, categories, gitHubConfig.personalAccessToken]);

  if (!isOpen) return null;

  const handleFileSelected = (file: File) => {
    setUploadedFile(file);
    const parsed = parseFileNameMetadata(file.name);

    if (!subject) {
      setSubject(parsed.subject || file.name.replace(/\.[^/.]+$/, ''));
    }
    if (!refNo) {
      setRefNo(parsed.refNo || `DOC/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`);
    }
    if (parsed.letterDate) {
      setLetterDate(parsed.letterDate);
    }
    if (!description) {
      setDescription(`Official document file "${file.name}" uploaded to repository. Available for public verification and download.`);
    }
    if (!tagsInput && parsed.tags) {
      setTagsInput(parsed.tags.join(', '));
    }

    if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setContentPreview(e.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPushError(null);

    if (!subject.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const ext = uploadedFile
      ? uploadedFile.name.split('.').pop()?.toLowerCase() || 'pdf'
      : editingDoc
      ? editingDoc.fileType
      : 'pdf';

    const cleanSafeSubj = subject
      .trim()
      .slice(0, 35)
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const cleanSafeRef = (refNo.trim() || 'DOC').replace(/[^a-zA-Z0-9-]+/g, '-');

    const fileName = uploadedFile
      ? uploadedFile.name
      : editingDoc
      ? editingDoc.fileName
      : `${letterDate}_${cleanSafeRef}_${cleanSafeSubj}.${ext}`;

    const fileSize = uploadedFile
      ? uploadedFile.size
      : editingDoc
      ? editingDoc.fileSize
      : 1024 * (120 + Math.floor(Math.random() * 450));

    let downloadUrl = uploadedFile
      ? URL.createObjectURL(uploadedFile)
      : editingDoc
      ? editingDoc.downloadUrl
      : undefined;

    let docSource: 'github' | 'local' | 'demo' = editingDoc ? editingDoc.source : 'local';
    let docSha = editingDoc?.sha256 || Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const draftDoc: DocItem = {
      id: editingDoc ? editingDoc.id : `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      refNo: refNo.trim() || `DOC/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      letterDate: letterDate || new Date().toISOString().split('T')[0],
      subject: subject.trim(),
      category: category || categories[0]?.id || 'general',
      description: description.trim() || `Official document "${fileName}".`,
      tags: tags.length > 0 ? tags : ['General Archive'],
      fileName,
      fileSize,
      fileType: ext,
      downloadUrl,
      source: docSource,
      senderDept: senderDept.trim() || undefined,
      recipient: recipient.trim() || undefined,
      status,
      contentPreview: contentPreview || undefined,
      sha256: docSha,
      createdAt: editingDoc ? editingDoc.createdAt : new Date().toISOString(),
    };

    if (pushToGitHub) {
      const effectiveToken = inlineToken.trim() || gitHubConfig.personalAccessToken?.trim() || '';
      if (!effectiveToken) {
        setPushError('Please provide your GitHub Personal Access Token (with repo permission) to push directly to GitHub.');
        return;
      }

      setIsPushing(true);
      try {
        const updatedConfig: GitHubRepoConfig = {
          ...gitHubConfig,
          personalAccessToken: effectiveToken,
        };
        if (effectiveToken !== gitHubConfig.personalAccessToken) {
          onUpdateGitHubConfig(updatedConfig);
        }

        let base64FileContent = '';
        if (uploadedFile) {
          base64FileContent = await blobToBase64(uploadedFile);
        } else {
          const catName = categories.find((c) => c.id === draftDoc.category)?.name || draftDoc.category;
          const pdfDoc = buildSingleDocumentPdf(draftDoc, catName);
          const pdfBlob = pdfDoc.output('blob');
          base64FileContent = await blobToBase64(pdfBlob);
        }

        const baseFolder = (updatedConfig.folderPath || 'documents').replace(/^\/+|\/+$/g, '');
        const targetPath = baseFolder
          ? `${baseFolder}/${draftDoc.category}/${draftDoc.fileName}`
          : `${draftDoc.category}/${draftDoc.fileName}`;

        const uploadRes = await uploadFileToGitHubRepo({
          config: updatedConfig,
          targetPath,
          base64Content: base64FileContent,
          commitMessage: `feat(docs): publish ${draftDoc.refNo} - ${draftDoc.subject}`,
        });

        draftDoc.downloadUrl = uploadRes.downloadUrl;
        draftDoc.source = 'github';
        if (uploadRes.sha) {
          draftDoc.sha256 = uploadRes.sha;
        }
      } catch (err: any) {
        setIsPushing(false);
        setPushError(err.message || 'Failed to upload file to GitHub repository.');
        return;
      }
      setIsPushing(false);
    }

    if (editingDoc && onUpdateDocument) {
      onUpdateDocument(draftDoc, pushToGitHub);
    } else {
      onAddDocument(draftDoc, pushToGitHub);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1F2937]/45 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-[#D1D5DB] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D1D5DB] flex items-center justify-between bg-gradient-to-r from-[#D1FAE5]/75 via-[#CFFAFE]/75 to-[#BFDBFE]/75">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-white flex items-center justify-center shadow-xs">
              {editingDoc ? <Pencil className="w-4 h-4" /> : <UploadCloud className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#1F2937] leading-tight">
                {editingDoc ? 'Edit Official Corporate Record' : 'Publish & Register Official Corporate Record'}
              </h2>
              <p className="text-xs text-[#6B7280]">
                {editingDoc
                  ? `Updating metadata for ${editingDoc.refNo}`
                  : 'Register locally or commit directly to your GitHub repository'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Drag & Drop File Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#3B82F6] bg-[#BFDBFE]/30'
                : uploadedFile
                ? 'border-[#10B981] bg-[#D1FAE5]/40'
                : 'border-[#D1D5DB] hover:border-[#3B82F6] bg-white'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D1FAE5] text-[#10B981] flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#1F2937]">{uploadedFile.name}</p>
                  <p className="text-xs text-[#6B7280]">
                    {(uploadedFile.size / 1024).toFixed(1)} KB • Click to choose different file
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <UploadCloud className="w-7 h-7 text-[#3B82F6] mx-auto mb-1.5" />
                <p className="text-sm font-semibold text-[#1F2937]">
                  {editingDoc
                    ? `Current file: ${editingDoc.fileName} (Drop a new file to replace)`
                    : 'Drop your official document here, or browse'}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Supports PDF, DOCX, XLSX, CSV, Markdown, Text, and Images
                </p>
              </div>
            )}
          </div>

          {/* Direct Two-Way GitHub Commit Toggle Card */}
          <div className="p-3.5 rounded-xl bg-[#CFFAFE]/35 border border-[#06B6D4]/50 space-y-2.5">
            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#3B82F6] text-white flex items-center justify-center shrink-0">
                  <Github className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-[#1F2937] block">
                    Direct GitHub Upload & Commit (Two-Way Sync)
                  </span>
                  <span className="text-[11px] text-[#6B7280] block">
                    Push file & update <code className="font-mono text-[#3B82F6]">catalog.json</code> in{' '}
                    <strong className="text-[#1F2937]">{gitHubConfig.owner}/{gitHubConfig.repo}</strong> ({gitHubConfig.branch || 'main'})
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={pushToGitHub}
                onChange={(e) => setPushToGitHub(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#3B82F6] rounded cursor-pointer"
              />
            </label>

            {pushToGitHub && (
              <div className="pt-2 border-t border-[#D1D5DB]">
                <label className="block text-[11px] font-bold text-[#1F2937] mb-1 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-[#3B82F6]" />
                  <span>GitHub Personal Access Token (requires repo / contents:write permission) *</span>
                </label>
                <input
                  type="password"
                  value={inlineToken}
                  onChange={(e) => setInlineToken(e.target.value)}
                  placeholder="ghp_... or github_pat_..."
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
                />
              </div>
            )}
          </div>

          {pushError && (
            <div className="p-3 rounded-xl bg-red-50 border border-[#EF4444]/40 text-[#EF4444] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
              <span>{pushError}</span>
            </div>
          )}

          {/* Letter Date & Ref No. Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Issuance Date *</span>
              </label>
              <input
                type="date"
                required
                value={letterDate}
                onChange={(e) => setLetterDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Corporate Reference No. *</span>
              </label>
              <input
                type="text"
                required
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                placeholder="e.g. CIR/2026/042-B"
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
              />
            </div>
          </div>

          {/* Subject / Title */}
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Document Subject / Title *</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Directive Regarding Regional Renewable Energy Subsidies"
              className="w-full px-3 py-2 text-xs bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] font-medium"
            />
          </div>

          {/* Folder Category & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#1F2937] flex items-center gap-1">
                  <Folder className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Corporate Division / Folder *</span>
                </label>
                <button
                  type="button"
                  onClick={onOpenNewCategoryModal}
                  className="text-[11px] text-[#3B82F6] font-bold hover:underline"
                >
                  + New Division
                </button>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#D1D5DB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1">
                Disclosure Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                className="w-full px-3 py-2 text-xs border border-[#D1D5DB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] bg-white"
              >
                <option value="Official">Official</option>
                <option value="Circular">Circular</option>
                <option value="Public Notice">Public Notice</option>
                <option value="Confidential">Restricted / Archive</option>
              </select>
            </div>
          </div>

          {/* Issuing Authority / Sender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Issuing Authority / Dept</span>
              </label>
              <input
                type="text"
                value={senderDept}
                onChange={(e) => setSenderDept(e.target.value)}
                placeholder="e.g. Department of Finance & Audits"
                className="w-full px-3 py-2 text-xs bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1">
                Target Recipient
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. All Regional Directors, General Public"
                className="w-full px-3 py-2 text-xs bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1">
              Executive Summary / Abstract *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the background, purpose, key resolutions, or summary of this corporate record..."
              className="w-full px-3 py-2 text-xs bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Classification Tags (comma separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Policy, Budget-2026, Compliance, Public"
              className="w-full px-3 py-2 text-xs bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
            />
          </div>

          {/* Optional Text Body for Letterhead Preview */}
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1">
              Memorandum Body / Markdown Text (Optional, for web & PDF reader)
            </label>
            <textarea
              rows={3}
              value={contentPreview}
              onChange={(e) => setContentPreview(e.target.value)}
              placeholder="Paste official memorandum body, numbered clauses, or signatory names..."
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-[#D1D5DB] flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isPushing}
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-[#1F2937] bg-[#E5E7EB] hover:bg-[#D1D5DB] border border-[#D1D5DB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPushing}
              className="px-5 py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] shadow-2xs transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {isPushing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Committing to GitHub...</span>
                </>
              ) : (
                <>
                  {pushToGitHub && <Github className="w-4 h-4 text-white" />}
                  <span>
                    {editingDoc
                      ? pushToGitHub
                        ? 'Save & Commit to GitHub'
                        : 'Save Changes'
                      : pushToGitHub
                      ? 'Publish & Commit to GitHub'
                      : 'Publish Record'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
