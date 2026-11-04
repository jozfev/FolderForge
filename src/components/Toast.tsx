import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let addToastGlobal: ((message: string, type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = 'info') {
  if (addToastGlobal) {
    addToastGlobal(message, type);
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastGlobal = addToast;
    return () => { addToastGlobal = null; };
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-[#35D39A]" />;
      case 'error': return <XCircle size={16} className="text-[#F16C6C]" />;
      case 'warning': return <AlertTriangle size={16} className="text-[#E7B65C]" />;
      case 'info': return <Info size={16} className="text-[#929B9D]" />;
    }
  };

  const getBorder = (type: ToastType) => {
    switch (type) {
      case 'success': return 'border-[#35D39A]/30';
      case 'error': return 'border-[#F16C6C]/30';
      case 'warning': return 'border-[#E7B65C]/30';
      case 'info': return 'border-[#2B3235]';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 bg-[#22282D] border ${getBorder(toast.type)} rounded-lg shadow-lg animate-slide-in min-w-[280px] max-w-[400px]`}
        >
          {getIcon(toast.type)}
          <span className="text-sm text-[#F1F5F3] flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#929B9D] hover:text-[#F1F5F3] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
