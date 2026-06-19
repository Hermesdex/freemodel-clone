'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration ?? 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove, toast.duration]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-fm-green" />,
    error: <AlertCircle className="w-5 h-5 text-fm-red" />,
    info: <Info className="w-5 h-5 text-fm-blue" />,
  };

  return (
    <div
      className={cn(
        'toast animate-slide-in-right',
        toast.type === 'success' && 'toast-success',
        toast.type === 'error' && 'toast-error',
        toast.type === 'info' && 'toast-info'
      )}
      role="alert"
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-fm-text">{toast.title}</p>
        {toast.message && <p className="text-sm text-fm-text-muted mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="btn-ghost p-1.5 flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-fm-text-dim" />
      </button>
    </div>
  );
}

// Hook for using toasts
import { createContext, useContext, ReactNode } from 'react';

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 10);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}