'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  Search,
  Radio,
  CreditCard,
  Layers,
  FileSpreadsheet,
  ShieldAlert,
  Settings,
  ArrowLeft,
  LogOut,
  ExternalLink,
  KeyRound,
  Globe,
  Calendar,
  Bell,
  Lock,
  Command,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'ACCESS & GOVERNANCE',
    items: [
      {
        label: 'Users',
        href: '/admin/users',
        icon: Users,
        badge: 'Enterprise',
        badgeColor: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/20',
      },
      {
        label: 'Roles & Permissions',
        href: '/admin/roles',
        icon: KeyRound,
      },
      {
        label: 'Clients & Workspaces',
        href: '/admin/clients',
        icon: Building2,
        badge: 'Agency',
        badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      },
      {
        label: 'Projects',
        href: '/admin/projects',
        icon: FolderKanban,
      },
      {
        label: 'Tracked Domains',
        href: '/admin/domains',
        icon: Globe,
      },
    ],
  },
  {
    title: 'INFRASTRUCTURE & OPS',
    items: [
      {
        label: 'Integrations & APIs',
        href: '/admin/providers',
        icon: Radio,
        badge: 'Upstream',
        badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      },
      {
        label: 'API Quotas & Usage',
        href: '/admin/api-usage',
        icon: CreditCard,
      },
      {
        label: 'Background Jobs',
        href: '/admin/jobs',
        icon: Layers,
      },
      {
        label: 'Schedules & Crons',
        href: '/admin/schedules',
        icon: Calendar,
      },
      {
        label: 'Notifications',
        href: '/admin/notifications',
        icon: Bell,
      },
      {
        label: 'Audit & Activity Logs',
        href: '/admin/activity-logs',
        icon: ShieldAlert,
      },
      {
        label: 'Security & Access',
        href: '/admin/security',
        icon: Lock,
      },
      {
        label: 'Global Settings',
        href: '/admin/settings',
        icon: Settings,
      },
    ],
  },
  {
    title: 'ANALYTICS & EXPORTS',
    items: [
      {
        label: 'Reports Generator',
        href: '/admin/reports',
        icon: FileSpreadsheet,
      },
      {
        label: 'SEO Datasets Explorer',
        href: '/admin/seo-explorer',
        icon: Search,
        badge: 'Live',
        badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
      },
    ],
  },
];

interface AdminSidebarProps {
  onOpenCommandPalette?: () => void;
  onCloseMobileNav?: () => void;
}

export function AdminSidebar({ onOpenCommandPalette, onCloseMobileNav }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [counts, setCounts] = useState<{ users?: number; clients?: number; projects?: number }>({});

  useEffect(() => {
    // Lightly fetch counts for badges
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/overview');
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            setCounts({
              users: data.data.users?.total,
              projects: data.data.projects?.total,
            });
          }
        }
      } catch {
        // non-blocking
      }
    }
    loadStats();
  }, []);

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-[#0b0f19] border-r border-slate-200/90 dark:border-slate-800/90 flex flex-col h-screen select-none z-30 transition-colors duration-150 shadow-xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200/90 dark:border-slate-800/90 flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          onClick={onCloseMobileNav}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform">
            SE
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
              <span>SE Ranking</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-violet-500/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Platform Gate</span>
            </div>
          </div>
        </Link>

        {onCloseMobileNav && (
          <button
            onClick={onCloseMobileNav}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition md:hidden cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Command Palette Trigger */}
      {onOpenCommandPalette && (
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
              <span className="text-[11px] font-medium">Quick search...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 shadow-2xs">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {section.title}
            </div>
            <div className="space-y-0.5 pt-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;

                let dynamicBadge = item.badge;
                if (item.label === 'Users' && counts.users !== undefined) {
                  dynamicBadge = String(counts.users);
                } else if (item.label === 'Projects' && counts.projects !== undefined) {
                  dynamicBadge = String(counts.projects);
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobileNav}
                    className={`relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 group ${
                      isActive
                        ? 'bg-violet-500/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-bold border border-violet-500/25 shadow-2xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-violet-600 dark:before:bg-violet-400'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-violet-600 dark:text-violet-400'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-violet-600 dark:group-hover:text-violet-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {dynamicBadge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          item.badgeColor ||
                          (isActive
                            ? 'bg-violet-500/20 text-violet-700 dark:text-violet-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400')
                        }`}
                      >
                        {dynamicBadge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-slate-200/90 dark:border-slate-800/90 space-y-2 bg-slate-50/80 dark:bg-[#070b14] flex-shrink-0">
        {/* Switch back to regular user workspace */}
        <Link
          href="/projects"
          className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 transition shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Client Workspace</span>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>

        {/* User Profile Bar */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-slate-900" />
            </div>

            <div className="overflow-hidden text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {user?.fullName || user?.email?.split('@')[0] || 'Administrator'}
              </div>
              <div className="text-[10px] text-violet-600 dark:text-violet-400 font-extrabold uppercase tracking-wider">
                {user?.role || 'SUPERADMIN'}
              </div>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                await logout();
              } finally {
                window.location.href = '/admin/login';
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
            title="Sign out of Admin Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
