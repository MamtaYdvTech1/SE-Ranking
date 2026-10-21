'use client';

import React from 'react';
import Link from 'next/link';

export interface AppsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  activeApp?: 'ranking' | 'visible' | 'planable';
}

export function AppsDropdown({
  isOpen,
  onClose,
  className = '',
  activeApp = 'ranking',
}: AppsDropdownProps) {
  if (!isOpen) return null;

  return (
    <div
      role="menu"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
      className={`absolute z-[9999] w-[278px] bg-white dark:bg-[#111827] rounded-2xl shadow-[0_12px_36px_-4px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_36px_-4px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)] border border-gray-100 dark:border-slate-800 p-2 text-left animate-in fade-in zoom-in-95 duration-150 ${className}`}
    >
      {/* 1. SE Visible · AI Search Suite */}
      <a
        href="https://visible.seranking.com/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F3F4F6] dark:hover:bg-slate-800/80 transition-colors cursor-pointer group select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            {/* Green wave icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M2.5 13.5C4.5 9 7 9 9.5 13.5C12 18 14.5 18 16.5 13.5C18.5 9 20.5 9 22 10.5"
                stroke="#00B67A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-[14px] leading-snug truncate">
            <span className="font-bold text-[#111827] dark:text-slate-100">SE Visible</span>
            <span className="text-[#8C95A5] dark:text-slate-400 font-normal ml-1">·&nbsp;AI Search Suite</span>
          </div>
        </div>
        {activeApp === 'visible' && (
          <span className="shrink-0 ml-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
      </a>

      {/* 2. SE Ranking · SEO Suite (Active with blue checkmark) */}
      <Link
        href="/projects"
        onClick={onClose}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F3F4F6] dark:hover:bg-slate-800/80 transition-colors cursor-pointer group select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            {/* SE Ranking official spark icon */}
            <svg width="20" height="20" viewBox="0 0 26 26" fill="none">
              <path
                d="M17.5 7.5L13.2 11.8C12.4 12.6 11.3 13 10.2 13H0L11.5 1.5C11.7 1.3 12 1.1 12.3 1.1H16.9C17.4 1.1 17.8 1.5 17.8 2V6.6C17.8 6.9 17.7 7.2 17.5 7.5Z"
                fill="#1B66FF"
              />
              <path
                d="M10.2 24.5V19.4C10.2 18.9 9.8 18.5 9.3 18.5H4.2L10.7 12C11.5 11.2 12.6 10.8 13.7 10.8H24L10.2 24.5Z"
                fill="#1B66FF"
              />
            </svg>
          </div>
          <div className="text-[14px] leading-snug truncate">
            <span className="font-bold text-[#111827] dark:text-slate-100">SE Ranking</span>
            <span className="text-[#8C95A5] dark:text-slate-400 font-normal ml-1">·&nbsp;SEO Suite</span>
          </div>
        </div>
        {activeApp === 'ranking' && (
          <span className="shrink-0 ml-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
      </Link>

      {/* 3. Planable · SMM Suite */}
      <a
        href="https://planable.io/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F3F4F6] dark:hover:bg-slate-800/80 transition-colors cursor-pointer group select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            {/* Planable official multi-color origami logo */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 14l8-9 8 9-8 3-8-3z" fill="#00C49F" />
              <path d="M12 5l8 9-8 8V5z" fill="#FF8042" />
              <path d="M4 14l8 8V17l-8-3z" fill="#FFBB28" />
            </svg>
          </div>
          <div className="text-[14px] leading-snug truncate">
            <span className="font-bold text-[#111827] dark:text-slate-100">Planable</span>
            <span className="text-[#8C95A5] dark:text-slate-400 font-normal ml-1">·&nbsp;SMM Suite</span>
          </div>
        </div>
        {activeApp === 'planable' && (
          <span className="shrink-0 ml-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
      </a>
    </div>
  );
}
