import React, { useState } from 'react';
import { 
  X, 
  FolderPlus, 
  Folder, 
  Megaphone, 
  FileText, 
  TrendingUp, 
  Scale, 
  Calendar, 
  Cpu, 
  BookOpen, 
  Briefcase 
} from 'lucide-react';
import { FolderCategory } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (category: FolderCategory) => void;
}

const AVAILABLE_ICONS = [
  { id: 'Folder', label: 'Folder', icon: Folder },
  { id: 'Megaphone', label: 'Notice / Circular', icon: Megaphone },
  { id: 'FileText', label: 'Document', icon: FileText },
  { id: 'TrendingUp', label: 'Finance / Audit', icon: TrendingUp },
  { id: 'Scale', label: 'Legal / Contracts', icon: Scale },
  { id: 'Calendar', label: 'Minutes / Events', icon: Calendar },
  { id: 'Cpu', label: 'Technical Specs', icon: Cpu },
  { id: 'Briefcase', label: 'Executive', icon: Briefcase },
  { id: 'BookOpen', label: 'Archive', icon: BookOpen },
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [color, setColor] = useState('blue');
  const [gitHubPath, setGitHubPath] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-');

    const newCategory: FolderCategory = {
      id,
      name: name.trim(),
      description: description.trim() || `Public documents categorized under ${name.trim()}`,
      icon,
      color,
      gitHubPath: gitHubPath.trim() || id,
    };

    onAddCategory(newCategory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1F2937]/45 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-[#D1D5DB] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D1D5DB] flex items-center justify-between bg-gradient-to-r from-[#D1FAE5]/75 via-[#CFFAFE]/75 to-[#BFDBFE]/75">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-white flex items-center justify-center shadow-xs">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1F2937] leading-tight">
                Create Corporate Division Folder
              </h2>
              <p className="text-xs text-[#6B7280]">
                Organize corporate disclosures and sync with matching GitHub repository folders
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1">
              Division / Folder Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!gitHubPath) {
                  setGitHubPath(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                }
              }}
              placeholder="e.g. Audit Queries & Resolutions"
              className="w-full px-3 py-2 text-xs bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1">
              Division Description & Scope
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What types of corporate letters, notices, or files belong in this division?"
              className="w-full px-3 py-2 text-xs bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-1">
              GitHub Repository Subfolder Name
            </label>
            <input
              type="text"
              value={gitHubPath}
              onChange={(e) => setGitHubPath(e.target.value)}
              placeholder="e.g. audit-queries (subfolder in your GitHub repo)"
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#D1D5DB] rounded-lg text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
            />
          </div>

          {/* Select Icon */}
          <div>
            <label className="block text-xs font-bold text-[#1F2937] mb-2">
              Select Division Icon
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = icon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                      isSelected
                        ? 'border-[#3B82F6] bg-[#BFDBFE]/50 text-[#1F2937] font-bold'
                        : 'border-[#D1D5DB] hover:bg-[#E5E7EB]/60 text-[#1F2937]'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0 text-[#3B82F6]" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#D1D5DB] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#1F2937] bg-[#E5E7EB] hover:bg-[#D1D5DB] border border-[#D1D5DB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-all shadow-2xs"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
