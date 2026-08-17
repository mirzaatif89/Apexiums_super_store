import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useAdmin();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-in ${
              isSuccess
                ? 'bg-slate-900/95 text-white border-slate-700/80'
                : isError
                ? 'bg-rose-900/95 text-white border-rose-700/80'
                : 'bg-slate-800/95 text-white border-slate-700/80'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
              {isError && <AlertCircle size={18} className="text-rose-400 shrink-0" />}
              {!isSuccess && !isError && <Info size={18} className="text-sky-400 shrink-0" />}
              <p className="text-xs font-semibold leading-snug truncate">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
