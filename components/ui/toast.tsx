"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

type Toast = { id: number; message: string };
type ToastContextValue = { showToast: (message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Lives in the admin layout (above every route), so a toast fired right
 * before a client-side navigation (e.g. save → redirect to the product's own
 * edit page) survives the navigation instead of disappearing with the page
 * that triggered it.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  function dismiss(id: number) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-fade-in-up pointer-events-auto flex items-center gap-3 rounded-2xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white shadow-xl"
          >
            <CheckCircle2 size={18} className="shrink-0 text-brand-green" />
            <span>{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Fermer"
              className="text-white/50 transition hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
