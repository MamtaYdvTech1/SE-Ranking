'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HelpCircle,
  Bell,
  MoreHorizontal,
  Menu,
  Sparkles,
  CreditCard,
  Compass,
  Bug,
  BookOpen,
  Gift,
  ExternalLink,
  X,
  Plus,
  Check,
  RotateCcw,
  Settings,
  Users,
  DollarSign,
  LogOut,
  Lightbulb,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../providers/AppProviders';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { appWrapData } from '@/lib/appWrapData';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { ReportBugModal } from '@/components/modals/ReportBugModal';
import { GlobalShadowGuide } from '@/components/ui/GlobalShadowGuide';
import { AppsDropdown } from '@/components/layout/AppsDropdown';

export interface HeaderTab {
  id: string;
  label: string;
  href: string;
}

const ALL_AVAILABLE_TOOLS: HeaderTab[] = [
  { id: 'rankings', label: 'Rankings', href: '/rankings' },
  { id: 'website-audit', label: 'Website Audit (Projects)', href: '/audit' },
  { id: 'all-locations', label: 'All Locations', href: '/local-marketing?tab=all-locations' },
  { id: 'all-projects', label: 'All Projects', href: '/projects' },
  { id: 'backlink-gap', label: 'Backlink Gap Analyzer', href: '/backlinks' },
  { id: 'local-rankings', label: 'Local Rankings', href: '/local-marketing?tab=overview' },
  { id: 'reviews', label: 'Reviews', href: '/local-marketing?tab=reviews' },
  { id: 'competitive-research', label: 'Competitive Research', href: '/research' },
  { id: 'ai-search', label: 'AI Search', href: '/research/ai-search' },
  { id: 'keyword-research', label: 'Keyword Research', href: '/research?tab=keywords' },
  { id: 'content-marketing', label: 'Content Marketing', href: '/content-marketing' },
  { id: 'report-builder', label: 'Report Builder', href: '/admin.reports.list.html' },
  { id: 'agency-pack', label: 'Agency Pack (White Label)', href: '/agency-pack' },
];

const DEFAULT_TABS: HeaderTab[] = [
  { id: 'rankings', label: 'Rankings', href: '/rankings' },
  { id: 'website-audit', label: 'Website Audit (Projects)', href: '/audit' },
  { id: 'all-locations', label: 'All Locations', href: '/local-marketing?tab=all-locations' },
  { id: 'all-projects', label: 'All Projects', href: '/projects' },
  { id: 'backlink-gap', label: 'Backlink Gap Analyzer', href: '/backlinks' },
  { id: 'local-rankings', label: 'Local Rankings', href: '/local-marketing?tab=overview' },
  { id: 'reviews', label: 'Reviews', href: '/local-marketing?tab=reviews' },
];

export function TopHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileDrawerOpen, setIsMobileDrawerOpen } = useApp();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [localEmail, setLocalEmail] = useState('');
  const [localName, setLocalName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('user_email');
      const name = localStorage.getItem('user_name');
      if (email) setLocalEmail(email);
      if (name) setLocalName(name);
    }
  }, []);

  // Dynamic User Profile derived from real authentication context with local fallback
  const displayEmail = user?.email || localEmail || 'admin@seranking.com';
  const displayName = user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (localName || displayEmail.split('@')[0]));
  const displayInitials = (displayName || 'UR')
    .split(' ')
    .map((w: string) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'UR';

  const userProfile = {
    name: displayName,
    email: displayEmail,
    id: user?.id || 'default',
    initials: displayInitials,
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    try {
      await logout();
    } catch {
      // fallback
    }
    router.push('/');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // Dropdown states
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddTabOpen, setIsAddTabOpen] = useState(false);

  // Tabs state with localStorage persistence
  const [favoriteTabs, setFavoriteTabs] = useState<HeaderTab[]>(DEFAULT_TABS);
  const [hoveredCloseTabId, setHoveredCloseTabId] = useState<string | null>(null);

  // Modals
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Dropdown container refs
  const appsRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const addTabRef = useRef<HTMLDivElement>(null);

  // Load favorite tabs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('seranking_favorite_tabs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFavoriteTabs(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveTabs = (tabs: HeaderTab[]) => {
    setFavoriteTabs(tabs);
    try {
      localStorage.setItem('seranking_favorite_tabs', JSON.stringify(tabs));
    } catch {
      // ignore
    }
  };

  const handleRemoveTab = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = favoriteTabs.filter((t) => t.id !== id);
    saveTabs(updated);
  };

  const handleAddTab = (tool: HeaderTab) => {
    if (!favoriteTabs.some((t) => t.id === tool.id)) {
      const updated = [...favoriteTabs, tool];
      saveTabs(updated);
    }
    setIsAddTabOpen(false);
  };

  const handleRestoreDefaultTabs = () => {
    saveTabs(DEFAULT_TABS);
    setIsAddTabOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (appsRef.current && !appsRef.current.contains(target)) {
        setIsAppsOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(target)) {
        setIsHelpOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (addTabRef.current && !addTabRef.current.contains(target)) {
        setIsAddTabOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="h-[44px] bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] dark:from-[#0d121f] dark:via-[#16172e] dark:to-[#0f172a] text-white flex items-center justify-between px-3 z-40 select-none shrink-0 relative shadow-xs dark:border-b dark:border-slate-800/80 transition-colors duration-150">
      {/* ==================== LEFT SECTION: Mobile Toggle, Apps Menu, Logo, Favorite Tabs ==================== */}
      <div className="flex items-center gap-2 h-full min-w-0">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          className="lg:hidden p-1 rounded hover:bg-white/10 text-white cursor-pointer"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* 9-dots Apps Menu */}
        <div ref={appsRef} className="relative h-full flex items-center">
          <button
            onClick={() => {
              setIsAppsOpen(!isAppsOpen);
              setIsHelpOpen(false);
              setIsNotificationsOpen(false);
              setIsProfileOpen(false);
              setIsAddTabOpen(false);
            }}
            className={`flex items-center justify-center w-7 h-7 rounded transition-colors cursor-pointer ${
              isAppsOpen ? 'bg-white/20 text-white shadow-xs' : 'text-white/90 hover:bg-white/10'
            }`}
            title="SE Ranking Apps"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
              <circle cx="2.5" cy="2.5" r="1.5" />
              <circle cx="8" cy="2.5" r="1.5" />
              <circle cx="13.5" cy="2.5" r="1.5" />
              <circle cx="2.5" cy="8" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="13.5" cy="8" r="1.5" />
              <circle cx="2.5" cy="13.5" r="1.5" />
              <circle cx="8" cy="13.5" r="1.5" />
              <circle cx="13.5" cy="13.5" r="1.5" />
            </svg>
          </button>

          {/* Apps Switcher Dropdown */}
          <AppsDropdown
            isOpen={isAppsOpen}
            onClose={() => setIsAppsOpen(false)}
            activeApp="ranking"
            className="left-0 top-[calc(100%+6px)]"
          />
        </div>

        {/* Official Real SE Ranking Logo */}
        <Link href="/" className="flex items-center hover:opacity-95 mr-2 shrink-0">
          <SeRankingLogo variant="white" width={110} height={26} />
        </Link>

        {/* Favorite Navigation Tabs with Hover X and 'Remove from Favorites' Tooltip */}
        <nav className="hidden md:flex items-center h-full gap-0.5 overflow-x-auto no-scrollbar">
          {favoriteTabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href.startsWith('/website-audit') && pathname.startsWith('/website-audit')) ||
              (tab.href.startsWith('/audit') && pathname.startsWith('/audit')) ||
              (tab.href.startsWith('/local-marketing') && pathname.startsWith('/local-marketing') && !pathname.includes('/reviews') && !tab.href.includes('/reviews')) ||
              (tab.href.includes('/reviews') && pathname.includes('/reviews')) ||
              (tab.href.startsWith('/projects') && (pathname === '/projects' || pathname.startsWith('/project-overview'))) ||
              (tab.href.startsWith('/backlinks') && pathname.startsWith('/backlinks'));

            return (
              <div
                key={tab.id}
                className="relative group flex items-center h-full"
              >
                <Link
                  href={tab.href}
                  className={`relative flex items-center h-full px-2.5 py-1 text-[13px] font-medium transition-all cursor-pointer rounded-[4px] whitespace-nowrap ${
                    isActive
                      ? 'bg-white/15 dark:bg-purple-600/30 text-white font-semibold shadow-xs'
                      : 'text-white/80 dark:text-slate-300 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="pr-3.5">{tab.label}</span>
                </Link>

                {/* Close X Button - appears at upper corner on hover */}
                <button
                  type="button"
                  onClick={(e) => handleRemoveTab(tab.id, e)}
                  onMouseEnter={() => setHoveredCloseTabId(tab.id)}
                  onMouseLeave={() => setHoveredCloseTabId(null)}
                  className="absolute right-0.5 top-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                  title="Remove from Favorites"
                >
                  <X className="w-2.5 h-2.5 stroke-[2.5]" />
                </button>

                {/* Exact Tooltip : "Remove from Favorites" with downward arrow right above X */}
                {hoveredCloseTabId === tab.id && (
                  <div className="absolute -top-7 right-0 bg-[#1E293B] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none flex flex-col items-center">
                    <span>Remove from Favorites</span>
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#1E293B] -mb-1 mt-0.5" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ==================== RIGHT SECTION: Lightbulb, Help, Notifications, Three-dots Profile ==================== */}
      <div className="flex items-center gap-1.5 h-full shrink-0">
        {/* Subtle vertical separator matching real SE Ranking */}
        <div className="h-4 w-[1px] bg-white/25 mx-0.5 shrink-0" />

        {/* Lightbulb Tips / Quick-start guide Button */}
        <div className="relative group/lightbulb flex items-center">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('seranking_start_tour'));
              }
              setIsGuideModalOpen(true);
              setIsHelpOpen(false);
              setIsNotificationsOpen(false);
              setIsProfileOpen(false);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Quick-start guide"
          >
            <Lightbulb className="w-4 h-4" />
          </button>

          {/* Exact Tooltip : "Quick-start guide" below bulb */}
          <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#2D3748] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none hidden group-hover/lightbulb:flex flex-col items-center animate-in fade-in duration-100">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[4px] border-b-[#2D3748] absolute -top-1" />
            <span>Quick-start guide</span>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <div className="relative group/theme flex items-center">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-7 h-7 flex items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-white" />
            )}
          </button>
          <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#2D3748] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none hidden group-hover/theme:flex flex-col items-center animate-in fade-in duration-100">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[4px] border-b-[#2D3748] absolute -top-1" />
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </div>
        </div>

        {/* Help Center Button: only ? icon matching SE Ranking */}
        <div ref={helpRef} className="relative h-full flex items-center">
          <button
            type="button"
            onClick={() => {
              setIsHelpOpen(!isHelpOpen);
              setIsAppsOpen(false);
              setIsNotificationsOpen(false);
              setIsProfileOpen(false);
              setIsAddTabOpen(false);
            }}
            className={`w-7 h-7 flex items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer ${
              isHelpOpen ? 'bg-white/20 text-white' : ''
            }`}
            title="Help Center & Knowledge Base"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4 text-white" />
          </button>

          {isHelpOpen && (
            <div className="absolute right-0 top-[calc(100%+3px)] w-60 bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700/80 text-gray-800 dark:text-slate-200 z-50 p-1.5 text-xs animate-in fade-in duration-100 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 mb-1">
                Help &amp; Guidance
              </div>

              {/* Prominent Help Center Card linking to /help */}
              <Link
                href="/help"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsHelpOpen(false)}
                className="flex items-center justify-between p-2.5 bg-[#F5F3FF] dark:bg-purple-950/40 hover:bg-[#EDE9FE] dark:hover:bg-purple-900/50 text-[#7C3AED] dark:text-purple-300 font-semibold rounded-lg transition-colors cursor-pointer group mb-1 border border-[#DDD6FE] dark:border-purple-800/60"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#7C3AED] dark:group-hover:text-purple-300 leading-tight">Help Center</div>
                    <div className="text-[10px] text-gray-500 dark:text-slate-400 font-normal">Knowledge Base, Guides &amp; FAQ</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-300 shrink-0" />
              </Link>

              <button
                onClick={() => {
                  setIsHelpOpen(false);
                  setIsGuideModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-purple-300 font-medium transition-colors text-left cursor-pointer rounded-lg"
              >
                <Compass className="w-4 h-4 text-emerald-500" />
                <span>Quick-start guide</span>
              </button>

              <button
                onClick={() => {
                  setIsHelpOpen(false);
                  setIsBugModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 dark:text-slate-300 hover:bg-red-50/70 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors text-left cursor-pointer rounded-lg"
              >
                <Bug className="w-4 h-4 text-red-500" />
                <span>Report a bug</span>
              </button>

              <Link
                href="/whats-new"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsHelpOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-purple-300 font-medium transition-colors cursor-pointer border-t border-gray-100 dark:border-slate-800 mt-1 pt-1.5 group rounded-lg"
              >
                <div className="flex items-center gap-2.5">
                  <Gift className="w-4 h-4 text-amber-500 group-hover:text-[#7C3AED] dark:group-hover:text-purple-300" />
                  <span>What&apos;s new</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 dark:text-slate-400 group-hover:text-[#7C3AED] dark:group-hover:text-purple-300" />
              </Link>
            </div>
          )}
        </div>

        {/* Notification Bell with clean red indicator dot */}
        <div ref={notificationsRef} className="relative h-full flex items-center">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsAppsOpen(false);
              setIsHelpOpen(false);
              setIsProfileOpen(false);
              setIsAddTabOpen(false);
            }}
            className={`w-7 h-7 flex items-center justify-center rounded-full relative transition-colors cursor-pointer ${
              isNotificationsOpen ? 'bg-white/20 text-white shadow-xs' : 'text-white/90 hover:text-white hover:bg-white/10'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF3B30] rounded-full ring-2 ring-[#7C3AED]" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-[calc(100%+3px)] w-80 bg-white dark:bg-[#111827] rounded-lg shadow-xl border border-gray-200 dark:border-slate-700/80 text-gray-800 dark:text-slate-200 z-50 p-4 text-xs animate-in fade-in duration-100 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
              <div className="font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-2 mb-2.5 flex items-center justify-between">
                <span>Notifications</span>
                <span className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 px-2 py-0.5 rounded text-[10px] font-bold">
                  {appWrapData.notifications.unread_total} New
                </span>
              </div>
              <div className="p-3 bg-[#F5F3FF] dark:bg-purple-950/40 rounded-lg border border-[#DDD6FE] dark:border-purple-800/60 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-200 font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                  <span>System Status</span>
                </div>
                <p className="text-gray-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  All SEO tracking modules and keyword research databases are operational and up-to-date.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User Profile matching exact three-dots button and dropdown from */}
        <div ref={profileRef} id="tour-user-dropdown" className="relative h-full flex items-center">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsAppsOpen(false);
              setIsHelpOpen(false);
              setIsNotificationsOpen(false);
              setIsAddTabOpen(false);
            }}
            className={`w-8 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
              isProfileOpen ? 'bg-white/20 text-white shadow-xs' : 'hover:bg-white/10 text-white'
            }`}
            title="Account & Settings"
          >
            <MoreHorizontal className="w-4 h-4 text-white" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-[calc(100%+4px)] w-56 bg-white dark:bg-[#111827] rounded-lg shadow-2xl border border-gray-100 dark:border-slate-700/80 text-[#2C3E50] dark:text-slate-200 z-50 py-1.5 text-sm animate-in fade-in duration-100 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800 mb-1">
                <div className="text-[13px] font-semibold text-[#1E293B] dark:text-white truncate">
                  {userProfile.name}
                </div>
                {userProfile.email && (
                  <div className="text-[11px] text-gray-500 dark:text-slate-400 font-normal truncate">
                    {userProfile.email}
                  </div>
                )}
              </div>

              <div className="py-0.5">
                <Link
                  href="/admin.user.settings.html"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-[#2C3E50] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-purple-300 text-[13px] font-normal transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#2C3E50] dark:text-slate-400 shrink-0" strokeWidth={1.75} />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/users"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-[#2C3E50] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-purple-300 text-[13px] font-normal transition-colors"
                >
                  <Users className="w-4 h-4 text-[#2C3E50] dark:text-slate-400 shrink-0" strokeWidth={1.75} />
                  <span>Users</span>
                </Link>
                <Link
                  href="/agency-pack?tab=interface-customization"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-[#2C3E50] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-purple-300 text-[13px] font-normal transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-[#2C3E50] dark:text-slate-400 shrink-0" strokeWidth={1.75} />
                  <span>White Label</span>
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-[#2C3E50] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-purple-300 text-[13px] font-normal transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-[#2C3E50] dark:text-slate-400 shrink-0" strokeWidth={1.75} />
                  <span>Billing</span>
                </Link>
                <Link
                  href="/bonus-offers"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-[#2C3E50] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-purple-300 text-[13px] font-normal transition-colors"
                >
                  <Gift className="w-4 h-4 text-[#2C3E50] dark:text-slate-400 shrink-0" strokeWidth={1.75} />
                  <span>Bonus Offers</span>
                </Link>
                <Link
                  href="/affiliate"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-[#2C3E50] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-purple-300 text-[13px] font-normal transition-colors"
                >
                  <DollarSign className="w-4 h-4 text-[#2C3E50] dark:text-slate-400 shrink-0" strokeWidth={1.75} />
                  <span>Affiliate Program</span>
                </Link>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-4 py-2 text-[#2C3E50] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-purple-300 text-[13px] font-normal transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
                    ) : (
                      <Moon className="w-4 h-4 text-[#2C3E50] dark:text-slate-400" strokeWidth={1.75} />
                    )}
                    <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50">
                    {theme}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-[#2C3E50] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-purple-300 text-[13px] font-normal transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-[#2C3E50] dark:text-slate-400 shrink-0" strokeWidth={1.75} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Modals triggered from TopHeader */}
      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />

      <GlobalShadowGuide
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </header>
  );
}
