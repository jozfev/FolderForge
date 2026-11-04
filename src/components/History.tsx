import { X, Trash2, Clock, Folder, File } from 'lucide-react';
import { HistoryEntry } from '../core/models';

interface HistoryProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onClear: () => void;
  onDelete: (id: string) => void;
}

export function History({ isOpen, onClose, history, onClear, onDelete }: HistoryProps) {
  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-[#35D39A]';
      case 'partial': return 'text-[#E7B65C]';
      case 'failed': return 'text-[#F16C6C]';
      default: return 'text-[#929B9D]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1B1F23] border border-[#2B3235] rounded-xl w-[500px] max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2B3235]">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#929B9D]" />
            <h2 className="text-sm font-semibold text-[#F1F5F3]">History</h2>
            <span className="text-[10px] text-[#929B9D] bg-[#22282D] px-2 py-0.5 rounded-full">
              {history.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClear}
                className="text-[#929B9D] hover:text-[#F16C6C] transition-colors p-1"
                title="Clear all"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#929B9D] hover:text-[#F1F5F3] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-3">
          {history.length === 0 ? (
            <div className="text-center py-10">
              <Clock size={24} className="text-[#2B3235] mx-auto mb-2" />
              <p className="text-xs text-[#929B9D]">No history yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-3 bg-[#22282D] rounded-lg group hover:bg-[#2B3235] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Folder size={12} className="text-[#35D39A] flex-shrink-0" />
                      <p className="text-xs font-medium text-[#F1F5F3] truncate">
                        {entry.projectName}
                      </p>
                      <span className={`text-[10px] ${getStatusColor(entry.status)} capitalize`}>
                        {entry.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-[#929B9D]">{formatDate(entry.date)}</span>
                      <span className="text-[10px] text-[#929B9D] flex items-center gap-1">
                        <Folder size={9} /> {entry.dirsCount}
                      </span>
                      <span className="text-[10px] text-[#929B9D] flex items-center gap-1">
                        <File size={9} /> {entry.filesCount}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="text-[#929B9D] hover:text-[#F16C6C] opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
