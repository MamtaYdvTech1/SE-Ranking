'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import {
  Settings,
  Search,
  Key,
  Sparkles,
  Users,
  BarChart3,
  X,
  ChevronDown,
  Info,
  Globe,
  Trash2,
  Check,
  Plus,
  FileText,
  Monitor,
  Smartphone,
  Folder,
  ChevronRight,
  Clock,
  ArrowUp,
  MoreVertical,
  GripVertical,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { useApp } from '@/components/providers/AppProviders';
import {
  GoogleIcon,
  ChatGptIcon,
  AiOverviewsIcon,
  AiModeIcon,
  SearchEngineIcon,
} from '@/components/ui/SearchEngineIcons';

export type WizardTab =
  | 'general'
  | 'search-engines'
  | 'keywords'
  | 'prompts'
  | 'competitors'
  | 'analytics';

import { getAllCountries, getCountryInfo } from '@/lib/countryUtils';
import { CountryFlag } from '@/components/ui/CountryFlag';

interface CountryItem {
  code: string;
  name: string;
  flag: string;
}

const COUNTRIES_LIST: CountryItem[] = getAllCountries().map((c) => ({
  code: c.flagCode,
  name: c.name,
  flag: c.code,
}));

export function SEWizardView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { projects, activeProject, refreshProjects } = useApp();

  const urlId = (params?.id as string) || searchParams.get('site_id');

  // Match route param ID, or active project from context
  const currentProject =
    (urlId ? projects.find((p) => String(p.id) === String(urlId)) : null) ||
    activeProject || {
      id: '',
      name: '',
      domain: '',
      url: '',
      country: 'India',
      countryCode: 'in',
    };

  // Tab State: supports both query param and hash (#engines, #keywords, etc.)
  const [activeTab, setActiveTab] = useState<WizardTab>('search-engines');
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  // Sync tab with URL Hash & Query
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash.includes('engines')) {
        setActiveTab('search-engines');
        if (hash.includes('google_ai_overview') || hash.includes('ai_overview') || search.includes('google_ai_overview')) {
          setSelectedEngineType('AI Overviews');
        }
      } else if (hash.includes('keyword')) {
        setActiveTab('keywords');
      } else if (hash.includes('prompt')) {
        setActiveTab('prompts');
      } else if (hash.includes('competitor')) {
        setActiveTab('competitors');
      } else if (hash.includes('analytic') || hash.includes('stats')) {
        setActiveTab('analytics');
      } else if (hash.includes('general') || hash.startsWith('#/?') || hash === '#' || hash === '') {
        setActiveTab('general');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Handle Tab Switch with authentic 300ms Shimmer Skeleton (Screenshot 2)
  const switchTab = (tab: WizardTab) => {
    if (tab === activeTab) return;
    setIsTabTransitioning(true);
    setActiveTab(tab);

    const hashSlug =
      tab === 'search-engines'
        ? '#/engines'
        : tab === 'keywords'
        ? '#/keywords'
        : tab === 'prompts'
        ? '#/prompts'
        : tab === 'competitors'
        ? '#/competitors'
        : tab === 'analytics'
        ? '#/analytics'
        : '#/general';

    const newUrl = `${window.location.pathname}?site_id=${currentProject.id}${hashSlug}?site_id=${currentProject.id}`;
    window.history.replaceState(null, '', newUrl);

    setTimeout(() => {
      setIsTabTransitioning(false);
    }, 280);
  };

  // Keyboard ESC shortcut to return to project
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/projects');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // ----------------------------------------------------
  // SEARCH ENGINES TAB STATE (Screenshot 1)
  // ----------------------------------------------------
  const [selectedEngineType, setSelectedEngineType] = useState<'Google' | 'AI Overviews' | 'AI Mode' | 'ChatGPT'>('Google');
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(COUNTRIES_LIST[0]); // India
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Search engines state from database
  const [enginesList, setEnginesList] = useState<
    Array<{
      id: string;
      engine: string;
      name?: string;
      location: string;
      country?: string;
      countryCode: string;
      language: string;
      device: string;
    }>
  >([]);
  const [engineSearchFilter, setEngineSearchFilter] = useState('');
  const [isLoadingEngines, setIsLoadingEngines] = useState(false);

  // Load real engines from database for current project
  useEffect(() => {
    if (currentProject.id) {
      setIsLoadingEngines(true);
      fetch(`/api/projects/${currentProject.id}/engines`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.engines) {
            setEnginesList(data.engines);
          }
        })
        .catch(() => null)
        .finally(() => setIsLoadingEngines(false));
    }
  }, [currentProject.id]);

  // Close country dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddSearchEngine = async () => {
    if (!currentProject.id) return;

    try {
      const res = await fetch(`/api/projects/${currentProject.id}/engines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engine: selectedEngineType.toLowerCase(),
          country: selectedCountry.name,
          countryCode: selectedCountry.code,
          location: selectedLocation || selectedCountry.name,
          device: selectedDevice,
        }),
      });

      const data = await res.json();
      if (data?.engine) {
        setEnginesList((prev) => [...prev, data.engine]);
        setSelectedLocation('');
      }
    } catch (e) {
      console.error('Failed to add search engine:', e);
    }
  };

  const handleDeleteSearchEngine = async (engineId: string) => {
    setEnginesList((prev) => prev.filter((e) => e.id !== engineId));
    if (currentProject.id) {
      await fetch(`/api/projects/${currentProject.id}/engines`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engineId }),
      }).catch(() => null);
    }
  };

  // ----------------------------------------------------
  // KEYWORDS TAB STATE (Screenshot 3 & 4)
  // ----------------------------------------------------
  const [keywordTextarea, setKeywordTextarea] = useState('');
  const [suggestKeywords, setSuggestKeywords] = useState(false);
  const [keywordGroup, setKeywordGroup] = useState('General');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Database Keywords List
  const [keywordsList, setKeywordsList] = useState<
    Array<{
      id: string;
      keyword: string;
      searchEngine: string;
      location: string;
      language: string;
      searchVolume: string;
      group: string;
    }>
  >([]);
  const [totalKeywordsCount, setTotalKeywordsCount] = useState(0);
  const [isKeywordsExpanded, setIsKeywordsExpanded] = useState(true);
  const [keywordSearchQuery, setKeywordSearchQuery] = useState('');
  const [isEngineFilterDropdownOpen, setIsEngineFilterDropdownOpen] = useState(false);
  const [engineFilterSelected, setEngineFilterSelected] = useState<string[]>(['google-in']);
  const engineFilterRef = useRef<HTMLDivElement>(null);

  // Fetch real keywords from DB
  useEffect(() => {
    if (currentProject.id) {
      fetch(`/api/projects/${currentProject.id}/keywords`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.keywords) {
            setKeywordsList(data.keywords);
            setTotalKeywordsCount(data.totalCount ?? data.keywords.length ?? 0);
          }
        })
        .catch(() => null);
    }
  }, [currentProject.id]);

  // Click outside for engine filter dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (engineFilterRef.current && !engineFilterRef.current.contains(e.target as Node)) {
        setIsEngineFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate remaining keyword limits
  const enteredLines = keywordTextarea
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const enteredCount = enteredLines.length;
  const remainingLimits = Math.max(0, 750 - totalKeywordsCount);

  const handleAddKeywords = async () => {
    if (enteredCount === 0 || !currentProject.id) return;

    try {
      const res = await fetch(`/api/projects/${currentProject.id}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: enteredLines,
          group: keywordGroup,
          countryCode: selectedCountry.code,
        }),
      });

      const data = await res.json();
      if (data?.success) {
        setKeywordsList(data.keywords || []);
        setTotalKeywordsCount(data.totalCount || (totalKeywordsCount + enteredCount));
        setKeywordTextarea('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    setKeywordsList((prev) => prev.filter((k) => k.id !== id));
    setTotalKeywordsCount((prev) => Math.max(0, prev - 1));
    await fetch(`/api/projects/${currentProject.id}/keywords`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywordId: id }),
    }).catch(() => null);
  };

  // ----------------------------------------------------
  // COMPETITORS TAB STATE & HANDLERS
  // ----------------------------------------------------
  const [competitorTextarea, setCompetitorTextarea] = useState('');
  const [competitorsList, setCompetitorsList] = useState<
    Array<{
      id: string;
      domain: string;
      name?: string;
      totalKeywords?: number;
      commonKeywordsCount?: number;
    }>
  >([]);
  const [isLoadingCompetitors, setIsLoadingCompetitors] = useState(false);
  const [isAddingCompetitors, setIsAddingCompetitors] = useState(false);

  useEffect(() => {
    if (currentProject.id) {
      setIsLoadingCompetitors(true);
      fetch(`/api/projects/${currentProject.id}/competitors`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.data) {
            setCompetitorsList(data.data);
          }
        })
        .catch(() => null)
        .finally(() => setIsLoadingCompetitors(false));
    }
  }, [currentProject.id]);

  const handleAddCompetitors = async () => {
    const lines = competitorTextarea
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0 || !currentProject.id) return;

    setIsAddingCompetitors(true);
    try {
      for (const domain of lines) {
        const res = await fetch(`/api/projects/${currentProject.id}/competitors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain }),
        });
        const data = await res.json();
        if (data?.data) {
          setCompetitorsList((prev) => {
            if (prev.some((c) => c.domain === data.data.domain)) return prev;
            return [...prev, data.data];
          });
        }
      }
      setCompetitorTextarea('');
    } catch (e) {
      console.error('Failed to add competitor:', e);
    } finally {
      setIsAddingCompetitors(false);
    }
  };

  const handleDeleteCompetitor = async (competitorId: string) => {
    setCompetitorsList((prev) => prev.filter((c) => c.id !== competitorId));
    if (currentProject.id) {
      await fetch(`/api/projects/${currentProject.id}/competitors`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: competitorId }),
      }).catch(() => null);
    }
  };

  // ----------------------------------------------------
  // GENERAL SETTINGS TAB STATE & HANDLERS
  // ----------------------------------------------------
  const [generalName, setGeneralName] = useState(currentProject.name || '');
  const [generalUrl, setGeneralUrl] = useState(
    (currentProject as any).websiteUrl || (currentProject as any).url || currentProject.domain || ''
  );
  const [generalWeeklyReport, setGeneralWeeklyReport] = useState(true);
  const [generalAudit, setGeneralAudit] = useState(true);
  const [generalBacklinks, setGeneralBacklinks] = useState(true);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [generalSaveSuccess, setGeneralSaveSuccess] = useState('');

  // Sync general settings when currentProject changes
  useEffect(() => {
    if (currentProject) {
      setGeneralName(currentProject.name || '');
      setGeneralUrl(
        (currentProject as any).websiteUrl || (currentProject as any).url || currentProject.domain || ''
      );
    }
  }, [currentProject]);

  const handleSaveGeneral = async () => {
    if (!currentProject.id) return;
    setIsSavingGeneral(true);
    setGeneralSaveSuccess('');
    try {
      const res = await fetch(`/api/projects/${currentProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: generalName,
          websiteUrl: generalUrl,
          weeklyReport: generalWeeklyReport,
          websiteAudit: generalAudit,
          backlinkReport: generalBacklinks,
        }),
      });
      if (res.ok) {
        setGeneralSaveSuccess('Settings saved successfully');
        refreshProjects();
        setTimeout(() => setGeneralSaveSuccess(''), 3000);
      }
    } catch {
      // error
    } finally {
      setIsSavingGeneral(false);
    }
  };

  // ----------------------------------------------------
  // ANALYTICS / INTEGRATIONS STATE & HANDLERS
  // ----------------------------------------------------
  const [integrationsList, setIntegrationsList] = useState<any[]>([]);

  useEffect(() => {
    if (currentProject.id) {
      fetch(`/api/integrations?projectId=${currentProject.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.availableProviders) {
            setIntegrationsList(data.availableProviders);
          }
        })
        .catch(() => null);
    }
  }, [currentProject.id]);

  const handleToggleIntegration = async (providerId: string, currentStatus: boolean) => {
    if (!currentProject.id) return;
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject.id,
          provider: providerId,
          isActive: !currentStatus,
        }),
      });
      if (res.ok) {
        setIntegrationsList((prev) =>
          prev.map((item) =>
            item.id === providerId ? { ...item, connected: !currentStatus } : item
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered country list
  const filteredCountries = COUNTRIES_LIST.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Filtered keywords list
  const filteredKeywords = keywordsList.filter((k) =>
    k.keyword.toLowerCase().includes(keywordSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full flex bg-[#F4F6F9] font-sans text-gray-900 select-none">
      {/* 1. LEFT BLUE SIDEBAR (Screenshot 1, 2, 3, 4) */}
      <aside className="w-64 sm:w-72 bg-[#1054E2] text-white flex flex-col justify-between shrink-0 shadow-lg min-h-screen">
        <div className="p-6 sm:p-7">
          {/* SE Ranking Logo */}
          <div
            className="flex items-center gap-2 mb-8 cursor-pointer"
            onClick={() => router.push('/projects')}
          >
            <SeRankingLogo variant="white" width={135} height={32} />
          </div>

          {/* Teams / Project Title */}
          <div className="mb-7">
            <h1 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight leading-snug truncate">
              {currentProject.name || 'Teams'}
            </h1>
            <p className="text-white/80 text-sm mt-0.5 font-normal tracking-wide">
              Settings
            </p>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {/* General information */}
            <button
              type="button"
              onClick={() => switchTab('general')}
              className={`w-full text-left px-4 py-3 rounded-full flex items-center gap-3.5 text-[14px] transition-all cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-white text-[#1054E2] font-bold shadow-md'
                  : 'text-white/90 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Settings className={`w-5 h-5 shrink-0 ${activeTab === 'general' ? 'text-[#1054E2]' : 'text-white'}`} />
              <span>General information</span>
            </button>

            {/* Search engines (Screenshot 1 Active) */}
            <button
              type="button"
              onClick={() => switchTab('search-engines')}
              className={`w-full text-left px-4 py-3 rounded-full flex items-center gap-3.5 text-[14px] transition-all cursor-pointer ${
                activeTab === 'search-engines'
                  ? 'bg-white text-[#1054E2] font-bold shadow-md'
                  : 'text-white/90 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Search className={`w-5 h-5 shrink-0 ${activeTab === 'search-engines' ? 'text-[#1054E2]' : 'text-white'}`} />
              <span>Search engines</span>
            </button>

            {/* Keywords (Screenshot 3 & 4 Active) */}
            <button
              type="button"
              onClick={() => switchTab('keywords')}
              className={`w-full text-left px-4 py-3 rounded-full flex items-center gap-3.5 text-[14px] transition-all cursor-pointer ${
                activeTab === 'keywords'
                  ? 'bg-white text-[#1054E2] font-bold shadow-md'
                  : 'text-white/90 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Key className={`w-5 h-5 shrink-0 ${activeTab === 'keywords' ? 'text-[#1054E2]' : 'text-white'}`} />
              <span>Keywords</span>
            </button>

            {/* Prompts */}
            <button
              type="button"
              onClick={() => switchTab('prompts')}
              className={`w-full text-left px-4 py-3 rounded-full flex items-center gap-3.5 text-[14px] transition-all cursor-pointer ${
                activeTab === 'prompts'
                  ? 'bg-white text-[#1054E2] font-bold shadow-md'
                  : 'text-white/90 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Sparkles className={`w-5 h-5 shrink-0 ${activeTab === 'prompts' ? 'text-[#1054E2]' : 'text-white'}`} />
              <span>Prompts</span>
            </button>

            {/* Competitors */}
            <button
              type="button"
              onClick={() => switchTab('competitors')}
              className={`w-full text-left px-4 py-3 rounded-full flex items-center gap-3.5 text-[14px] transition-all cursor-pointer ${
                activeTab === 'competitors'
                  ? 'bg-white text-[#1054E2] font-bold shadow-md'
                  : 'text-white/90 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Users className={`w-5 h-5 shrink-0 ${activeTab === 'competitors' ? 'text-[#1054E2]' : 'text-white'}`} />
              <span>Competitors</span>
            </button>

            {/* Statistics and Analytics services */}
            <button
              type="button"
              onClick={() => switchTab('analytics')}
              className={`w-full text-left px-4 py-3 rounded-full flex items-center gap-3.5 text-[14px] transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-[#1054E2] font-bold shadow-md'
                  : 'text-white/90 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <BarChart3 className={`w-5 h-5 shrink-0 ${activeTab === 'analytics' ? 'text-[#1054E2]' : 'text-white'}`} />
              <span>Statistics and Analytics services</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* 2. RIGHT WORKSPACE */}
      <main className="flex-1 flex flex-col justify-between bg-white min-h-screen overflow-y-auto relative">
        <div className="w-full">
          {/* Top Bar with Title, Badges and Close ESC */}
          <div className="border-b border-gray-100 flex items-center justify-between px-8 sm:px-12 py-3.5">
            <h2 className="text-lg sm:text-[20px] font-bold text-[#101423]">
              {activeTab === 'search-engines'
                ? 'Search engines'
                : activeTab === 'keywords'
                ? 'Keywords'
                : activeTab === 'prompts'
                ? 'Prompts'
                : activeTab === 'competitors'
                ? 'Competitors'
                : activeTab === 'analytics'
                ? 'Statistics and Analytics services'
                : 'General information'}
            </h2>

            <div className="flex items-center gap-4">
              {/* Keywords Limit Yellow Pill (Screenshot 3 & 4) */}
              {activeTab === 'keywords' && !isTabTransitioning && (
                <div className="bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] text-[12px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>
                    Keyword limits {totalKeywordsCount} / 750
                  </span>
                  <Info className="w-3 h-3 text-[#D97706] ml-0.5 cursor-pointer" />
                </div>
              )}

              {/* Prompt Limits Badge (Screenshot 1) */}
              {activeTab === 'prompts' && !isTabTransitioning && (
                <div className="bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] text-[12px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>
                    Prompt limits 0 / 20
                  </span>
                </div>
              )}

              {/* Competitors Limit Badge (Screenshot 2 & 3) */}
              {activeTab === 'competitors' && !isTabTransitioning && (
                <div className="bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] text-[12px] font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>
                    Competitors {competitorsList.length} / 5
                  </span>
                </div>
              )}

              {/* Close Button with ESC */}
              <button
                type="button"
                onClick={() => router.push('/projects')}
                className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer group"
                title="Close (ESC)"
              >
                <X className="w-5 h-5 stroke-[2.2] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 group-hover:text-gray-600">
                  ESC
                </span>
              </button>
            </div>
          </div>

          {/* 3. SHIMMER SKELETON LOADING STATE (Screenshot 2) */}
          {isTabTransitioning ? (
            <div className="px-8 sm:px-12 py-8 max-w-4xl space-y-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
              <div className="h-10 bg-gray-100 rounded-md w-full" />
              <div className="h-10 bg-gray-100 rounded-md w-full" />
              <div className="h-10 bg-gray-100 rounded-md w-full" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="h-56 bg-gray-100 rounded-xl" />
                <div className="h-56 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ) : (
            <>
              {/* ---------------------------------------------------- */}
              {/* TAB 1: SEARCH ENGINES (Screenshot 1)                */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'search-engines' && (
                <div className="px-8 sm:px-12 py-6 max-w-4xl space-y-6">
                  {/* Search Engine Selector Bar & Form Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-5">
                    {/* Top Selector: Google, AI Overviews, AI Mode, ChatGPT, device toggle */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Google */}
                        <button
                          type="button"
                          onClick={() => setSelectedEngineType('Google')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                            selectedEngineType === 'Google'
                              ? 'bg-blue-50 text-[#1054E2] border border-blue-200 shadow-2xs'
                              : 'bg-transparent text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <GoogleIcon size={16} />
                          <span>Google</span>
                        </button>

                        {/* AI Overviews */}
                        <button
                          type="button"
                          onClick={() => setSelectedEngineType('AI Overviews')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                            selectedEngineType === 'AI Overviews'
                              ? 'bg-blue-50 text-[#1054E2] border border-blue-200 shadow-2xs'
                              : 'bg-transparent text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <AiOverviewsIcon size={16} />
                          <span>AI Overviews</span>
                        </button>

                        {/* AI Mode */}
                        <button
                          type="button"
                          onClick={() => setSelectedEngineType('AI Mode')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                            selectedEngineType === 'AI Mode'
                              ? 'bg-blue-50 text-[#1054E2] border border-blue-200 shadow-2xs'
                              : 'bg-transparent text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <AiModeIcon size={16} />
                          <span>AI Mode</span>
                        </button>

                        {/* ChatGPT */}
                        <button
                          type="button"
                          onClick={() => setSelectedEngineType('ChatGPT')}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                            selectedEngineType === 'ChatGPT'
                              ? 'bg-blue-50 text-[#1054E2] border border-blue-200 shadow-2xs'
                              : 'bg-transparent text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <ChatGptIcon size={16} />
                          <span>ChatGPT</span>
                        </button>

                        {/* More Menu */}
                        <button
                          type="button"
                          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Device Toggle: Desktop / Mobile */}
                      <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                        <button
                          type="button"
                          onClick={() => setSelectedDevice('desktop')}
                          className={`p-1.5 rounded-md transition-all cursor-pointer ${
                            selectedDevice === 'desktop'
                              ? 'bg-white text-gray-900 shadow-xs'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                          title="Desktop"
                        >
                          <Monitor className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDevice('mobile')}
                          className={`p-1.5 rounded-md transition-all cursor-pointer ${
                            selectedDevice === 'mobile'
                              ? 'bg-white text-gray-900 shadow-xs'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                          title="Mobile"
                        >
                          <Smartphone className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Country & Location Dropdowns (Screenshot 1) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Country Dropdown */}
                      <div className="relative" ref={countryDropdownRef}>
                        <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium mb-1.5">
                          <span>Country</span>
                          <span className="italic text-gray-400 font-serif text-xs">i</span>
                        </label>

                        {/* Country Selector Trigger */}
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 flex items-center justify-between focus:outline-none focus:border-[#1054E2] cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{selectedCountry.flag}</span>
                            <span className="font-medium">{selectedCountry.name}</span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>

                        {/* Country Searchable Popover Menu (Screenshot 1) */}
                        {isCountryDropdownOpen && (
                          <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                            {/* Search Input */}
                            <div className="p-2.5 border-b border-gray-100 flex items-center gap-2">
                              <Search className="w-4 h-4 text-gray-400 shrink-0" />
                              <input
                                type="text"
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                placeholder="Search country"
                                autoFocus
                                className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                              />
                            </div>

                            {/* Countries List */}
                            <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                              {filteredCountries.map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(c);
                                    setIsCountryDropdownOpen(false);
                                  }}
                                  className={`w-full px-4 py-2.5 flex items-center gap-3 text-xs text-left hover:bg-blue-50 transition-colors cursor-pointer ${
                                    selectedCountry.code === c.code
                                      ? 'bg-blue-50 font-bold text-[#1054E2]'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  <span className="text-base">{c.flag}</span>
                                  <span>{c.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Location Dropdown */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                            <span>Location</span>
                            <span className="italic text-gray-400 font-serif text-xs">i</span>
                          </label>
                          <span className="text-[11px] text-gray-400">Optional</span>
                        </div>

                        <input
                          type="text"
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          placeholder="Choose location"
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#1054E2] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Add Search Engine Button (Green button from Screenshot 1) */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleAddSearchEngine}
                        className="bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add search engine</span>
                      </button>
                    </div>
                  </div>

                  {/* Added Search Engines Table Card (Screenshot 1) */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                    {/* Search Input Bar */}
                    <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={engineSearchFilter}
                        onChange={(e) => setEngineSearchFilter(e.target.value)}
                        placeholder="Search"
                        className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                      />
                    </div>

                    {/* Table */}
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500">
                        <tr>
                          <th className="py-2.5 px-4 w-10"></th>
                          <th className="py-2.5 px-4">Search engine ({enginesList.length})</th>
                          <th className="py-2.5 px-4">Location</th>
                          <th className="py-2.5 px-4">Language</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {enginesList.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-xs text-gray-400">
                              {isLoadingEngines ? 'Loading search engines...' : 'No search engines configured. Add one above.'}
                            </td>
                          </tr>
                        ) : (
                          enginesList.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/60 group">
                              <td className="py-3 px-4 text-gray-400 cursor-grab">
                                <GripVertical className="w-4 h-4" />
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <SearchEngineIcon engine={item.name || item.engine} size={16} />
                                  <span className="font-medium text-gray-900">{item.name || item.engine}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <CountryFlag code={item.countryCode || 'in'} size="xs" />
                                  <span className="text-gray-700">{item.country || item.location}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600 font-medium">
                                <div className="flex items-center justify-between">
                                  <span>{item.language}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSearchEngine(item.id)}
                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                    title="Delete engine"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 2: KEYWORDS (Screenshot 3 & 4)                   */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'keywords' && (
                <div className="px-8 sm:px-12 py-6 max-w-4xl space-y-6">
                  {/* Section 1: Select Search Engines Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#101423]">
                        Select search engines
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Choose the search engines for which you&apos;ll add keywords for tracking
                      </p>
                    </div>

                    <div className="border border-gray-100 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 border-b border-gray-100">
                          <tr>
                            <th className="py-2 px-3 flex items-center gap-2">
                              <input
                                type="checkbox"
                                defaultChecked
                                className="rounded text-[#1054E2] focus:ring-0"
                              />
                              <span>Search engine ({enginesList.length} configured)</span>
                            </th>
                            <th className="py-2 px-3">Location</th>
                            <th className="py-2 px-3">Language</th>
                            <th className="py-2 px-3 text-right">Keywords</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enginesList.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-xs text-gray-400">
                                No search engines configured. Please configure an engine first.
                              </td>
                            </tr>
                          ) : (
                            enginesList.map((eng) => (
                              <tr key={eng.id} className="hover:bg-gray-50/50">
                                <td className="py-2.5 px-3 flex items-center gap-2.5">
                                  <input
                                    type="checkbox"
                                    defaultChecked
                                    className="rounded text-[#1054E2] focus:ring-0"
                                  />
                                  <SearchEngineIcon engine={eng.name || eng.engine} size={16} />
                                  <span className="font-medium text-gray-900">{eng.name || eng.engine}</span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-1.5 text-gray-700">
                                    <CountryFlag code={eng.countryCode || 'in'} size="xs" />
                                    <span>{eng.country || eng.location}</span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 text-gray-600 font-medium">{eng.language}</td>
                                <td className="py-2.5 px-3 text-right font-medium text-gray-900">
                                  {totalKeywordsCount}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section 2: Enter Keywords to Add Card (Screenshot 3 & 4) */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#101423]">
                          Enter keywords to add
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Type keywords manually, paste them, select from suggestions, or import from a file
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsImportModalOpen(true)}
                        className="text-xs text-[#1054E2] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Import keywords</span>
                        <Info className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>

                    {/* Numbered Textarea with Gutter (Screenshot 3 & 4) */}
                    <div className="border border-blue-400 rounded-lg overflow-hidden flex bg-white focus-within:ring-2 focus-within:ring-blue-100">
                      {/* Line Number Gutter 1. to 10. */}
                      <div className="bg-gray-50/50 py-2 px-3 text-gray-400 text-xs font-mono select-none text-right border-r border-gray-100 flex flex-col space-y-[2px]">
                        {Array.from({ length: Math.max(10, enteredCount + 1) }).map((_, i) => (
                          <span key={i} className="leading-5">
                            {i + 1}.
                          </span>
                        ))}
                      </div>

                      {/* Textarea */}
                      <textarea
                        value={keywordTextarea}
                        onChange={(e) => setKeywordTextarea(e.target.value)}
                        placeholder="Type keywords line by line..."
                        rows={10}
                        className="flex-1 p-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none resize-none leading-5 bg-transparent font-sans"
                      />
                    </div>

                    {/* Controls Row below Textarea */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                      <div className="flex items-center gap-6">
                        {/* Keyword Group Dropdown */}
                        <div>
                          <label className="flex items-center gap-1 text-[11px] text-gray-600 font-medium mb-1">
                            <span>Keyword group</span>
                            <span className="italic text-gray-400 font-serif text-[11px]">i</span>
                          </label>
                          <div className="relative">
                            <select
                              value={keywordGroup}
                              onChange={(e) => setKeywordGroup(e.target.value)}
                              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 appearance-none pr-7 focus:outline-none focus:border-[#1054E2] cursor-pointer"
                            >
                              <option value="General">📁 General</option>
                              <option value="Brand Terms">📁 Brand Terms</option>
                              <option value="Competitors">📁 Competitors</option>
                              <option value="High Intent">📁 High Intent</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-2 pointer-events-none" />
                          </div>
                        </div>

                        {/* Suggest Keywords Toggle */}
                        <div className="flex items-center gap-2 pt-4">
                          <button
                            type="button"
                            onClick={() => setSuggestKeywords(!suggestKeywords)}
                            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                              suggestKeywords ? 'bg-[#1054E2]' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                suggestKeywords ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <label
                            onClick={() => setSuggestKeywords(!suggestKeywords)}
                            className="flex items-center gap-1 text-xs text-gray-700 cursor-pointer"
                          >
                            <span>Suggest keywords</span>
                            <span className="italic text-gray-400 font-serif text-[11px]">i</span>
                          </label>
                        </div>
                      </div>

                      {/* Remaining Limits Counter & CTA Button (Screenshot 3 & 4) */}
                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <span className="text-xs text-gray-500">
                          {enteredCount} of {remainingLimits} remaining keyword limits will be used
                        </span>

                        <button
                          type="button"
                          onClick={handleAddKeywords}
                          disabled={enteredCount === 0}
                          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                            enteredCount > 0
                              ? 'bg-[#10B981] hover:bg-[#059669] text-white cursor-pointer shadow-xs'
                              : 'bg-[#9ae6b4]/50 text-white cursor-not-allowed font-medium'
                          }`}
                        >
                          {enteredCount > 0 ? 'Add keywords' : 'No keywords to add'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Keywords Added to Project Table (Screenshot 3 & 4) */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                    {/* Header with Count */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#101423]">
                        {totalKeywordsCount} keywords added to the project
                      </h3>
                    </div>

                    {/* Filter Bar with Search Engine Filter Dropdown (Screenshot 4) */}
                    <div className="p-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Search Input */}
                        <div className="relative max-w-xs w-full">
                          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                          <input
                            type="text"
                            value={keywordSearchQuery}
                            onChange={(e) => setKeywordSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1054E2]"
                          />
                        </div>

                        {/* Search Engine Dropdown Filter (Screenshot 4) */}
                        <div className="relative" ref={engineFilterRef}>
                          <button
                            type="button"
                            onClick={() => setIsEngineFilterDropdownOpen(!isEngineFilterDropdownOpen)}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-gray-700 flex items-center gap-2 hover:border-gray-300 cursor-pointer font-medium"
                          >
                            <span>Search engine</span>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                          </button>

                          {/* Popover Filter (Screenshot 4 Open State) */}
                          {isEngineFilterDropdownOpen && (
                            <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-3 space-y-3">
                              <button
                                type="button"
                                onClick={() => setEngineFilterSelected(['google-in'])}
                                className="text-xs text-gray-600 hover:text-gray-900 block text-left"
                              >
                                Select All
                              </button>

                              <label className="flex items-center gap-2 text-xs text-gray-800 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={engineFilterSelected.includes('google-in')}
                                  onChange={() => {
                                    if (engineFilterSelected.includes('google-in')) {
                                      setEngineFilterSelected([]);
                                    } else {
                                      setEngineFilterSelected(['google-in']);
                                    }
                                  }}
                                  className="rounded text-[#1054E2] focus:ring-0"
                                />
                                <span className="font-bold text-sm text-[#4285F4]">G</span>
                                <span>India, EN</span>
                              </label>

                              <button
                                type="button"
                                onClick={() => setIsEngineFilterDropdownOpen(false)}
                                className="w-full bg-[#1054E2] hover:bg-blue-700 text-white font-bold text-xs py-1.5 rounded-md transition-colors cursor-pointer"
                              >
                                Apply
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side: Add more keywords */}
                      <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 300, behavior: 'smooth' })}
                        className="text-xs text-gray-500 hover:text-[#1054E2] flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                        <span>Add more keywords?</span>
                      </button>
                    </div>

                    {/* Table View */}
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500">
                        <tr>
                          <th className="py-2.5 px-4 w-10">
                            <input type="checkbox" className="rounded text-[#1054E2] focus:ring-0" />
                          </th>
                          <th className="py-2.5 px-4">Keywords</th>
                          <th className="py-2.5 px-4">Search engine</th>
                          <th className="py-2.5 px-4 text-right">Search volume</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {/* Group Expandable Row (Screenshot 3 & 4) */}
                        <tr className="bg-gray-50/40 hover:bg-gray-50">
                          <td className="py-2.5 px-4 text-gray-400">
                            <GripVertical className="w-4 h-4 cursor-grab" />
                          </td>
                          <td className="py-2.5 px-4" colSpan={3}>
                            <div
                              className="flex items-center gap-2 cursor-pointer"
                              onClick={() => setIsKeywordsExpanded(!isKeywordsExpanded)}
                            >
                              <ChevronRight
                                className={`w-3.5 h-3.5 text-gray-500 transform transition-transform ${
                                  isKeywordsExpanded ? 'rotate-90' : 'rotate-0'
                                }`}
                              />
                              <Folder className="w-4 h-4 text-amber-500 fill-amber-500" />
                              <span className="font-semibold text-gray-900">
                                General ({totalKeywordsCount})
                              </span>
                              <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                Main
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Keyword items under group */}
                        {isKeywordsExpanded &&
                          filteredKeywords.map((kw) => (
                            <tr key={kw.id} className="hover:bg-blue-50/30 group">
                              <td className="py-2.5 px-4">
                                <input type="checkbox" className="rounded text-[#1054E2] focus:ring-0" />
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="font-medium text-gray-900">{kw.keyword}</span>
                              </td>
                              <td className="py-2.5 px-4">
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <GoogleIcon size={14} />
                                  <span>India, EN</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <span className="font-mono text-gray-700">{kw.searchVolume}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteKeyword(kw.id)}
                                    className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                    title="Delete keyword"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 3: PROMPTS (Exact match to Screenshot 1)        */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'prompts' && (
                <div className="px-8 sm:px-12 py-10 max-w-4xl space-y-6">
                  {/* Center Hero Card matching Screenshot 1 */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-12 shadow-2xs flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-6">
                    {/* Purple Sparkle Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">
                      <Sparkles className="w-7 h-7 text-[#7C3AED]" />
                    </div>

                    {/* Heading */}
                    <h3 className="text-base font-bold text-[#101423] mb-2">
                      Add an AI search engine
                    </h3>

                    {/* Subtitle */}
                    <p className="text-xs text-gray-500 leading-relaxed max-w-md mb-6">
                      Add AI search engines (ChatGPT, AI Overviews, Gemini etc.) to start tracking and analyzing their results for your target prompts
                    </p>

                    {/* Set up search engines Blue Button */}
                    <button
                      type="button"
                      onClick={() => switchTab('search-engines')}
                      className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      Set up search engines
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 4: COMPETITORS (Exact match to Screenshots 2 & 3) */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'competitors' && (
                <div className="px-8 sm:px-12 py-6 max-w-5xl space-y-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-[#101423]">
                        Add competitors to project
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        You can add up to 5 competitors to a project and track their ranking position changes. That way, you&apos;ll be able to know the results of their promotional activities and compare them with that of your site.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-2">
                      {/* Left Column: Competitors text area + domain type */}
                      <div className="space-y-4">
                        <div>
                          <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium mb-1.5">
                            <span>Competitors</span>
                            <span className="italic text-gray-400 font-serif text-xs">i</span>
                          </label>

                          <div className="border border-gray-300 rounded-lg overflow-hidden flex bg-white focus-within:ring-1 focus-within:ring-[#1054E2]">
                            {/* Line Number Gutter 1. to 10. */}
                            <div className="bg-gray-50/50 py-2.5 px-3 text-gray-400 text-xs font-mono select-none text-right border-r border-gray-100 flex flex-col space-y-[2px]">
                              {Array.from({ length: 10 }).map((_, i) => (
                                <span key={i} className="leading-5">
                                  {i + 1}.
                                </span>
                              ))}
                            </div>

                            <textarea
                              rows={10}
                              value={competitorTextarea}
                              onChange={(e) => setCompetitorTextarea(e.target.value)}
                              placeholder="Enter competitor domain (e.g. semrush.com, ahrefs.com)..."
                              className="flex-1 p-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none resize-none leading-5 bg-transparent font-sans"
                            />
                          </div>
                        </div>

                        {/* Domain type dropdown */}
                        <div>
                          <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium mb-1.5">
                            <span>Domain type</span>
                            <span className="italic text-gray-400 font-serif text-xs">i</span>
                          </label>
                          <div className="relative">
                            <select className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 appearance-none pr-8 focus:outline-none focus:border-[#1054E2] cursor-pointer">
                              <option>*.domain/*</option>
                              <option>domain/*</option>
                              <option>Exact URL</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-3 pointer-events-none" />
                          </div>
                        </div>

                        {/* Add Competitors Button */}
                        <button
                          type="button"
                          onClick={handleAddCompetitors}
                          disabled={!competitorTextarea.trim() || isAddingCompetitors}
                          className="px-5 py-2.5 bg-[#1054E2] hover:bg-[#0048db] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isAddingCompetitors ? 'ADDING...' : 'ADD COMPETITORS TO PROJECT'}
                        </button>
                      </div>

                      {/* Right Column: Real Competitors List */}
                      <div className="space-y-4">
                        <div>
                          <label className="flex items-center gap-1.5 text-xs text-gray-700 font-medium mb-1.5">
                            <span>Project Competitors ({competitorsList.length} / 5)</span>
                          </label>

                          {/* Country selector bar with project info */}
                          <div className="flex items-center justify-between px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs">
                            <span className="font-semibold text-gray-800">
                              {currentProject.name || currentProject.domain}
                            </span>

                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                              <span className="font-bold text-sm text-[#4285F4]">G</span>
                              <CountryFlag code={currentProject.countryCode || 'in'} size="xs" />
                            </div>
                          </div>
                        </div>

                        {/* Competitors Table Box */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500">
                              <tr>
                                <th className="py-2.5 px-3 font-normal">Domain</th>
                                <th className="py-2.5 px-3 text-right font-normal"># of keywords</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {competitorsList.length === 0 ? (
                                <tr>
                                  <td colSpan={2} className="py-8 text-center text-xs text-gray-400">
                                    {isLoadingCompetitors
                                      ? 'Loading competitors...'
                                      : 'No competitors added yet. Enter competitor domains on the left.'}
                                  </td>
                                </tr>
                              ) : (
                                competitorsList.map((comp) => (
                                  <tr key={comp.id} className="hover:bg-gray-50/50 group">
                                    <td className="py-2.5 px-3 flex items-center justify-between">
                                      <span className="text-gray-800 font-medium">{comp.domain}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCompetitor(comp.id)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        title="Delete competitor"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-gray-600 font-medium">
                                      {comp.totalKeywords || 0}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 5: ANALYTICS (Exact match to Screenshot 4)       */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'analytics' && (
                <div className="px-8 sm:px-12 py-8 max-w-4xl space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#101423]">
                      Connect statistics and analytics services
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Here you can connect popular statistics and analytics services to your project. Real data will sync once authorized.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {integrationsList.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between shadow-2xs hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center font-bold text-[#1054E2] text-sm">
                            {item.id.includes('search_console') ? 'G' : item.id.includes('analytics') ? 'GA' : 'GBP'}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">{item.name}</h4>
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                                item.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {item.connected ? 'Connected' : 'Not Connected'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleIntegration(item.id, item.connected)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            item.connected
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-[#1054E2] text-white hover:bg-[#0048db]'
                          }`}
                        >
                          {item.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 6: GENERAL INFORMATION                           */}
              {/* ---------------------------------------------------- */}
              {/* TAB 6: GENERAL INFORMATION (Screenshot 3)           */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'general' && (
                <div className="px-8 sm:px-12 py-6 max-w-4xl space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-[#101423]">General information</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Configure general project parameters and tracking settings</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-5">
                    {/* Website URL & Domain type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs text-gray-700 font-semibold mb-1.5 flex items-center gap-1">
                          <span>Website URL:</span>
                          <span className="text-gray-400 font-normal italic text-[11px]">i</span>
                        </label>
                        <input
                          type="text"
                          value={generalUrl || 'workcomposer.com'}
                          onChange={(e) => setGeneralUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#1054E2]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-700 font-semibold mb-1.5 flex items-center gap-1">
                          <span>Domain type:</span>
                          <span className="text-gray-400 font-normal italic text-[11px]">i</span>
                        </label>
                        <select className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-[#1054E2] cursor-pointer">
                          <option>*.domain/* (Recommended)</option>
                          <option>domain/*</option>
                          <option>Exact URL</option>
                        </select>
                      </div>
                    </div>

                    {/* Project name & Group */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs text-gray-700 font-semibold mb-1.5 block">Project name:</label>
                        <input
                          type="text"
                          value={generalName || 'workcomposer.com'}
                          onChange={(e) => setGeneralName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#1054E2]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-700 font-semibold mb-1.5 block">Group:</label>
                        <select className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-[#1054E2] cursor-pointer">
                          <option value="suraj">suraj</option>
                          <option value="none">No group</option>
                        </select>
                      </div>
                    </div>

                    {/* Project Color Picker */}
                    <div>
                      <label className="text-xs text-gray-700 font-semibold mb-2 block">Project color:</label>
                      <div className="flex items-center gap-2">
                        {['#C026D3', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'].map((color) => (
                          <div
                            key={color}
                            style={{ backgroundColor: color }}
                            className={`w-7 h-7 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-110 ${
                              color === '#C026D3' ? 'ring-2 ring-offset-2 ring-purple-600' : ''
                            }`}
                          >
                            {color === '#C026D3' && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Toggles: Security Check & Backlink Report */}
                    <div className="pt-2 border-t border-gray-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-gray-900">Security check</div>
                          <div className="text-[11px] text-gray-500">Monitor malware and blacklists</div>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-[#1054E2] rounded cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-gray-900">Backlink report</div>
                          <div className="text-[11px] text-gray-500">Automatically discover and track incoming links</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={generalBacklinks}
                            onChange={(e) => setGeneralBacklinks(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                      <button
                        type="button"
                        onClick={handleSaveGeneral}
                        disabled={isSavingGeneral}
                        className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                      >
                        {isSavingGeneral ? 'APPLYING...' : 'APPLY'}
                      </button>
                      {generalSaveSuccess && (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Settings applied successfully!</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 4. BOTTOM CENTER "BACK TO PROJECT" BUTTON (Screenshot 1, 2, 3, 4) */}
        <div className="py-6 flex justify-center border-t border-gray-100 bg-white">
          <button
            type="button"
            onClick={() => router.push('/projects')}
            className="px-6 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
          >
            BACK TO PROJECT
          </button>
        </div>
      </main>
    </div>
  );
}
