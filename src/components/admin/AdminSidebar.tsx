'use client';

import React from 'react';
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
  Activity,
  Settings,
  ArrowLeft,
  LogOut,
  ExternalLink,
  KeyRound,
  Globe,
  Calendar,
  Bell,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavSection {
  title: string;
  items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }[];
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
      },
      {
        label: 'Roles & Permissions',
        href: '/admin/roles',
        icon: KeyRound,
      },
      {
        label: 'Clients',
        href: '/admin/clients',
        icon: Building2,
      },
      {
        label: 'Projects',
        href: '/admin/projects',
        icon: FolderKanban,
      },
      {
        label: 'Domains',
        href: '/admin/domains',
        icon: Globe,
      },
    ],
  },
  {
    title: 'INFRASTRUCTURE & OPS',
    items: [
      {
        label: 'Integrations',
        href: '/admin/providers',
        icon: Radio,
      },
      {
        label: 'Provider Usage',
        href: '/admin/api-usage',
        icon: CreditCard,
      },
      {
        label: 'Jobs Monitor',
        href: '/admin/jobs',
        icon: Layers,
      },
      {
        label: 'Schedules',
        href: '/admin/schedules',
        icon: Calendar,
      },
      {
        label: 'Notifications',
        href: '/admin/notifications',
        icon: Bell,
      },
      {
        label: 'Audit Logs',
        href: '/admin/activity-logs',
        icon: ShieldAlert,
      },
      {
        label: 'Security',
        href: '/admin/security',
        icon: Lock,
      },
      {
        label: 'Settings',
        href: '/admin/settings',
        icon: Settings,
      },
    ],
  },
  {
    title: 'ANALYTICS & EXPORTS',
    items: [
      {
        label: 'Reports',
        href: '/admin/reports',
        icon: FileSpreadsheet,
      },
      {
        label: 'SEO Datasets',
        href: '/admin/seo-explorer',
        icon: Search,
        badge: 'Live',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-[#0d121f] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen select-none z-30 transition-colors duration-150">
      {/* Top Header Logo & Badge */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
            SE
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              SE Ranking
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                Admin
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Control Panel</div>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <div className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {section.title}
            </div>
            <div className="space-y-0.5 pt-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all group ${
                      isActive
                        ? 'bg-violet-600/10 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                        {item.badge}
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
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/80 dark:bg-[#090d16]">
        {/* Switch back to regular user workspace */}
        <Link
          href="/projects"
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Client Workspace</span>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>

        {/* User Profile Bar */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden text-left">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.fullName || user?.email?.split('@')[0] || 'Administrator'}
              </div>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                {user?.role || 'OWNER'}
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
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Sign out of Admin Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
