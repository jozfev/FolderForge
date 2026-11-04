import { X, Layout, Plus, Trash2 } from 'lucide-react';
import { Template } from '../core/models';
import { useState } from 'react';

interface TemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  onSelect: (template: Template) => void;
  onSaveCustom: (name: string, content: string) => void;
  onDeleteCustom: (id: string) => void;
}

export function Templates({ isOpen, onClose, templates, onSelect, onSaveCustom, onDeleteCustom }: TemplatesProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (newName.trim() && newContent.trim()) {
      onSaveCustom(newName.trim(), newContent.trim());
      setNewName('');
      setNewContent('');
      setShowAdd(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1B1F23] border border-[#2B3235] rounded-xl w-[520px] max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2B3235]">
          <div className="flex items-center gap-2">
            <Layout size={16} className="text-[#929B9D]" />
            <h2 className="text-sm font-semibold text-[#F1F5F3]">Templates</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="text-[#929B9D] hover:text-[#35D39A] transition-colors p-1"
              title="Add custom template"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={onClose}
              className="text-[#929B9D] hover:text-[#F1F5F3] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Add custom template form */}
        {showAdd && (
          <div className="px-5 py-4 border-b border-[#2B3235] bg-[#22282D] space-y-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Template name"
              className="w-full px-3 py-2 bg-[#1B1F23] border border-[#2B3235] rounded-lg text-xs text-[#F1F5F3] placeholder:text-[#929B9D]/50 focus:outline-none focus:border-[#35D39A]/50"
            />
            <textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Paste structure here..."
              rows={4}
              className="w-full px-3 py-2 bg-[#1B1F23] border border-[#2B3235] rounded-lg text-xs text-[#F1F5F3] placeholder:text-[#929B9D]/50 focus:outline-none focus:border-[#35D39A]/50 font-mono resize-none"
            />
            <button
              onClick={handleSave}
              disabled={!newName.trim() || !newContent.trim()}
              className="px-3 py-1.5 bg-[#35D39A] text-[#101214] text-xs font-medium rounded-lg hover:bg-[#48E0AA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Template
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[55vh] p-3">
          <div className="space-y-2">
            {templates.map(template => (
              <div
                key={template.id}
                className="group flex items-center gap-3 p-3 bg-[#22282D] rounded-lg hover:bg-[#2B3235] transition-colors cursor-pointer"
                onClick={() => { onSelect(template); onClose(); }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-[#F1F5F3]">{template.name}</p>
                    {template.isCustom && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#35D39A]/10 text-[#35D39A] rounded">
                        custom
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#929B9D] mt-0.5">{template.description}</p>
                </div>
                {template.isCustom && (
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteCustom(template.id); }}
                    className="text-[#929B9D] hover:text-[#F16C6C] opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
