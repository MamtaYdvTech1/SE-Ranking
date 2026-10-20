"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X, Undo2 } from "lucide-react";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  duration?: number;
  undoAction?: () => void;
}

interface ToastContextType {
  toast: (options: Omit<ToastItem, "id">) => void;
  success: (message: string, undoAction?: () => void) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, message, duration = 4000, undoAction }: Omit<ToastItem, "id">) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message, duration, undoAction }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, undoAction?: () => void) => toast({ type: "success", message, undoAction }),
    [toast]
  );
  const error = useCallback((message: string) => toast({ type: "error", message }), [toast]);
  const info = useCallback((message: string) => toast({ type: "info", message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const typeConfig = {
            success: {
              border: "border-emerald-500/30 bg-slate-900/95 text-emerald-300",
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
            },
            error: {
              border: "border-rose-500/30 bg-slate-900/95 text-rose-300",
              icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
            },
            info: {
              border: "border-violet-500/30 bg-slate-900/95 text-violet-300",
              icon: <Info className="w-4 h-4 text-violet-400 shrink-0" />,
            },
          }[t.type];

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-xs animate-in slide-in-from-bottom-2 duration-150 ${typeConfig.border}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {typeConfig.icon}
                <span className="truncate text-slate-200">{t.message}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {t.undoAction && (
                  <button
                    onClick={() => {
                      t.undoAction?.();
                      removeToast(t.id);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Undo</span>
                  </button>
                )}
                <button
                  onClick={() => removeToast(t.id)}
                  className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label="Dismiss toast"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
