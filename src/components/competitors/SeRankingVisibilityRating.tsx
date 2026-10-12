'use client';

import React, { useState, useEffect } from 'react';
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

export interface SeRankingVisibilityRatingProps {
  projectDomain?: string;
  projectId?: string;
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
  color: string;
  isYou: boolean;
  isActive: boolean;
}

const INITIAL_COMPETITORS: VisibilityCompetitor[] = [
  {
    id: 1,
    domain: 'southampton.cylex-uk.co.uk',
    keywordsCount: '18K',
    visibility: 18.2,
    visibilityStr: '18.2%',
    trafficForecast: '14,350',
    percentInTop10: '42.5%',
    color: '#8c564b', // Brown
    isYou: false,
    isActive: true,
  },
  {
    id: 2,
    domain: 'www.facebook.com',
    keywordsCount: '17.5M',
    visibility: 14.5,
    visibilityStr: '14.5%',
    trafficForecast: '42,100',
    percentInTop10: '38.0%',
    color: '#bcbd22', // Olive
    isYou: false,
    isActive: true,
  },
  {
    id: 3,
    domain: 'threebestrated.co.uk',
    keywordsCount: '1.6M',
    visibility: 12.1,
    visibilityStr: '12.1%',
    trafficForecast: '11,200',
    percentInTop10: '31.4%',
    color: '#e377c2', // Magenta
    isYou: false,
    isActive: true,
  },
  {
    id: 4,
    domain: 'www.bark.com',
    keywordsCount: '420K',
    visibility: 9.8,
    visibilityStr: '9.8%',
    trafficForecast: '5,420',
    percentInTop10: '26.8%',
    color: '#2ca02c', // Green
    isYou: false,
    isActive: true,
  },
  {
    id: 5,
    domain: 'www.yell.com',
    keywordsCount: '890K',
    visibility: 8.4,
    visibilityStr: '8.4%',
    trafficForecast: '4,100',
    percentInTop10: '22.0%',
    color: '#ff7f0e', // Yellow / Orange
    isYou: false,
    isActive: true,
  },
  {
    id: 6,
    domain: 'julianporter.com',
    keywordsCount: '4.8K',
    visibility: 7.2,
    visibilityStr: '7.2%',
    trafficForecast: '8,760',
    percentInTop10: '19.5%',
    color: '#9467bd', // Purple
    isYou: false,
    isActive: true,
  },
  {
    id: 7,
    domain: 'www.linkedin.com',
    keywordsCount: '14.2M',
    visibility: 6.9,
    visibilityStr: '6.9%',
    trafficForecast: '3,800',
    percentInTop10: '18.1%',
    color: '#17becf', // Violet / Teal
    isYou: false,
    isActive: true,
  },
  {
    id: 8,
    domain: 'uk.trustpilot.com',
    keywordsCount: '2.1M',
    visibility: 5.8,
    visibilityStr: '5.8%',
    trafficForecast: '2,900',
    percentInTop10: '15.0%',
    color: '#1f77b4', // Indigo / Blue
    isYou: false,
    isActive: true,
  },
  {
    id: 9,
    domain: 'www.instagram.com',
    keywordsCount: '22.4M',
    visibility: 4.5,
    visibilityStr: '4.5%',
    trafficForecast: '2,100',
    percentInTop10: '11.8%',
    color: '#d62728', // Crimson
    isYou: false,
    isActive: true,
  },
  {
    id: 10,
    domain: 'thebws.biz',
    keywordsCount: '1.2K',
    visibility: 3.9,
    visibilityStr: '3.9%',
    trafficForecast: '3,210',
    percentInTop10: '9.4%',
    color: '#e7ba52', // Gold
    isYou: false,
    isActive: true,
  },
  {
    id: 11,
    domain: 'your-domain.com',
    keywordsCount: '940',
    visibility: 3.2,
    visibilityStr: '3.2%',
    trafficForecast: '18,420',
    percentInTop10: '8.2%',
    color: '#2563EB', // SE Ranking Primary Blue
    isYou: true,
    isActive: true,
  },
];

export function SeRankingVisibilityRating({
  projectDomain = 'in.pinterest.com',
  projectId,
  showToast = () => {},
  onOpenGuestLink = () => {},
  onOpenFeedback = () => {},
  onOpenNotes = () => {},
  notesCount = 50,
}: SeRankingVisibilityRatingProps) {
  const cleanDomain = projectDomain.replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase();
  const [competitors, setCompetitors] = useState<VisibilityCompetitor[]>(() => {
    return INITIAL_COMPETITORS.map((c) =>
      c.isYou ? { ...c, domain: cleanDomain } : c
    );
  });

  useEffect(() => {
    setCompetitors((prev) =>
      prev.map((c) => (c.isYou ? { ...c, domain: cleanDomain } : c))
    );
  }, [cleanDomain]);
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

  // SVG Spline Chart Coordinates for 5 date steps: [28 Jun, 15 Jul, 01 Aug, 15 Aug, 01 Sep, 23 Sep, 08 Oct]
  const dates = ['28 Jun', '15 Jul', '01 Aug', '15 Aug', '01 Sep', '23 Sep', '08 Oct'];
  const svgWidth = 900;
  const svgHeight = 260;
  const paddingX = 50;
  const paddingY = 30;

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
            >
              {/* Grid Lines */}
              {[0, 5, 10, 15, 20].map((val, i) => {
                const y = svgHeight - paddingY - (val / 20) * (svgHeight - 2 * paddingY);
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
              {dates.map((date, i) => {
                const x = paddingX + (i / (dates.length - 1)) * (svgWidth - 2 * paddingX);
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

              {/* Spline Lines for Active Competitors */}
              {competitors
                .filter((c) => c.isActive)
                .map((comp) => {
                  const points = dates.map((date, i) => {
                    const x = paddingX + (i / (dates.length - 1)) * (svgWidth - 2 * paddingX);
                    // generate deterministic smooth curve around comp.visibility
                    const variation = Math.sin(i * 1.2 + comp.id) * 1.5;
                    const value = Math.max(0.5, comp.visibility + variation);
                    const y = svgHeight - paddingY - (value / 20) * (svgHeight - 2 * paddingY);
                    return { x, y, value, date };
                  });

                  const pathD = points.reduce((acc, curr, i, arr) => {
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
                      {points.map((pt, idx) => (
                        <circle
                          key={idx}
                          cx={pt.x}
                          cy={pt.y}
                          r={comp.isYou ? 4.5 : 3.5}
                          fill={comp.color}
                          stroke="#ffffff"
                          strokeWidth={1.5}
                          className="cursor-pointer transition-transform hover:scale-150"
                          onMouseEnter={() =>
                            setHoveredPoint({ date: pt.date, comp, x: pt.x, y: pt.y })
                          }
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      ))}
                    </g>
                  );
                })}
            </svg>

            {/* Interactive Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute z-40 bg-[#171B24] text-white p-2.5 rounded-lg shadow-xl text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                }}
              >
                <div className="text-[10px] font-bold text-[#8F94A6] uppercase tracking-wider pb-1 border-b border-gray-700">
                  {hoveredPoint.date} 2026 VISIBILITY
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: hoveredPoint.comp.color }}
                  />
                  <span className="font-bold">{hoveredPoint.comp.domain}</span>
                  <span className="font-mono text-[#60A5FA]">
                    {hoveredPoint.comp.visibilityStr}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. COMPETITORS TABLE (11 Authentic Rows) */}
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
                <th className="py-3 px-4 bg-[#F8FAFC] text-right">% IN TOP 10</th>
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
                      {comp.percentInTop10}
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
