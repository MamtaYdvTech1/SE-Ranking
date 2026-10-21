'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Check,
  Menu,
  X,
  Target,
  Building,
  Users,
  BarChart3,
  Key,
  Search,
  FileSearch,
  Layers,
  Globe,
  Sparkles,
  Bot,
  FileText,
  Megaphone,
  Radio,
  GraduationCap,
  CreditCard,
  Code2,
  Globe2,
  Award,
  Sun,
  Moon,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { getTranslation } from '@/lib/i18n/translations';
import { AppsDropdown } from '@/components/layout/AppsDropdown';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export const headerLanguages = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'ua', label: 'Українська' },
  { code: 'ru', label: 'Русский' },
  { code: 'あ', label: '日本語' },
];

export interface MarketingHeaderProps {
  currentLang?: string;
  onLangChange?: (code: string) => void;
  onTourClick?: () => void;
  activeNav?: 'solutions' | 'tools' | 'resources' | 'pricing' | 'api-mcp';
}

export function MarketingHeader({
  currentLang,
  onLangChange,
  onTourClick,
  activeNav,
}: MarketingHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Internal language state synchronized with localStorage and window events
  const [selectedLang, setSelectedLang] = useState<string>(() => {
    if (currentLang) return currentLang;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('seranking_lang');
        if (saved) return saved;
      } catch (e) {
        // ignore
      }
    }
    return 'en';
  });

  // Keep internal state updated if prop changes
  useEffect(() => {
    if (currentLang && currentLang !== selectedLang) {
      setSelectedLang(currentLang);
    }
  }, [currentLang, selectedLang]);

  // Sync with localStorage & custom events from other components/pages
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('seranking_lang');
        if (saved && saved !== selectedLang) {
          setSelectedLang(saved);
        }
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('seranking_lang_change', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('seranking_lang_change', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [selectedLang]);

  const handleLanguageChange = (code: string) => {
    setSelectedLang(code);
    try {
      localStorage.setItem('seranking_lang', code);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = code === 'あ' ? 'ja' : code;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('seranking_lang_change', { detail: { lang: code } }));
      }
    } catch (e) {
      // ignore
    }
    if (onLangChange) {
      onLangChange(code);
    }
  };

  // Translation bundle
  const t = getTranslation(selectedLang);

  // Active Dropdown state for Desktop Navigation
  const [activeMenu, setActiveMenu] = useState<
    'suite' | 'solutions' | 'tools' | 'resources' | 'pricing' | 'api-mcp' | 'lang' | null
  >(null);

  // Sub-tabs inside dropdowns
  const [solutionsSubTab, setSolutionsSubTab] = useState<'business-type' | 'migrate'>('business-type');
  const [toolsSubTab, setToolsSubTab] = useState<
    'core-seo' | 'ai-search' | 'other-seo' | 'agency-pack' | 'content-marketing'
  >('core-seo');
  const [resourcesSubTab, setResourcesSubTab] = useState<'education' | 'customer-hub'>('education');
  const [apiSubTab, setApiSubTab] = useState<'api' | 'mcp'>('api');

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth & Theme states
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isLoggedIn = Boolean(user);

  // Header ref for click-outside
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const handleProjectsNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push('/projects');
    } else {
      router.push('/login?redirect=/projects');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleTourAction = () => {
    if (onTourClick) {
      onTourClick();
    } else {
      router.push('/login?redirect=/projects');
    }
  };

  const isPricingActive = activeNav === 'pricing' || pathname === '/pricing';

  return (
    <header ref={headerRef} className="sticky top-0 bg-white dark:bg-[#0d121f] z-40 transition-colors duration-150 border-b border-gray-100 dark:border-slate-800 select-none shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6 h-full">
          {/* 9-Dots Suite Switcher Button & Dropdown */}
          <div
            className="relative py-2"
            onMouseEnter={() => setActiveMenu('suite')}
            onMouseLeave={() => setActiveMenu(null)}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'suite' ? null : 'suite')}
              className="w-8 h-8 rounded-lg bg-[#f3f4f6] dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200/50 dark:border-slate-700/60 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="App Switcher"
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="1" width="3.5" height="3.5" rx="0.8" className="fill-[#4B5563] dark:fill-slate-300" />
                <rect x="7.25" y="1" width="3.5" height="3.5" rx="0.8" className="fill-[#4B5563] dark:fill-slate-300" />
                <rect x="13.5" y="1" width="3.5" height="3.5" rx="0.8" className="fill-[#4B5563] dark:fill-slate-300" />
                <rect x="1" y="7.25" width="3.5" height="3.5" rx="0.8" className="fill-[#4B5563] dark:fill-slate-300" />
                <rect x="7.25" y="7.25" width="3.5" height="3.5" rx="0.8" className="fill-[#4B5563] dark:fill-slate-300" />
                <rect x="13.5" y="7.25" width="3.5" height="3.5" rx="0.8" className="fill-[#4B5563] dark:fill-slate-300" />
                <rect x="1" y="13.5" width="3.5" height="3.5" rx="0.8" className="fill-[#4B5563] dark:fill-slate-300" />
                <rect x="7.25" y="13.5" width="3.5" height="3.5" rx="0.8" className="fill-[#4B5563] dark:fill-slate-300" />
                <rect x="13.5" y="13.5" width="3.5" height="3.5" rx="0.8" className="fill-[#4B5563] dark:fill-slate-300" />
              </svg>
            </button>

            {/* Apps Switcher Dropdown */}
            <AppsDropdown
              isOpen={activeMenu === 'suite'}
              onClose={() => setActiveMenu(null)}
              activeApp="ranking"
              className="left-0 top-[calc(100%+6px)]"
            />
          </div>

          {/* SE Ranking Logo: Dark text in light mode, white text in dark mode */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <SeRankingLogo variant={theme === 'dark' ? 'white' : 'dark'} width={130} height={28} />
          </Link>

          {/* Desktop Navigation Links & Dropdowns */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-[14px] font-medium text-gray-900 dark:text-slate-200 h-full">
            {/* 1. Solutions Dropdown */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu('solutions')}
              onMouseLeave={() => setActiveMenu(null)}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'solutions' ? null : 'solutions')}
                className={`flex items-center gap-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  activeMenu === 'solutions' ? 'text-[#7C3AED]' : 'hover:text-[#7C3AED]'
                }`}
              >
                <span>{t.nav.solutions}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                    activeMenu === 'solutions' ? 'rotate-180 text-[#7C3AED]' : ''
                  }`}
                />
              </button>

              {activeMenu === 'solutions' && (
                <div className="absolute top-[44px] left-0 pt-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="w-[420px] bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 text-gray-800 dark:text-slate-200 p-2 flex gap-2 h-fit">
                    {/* Left Column */}
                    <div className="w-44 space-y-0.5 pr-2 border-r border-gray-100 dark:border-slate-800 flex flex-col justify-between">
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => setSolutionsSubTab('business-type')}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            solutionsSubTab === 'business-type'
                              ? 'bg-[#E0F2FE] dark:bg-purple-950/50 text-[#0f172a] dark:text-purple-200'
                              : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80'
                          }`}
                        >
                          <span>{t.nav.byBusinessType || 'By business type'}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </button>

                        <a
                          href="https://seranking.com/solutions.html"
                          target="_blank"
                          rel="noreferrer"
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>{t.nav.bySeoGoals || 'By SEO goals'}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </a>
                      </div>

                      <a
                        href="https://seranking.com/migration.html"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/80 flex items-center justify-between transition-colors cursor-pointer border-t border-gray-100 dark:border-slate-800 pt-1.5"
                      >
                        <span>{t.nav.migrateToSeRanking || 'Migrate to SE Ranking'}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </a>
                    </div>

                    {/* Right Column */}
                    <div className="flex-1 space-y-0.5 pl-0.5">
                      <Link
                        href="/for-agencies"
                        onClick={() => setActiveMenu(null)}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 dark:hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-md bg-[#F5F3FF] dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center shrink-0">
                          <Target className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-normal text-gray-800 dark:text-slate-200 group-hover:text-[#7C3AED] dark:group-hover:text-purple-300">
                          {t.nav.agencies || 'Agencies'}
                        </span>
                      </Link>

                      <Link
                        href="/enterprise"
                        onClick={() => setActiveMenu(null)}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 dark:hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-md bg-[#F5F3FF] dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center shrink-0">
                          <Building className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-normal text-gray-800 dark:text-slate-200 group-hover:text-[#7C3AED] dark:group-hover:text-purple-300">
                          {t.nav.enterprises || 'Enterprises'}
                        </span>
                      </Link>

                      <Link
                        href="/growing-business"
                        onClick={() => setActiveMenu(null)}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 dark:hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-md bg-[#F5F3FF] dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-normal text-gray-800 dark:text-slate-200 group-hover:text-[#7C3AED] dark:group-hover:text-purple-300">
                          {t.nav.growingBusiness || 'Growing business'}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Tools Dropdown */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu('tools')}
              onMouseLeave={() => setActiveMenu(null)}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'tools' ? null : 'tools')}
                className={`flex items-center gap-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  activeMenu === 'tools' ? 'text-[#7C3AED]' : 'hover:text-[#7C3AED]'
                }`}
              >
                <span>{t.nav.tools}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                    activeMenu === 'tools' ? 'rotate-180 text-[#7C3AED]' : ''
                  }`}
                />
              </button>

              {activeMenu === 'tools' && (
                <div className="absolute top-[44px] -left-12 pt-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="w-[510px] bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 text-gray-800 dark:text-slate-200 p-2 flex gap-2">
                    {/* Left Column (Categories) */}
                    <div className="w-48 space-y-0.5 pr-1.5 border-r border-gray-100 dark:border-slate-800">
                      <button
                        type="button"
                        onMouseEnter={() => setToolsSubTab('core-seo')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          toolsSubTab === 'core-seo'
                            ? 'bg-[#E0F2FE] dark:bg-purple-950/50 text-[#0f172a] dark:text-purple-200'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span>{t.nav.coreSeoTools || 'Core SEO tools'}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>

                      <button
                        type="button"
                        onMouseEnter={() => setToolsSubTab('ai-search')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          toolsSubTab === 'ai-search'
                            ? 'bg-[#E0F2FE] dark:bg-purple-950/50 text-[#0f172a] dark:text-purple-200'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span>{t.nav.aiSearchTools || 'AI Search tools'}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>

                      <button
                        type="button"
                        onMouseEnter={() => setToolsSubTab('other-seo')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          toolsSubTab === 'other-seo'
                            ? 'bg-[#E0F2FE] dark:bg-purple-950/50 text-[#0f172a] dark:text-purple-200'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span>{t.nav.otherSeoTools || 'Other SEO tools'}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>

                      <button
                        type="button"
                        onMouseEnter={() => setToolsSubTab('agency-pack')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          toolsSubTab === 'agency-pack'
                            ? 'bg-[#E0F2FE] dark:bg-purple-950/50 text-[#0f172a] dark:text-purple-200'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span>{t.nav.agencyPack || 'Agency Pack'}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>

                      <button
                        type="button"
                        onMouseEnter={() => setToolsSubTab('content-marketing')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          toolsSubTab === 'content-marketing'
                            ? 'bg-[#E0F2FE] dark:bg-purple-950/50 text-[#0f172a] dark:text-purple-200'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span>{t.nav.contentMarketing || 'Content Marketing'}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>

                      <Link
                        href="/local-marketing"
                        onClick={() => setActiveMenu(null)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>{t.nav.localMarketing || 'Local Marketing'}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </Link>

                      <Link
                        href="/api-docs"
                        onClick={() => setActiveMenu(null)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>{t.nav.integrations || 'Integrations'}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </Link>
                    </div>

                    {/* Right Column */}
                    <div className="flex-1 space-y-0.5 pl-0.5">
                      {toolsSubTab === 'core-seo' && (
                        <>
                          <Link
                            href="/keyword-rank-tracker"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <BarChart3 className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              Rank Tracker
                            </span>
                          </Link>

                          <Link
                            href="/keyword-tool"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <Key className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              Keyword Research
                            </span>
                          </Link>

                          <Link
                            href="/on-page-seo-checker"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <Search className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              On-Page SEO Checker
                            </span>
                          </Link>

                          <Link
                            href="/website-audit-tool"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <FileSearch className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              Website Audit
                            </span>
                          </Link>

                          <Link
                            href="/competitor-analysis-tool"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <Layers className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              Competitor Analysis
                            </span>
                          </Link>

                          <Link
                            href="/backlink-checker"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <Globe className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              Backlink Checker
                            </span>
                          </Link>
                        </>
                      )}

                      {toolsSubTab === 'ai-search' && (
                        <>
                          <Link
                            href="/research/ai-search"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              AI Search Overview
                            </span>
                          </Link>
                          <Link
                            href="/research/ai-search"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <Bot className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              AI Visibility Tracker
                            </span>
                          </Link>
                        </>
                      )}

                      {toolsSubTab === 'other-seo' && (
                        <>
                          <Link
                            href="/website-audit/serp-analyzer"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              SERP Analyzer
                            </span>
                          </Link>
                          <Link
                            href="/page-changes"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <Globe className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              Page Changes Monitor
                            </span>
                          </Link>
                        </>
                      )}

                      {toolsSubTab === 'agency-pack' && (
                        <>
                          <Link
                            href="/agency-pack"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                              <Award className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              Agency Pack &amp; White Label
                            </span>
                          </Link>
                          <Link
                            href="/reports"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              SEO Report Generator
                            </span>
                          </Link>
                        </>
                      )}

                      {toolsSubTab === 'content-marketing' && (
                        <Link
                          href="/content-marketing"
                          onClick={() => setActiveMenu(null)}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                            Content Marketing Tool
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Resources Dropdown */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu('resources')}
              onMouseLeave={() => setActiveMenu(null)}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'resources' ? null : 'resources')}
                className={`flex items-center gap-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  activeMenu === 'resources' ? 'text-[#7C3AED]' : 'hover:text-[#7C3AED]'
                }`}
              >
                <span>{t.nav.resources}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                    activeMenu === 'resources' ? 'rotate-180 text-[#7C3AED]' : ''
                  }`}
                />
              </button>

              {activeMenu === 'resources' && (
                <div className="absolute top-[44px] left-0 pt-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="w-[430px] bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 text-gray-800 dark:text-slate-200 p-2 flex gap-2">
                    {/* Left Column */}
                    <div className="w-44 space-y-0.5 pr-2 border-r border-gray-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setResourcesSubTab('education')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          resourcesSubTab === 'education'
                            ? 'bg-[#E0F2FE] dark:bg-purple-950/50 text-[#0f172a] dark:text-purple-200'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span>{t.nav.education || 'Education'}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setResourcesSubTab('customer-hub')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          resourcesSubTab === 'customer-hub'
                            ? 'bg-[#E0F2FE] dark:bg-purple-950/50 text-[#0f172a] dark:text-purple-200'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span>{t.nav.customerHub || 'Customer Hub'}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>

                      <a
                        href="https://seranking.com/agency-catalog/"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>{t.nav.agencyCatalog || 'Agency Catalog'}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </a>
                    </div>

                    {/* Right Column */}
                    <div className="flex-1 space-y-0.5 pl-0.5">
                      {resourcesSubTab === 'education' ? (
                        <>
                          <Link
                            href="/landing"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              {t.nav.blog || 'Blog'}
                            </span>
                          </Link>

                          <Link
                            href="/landing"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <Megaphone className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              {t.nav.webinars || 'Webinars'}
                            </span>
                          </Link>

                          <Link
                            href="/podcast"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <Radio className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              {t.nav.podcast || 'Podcast'}
                            </span>
                          </Link>

                          <Link
                            href="/academy"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <GraduationCap className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              {t.nav.academy || 'Academy'}
                            </span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/help"
                            className="px-2.5 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <Globe className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              {t.nav.helpCenter || 'Help Center'}
                            </span>
                          </Link>
                          <Link
                            href="/landing"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <Award className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              {t.nav.caseStudies || 'Case Studies'}
                            </span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Pricing Dropdown - Fully Translated! */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu('pricing')}
              onMouseLeave={() => setActiveMenu(null)}
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href="/pricing"
                className={`flex items-center gap-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  activeMenu === 'pricing' || isPricingActive ? 'text-[#7C3AED]' : 'hover:text-[#7C3AED]'
                }`}
              >
                <span>{t.nav.pricing}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                    activeMenu === 'pricing' ? 'rotate-180 text-[#7C3AED]' : ''
                  }`}
                />
              </Link>

              {activeMenu === 'pricing' && (
                <div className="absolute top-[44px] left-0 pt-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="w-48 bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 text-gray-800 dark:text-slate-200 p-1.5 space-y-0.5">
                    <Link
                      href="/pricing"
                      onClick={() => setActiveMenu(null)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 dark:hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-md bg-[#F5F3FF] dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center shrink-0">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-normal text-gray-800 dark:text-slate-200 group-hover:text-[#7C3AED] dark:group-hover:text-purple-300">
                        {t.nav.platformPlans || 'Platform plans'}
                      </span>
                    </Link>

                    <Link
                      href="/pricing"
                      onClick={() => setActiveMenu(null)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 dark:hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-md bg-[#F5F3FF] dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center shrink-0">
                        <Code2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-normal text-gray-800 dark:text-slate-200 group-hover:text-[#7C3AED] dark:group-hover:text-purple-300">
                        {t.nav.apiPlans || 'API Plans'}
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 5. API & MCP Dropdown */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveMenu('api-mcp')}
              onMouseLeave={() => setActiveMenu(null)}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === 'api-mcp' ? null : 'api-mcp')}
                className={`flex items-center gap-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  activeMenu === 'api-mcp' ? 'text-[#7C3AED]' : 'hover:text-[#7C3AED]'
                }`}
              >
                <span>{t.nav.apiMcp}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                    activeMenu === 'api-mcp' ? 'rotate-180 text-[#7C3AED]' : ''
                  }`}
                />
              </button>

              {activeMenu === 'api-mcp' && (
                <div className="absolute top-[44px] -left-20 pt-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="w-[430px] bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 text-gray-800 dark:text-slate-200 p-2 flex gap-2">
                    {/* Left Column */}
                    <div className="w-44 space-y-0.5 pr-2 border-r border-gray-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setApiSubTab('api')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          apiSubTab === 'api'
                            ? 'bg-[#E0F2FE] dark:bg-purple-950/50 text-[#0f172a] dark:text-purple-200'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span>API</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setApiSubTab('mcp')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          apiSubTab === 'mcp'
                            ? 'bg-[#E0F2FE] dark:bg-purple-950/50 text-[#0f172a] dark:text-purple-200'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span>MCP</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>

                      <a
                        href="https://seranking.com/our-data.html"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>Our data</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </a>

                      <Link
                        href="/pricing"
                        onClick={() => setActiveMenu(null)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>API Pricing</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </Link>
                    </div>

                    {/* Right Column */}
                    <div className="flex-1 space-y-0.5 pl-0.5">
                      {apiSubTab === 'api' ? (
                        <>
                          <Link
                            href="/api-docs"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <Code2 className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              API Keys &amp; Overview
                            </span>
                          </Link>

                          <Link
                            href="/api-docs/keywords"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <Key className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              Keyword Research API
                            </span>
                          </Link>

                          <Link
                            href="/api-docs/backlinks"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <Globe className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              Backlinks API
                            </span>
                          </Link>

                          <Link
                            href="/api-docs/domains"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <Globe2 className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              Domain Analysis API
                            </span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/api-docs/mcp"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <Bot className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              SE Ranking MCP Server
                            </span>
                          </Link>

                          <Link
                            href="/api-docs"
                            onClick={() => setActiveMenu(null)}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#F5F3FF]/70 flex items-center gap-2.5 transition-colors group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-normal text-gray-800 group-hover:text-[#7C3AED]">
                              Claude Integration
                            </span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Header Navigation Items: Theme Toggle, Lang Switcher, Tour, Projects */}
        <div className="flex items-center gap-2 sm:gap-3.5 h-full">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'lang' ? null : 'lang')}
              className="px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-1 text-[13px] font-semibold text-gray-900 dark:text-slate-200 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
              title="Select language"
            >
              <span className="uppercase text-[13px] font-bold tracking-wide">
                {selectedLang === 'あ' ? 'あ' : selectedLang}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-500 dark:text-slate-400 transition-transform duration-150 ${
                  activeMenu === 'lang' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {activeMenu === 'lang' && (
              <div
                className="absolute right-0 top-[44px] z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-[165px] bg-white dark:bg-[#111827] rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 py-1.5 px-1.5 space-y-0.5 max-h-[360px] overflow-y-auto">
                  {headerLanguages.map((l) => {
                    const isActive = selectedLang.toLowerCase() === l.code.toLowerCase();
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          handleLanguageChange(l.code);
                          setActiveMenu(null);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#EBF5FF] dark:bg-purple-950/50 text-[#1351d8] dark:text-purple-300 font-bold'
                            : 'text-[#374151] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium'
                        }`}
                      >
                        <span
                          className={`uppercase font-bold text-[10px] w-6 h-4 flex items-center justify-center rounded shrink-0 ${
                            isActive
                              ? 'bg-[#1351d8] dark:bg-purple-600 text-white'
                              : 'bg-[#E5E7EB] dark:bg-slate-800 text-[#4B5563] dark:text-slate-300'
                          }`}
                        >
                          {l.code}
                        </span>
                        <span className="text-xs truncate">{l.label}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-[#1351d8] dark:text-purple-300 ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Log in / Sign in Link */}
          <Link
            href="/login"
            className="hidden sm:inline-flex text-[14px] font-semibold text-gray-800 dark:text-slate-200 hover:text-[#0B69FF] dark:hover:text-purple-400 transition-colors px-2 py-1.5 whitespace-nowrap"
          >
            {t.nav.login || 'Sign in'}
          </Link>

          {/* "See product tour" button */}
          <button
            type="button"
            onClick={handleTourAction}
            className="hidden md:inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-800 dark:text-slate-200 hover:border-gray-400 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>{t.nav.productTour || 'See product tour'}</span>
          </button>

          {/* Solid Purple CTA Button: Start free trial */}
          <Link
            href="/signup"
            className="hidden sm:inline-flex px-4 sm:px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-[13px] font-bold tracking-normal transition-all cursor-pointer shadow-xs hover:shadow-md hover:shadow-purple-200 whitespace-nowrap"
          >
            Start free trial
          </Link>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer Menu - Fully Translated with Language Picker */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-[#0d121f] text-gray-900 dark:text-slate-100 shadow-xl animate-in slide-in-from-top-2 duration-150 px-5 py-5 space-y-4">
          <nav className="flex flex-col space-y-2.5">
            <Link
              href="/for-agencies"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-semibold text-gray-900 dark:text-slate-100 hover:text-[#7C3AED] dark:hover:text-purple-400 py-1"
            >
              {t.nav.solutions}
            </Link>
            <Link
              href="/keyword-rank-tracker"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-semibold text-gray-900 dark:text-slate-100 hover:text-[#7C3AED] dark:hover:text-purple-400 py-1"
            >
              {t.nav.tools}
            </Link>
            <Link
              href="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-base font-semibold py-1 ${isPricingActive ? 'text-[#7C3AED] dark:text-purple-400' : 'text-gray-900 dark:text-slate-100 hover:text-[#7C3AED] dark:hover:text-purple-400'}`}
            >
              {t.nav.pricing}
            </Link>
            <Link
              href="/help"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-semibold text-gray-900 dark:text-slate-100 hover:text-[#7C3AED] dark:hover:text-purple-400 py-1"
            >
              {t.nav.resources}
            </Link>
            <Link
              href="/api-docs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-semibold text-gray-900 dark:text-slate-100 hover:text-[#7C3AED] dark:hover:text-purple-400 py-1"
            >
              {t.nav.apiMcp}
            </Link>
          </nav>

          {/* Mobile Theme & Language Switcher */}
          <div className="pt-3 pb-1 border-t border-gray-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Theme:
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-gray-600" />
                    <span>Light Mode</span>
                  </>
                )}
              </button>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Language ({selectedLang.toUpperCase()}):
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {headerLanguages.map((l) => {
                  const isActive = selectedLang.toLowerCase() === l.code.toLowerCase();
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        handleLanguageChange(l.code);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#1351d8] dark:bg-purple-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {l.code}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                handleTourAction();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center border border-gray-900 dark:border-slate-600 rounded-xl text-sm font-bold text-gray-900 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              {t.nav.productTour}
            </button>
            <Link
              href="/signup"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-2.5 text-center bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-sm font-bold shadow-sm cursor-pointer transition-colors"
            >
              Start free trial
            </Link>
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-gray-700 dark:text-slate-300 hover:text-[#0B69FF] dark:hover:text-purple-400 text-sm font-semibold transition-colors"
            >
              {t.nav.login || 'Sign in'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
