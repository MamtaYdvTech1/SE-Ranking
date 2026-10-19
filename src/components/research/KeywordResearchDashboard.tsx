'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Download,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface KeywordResearchDashboardProps {
  keyword: string;
  country?: string;
  countryCode?: string;
  initialTab?: 'overview' | 'similar' | 'questions' | 'serp';
  onNewSearch: () => void;
}

interface RealKeywordData {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  competition: number;
  competitionLevel?: string;
  intent?: string;
  trend?: Array<{ month: string; volume: number }>;
}

interface RealIdeaItem {
  keyword: string;
  volume: number;
  kd: number;
  cpc: number;
  intent: string;
}

interface RealSerpItem {
  pos: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

export function KeywordResearchDashboard({
  keyword,
  country = 'United States',
  countryCode = 'us',
  initialTab = 'overview',
  onNewSearch,
}: KeywordResearchDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'similar' | 'questions' | 'serp'>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const [metricData, setMetricData] = useState<RealKeywordData | null>(null);
  const [ideas, setIdeas] = useState<RealIdeaItem[]>([]);
  const [serpItems, setSerpItems] = useState<RealSerpItem[]>([]);
  const [activeProviderName, setActiveProviderName] = useState<string>('SEO Provider');
  const [isAuthError, setIsAuthError] = useState(false);

  const cleanKeyword = keyword.trim().toLowerCase();

  const getAuthHeaders = (): HeadersInit => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  };

  const fetchRealData = async () => {
    if (!cleanKeyword) return;
    setIsLoading(true);
    setErrorMessage(null);
    setIsAuthError(false);

    try {
      const fetchJson = async (url: string, body: any) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => null);
        return {
          httpStatus: res.status,
          ok: res.ok,
          ...(data || {}),
        };
      };

      // 1. Fetch real keyword overview metrics via YepAPI
      const kwPromise = fetchJson('/api/seo/keywords', { keywords: [cleanKeyword] });

      // 2. Fetch real keyword ideas via YepAPI
      const ideasPromise = fetchJson('/api/seo/keyword-ideas', { keyword: cleanKeyword, limit: 30 });

      // 3. Fetch real Google SERP top 10 via YepAPI / Serper
      const serpPromise = fetchJson('/api/seo/serp', { query: cleanKeyword, depth: 10 });

      const [kwResult, ideasResult, serpResult] = await Promise.allSettled([
        kwPromise,
        ideasPromise,
        serpPromise,
      ]);

      let hasAnySuccess = false;
      let collectedError: string | null = null;
      let has401 = false;

      // Handle Keywords
      if (kwResult.status === 'fulfilled') {
        const val = kwResult.value;
        if (val.httpStatus === 401) {
          has401 = true;
        } else if (val.success && val.data?.keywords?.[0]) {
          const item = val.data.keywords[0];
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const mappedTrend = Array.isArray(item.trend)
            ? item.trend.map((t: any) => ({
                month: monthNames[(t.month || 1) - 1] || `${t.month}`,
                volume: t.volume || 0,
              }))
            : [];

          setMetricData({
            keyword: item.keyword,
            volume: item.volume ?? 0,
            difficulty: item.difficulty ?? 0,
            cpc: item.cpc ?? 0,
            competition: item.competition ?? 0,
            competitionLevel: item.competitionLevel ?? 'LOW',
            intent: item.intent ?? 'Informational',
            trend: mappedTrend.length > 0 ? mappedTrend : [{ month: 'Current', volume: item.volume ?? 0 }],
          });
          hasAnySuccess = true;
        } else if (!val.success && val.error) {
          collectedError = val.error;
        }
      }

      // Handle Ideas
      if (ideasResult.status === 'fulfilled') {
        const val = ideasResult.value;
        if (val.httpStatus === 401) {
          has401 = true;
        } else if (val.success && Array.isArray(val.data?.keywords)) {
          const mappedIdeas: RealIdeaItem[] = val.data.keywords.map((k: any) => ({
            keyword: k.keyword,
            volume: k.volume ?? 0,
            kd: k.difficulty ?? 0,
            cpc: k.cpc ?? 0,
            intent: k.intent ?? 'Commercial',
          }));
          setIdeas(mappedIdeas);
          hasAnySuccess = true;
        } else if (!val.success && val.error && !collectedError) {
          collectedError = val.error;
        }
      }

      // Handle SERP
      if (serpResult.status === 'fulfilled') {
        const val = serpResult.value;
        if (val.httpStatus === 401) {
          has401 = true;
        } else if (val.success && Array.isArray(val.data?.results)) {
          const mappedSerp: RealSerpItem[] = val.data.results
            .filter((r: any) => r.type === 'organic' || !r.type)
            .map((r: any, idx: number) => ({
              pos: r.position || idx + 1,
              title: r.title || 'Untitled Result',
              url: r.url || '',
              domain: r.domain || '',
              snippet: r.description || '',
            }));
          setSerpItems(mappedSerp);
          if (val.provider) {
            setActiveProviderName(val.provider);
          }
          hasAnySuccess = true;
        } else if (!val.success && val.error && !collectedError) {
          collectedError = val.error;
        }
      }

      if (has401) {
        setIsAuthError(true);
        setErrorMessage('Authentication required. Please sign in to access Keyword Research.');
      } else if (!hasAnySuccess) {
        setErrorMessage(collectedError || 'No live data could be retrieved for this keyword. Please check API credentials or credit balance.');
      } else if (collectedError) {
        setErrorMessage(`Partial data notice: ${collectedError}`);
      }

      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to connect to SEO data provider.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, [cleanKeyword]);

  const volume = metricData?.volume ?? 0;
  const kd = metricData?.difficulty ?? 0;
  const cpc = metricData?.cpc ?? 0;
  const intent = metricData?.intent ?? 'Informational';
  const compLevel = metricData?.competitionLevel ?? 'LOW';

  const kdCategory =
    kd < 30
      ? { label: 'Easy', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' }
      : kd < 55
      ? { label: 'Possible', color: 'text-blue-600', bg: 'bg-[#F5F3FF] border-[#DDD6FE]' }
      : kd < 75
      ? { label: 'Hard', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' }
      : { label: 'Very Hard', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };

  // Filter questions vs general ideas
  const questions = ideas.filter((k) =>
    /^(what|how|why|when|where|who|which|is|are|can)\b/i.test(k.keyword)
  );

  const handleExportCsv = () => {
    const headers = ['Keyword', 'Search Volume', 'Difficulty (KD %)', 'CPC (USD)', 'Intent'];
    const rows = ideas.map((k) => [`"${k.keyword}"`, k.volume, `${k.kd}%`, `$${k.cpc.toFixed(2)}`, k.intent]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${cleanKeyword}_yepapi_keyword_research.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F9FC] text-gray-900 select-none pb-16">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 sticky top-0 z-10 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gray-900 capitalize tracking-tight">
                  {cleanKeyword}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded bg-[#F5F3FF] text-[#7C3AED] font-semibold border border-[#DDD6FE]">
                  Google {country}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  {activeProviderName}
                </span>
              </div>
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                <span>Verified Data Provider: {activeProviderName}</span>
                <span>•</span>
                <span>Last updated: {lastRefreshed || 'Live'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRealData}
              disabled={isLoading}
              className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={onNewSearch}
              className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-gray-500" />
              <span>New Search</span>
            </button>

            <button
              onClick={handleExportCsv}
              disabled={ideas.length === 0}
              className="px-3.5 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-3 border-t border-gray-100 pt-2 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#F5F3FF] text-[#7C3AED] font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('similar')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'similar'
                ? 'bg-[#F5F3FF] text-[#7C3AED] font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Similar Ideas ({ideas.length})
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-[#F5F3FF] text-[#7C3AED] font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Questions ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('serp')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'serp'
                ? 'bg-[#F5F3FF] text-[#7C3AED] font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Google Top 10 SERP ({serpItems.length})
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Auth Error Banner */}
        {isAuthError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4 text-xs text-rose-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block mb-0.5">Authentication Required</span>
                <p className="text-rose-700">Keyword research requires an active account session. Please sign in to query live keyword metrics.</p>
              </div>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shrink-0 transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Error Alert if any (non-auth) */}
        {!isAuthError && errorMessage && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">YepAPI Response Notice:</span>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-white rounded-xl border border-gray-200" />
              ))}
            </div>
            <div className="h-64 bg-white rounded-xl border border-gray-200" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Search Volume */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Search Volume
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {volume > 0 ? volume.toLocaleString() : '—'}
                </div>
                <div className="mt-1.5 text-[11px] text-emerald-600 flex items-center font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Monthly searches via YepAPI</span>
                </div>
              </div>

              {/* Keyword Difficulty */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Difficulty Score (KD)
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-black ${kdCategory.color}`}>{kd}</span>
                  <span className="text-xs text-gray-400">/ 100</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${kdCategory.bg} ${kdCategory.color}`}>
                    {kdCategory.label}
                  </span>
                </div>
                <div className="mt-1.5 text-[11px] text-gray-500">
                  Effort needed to rank on Google
                </div>
              </div>

              {/* CPC */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Cost Per Click (CPC)
                </div>
                <div className="text-2xl font-black text-purple-600">
                  ${cpc > 0 ? cpc.toFixed(2) : '0.00'}
                </div>
                <div className="mt-1.5 text-[11px] text-gray-500">
                  Competition: <span className="font-semibold text-gray-800">{compLevel}</span>
                </div>
              </div>

              {/* Intent */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Search Intent
                </div>
                <div className="text-2xl font-black text-[#1E293B] capitalize">
                  {intent}
                </div>
                <div className="mt-1.5 text-[11px] text-gray-500">
                  Classified by YepAPI intent AI
                </div>
              </div>
            </div>

            {/* TAB: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Search Volume Trend Chart */}
                {metricData?.trend && metricData.trend.length > 0 && (
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-gray-900">Search Trend (12-Month Volume)</div>
                      <span className="text-xs text-gray-400">Source: YepAPI Google Data</span>
                    </div>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={metricData.trend}>
                          <defs>
                            <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Area type="monotone" dataKey="volume" stroke="#7C3AED" strokeWidth={2} fill="url(#volGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Ideas Preview Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="text-sm font-bold text-gray-900">Keyword Ideas ({ideas.length})</div>
                    <button
                      onClick={() => setActiveTab('similar')}
                      className="text-xs text-[#7C3AED] hover:underline font-semibold cursor-pointer"
                    >
                      View all ideas →
                    </button>
                  </div>
                  {ideas.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500">
                      No keyword ideas found for &quot;{cleanKeyword}&quot;.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8FAFC] text-gray-500 font-semibold border-b border-gray-200">
                          <tr>
                            <th className="py-2.5 px-4">Keyword</th>
                            <th className="py-2.5 px-4 text-right">Volume</th>
                            <th className="py-2.5 px-4 text-right">KD</th>
                            <th className="py-2.5 px-4 text-right">CPC</th>
                            <th className="py-2.5 px-4">Intent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {ideas.slice(0, 8).map((k, i) => (
                            <tr key={i} className="hover:bg-gray-50/80">
                              <td className="py-2.5 px-4 font-semibold text-gray-900">{k.keyword}</td>
                              <td className="py-2.5 px-4 text-right font-medium text-gray-700">{k.volume.toLocaleString()}</td>
                              <td className="py-2.5 px-4 text-right font-medium text-gray-700">{k.kd}%</td>
                              <td className="py-2.5 px-4 text-right font-medium text-purple-700">${k.cpc.toFixed(2)}</td>
                              <td className="py-2.5 px-4 text-gray-500 capitalize">{k.intent}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Similar Ideas */}
            {activeTab === 'similar' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">Similar Ideas for &quot;{cleanKeyword}&quot;</div>
                  <span className="text-xs text-gray-500 font-medium">{ideas.length} results</span>
                </div>
                {ideas.length === 0 ? (
                  <div className="p-12 text-center text-xs text-gray-500">
                    No related ideas returned by YepAPI.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] text-gray-500 font-semibold border-b border-gray-200">
                        <tr>
                          <th className="py-3 px-4">Keyword</th>
                          <th className="py-3 px-4 text-right">Volume</th>
                          <th className="py-3 px-4 text-right">Difficulty (KD)</th>
                          <th className="py-3 px-4 text-right">CPC</th>
                          <th className="py-3 px-4">Intent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {ideas.map((k, i) => (
                          <tr key={i} className="hover:bg-gray-50/80">
                            <td className="py-3 px-4 font-semibold text-gray-900">{k.keyword}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-700">{k.volume.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-700">{k.kd}%</td>
                            <td className="py-3 px-4 text-right font-medium text-purple-700">${k.cpc.toFixed(2)}</td>
                            <td className="py-3 px-4 text-gray-500 capitalize">{k.intent}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Questions */}
            {activeTab === 'questions' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">Question Keywords</div>
                  <span className="text-xs text-gray-500 font-medium">{questions.length} questions</span>
                </div>
                {questions.length === 0 ? (
                  <div className="p-12 text-center text-xs text-gray-500">
                    No question-format keywords detected in ideas list.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] text-gray-500 font-semibold border-b border-gray-200">
                        <tr>
                          <th className="py-3 px-4">Question</th>
                          <th className="py-3 px-4 text-right">Volume</th>
                          <th className="py-3 px-4 text-right">Difficulty (KD)</th>
                          <th className="py-3 px-4 text-right">CPC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {questions.map((q, i) => (
                          <tr key={i} className="hover:bg-gray-50/80">
                            <td className="py-3 px-4 font-semibold text-gray-900">{q.keyword}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-700">{q.volume.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-700">{q.kd}%</td>
                            <td className="py-3 px-4 text-right font-medium text-purple-700">${q.cpc.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: SERP */}
            {activeTab === 'serp' && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">Top Organic Google SERP Results</div>
                  <span className="text-xs text-gray-500 font-medium">{serpItems.length} results</span>
                </div>
                {serpItems.length === 0 ? (
                  <div className="p-12 text-center text-xs text-gray-500">
                    No organic SERP results returned for &quot;{cleanKeyword}&quot;.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {serpItems.map((item) => (
                      <div key={item.pos} className="p-4 hover:bg-gray-50/80 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-bold shrink-0">
                            #{item.pos}
                          </span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-[#1E293B] hover:text-[#7C3AED] hover:underline flex items-center gap-1.5"
                          >
                            <span>{item.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                          </a>
                        </div>
                        <div className="text-xs text-emerald-700 font-medium pl-7 truncate">
                          {item.url}
                        </div>
                        {item.snippet && (
                          <div className="text-xs text-gray-600 pl-7 leading-relaxed">
                            {item.snippet}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
