'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  Radio,
  Layers,
  FileSpreadsheet,
  ShieldAlert,
  Activity,
  X,
  ExternalLink,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const links = [
    { label: 'Admin Overview', href: '/admin/dashboard', icon: LayoutDashboard, category: 'Overview' },
    { label: 'Users & Roles', href: '/admin/users', icon: Users, category: 'Access' },
    { label: 'Clients & Workspaces', href: '/admin/workspaces', icon: Building2, category: 'Access' },
    { label: 'Projects & Domains', href: '/admin/projects', icon: FolderKanban, category: 'Access' },
    { label: 'All SEO Datasets (Explorer)', href: '/admin/seo-explorer', icon: Search, category: 'SEO Data' },
    { label: 'Provider Registry & Health', href: '/admin/providers', icon: Radio, category: 'Operations' },
    { label: 'Background Jobs Monitor', href: '/admin/jobs', icon: Layers, category: 'Operations' },
    { label: 'Reports & CSV/PDF Center', href: '/admin/reports', icon: FileSpreadsheet, category: 'Operations' },
    { label: 'Audit Logs & Security', href: '/admin/activity-logs', icon: ShieldAlert, category: 'Governance' },
    { label: 'System Health & Diagnostics', href: '/admin/system-health', icon: Activity, category: 'Governance' },
    { label: 'Switch to Client Projects App', href: '/projects', icon: ExternalLink, category: 'Quick Action' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via custom event if closed
          window.dispatchEvent(new CustomEvent('toggle-command-palette'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = links.filter((l) =>
    l.label.toLowerCase().includes(query.toLowerCase()) || l.category.toLowerCase().includes(query.toLowerCase())
  );

  const navigateTo = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#0e1322] border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Type a command or jump to page..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching pages or admin actions found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => navigateTo(item.href)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-blue-600/20 hover:border-slate-300 dark:hover:border-blue-500/30 border border-transparent transition text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Bottom Helper Bar */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-[#090d18] border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Navigate with mouse or Enter</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
