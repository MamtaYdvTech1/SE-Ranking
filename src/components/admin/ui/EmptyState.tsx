'use client';

import React from 'react';
import { LucideIcon, FolderSearch } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 text-center transition-colors ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 dark:text-slate-400 mb-3.5 shadow-xs">
        <Icon className="w-6 h-6 text-slate-400 dark:text-slate-400" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-500/20 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
