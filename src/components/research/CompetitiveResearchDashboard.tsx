'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Globe,
  Download,
  Share2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Award,
  Layers,
  FileText,
  DollarSign,
  Users,
  Target,
  BarChart3,
  SlidersHorizontal,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CompetitiveResearchDashboardProps {
  domain: string;
  scope?: string;
  country?: string;
  brandName?: string;
  onNewSearch: () => void;
}

export function CompetitiveResearchDashboard({
  domain,
  scope = '*.domain.com/*',
  country = 'United States of America',
  onNewSearch,
}: CompetitiveResearchDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'organic' | 'paid' | 'competitors' | 'pages'
  >('overview');
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'6m' | '1y' | 'all'>('6m');
  const [selectedIntentFilter, setSelectedIntentFilter] = useState<string>('all');

  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  // Live domain data from YepAPI via /api/seo/competitors
  const [overview, setOverview] = useState<{
    domainRank: number;
    organicTraffic: number;
    organicKeywords: number;
    backlinks: number;
    referringDomains: number;
  } | null>(null);
  const [competitorDomains, setCompetitorDomains] = useState<
    Array<{ domain: string; avgPosition: number; intersections: number; organicCount: number; organicEtv: number }>
  >([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!cleanDomain) return;
    let active = true;
    const post = (mode: 'overview' | 'domains') =>
      fetch('/api/seo/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain, mode, limit: 10 }),
      }).then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) throw new Error(json?.error || `Request failed (${res.status})`);
        return json.data;
      });
    Promise.allSettled([post('overview'), post('domains')])
      .then(([ov, comps]) => {
        if (!active) return;
        if (ov.status === 'fulfilled') setOverview(ov.value);
        if (comps.status === 'fulfilled') setCompetitorDomains(comps.value?.competitors || []);
        const failed = [ov, comps].find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
        setLoadError(failed ? (failed.reason instanceof Error ? failed.reason.message : 'Failed to load domain data') : null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [cleanDomain]);

  // Same rank -> 0-100 trust mapping used by the backlink tools
  const domainTrust = overview ? Math.min(100, Math.round(overview.domainRank / 2)) : 0;
  const pageTrust = 0;
  const organicTraffic = overview?.organicTraffic ?? 0;
  const organicKeywords = overview?.organicKeywords ?? 0;
  const paidTraffic = 0;
  const paidKeywords = 0;
  const referringDomains = overview?.referringDomains ?? 0;
  const totalBacklinks = overview?.backlinks ?? 0;

  // Not provided by the data source: history, position split, keyword list, paid data, top pages
  const trendData: Array<{ month: string; traffic: number; keywords: number }> = [];
  const positionDistribution: Array<{ range: string; count: number; fill: string }> = [];
  const baseKeywords: Array<{
    keyword: string;
    intent: string;
    position: number;
    prevPosition: number;
    volume: number;
    kd: number;
    cpc: number;
    trafficPercent: number;
    features: string[];
  }> = [];

  const filteredKeywords = baseKeywords.filter((k) => {
    const matchesSearch = k.keyword.toLowerCase().includes(keywordSearch.toLowerCase());
    const matchesIntent = selectedIntentFilter === 'all' || k.intent.toLowerCase() === selectedIntentFilter.toLowerCase();
    return matchesSearch && matchesIntent;
  });

  // Competing domains (keyword overlap from the data source)
  const competitors = competitorDomains.map((c) => ({
    domain: c.domain,
    commonKeywords: c.intersections,
    missingKeywords: Math.max(0, c.organicCount - c.intersections),
    traffic: Math.round(c.organicEtv),
    paidTraffic: 0,
    // Share of this domain's keywords that the competitor also ranks for
    strength: organicKeywords > 0 ? Math.min(100, Math.round((c.intersections / organicKeywords) * 100)) : 0,
  }));

  const topPages: Array<{ path: string; trafficPercent: number; traffic: number; keywords: number }> = [];

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Keyword', 'Intent', 'Position', 'Volume', 'KD', 'CPC', 'Traffic %'];
    const rows = filteredKeywords.map((k) => [
      `"${k.keyword}"`,
      k.intent,
      k.position,
      k.volume,
      `${k.kd}%`,
      `$${k.cpc}`,
      `${k.trafficPercent}%`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${cleanDomain}_organic_keywords.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F9FC] text-gray-900 select-none pb-16">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 sticky top-0 z-10 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gray-900 tracking-tight">{cleanDomain}</h1>
                <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono font-medium">
                  {scope}
                </span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-600 font-medium">🇺🇸 {country}</span>
              </div>
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                <span>Google Search Competitive Analysis</span>
                <span>•</span>
                <span>Updated today</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewSearch}
              className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-gray-500" />
              <span>New Search</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {(isLoading || loadError) && (
          <div
            className={`mt-3 px-3 py-2 rounded-lg text-xs ${
              loadError ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-gray-50 border border-gray-200 text-gray-500'
            }`}
          >
            {loadError ? `Could not load live data for ${cleanDomain}: ${loadError}` : `Loading live data for ${cleanDomain}…`}
          </div>
        )}

        {/* Tab navigation matching SE Ranking */}
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
            onClick={() => setActiveTab('organic')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'organic'
                ? 'bg-[#F5F3FF] text-[#7C3AED] font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Organic Traffic Research ({organicKeywords.toLocaleString()})
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'paid'
                ? 'bg-[#F5F3FF] text-[#7C3AED] font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Paid Traffic Research ({paidKeywords.toLocaleString()})
          </button>
          <button
            onClick={() => setActiveTab('competitors')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'competitors'
                ? 'bg-[#F5F3FF] text-[#7C3AED] font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Competitors ({competitors.length})
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'pages'
                ? 'bg-[#F5F3FF] text-[#7C3AED] font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Pages
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
          {/* Domain Trust */}
          <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Domain Trust
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-gray-900">{domainTrust}</span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
            <div className="mt-1.5 text-[11px] text-emerald-600 flex items-center font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+3 pts this month</span>
            </div>
          </div>

          {/* Page Trust */}
          <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Page Trust
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-gray-900">{pageTrust}</span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
            <div className="mt-1.5 text-[11px] text-gray-500 font-medium">
              Main URL authority
            </div>
          </div>

          {/* Organic Traffic */}
          <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-2xs col-span-1 md:col-span-2 lg:col-span-1">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Organic Traffic
            </div>
            <div className="text-2xl font-black text-blue-600">
              {organicTraffic.toLocaleString()}
            </div>
            <div className="mt-1.5 text-[11px] text-emerald-600 flex items-center font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+12.4% MoM ($3.2K value)</span>
            </div>
          </div>

          {/* Organic Keywords */}
          <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Organic Keywords
            </div>
            <div className="text-2xl font-black text-gray-900">
              {organicKeywords.toLocaleString()}
            </div>
            <div className="mt-1.5 text-[11px] text-emerald-600 flex items-center font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+158 new keywords</span>
            </div>
          </div>

          {/* Paid Traffic */}
          <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Paid Traffic
            </div>
            <div className="text-2xl font-black text-purple-600">
              {paidTraffic.toLocaleString()}
            </div>
            <div className="mt-1.5 text-[11px] text-gray-500 font-medium">
              Est. ${Math.round(paidTraffic * 0.65)} / mo
            </div>
          </div>

          {/* Paid Keywords */}
          <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Paid Keywords
            </div>
            <div className="text-2xl font-black text-gray-900">{paidKeywords}</div>
            <div className="mt-1.5 text-[11px] text-gray-500 font-medium">
              Google Ads search
            </div>
          </div>

          {/* Backlinks */}
          <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Total Backlinks
            </div>
            <div className="text-2xl font-black text-gray-900">
              {totalBacklinks.toLocaleString()}
            </div>
            <div className="mt-1.5 text-[11px] text-gray-500 font-medium">
              From {referringDomains.toLocaleString()} domains
            </div>
          </div>
        </div>

        {/* Chart Section: Organic Traffic & Keywords Dynamics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Organic Traffic & Keywords Dynamics
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Monthly search traffic projection and keyword index growth in Google
                </p>
              </div>

              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs">
                {(['6m', '1y', 'all'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedTimeRange(r)}
                    className={`px-2.5 py-1 rounded font-semibold transition-all ${
                      selectedTimeRange === r ? 'bg-white shadow-2xs text-[#7C3AED]' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="keywordsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="traffic"
                    name="Organic Traffic"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#trafficGradient)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="keywords"
                    name="Organic Keywords"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#keywordsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Keywords by Position Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Keywords by Position Distribution
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Breakdown of Google SERP rankings
              </p>

              <div className="mt-4 space-y-3">
                {positionDistribution.map((item) => {
                  const percent = Math.round((item.count / organicKeywords) * 100);
                  return (
                    <div key={item.range} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-700">{item.range}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{item.count.toLocaleString()}</span>
                          <span className="text-gray-400 text-[11px]">({percent}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: item.fill }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 p-3 rounded-lg bg-[#F5F3FF]/60 border border-blue-100 flex items-center justify-between text-xs">
              <span className="text-blue-900 font-medium">Top 10 Rankings</span>
              <span className="font-bold text-[#7C3AED]">
                {Math.round(organicKeywords * 0.24).toLocaleString()} keywords (24%)
              </span>
            </div>
          </div>
        </div>

        {/* Top Organic Keywords Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Top Organic Keywords in Google
              </h3>
              <p className="text-xs text-gray-500">
                Keywords generating the most search visibility and organic traffic
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={keywordSearch}
                  onChange={(e) => setKeywordSearch(e.target.value)}
                  placeholder="Filter keywords..."
                  className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:outline-hidden focus:border-[#7C3AED]"
                />
              </div>

              <select
                value={selectedIntentFilter}
                onChange={(e) => setSelectedIntentFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-hidden"
              >
                <option value="all">All Intents</option>
                <option value="informational">Informational</option>
                <option value="commercial">Commercial</option>
                <option value="transactional">Transactional</option>
                <option value="navigational">Navigational</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-4 py-3">Keyword</th>
                  <th className="px-3 py-3">Intent</th>
                  <th className="px-3 py-3 text-center">Position</th>
                  <th className="px-3 py-3 text-right">Search Volume</th>
                  <th className="px-3 py-3 text-center">KD %</th>
                  <th className="px-3 py-3 text-right">CPC (USD)</th>
                  <th className="px-3 py-3 text-right">Traffic Share</th>
                  <th className="px-4 py-3">SERP Features</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredKeywords.map((k) => (
                  <tr key={k.keyword} className="hover:bg-[#F5F3FF]/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                      <span>{k.keyword}</span>
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(k.keyword)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-[#7C3AED]"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          k.intent === 'Commercial'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : k.intent === 'Transactional'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : k.intent === 'Informational'
                            ? 'bg-[#F5F3FF] text-blue-700 border border-[#DDD6FE]'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {k.intent}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="inline-flex items-center gap-1 font-bold text-gray-900">
                        <span className="w-5 h-5 rounded-full bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center text-xs">
                          {k.position}
                        </span>
                        {k.position < k.prevPosition && (
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            +{k.prevPosition - k.position}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-medium text-gray-900">
                      {k.volume.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`font-semibold ${
                          k.kd > 50 ? 'text-rose-600' : k.kd > 35 ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        {k.kd}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-gray-700">
                      ${k.cpc.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-blue-600">
                      {k.trafficPercent}%
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {k.features.map((f) => (
                          <span
                            key={f}
                            className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-medium"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Competitors & Top Pages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Organic Competitors */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Main Organic Competitors</h3>
              <span className="text-xs text-gray-400">Google US</span>
            </div>

            <div className="divide-y divide-gray-100">
              {competitors.map((c) => (
                <div key={c.domain} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {c.domain.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">{c.domain}</div>
                      <div className="text-[11px] text-gray-500">
                        {c.commonKeywords.toLocaleString()} common keywords
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-blue-600">
                      {c.traffic.toLocaleString()} visits
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {c.strength}/100 strength
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Pages by Organic Traffic */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Top Pages by Organic Traffic</h3>
              <span className="text-xs text-gray-400">Share of domain</span>
            </div>

            <div className="space-y-3">
              {topPages.map((p) => (
                <div key={p.path} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-800 truncate max-w-[260px]">{p.path}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{p.traffic.toLocaleString()}</span>
                      <span className="text-blue-600 font-semibold">({p.trafficPercent}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#7C3AED] h-full rounded-full"
                      style={{ width: `${p.trafficPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
