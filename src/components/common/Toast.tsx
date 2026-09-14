import React from 'react';
import type { ToastMessage } from '../../types/masterplan';
import { IconCheck, IconInfo } from './Icons';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/90 text-white shadow-2xl backdrop-blur-xl border border-white/10 animate-fade-in"
        >
          {toast.type === 'success' ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <IconCheck size={14} />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
              <IconInfo size={14} />
            </div>
          )}
          <span className="text-sm font-medium tracking-wide">{toast.text}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-2 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
