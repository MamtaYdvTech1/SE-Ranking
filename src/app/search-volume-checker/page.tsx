'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Info,
  X,
  ChevronDown,
  Paperclip,
  Download,
  Search,
  Check,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Plus,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '@/lib/constants';
import { CountryFlag } from '@/components/ui/CountryFlag';

interface VolumeResult {
  keyword: string;
  volume: number;
  cpc: string;
  competition: string;
  trend: string;
}

interface VolumeCheckHistoryItem {
  id: string;
  reportId: string;
  date: string;
  matchType: string;
  country: string;
  countryCode: string;
  region: string;
  source: string;
  keywordsCount: number;
  results: VolumeResult[];
}

function SearchVolumeCheckerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams?.get('tab') || 'checker';

  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [source, setSource] = useState('Google Keyword Planner');
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    SUPPORTED_COUNTRIES.find((c) => c.code === 'in') || SUPPORTED_COUNTRIES[0]
  );
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  // Region Search
  const [regionInput, setRegionInput] = useState('');
  const [isRegionOpen, setIsRegionOpen] = useState(false);

  const indiaRegions = [
    'Hyderabad, Telangana, India',
    'Nellore, Nellore, Andhra Pradesh, India',
    'Vijayawada, Andhra Pradesh, India',
    'Visakhapatnam, Andhra Pradesh, India',
    'Warangal, Telangana, India',
    'Guwahati, Assam, India',
    'Bengaluru, Karnataka, India',
    'Mumbai, Maharashtra, India',
    'Delhi, National Capital Territory of Delhi, India',
    'Pune, Maharashtra, India',
  ];

  const usRegions = [
    'New York, NY, United States',
    'Los Angeles, CA, United States',
    'Chicago, IL, United States',
    'Houston, TX, United States',
    'Phoenix, AZ, United States',
    'San Francisco, CA, United States',
    'Austin, TX, United States',
    'Seattle, WA, United States',
  ];

  const availableRegions = selectedCountry.code === 'in' ? indiaRegions : usRegions;
  const filteredRegions = availableRegions.filter((r) =>
    r.toLowerCase().includes(regionInput.toLowerCase())
  );

  const [keywordsText, setKeywordsText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [results, setResults] = useState<VolumeResult[]>([]);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // History State
  const [selectedHistory, setSelectedHistory] = useState<VolumeCheckHistoryItem | null>(null);
  const [history, setHistory] = useState<VolumeCheckHistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('se_ranking_volume_history');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('se_ranking_volume_history', JSON.stringify(history));
      } catch {
        // ignore
      }
    }
  }, [history]);

  const queryLines = keywordsText
    .split(/[\r\n]+/)
    .map((k) => k.trim())
    .filter(Boolean);
  const queryCount = queryLines.length;
  const totalCost = (queryCount * 0.005).toFixed(3);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      setKeywordsText(text);
    };
    reader.readAsText(file);
  };

  const loadSampleKeywords = () => {
    setKeywordsText(
      `best time tracking software\nremote employee monitoring\ntimesheet calculator app\nemployee productivity tracker\nwork hours tracker with screenshots\nattendance punch in punch out software`
    );
  };

  const handleStartCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (queryCount === 0) {
      alert('Please enter at least one keyword.');
      return;
    }

    setIsChecking(true);
    setCheckError(null);

    const batch = queryLines.slice(0, 100);
    try {
      const res = await fetch('/api/seo/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: batch }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setCheckError(json?.error || `Search volume lookup failed (HTTP ${res.status}).`);
        return;
      }

      type Metric = {
        keyword: string;
        volume: number;
        cpc: number;
        competition: number;
        competitionLevel?: string;
        trend?: Array<{ year: number; month: number; volume: number }>;
      };
      const byKeyword = new Map<string, Metric>(
        ((json.data?.keywords || []) as Metric[]).map((m) => [m.keyword.toLowerCase(), m])
      );

      const yoyTrend = (trend?: Metric['trend']): string => {
        if (!trend || trend.length < 2) return '—';
        const sorted = [...trend].sort((x, y) => x.year * 12 + x.month - (y.year * 12 + y.month));
        const latest = sorted[sorted.length - 1];
        const yearAgo = sorted.find((t) => t.year === latest.year - 1 && t.month === latest.month) || sorted[0];
        if (!yearAgo.volume) return '—';
        const pct = Math.round(((latest.volume - yearAgo.volume) / yearAgo.volume) * 100);
        return `${pct >= 0 ? '+' : ''}${pct}%`;
      };

      const fetched: VolumeResult[] = batch.map((k) => {
        const m = byKeyword.get(k.toLowerCase());
        if (!m) return { keyword: k, volume: 0, cpc: '—', competition: '—', trend: '—' };
        const level =
          m.competitionLevel
            ? m.competitionLevel.charAt(0).toUpperCase() + m.competitionLevel.slice(1).toLowerCase()
            : m.competition < 0.33
            ? 'Low'
            : m.competition < 0.66
            ? 'Medium'
            : 'High';
        return {
          keyword: k,
          volume: m.volume ?? 0,
          cpc: m.cpc ? `$${m.cpc.toFixed(2)}` : '—',
          competition: level,
          trend: yoyTrend(m.trend),
        };
      });

      const newHistoryItem: VolumeCheckHistoryItem = {
        id: `vol_${Date.now()}`,
        reportId: `SV-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        matchType: 'Exact / Broad',
        country: selectedCountry.name,
        countryCode: selectedCountry.code,
        region: regionInput || 'All regions',
        source,
        keywordsCount: batch.length,
        results: fetched,
      };

      setHistory((prev) => [newHistoryItem, ...prev]);
      setResults(fetched);
    } catch {
      setCheckError('Network error while checking search volumes.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleExportCsv = (customResults?: VolumeResult[]) => {
    const targetResults = customResults || results;
    const headers = ['Keyword', 'Monthly Search Volume', 'Estimated CPC', 'Competition Level', 'Trend'];
    const rows = targetResults.map((r) => [
      `"${r.keyword}"`,
      String(r.volume),
      r.cpc,
      r.competition,
      r.trend,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'search_volume_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (selectedHistory?.id === id) {
      setSelectedHistory(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFBFD] min-h-[calc(100vh-80px)] text-gray-900 select-none pb-20 relative">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".txt,.csv"
        className="hidden"
      />

      <div className="max-w-[1240px] mx-auto p-4 sm:p-6 space-y-4">
        {/* Notice Info Banner */}
        {showInfoBanner && (
          <div className="p-3.5 sm:p-4 bg-[#EDF3FC] border border-[#D5E3F7] rounded-lg text-xs text-gray-700 relative flex items-start gap-3 leading-relaxed">
            <Info className="w-4 h-4 text-[#0B69FF] shrink-0 mt-0.5" />
            <p className="flex-1 pr-6">
              Our Search Volume Checker offers statistics on the search volume a specific keyword gets on Google per month. This data will help you predict the traffic volume, evaluate the quality of your semantic core, and discover which keywords can be removed so that you don&apos;t waste resources on promotion.
            </p>
            <button
              type="button"
              onClick={() => setShowInfoBanner(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              title="Close notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. RESULTS TAB: Search volume check history */}
        {/* ========================================================================= */}
        {tab === 'results' ? (
          selectedHistory ? (
            /* Detailed view of a past check report */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedHistory(null)}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to check history</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportCsv(selectedHistory.results)}
                  className="px-3.5 py-1.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Report: {selectedHistory.reportId} ({selectedHistory.keywordsCount} Keywords)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Source: {selectedHistory.source} • Location: {selectedHistory.region}, {selectedHistory.country} • Date: {selectedHistory.date}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Keyword</th>
                        <th className="px-4 py-3 text-right">Monthly Volume</th>
                        <th className="px-4 py-3 text-right">Est. CPC</th>
                        <th className="px-4 py-3 text-center">Competition</th>
                        <th className="px-4 py-3 text-right">YoY Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedHistory.results.map((r, i) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-gray-900">{r.keyword}</td>
                          <td className="px-4 py-3 text-right font-bold text-[#0B69FF]">
                            {r.volume.toLocaleString()} / mo
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-gray-700">{r.cpc}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.competition === 'High'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : r.competition === 'Medium'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {r.competition}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                            {r.trend}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Search volume check history table */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="text-[14px] font-semibold text-gray-800">
                  Search volume check history
                </div>
                <Link
                  href="/search-volume-checker"
                  className="px-3.5 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1 transition-colors cursor-pointer bg-white shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>NEW CHECK</span>
                </Link>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAFBFD] text-gray-500 text-[11px] font-semibold border-b border-gray-200 uppercase tracking-wider">
                      <th className="py-2.5 px-4">CHECK REPORT (ID)</th>
                      <th className="py-2.5 px-4">DATE</th>
                      <th className="py-2.5 px-4">MATCH TYPE</th>
                      <th className="py-2.5 px-4">COUNTRY</th>
                      <th className="py-2.5 px-4">REGION</th>
                      <th className="py-2.5 px-4">SOURCE</th>
                      <th className="py-2.5 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.length > 0 ? (
                      history.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3 px-4 font-semibold text-gray-900">
                            <button
                              type="button"
                              onClick={() => setSelectedHistory(item)}
                              className="text-[#0B69FF] hover:underline cursor-pointer"
                            >
                              {item.reportId} ({item.keywordsCount} kws)
                            </button>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.date}</td>
                          <td className="py-3 px-4 text-gray-700">{item.matchType}</td>
                          <td className="py-3 px-4 text-gray-700">
                            <div className="flex items-center gap-1.5">
                              <CountryFlag code={item.countryCode} size="sm" />
                              <span>{item.country}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.region}</td>
                          <td className="py-3 px-4 text-gray-600">{item.source}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => setSelectedHistory(item)}
                                className="text-[#0B69FF] hover:underline font-medium cursor-pointer"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExportCsv(item.results)}
                                className="text-gray-500 hover:text-gray-800 cursor-pointer"
                              >
                                Export
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteHistory(item.id)}
                                className="text-rose-500 hover:text-rose-700 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      /* Empty State with Magnifying Glass and "No data" */
                      <tr>
                        <td colSpan={7} className="py-24 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Search className="w-10 h-10 text-gray-300 stroke-[1.5]" />
                            <span className="text-sm text-gray-500 font-medium">No data</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* ========================================================================= */
          /* 2. CHECKER FORM: Two-Column Interface */
          /* ========================================================================= */
          <>
            {/* Title row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="text-[13px] font-semibold text-gray-800">
                Search Volume Checker
              </div>
              <button
                type="button"
                onClick={() => alert('Feedback dialog opened')}
                className="text-xs text-gray-500 hover:text-[#0B69FF] cursor-pointer"
              >
                Feedback
              </button>
            </div>

            {/* Two-Column Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Payment for checking */}
              <div className="lg:col-span-5 bg-white border border-gray-200/90 rounded-xl p-6 shadow-2xs space-y-5 text-center">
                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">
                  Payment for checking
                </h3>

                {/* Per search query card */}
                <div className="border border-gray-200 rounded-lg p-5 bg-white space-y-1">
                  <div className="text-2xl font-bold text-[#10B981]">$0.005</div>
                  <div className="text-xs text-gray-500 font-medium">Per search query</div>
                </div>

                {/* Current balance card */}
                <div className="border border-gray-200 rounded-lg p-5 bg-white space-y-1">
                  <div className="text-2xl font-bold text-gray-800">$0</div>
                  <div className="text-xs text-gray-500 font-medium">Current balance</div>
                </div>

                {/* Top Up Balance Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsTopUpModalOpen(true)}
                    className="w-full py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded text-xs font-bold text-gray-700 uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
                  >
                    TOP UP BALANCE
                  </button>
                </div>

                {/* Total amount to be charged section */}
                <div className="pt-2 space-y-2">
                  <div className="text-xs font-semibold text-gray-700">
                    Total amount to be charged
                  </div>
                  <div className="inline-block px-8 py-2 rounded-full bg-blue-50/70 border border-blue-100">
                    <span className="text-xl font-bold text-[#0B69FF]">${totalCost}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Form Controls */}
              <div className="lg:col-span-7 bg-white border border-gray-200/90 rounded-xl p-6 shadow-2xs space-y-4">
                <form onSubmit={handleStartCheck} className="space-y-4 text-xs">
                  {/* Select a source */}
                  <div>
                    <label className="block text-xs text-gray-700 font-medium mb-1.5">
                      Select a source:
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsSourceOpen(!isSourceOpen)}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-xs flex items-center justify-between hover:border-gray-400 cursor-pointer font-medium"
                      >
                        <div className="flex items-center gap-2">
                          {/* Google G logo */}
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                          <span>{source}</span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </button>

                      {isSourceOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 text-xs">
                          {['Google Keyword Planner', 'Google Search', 'Bing Ads Intelligence'].map(
                            (src) => (
                              <button
                                key={src}
                                type="button"
                                onClick={() => {
                                  setSource(src);
                                  setIsSourceOpen(false);
                                }}
                                className={`w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center justify-between ${
                                  source === src ? 'text-[#0B69FF] font-bold bg-blue-50/50' : 'text-gray-700'
                                }`}
                              >
                                <span>{src}</span>
                                {source === src && <Check className="w-3.5 h-3.5 text-[#0B69FF]" />}
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Select country and region */}
                  <div>
                    <label className="block text-xs text-gray-700 font-medium mb-1.5 flex items-center gap-1">
                      <span>Select country and region:</span>
                      <span className="text-gray-400 italic text-[11px]">i</span>
                    </label>

                    <div className="flex items-center gap-2">
                      {/* Country Flag Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsCountryOpen(!isCountryOpen)}
                          className="h-10 px-3 border border-gray-300 rounded-lg bg-white flex items-center gap-1.5 hover:border-gray-400 cursor-pointer font-medium"
                        >
                          <CountryFlag code={selectedCountry.code} size="sm" />
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </button>

                        {isCountryOpen && (
                          <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-1 max-h-48 overflow-y-auto text-xs">
                            {SUPPORTED_COUNTRIES.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setIsCountryOpen(false);
                                  setRegionInput('');
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <CountryFlag code={c.code} size="sm" />
                                <span>{c.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Region Search Input / Dropdown */}
                      <div className="relative flex-1">
                        <div
                          onClick={() => setIsRegionOpen(true)}
                          className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:border-[#0B69FF]"
                        >
                          <input
                            type="text"
                            value={regionInput}
                            onChange={(e) => {
                              setRegionInput(e.target.value);
                              setIsRegionOpen(true);
                            }}
                            onFocus={() => setIsRegionOpen(true)}
                            placeholder="Enter region name"
                            className="w-full px-3.5 py-2.5 text-xs focus:outline-hidden text-gray-900 placeholder:text-gray-400"
                          />
                          <button
                            type="button"
                            onClick={() => setIsRegionOpen(!isRegionOpen)}
                            className="px-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {isRegionOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-30 max-h-56 overflow-y-auto py-1 text-xs">
                            {filteredRegions.map((reg) => (
                              <button
                                key={reg}
                                type="button"
                                onClick={() => {
                                  setRegionInput(reg);
                                  setIsRegionOpen(false);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-blue-50/70 text-gray-700 flex items-center justify-between"
                              >
                                <span>{reg}</span>
                                {regionInput === reg && <Check className="w-3.5 h-3.5 text-[#0B69FF]" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* List keywords textarea & import */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-gray-700 font-medium flex items-center gap-1">
                        <span>List keywords:</span>
                        <span className="text-gray-400 italic text-[11px]">i</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[#0B69FF] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>Import keywords</span>
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={loadSampleKeywords}
                          className="text-gray-500 hover:text-[#0B69FF] cursor-pointer"
                        >
                          Sample
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={8}
                      value={keywordsText}
                      onChange={(e) => setKeywordsText(e.target.value)}
                      placeholder="Enter keywords (one per line)"
                      className="w-full p-3 border border-gray-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-[#0B69FF] leading-relaxed bg-white text-gray-900"
                    />
                  </div>

                  {/* Action Button: START CHECK */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isChecking || queryCount === 0}
                      className={`px-7 py-2.5 rounded font-bold text-xs uppercase tracking-wider text-white transition-all cursor-pointer ${
                        queryCount > 0 && !isChecking
                          ? 'bg-[#0B69FF] hover:bg-[#005FE0] shadow-xs'
                          : 'bg-[#94A3B8] opacity-70 cursor-not-allowed'
                      }`}
                    >
                      {isChecking ? 'Checking volumes...' : 'START CHECK'}
                    </button>
                  </div>
                </form>
                {checkError && (
                  <div className="mt-3 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs">
                    {checkError}
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Results Table Below Form */}
            {results.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs animate-in fade-in duration-200 mt-6">
                <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Search Volume Results ({results.length} Keywords)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Source: {source} • Location: {regionInput || selectedCountry.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportCsv()}
                      className="px-3.5 py-1.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                    <Link
                      href="/search-volume-checker?tab=results"
                      className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      View Check History
                    </Link>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700">
                    <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-200 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Keyword</th>
                        <th className="px-4 py-3 text-right">Monthly Volume</th>
                        <th className="px-4 py-3 text-right">Est. CPC</th>
                        <th className="px-4 py-3 text-center">Competition</th>
                        <th className="px-4 py-3 text-right">YoY Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {results.map((r, i) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-gray-900">{r.keyword}</td>
                          <td className="px-4 py-3 text-right font-bold text-[#0B69FF]">
                            {r.volume.toLocaleString()} / mo
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-gray-700">{r.cpc}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.competition === 'High'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : r.competition === 'Medium'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {r.competition}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                            {r.trend}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Top Up Balance / Subscription Plan Modal */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-gray-200">
            <button
              type="button"
              onClick={() => setIsTopUpModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0B69FF] text-[11px] font-bold uppercase tracking-wider">
                Subscription &amp; Wallet
              </span>
              <h3 className="text-lg font-bold text-gray-900 pt-2">
                Top Up Balance or Upgrade Plan
              </h3>
              <p className="text-xs text-gray-500">
                Unlock automated Google Keyword Planner query checks and unlimited keyword tracking.
              </p>
            </div>

            <div className="space-y-2 border border-gray-200 rounded-xl p-4 bg-gray-50/60">
              <div className="flex items-center justify-between font-bold text-sm text-gray-900">
                <span>Monthly Included Queries</span>
                <span className="text-[#10B981]">1,000 Active</span>
              </div>
              <p className="text-xs text-gray-500">
                Your account includes 1,000 monthly keyword search queries ready to use.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/pricing"
                className="flex-1 py-2.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold rounded-lg text-center transition-colors uppercase tracking-wider"
              >
                Go to Pricing Plans
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchVolumeCheckerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-gray-500">Loading Search Volume Checker...</div>}>
      <SearchVolumeCheckerContent />
    </Suspense>
  );
}
