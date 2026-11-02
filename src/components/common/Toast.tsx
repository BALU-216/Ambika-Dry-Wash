import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 z-50 flex flex-col gap-2.5 sm:max-w-sm w-auto pointer-events-none">
      {toasts.map((toast) => {
        const iconMap = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          error: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
        };

        const borderMap = {
          success: 'border-emerald-200 bg-white',
          info: 'border-blue-200 bg-white',
          warning: 'border-amber-200 bg-white',
          error: 'border-rose-200 bg-white',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-xl shadow-lg border ${borderMap[toast.type]} transition-all duration-200`}
          >
            <div className="flex items-start gap-3 min-w-0">
              {iconMap[toast.type]}
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-900 break-words">{toast.title}</p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors shrink-0 cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const Toast = ToastContainer;
