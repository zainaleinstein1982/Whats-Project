import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  const icons = {
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
  };

  const bgColors = {
    info: 'bg-white border-blue-100 text-gray-800',
    success: 'bg-white border-green-100 text-gray-800',
    warning: 'bg-white border-amber-100 text-gray-800',
    error: 'bg-white border-red-100 text-gray-800'
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto border rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-md animate-in fade-in slide-in-from-top-2 duration-200 ${bgColors[toast.type]}`}
        >
          {icons[toast.type]}
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-gray-400 hover:text-gray-600 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
