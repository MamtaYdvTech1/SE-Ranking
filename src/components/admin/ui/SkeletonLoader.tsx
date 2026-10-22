'use client';

import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'stat';
  rows?: number;
  count?: number;
  className?: string;
}

export function SkeletonLoader({ type = 'card', rows, count, className = '' }: SkeletonLoaderProps) {
  const effectiveRows = rows ?? count ?? 5;
  if (type === 'stat') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3 animate-pulse">
            <div className="h-3 w-24 bg-slate-800 rounded" />
            <div className="h-7 w-16 bg-slate-700/60 rounded" />
            <div className="h-2 w-32 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={`rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4 animate-pulse ${className}`}>
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div className="h-5 w-32 bg-slate-800 rounded" />
          <div className="h-8 w-48 bg-slate-800 rounded" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: effectiveRows }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-4 w-1/4 bg-slate-800/80 rounded" />
              <div className="h-4 w-1/4 bg-slate-800/60 rounded" />
              <div className="h-4 w-1/6 bg-slate-800/60 rounded" />
              <div className="h-4 w-1/6 bg-slate-800/40 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4 animate-pulse ${className}`}>
      <div className="h-6 w-48 bg-slate-800 rounded" />
      <div className="h-4 w-full bg-slate-800/60 rounded" />
      <div className="h-4 w-3/4 bg-slate-800/40 rounded" />
    </div>
  );
}
