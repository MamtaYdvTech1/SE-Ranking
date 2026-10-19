"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
      btnConfirm: "bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500/50 shadow-lg shadow-rose-950/40",
    },
    warning: {
      iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      btnConfirm: "bg-amber-600 hover:bg-amber-500 text-white focus:ring-amber-500/50 shadow-lg shadow-amber-950/40",
    },
    primary: {
      iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      btnConfirm: "bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500/50 shadow-lg shadow-emerald-950/40",
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${variantStyles.iconBg}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-normal">{description}</p>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80 rounded-xl transition-colors shadow-xs cursor-pointer focus:ring-2 focus:ring-slate-400/30"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 focus:ring-2 focus:outline-none cursor-pointer ${variantStyles.btnConfirm}`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
