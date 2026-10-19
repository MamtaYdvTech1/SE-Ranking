'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ComponentType<{ className?: string }>;
  source?: string;
  country?: string;
  updatedAt?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  source,
  country,
  updatedAt,
}: StatCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all shadow-xs group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300 transition">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs font-semibold flex items-center gap-0.5 ${
              change.trend === 'up'
                ? 'text-emerald-500 dark:text-emerald-400'
                : change.trend === 'down'
                ? 'text-rose-500 dark:text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {change.trend === 'up' ? '↑' : change.trend === 'down' ? '↓' : '•'} {change.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{subtitle}</p>}

      {/* Source / Country / Updated Metadata Pill */}
      {(source || country || updatedAt) && (
        <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-400">
          {source && <span className="font-medium text-slate-500 dark:text-slate-400">{source}</span>}
          {source && country && <span>•</span>}
          {country && <span>{country}</span>}
          {(source || country) && updatedAt && <span>•</span>}
          {updatedAt && <span>{updatedAt}</span>}
        </div>
      )}
    </div>
  );
}
