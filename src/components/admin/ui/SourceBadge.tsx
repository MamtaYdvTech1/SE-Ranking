'use client';

import React from 'react';

interface SourceBadgeProps {
  source: string;
  country?: string;
  updatedAt?: string;
  className?: string;
}

export function SourceBadge({ source, country, updatedAt, className = '' }: SourceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[10px] text-slate-400 font-mono ${className}`}
      title={`Data Origin: ${source} | Scope: ${country || 'Global'} | Freshness: ${updatedAt || 'Real-time'}`}
    >
      <span className="font-semibold text-slate-300">{source}</span>
      {country && <span className="text-slate-500">•</span>}
      {country && <span className="uppercase">{country}</span>}
      {updatedAt && <span className="text-slate-500">•</span>}
      {updatedAt && <span>{updatedAt}</span>}
    </span>
  );
}
