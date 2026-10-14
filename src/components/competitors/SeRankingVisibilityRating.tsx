'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Globe,
  Home,
  Info,
  Search,
  Share2,
  MessageSquare,
  FileText,
  Upload,
  Trash2,
} from 'lucide-react';

export interface CompetitorItem {
  id: string;
  domain: string;
  visibility: number;
  avgPosition: number;
  commonKeywords: number;
  totalKeywords: number;
  organicTraffic: string;
  backlinks: string;
  tag: string;
}

export interface SeRankingVisibilityRatingProps {
  projectDomain?: string;
  projectId?: string;
  addedCompetitors?: CompetitorItem[];
  showToast?: (msg: string) => void;
  onOpenGuestLink?: () => void;
  onOpenFeedback?: () => void;
  onOpenNotes?: () => void;
  notesCount?: number;
}

interface VisibilityCompetitor {
  id: number;
  domain: string;
  keywordsCount: string;
  visibility: number;
  visibilityStr: string;
  trafficForecast: string;
  percentInTop10: string;
  backlinks?: string;
  refDomains?: string;
  color: string;
  isYou: boolean;
  isActive: boolean;
  seriesData?: number[];
}

const COMPETITOR_COLORS = [
  '#e6ec94', // Light Yellow / Lime
  '#53022a', // Deep Maroon / Burgundy
  '#6e67a4', // Slate Purple
  '#8bd0a6', // Mint Green
  '#06900a', // Vibrant Green
  '#1e232f', // Dark Charcoal
  '#dcd98b', // Khaki Gold
  '#e74c3c', // Red
  '#f39c12', // Orange
  '#5f27cd', // Violet
];

export function SeRankingVisibilityRating({
  projectDomain = '',
  projectId,
  addedCompetitors = [],
  showToast = () => {},
  onOpenGuestLink = () => {},
  onOpenFeedback = () => {},
  onOpenNotes = () => {},
  notesCount = 50,
}: SeRankingVisibilityRatingProps) {
  const cleanDomain = projectDomain
    ? projectDomain.replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase()
    : '';

  const [competitors, setCompetitors] = useState<VisibilityCompetitor[]>([]);

  useEffect(() => {
    if (!cleanDomain) {
      setCompetitors([]);
      return;
    }

    const youComp: VisibilityCompetitor = {
      id: 1,
      domain: cleanDomain,
      keywordsCount: '—',
      visibility: 100,
      visibilityStr: '100%',
      trafficForecast: '—',
      percentInTop10: '—',
      backlinks: '—',
      refDomains: '—',
      color: '#c5158e', // SE Ranking Magenta
      isYou: true,
      isActive: true,
      seriesData: [100, 100, 100, 100, 100, 100],
    };

    const compRows: VisibilityCompetitor[] = (addedCompetitors || []).map((c, idx) => ({
      id: idx + 2,
      domain: c.domain,
      keywordsCount: `${c.totalKeywords || c.commonKeywords || 0}`,
      visibility: c.visibility || 0,
      visibilityStr: `${c.visibility || 0}%`,
      trafficForecast: c.organicTraffic || '—',
      percentInTop10: '—',
      backlinks: c.backlinks || '—',
      refDomains: '—',
      color: COMPETITOR_COLORS[idx % COMPETITOR_COLORS.length],
      isYou: false,
      isActive: true,
      seriesData: [
        c.visibility || 0,
        c.visibility || 0,
        c.visibility || 0,
        c.visibility || 0,
        c.visibility || 0,
        c.visibility || 0,
      ],
    }));

    setCompetitors([youComp, ...compRows]);
  }, [cleanDomain, addedCompetitors]);
  const [activeMetricTab, setActiveMetricTab] = useState<'visibility' | 'traffic' | 'top10' | 'distribution'>('visibility');
  const [period, setPeriod] = useState<'week' | '2weeks' | 'month'>('month');
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const [searchEngine, setSearchEngine] = useState('All search engines');
  const [searchFilter, setSearchFilter] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; comp: VisibilityCompetitor; x: number; y: number } | null>(null);

  const toggleCompetitorActive = (id: number) => {
    setCompetitors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleRemoveCompetitor = (id: number, domain: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
    showToast(`Removed ${domain} from visibility chart.`);
  };

  const filteredCompetitors = competitors.filter((c) =>
    c.domain.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  // Dynamic dates matching period selection (Week / 2 Weeks / Month)
  const dates = useMemo(() => {
    if (period === 'week') {
      return ['06 Oct', '07 Oct', '08 Oct', '09 Oct', '10 Oct', '11 Oct'];
    }
    if (period === '2weeks') {
      return ['28 Sep', '30 Sep', '02 Oct', '04 Oct', '06 Oct', '08 Oct', '10 Oct', '11 Oct'];
    }
    return ['12 Sep', '17 Sep', '22 Sep', '27 Sep', '02 Oct', '06 Oct', '09 Oct', '11 Oct'];
  }, [period]);

  const [hoverDateIdx, setHoverDateIdx] = useState<number>(3); // Default to '09 Oct' matching Screenshot
  const activeDateIndex = Math.max(0, Math.min(hoverDateIdx, (dates?.length || 1) - 1));

  const svgWidth = 920;
  const svgHeight = 260;
  const paddingX = 50;
  const paddingY = 30;
  const chartW = svgWidth - 2 * paddingX;
  const chartH = svgHeight - 2 * paddingY;

  const getX = (idx: number) => paddingX + (idx / Math.max(1, dates.length - 1)) * chartW;
  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    return paddingY + chartH - (clamped / 100) * chartH;
  };

  const activeCompetitors = competitors.filter((c) => c.isActive);
  const activeHoverX = getX(activeDateIndex);

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#171B24] font-sans antialiased text-xs">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: BREADCRUMBS & GLOBAL CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-[#E3E6EE] px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href={`/projects/${projectId || '13038212'}`}
            className="text-[#2563EB] hover:underline font-semibold"
          >
            https://{cleanDomain}/
          </Link>
          <span className="text-[#8F94A6]">/</span>
          <Link href="/competitors" className="text-[#2563EB] hover:underline font-semibold">
            My Competitors
          </Link>
          <span className="text-[#8F94A6]">/</span>
          <span className="text-[#171B24] font-bold">Visibility Rating</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenGuestLink}
            className="text-[#2563EB] hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Guest link</span>
          </button>
          <button
            onClick={onOpenFeedback}
            className="text-[#2563EB] hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedback</span>
          </button>
          <button
            onClick={onOpenNotes}
            className="text-[#2563EB] hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes ({notesCount})</span>
          </button>
          <div className="flex items-center gap-1 text-[#8F94A6] pl-2 border-l border-[#E3E6EE]">
            <span>Account limit</span>
            <span className="font-semibold text-[#171B24]">0/10</span>
            <Info className="w-3.5 h-3.5 text-[#8F94A6] cursor-help" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUBHEADER: ENGINE SELECTOR, DATE, EXPORT */}
      {/* ========================================================================= */}
      <div className="px-6 py-4 max-w-[1440px] mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Search Engine Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
                className="bg-white border border-[#D5DAE5] rounded-md px-3 py-1.5 flex items-center gap-2 font-medium text-[#171B24] shadow-2xs hover:bg-[#F8FAFC] cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-[#2563EB]" />
                <span>{searchEngine}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8F94A6]" />
              </button>

              {isEngineDropdownOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-white border border-[#E3E6EE] rounded-lg shadow-xl py-1 z-40 animate-in fade-in duration-100">
                  {['All search engines', 'Google India (en)', 'Google UK (en)', 'Google US (en)'].map((eng) => (
                    <button
                      key={eng}
                      type="button"
                      onClick={() => {
                        setSearchEngine(eng);
                        setIsEngineDropdownOpen(false);
                        showToast(`Selected ${eng}`);
                      }}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-[#F0F4FF] cursor-pointer ${
                        searchEngine === eng ? 'font-bold text-[#2563EB] bg-[#F0F4FF]' : 'text-[#171B24]'
                      }`}
                    >
                      <span>{eng}</span>
                      {searchEngine === eng && <Check className="w-3.5 h-3.5 text-[#2563EB]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Indicator */}
            <div className="bg-white border border-[#D5DAE5] rounded-md px-3 py-1.5 flex items-center gap-2 font-medium text-[#171B24] shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="font-semibold">08 Oct 2026</span>
            </div>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={() => showToast('Exporting Visibility Rating report...')}
            className="bg-[#F0F2F6] hover:bg-[#E3E6EE] text-[#474D66] font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-2xs cursor-pointer tracking-wider transition-colors uppercase text-[11px]"
          >
            <Upload className="w-3.5 h-3.5 rotate-180" />
            <span>EXPORT</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. MULTI-LINE SPLINE GRAPH & METRIC TABS */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E3E6EE] rounded-xl shadow-2xs overflow-hidden">
          {/* Top Metric Tabs */}
          <div className="grid grid-cols-4 border-b border-[#E3E6EE] text-center text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveMetricTab('visibility')}
              className={`py-3 transition-colors cursor-pointer border-b-2 ${
                activeMetricTab === 'visibility'
                  ? 'border-[#2563EB] text-[#2563EB] bg-[#F0F5FF]'
                  : 'border-transparent text-[#6B7280] hover:text-[#171B24] bg-white'
              }`}
            >
              VISIBILITY
            </button>
            <button
              onClick={() => setActiveMetricTab('traffic')}
              className={`py-3 transition-colors cursor-pointer border-b-2 ${
                activeMetricTab === 'traffic'
                  ? 'border-[#2563EB] text-[#2563EB] bg-[#F0F5FF]'
                  : 'border-transparent text-[#6B7280] hover:text-[#171B24] bg-white'
              }`}
            >
              TRAFFIC FORECAST
            </button>
            <button
              onClick={() => setActiveMetricTab('top10')}
              className={`py-3 transition-colors cursor-pointer border-b-2 ${
                activeMetricTab === 'top10'
                  ? 'border-[#2563EB] text-[#2563EB] bg-[#F0F5FF]'
                  : 'border-transparent text-[#6B7280] hover:text-[#171B24] bg-white'
              }`}
            >
              % IN TOP 10
            </button>
            <button
              onClick={() => setActiveMetricTab('distribution')}
              className={`py-3 transition-colors cursor-pointer border-b-2 ${
                activeMetricTab === 'distribution'
                  ? 'border-[#2563EB] text-[#2563EB] bg-[#F0F5FF]'
                  : 'border-transparent text-[#6B7280] hover:text-[#171B24] bg-white'
              }`}
            >
              COMPETITOR DISTRIBUTION
            </button>
          </div>

          {/* Period Selector (Week / 2 Weeks / Month) */}
          <div className="px-6 pt-4 pb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8F94A6] uppercase tracking-wider">
              DYNAMIC VISIBILITY CURVE (OCTOBER 2026)
            </span>
            <div className="flex items-center gap-1 bg-[#F0F2F6] p-0.5 rounded-lg text-xs font-semibold">
              {(['week', '2weeks', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer capitalize ${
                    period === p ? 'bg-white text-[#2563EB] shadow-2xs font-bold' : 'text-[#6B7280] hover:text-[#171B24]'
                  }`}
                >
                  {p === 'week' ? 'Week' : p === '2weeks' ? '2 Weeks' : 'Month'}
                </button>
              ))}
            </div>
          </div>

          {/* Spline SVG Chart matching Highcharts Style */}
          <div className="p-6 relative select-none">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-64 overflow-visible"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clientX = e.clientX - rect.left;
                const scale = svgWidth / rect.width;
                const svgX = clientX * scale;
                let nearest = 0;
                let minDist = Infinity;
                dates.forEach((_: string, i: number) => {
                  const x = getX(i);
                  const d = Math.abs(x - svgX);
                  if (d < minDist) {
                    minDist = d;
                    nearest = i;
                  }
                });
                setHoverDateIdx(nearest);
              }}
              onMouseLeave={() => setHoverDateIdx(3)}
            >
              {/* Horizontal Grid Lines */}
              {[0, 20, 40, 60, 80, 100].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#EEF0F5"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      textAnchor="end"
                      fill="#8F94A6"
                      fontSize="10"
                      fontFamily="sans-serif"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Date X-Axis Labels */}
              {dates.map((date: string, i: number) => {
                const x = getX(i);
                return (
                  <text
                    key={date}
                    x={x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fill="#8F94A6"
                    fontSize="10"
                    fontFamily="sans-serif"
                  >
                    {date}
                  </text>
                );
              })}

              {/* Vertical Crosshair Line matching Screenshot */}
              <line
                x1={activeHoverX}
                y1={paddingY}
                x2={activeHoverX}
                y2={paddingY + chartH}
                stroke="rgb(44, 62, 80)"
                strokeWidth="1"
                strokeDasharray="4,3"
                pointerEvents="none"
              />

              {/* Spline Lines for Active Competitors */}
              {activeCompetitors.map((comp) => {
                const pts = dates.map((_: string, i: number) => {
                  const x = getX(i);
                  const rawVal = comp.seriesData && comp.seriesData[i] !== undefined ? comp.seriesData[i] : comp.visibility;
                  const val = typeof rawVal === 'number' && !isNaN(rawVal) ? rawVal : 0;
                  const y = getY(val);
                  return { x, y, val };
                });

                const pathD = pts.reduce((acc: string, curr: { x: number; y: number; val: number }, i: number, arr: Array<{ x: number; y: number; val: number }>) => {
                  if (i === 0) return `M ${curr.x} ${curr.y}`;
                  const prev = arr[i - 1];
                  const cpX1 = prev.x + (curr.x - prev.x) / 2;
                  const cpY1 = prev.y;
                  const cpX2 = prev.x + (curr.x - prev.x) / 2;
                  const cpY2 = curr.y;
                  return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
                }, '');

                return (
                  <g key={comp.domain}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={comp.color}
                      strokeWidth={comp.isYou ? 3 : 2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all hover:stroke-width-4 cursor-pointer"
                    />
                    {/* Active point marker at crosshair */}
                    {pts[activeDateIndex] && (
                      <circle
                        cx={activeHoverX}
                        cy={pts[activeDateIndex].y}
                        r={comp.isYou ? 5 : 4}
                        fill={comp.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Highcharts Multi-Series Tooltip Popup matching Screenshot */}
            <div
              className="absolute z-40 bg-white/95 backdrop-blur-xs border border-gray-300 rounded-lg shadow-xl p-3 text-xs min-w-[240px] pointer-events-none transition-all duration-75"
              style={{
                left: `${(activeHoverX / svgWidth) * 100}%`,
                top: '40%',
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="text-[11px] font-bold text-gray-800 pb-1.5 border-b border-gray-100 flex items-center justify-between">
                <span>{dates[activeDateIndex] ? dates[activeDateIndex].toUpperCase() : 'OCTOBER'} 2026</span>
                <span className="text-[10px] text-gray-400 font-semibold tracking-wider">VISIBILITY</span>
              </div>
              <div className="space-y-1 pt-1">
                {activeCompetitors.map((c) => {
                  const rawVal = c.seriesData && c.seriesData[activeDateIndex] !== undefined ? c.seriesData[activeDateIndex] : c.visibility;
                  const val = typeof rawVal === 'number' && !isNaN(rawVal) ? rawVal : (typeof c.visibility === 'number' && !isNaN(c.visibility) ? c.visibility : 0);
                  return (
                    <div key={c.domain} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="font-medium text-gray-700 truncate max-w-[140px]">{c.domain}</span>
                      </div>
                      <span className="font-mono font-bold text-gray-900 shrink-0">
                        {val.toFixed(val === 100 || val === 0 ? 0 : 2)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. COMPETITORS TABLE (26 Real Rows) */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between pt-2">
          <div className="relative max-w-sm w-full">
            <Search className="w-3.5 h-3.5 text-[#8F94A6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search competitor"
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#D5DAE5] rounded-md text-xs text-[#171B24] placeholder-[#8F94A6] focus:outline-hidden focus:border-[#2563EB] shadow-2xs"
            />
          </div>
          <span className="text-[11px] text-[#8F94A6] font-medium">
            Showing {filteredCompetitors.length} competitors
          </span>
        </div>

        <div className="bg-white border border-[#E3E6EE] rounded-xl shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E3E6EE] text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                <th className="py-3 px-3 w-10 text-center bg-[#F8FAFC]">#</th>
                <th className="py-3 px-4 bg-[#F8FAFC]">COMPETITOR</th>
                <th className="py-3 px-4 bg-[#3E4459] text-white text-right cursor-pointer select-none">
                  <div className="flex items-center justify-end gap-1">
                    <span>VISIBILITY</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
                  </div>
                </th>
                <th className="py-3 px-4 bg-[#F8FAFC] text-right">TRAFFIC FORECAST</th>
                <th className="py-3 px-4 bg-[#F8FAFC] text-right">KEYWORDS</th>
                <th className="py-3 px-4 bg-[#F8FAFC] text-right">BACKLINKS</th>
                <th className="py-3 px-4 bg-[#F8FAFC] text-right">REF. DOMAINS</th>
                <th className="py-3 px-4 bg-[#F8FAFC] text-center w-20">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F5]">
              {filteredCompetitors.map((comp, idx) => {
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${comp.domain}&sz=64`;
                return (
                  <tr
                    key={comp.domain}
                    className={`hover:bg-[#F9FAFB] transition-colors ${
                      comp.isYou ? 'bg-[#F0F5FF]' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center text-[#8F94A6] font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {/* Checkbox to toggle line visibility */}
                        <input
                          type="checkbox"
                          checked={comp.isActive}
                          onChange={() => toggleCompetitorActive(comp.id)}
                          className="w-3.5 h-3.5 rounded-sm accent-[#2563EB] cursor-pointer"
                        />

                        {/* Color Badge Indicator matching chart line */}
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: comp.color }}
                        />

                        {/* Circular Favicon ("gola me") */}
                        <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-[#D5DAE5] bg-white flex items-center justify-center">
                          <img
                            src={faviconUrl}
                            alt=""
                            className="w-3.5 h-3.5 object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        <a
                          href={`https://${comp.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#171B24] hover:text-[#2563EB] hover:underline"
                        >
                          {comp.domain}
                        </a>

                        {/* Keywords badge */}
                        <span className="text-[10px] text-[#8F94A6] font-mono bg-[#F0F2F6] px-1.5 py-0.5 rounded-sm">
                          {comp.keywordsCount} kw
                        </span>

                        {comp.isYou && (
                          <div className="flex items-center gap-1 ml-1 bg-[#DBEAFE] text-[#1D4ED8] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            <Home className="w-3 h-3 text-[#1D4ED8]" />
                            <span>You</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#2563EB] bg-[#F0F5FF]/50">
                      {comp.visibilityStr}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#171B24]">
                      {comp.trafficForecast}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#171B24]">
                      {comp.keywordsCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#171B24]">
                      {comp.backlinks || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#171B24]">
                      {comp.refDomains || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {!comp.isYou && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCompetitor(comp.id, comp.domain)}
                          className="text-[#8F94A6] hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove competitor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredCompetitors.length <= 1 && (
                <tr>
                  <td colSpan={8} className="py-6 px-4 text-center text-gray-500 bg-gray-50/40">
                    <p className="font-semibold text-xs text-gray-700">No competitors added yet for {cleanDomain || 'this project'}.</p>
                    <p className="text-[11px] text-gray-400 mt-1">Add up to 5 competitors in the "Added Competitors" tab to view real visibility comparisons.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
