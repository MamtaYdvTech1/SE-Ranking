'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Search,
  Plus,
  Download,
  Calendar,
  Folder,
  Copy,
  Edit2,
  HelpCircle,
  TrendingUp,
  Globe,
  ExternalLink,
  Shield,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { ReportBugModal } from '@/components/modals/ReportBugModal';
import { ProjectNotesModal } from '@/components/modals/ProjectNotesModal';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SeoPotentialView } from '@/components/analytics/SeoPotentialView';
import { SnippetsAnalyticsView } from '@/components/analytics/SnippetsAnalyticsView';
import { GoogleAccountChooserModal, GoogleAccountProfile } from '@/components/auth/GoogleAccountChooserModal';

function GoogleAnalyticsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <rect x="18" y="4" width="4" height="16" rx="2" fill="#F9AB00" />
      <rect x="10" y="10" width="4" height="10" rx="2" fill="#E37400" />
      <circle cx="4" cy="18" r="2" fill="#F9AB00" />
    </svg>
  );
}

function GoogleSearchConsoleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function MatomoAnalyticsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" className="shrink-0">
      <circle cx="16" cy="16" r="16" fill="#3152A0" />
      <path
        d="M9 22V17.5C9 15.567 10.567 14 12.5 14C14.433 14 16 15.567 16 17.5V22"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M16 22V13.5C16 11.567 17.567 10 19.5 10C21.433 10 23 11.567 23 13.5V22"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="12.5" cy="10" r="1.6" fill="#00B0FF" />
    </svg>
  );
}

function SERankingLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M3.5 19.5L9.5 4.5H13.5L7.5 19.5H3.5Z" fill="#1E293B" />
      <path d="M10.5 19.5L16.5 4.5H20.5L14.5 19.5H10.5Z" fill="#7C3AED" />
    </svg>
  );
}

interface KeywordSnippetItem {
  id: string;
  keyword: string;
  searchVolume: number;
  currentRank: number;
  url: string;
  title: string;
  snippet: string;
  group: 'General' | 'Brand' | 'Features';
}

const INITIAL_KEYWORD_SNIPPETS: KeywordSnippetItem[] = [
  {
    id: 'k-1',
    keyword: 'work composer',
    searchVolume: 1200,
    currentRank: 1,
    url: 'https://www.workcomposer.com/',
    title: 'WorkComposer - Employee Monitoring & Time Tracking Software',
    snippet: 'WorkComposer helps modern remote and hybrid teams track work hours, monitor productivity, and capture real-time activity metrics effortlessly.',
    group: 'Brand',
  },
  {
    id: 'k-2',
    keyword: 'employee tracking software',
    searchVolume: 8100,
    currentRank: 4,
    url: 'https://www.workcomposer.com/employee-monitoring',
    title: 'Employee Tracking & Monitoring Software for Teams | WorkComposer',
    snippet: 'Automatic screenshots, keystroke activity, application usage, and stealth time tracking with WorkComposer.',
    group: 'General',
  },
  {
    id: 'k-3',
    keyword: 'time tracking software',
    searchVolume: 14800,
    currentRank: 7,
    url: 'https://www.workcomposer.com/time-tracker',
    title: 'Time Tracking Software with Screenshots | WorkComposer',
    snippet: 'Track employee billable hours with automated timesheets, GPS tracking, and payroll export capabilities.',
    group: 'General',
  },
  {
    id: 'k-4',
    keyword: 'remote team management',
    searchVolume: 2400,
    currentRank: 3,
    url: 'https://www.workcomposer.com/features/remote-teams',
    title: 'Remote Team Management Tools | WorkComposer',
    snippet: 'Empower hybrid and remote distributed workforces with automated transparency, productivity analytics and payroll.',
    group: 'Features',
  },
];

function AnalyticsPageContent() {
  const { activeProject } = useApp();
  const domain = activeProject?.domain || 'zohosocial.com';
  const cleanDomain = (activeProject?.domain || activeProject?.name || 'zohosocial.com')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '') || 'zohosocial.com';
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawTab = searchParams?.get('tab') || 'overview';
  const [activeTabState, setActiveTabState] = useState(rawTab);

  // Connected state for services - default to true when project analytics data loads
  const [isGAConnected, setIsGAConnected] = useState(true);
  const [isGSCConnected, setIsGSCConnected] = useState(true);
  const [isMatomoConnected, setIsMatomoConnected] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(true);
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);
  const [googleChooserService, setGoogleChooserService] = useState('Google Analytics');
  const [connectedAccountEmail, setConnectedAccountEmail] = useState('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [notesCount, setNotesCount] = useState(49);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('se_ranking_connected_account') || localStorage.getItem('user_email');
      if (savedEmail) {
        setConnectedAccountEmail(savedEmail);
      }
    }
  }, []);

  const handleGoogleAccountSelected = (account: GoogleAccountProfile) => {
    setIsGAConnected(true);
    setIsGSCConnected(true);
    setIsOnboardingCompleted(true);
    setConnectedAccountEmail(account.email);
    if (typeof window !== 'undefined') {
      localStorage.setItem('se_ranking_connected_account', account.email);
      localStorage.setItem('se_ranking_connected_user', account.name);
      const projId = activeProject?.id || 'default';
      const raw = localStorage.getItem(`se_ranking_connected_services_${projId}`);
      const existing = raw ? JSON.parse(raw) : {};
      existing['Google Analytics'] = true;
      existing['Google Search Console'] = true;
      localStorage.setItem(`se_ranking_connected_services_${projId}`, JSON.stringify(existing));
    }
    showToast(`✓ Connected ${account.email} with Google Analytics & Search Console! Live telemetry active.`);
  };

  useEffect(() => {
    async function loadProjectAnalytics() {
      if (!activeProject?.id) return;
      try {
        setIsLoadingAnalytics(true);
        const res = await fetch(`/api/projects/${encodeURIComponent(activeProject.id)}/analytics`);
        if (res.ok) {
          const data = await res.json();
          setAnalyticsData(data);
          setIsOnboardingCompleted(true);
          setIsGAConnected(true);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoadingAnalytics(false);
      }
    }
    loadProjectAnalytics();
  }, [activeProject?.id]);

  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash.includes('start')) {
          setIsOnboardingCompleted(false);
        }
        if (hash.includes('seo-potential') || hash.includes('potential')) {
          setActiveTabState('potential');
        } else if (hash.includes('snippets')) {
          setActiveTabState('snippets');
        } else if (hash.includes('traffic')) {
          setActiveTabState('traffic');
        } else if (hash.includes('gsc')) {
          setActiveTabState('gsc');
        } else if (rawTab) {
          setActiveTabState(rawTab === 'seo-potential' ? 'potential' : rawTab);
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [rawTab]);

  const tabParam = activeTabState === 'seo-potential' ? 'potential' : activeTabState;
  const tabTitle =
    tabParam === 'traffic'
      ? 'Traffic'
      : tabParam === 'snippets'
      ? 'Snippets'
      : tabParam === 'gsc'
      ? 'Google Search Console Data'
      : tabParam === 'potential'
      ? 'SEO potential'
      : 'Overview';

  // Modals state
  const [isGAModalOpen, setIsGAModalOpen] = useState(false);
  const [isGSCModalOpen, setIsGSCModalOpen] = useState(false);
  const [isMatomoModalOpen, setIsMatomoModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isGuestLinkOpen, setIsGuestLinkOpen] = useState(false);
  const [isReadMoreOpen, setIsReadMoreOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Notice Banners visibility
  const [showSnippetsNotice, setShowSnippetsNotice] = useState(true);
  const [showPotentialNotice, setShowPotentialNotice] = useState(true);

  // Snippets interactive state matching Screenshots 1 & 2
  const [selectedEngine, setSelectedEngine] = useState('India');
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const engineDropdownRef = useRef<HTMLDivElement>(null);

  const [dateRangeLabel, setDateRangeLabel] = useState('29 Sep 2026 - 29 Sep 2026');
  const [snippetSearchKeyword, setSnippetSearchKeyword] = useState('');
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);
  const folderDropdownRef = useRef<HTMLDivElement>(null);
  const [folderSearch, setFolderSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'All keywords' | 'General'>('All keywords');

  // Snippet Chart Tab State
  const [activeSnippetMetric, setActiveSnippetMetric] = useState<'position' | 'forecast' | 'visibility'>('position');
  const [activeSnippetTimeframe, setActiveSnippetTimeframe] = useState<'week' | 'month' | '3month' | '6month'>('week');
  const [hasSnippetsData, setHasSnippetsData] = useState(true);

  // SEO Potential State matching Screenshots 1 & 2
  const [conversionRatio, setConversionRatio] = useState('1:100');
  const [avgRevenue, setAvgRevenue] = useState(50);
  const [estimatedTop, setEstimatedTop] = useState(10);
  const [isEditConversionOpen, setIsEditConversionOpen] = useState(false);
  const [isEditRevenueOpen, setIsEditRevenueOpen] = useState(false);
  const [tempConversion, setTempConversion] = useState('1:100');
  const [tempRevenue, setTempRevenue] = useState('50');
  const [isAddKeywordsOpen, setIsAddKeywordsOpen] = useState(false);
  const [newKeywordsInput, setNewKeywordsInput] = useState('');
  const [hasPotentialKeywords, setHasPotentialKeywords] = useState(true);

  // Form states
  const [gaProperty, setGaProperty] = useState('workcomposer.com (GA4-48291054)');
  const [gscSite, setGscSite] = useState('sc-domain:workcomposer.com');
  const [matomoUrl, setMatomoUrl] = useState('https://analytics.workcomposer.com');
  const [matomoSiteId, setMatomoSiteId] = useState('1');
  const [matomoToken, setMatomoToken] = useState('');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const hasAnyConnected = isGAConnected || isGSCConnected || isMatomoConnected;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (engineDropdownRef.current && !engineDropdownRef.current.contains(e.target as Node)) {
        setIsEngineDropdownOpen(false);
      }
      if (folderDropdownRef.current && !folderDropdownRef.current.contains(e.target as Node)) {
        setIsFolderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 relative pb-12 select-none overflow-x-hidden font-sans flex flex-col justify-between">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      <div>
        {/* ========================================================================= */}
        {/* TOP DISMISSIBLE NOTICES MATCHING SCREENSHOTS */}
        {/* ========================================================================= */}

        {/* Snippets Blue Notice Banner */}
        {tabParam === 'snippets' && showSnippetsNotice && (
          <div className="bg-[#EBF5FF] border-b border-[#D0E2FF] px-6 py-2.5 flex items-center justify-between text-xs text-[#7C3AED] leading-relaxed animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 pr-4">
              <span className="w-4 h-4 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-serif text-[10px] italic font-bold shrink-0">
                i
              </span>
              <p className="text-gray-700">
                Find out how effective your snippets are. After all, the way a web page is displayed in search engines has a direct impact on the number of clicks it gets. All the data in this section is grouped by search engines and dates, and is stored for 30 days.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSnippetsNotice(false)}
              className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
              title="Close notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SEO Potential Blue Notice Banner */}
        {tabParam === 'potential' && showPotentialNotice && (
          <div className="bg-[#EBF5FF] border-b border-[#D0E2FF] px-6 py-2.5 flex items-center justify-between text-xs text-[#7C3AED] leading-relaxed animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5 pr-4">
              <span className="w-4 h-4 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-serif text-[10px] italic font-bold shrink-0">
                i
              </span>
              <p className="text-gray-700">
                <strong className="text-gray-900 font-semibold mr-1">How does SEO potential work?</strong>
                This tool will help you estimate the traffic volume, traffic cost (if acquired through Google Ads), and the potential number of clients.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsReadMoreOpen(true)}
                className="text-[#7C3AED] hover:underline font-medium cursor-pointer text-xs"
              >
                Read more
              </button>
              <button
                type="button"
                onClick={() => setShowPotentialNotice(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                title="Close notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TOP BREADCRUMB & METADATA BAR (Matching all Screenshots) */}
        {/* ========================================================================= */}
        <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/projects')}
              className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors cursor-pointer bg-white shrink-0"
              title="Back to projects"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 font-normal text-xs text-gray-500">
              <span className="text-gray-700 font-semibold">{cleanDomain}</span>
              <span className="text-gray-300">&gt;</span>
              <span className="text-gray-500">Analytics &amp; Traffic</span>
              <span className="text-gray-300">&gt;</span>
              <span className="text-gray-700 font-medium">{tabTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-normal text-gray-600">
            <button
              type="button"
              onClick={() => setIsGuestLinkOpen(true)}
              className="text-[#7C3AED] hover:underline cursor-pointer"
            >
              Guest link
            </button>
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="text-[#7C3AED] hover:underline cursor-pointer"
            >
              Feedback
            </button>
            <button
              type="button"
              onClick={() => setIsNotesModalOpen(true)}
              className="text-[#7C3AED] hover:underline cursor-pointer"
            >
              Notes ({notesCount})
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & TRAFFIC - ONBOARDING OR FULL DASHBOARD */}
        {/* ========================================================================= */}
        {(tabParam === 'overview' || tabParam === 'traffic') && (
          isOnboardingCompleted && hasAnyConnected ? (
            /* Connected Full Dynamic Analytics & Traffic Dashboard */
            <div className="px-6 py-5 max-w-[1400px] mx-auto space-y-5 animate-in fade-in duration-200 w-full">
              {/* Header Title & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900">
                    {tabParam === 'traffic' ? 'Traffic Overview' : 'Analytics & Traffic'}
                  </h1>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      {isGAConnected && isGSCConnected
                        ? 'GA4 & Search Console Active'
                        : isGAConnected
                        ? 'Google Analytics 4 Active'
                        : isGSCConnected
                        ? 'Google Search Console Active'
                        : 'Matomo Analytics Active'}
                    </span>
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                    Account: <strong className="text-gray-800">{connectedAccountEmail || 'bittumkydv12@gmail.com'}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOnboardingCompleted(false)}
                    className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Configure or reconnect analytics services"
                  >
                    <span>⚙ Setup Services</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Exporting analytics data to CSV...')}
                    className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer uppercase shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>EXPORT</span>
                  </button>
                </div>
              </div>

              {/* 4 Primary Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1">
                  <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">TOTAL SESSIONS</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900">
                      {analyticsData?.summary?.totalClicks
                        ? Math.round(analyticsData.summary.totalClicks * 1.15).toLocaleString()
                        : '28.4K'}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">▲ +14.8%</span>
                  </div>
                  <div className="text-[10px] text-gray-400">vs previous 28 days</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1">
                  <div className="text-[11px] text-gray-400 font-bold uppercase">TOTAL USERS</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#7C3AED]">
                      {analyticsData?.summary?.totalClicks
                        ? Math.round(analyticsData.summary.totalClicks * 0.72).toLocaleString()
                        : '19.2K'}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">▲ +9.2%</span>
                  </div>
                  <div className="text-[10px] text-gray-400">organic visitors</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1">
                  <div className="text-[11px] text-gray-400 font-bold uppercase">PAGE VIEWS / IMPRESSIONS</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-purple-600">
                      {analyticsData?.summary?.totalImpressions
                        ? Number(analyticsData.summary.totalImpressions).toLocaleString()
                        : '64.1K'}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">▲ +11.5%</span>
                  </div>
                  <div className="text-[10px] text-gray-400">Search impressions</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1">
                  <div className="text-[11px] text-gray-400 font-bold uppercase">AVG CTR / ENGAGEMENT</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-600">
                      {analyticsData?.summary?.avgCtr || '3.8%'}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">▲ +0.4%</span>
                  </div>
                  <div className="text-[10px] text-gray-400">Avg. Pos: {analyticsData?.summary?.avgPosition || '14.8'}</div>
                </div>
              </div>

              {/* Big Interactive Sessions Diagram */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Website Traffic Dynamics</h3>
                    <p className="text-xs text-gray-500">Daily visitor sessions and impressions for {cleanDomain}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-[#7C3AED]">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Sessions
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Users
                    </span>
                  </div>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={
                      analyticsData?.trend?.length
                        ? analyticsData.trend.slice(-14).map((d: any) => ({
                            day: d.label,
                            sessions: d.sessions,
                            users: Math.round(d.sessions * 0.72),
                          }))
                        : [
                            { day: 'Sep 23', sessions: 940, users: 650 },
                            { day: 'Sep 24', sessions: 1020, users: 710 },
                            { day: 'Sep 25', sessions: 1090, users: 760 },
                            { day: 'Sep 26', sessions: 1140, users: 800 },
                            { day: 'Sep 27', sessions: 1190, users: 830 },
                            { day: 'Sep 28', sessions: 1260, users: 880 },
                            { day: 'Sep 29', sessions: 1340, users: 940 },
                          ]
                    }>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F5" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          fontSize: '12px',
                        }}
                        formatter={(val: any, name: any) => [
                          val?.toLocaleString(),
                          name === 'sessions' ? 'Visitor Sessions' : 'Unique Users',
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="sessions"
                        stroke="#2563EB"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#2563EB' }}
                        activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#10B981' }}
                        activeDot={{ r: 5, stroke: '#FFFFFF', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Two Column Grid: Traffic Channels & Top Pages */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Traffic Channels Breakdown */}
                <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
                  <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2.5">
                    Traffic Acquisition Channels
                  </h3>
                  <div className="space-y-3 pt-1">
                    {[
                      { channel: 'Organic Search', pct: 54, visits: analyticsData?.summary?.totalClicks ? (Math.round(analyticsData.summary.totalClicks * 0.54)).toLocaleString() : '15,360', color: 'bg-blue-600' },
                      { channel: 'Direct Traffic', pct: 26, visits: analyticsData?.summary?.totalClicks ? (Math.round(analyticsData.summary.totalClicks * 0.26)).toLocaleString() : '7,390', color: 'bg-emerald-500' },
                      { channel: 'Referral Websites', pct: 12, visits: analyticsData?.summary?.totalClicks ? (Math.round(analyticsData.summary.totalClicks * 0.12)).toLocaleString() : '3,410', color: 'bg-purple-500' },
                      { channel: 'Organic Social', pct: 8, visits: analyticsData?.summary?.totalClicks ? (Math.round(analyticsData.summary.totalClicks * 0.08)).toLocaleString() : '2,290', color: 'bg-amber-500' },
                    ].map((ch) => (
                      <div key={ch.channel} className="space-y-1 text-xs">
                        <div className="flex justify-between font-medium">
                          <span className="text-gray-800">{ch.channel}</span>
                          <span className="text-gray-500">{ch.visits} ({ch.pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${ch.color} rounded-full`} style={{ width: `${ch.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Landing Pages Table */}
                <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-200 font-bold text-xs text-gray-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Top Landing Pages</span>
                    <span className="text-[11px] text-gray-400 lowercase font-normal">by organic visits</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/70 border-b border-gray-200 text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-4">PAGE URL</th>
                          <th className="py-2.5 px-3 text-right">VISITS</th>
                          <th className="py-2.5 px-3 text-right">BOUNCE</th>
                          <th className="py-2.5 px-3 text-right">AVG TIME</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {(analyticsData?.landingPages?.length
                          ? analyticsData.landingPages.map((lp: any) => ({
                              url: lp.url.replace(/^https?:\/\/[^\/]+/, '') || '/',
                              visits: Number(lp.clicks).toLocaleString(),
                              bounce: '32.1%',
                              time: '2m 10s',
                            }))
                          : [
                              { url: '/', visits: '12,400', bounce: '32.1%', time: '2m 10s' },
                              { url: '/features', visits: '8,900', bounce: '28.4%', time: '3m 45s' },
                              { url: '/pricing', visits: '4,200', bounce: '35.6%', time: '2m 55s' },
                              { url: '/blog', visits: '2,950', bounce: '41.2%', time: '3m 12s' },
                            ]
                        ).map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-[#F5F3FF] transition-colors">
                            <td className="py-2.5 px-4 font-semibold text-gray-900 truncate max-w-[200px]">{row.url}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[#7C3AED]">{row.visits}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-gray-600">{row.bounce}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-medium">{row.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Pixel-Perfect Start Analytics Page matching User Screenshot 1 & 2 & HTML */
            <div className="section-wrapper__content flex-1 flex flex-col justify-between py-8 px-6 min-h-[calc(100vh-140px)]">
              <div className="start-analytics-page max-w-4xl w-full mx-auto my-auto text-center pt-8 pb-12">
                <div className="start-analytics-page__wrapper space-y-7">
                  
                  {/* Heading Block */}
                  <div className="start-analytics-page__block start-analytics-page__block_headings space-y-3">
                    <h2 className="start-analytics-page__text start-analytics-page__text_header text-[28px] sm:text-[30px] font-semibold text-[#1e293b] tracking-tight">
                      Analytics and statistics services
                    </h2>
                    <p className="start-analytics-page__text text-[14px] text-[#64748b] max-w-[620px] mx-auto leading-relaxed">
                      Connect Google Analytics and statistics services to get detailed information about your website without switching between browser tabs. It will only take a few minutes.
                    </p>
                  </div>

                  {/* Connection Buttons Grid Block */}
                  <div className="start-analytics-page__block start-analytics-page__block_connection-buttons pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[700px] mx-auto justify-items-center">
                      
                      {/* 1. Google Analytics Button */}
                      <div className="start-analytics-page__service-button-block w-full flex justify-center md:justify-end">
                        <div className="ga-connection-block w-full flex justify-center md:justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setGoogleChooserService('Google Analytics');
                              setIsGoogleChooserOpen(true);
                            }}
                            data-locator="analytics.onboarding.connect_button.ga"
                            style={{ minWidth: '332px' }}
                            className={`analytics-connection-button analytics-connection-button_interactive analytics-connection-button_align-center google-analytics-button start-analytics-page__service-button h-[48px] px-5 rounded-lg border flex items-center justify-center gap-3 text-[14px] font-medium transition-all shadow-2xs select-none ${
                              isGAConnected
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800'
                                : 'bg-white border-[#D9E1EC] hover:border-[#94A3B8] hover:bg-[#FAFCFE] hover:shadow-xs text-[#1E293B] cursor-pointer'
                            }`}
                          >
                            <div className="analytics-connection-button__content flex items-center gap-2.5">
                              <GoogleAnalyticsIcon />
                              <span>{isGAConnected ? 'Google Analytics Connected ✓' : 'Connect Google Analytics'}</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* 2. Google Search Console Button */}
                      <div className="start-analytics-page__service-button-block w-full flex justify-center md:justify-start">
                        <div className="gsc-connection-block w-full flex justify-center md:justify-start">
                          <button
                            type="button"
                            onClick={() => {
                              setGoogleChooserService('Google Search Console');
                              setIsGoogleChooserOpen(true);
                            }}
                            data-locator="analytics.onboarding.connect_button.gsc"
                            style={{ minWidth: '332px' }}
                            className={`analytics-connection-button analytics-connection-button_interactive analytics-connection-button_align-center google-search-console-button start-analytics-page__service-button h-[48px] px-5 rounded-lg border flex items-center justify-center gap-3 text-[14px] font-medium transition-all shadow-2xs select-none ${
                              isGSCConnected
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800'
                                : 'bg-white border-[#D9E1EC] hover:border-[#94A3B8] hover:bg-[#FAFCFE] hover:shadow-xs text-[#1E293B] cursor-pointer'
                            }`}
                          >
                            <div className="analytics-connection-button__content flex items-center gap-2.5">
                              <GoogleSearchConsoleIcon />
                              <span>{isGSCConnected ? 'Google Search Console Connected ✓' : 'Connect Google Search Console'}</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* 3. Matomo Analytics Button */}
                      <div className="start-analytics-page__service-button-block w-full flex justify-center md:justify-end">
                        <div className="matomo-connection-block w-full flex justify-center md:justify-end">
                          <button
                            type="button"
                            onClick={() => setIsMatomoModalOpen(true)}
                            data-locator="analytics.onboarding.connect_button.matomo"
                            style={{ minWidth: '332px' }}
                            className={`analytics-connection-button analytics-connection-button_interactive analytics-connection-button_align-center matomo-analytics-button start-analytics-page__service-button h-[48px] px-5 rounded-lg border flex items-center justify-center gap-3 text-[14px] font-medium transition-all shadow-2xs select-none ${
                              isMatomoConnected
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800'
                                : 'bg-white border-[#D9E1EC] hover:border-[#94A3B8] hover:bg-[#FAFCFE] hover:shadow-xs text-[#1E293B] cursor-pointer'
                            }`}
                          >
                            <div className="analytics-connection-button__content flex items-center gap-2.5">
                              <MatomoAnalyticsIcon />
                              <span>{isMatomoConnected ? 'Matomo Analytics Connected ✓' : 'Connect Matomo Analytics'}</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Empty placeholder column for exact visual grid balance */}
                      <div className="hidden md:block w-full" style={{ minWidth: '332px' }} />

                    </div>
                  </div>

                  {/* Continue Button Block */}
                  <div className="start-analytics-page__block pt-5 flex flex-col items-center gap-3">
                    <button
                      type="button"
                      disabled={!hasAnyConnected}
                      onClick={() => {
                        if (hasAnyConnected) {
                          setIsOnboardingCompleted(true);
                          showToast('Services connected successfully!');
                        }
                      }}
                      data-locator="analytics.onboarding.connect_button.connect"
                      className={`se-button-2 start-analytics-page__continue-button inline-flex items-center justify-center gap-2 min-w-[180px] h-[44px] px-8 rounded-lg text-[13px] font-bold tracking-wider uppercase transition-all select-none ${
                        hasAnyConnected
                          ? 'bg-[#7C3AED] hover:bg-[#0B59EE] text-white shadow-md cursor-pointer'
                          : 'bg-[#D6DCE5] text-white cursor-not-allowed'
                      }`}
                    >
                      <span className="se-button-2__wrapper flex items-center gap-2">
                        <span className="se-button-2__text">Continue</span>
                        <ChevronRight className="w-4 h-4 ml-0.5" />
                      </span>
                    </button>

                    {/* Quick Demo Preview Link */}
                    {!hasAnyConnected && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsGAConnected(true);
                          setIsGSCConnected(true);
                          setIsOnboardingCompleted(true);
                          showToast('Loaded demo connected analytics data');
                        }}
                        className="text-xs text-gray-400 hover:text-[#7C3AED] hover:underline cursor-pointer transition-colors mt-1"
                      >
                        Or preview live dashboard with demo analytics &rarr;
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Footer */}
              <footer className="w-full pt-12 pb-3 px-4 flex flex-wrap items-center justify-between text-xs text-[#78889B] border-t border-gray-100/60 mt-auto">
                <div className="flex items-center gap-2">
                  <SERankingLogo />
                  <span className="font-bold text-[14px] text-[#1E293B] tracking-tight">SE Ranking</span>
                </div>

                <div className="flex items-center gap-6 text-[12px] text-[#64748B]">
                  <button
                    type="button"
                    onClick={() => setIsBugModalOpen(true)}
                    className="hover:text-[#1E293B] transition-colors cursor-pointer"
                  >
                    Report a bug
                  </button>
                  <a
                    href="https://seranking.com/affiliate.html"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#1E293B] transition-colors"
                  >
                    Affiliates
                  </a>
                  <Link href="/api-docs" className="hover:text-[#1E293B] transition-colors">
                    API
                  </Link>
                  <a
                    href="https://seranking.com/whats-new.html"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#1E293B] transition-colors"
                  >
                    What&apos;s new
                  </a>
                  <Link href="/help" className="hover:text-[#1E293B] transition-colors">
                    Help
                  </Link>
                </div>
              </footer>
            </div>
          )
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SNIPPETS (1:1 Matching User Screenshots with Rich Diagrams & Previews) */}
        {/* ========================================================================= */}
        {tabParam === 'snippets' && (
          <div className="px-6 py-5 max-w-[1400px] mx-auto space-y-4 animate-in fade-in duration-200">
            <SnippetsAnalyticsView
              activeProject={activeProject}
              onExport={() => showToast('Exporting Snippets intelligence report...')}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: GOOGLE SEARCH CONSOLE DATA (1:1 Matching User Screenshot) */}
        {/* ========================================================================= */}
        {tabParam === 'gsc' && (
          <div className="animate-in fade-in duration-200">
            {!isGSCConnected ? (
              /* Initial Connection Screen Matching User Screenshot */
              <div className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center space-y-6">
                {/* Vector Illustration matching Screenshot */}
                <div className="w-72 h-56 mx-auto relative flex items-center justify-center">
                  {/* Modern Illustration Graphic */}
                  <svg viewBox="0 0 320 240" className="w-full h-full" fill="none">
                    {/* Soft background shape */}
                    <ellipse cx="160" cy="195" rx="130" ry="30" fill="#FEE2E2" opacity="0.45" />

                    {/* Floating colored shapes */}
                    <rect x="235" y="35" width="22" height="16" rx="3" fill="#EF4444" transform="rotate(15 235 35)" />
                    <rect x="215" y="55" width="28" height="18" rx="3" fill="#3B82F6" transform="rotate(-10 215 55)" />
                    <rect x="190" y="30" width="20" height="15" rx="3" fill="#F59E0B" />

                    {/* Standing User Character with Laptop */}
                    <circle cx="178" cy="40" r="10" fill="#1E293B" />
                    <path d="M178 50 C 168 55, 168 70, 178 75 C 188 70, 188 55, 178 50 Z" fill="#93C5FD" />

                    {/* Main Browser Window */}
                    <g filter="drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.08))">
                      <rect x="65" y="70" width="180" height="115" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                      <rect x="65" y="70" width="180" height="18" rx="6" fill="#F8FAFC" />
                      <line x1="65" y1="88" x2="245" y2="88" stroke="#E2E8F0" strokeWidth="1" />
                      {/* Browser dots */}
                      <circle cx="75" cy="79" r="2.5" fill="#EF4444" />
                      <circle cx="83" cy="79" r="2.5" fill="#F59E0B" />
                      <circle cx="91" cy="79" r="2.5" fill="#10B981" />

                      {/* Bar chart inside window */}
                      <rect x="80" y="100" width="80" height="7" rx="2" fill="#3B82F6" />
                      <circle cx="120" cy="140" r="22" stroke="#E2E8F0" strokeWidth="6" fill="none" />
                      <path d="M 120 118 A 22 22 0 0 1 142 140" stroke="#3B82F6" strokeWidth="6" fill="none" strokeLinecap="round" />
                    </g>

                    {/* Green Audit Document on Left */}
                    <g filter="drop-shadow(0px 6px 12px rgba(16, 185, 129, 0.12))">
                      <rect x="40" y="95" width="60" height="85" rx="5" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1.5" />
                      <polygon points="45,130 95,98 95,130" fill="#10B981" opacity="0.7" />
                      <line x1="48" y1="145" x2="75" y2="145" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                      <line x1="48" y1="155" x2="88" y2="155" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                      <line x1="48" y1="165" x2="70" y2="165" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                    </g>

                    {/* Sitting character working on laptop */}
                    <ellipse cx="205" cy="140" rx="14" ry="14" fill="#FBBF24" />
                    {/* Blue shirt & jeans */}
                    <path d="M 195 155 Q 210 145 220 155 L 210 195 L 188 190 Z" fill="#2563EB" />
                    {/* Blue laptop */}
                    <rect x="180" y="152" width="24" height="14" rx="2" fill="#3B82F6" transform="rotate(-15 180 152)" />
                    {/* Plant/foliage */}
                    <path d="M 235 150 C 245 130 250 160 255 190 C 240 190 235 170 235 150 Z" fill="#6EE7B7" opacity="0.6" />
                  </svg>
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-2">
                  <h1 className="text-[26px] font-bold text-[#1E293B] tracking-tight">
                    Google Search Console
                  </h1>
                  <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                    Connect Google Search Console to get detailed information about your project.
                  </p>
                </div>

                {/* Connect Button Matching Screenshot */}
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setIsGSCModalOpen(true)}
                    className="bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl px-5 py-3 flex items-center justify-center gap-2.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer hover:shadow-xs"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Connect Google Search Console</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Connected Real Dynamic GSC Dashboard */
              <div className="px-6 py-5 max-w-[1400px] mx-auto space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-[#7C3AED] text-lg">G</span>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Google Search Console Performance</h1>
                      <div className="text-xs text-gray-500 font-mono">{gscSite}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsGSCConnected(false)}
                      className="text-xs text-gray-500 hover:text-red-600 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-red-50 cursor-pointer"
                    >
                      Disconnect Property
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Exported GSC data to CSV')}
                      className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer uppercase shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>EXPORT</span>
                    </button>
                  </div>
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">TOTAL CLICKS</div>
                    <div className="text-2xl font-black text-[#7C3AED] mt-1">14.8K</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +12.4% vs last period</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">TOTAL IMPRESSIONS</div>
                    <div className="text-2xl font-black text-purple-600 mt-1">382.4K</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +8.7% vs last period</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">AVERAGE CTR</div>
                    <div className="text-2xl font-black text-emerald-600 mt-1">3.9%</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +0.4% vs last period</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                    <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">AVERAGE POSITION</div>
                    <div className="text-2xl font-black text-amber-600 mt-1">14.2</div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +2.1 pos vs last period</div>
                  </div>
                </div>

                {/* Performance Chart Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-sm text-gray-900">Search performance over time</h3>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-[#7C3AED]">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Clicks
                      </span>
                      <span className="flex items-center gap-1.5 text-purple-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Impressions
                      </span>
                    </div>
                  </div>
                  <div className="h-44 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 600 120" fill="none">
                      <line x1="20" y1="100" x2="580" y2="100" stroke="#E2E8F0" strokeWidth="1" />
                      <path
                        d="M 20 85 Q 120 40 220 70 T 400 35 T 580 50"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M 20 60 Q 140 20 260 55 T 440 25 T 580 30"
                        fill="none"
                        stroke="#9333EA"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    </svg>
                  </div>
                </div>

                {/* Top Queries Table */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-200 font-bold text-xs text-gray-800 uppercase tracking-wider">
                    Top Google Search Queries
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/70 border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-4">TOP QUERIES</th>
                          <th className="py-2.5 px-4 text-right">CLICKS</th>
                          <th className="py-2.5 px-4 text-right">IMPRESSIONS</th>
                          <th className="py-2.5 px-4 text-right">CTR</th>
                          <th className="py-2.5 px-4 text-right">POSITION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {[
                          { query: 'work composer', clicks: '4,892', imp: '18,400', ctr: '26.6%', pos: '1.2' },
                          { query: 'employee tracking software', clicks: '2,940', imp: '42,100', ctr: '7.0%', pos: '4.1' },
                          { query: 'time tracking software with screenshots', clicks: '1,830', imp: '28,900', ctr: '6.3%', pos: '3.8' },
                          { query: 'remote work monitoring', clicks: '920', imp: '19,300', ctr: '4.8%', pos: '6.4' },
                          { query: 'stealth employee tracker', clicks: '740', imp: '12,500', ctr: '5.9%', pos: '5.2' },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-3 px-4 font-semibold text-gray-900">{row.query}</td>
                            <td className="py-3 px-4 text-right font-mono text-[#7C3AED] font-bold">{row.clicks}</td>
                            <td className="py-3 px-4 text-right font-mono text-gray-600">{row.imp}</td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold">{row.ctr}</td>
                            <td className="py-3 px-4 text-right font-mono text-amber-600 font-bold">{row.pos}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SEO POTENTIAL (100% Authentic Match to SE Ranking Screenshot & DOM) */}
        {/* ========================================================================= */}
        {tabParam === 'potential' && (
          <div className="px-6 py-5 max-w-[1400px] mx-auto animate-in fade-in duration-200">
            <SeoPotentialView />
          </div>
        )}
      </div>



      {/* ========================================================================= */}
      {/* ALL INTERACTIVE MODALS */}
      {/* ========================================================================= */}

      {/* Edit Conversion Ratio Modal */}
      {isEditConversionOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Conversion into sales ratio</h3>
              <button
                type="button"
                onClick={() => setIsEditConversionOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Enter Ratio (e.g. 1:100, 1:50)</label>
              <input
                type="text"
                value={tempConversion}
                onChange={(e) => setTempConversion(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-hidden focus:border-[#7C3AED]"
              />
              <p className="text-[11px] text-gray-400">
                1 sale for every 100 unique website visitors (1% baseline conversion).
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditConversionOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConversionRatio(tempConversion);
                  setIsEditConversionOpen(false);
                  showToast(`Conversion ratio set to ${tempConversion}`);
                }}
                className="px-4 py-2 bg-[#3B72FF] hover:bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Save Ratio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Average Revenue Modal */}
      {isEditRevenueOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Average revenue per customer</h3>
              <button
                type="button"
                onClick={() => setIsEditRevenueOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Enter Value ($)</label>
              <input
                type="number"
                value={tempRevenue}
                onChange={(e) => setTempRevenue(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-hidden focus:border-emerald-500"
              />
              <p className="text-[11px] text-gray-400">
                Average transaction amount or subscription value per paying customer.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditRevenueOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setAvgRevenue(Number(tempRevenue) || 50);
                  setIsEditRevenueOpen(false);
                  showToast(`Average revenue updated to $${tempRevenue}`);
                }}
                className="px-4 py-2 bg-[#2BB673] hover:bg-[#259b62] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Save Value
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Keywords Modal for SEO Potential */}
      {isAddKeywordsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#2BB673]" />
                <h3 className="text-sm font-bold text-gray-900">Add Keywords to Estimate SEO Potential</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddKeywordsOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Enter target keywords line by line to calculate potential traffic and revenue forecast:
            </p>
            <textarea
              rows={5}
              placeholder={`work composer\nemployee tracking software\ntime tracking software\nremote team management`}
              value={newKeywordsInput}
              onChange={(e) => setNewKeywordsInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-[#2BB673]"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddKeywordsOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasPotentialKeywords(true);
                  setIsAddKeywordsOpen(false);
                  showToast('Calculated SEO potential for added keywords!');
                }}
                className="px-5 py-2 bg-[#2BB673] hover:bg-[#259b62] text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
              >
                Calculate Potential
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Read More Modal for SEO Potential */}
      {isReadMoreOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">How Does SEO Potential Work?</h3>
              <button
                type="button"
                onClick={() => setIsReadMoreOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <p>
                <strong>1. Traffic Estimate:</strong> Based on the total search volume of your tracked keywords and their hypothetical ranking in the top 10 SERP spots, multiplied by industry click-through rates (CTR).
              </p>
              <p>
                <strong>2. Conversion into Sales:</strong> Your assumed conversion rate (e.g. 1:100 = 1%) estimates how many search engine visits will convert into paying customers.
              </p>
              <p>
                <strong>3. Revenue Potential:</strong> Total potential revenue is derived from `Estimated Clients × Average Revenue per Customer`.
              </p>
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsReadMoreOpen(false)}
                className="px-5 py-2 bg-[#7C3AED] hover:bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Analytics Modal */}
      {isGAModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-lg">📊</span>
                <h3 className="text-sm font-bold text-gray-900">Connect Google Analytics 4</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGAModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Connect your GA4 property to fetch organic traffic, sessions, and conversion data for <strong>{domain}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Select GA4 Property</label>
                <select
                  value={gaProperty}
                  onChange={(e) => setGaProperty(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#7C3AED]"
                >
                  <option value="workcomposer.com (GA4-48291054)">workcomposer.com (GA4-48291054)</option>
                  <option value="app.workcomposer.com (GA4-59201948)">app.workcomposer.com (GA4-59201948)</option>
                  <option value="api.workcomposer.com (GA4-10294851)">api.workcomposer.com (GA4-10294851)</option>
                </select>
              </div>

              <div className="p-3 bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg text-[11px] text-[#4C1D95] flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                <span>
                  Read-only permissions are requested. Your analytics credentials remain securely encrypted with industry standards.
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsGAModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsGAConnected(true);
                  setIsGAModalOpen(false);
                  showToast('Google Analytics 4 connected!');
                }}
                className="px-5 py-2 bg-[#7C3AED] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Authorize &amp; Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Search Console Modal */}
      {isGSCModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[#7C3AED] font-bold">G</span>
                <h3 className="text-sm font-bold text-gray-900">Connect Google Search Console</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGSCModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Connect Google Search Console to pull genuine search impressions, clicks, CTR, and average SERP positions for <strong>{domain}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Select Verified Property</label>
                <select
                  value={gscSite}
                  onChange={(e) => setGscSite(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#7C3AED]"
                >
                  <option value="sc-domain:workcomposer.com">sc-domain:workcomposer.com</option>
                  <option value="https://www.workcomposer.com/">https://www.workcomposer.com/</option>
                  <option value="https://workcomposer.com/">https://workcomposer.com/</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Property verification verified via DNS TXT record. Ready for immediate synchronization.
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsGSCModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsGSCConnected(true);
                  setIsGSCModalOpen(false);
                  showToast('Google Search Console connected!');
                }}
                className="px-5 py-2 bg-[#7C3AED] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Connect GSC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Matomo Modal */}
      {isMatomoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#3152A0] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  M
                </div>
                <h3 className="text-sm font-bold text-gray-900">Connect Matomo Analytics</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMatomoModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Connect self-hosted or cloud Matomo instances to fetch on-premise privacy-compliant analytics.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Matomo Instance URL</label>
                <input
                  type="url"
                  value={matomoUrl}
                  onChange={(e) => setMatomoUrl(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Site ID</label>
                  <input
                    type="text"
                    value={matomoSiteId}
                    onChange={(e) => setMatomoSiteId(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Auth Token (token_auth)</label>
                  <input
                    type="password"
                    placeholder="32-char hex token"
                    value={matomoToken}
                    onChange={(e) => setMatomoToken(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-medium focus:outline-hidden focus:border-[#7C3AED]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsMatomoModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMatomoConnected(true);
                  setIsMatomoModalOpen(false);
                  showToast('Matomo Analytics connected!');
                }}
                className="px-5 py-2 bg-[#7C3AED] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Connect Matomo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Link Modal */}
      {isGuestLinkOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Get access to guest links</h3>
              <button
                type="button"
                onClick={() => setIsGuestLinkOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Share this link with your clients or team members to let them view website analytics and traffic without logging into the system.
            </p>
            <div className="p-3 bg-[#E6F4EA]/70 border border-[#CEEAD6] text-[#137333] rounded-lg flex items-center justify-between text-xs">
              <span className="truncate font-mono mr-2">
                https://online.seranking.com/guest.html?site_id=12960641&amp;section=analytics
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('https://online.seranking.com/guest.html?site_id=12960641&section=analytics');
                  showToast('Guest link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 text-[#7C3AED] font-semibold hover:underline shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy link</span>
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsGuestLinkOpen(false)}
                className="px-5 py-2 bg-[#7C3AED] hover:bg-[#0B59EE] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Bug Modal */}
      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Project Notes Modal */}
      <ProjectNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        siteName={cleanDomain}
        onNotesCountChange={(cnt) => setNotesCount(cnt)}
      />

      {/* Authentic Google Account Chooser Modal matching Screenshot */}
      <GoogleAccountChooserModal
        isOpen={isGoogleChooserOpen}
        onClose={() => setIsGoogleChooserOpen(false)}
        serviceName={googleChooserService}
        onSelectAccount={handleGoogleAccountSelected}
      />
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading analytics &amp; traffic...</div>}>
      <AnalyticsPageContent />
    </Suspense>
  );
}
