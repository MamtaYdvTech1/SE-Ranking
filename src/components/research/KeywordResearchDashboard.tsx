'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Globe,
  Download,
  Share2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ArrowUpRight,
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
  Plus,
  HelpCircle as QuestionIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  initialTab?: 'overview' | 'similar' | 'related' | 'questions' | 'serp';
  onNewSearch: () => void;
}

export function KeywordResearchDashboard({
  keyword,
  country = 'India',
  countryCode = 'in',
  initialTab = 'overview',
  onNewSearch,
}: KeywordResearchDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'similar' | 'related' | 'questions' | 'serp'>(initialTab);
  const [searchFilter, setSearchFilter] = useState('');

  const cleanKeyword = keyword.trim().toLowerCase();

  // Dynamic realistic data based on keyword
  const volume = Math.max(1200, Math.floor(8500 + (cleanKeyword.length * 950) % 45000));
  const kd = Math.min(88, Math.max(18, Math.floor(32 + (cleanKeyword.length * 4) % 55)));
  const cpc = Number((1.2 + (cleanKeyword.length * 0.35) % 8.5).toFixed(2));
  const globalVolume = Math.round(volume * 2.85);

  const kdCategory =
    kd < 30 ? { label: 'Easy', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' } :
    kd < 55 ? { label: 'Possible', color: 'text-blue-600', bg: 'bg-[#F5F3FF] border-[#DDD6FE]' } :
    kd < 75 ? { label: 'Hard', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' } :
    { label: 'Very Hard', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };

  // Trend data
  const trendData = [
    { month: 'Apr', volume: Math.round(volume * 0.82) },
    { month: 'May', volume: Math.round(volume * 0.88) },
    { month: 'Jun', volume: Math.round(volume * 0.94) },
    { month: 'Jul', volume: Math.round(volume * 0.98) },
    { month: 'Aug', volume: Math.round(volume * 0.92) },
    { month: 'Sep', volume: volume },
  ];

  // Similar keywords
  const similarKeywords = [
    { keyword: `best ${cleanKeyword}`, volume: Math.round(volume * 0.65), kd: kd - 4, cpc: cpc + 0.45, intent: 'Commercial' },
    { keyword: `${cleanKeyword} online`, volume: Math.round(volume * 0.52), kd: kd - 8, cpc: cpc - 0.2, intent: 'Transactional' },
    { keyword: `free ${cleanKeyword}`, volume: Math.round(volume * 0.44), kd: kd - 12, cpc: cpc - 0.6, intent: 'Informational' },
    { keyword: `${cleanKeyword} tools for business`, volume: Math.round(volume * 0.38), kd: kd + 3, cpc: cpc + 1.1, intent: 'Commercial' },
    { keyword: `top 10 ${cleanKeyword}`, volume: Math.round(volume * 0.31), kd: kd - 2, cpc: cpc + 0.3, intent: 'Informational' },
    { keyword: `${cleanKeyword} pricing and reviews`, volume: Math.round(volume * 0.26), kd: kd - 6, cpc: cpc + 0.8, intent: 'Commercial' },
    { keyword: `how to choose ${cleanKeyword}`, volume: Math.round(volume * 0.19), kd: kd - 14, cpc: cpc - 0.4, intent: 'Informational' },
  ];

  // Questions
  const questions = [
    { question: `what is ${cleanKeyword}?`, volume: Math.round(volume * 0.28), kd: kd - 12 },
    { question: `how does ${cleanKeyword} work?`, volume: Math.round(volume * 0.22), kd: kd - 9 },
    { question: `is ${cleanKeyword} worth it in 2026?`, volume: Math.round(volume * 0.17), kd: kd - 5 },
    { question: `which is the best ${cleanKeyword} for small business?`, volume: Math.round(volume * 0.14), kd: kd - 2 },
    { question: `how to get started with ${cleanKeyword}?`, volume: Math.round(volume * 0.11), kd: kd - 15 },
  ];

  // Top SERP ranking pages
  const serpResults = [
    { pos: 1, title: `Complete Guide to ${cleanKeyword} (2026 Updated)`, url: `https://www.forbes.com/advisor/business/${encodeURIComponent(cleanKeyword)}`, dt: 92, pt: 84, backlinks: 1420, traffic: 4800 },
    { pos: 2, title: `The Best ${cleanKeyword} of 2026 - Tested & Reviewed`, url: `https://www.pcmag.com/picks/best-${encodeURIComponent(cleanKeyword)}`, dt: 91, pt: 81, backlinks: 980, traffic: 3900 },
    { pos: 3, title: `${cleanKeyword}: Everything You Need to Know`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanKeyword)}`, dt: 98, pt: 88, backlinks: 3400, traffic: 6200 },
    { pos: 4, title: `Top 10 ${cleanKeyword} Solutions for Modern Teams`, url: `https://www.g2.com/categories/${encodeURIComponent(cleanKeyword)}`, dt: 90, pt: 79, backlinks: 840, traffic: 2800 },
    { pos: 5, title: `${cleanKeyword} Comparison & Pricing Guide`, url: `https://www.capterra.com/software/${encodeURIComponent(cleanKeyword)}`, dt: 89, pt: 76, backlinks: 610, traffic: 2100 },
  ];

  const handleExportCsv = () => {
    const headers = ['Keyword', 'Search Volume', 'Difficulty (KD %)', 'CPC (USD)', 'Intent'];
    const rows = similarKeywords.map((k) => [`"${k.keyword}"`, k.volume, `${k.kd}%`, `$${k.cpc.toFixed(2)}`, k.intent]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${cleanKeyword}_keyword_research.csv`);
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
                <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                  Commercial
                </span>
              </div>
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                <span>Keyword Research Analysis</span>
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
            Similar Keywords ({similarKeywords.length})
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
            SERP Overview (Top 10)
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search Volume */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Search Volume
            </div>
            <div className="text-2xl font-black text-gray-900">
              {volume.toLocaleString()}
            </div>
            <div className="mt-1.5 text-[11px] text-emerald-600 flex items-center font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Monthly organic searches in {country}</span>
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
              Effort needed to rank on Google Page 1
            </div>
          </div>

          {/* CPC & Paid Competition */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Cost Per Click (CPC)
            </div>
            <div className="text-2xl font-black text-purple-600">
              ${cpc.toFixed(2)}
            </div>
            <div className="mt-1.5 text-[11px] text-gray-500">
              PPC Competition: <span className="font-semibold text-gray-800">0.58 (Medium)</span>
            </div>
          </div>

          {/* Global Volume */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Global Volume
            </div>
            <div className="text-2xl font-black text-[#7C3AED]">
              {globalVolume.toLocaleString()}
            </div>
            <div className="mt-1.5 text-[11px] text-gray-500">
              Across 190+ countries worldwide
            </div>
          </div>
        </div>

        {/* Dynamic Search Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Search Volume Dynamics</h3>
              <p className="text-xs text-gray-500 mt-0.5">Last 6 months organic search demand</p>
            </div>
            <span className="text-xs text-gray-400 font-medium">Google Monthly Trends</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  name="Search Volume"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#volumeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Similar Keywords & Questions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Similar Keywords */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Similar Keywords</h3>
                <p className="text-xs text-gray-500">Keywords containing the search query</p>
              </div>
              <button
                onClick={handleExportCsv}
                className="text-xs text-[#7C3AED] font-semibold hover:underline flex items-center gap-1"
              >
                <span>Export list</span>
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {similarKeywords.map((k) => (
                <div key={k.keyword} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-gray-900 truncate hover:text-[#7C3AED] cursor-pointer">
                      {k.keyword}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-medium">
                        {k.intent}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        CPC: ${k.cpc.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-gray-900">{k.volume.toLocaleString()}</div>
                    <div className={`text-[11px] font-semibold ${k.kd > 45 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {k.kd}% KD
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Search Questions</h3>
                <p className="text-xs text-gray-500">Popular questions asked by users</p>
              </div>
              <span className="text-xs text-gray-400">Google PAA</span>
            </div>

            <div className="divide-y divide-gray-100">
              {questions.map((q) => (
                <div key={q.question} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-gray-900 truncate hover:text-[#7C3AED] cursor-pointer">
                      {q.question}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      KD: {q.kd}% • High intent
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-blue-600">{q.volume.toLocaleString()}</div>
                    <div className="text-[11px] text-gray-400">monthly</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SERP Overview (Top 5 Ranking Pages) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">SERP Overview for Google</h3>
              <p className="text-xs text-gray-500">Top 5 organically ranking search results</p>
            </div>
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(cleanKeyword)}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#7C3AED] font-semibold hover:underline flex items-center gap-1"
            >
              <span>View live SERP</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-4 py-3 text-center">Pos</th>
                  <th className="px-4 py-3">Ranking Page & Title</th>
                  <th className="px-3 py-3 text-center">Domain Trust</th>
                  <th className="px-3 py-3 text-center">Page Trust</th>
                  <th className="px-3 py-3 text-right">Backlinks</th>
                  <th className="px-4 py-3 text-right">Estimated Traffic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {serpResults.map((r) => (
                  <tr key={r.pos} className="hover:bg-[#F5F3FF]/30 transition-colors">
                    <td className="px-4 py-3 text-center">
                      <span className="w-6 h-6 rounded-full bg-[#F5F3FF] text-[#7C3AED] font-bold inline-flex items-center justify-center text-xs">
                        {r.pos}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      <div className="font-semibold text-gray-900 truncate hover:text-[#7C3AED]">
                        {r.title}
                      </div>
                      <div className="font-mono text-[11px] text-gray-400 truncate mt-0.5">
                        {r.url}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-gray-800">
                      {r.dt}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-gray-800">
                      {r.pt}
                    </td>
                    <td className="px-3 py-3 text-right text-gray-700 font-medium">
                      {r.backlinks.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">
                      {r.traffic.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
