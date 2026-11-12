import React from 'react';
import { 
  Folder, 
  Plus, 
  Megaphone, 
  FileText, 
  TrendingUp, 
  Scale, 
  Calendar, 
  Cpu, 
  Tag, 
  Files
} from 'lucide-react';
import { FolderCategory, DocItem } from '../types';

interface SidebarProps {
  categories: FolderCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  onOpenNewCategoryModal: () => void;
  docs: DocItem[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  onOpenNewCategoryModal,
  docs,
  selectedTag,
  onSelectTag,
}) => {
  // Compute counts per category
  const countMap: Record<string, number> = {};
  docs.forEach((d) => {
    countMap[d.category] = (countMap[d.category] || 0) + 1;
  });

  // Collect all unique tags and count frequencies
  const tagCounts: Record<string, number> = {};
  docs.forEach((d) => {
    if (d.tags) {
      d.tags.forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    }
  });

  const popularTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const renderCategoryIcon = (iconName: string) => {
    const className = 'w-4 h-4 shrink-0';
    switch (iconName) {
      case 'Megaphone': return <Megaphone className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Scale': return <Scale className={className} />;
      case 'Calendar': return <Calendar className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      default: return <Folder className={className} />;
    }
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      {/* Unified Folder Navigation */}
      <div>
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Folders
          </span>
          <button
            onClick={onOpenNewCategoryModal}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            title="Create Custom Folder"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        <nav className="space-y-0.5">
          {/* All Documents item */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeCategoryId === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Files className="w-4 h-4 shrink-0 opacity-80" />
              <span className="truncate">All Documents</span>
            </div>
            <span
              className={`text-[11px] font-mono ${
                activeCategoryId === 'all' ? 'text-slate-300' : 'text-slate-400'
              }`}
            >
              {docs.length}
            </span>
          </button>

          {/* Categories list */}
          {categories.map((cat) => {
            const count = countMap[cat.id] || 0;
            const isActive = activeCategoryId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="opacity-80">
                    {renderCategoryIcon(cat.icon)}
                  </span>
                  <span className="truncate">{cat.name}</span>
                </div>
                <span
                  className={`text-[11px] font-mono ${
                    isActive ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Clean Tags Section */}
      {popularTags.length > 0 && (
        <div className="pt-2 border-t border-slate-200/60">
          <div className="flex items-center justify-between mb-2.5 px-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Tags
            </span>
            {selectedTag && (
              <button
                onClick={() => onSelectTag(null)}
                className="text-[11px] text-slate-500 hover:text-slate-800"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1 px-1">
            {popularTags.map(([tag]) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => onSelectTag(isSelected ? null : tag)}
                  className={`px-2 py-1 rounded-md text-[11px] transition-colors ${
                    isSelected
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
