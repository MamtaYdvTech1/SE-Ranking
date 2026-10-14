'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Globe,
  ExternalLink,
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  Download,
  Share2,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Layers,
  FileText,
  DollarSign,
  CheckCircle2,
  SlidersHorizontal,
  Info,
  Calendar,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { CountryFlag } from '@/components/ui/CountryFlag';

export default function CompetitiveResearchReportPage() {
  const { activeProject } = useApp();
  const displayDomain = activeProject?.domain
    ? activeProject.domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : '';
  const displayBrand = activeProject?.brandName || activeProject?.name || (displayDomain ? (displayDomain.split('.')[0].charAt(0).toUpperCase() + displayDomain.split('.')[0].slice(1)) : 'Domain');

  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'rankchanges' | 'competitors' | 'country' | 'pages' | 'subdomains' | 'compare'>('overview');
  const [searchScope, setSearchScope] = useState('base_domain');
  const [selectedCountry, setSelectedCountry] = useState({ code: 'in', name: 'India' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24 text-gray-800 text-sm">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1E293B] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}


      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/project-overview" className="text-xs font-semibold text-gray-500 hover:text-gray-900">
                Projects
              </Link>
              <span className="text-gray-300">/</span>
              <span className="font-bold text-gray-900 text-sm">Competitive Research</span>
              <span className="text-gray-300">/</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 text-[#0B69FF] text-xs font-bold">
                <Globe className="w-3.5 h-3.5" />
                <span>Google Search</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-600">
              <button
                type="button"
                onClick={() => showToast('Report exported (PDF/CSV)')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-bold shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span>Export</span>
              </button>
              <Link href="/help" className="hover:text-[#0B69FF] flex items-center gap-1">
                <span>Have any questions?</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </Link>
              <Link href="/feedback" className="hover:text-[#0B69FF]">
                Feedback
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white border-b border-gray-200 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg bg-gray-50 text-xs font-semibold text-gray-700">
              <span>Google Search</span>
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={displayDomain}
                className="w-full pl-3 pr-24 py-1.5 border border-gray-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-[#0B69FF]"
              />
              <button
                type="button"
                onClick={() => showToast('Re-analyzing domain live metrics...')}
                className="absolute right-1 top-1 bottom-1 px-3 bg-[#0B69FF] hover:bg-[#005FE0] text-white rounded text-xs font-bold shadow-2xs cursor-pointer"
              >
                Analyze
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white shadow-2xs">
              <span className="font-bold text-gray-700">Organic</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>October 2026</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white shadow-2xs">
              <DollarSign className="w-3.5 h-3.5 text-gray-400" />
              <span>$ USD</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs matching prompt */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 mt-3 border-t border-gray-100 pt-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'keywords', label: 'Keywords' },
            { id: 'rankchanges', label: 'Ranking changes' },
            { id: 'competitors', label: 'Competitors' },
            { id: 'country', label: 'Traffic distribution by country' },
            { id: 'pages', label: 'Pages' },
            { id: 'subdomains', label: 'Subdomains' },
            { id: 'compare', label: 'Competitor Comparison' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#0B69FF] text-[#0B69FF] font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Report Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Quick Action Task Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-900">Find high-potential keywords</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Check what keywords you rank for can bring more results</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('keywords')}
              className="px-3 py-1.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white rounded-lg text-xs font-bold shadow-2xs shrink-0 cursor-pointer ml-2"
            >
              Go to keywords
            </button>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-900">Get to know your competitors</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Find out who you compete in SERP with</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('competitors')}
              className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-bold shadow-2xs shrink-0 cursor-pointer ml-2"
            >
              Go to competitors
            </button>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-900">Find missing keywords</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Check what keywords your competitors rank for and you do not</p>
            </div>
            <button
              type="button"
              onClick={() => showToast('Opening Keyword Gap Analysis tool...')}
              className="px-3 py-1.5 bg-[#504674] hover:bg-[#3E365A] text-white rounded-lg text-xs font-bold shadow-2xs shrink-0 cursor-pointer ml-2"
            >
              Go to keywords gap
            </button>
          </div>
        </div>

        {/* Core Metrics Cards (Exact numbers from user prompt) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
          <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-1 shadow-2xs">
            <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-0.5">
              <span>Domain Trust</span>
              <span className="text-gray-300">ℹ</span>
            </div>
            <div className="flex items-baseline gap-1 pt-0.5">
              <span className="text-2xl font-black text-[#0B69FF]">40</span>
              <span className="text-xs text-gray-400 font-semibold">/ 100</span>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-1 shadow-2xs">
            <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-0.5">
              <span>Page Trust</span>
              <span className="text-gray-300">ℹ</span>
            </div>
            <div className="flex items-baseline gap-1 pt-0.5">
              <span className="text-2xl font-black text-[#0B69FF]">11</span>
              <span className="text-xs text-gray-400 font-semibold">/ 100</span>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-1 shadow-2xs">
            <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-0.5">
              <span>Organic Traffic</span>
              <span className="text-gray-300">ℹ</span>
            </div>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-2xl font-black text-[#0B69FF]">453</span>
              <span className="text-xs font-bold text-red-500">▼ 61</span>
            </div>
            <div className="text-[11px] text-gray-400">131 kws · $220.6 cost</div>
          </div>

          <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-1 shadow-2xs">
            <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-0.5">
              <span>Paid Traffic</span>
              <span className="text-gray-300">ℹ</span>
            </div>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-2xl font-black text-[#0B69FF]">34</span>
              <span className="text-xs font-bold text-red-500">▼ 8</span>
            </div>
            <div className="text-[11px] text-gray-400">3 kws · $11.3 cost</div>
          </div>

          <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-1 shadow-2xs">
            <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-0.5">
              <span>Referring Domains</span>
              <span className="text-gray-300">ℹ</span>
            </div>
            <div className="text-2xl font-black text-[#0B69FF] pt-0.5">180</div>
            <div className="text-[11px] text-gray-400">Sep-29 2026</div>
          </div>

          <div className="p-3.5 bg-white border border-gray-200 rounded-xl space-y-1 shadow-2xs">
            <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-0.5">
              <span>Backlinks</span>
              <span className="text-gray-300">ℹ</span>
            </div>
            <div className="text-2xl font-black text-[#0B69FF] pt-0.5">259</div>
            <div className="text-[11px] text-emerald-600 font-semibold">Clean profile</div>
          </div>
        </div>

        {/* Section 1: Traffic Distribution by Country Table */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-gray-900">Traffic distribution by country</h3>
              <span className="text-gray-300 text-xs">ℹ</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-[#0B69FF] text-white font-bold shadow-2xs">Organic</span>
              <span className="px-2.5 py-1 rounded bg-gray-100 text-gray-600 font-medium">Paid</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <th className="py-2.5 px-3 text-left">Country</th>
                  <th className="py-2.5 px-3 text-right">Traffic share</th>
                  <th className="py-2.5 px-3 text-right">Traffic</th>
                  <th className="py-2.5 px-3 text-right">Keywords total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { code: 'in', name: 'India', share: '87.62%', traffic: 453, change: '-61', kws: 131 },
                  { code: 'pk', name: 'Pakistan', share: '3.29%', traffic: 17, change: '-3', kws: 11 },
                  { code: 'us', name: 'USA', share: '3.29%', traffic: 17, change: '-1', kws: 124 },
                  { code: 'gb', name: 'United Kingdom', share: '1.16%', traffic: 6, change: '-5', kws: 42 },
                  { code: 'ng', name: 'Nigeria', share: '0.97%', traffic: 5, change: '0', kws: 2 },
                  { code: 'un', name: 'Other', share: '3.68%', traffic: 19, change: '-6', kws: 1500 },
                ].map((row) => (
                  <tr key={row.name} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-gray-900 flex items-center gap-2">
                      <CountryFlag countryCode={row.code} countryName={row.name} size="sm" />
                      <span>{row.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-800">{row.share}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#0B69FF]">
                      {row.traffic} <span className="text-[10px] text-red-500 font-normal">{row.change}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-gray-700">{row.kws}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Organic Keywords & Competitors (2 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Organic Keywords (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-gray-900">Organic keywords</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0B69FF]">131</span>
              </div>
              <button
                type="button"
                onClick={() => showToast('Opening all 131 organic keywords...')}
                className="text-xs font-bold text-[#0B69FF] hover:underline"
              >
                View more
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                    <th className="py-2 px-3 text-left">Keyword</th>
                    <th className="py-2 px-3 text-center">Search vol.</th>
                    <th className="py-2 px-3 text-center">Position</th>
                    <th className="py-2 px-3 text-center">Competition</th>
                    <th className="py-2 px-3 text-right">CPC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { kw: 'work composer', vol: 480, pos: 1, comp: 0.3, cpc: '$0.30' },
                    { kw: 'composer download', vol: '1.9K', pos: 13, comp: 0, cpc: '$1.30' },
                    { kw: 'work composer download', vol: 210, pos: 1, comp: 0.3, cpc: '$0.40' },
                    { kw: 'work composer download', vol: 210, pos: 2, comp: 0.3, cpc: '$0.40' },
                    { kw: 'work composer', vol: 480, pos: 1, comp: 0.3, cpc: '$0.30' },
                  ].map((k, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#0B69FF] hover:underline cursor-pointer">
                        {k.kw}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-gray-800">{k.vol}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-black text-xs">
                          {k.pos}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray-500">{k.comp}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-700">{k.cpc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Organic Competitors (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-gray-900">Organic competitors</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">2</span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Opening all competitors...')}
                  className="text-xs font-bold text-[#0B69FF] hover:underline"
                >
                  View more
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                      <th className="py-2 px-3 text-left">Domain</th>
                      <th className="py-2 px-3 text-center">Overlap</th>
                      <th className="py-2 px-3 text-center">DT</th>
                      <th className="py-2 px-3 text-right">Keyword total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#0B69FF] flex items-center gap-1.5">
                        <img src="https://www.google.com/s2/favicons?domain=https://onetracker.in" alt="favicon" className="w-3.5 h-3.5 rounded" />
                        <a href="https://onetracker.in" target="_blank" rel="noreferrer" className="hover:underline">
                          onetracker.in
                        </a>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-gray-800">1</td>
                      <td className="py-2.5 px-3 text-center font-bold text-gray-700">1</td>
                      <td className="py-2.5 px-3 text-right font-black text-[#0B69FF]">187</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#0B69FF] flex items-center gap-1.5">
                        <img src="https://www.google.com/s2/favicons?domain=https://afk-assistant.com" alt="favicon" className="w-3.5 h-3.5 rounded" />
                        <a href="https://afk-assistant.com" target="_blank" rel="noreferrer" className="hover:underline">
                          afk-assistant.com
                        </a>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-gray-800">4</td>
                      <td className="py-2.5 px-3 text-center font-bold text-gray-700">4</td>
                      <td className="py-2.5 px-3 text-right font-black text-[#0B69FF]">98</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Keywords by Intent */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <div className="text-xs font-bold text-gray-800">Keywords by Intent</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                    <span className="text-gray-700">Informational</span>
                  </div>
                  <span className="font-bold text-gray-900">173 (72.38%) · 194 traffic</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span className="text-gray-700">Navigational</span>
                  </div>
                  <span className="font-bold text-gray-900">49 (20.50%) · 259 traffic</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <span className="text-gray-700">Local</span>
                  </div>
                  <span className="font-bold text-gray-900">17 (7.11%) · 259 traffic</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Top Pages in Organic Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Top pages in organic search (56)</h3>
            <button
              type="button"
              onClick={() => showToast('Opening all 56 indexed pages...')}
              className="text-xs font-bold text-[#0B69FF] hover:underline"
            >
              View more
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <th className="py-2.5 px-3 text-left w-1/2">URL</th>
                  <th className="py-2.5 px-3 text-right w-1/4">Traffic share</th>
                  <th className="py-2.5 px-3 text-right w-1/4">Total traffic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { title: `${displayBrand} - Official Website Online`, url: `https://www.${displayDomain}/`, share: '51.43%', traffic: 233 },
                  { title: `Top Deals and Products - ${displayBrand}`, url: `https://www.${displayDomain}/deals`, share: '19.65%', traffic: 89 },
                  { title: `${displayBrand} Store & Categories`, url: `https://www.${displayDomain}/products`, share: '12.36%', traffic: 56 },
                  { title: `Features & Solutions - ${displayBrand}`, url: `https://www.${displayDomain}/solutions`, share: '2.21%', traffic: 10 },
                  { title: `${displayBrand} Pricing & Plans`, url: `https://www.${displayDomain}/pricing`, share: '1.99%', traffic: 9 },
                ].map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-gray-900 truncate max-w-lg">{p.title}</div>
                      <a href={p.url} target="_blank" rel="noreferrer" className="text-[11px] text-[#0B69FF] hover:underline truncate block">
                        {p.url}
                      </a>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-800">{p.share}</td>
                    <td className="py-2.5 px-3 text-right font-black text-[#0B69FF]">{p.traffic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Ad Copies Samples */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900">Ad copies samples</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <div className="text-xs font-bold text-[#0B69FF] hover:underline cursor-pointer">
                {displayBrand} Official Store | Verified Online Shopping
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">https://www.{displayDomain}/</div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Explore official deals, top rated selections, and comprehensive services on {displayBrand}. Verified official portal.
              </p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <div className="text-xs font-bold text-[#0B69FF] hover:underline cursor-pointer">
                Top Rated Deals & Best Sellers on {displayBrand}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">https://www.{displayDomain}/deals</div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Exclusive seasonal offers and everyday savings. Fast shipping and dependable customer service with {displayBrand}.
              </p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <div className="text-xs font-bold text-[#0B69FF] hover:underline cursor-pointer">
                Official {displayBrand} App & Mobile Services
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">https://www.{displayDomain}/app</div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Seamless experience on web, Android, and iOS. Track orders and manage your account in real time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
