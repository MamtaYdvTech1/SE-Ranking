'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Search,
  Zap,
  Globe2,
  BarChart3,
  Users,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Play,
  Layers,
  FileSearch,
  Building,
  Check,
  CreditCard,
  Bot,
  ExternalLink,
  Database,
  Code2,
  FileText,
  Megaphone,
  Radio,
  Target,
  Key,
  Globe,
  Award,
  Sliders,
  CheckSquare,
  MapPin,
  Briefcase,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  Lock,
  Headphones,
  UserCheck,
  FileCode2,
  X,
  Copy,
  Star,
  CheckCircle2,
  Menu,
  Smartphone,
  Laptop,
  HelpCircle,
  Plus,
  Filter,
  DollarSign,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

interface KeywordSuggestionItem {
  keyword: string;
  vol: string;
  diff: number;
  cpc: string;
  intent: string;
}

interface TrendPoint {
  month: string;
  vol: number;
}

export default function KeywordToolPage() {
  const [showHelloBar, setShowHelloBar] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search input state
  const [keywordQuery, setKeywordQuery] = useState('coffee beans');
  const [countryInput, setCountryInput] = useState('US');
  const [activeKpiKeyword, setActiveKpiKeyword] = useState('coffee beans');

  // Real provider states
  const [kpiMetrics, setKpiMetrics] = useState<{
    difficulty: number | null;
    volume: number | null;
    cpc: number | null;
    intent: string | null;
  }>({ difficulty: null, volume: null, cpc: null, intent: null });
  const [trendHistory, setTrendHistory] = useState<TrendPoint[] | null>(null);
  const [keywordSuggestions, setKeywordSuggestions] = useState<KeywordSuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthRequired, setIsAuthRequired] = useState(false);

  // Section 1 tab switcher
  const [activeTab, setActiveTab] = useState<'similar' | 'related' | 'questions' | 'gaps'>('similar');

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Product tour modal
  const [isProductTourOpen, setIsProductTourOpen] = useState(false);

  const getAuthHeaders = (): HeadersInit => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const performAnalysis = async (query: string, country: string) => {
    const cleanKw = query.trim().toLowerCase();
    if (!cleanKw) return;
    setIsLoading(true);
    setErrorMessage(null);
    setIsAuthRequired(false);
    setActiveKpiKeyword(cleanKw);

    try {
      const fetchJson = async (url: string, body: any) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => null);
        return { httpStatus: res.status, ok: res.ok, ...(data || {}) };
      };

      const [kwRes, ideasRes] = await Promise.allSettled([
        fetchJson('/api/seo/keywords', { keywords: [cleanKw] }),
        fetchJson('/api/seo/keyword-ideas', { keyword: cleanKw, limit: 30 }),
      ]);

      let hasAuthIssue = false;

      // Handle overview metrics
      if (kwRes.status === 'fulfilled') {
        const val = kwRes.value;
        if (val.httpStatus === 401) {
          hasAuthIssue = true;
        } else if (val.success && val.data?.keywords?.[0]) {
          const item = val.data.keywords[0];
          setKpiMetrics({
            difficulty: typeof item.difficulty === 'number' ? item.difficulty : null,
            volume: typeof item.volume === 'number' ? item.volume : null,
            cpc: typeof item.cpc === 'number' ? item.cpc : null,
            intent: item.intent || null,
          });

          if (Array.isArray(item.trend) && item.trend.length > 0) {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            setTrendHistory(
              item.trend.map((t: any) => ({
                month: monthNames[(t.month || 1) - 1] || `${t.month}`,
                vol: t.volume || 0,
              }))
            );
          } else {
            setTrendHistory(null); // Never fabricate graphs if unavailable
          }
        } else if (!val.success && val.error) {
          setErrorMessage(val.error);
        }
      }

      // Handle ideas
      if (ideasRes.status === 'fulfilled') {
        const val = ideasRes.value;
        if (val.httpStatus === 401) {
          hasAuthIssue = true;
        } else if (val.success && Array.isArray(val.data?.keywords)) {
          const mapped: KeywordSuggestionItem[] = val.data.keywords.map((k: any) => ({
            keyword: k.keyword,
            vol: typeof k.volume === 'number' ? (k.volume >= 1000 ? `${(k.volume / 1000).toFixed(1)}K` : String(k.volume)) : '—',
            diff: k.difficulty ?? 0,
            cpc: typeof k.cpc === 'number' ? `$${k.cpc.toFixed(2)}` : '—',
            intent: k.intent || 'Commercial',
          }));
          setKeywordSuggestions(mapped);
        } else if (!val.success && val.error && !errorMessage) {
          setErrorMessage(val.error);
        }
      }

      if (hasAuthIssue) {
        setIsAuthRequired(true);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to query keyword APIs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordQuery.trim()) return;
    performAnalysis(keywordQuery, countryInput);
  };

  const faqs = [
    {
      q: 'How does SE Ranking’s Keyword Research Tool work?',
      a: 'SE Ranking maintains an index of over 4.2 billion keywords across 190+ countries. When you enter a target seed term, our engine analyzes search volume, keyword difficulty, cost-per-click, search intent, and live SERP features to generate thousands of actionable ideas.',
      hasTable: true,
    },
    {
      q: 'What is Keyword Difficulty and how is it calculated?',
      a: 'Keyword Difficulty (KD) is a 0-100 metric calculated by evaluating the backlink strength, Domain Trust, and content depth of the top 10 search results on Google. Scores under 30 indicate low-competition opportunities you can rank for faster.',
    },
    {
      q: 'Can I find long-tail keyword questions and variations?',
      a: 'Yes. The tool segments results into Similar Keywords, Related Keywords, and Question-based Queries (e.g. who, what, where, how), making it easy to build comprehensive content clusters and capture featured snippets.',
    },
    {
      q: 'How many countries does SE Ranking cover?',
      a: 'SE Ranking covers 190+ countries and global Google regional databases, with localized search volume, currency CPCs, and regional competitor insights.',
    },
    {
      q: 'How often is keyword search volume updated?',
      a: 'Search volume and historical trends are refreshed every 30 days to reflect seasonal demand shifts, viral search spikes, and evolving searcher intent.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. TOP PROMO BANNER */}
      {showHelloBar && (
        <div className="bg-[#10B981] text-white py-2 px-4 text-xs sm:text-sm font-medium flex items-center justify-between z-50 relative">
          <div className="flex-1 flex items-center justify-center gap-2 text-center">
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>
              Try our new <strong>AI Search Overview generator</strong> for free!
            </span>
            <Link href="/ai-results-tracker" className="underline font-bold hover:text-white/80 transition-colors ml-1">
              Get started →
            </Link>
          </div>
          <button onClick={() => setShowHelloBar(false)} className="text-white/80 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. OFFICIAL NAVBAR */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group">
              <SeRankingLogo variant="brand" width={130} height={32} />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-700">
              <div
                className="relative"
                onMouseEnter={() => setActiveMenu('product')}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className="flex items-center gap-1 py-4 text-[#0B69FF] font-bold cursor-pointer">
                  <span>Product</span>
                  <ChevronDown className="w-4 h-4 text-[#0B69FF]" />
                </button>
                {activeMenu === 'product' && (
                  <div className="absolute top-full left-0 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-3 grid gap-1 z-50">
                    <Link href="/keyword-tool" className="p-2.5 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center gap-3 font-bold text-xs">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0B69FF] flex items-center justify-center">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <div>Keyword Tool</div>
                        <div className="text-[10px] text-blue-600 font-normal">Active Tool</div>
                      </div>
                    </Link>
                    <Link href="/keyword-rank-tracker" className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-800 flex items-center gap-3 text-xs">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">Keyword Rank Tracker</div>
                        <div className="text-[10px] text-gray-500">100% accurate ranking data</div>
                      </div>
                    </Link>
                    <Link href="/website-audit-tool" className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-800 flex items-center gap-3 text-xs">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <FileSearch className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">Website Audit</div>
                        <div className="text-[10px] text-gray-500">Technical health check</div>
                      </div>
                    </Link>
                    <Link href="/on-page-seo-checker" className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-800 flex items-center gap-3 text-xs">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">On-Page SEO Checker</div>
                        <div className="text-[10px] text-gray-500">Benchmark against SERP leaders</div>
                      </div>
                    </Link>
                    <Link href="/competitor-analysis-tool" className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-800 flex items-center gap-3 text-xs">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">Competitor Analysis Tool</div>
                        <div className="text-[10px] text-gray-500">Reverse engineer organic & paid traffic</div>
                      </div>
                    </Link>
                    <Link href="/backlink-checker" className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-800 flex items-center gap-3 text-xs">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">Backlink Checker</div>
                        <div className="text-[10px] text-gray-500">3.2T backlinks database</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <div
                className="relative"
                onMouseEnter={() => setActiveMenu('solutions')}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className="flex items-center gap-1 py-4 hover:text-[#0B69FF] transition-colors cursor-pointer">
                  <span>Solutions</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {activeMenu === 'solutions' && (
                  <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2.5 grid gap-1 z-50">
                    <Link href="/for-agencies" className="p-2 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-3 text-xs font-semibold">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>For Marketing Agencies</span>
                    </Link>
                    <Link href="/enterprise" className="p-2 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-3 text-xs font-semibold">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>Enterprises</span>
                    </Link>
                    <Link href="/growing-business" className="p-2 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-3 text-xs font-semibold">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>Growing Businesses</span>
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/enterprise" className="py-4 hover:text-[#0B69FF] transition-colors">
                Enterprise
              </Link>
              <Link href="/billing" className="py-4 hover:text-[#0B69FF] transition-colors">
                Pricing
              </Link>
              <Link href="/api-docs" className="py-4 hover:text-[#0B69FF] transition-colors">
                API
              </Link>
            </nav>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-[#0B69FF] px-3 py-2">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-[#0B69FF] hover:bg-[#0052cc] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-6 space-y-4">
            <Link href="/keyword-tool" className="block text-base font-bold text-[#0B69FF] py-2">
              Keyword Tool
            </Link>
            <Link href="/keyword-rank-tracker" className="block text-base font-medium text-gray-800 py-2">
              Rank Tracker
            </Link>
            <Link href="/for-agencies" className="block text-base font-medium text-gray-800 py-2">
              For Agencies
            </Link>
            <Link href="/enterprise" className="block text-base font-medium text-gray-800 py-2">
              Enterprise
            </Link>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section className="top-block container pt-12 sm:pt-16 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="se-title-text max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-6 border border-purple-200">
            <Key className="w-3.5 h-3.5" />
            <span>4.2 Billion Keyword Database</span>
          </div>

          <h1 className="se-title heading-1 text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.12] mb-6">
            Keyword Tool
          </h1>

          <p className="se-text se-text_regular se-text_hero text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Discover high-intent keyword ideas, analyze difficulty and search volume, and unlock untapped organic search opportunities.
          </p>
        </div>

        {/* Interactive Keyword Search Bar */}
        <div className="max-w-3xl mx-auto mb-10">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-2xl border border-gray-300 shadow-xl">
            <div className="flex-1 flex items-center gap-3 px-3 w-full">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={keywordQuery}
                onChange={(e) => setKeywordQuery(e.target.value)}
                placeholder="Enter keyword (e.g. coffee beans, crm software, local seo)"
                className="w-full py-2 text-sm focus:outline-none text-gray-900 placeholder-gray-400"
              />
            </div>

            <select
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold bg-gray-50 focus:outline-none cursor-pointer w-full sm:w-auto"
            >
              <option value="US">🇺🇸 United States</option>
              <option value="UK">🇬🇧 United Kingdom</option>
              <option value="DE">🇩🇪 Germany</option>
              <option value="FR">🇫🇷 France</option>
            </select>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#0B69FF] hover:bg-[#0052cc] text-white font-bold text-sm shadow-md transition-all w-full sm:w-auto cursor-pointer"
            >
              Analyze Keywords
            </button>
          </form>
        </div>

        {/* Provider Error / Auth Banner */}
        {isAuthRequired && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4 text-xs text-rose-900 text-left">
            <div>
              <span className="font-bold text-sm block mb-0.5">Authentication Required</span>
              <p className="text-rose-700">Please sign in to query live keyword search volumes and suggestions.</p>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 bg-[#0B69FF] hover:bg-[#0052cc] text-white font-bold rounded-xl text-xs shrink-0 transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}

        {errorMessage && !isAuthRequired && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 text-left">
            <span className="font-bold">YepAPI Provider Notice: </span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 3 Quick KPI Cards (Real provider data or honest dash) */}
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
          {/* Card 1: Difficulty (Purple) */}
          <div className="bg-[#9333EA] text-white rounded-3xl p-6 shadow-xl text-left flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between text-xs font-bold text-purple-200">
              <span>Keyword Difficulty</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-[11px]">KD</span>
            </div>
            <div>
              <div className="text-3xl font-black">
                {kpiMetrics.difficulty !== null ? `${kpiMetrics.difficulty} / 100` : (isLoading ? '...' : '—')}
              </div>
              <div className="text-xs text-purple-200 mt-0.5">
                {kpiMetrics.difficulty !== null
                  ? kpiMetrics.difficulty > 60 ? 'Hard • High competition' : kpiMetrics.difficulty > 30 ? 'Moderate competition' : 'Low competition'
                  : 'Difficulty metric'}
              </div>
            </div>
          </div>

          {/* Card 2: Search Volume (Dark Purple) */}
          <div className="bg-[#1E1B4B] text-white rounded-3xl p-6 shadow-xl text-left flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
              <span>Monthly Search Volume</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-[11px]">{countryInput}</span>
            </div>
            <div>
              <div className="text-3xl font-black">
                {kpiMetrics.volume !== null ? kpiMetrics.volume.toLocaleString() : (isLoading ? '...' : '—')}
              </div>
              <div className="text-xs text-indigo-300 mt-0.5">Monthly searches via YepAPI</div>
            </div>
          </div>

          {/* Card 3: CPC / Value (Vibrant Blue) */}
          <div className="bg-[#0B69FF] text-white rounded-3xl p-6 shadow-xl text-left flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between text-xs font-bold text-blue-200">
              <span>Estimated CPC</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-[11px]">Google Ads</span>
            </div>
            <div>
              <div className="text-3xl font-black">
                {kpiMetrics.cpc !== null ? `$${kpiMetrics.cpc.toFixed(2)}` : (isLoading ? '...' : '—')}
              </div>
              <div className="text-xs text-blue-200 mt-0.5">{kpiMetrics.intent || 'Search Intent'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION 1: "Comprehensive metrics to evaluate keyword potential" */}
      <section className="py-20 bg-gray-50/70 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Comprehensive metrics to evaluate keyword potential
            </h2>

            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {[
                { id: 'similar', label: 'Similar Keywords' },
                { id: 'related', label: 'Related Keywords' },
                { id: 'questions', label: 'Question Queries' },
                { id: 'gaps', label: 'Low-Competition Gaps' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Mockup (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-200 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#0B69FF]" />
                  <span className="text-xs font-bold text-gray-900">
                    Keyword Ideas for: <strong className="text-blue-600">&quot;{activeKpiKeyword}&quot;</strong>
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-500">{keywordSuggestions.length} Suggestions</span>
              </div>

              <div className="overflow-x-auto">
                {keywordSuggestions.length === 0 ? (
                  <div className="p-10 text-center text-xs text-gray-500">
                    {isLoading ? 'Fetching suggestions...' : 'No keyword suggestions returned for this query.'}
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 text-[11px]">
                      <tr>
                        <th className="p-3">Keyword Suggestion</th>
                        <th className="p-3">Volume</th>
                        <th className="p-3">Difficulty</th>
                        <th className="p-3">CPC</th>
                        <th className="p-3">Intent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {keywordSuggestions.map((row, i) => (
                        <tr key={i} className="hover:bg-purple-50/40 transition-colors">
                          <td className="p-3 font-semibold text-gray-900">{row.keyword}</td>
                          <td className="p-3 font-bold text-gray-800">{row.vol}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                row.diff < 25 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {row.diff} KD
                            </span>
                          </td>
                          <td className="p-3 text-gray-600">{row.cpc}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-medium">
                              {row.intent}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* 12-Month Search Volume Bar Chart or Honest Fallback */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="text-xs font-bold text-gray-700 mb-2">12-Month Search Volume Trend</div>
                {trendHistory && trendHistory.length > 0 ? (
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendHistory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="vol" fill="#0B69FF" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-32 w-full flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center p-4">
                    <span className="text-xs font-semibold text-gray-500">Historical data unavailable</span>
                    <p className="text-[11px] text-gray-400 mt-0.5">Monthly search trend data is not provided by the upstream data provider for this keyword.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Feature Highlights (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-2xl font-black text-gray-900 leading-tight">
                Analyze keyword search volume and true commercial intent
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Filter keywords by monthly volume, intent, search engine results page features, and cost-per-click to prioritize keywords that actually convert into customers.
              </p>

              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <span>Keyword Difficulty score based on top-ranking domains' backlink profiles</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <span>Search intent classification: Informational, Commercial, Navigational, Transactional</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <span>12-month historical search trends to identify seasonal demand peaks</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/research"
                  className="px-7 py-3 rounded-full bg-[#0B69FF] hover:bg-[#0052cc] text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Keywords</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MID-PAGE CTA BANNER 1 (Vibrant Blue) */}
      <section className="py-16 bg-[#0B69FF] text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4">
            Supercharge your keyword strategy with actionable keyword potential
          </h2>
          <Link
            href="/signup"
            className="px-8 py-3.5 rounded-full bg-white text-[#0B69FF] font-black text-sm shadow-xl hover:bg-gray-50 transition-all inline-block cursor-pointer mt-4"
          >
            Start 14-day free trial
          </Link>
        </div>
      </section>

      {/* 6. SECTION 3: "Identify low-hanging fruit and untapped search queries" */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Quickly filter for low-competition keyword opportunities
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Filter by Difficulty under 30 and Search Volume over 1,000 to find instant ranking wins.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div className="bg-[#F8FAFC] rounded-3xl p-8 border border-gray-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-4">
                ✓
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Low-Hanging Fruit Filter</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                Target queries where current ranking pages have weak backlink profiles and short content. These are the easiest pages to outrank with well-structured articles.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 rounded bg-white border border-gray-200 flex justify-between">
                  <span>KD &lt; 25 (Easy)</span>
                  <span className="text-emerald-600 font-bold">142 Keywords</span>
                </div>
                <div className="p-2 rounded bg-white border border-gray-200 flex justify-between">
                  <span>Volume &gt; 1,000/mo</span>
                  <span className="text-blue-600 font-bold">89 Keywords</span>
                </div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-3xl p-8 border border-gray-200">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-4">
                ✓
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Question-Based Queries</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                Discover exact questions searchers type into Google. Perfect for optimizing for Google's People Also Ask and AI Overviews citations.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 rounded bg-white border border-gray-200 flex justify-between">
                  <span>"How to...", "What is..."</span>
                  <span className="text-purple-600 font-bold">310 Questions</span>
                </div>
                <div className="p-2 rounded bg-white border border-gray-200 flex justify-between">
                  <span>AI Overview Triggers</span>
                  <span className="text-emerald-600 font-bold">84% Presence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MID-PAGE CTA BANNER 2 (Vibrant Blue) */}
      <section className="py-16 bg-[#0B69FF] text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4">
            Start discovering high-potential keywords for your website today
          </h2>
          <Link
            href="/signup"
            className="px-8 py-3.5 rounded-full bg-white text-[#0B69FF] font-black text-sm shadow-xl hover:bg-gray-50 transition-all inline-block cursor-pointer mt-4"
          >
            Try Keyword Tool Free
          </Link>
        </div>
      </section>

      {/* 8. FAQ ACCORDION WITH COMPARISON TABLE */}
      <section className="py-24 bg-gray-50 border-t border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-gray-900 text-base hover:text-blue-600 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180 text-blue-600' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    <p className="mb-4">{faq.a}</p>

                    {/* Comparison Table for FAQ 1 */}
                    {faq.hasTable && (
                      <div className="overflow-x-auto mt-4 rounded-xl border border-gray-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                            <tr>
                              <th className="p-3">Feature</th>
                              <th className="p-3 text-blue-600">SE Ranking Keyword Tool</th>
                              <th className="p-3 text-gray-500">Google Keyword Planner</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            <tr>
                              <td className="p-3 font-semibold text-gray-900">Search Volume Accuracy</td>
                              <td className="p-3 font-bold text-emerald-600">Exact monthly search counts</td>
                              <td className="p-3 text-gray-400">Broad ranges (e.g. 10K - 100K)</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-semibold text-gray-900">Keyword Difficulty Score</td>
                              <td className="p-3 font-bold text-emerald-600">0-100 Organic SEO KD</td>
                              <td className="p-3 text-gray-400">Ad competition only (Low/Med/High)</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-semibold text-gray-900">Search Intent Classification</td>
                              <td className="p-3 font-bold text-emerald-600">Automatic (Commercial, Info, etc.)</td>
                              <td className="p-3 text-gray-400">Not available</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-semibold text-gray-900">AI Overview Tracking</td>
                              <td className="p-3 font-bold text-emerald-600">Detects SGE & AI Overviews</td>
                              <td className="p-3 text-gray-400">Not available</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-semibold text-gray-900">SERP Feature Analysis</td>
                              <td className="p-3 font-bold text-emerald-600">Top 100 organic search snapshot</td>
                              <td className="p-3 text-gray-400">Not available</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. OFFICIAL FOOTER */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Core SEO Tools</div>
              <ul className="space-y-2">
                <li><Link href="/keyword-tool" className="text-[#0B69FF] font-bold">Keyword Tool</Link></li>
                <li><Link href="/keyword-rank-tracker" className="hover:text-blue-600">Rank Tracker</Link></li>
                <li><Link href="/website-audit" className="hover:text-blue-600">Website Audit</Link></li>
                <li><Link href="/competitors" className="hover:text-blue-600">Competitor Research</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Solutions</div>
              <ul className="space-y-2">
                <li><Link href="/for-agencies" className="hover:text-blue-600">For Agencies</Link></li>
                <li><Link href="/enterprise" className="hover:text-blue-600">For Enterprises</Link></li>
                <li><Link href="/growing-business" className="hover:text-blue-600">For Small Business</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Resources</div>
              <ul className="space-y-2">
                <li><Link href="/api-docs" className="hover:text-blue-600">API Documentation</Link></li>
                <li><Link href="/help" className="hover:text-blue-600">Help Center</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Company</div>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:text-blue-600">About Us</Link></li>
                <li><Link href="/affiliate" className="hover:text-blue-600">Affiliates</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Keyword Database</div>
              <ul className="space-y-2">
                <li><span className="text-gray-700 font-semibold">4.2B Keywords</span></li>
                <li><span className="text-gray-700 font-semibold">190+ Countries</span></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Mobile Apps</div>
              <div className="space-y-2">
                <a href="https://apps.apple.com" target="_blank" rel="noreferrer" className="block px-3 py-2 bg-gray-900 text-white rounded-lg font-semibold text-center">
                  App Store
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SeRankingLogo variant="dark" width={100} height={24} />
              <span>© {new Date().getFullYear()} SE Ranking Ltd. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
              <Link href="/terms" className="hover:underline">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
