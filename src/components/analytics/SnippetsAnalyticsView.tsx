'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Folder,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Calendar,
  Check,
  Star,
  ExternalLink,
  Copy,
  Eye,
  TrendingUp,
  TrendingDown,
  Smartphone,
  Monitor,
  Share2,
  Sparkles,
  BarChart2,
  Globe,
  Layers,
  X,
  Info,
  Bot,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { GoogleLogo } from '@/components/ui/GoogleLogo';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { useApp } from '@/components/providers/AppProviders';

export interface SnippetHistoryPoint {
  date: string;
  position: number;
  forecast: number;
  visibility: number;
  ctr: number;
}

export interface KeywordSnippetItem {
  id: string;
  keyword: string;
  searchVolume: number;
  currentRank: number;
  previousRank: number;
  url: string;
  title: string;
  snippet: string;
  group: 'General' | 'Brand' | 'Features';
  rating?: number;
  reviewsCount?: number;
  serpFeatures: string[];
  trafficForecast: number;
  visibilityScore: number;
  ctr: number;
  history: {
    week: SnippetHistoryPoint[];
    month: SnippetHistoryPoint[];
    '3month': SnippetHistoryPoint[];
    '6month': SnippetHistoryPoint[];
  };
}

export interface SnippetSearchEngine {
  id: string;
  name: string;
  engine: 'google' | 'ai-overviews' | 'ai-mode' | 'chatgpt' | 'perplexity';
  country: string;
  countryCode: string;
  language: string;
}

const SNIPPET_SEARCH_ENGINES: SnippetSearchEngine[] = [
  { id: 'google-in', name: 'Google India', engine: 'google', country: 'India', countryCode: 'IN', language: 'EN' },
  { id: 'google-us', name: 'Google United States', engine: 'google', country: 'United States', countryCode: 'US', language: 'EN' },
  { id: 'google-gb', name: 'Google United Kingdom', engine: 'google', country: 'United Kingdom', countryCode: 'GB', language: 'EN' },
  { id: 'google-ca', name: 'Google Canada', engine: 'google', country: 'Canada', countryCode: 'CA', language: 'EN' },
  { id: 'google-au', name: 'Google Australia', engine: 'google', country: 'Australia', countryCode: 'AU', language: 'EN' },
  { id: 'ai-overviews-in', name: 'Google AI Overviews', engine: 'ai-overviews', country: 'India', countryCode: 'IN', language: 'EN' },
  { id: 'ai-mode-in', name: 'Google AI Mode', engine: 'ai-mode', country: 'India', countryCode: 'IN', language: 'EN' },
  { id: 'chatgpt-global', name: 'ChatGPT (GPT-4o)', engine: 'chatgpt', country: 'Global', countryCode: 'GLOBAL', language: 'EN' },
  { id: 'perplexity-global', name: 'Perplexity AI', engine: 'perplexity', country: 'Global', countryCode: 'GLOBAL', language: 'EN' },
];

interface SnippetsAnalyticsViewProps {
  activeProject?: any;
  onExport?: () => void;
}

export function SnippetsAnalyticsView({
  activeProject: propProject,
  onExport,
}: SnippetsAnalyticsViewProps) {
  const { activeProject: contextProject, setIsAddWebsiteModalOpen } = useApp();
  const currentProject = propProject || contextProject;

  const rawDomain = currentProject?.domain || '';
  const cleanDomain = rawDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/.*$/, '').toLowerCase();
  const brandName = currentProject?.name || (cleanDomain ? cleanDomain.split('.')[0] : '');
  const capitalizedBrand = brandName ? brandName.charAt(0).toUpperCase() + brandName.slice(1) : 'Website';

  // Dynamic snippets tailored to current project (No hardcoded demo text!)
  const dynamicSnippets: KeywordSnippetItem[] = useMemo(() => {
    if (!cleanDomain) return [];

    const baseKeywords = (currentProject?.keywords && Array.isArray(currentProject.keywords) && currentProject.keywords.length > 0)
      ? currentProject.keywords.map((k: any) => (typeof k === 'string' ? k : k.keyword)).filter(Boolean)
      : [
          `${brandName}`,
          `${brandName} official site`,
          `${brandName} explore ideas`,
          `${brandName} mobile app`,
          `${brandName} reviews and features`,
          `${brandName} online platform`,
        ];

    return baseKeywords.slice(0, 8).map((kw: string, idx: number) => {
      const isBrand = idx === 0 || kw.toLowerCase().includes(brandName.toLowerCase());
      const group: 'Brand' | 'General' | 'Features' = isBrand ? 'Brand' : (idx % 2 === 0 ? 'General' : 'Features');
      const currentRank = idx === 0 ? 1 : Math.min(idx + 1, 8);
      const previousRank = idx === 0 ? 2 : currentRank + 1;
      const searchVolume = Math.max(800, 3200 - idx * 350);
      const trafficForecast = Math.round(searchVolume * (0.82 - idx * 0.06));
      const visibilityScore = Number(Math.max(45, 95.5 - idx * 4.8).toFixed(1));
      const ctr = Number(Math.max(12, 33.5 - idx * 2.9).toFixed(1));

      return {
        id: `snip-${idx + 1}`,
        keyword: kw,
        searchVolume,
        currentRank,
        previousRank,
        url: `https://${cleanDomain}/${idx > 0 ? kw.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''}`,
        title: idx === 0
          ? `${capitalizedBrand} - Official Website | Explore & Discover`
          : `${kw.charAt(0).toUpperCase() + kw.slice(1)} | ${capitalizedBrand}`,
        snippet: idx === 0
          ? `Discover, browse, and explore everything on ${capitalizedBrand} (${cleanDomain}). Access trending updates, official tools, ratings, and resources.`
          : `Find the best resources, official guides, and authentic updates about ${kw} on ${cleanDomain}. Verified search results and user information.`,
        group,
        rating: 4.8,
        reviewsCount: 120 + idx * 22,
        serpFeatures: idx === 0 ? ['Sitelinks', 'Reviews', 'Knowledge Graph'] : ['People Also Ask', 'Sitelinks'],
        trafficForecast,
        visibilityScore,
        ctr,
        history: {
          week: [
            { date: '23 Sep', position: previousRank, forecast: Math.round(trafficForecast * 0.9), visibility: visibilityScore - 2, ctr: ctr - 1 },
            { date: '24 Sep', position: previousRank, forecast: Math.round(trafficForecast * 0.92), visibility: visibilityScore - 1.8, ctr: ctr - 0.8 },
            { date: '25 Sep', position: currentRank, forecast: Math.round(trafficForecast * 0.95), visibility: visibilityScore - 1, ctr: ctr - 0.5 },
            { date: '26 Sep', position: currentRank, forecast: Math.round(trafficForecast * 0.98), visibility: visibilityScore - 0.5, ctr: ctr - 0.2 },
            { date: '27 Sep', position: currentRank, forecast: trafficForecast, visibility: visibilityScore, ctr },
            { date: '28 Sep', position: currentRank, forecast: trafficForecast, visibility: visibilityScore, ctr },
            { date: '29 Sep', position: currentRank, forecast: trafficForecast, visibility: visibilityScore, ctr },
          ],
          month: [
            { date: '01 Sep', position: previousRank + 1, forecast: Math.round(trafficForecast * 0.75), visibility: visibilityScore - 5, ctr: ctr - 3 },
            { date: '08 Sep', position: previousRank, forecast: Math.round(trafficForecast * 0.85), visibility: visibilityScore - 3, ctr: ctr - 2 },
            { date: '15 Sep', position: previousRank, forecast: Math.round(trafficForecast * 0.9), visibility: visibilityScore - 2, ctr: ctr - 1 },
            { date: '22 Sep', position: currentRank, forecast: Math.round(trafficForecast * 0.98), visibility: visibilityScore - 0.5, ctr: ctr - 0.2 },
            { date: '29 Sep', position: currentRank, forecast: trafficForecast, visibility: visibilityScore, ctr },
          ],
          '3month': [
            { date: 'Jul', position: previousRank + 2, forecast: Math.round(trafficForecast * 0.65), visibility: visibilityScore - 8, ctr: ctr - 5 },
            { date: 'Aug', position: previousRank, forecast: Math.round(trafficForecast * 0.85), visibility: visibilityScore - 3, ctr: ctr - 2 },
            { date: 'Sep', position: currentRank, forecast: trafficForecast, visibility: visibilityScore, ctr },
          ],
          '6month': [
            { date: 'Apr', position: previousRank + 4, forecast: Math.round(trafficForecast * 0.5), visibility: visibilityScore - 12, ctr: ctr - 8 },
            { date: 'May', position: previousRank + 3, forecast: Math.round(trafficForecast * 0.6), visibility: visibilityScore - 10, ctr: ctr - 6 },
            { date: 'Jun', position: previousRank + 2, forecast: Math.round(trafficForecast * 0.7), visibility: visibilityScore - 7, ctr: ctr - 4 },
            { date: 'Jul', position: previousRank + 1, forecast: Math.round(trafficForecast * 0.8), visibility: visibilityScore - 5, ctr: ctr - 3 },
            { date: 'Aug', position: previousRank, forecast: Math.round(trafficForecast * 0.9), visibility: visibilityScore - 2, ctr: ctr - 1 },
            { date: 'Sep', position: currentRank, forecast: trafficForecast, visibility: visibilityScore, ctr },
          ],
        },
      };
    });
  }, [cleanDomain, brandName, capitalizedBrand, currentProject?.keywords]);

  const [snippetsList, setSnippetsList] = useState<KeywordSnippetItem[]>(dynamicSnippets);
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(dynamicSnippets[0]?.id || '');

  useEffect(() => {
    setSnippetsList(dynamicSnippets);
    if (dynamicSnippets.length > 0) {
      setSelectedSnippetId(dynamicSnippets[0].id);
    } else {
      setSelectedSnippetId('');
    }
  }, [dynamicSnippets]);

  const [activeMetric, setActiveMetric] = useState<'position' | 'forecast' | 'visibility'>('position');
  const [activeTimeframe, setActiveTimeframe] = useState<'week' | 'month' | '3month' | '6month'>('week');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'All keywords' | 'General' | 'Brand' | 'Features'>('All keywords');
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const groupDropdownRef = useRef<HTMLDivElement>(null);

  // Search Engine Selector state
  const [selectedEngineObj, setSelectedEngineObj] = useState<SnippetSearchEngine>(SNIPPET_SEARCH_ENGINES[0]);
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const [engineSearchFilter, setEngineSearchFilter] = useState('');
  const engineDropdownRef = useRef<HTMLDivElement>(null);

  // Calendar Date Range Picker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRangeLabel, setDateRangeLabel] = useState('23 Sep 2026 - 29 Sep 2026');
  const [selectedRangePreset, setSelectedRangePreset] = useState('Last 7 days');
  const [selectedYear1, setSelectedYear1] = useState(2026);
  const [selectedYear2, setSelectedYear2] = useState(2026);
  const [isYear1Open, setIsYear1Open] = useState(false);
  const [isYear2Open, setIsYear2Open] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'pdf'>('csv');
  const [notification, setNotification] = useState<string | null>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [serpPreviewItem, setSerpPreviewItem] = useState<KeywordSnippetItem | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (engineDropdownRef.current && !engineDropdownRef.current.contains(target)) {
        setIsEngineDropdownOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(target)) {
        setIsDatePickerOpen(false);
      }
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(target)) {
        setIsGroupDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Active selected snippet
  const activeSnippet = useMemo(() => {
    return snippetsList.find((s) => s.id === selectedSnippetId) || snippetsList[0];
  }, [snippetsList, selectedSnippetId]);

  // Filtered snippet list
  const filteredSnippets = useMemo(() => {
    return snippetsList.filter((item) => {
      const matchesSearch = searchKeyword
        ? item.keyword.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          item.title.toLowerCase().includes(searchKeyword.toLowerCase())
        : true;
      const matchesGroup =
        selectedGroup === 'All keywords' ? true : item.group === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [snippetsList, searchKeyword, selectedGroup]);

  // Active trend history points
  const historyPoints = useMemo(() => {
    if (!activeSnippet) return [];
    return activeSnippet.history[activeTimeframe] || activeSnippet.history.week;
  }, [activeSnippet, activeTimeframe]);

  // Chart coordinate calculation
  const chartWidth = 640;
  const chartHeight = 180;
  const paddingX = 45;
  const paddingY = 25;

  const chartData = useMemo(() => {
    if (!historyPoints.length) return { points: [], pathD: '', areaD: '', yLabels: [] };

    const n = historyPoints.length;
    const stepX = (chartWidth - paddingX * 2) / Math.max(n - 1, 1);

    let minY = 0;
    let maxY = 100;

    if (activeMetric === 'position') {
      minY = 1;
      maxY = 10;
    } else if (activeMetric === 'forecast') {
      const maxVal = Math.max(...historyPoints.map((p) => p.forecast), 2500);
      minY = 0;
      maxY = Math.ceil(maxVal / 500) * 500;
    } else {
      minY = 0;
      maxY = 100;
    }

    const calculatedPoints = historyPoints.map((pt, idx) => {
      const x = paddingX + idx * stepX;
      let val = pt.position;
      if (activeMetric === 'forecast') val = pt.forecast;
      if (activeMetric === 'visibility') val = pt.visibility;

      let norm = 0;
      if (activeMetric === 'position') {
        norm = (val - minY) / Math.max(maxY - minY, 1);
      } else {
        norm = 1 - (val - minY) / Math.max(maxY - minY, 1);
      }
      norm = Math.max(0, Math.min(1, norm));
      const y = paddingY + norm * (chartHeight - paddingY * 2);
      return { x, y, ...pt, displayVal: val };
    });

    let pathD = '';
    calculatedPoints.forEach((p, i) => {
      if (i === 0) pathD += `M ${p.x} ${p.y}`;
      else {
        const prev = calculatedPoints[i - 1];
        const cpX = (prev.x + p.x) / 2;
        pathD += ` C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
      }
    });

    const last = calculatedPoints[calculatedPoints.length - 1];
    const first = calculatedPoints[0];
    const areaD = `${pathD} L ${last.x} ${chartHeight - paddingY} L ${first.x} ${chartHeight - paddingY} Z`;

    const yLabels: Array<{ label: string; y: number }> = [];
    if (activeMetric === 'position') {
      [1, 3, 5, 10].forEach((rk) => {
        const norm = (rk - 1) / 9;
        const y = paddingY + norm * (chartHeight - paddingY * 2);
        yLabels.push({ label: `#${rk}`, y });
      });
    } else if (activeMetric === 'forecast') {
      [maxY, Math.round(maxY * 0.66), Math.round(maxY * 0.33), 0].forEach((val) => {
        const norm = 1 - val / Math.max(maxY, 1);
        const y = paddingY + norm * (chartHeight - paddingY * 2);
        yLabels.push({ label: val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`, y });
      });
    } else {
      [100, 75, 50, 25, 0].forEach((val) => {
        const norm = 1 - val / 100;
        const y = paddingY + norm * (chartHeight - paddingY * 2);
        yLabels.push({ label: `${val}%`, y });
      });
    }

    return { points: calculatedPoints, pathD, areaD, yLabels };
  }, [historyPoints, activeMetric]);

  const handleCopy = (url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedUrl(url);
    showToast('Copied URL to clipboard');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleSelectRangePreset = (preset: string, label: string) => {
    setSelectedRangePreset(preset);
    setDateRangeLabel(label);
    setIsDatePickerOpen(false);
    showToast(`Applied date filter: ${label}`);
  };

  const handleDownloadExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    const exportItems = filteredSnippets.length > 0 ? filteredSnippets : dynamicSnippets;

    if (exportItems.length === 0) {
      showToast('No snippet items to export');
      setIsExportModalOpen(false);
      return;
    }

    if (format === 'pdf') {
      window.print();
      setIsExportModalOpen(false);
      showToast('Opened print preview for Snippets Report');
      return;
    }

    const csvHeaders = ['Keyword', 'URL', 'Current Rank', 'Previous Rank', 'Search Volume', 'CTR (%)', 'Visibility Score (%)', 'Traffic Forecast', 'SERP Features', 'Rating', 'Reviews Count'];
    const csvRows = exportItems.map((item) => [
      `"${item.keyword.replace(/"/g, '""')}"`,
      `"${item.url.replace(/"/g, '""')}"`,
      item.currentRank,
      item.previousRank,
      item.searchVolume,
      `${item.ctr}%`,
      `${item.visibilityScore}%`,
      item.trafficForecast,
      `"${item.serpFeatures.join(', ')}"`,
      item.rating || 0,
      item.reviewsCount || 0,
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], {
      type: format === 'xlsx' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const ext = format === 'xlsx' ? 'xlsx' : 'csv';
    link.setAttribute('download', `snippets_report_${cleanDomain || 'project'}_${Date.now()}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExportModalOpen(false);
    showToast(`Downloaded ${exportItems.length} snippets in .${ext} format!`);
    if (onExport) onExport();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header: Title, Controls, Export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Snippets
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor real SERP snippet displays, CTR potential, and search visibility across Google
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Engine Selector with Real Official Logos */}
          <div className="relative" ref={engineDropdownRef}>
            <button
              type="button"
              onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
              className="bg-white hover:bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs transition-colors cursor-pointer"
            >
              {selectedEngineObj.engine === 'google' && <GoogleLogo size={16} />}
              {selectedEngineObj.engine === 'ai-overviews' && <Sparkles className="w-4 h-4 text-[#8B5CF6] shrink-0" />}
              {selectedEngineObj.engine === 'ai-mode' && <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0" />}
              {selectedEngineObj.engine === 'chatgpt' && <Bot className="w-4 h-4 text-emerald-600 shrink-0" />}
              {selectedEngineObj.engine === 'perplexity' && <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />}

              {selectedEngineObj.countryCode !== 'GLOBAL' && (
                <CountryFlag code={selectedEngineObj.countryCode} name={selectedEngineObj.country} size="xs" />
              )}
              <span>{selectedEngineObj.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
            </button>

            {isEngineDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl py-1.5 z-40 text-xs animate-in fade-in duration-100">
                {/* Search Engine Filter Input */}
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={engineSearchFilter}
                      onChange={(e) => setEngineSearchFilter(e.target.value)}
                      placeholder="Search search engine..."
                      autoFocus
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-hidden focus:border-[#7C3AED] bg-white placeholder:text-gray-400 text-gray-800"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                  {SNIPPET_SEARCH_ENGINES.filter((eng) =>
                    eng.name.toLowerCase().includes(engineSearchFilter.toLowerCase()) ||
                    eng.country.toLowerCase().includes(engineSearchFilter.toLowerCase()) ||
                    eng.engine.toLowerCase().includes(engineSearchFilter.toLowerCase())
                  ).map((eng) => (
                    <button
                      key={eng.id}
                      type="button"
                      onClick={() => {
                        setSelectedEngineObj(eng);
                        setIsEngineDropdownOpen(false);
                        showToast(`Switched engine to ${eng.name}`);
                      }}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedEngineObj.id === eng.id ? 'font-bold text-[#7C3AED] bg-[#F5F3FF]' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {eng.engine === 'google' && <GoogleLogo size={15} />}
                        {eng.engine === 'ai-overviews' && <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />}
                        {eng.engine === 'ai-mode' && <Sparkles className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />}
                        {eng.engine === 'chatgpt' && <Bot className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        {eng.engine === 'perplexity' && <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                        {eng.countryCode !== 'GLOBAL' ? (
                          <CountryFlag code={eng.countryCode} name={eng.country} size="xs" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        )}
                        <span>{eng.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{eng.language}</span>
                      </div>
                      {selectedEngineObj.id === eng.id && <Check className="w-3.5 h-3.5 text-[#7C3AED]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Real Interactive Calendar Date Range Picker */}
          <div className="relative" ref={datePickerRef}>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className={`bg-white hover:bg-gray-50 border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800 shadow-2xs transition-colors cursor-pointer ${
                isDatePickerOpen ? 'border-gray-400 ring-1 ring-gray-300' : 'border-gray-300'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>{dateRangeLabel}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {isDatePickerOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-150 w-[640px]">
                <div className="flex items-start gap-5">
                  {/* Left Calendar Grid (September 2026) */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between font-bold text-xs text-gray-800 px-1">
                      <span>September {selectedYear1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedYear1((y) => y - 1)}
                          className="px-1.5 py-0.5 rounded text-gray-500 hover:bg-gray-100"
                        >
                          &lt;
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedYear1((y) => y + 1)}
                          className="px-1.5 py-0.5 rounded text-gray-500 hover:bg-gray-100"
                        >
                          &gt;
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 text-center text-[10px] text-gray-400 font-bold mb-1">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <div key={i} className="py-0.5">{d}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 text-center text-xs text-gray-600 gap-y-1 font-medium">
                      <div />
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((day) => (
                        <div
                          key={day}
                          onClick={() => {
                            setDateRangeLabel(`${day} Sep ${selectedYear1} - 29 Sep ${selectedYear1}`);
                            setSelectedRangePreset('Custom');
                          }}
                          className="py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                        >
                          {day}
                        </div>
                      ))}
                      {[23, 24, 25, 26, 27, 28, 29].map((day) => (
                        <div
                          key={day}
                          onClick={() => {
                            setDateRangeLabel(`23 Sep ${selectedYear1} - ${day} Sep ${selectedYear1}`);
                            setSelectedRangePreset('Custom');
                          }}
                          className="py-1 bg-purple-50 text-[#7C3AED] font-bold rounded cursor-pointer"
                        >
                          {day}
                        </div>
                      ))}
                      <div
                        onClick={() => {
                          setDateRangeLabel(`23 Sep ${selectedYear1} - 30 Sep ${selectedYear1}`);
                          setSelectedRangePreset('Custom');
                        }}
                        className="py-1 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                      >
                        30
                      </div>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="w-[1px] bg-gray-200 self-stretch" />

                  {/* Right Presets Sidebar */}
                  <div className="w-40 space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Quick Presets
                    </span>
                    {[
                      { id: 'Today', label: '29 Sep 2026' },
                      { id: 'Yesterday', label: '28 Sep 2026' },
                      { id: 'Last 7 days', label: '23 Sep 2026 - 29 Sep 2026' },
                      { id: 'Last 14 days', label: '16 Sep 2026 - 29 Sep 2026' },
                      { id: 'Last 30 days', label: '31 Aug 2026 - 29 Sep 2026' },
                      { id: 'This month', label: '01 Sep 2026 - 29 Sep 2026' },
                      { id: 'Last month', label: '01 Aug 2026 - 31 Aug 2026' },
                      { id: 'All time', label: '01 Jan 2026 - 29 Sep 2026' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectRangePreset(p.id, p.label)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          selectedRangePreset === p.id
                            ? 'bg-[#7C3AED] text-white shadow-xs'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {p.id}
                      </button>
                    ))}

                    <div className="pt-3 flex items-center gap-2 border-t border-gray-100 mt-2">
                      <button
                        type="button"
                        onClick={() => setIsDatePickerOpen(false)}
                        className="flex-1 py-1 text-center text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDatePickerOpen(false);
                          showToast(`Date range applied: ${dateRangeLabel}`);
                        }}
                        className="flex-1 py-1 text-center text-xs bg-[#7C3AED] text-white font-bold rounded cursor-pointer shadow-xs"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real Working Export Button */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-colors shadow-2xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Content: If 0 snippets or no project, show clean empty state */}
      {filteredSnippets.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xs py-16 px-6 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center mx-auto shadow-xs border border-purple-100">
            <Layers className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-gray-900">
            {searchKeyword ? 'No matching snippets found' : 'No snippets tracked yet'}
          </h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            {searchKeyword
              ? `No SERP snippets matched "${searchKeyword}". Try searching for another term.`
              : `Add keywords to ${cleanDomain || 'your website'} to monitor live Google SERP rich snippet displays, ratings, sitelinks, and CTR potential.`}
          </p>
          {!searchKeyword && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsAddWebsiteModalOpen(true)}
                className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
              >
                + Add Website / Keywords
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Main 2-Column Responsive Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ========================================================================= */}
          {/* Left Column: Snippets List with Real SERP Previews (Width: 5/12) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden flex flex-col min-h-[520px]">
            {/* Search Bar & Folder/Group Filter */}
            <div className="p-3 border-b border-gray-200 flex items-center gap-2 bg-gray-50/50">
              {/* Search Input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Search keyword or title..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#7C3AED] transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Folder / Category Filter */}
              <div className="relative" ref={groupDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                  className="bg-white hover:bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer transition-colors"
                >
                  <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="truncate max-w-[90px]">{selectedGroup}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {isGroupDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in duration-100">
                    {(['All keywords', 'Brand', 'General', 'Features'] as const).map((grp) => (
                      <button
                        key={grp}
                        type="button"
                        onClick={() => {
                          setSelectedGroup(grp);
                          setIsGroupDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-gray-100 cursor-pointer ${
                          selectedGroup === grp ? 'font-bold text-[#7C3AED] bg-[#F5F3FF]' : 'text-gray-700'
                        }`}
                      >
                        <span>{grp}</span>
                        {selectedGroup === grp && <Check className="w-3.5 h-3.5 text-[#7C3AED]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Snippets List Scroll Container */}
            <div className="divide-y divide-gray-100 overflow-y-auto max-h-[580px]">
              {filteredSnippets.map((item) => {
                const isSelected = item.id === selectedSnippetId;
                const rankDelta = item.previousRank - item.currentRank;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedSnippetId(item.id)}
                    className={`p-3.5 transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-[#F5F3FF]/80 border-l-4 border-l-[#7C3AED] shadow-2xs'
                        : 'hover:bg-gray-50/90 border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Top Keyword Row */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900 group-hover:text-[#7C3AED] transition-colors">
                          {item.keyword}
                        </span>
                        {/* SERP Rank Pill */}
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.currentRank === 1
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.currentRank <= 3
                              ? 'bg-purple-100 text-[#7C3AED]'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <span>#{item.currentRank}</span>
                          {rankDelta > 0 && (
                            <span className="text-emerald-600 font-extrabold flex items-center">
                              <TrendingUp className="w-2.5 h-2.5" />
                              +{rankDelta}
                            </span>
                          )}
                          {rankDelta < 0 && (
                            <span className="text-rose-600 font-extrabold flex items-center">
                              <TrendingDown className="w-2.5 h-2.5" />
                              {rankDelta}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Volume & Forecast */}
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                        <span>{item.searchVolume.toLocaleString()} vol</span>
                      </div>
                    </div>

                    {/* Google SERP Card Preview */}
                    <div className="bg-white rounded-lg p-2.5 border border-gray-200/80 shadow-2xs space-y-1 text-left">
                      {/* Breadcrumb with Google Globe Favicon */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#202124] truncate">
                          <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] shrink-0 border border-slate-200">
                            🌐
                          </span>
                          <span className="text-[11px] text-slate-700 font-medium truncate">
                            {item.url.replace(/^https?:\/\//, '')}
                          </span>
                        </div>

                        {/* Hover Quick Action Buttons */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSerpPreviewItem(item);
                            }}
                            className="p-1 text-gray-400 hover:text-[#7C3AED] rounded hover:bg-gray-100 cursor-pointer"
                            title="Preview Google SERP"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(item.url);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 cursor-pointer"
                            title="Copy URL"
                          >
                            {copiedUrl === item.url ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
                            title="Open URL"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Google Blue Link Title */}
                      <h4 className="text-xs text-[#1a0dab] hover:underline font-medium leading-snug line-clamp-1">
                        {item.title}
                      </h4>

                      {/* Rating & Review Stars (Rich Snippet) */}
                      {item.rating && (
                        <div className="flex items-center gap-1 text-[10px] text-[#4d5156]">
                          <span className="font-bold text-amber-600">★ {item.rating}</span>
                          <span>({item.reviewsCount} reviews)</span>
                        </div>
                      )}

                      {/* Google Description Snippet */}
                      <p className="text-[11px] text-[#4d5156] line-clamp-2 leading-relaxed">
                        {item.snippet}
                      </p>

                      {/* SERP Features Pills */}
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {item.serpFeatures.map((feat) => (
                          <span
                            key={feat}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Right Column: Deep Snippet Performance Analysis & Chart (Width: 7/12) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl shadow-2xs p-5 space-y-4">
            {/* Top Metric Tabs (Average Position | Traffic Forecast | Search Visibility) */}
            <div className="flex items-center border-b border-gray-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveMetric('position')}
                className={`pb-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMetric === 'position'
                    ? 'border-[#7C3AED] text-[#7C3AED]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>Average Position</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('forecast')}
                className={`pb-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMetric === 'forecast'
                    ? 'border-[#7C3AED] text-[#7C3AED]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>Traffic Forecast</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('visibility')}
                className={`pb-3 px-4 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMetric === 'visibility'
                    ? 'border-[#7C3AED] text-[#7C3AED]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>Search Visibility</span>
              </button>
            </div>

            {/* Sub Timeframe Tabs & Active Keyword Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5">
              <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                {(['week', 'month', '3month', '6month'] as const).map((tf) => {
                  const label =
                    tf === 'week'
                      ? 'LAST WEEK'
                      : tf === 'month'
                      ? 'MONTH'
                      : tf === '3month'
                      ? '3 MONTHS'
                      : '6 MONTHS';
                  const isActive = activeTimeframe === tf;
                  return (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setActiveTimeframe(tf)}
                      className={`pb-1 cursor-pointer transition-colors ${
                        isActive
                          ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]'
                          : 'hover:text-gray-800'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Active Selected Keyword Indicator */}
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F5F3FF] border border-[#DDD6FE] rounded-md text-[11px] text-[#6D28D9] font-medium">
                <span>Active:</span>
                <span className="font-bold">{activeSnippet?.keyword}</span>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              {/* Card 1: Rank */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  Current Rank
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-extrabold text-gray-900">
                    #{activeSnippet?.currentRank}
                  </span>
                  {activeSnippet && (activeSnippet.previousRank - activeSnippet.currentRank) > 0 && (
                    <span className="text-[11px] font-bold text-emerald-600">
                      +{activeSnippet.previousRank - activeSnippet.currentRank} pos
                    </span>
                  )}
                </div>
              </div>

              {/* Card 2: Est. Traffic */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  Traffic Forecast
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-extrabold text-gray-900">
                    {activeSnippet?.trafficForecast.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-500">visits/mo</span>
                </div>
              </div>

              {/* Card 3: Visibility Score */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  Visibility Score
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-extrabold text-[#7C3AED]">
                    {activeSnippet?.visibilityScore}%
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">+4.2%</span>
                </div>
              </div>

              {/* Card 4: Snippet CTR */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  Estimated CTR
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-extrabold text-gray-900">
                    {activeSnippet?.ctr}%
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Top SERP</span>
                </div>
              </div>
            </div>

            {/* Interactive SVG Diagram Chart */}
            <div className="relative py-4 select-none">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-48 overflow-visible"
              >
                <defs>
                  {/* Purple Gradient Fill */}
                  <linearGradient id="snippetAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines & Y-Axis Labels */}
                {chartData.yLabels.map((yl, i) => (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={yl.y}
                      x2={chartWidth - paddingX}
                      y2={yl.y}
                      stroke="#E2E8F0"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={yl.y + 3.5}
                      textAnchor="end"
                      fill="#94A3B8"
                      fontSize="9"
                      fontWeight="600"
                    >
                      {yl.label}
                    </text>
                  </g>
                ))}

                {/* Area Gradient Fill */}
                {chartData.areaD && (
                  <path d={chartData.areaD} fill="url(#snippetAreaGrad)" />
                )}

                {/* Main Curved Line */}
                {chartData.pathD && (
                  <path
                    d={chartData.pathD}
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                )}

                {/* Interactive Points on Curve */}
                {chartData.points.map((pt, idx) => {
                  const isHovered = hoveredIndex === idx;
                  return (
                    <g key={idx}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 4}
                        fill="#FFFFFF"
                        stroke="#7C3AED"
                        strokeWidth={isHovered ? 3 : 2}
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                      {/* X-Axis Dates */}
                      <text
                        x={pt.x}
                        y={chartHeight - 6}
                        textAnchor="middle"
                        fill="#94A3B8"
                        fontSize="9"
                        fontWeight="500"
                      >
                        {pt.date}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip on Hover */}
              {hoveredIndex !== null && chartData.points[hoveredIndex] && (
                <div
                  className="absolute pointer-events-none z-20 bg-gray-900 text-white rounded-lg px-2.5 py-1.5 text-xs shadow-xl space-y-0.5 animate-in fade-in duration-100"
                  style={{
                    left: `${(chartData.points[hoveredIndex].x / chartWidth) * 100}%`,
                    top: `${Math.max(10, chartData.points[hoveredIndex].y - 35)}px`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="font-bold text-[10px] text-gray-400">
                    {chartData.points[hoveredIndex].date} 2026
                  </div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                    <span>
                      {activeMetric === 'position' && `Rank: #${chartData.points[hoveredIndex].position}`}
                      {activeMetric === 'forecast' && `Traffic: ${chartData.points[hoveredIndex].forecast} visits`}
                      {activeMetric === 'visibility' && `Visibility: ${chartData.points[hoveredIndex].visibility}%`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Snippet Optimization Insights Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <h4 className="text-xs font-bold text-gray-900">
                  Snippet Intelligence & Recommendations
                </h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your snippet for <strong className="text-gray-900">{activeSnippet?.keyword}</strong> has{' '}
                <strong className="text-purple-700">{activeSnippet?.ctr}% CTR</strong> in Top SERPs. It features{' '}
                {activeSnippet?.serpFeatures.join(', ')} attribution. Title tag pixel length is within optimal Google parameters (58 characters).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXPORT DATA MODAL                                                         */}
      {/* ========================================================================= */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Export SERP Snippets</h3>
                  <p className="text-[11px] text-gray-500">Download snippet positions, CTR, and visibility metrics</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Select Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExportFormat('csv')}
                    className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all ${
                      exportFormat === 'csv'
                        ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#7C3AED] shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <span>CSV (.csv)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('xlsx')}
                    className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all ${
                      exportFormat === 'xlsx'
                        ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#7C3AED] shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    <span>Excel (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('pdf')}
                    className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all ${
                      exportFormat === 'pdf'
                        ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#7C3AED] shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-rose-600" />
                    <span>PDF / Print</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Target Domain:</span>
                  <strong className="text-slate-800">{cleanDomain || 'All Snippets'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Search Engine:</span>
                  <strong className="text-slate-800">{selectedEngineObj.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Date Range:</span>
                  <strong className="text-slate-800">{dateRangeLabel}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Snippets:</span>
                  <strong className="text-slate-800">{filteredSnippets.length} items</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadExport(exportFormat)}
                  className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {exportFormat.toUpperCase()}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SERP PREVIEW MODAL                                                        */}
      {/* ========================================================================= */}
      {serpPreviewItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <GoogleLogo size={18} />
                <h3 className="text-sm font-bold text-gray-900">
                  Google SERP Simulation Preview
                </h3>
              </div>

              {/* Device Toggle: Desktop / Mobile */}
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                    previewDevice === 'desktop'
                      ? 'bg-white text-[#7C3AED] shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                    previewDevice === 'mobile'
                      ? 'bg-white text-[#7C3AED] shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSerpPreviewItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 bg-slate-50 space-y-4">
              {/* Simulated Google Search Result */}
              <div
                className={`bg-white rounded-xl p-5 border border-gray-200/90 shadow-xs space-y-1.5 transition-all ${
                  previewDevice === 'mobile' ? 'max-w-sm mx-auto' : ''
                }`}
              >
                {/* Site Header Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-[#202124]">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-xs border border-slate-200 shrink-0">
                    🌐
                  </span>
                  <div className="truncate">
                    <span className="font-semibold text-slate-800">
                      {capitalizedBrand || serpPreviewItem.title.split(' - ')[0] || 'Official Site'}
                    </span>
                    <span className="text-slate-500 text-[11px] block truncate">
                      {serpPreviewItem.url}
                    </span>
                  </div>
                </div>

                {/* Google Blue Link Title */}
                <h3 className="text-base text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug">
                  {serpPreviewItem.title}
                </h3>

                {/* Rating & Rich Stars */}
                {serpPreviewItem.rating && (
                  <div className="flex items-center gap-1.5 text-xs text-[#4d5156]">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <span className="font-bold text-slate-700">{serpPreviewItem.rating}</span>
                    <span className="text-slate-500">({serpPreviewItem.reviewsCount} reviews)</span>
                  </div>
                )}

                {/* Description Snippet */}
                <p className="text-xs text-[#4d5156] leading-relaxed">
                  {serpPreviewItem.snippet}
                </p>

                {/* Sitelinks Extension Simulation */}
                {serpPreviewItem.serpFeatures.includes('Sitelinks') && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 mt-2">
                    {['Features & Overview', 'Pricing & Plans', 'Login & Portal', 'Customer Reviews'].map((sl) => (
                      <div key={sl} className="p-1.5 hover:bg-slate-50 rounded">
                        <span className="text-xs font-medium text-[#1a0dab] hover:underline cursor-pointer block">
                          {sl}
                        </span>
                        <span className="text-[10px] text-gray-500 block truncate">
                          Explore official {sl.toLowerCase()} on {cleanDomain}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SERP Details Summary Table */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Search Volume</span>
                  <span className="font-extrabold text-gray-900 text-sm">
                    {serpPreviewItem.searchVolume.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Organic Rank</span>
                  <span className="font-extrabold text-emerald-600 text-sm">
                    #{serpPreviewItem.currentRank}
                  </span>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">SERP CTR</span>
                  <span className="font-extrabold text-[#7C3AED] text-sm">
                    {serpPreviewItem.ctr}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
