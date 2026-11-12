import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_DOCUMENTS 
} from './data/initialDocs';
import { 
  DocItem, 
  FolderCategory, 
  GitHubRepoConfig 
} from './types';
import { 
  fetchGitHubRepoContents,
  commitCatalogJsonToGitHub
} from './services/githubService';
import {
  buildSingleDocumentPdf,
  exportDocsToCsv
} from './services/pdfReportService';
import { Navbar } from './components/Navbar';
import { StatsOverview, DatePreset } from './components/StatsOverview';
import { DocumentTable } from './components/DocumentTable';
import { DocumentGrid } from './components/DocumentGrid';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { UploadModal } from './components/UploadModal';
import { PdfReportModal } from './components/PdfReportModal';
import { GitHubSyncModal } from './components/GitHubSyncModal';
import { CategoryModal } from './components/CategoryModal';
import { Check, Info, AlertCircle } from 'lucide-react';

const STORAGE_KEYS = {
  DOCS: 'docuhub_documents_v1',
  CATEGORIES: 'docuhub_categories_v1',
  GITHUB_CONFIG: 'docuhub_github_config_v1',
};

export default function App() {
  // Load persistent state or fall back to defaults
  const [categories, setCategories] = useState<FolderCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [docs, setDocs] = useState<DocItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCS);
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  });

  const [gitHubConfig, setGitHubConfig] = useState<GitHubRepoConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GITHUB_CONFIG);
      return saved
        ? JSON.parse(saved)
        : {
            owner: 'sudarshan8555',
            repo: 'public-documents',
            branch: 'main',
            folderPath: 'documents',
            syncStatus: 'idle',
          };
    } catch {
      return {
        owner: 'sudarshan8555',
        repo: 'public-documents',
        branch: 'main',
        folderPath: 'documents',
        syncStatus: 'idle',
      };
    }
  });

  // Navigation & Filtering State
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [statusFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocItem | null>(null);
  const [isPdfReportOpen, setIsPdfReportOpen] = useState(false);
  const [isGitHubSyncOpen, setIsGitHubSyncOpen] = useState(false);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocItem | null>(null);

  // Sync state & Toast
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
    } catch (e) {
      console.warn('Could not save docs to localStorage', e);
    }
  }, [docs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('Could not save categories to localStorage', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GITHUB_CONFIG, JSON.stringify(gitHubConfig));
    } catch (e) {
      console.warn('Could not save gitHubConfig to localStorage', e);
    }
  }, [gitHubConfig]);

  // Current selected Category object
  const currentCategory = useMemo(() => {
    if (activeCategoryId === 'all') return null;
    return categories.find((c) => c.id === activeCategoryId) || null;
  }, [categories, activeCategoryId]);

  // Compute document count per category for top dropdown
  const docsByCategoryCount = useMemo(() => {
    const counts: Record<string, number> = {};
    docs.forEach((d) => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return counts;
  }, [docs]);

  // Extract all unique tags for top dropdown filter
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    docs.forEach((d) => {
      if (d.tags) d.tags.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [docs]);

  // Filtered documents calculation (includes Date Range & Financial Year filter)
  const filteredDocs = useMemo(() => {
    return docs.filter((item) => {
      // Category filter
      if (activeCategoryId !== 'all' && item.category !== activeCategoryId) {
        return false;
      }

      // Tag filter
      if (selectedTag && (!item.tags || !item.tags.includes(selectedTag))) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // Date Range & Financial Year filter
      if (datePreset !== 'all') {
        const dStr = item.letterDate || '';
        if (datePreset === 'fy-2026-27') {
          if (dStr < '2026-04-01' || dStr > '2027-03-31') return false;
        } else if (datePreset === 'fy-2025-26') {
          if (dStr < '2025-04-01' || dStr > '2026-03-31') return false;
        } else if (datePreset === 'year-2026') {
          if (!dStr.startsWith('2026')) return false;
        } else if (datePreset === 'year-2025') {
          if (!dStr.startsWith('2025')) return false;
        } else if (datePreset === 'last-90') {
          const docTime = new Date(dStr).getTime();
          const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
          if (isNaN(docTime) || docTime < ninetyDaysAgo) return false;
        } else if (datePreset === 'custom') {
          if (customStartDate && dStr < customStartDate) return false;
          if (customEndDate && dStr > customEndDate) return false;
        }
      }

      // Search query across: subject, refNo, letterDate, description, tags, fileName, senderDept
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchesSubject = (item.subject || '').toLowerCase().includes(q);
        const matchesRef = (item.refNo || '').toLowerCase().includes(q);
        const matchesDate = (item.letterDate || '').toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesFile = (item.fileName || '').toLowerCase().includes(q);
        const matchesSender = (item.senderDept || '').toLowerCase().includes(q);
        const matchesTags = item.tags ? item.tags.some((t) => t.toLowerCase().includes(q)) : false;

        if (!matchesSubject && !matchesRef && !matchesDate && !matchesDesc && !matchesFile && !matchesSender && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [docs, activeCategoryId, selectedTag, statusFilter, datePreset, customStartDate, customEndDate, searchQuery]);

  // Handle Multi-Select Checkboxes
  const handleToggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedDocIds.length === filteredDocs.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredDocs.map((d) => d.id));
    }
  };

  // Add Document
  const handleAddDocument = (newDoc: DocItem, pushedToGitHub?: boolean) => {
    const updatedList = [newDoc, ...docs];
    setDocs(updatedList);
    if (pushedToGitHub) {
      commitCatalogJsonToGitHub(gitHubConfig, updatedList, categories)
        .then(() => {
          showToast(
            `Committed "${newDoc.fileName}" & catalog.json to ${gitHubConfig.owner}/${gitHubConfig.repo}!`,
            'success'
          );
        })
        .catch(() => {
          showToast(`Uploaded "${newDoc.fileName}" to GitHub!`, 'success');
        });
    } else {
      showToast(`Registered document "${newDoc.subject}" successfully!`, 'success');
    }
  };

  // Update Document
  const handleUpdateDocument = (updatedDoc: DocItem, pushedToGitHub?: boolean) => {
    const updatedList = docs.map((d) => (d.id === updatedDoc.id ? updatedDoc : d));
    setDocs(updatedList);
    if (pushedToGitHub) {
      commitCatalogJsonToGitHub(gitHubConfig, updatedList, categories)
        .then(() => {
          showToast(
            `Committed updated "${updatedDoc.refNo}" & catalog.json to ${gitHubConfig.owner}/${gitHubConfig.repo}!`,
            'success'
          );
        })
        .catch(() => {
          showToast(`Updated & pushed "${updatedDoc.refNo}" to GitHub!`, 'success');
        });
    } else {
      showToast(`Updated record "${updatedDoc.refNo}"`, 'success');
    }
  };

  // Delete Single Document
  const handleDeleteDocument = (docToDelete: DocItem) => {
    setDocs((prev) => prev.filter((d) => d.id !== docToDelete.id));
    setSelectedDocIds((prev) => prev.filter((id) => id !== docToDelete.id));
    showToast(`Deleted record "${docToDelete.refNo}"`, 'info');
  };

  // Batch Delete Selected Documents
  const handleBatchDelete = () => {
    if (selectedDocIds.length === 0) return;
    const count = selectedDocIds.length;
    const idSet = new Set(selectedDocIds);
    setDocs((prev) => prev.filter((d) => !idSet.has(d.id)));
    setSelectedDocIds([]);
    showToast(`Deleted ${count} selected record${count > 1 ? 's' : ''}`, 'info');
  };

  // Add Category / Folder
  const handleAddCategory = (newCat: FolderCategory) => {
    setCategories((prev) => [...prev, newCat]);
    setActiveCategoryId(newCat.id);
    showToast(`Created custom folder "${newCat.name}"`, 'success');
  };

  // Download Handler (Generates genuine PDF for PDF records or downloads binary blob)
  const handleDownloadDoc = (doc: DocItem) => {
    if (doc.downloadUrl && doc.source === 'github') {
      const a = document.createElement('a');
      a.href = doc.downloadUrl;
      a.download = doc.fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
      showToast(`Downloading "${doc.fileName}" from repository...`, 'info');
      return;
    }

    if (doc.downloadUrl && doc.downloadUrl.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = doc.downloadUrl;
      a.download = doc.fileName;
      a.click();
      showToast(`Downloaded "${doc.fileName}"`, 'success');
      return;
    }

    // If it's a PDF document without a raw blob, build a real PDF document using jsPDF
    if ((doc.fileType || '').toLowerCase() === 'pdf') {
      const catName = categories.find((c) => c.id === doc.category)?.name || doc.category;
      const pdf = buildSingleDocumentPdf(doc, catName);
      pdf.save(doc.fileName.endsWith('.pdf') ? doc.fileName : `${doc.fileName}.pdf`);
      showToast(`Downloaded official PDF "${doc.fileName}"`, 'success');
      return;
    }

    // Otherwise generate downloadable document blob
    const content = doc.contentPreview || `# ${doc.subject}\nRef No: ${doc.refNo}\nDate: ${doc.letterDate}\n\n${doc.description}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded document "${doc.fileName}"`, 'success');
  };

  // Batch Download Selected Documents
  const handleBatchDownload = () => {
    const selectedDocs = docs.filter((d) => selectedDocIds.includes(d.id));
    if (selectedDocs.length === 0) return;
    selectedDocs.forEach((doc, idx) => {
      setTimeout(() => {
        handleDownloadDoc(doc);
      }, idx * 250);
    });
    showToast(`Downloading ${selectedDocs.length} selected records...`, 'success');
  };

  // Export CSV (All Filtered or Selected)
  const handleExportFilteredCsv = () => {
    exportDocsToCsv(
      filteredDocs,
      categories,
      currentCategory ? currentCategory.id : 'all_corporate_records'
    );
    showToast(`Exported ${filteredDocs.length} records to CSV`, 'success');
  };

  const handleBatchExportCsv = () => {
    const selectedDocs = docs.filter((d) => selectedDocIds.includes(d.id));
    exportDocsToCsv(selectedDocs, categories, 'selected_corporate_records');
    showToast(`Exported ${selectedDocs.length} selected records to CSV`, 'success');
  };

  // GitHub Sync Execution
  const handleTriggerSync = async (cfg: GitHubRepoConfig) => {
    setIsSyncing(true);
    try {
      const result = await fetchGitHubRepoContents(cfg);

      // Merge documents avoiding duplicates by ID or filename
      setDocs((prev) => {
        const existingIds = new Set(prev.map((d) => d.id));
        const newDocs = result.docs.filter((d) => !existingIds.has(d.id));
        return [...newDocs, ...prev];
      });

      // Merge new categories if discovered
      if (result.categories.length > 0) {
        setCategories((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const newCats = result.categories.filter((c) => !existingIds.has(c.id));
          return [...prev, ...newCats];
        });
      }

      setGitHubConfig({
        ...cfg,
        syncStatus: 'synced',
        lastSyncedAt: new Date().toISOString(),
      });

      showToast(`GitHub Sync complete! Found ${result.docs.length} documents.`, 'success');
    } catch (err: any) {
      setGitHubConfig({
        ...cfg,
        syncStatus: 'error',
        errorMessage: err.message,
      });
      showToast(err.message || 'GitHub Sync encountered an issue.', 'error');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleQuickSync = () => {
    handleTriggerSync(gitHubConfig).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D1FAE5] via-[#CFFAFE] to-[#BFDBFE] text-[#1F2937] flex flex-col font-sans selection:bg-[#3B82F6] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white text-[#1F2937] border border-[#D1D5DB] shadow-lg text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-5">
          {toastMessage.type === 'success' && <Check className="w-4 h-4 text-[#10B981] shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-[#3B82F6] shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Official Company Header & Executive Masthead */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategoryName={currentCategory ? currentCategory.name : 'All Corporate Divisions'}
        totalFilteredDocs={filteredDocs.length}
        onOpenUpload={() => {
          setEditingDoc(null);
          setIsUploadOpen(true);
        }}
        onOpenPdfReport={() => setIsPdfReportOpen(true)}
        onOpenGitHubSync={() => setIsGitHubSyncOpen(true)}
        gitHubConfig={gitHubConfig}
        isSyncing={isSyncing}
        onQuickSync={handleQuickSync}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Corporate Workspace - Compact top spacing */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5 flex-1">
        <main className="w-full">
          {/* Executive Corporate Department Bar, Date/FY Filter & KPI Overview */}
          <StatsOverview
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={(id) => {
              setActiveCategoryId(id);
              setSelectedDocIds([]);
            }}
            onOpenNewCategoryModal={() => setIsNewCategoryOpen(true)}
            currentCategory={currentCategory}
            allDocsCount={docs.length}
            filteredDocs={filteredDocs}
            docsByCategoryCount={docsByCategoryCount}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            availableTags={availableTags}
            datePreset={datePreset}
            onDatePresetChange={(preset) => {
              setDatePreset(preset);
              setSelectedDocIds([]);
            }}
            customStartDate={customStartDate}
            onCustomStartDateChange={setCustomStartDate}
            customEndDate={customEndDate}
            onCustomEndDateChange={setCustomEndDate}
            onExportCsv={handleExportFilteredCsv}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Official Corporate Document Ledger (Full width without horizontal slider) */}
          {viewMode === 'table' ? (
            <DocumentTable
              docs={filteredDocs}
              categories={categories}
              onPreviewDoc={(doc) => setPreviewDoc(doc)}
              onDownloadDoc={handleDownloadDoc}
              onEditDoc={(doc) => {
                setEditingDoc(doc);
                setIsUploadOpen(true);
              }}
              onTagClick={(tag) => setSelectedTag(tag)}
              onCategoryClick={(catId) => setActiveCategoryId(catId)}
              onAuthorityClick={(authority) => {
                setSearchQuery(authority);
                showToast(`Filtered by Issuing Authority: "${authority}"`, 'info');
              }}
              onCopyRefNo={(refNo) => {
                showToast(`Copied Ref No. "${refNo}" to clipboard`, 'success');
              }}
              selectedDocIds={selectedDocIds}
              onToggleSelectDoc={handleToggleSelectDoc}
              onToggleSelectAll={handleToggleSelectAll}
              onClearSelection={() => setSelectedDocIds([])}
              onGenerateReportForSelected={() => setIsPdfReportOpen(true)}
              onBatchDownload={handleBatchDownload}
              onBatchExportCsv={handleBatchExportCsv}
              onBatchDelete={handleBatchDelete}
            />
          ) : (
            <DocumentGrid
              docs={filteredDocs}
              categories={categories}
              onPreviewDoc={(doc) => setPreviewDoc(doc)}
              onDownloadDoc={handleDownloadDoc}
              onTagClick={(tag) => setSelectedTag(tag)}
              selectedDocIds={selectedDocIds}
              onToggleSelectDoc={handleToggleSelectDoc}
            />
          )}
        </main>
      </div>

      {/* Compact Footer */}
      <footer className="mt-auto border-t border-[#D1D5DB] bg-white py-2 text-xs text-[#6B7280]">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-white font-bold text-[10px]">
              DH
            </span>
            <span className="font-bold text-[#1F2937]">DocuHub Enterprise</span>
          </div>
          <span className="text-[11px] text-[#6B7280]">
            © {new Date().getFullYear()} DocuHub
          </span>
        </div>
      </footer>

      {/* Modals */}
      <DocumentPreviewModal
        doc={previewDoc}
        category={previewDoc ? categories.find((c) => c.id === previewDoc.category) || null : null}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownloadDoc}
        onEditDoc={(doc) => {
          setEditingDoc(doc);
          setIsUploadOpen(true);
        }}
        onDeleteDoc={handleDeleteDocument}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setEditingDoc(null);
        }}
        categories={categories}
        activeCategoryId={activeCategoryId}
        onAddDocument={handleAddDocument}
        onUpdateDocument={handleUpdateDocument}
        editingDoc={editingDoc}
        onOpenNewCategoryModal={() => {
          setIsUploadOpen(false);
          setIsNewCategoryOpen(true);
        }}
        gitHubConfig={gitHubConfig}
        onUpdateGitHubConfig={setGitHubConfig}
      />

      <PdfReportModal
        isOpen={isPdfReportOpen}
        onClose={() => setIsPdfReportOpen(false)}
        currentCategory={currentCategory}
        categories={categories}
        allDocs={docs}
        filteredDocs={filteredDocs}
        selectedDocIds={selectedDocIds}
      />

      <GitHubSyncModal
        isOpen={isGitHubSyncOpen}
        onClose={() => setIsGitHubSyncOpen(false)}
        config={gitHubConfig}
        onSaveConfig={setGitHubConfig}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
        docs={docs}
        categories={categories}
      />

      <CategoryModal
        isOpen={isNewCategoryOpen}
        onClose={() => setIsNewCategoryOpen(false)}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
}
