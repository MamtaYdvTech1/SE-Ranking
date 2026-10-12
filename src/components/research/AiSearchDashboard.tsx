'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  RefreshCw,
  Plus,
  Download,
  Share2,
  ExternalLink,
  ChevronDown,
  Search,
  Filter,
  Trash2,
  Globe,
  Settings,
  HelpCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  AnalysisOverview,
  AiEngineId,
  PromptItem,
  CitationItem,
  CompetitorItem,
  TopicItem,
} from '@/lib/types';
import { SUPPORTED_ENGINES } from '@/lib/constants';
import { PromptDetailsDrawer } from './PromptDetailsDrawer';
import { AddCompetitorModal } from '../modals/AddCompetitorModal';

interface AiSearchDashboardProps {
  analysis: AnalysisOverview;
  onNewSearch: () => void;
}

export function AiSearchDashboard({ analysis, onNewSearch }: AiSearchDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'prompts' | 'citations' | 'competitors'>('overview');
  const [selectedEngine, setSelectedEngine] = useState<string>('all');
  const [visibilityType, setVisibilityType] = useState<'overall' | 'brand' | 'domain'>('overall');
  const [promptSearch, setPromptSearch] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);

  // Competitor management state
  const [competitors, setCompetitors] = useState<CompetitorItem[]>(analysis.competitors || []);
  const [isAddCompOpen, setIsAddCompOpen] = useState(false);

  // Topic overlap filter
  const [topicOverlapFilter, setTopicOverlapFilter] = useState<'All' | 'Shared' | 'Unique' | 'Missing'>('All');

  // Trend data for Recharts
  const trendData = [
    { date: 'Sep 01', aiPresence: 42, chatgpt: 30, gemini: 28, perplexity: 38 },
    { date: 'Sep 05', aiPresence: 45, chatgpt: 34, gemini: 32, perplexity: 41 },
    { date: 'Sep 10', aiPresence: 48, chatgpt: 39, gemini: 35, perplexity: 44 },
    { date: 'Sep 15', aiPresence: 51, chatgpt: 41, gemini: 38, perplexity: 47 },
    { date: 'Sep 20', aiPresence: 53, chatgpt: 43, gemini: 38, perplexity: 50 },
    { date: 'Sep 25', aiPresence: analysis.aiPresence || 54.2, chatgpt: 44, gemini: 39.2, perplexity: 51.6 },
  ];

  // Engine comparison data for bar chart
  const engineComparisonData = analysis.engines.map((e) => ({
    name: e.name,
    mentions: e.mentions,
    linkPresence: e.linkPresence,
  }));

  // Filtered prompts
  const filteredPrompts = (analysis.prompts || []).filter((p) => {
    const matchesSearch =
      p.prompt.toLowerCase().includes(promptSearch.toLowerCase()) ||
      p.topic.toLowerCase().includes(promptSearch.toLowerCase());
    const matchesEngine = selectedEngine === 'all' || p.engine === selectedEngine;
    return matchesSearch && matchesEngine;
  });

  // Filtered topics
  const filteredTopics = (analysis.topics || []).filter((t) => {
    if (topicOverlapFilter === 'All') return true;
    return t.overlap === topicOverlapFilter;
  });

  const handleExport = (format: 'csv' | 'json', type: 'prompts' | 'citations' | 'competitors') => {
    window.open(`/api/export?analysisId=${analysis.id}&format=${format}&type=${type}`, '_blank');
  };

  const handleRemoveCompetitor = async (compId: string) => {
    if (!confirm('Are you sure you want to remove this competitor?')) return;
    try {
      const res = await fetch(`/api/competitors?id=${compId}`, { method: 'DELETE' });
      if (res.ok) {
        setCompetitors((prev) => prev.filter((c) => c.id !== compId));
      }
    } catch (e) {
      console.error('Failed to delete competitor', e);
    }
  };

  return (
    <div className="w-full bg-[#F4F6F9] min-h-[calc(100vh-80px)] pb-16 text-gray-900 select-none">
      {/* Top Breadcrumb & Control Bar (Screenshot 4 exact match) */}
      <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-gray-500">
          <span className="font-medium text-gray-900">{analysis.domain}</span>
          <span>&gt;</span>
          <span>Competitive Research</span>
          <span>&gt;</span>
          <span className="text-[#7C3AED] font-medium">AI Search Overview</span>
        </div>

        <div className="flex items-center gap-4 text-gray-500">
          <button onClick={onNewSearch} className="text-[#7C3AED] hover:underline font-semibold flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </button>
          <span>Feedback</span>
          <span>Notes (16)</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Overview / {analysis.domain}
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E3EFFA] text-[#145EA8] border border-[#145EA8]/20">
                AI Search Beta
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Target Location: <span className="font-semibold text-gray-700">{analysis.country}</span> | Scope:{' '}
              <span className="font-semibold text-gray-700">{analysis.scope}</span>
              {analysis.brandName && (
                <>
                  {' '}| Brand: <span className="font-semibold text-purple-700">{analysis.brandName}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span>EXPORT</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 text-xs w-44">
                <button
                  onClick={() => handleExport('csv', 'prompts')}
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-50"
                >
                  Export Prompts (CSV)
                </button>
                <button
                  onClick={() => handleExport('csv', 'citations')}
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-50"
                >
                  Export Citations (CSV)
                </button>
                <button
                  onClick={() => handleExport('csv', 'competitors')}
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-50"
                >
                  Export Competitors (CSV)
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => handleExport('json', 'prompts')}
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-purple-700"
                >
                  Export All (JSON)
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsAddCompOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7C3AED] text-white rounded-lg text-xs font-semibold hover:bg-[#6D28D9] transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Competitor</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Section (Screenshot 4 exact recreation) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Key metrics</h3>
            <div className="flex items-center gap-2 text-gray-400">
              <Settings className="w-3.5 h-3.5 hover:text-gray-600 cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Metric 1: AI Presence */}
            <div className="p-3 bg-gray-50/70 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1">
                <span>AI PRESENCE</span>
                <span>🇮🇳</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-[#7C3AED]">
                  {analysis.aiPresence !== null ? `${analysis.aiPresence}%` : 'Not available'}
                </span>
                <span className="text-[11px] text-gray-400">0%</span>
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">Sep, 2026</span>
            </div>

            {/* Metric 2: Organic Traffic */}
            <div className="p-3 bg-gray-50/70 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1">
                <span>ORGANIC TRAFFIC</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
              <span className="text-xs font-medium text-gray-500 block my-1">
                {analysis.traffic ? analysis.traffic.toLocaleString() : 'Data is not found'}
              </span>
              <button className="flex items-center gap-1 text-[11px] text-[#7C3AED] font-medium hover:underline">
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Restart</span>
              </button>
            </div>

            {/* Metric 3: Organic Keywords */}
            <div className="p-3 bg-gray-50/70 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1">
                <span>ORGANIC KEYWORDS</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
              <span className="text-xs font-medium text-gray-500 block my-1">Data is not found</span>
              <button className="flex items-center gap-1 text-[11px] text-[#7C3AED] font-medium hover:underline">
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Restart</span>
              </button>
            </div>

            {/* Metric 4: Referring Domains */}
            <div className="p-3 bg-gray-50/70 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1">
                <span>REFERRING DOMAINS</span>
              </div>
              <div className="text-xl font-extrabold text-gray-900 my-0.5">
                {analysis.referringDomains || 41}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <span>Sep-23 2026</span>
                <RefreshCw className="w-2.5 h-2.5" />
              </div>
            </div>

            {/* Metric 5: Search Visibility */}
            <div className="p-3 bg-gray-50/70 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1">
                <span>SEARCH VISIBILITY</span>
                <span className="text-[10px] text-gray-400">EN v</span>
              </div>
              <span className="text-xs text-gray-500 block my-1">Get site visibility data</span>
              <button className="px-2 py-0.5 bg-[#00A86B] text-white rounded text-[10px] font-bold hover:bg-[#008f5a]">
                + Add keywords
              </button>
            </div>
          </div>
        </div>

        {/* Competitive Research - AI Search Engines Bar (Screenshot 4 Recreation) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-700 border-b border-gray-100 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-purple-700 font-bold">Competitive Research - AI Search</span>
              {analysis.brandName && (
                <span className="text-gray-500">| Brand: <b className="text-gray-800">{analysis.brandName}</b></span>
              )}
              <span className="text-gray-400">| Last 30 days</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {analysis.engines.map((eng) => (
              <div
                key={eng.id}
                className="p-3.5 bg-gray-50/80 rounded-lg border border-gray-200/80 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>{eng.name}</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-[11px]">Mentions:</span>
                    <span className="font-bold text-gray-900">
                      {eng.mentions > 1000 ? `${(eng.mentions / 1000).toFixed(1)}K` : eng.mentions}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-[11px]">Link Presence:</span>
                    <span className="font-bold text-gray-900">
                      {eng.linkPresence ? `${eng.linkPresence}%` : '0'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation and Controls Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-2 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Main Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
            {(['overview', 'topics', 'prompts', 'citations', 'competitors'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-[#7C3AED] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab}
                {tab === 'prompts' && ` (${analysis.prompts?.length || 0})`}
                {tab === 'citations' && ` (${analysis.citations?.length || 0})`}
                {tab === 'competitors' && ` (${competitors.length})`}
              </button>
            ))}
          </div>

          {/* Controls: AI Engine Switcher & Visibility Type */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end text-xs">
            <select
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#7C3AED]"
            >
              <option value="all">All AI Platforms</option>
              <option value="ai-overview">Google AI Overview</option>
              <option value="ai-mode">Google AI Mode</option>
              <option value="chatgpt">ChatGPT</option>
              <option value="gemini">Gemini</option>
              <option value="perplexity">Perplexity</option>
            </select>

            <select
              value={visibilityType}
              onChange={(e) => setVisibilityType(e.target.value as any)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#7C3AED]"
            >
              <option value="overall">Overall AI Presence</option>
              {analysis.brandName && <option value="brand">Brand Presence</option>}
              <option value="domain">Domain Presence</option>
            </select>
          </div>
        </div>

        {/* Tab Content 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Chart 1: AI Visibility Trend */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">AI Visibility Trend</h4>
                    <p className="text-[11px] text-gray-500">Historical performance across AI engines</p>
                  </div>
                  <span className="text-xs font-semibold text-[#7C3AED] bg-[#F5F3FF] px-2 py-1 rounded">
                    30 Days
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Line type="monotone" dataKey="aiPresence" stroke="#7C3AED" strokeWidth={2.5} name="Total AI Presence" />
                      <Line type="monotone" dataKey="chatgpt" stroke="#10A37F" strokeWidth={1.5} name="ChatGPT" />
                      <Line type="monotone" dataKey="perplexity" stroke="#20B2AA" strokeWidth={1.5} name="Perplexity" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Engine Mentions Comparison */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Mentions Across AI Platforms</h4>
                    <p className="text-[11px] text-gray-500">Comparison of search citations and mentions</p>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engineComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Bar dataKey="mentions" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Mentions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Topics */}
        {activeTab === 'topics' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            {/* Filter pills */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {(['All', 'Shared', 'Unique', 'Missing'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTopicOverlapFilter(filter)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      topicOverlapFilter === filter
                        ? 'bg-[#7C3AED] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {filteredTopics.length} Topics identified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-200">
                <thead className="bg-gray-50 font-semibold text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Topic</th>
                    <th className="px-4 py-3">Presence</th>
                    <th className="px-4 py-3">Competitor Presence</th>
                    <th className="px-4 py-3">Overlap</th>
                    <th className="px-4 py-3">Prompts Tracked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTopics.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">{t.topic}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#7C3AED]">{t.presence}%</span>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#7C3AED]" style={{ width: `${t.presence}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700 font-medium">{t.competitorPresence}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            t.overlap === 'Shared'
                              ? 'bg-blue-100 text-blue-800'
                              : t.overlap === 'Unique'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {t.overlap}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-medium">{t.promptsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content 3: Prompts */}
        {activeTab === 'prompts' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            {/* Search and filters */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={promptSearch}
                  onChange={(e) => setPromptSearch(e.target.value)}
                  placeholder="Search prompt or topic..."
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:border-[#7C3AED]"
                />
              </div>

              <div className="text-xs text-gray-500 font-medium">
                Showing {filteredPrompts.length} of {analysis.prompts.length} Prompts
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-200">
                <thead className="bg-gray-50 font-semibold text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Prompt Query</th>
                    <th className="px-4 py-3">Topic</th>
                    <th className="px-4 py-3">Engine</th>
                    <th className="px-4 py-3">Mention</th>
                    <th className="px-4 py-3">Link</th>
                    <th className="px-4 py-3">Ads</th>
                    <th className="px-4 py-3">Competitors</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPrompts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                        {p.prompt}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.topic}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800 uppercase">
                          {p.engine}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.mention ? (
                          <span className="text-emerald-600 font-bold">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p.link ? (
                          <span className="text-emerald-600 font-bold">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p.ads ? (
                          <span className="text-amber-600 font-bold">Ads</span>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">
                        {p.competitors?.join(', ') || '--'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedPrompt(p)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#7C3AED] bg-[#F5F3FF] hover:bg-purple-100 rounded transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content 4: Citations */}
        {activeTab === 'citations' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-200">
                <thead className="bg-gray-50 font-semibold text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3">URL</th>
                    <th className="px-4 py-3">Citation Share</th>
                    <th className="px-4 py-3">Visibility</th>
                    <th className="px-4 py-3">Topics</th>
                    <th className="px-4 py-3">Domain Trust</th>
                    <th className="px-4 py-3">Organic Traffic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analysis.citations.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-900">{c.domain}</td>
                      <td className="px-4 py-3 text-[#7C3AED] max-w-xs truncate font-medium">
                        <a href={c.url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                          <span className="truncate">{c.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {c.citationShare !== null ? `${c.citationShare}%` : '--'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-700">
                        {c.visibility !== null ? `${c.visibility}%` : '--'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{c.topics || '--'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{c.domainTrust ?? '--'}</span>
                          {c.domainTrust && (
                            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${c.domainTrust}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {c.organicTraffic ? c.organicTraffic.toLocaleString() : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content 5: Competitors Leaderboard */}
        {activeTab === 'competitors' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Competitors Leaderboard</h4>
                <p className="text-[11px] text-gray-500">Benchmark your domain vs main competitors in AI results</p>
              </div>
              <button
                onClick={() => setIsAddCompOpen(true)}
                disabled={competitors.length >= 5}
                className="px-3 py-1.5 bg-[#7C3AED] text-white rounded-lg text-xs font-semibold hover:bg-[#6D28D9] disabled:opacity-50 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Competitor ({competitors.length}/5)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-200">
                <thead className="bg-gray-50 font-semibold text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3">Brand</th>
                    <th className="px-4 py-3">AI Presence</th>
                    <th className="px-4 py-3">Brand Presence</th>
                    <th className="px-4 py-3">Domain Presence</th>
                    <th className="px-4 py-3">Avg Position</th>
                    <th className="px-4 py-3">Share of Voice</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Current Analyzed Domain */}
                  <tr className="bg-[#F5F3FF]/40 font-semibold">
                    <td className="px-4 py-3 text-blue-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <span>{analysis.domain}</span>
                      <span className="text-[10px] bg-blue-200 text-blue-800 px-1 rounded">Target</span>
                    </td>
                    <td className="px-4 py-3 text-blue-900">{analysis.brandName || '--'}</td>
                    <td className="px-4 py-3 text-blue-900">{analysis.aiPresence}%</td>
                    <td className="px-4 py-3 text-blue-900">{analysis.brandPresence ? `${analysis.brandPresence}%` : '--'}</td>
                    <td className="px-4 py-3 text-blue-900">{analysis.domainPresence}%</td>
                    <td className="px-4 py-3 text-blue-900">{analysis.avgPosition}</td>
                    <td className="px-4 py-3 text-blue-900">{analysis.citationShare}%</td>
                    <td className="px-4 py-3 text-right text-gray-400">--</td>
                  </tr>

                  {/* Competitor rows */}
                  {competitors.map((cp) => (
                    <tr key={cp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">{cp.domain}</td>
                      <td className="px-4 py-3 text-gray-600">{cp.brandName || '--'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{cp.aiPresence}%</td>
                      <td className="px-4 py-3 text-gray-600">{cp.brandPresence ? `${cp.brandPresence}%` : '--'}</td>
                      <td className="px-4 py-3 text-gray-600">{cp.domainPresence}%</td>
                      <td className="px-4 py-3 text-gray-600">{cp.avgPosition}</td>
                      <td className="px-4 py-3 text-gray-600">{cp.shareOfVoice}%</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveCompetitor(cp.id)}
                          className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove competitor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Prompt Details Drawer */}
      <PromptDetailsDrawer
        prompt={selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
      />

      {/* Add Competitor Modal */}
      <AddCompetitorModal
        isOpen={isAddCompOpen}
        onClose={() => setIsAddCompOpen(false)}
        analysisId={analysis.id}
        currentCount={competitors.length}
        onSuccess={(newComp) => setCompetitors((prev) => [...prev, newComp])}
      />
    </div>
  );
}
