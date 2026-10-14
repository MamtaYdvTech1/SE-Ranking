'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Check,
  CheckCheck,
  ChevronDown,
  Globe,
  Home,
  Info,
  Search,
  Share2,
  MessageSquare,
  FileText,
  Upload,
  ExternalLink,
} from 'lucide-react';
import { SeRankingDualCalendar } from './SeRankingDualCalendar';

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

export interface SeRankingShareOfVoiceProps {
  projectDomain?: string;
  projectId?: string;
  addedCompetitors?: CompetitorItem[];
  showToast?: (msg: string) => void;
  onOpenGuestLink?: () => void;
  onOpenFeedback?: () => void;
  onOpenNotes?: () => void;
  notesCount?: number;
}

export interface SovUrl {
  id: string;
  url: string;
  keywordsInTop20: number;
  shareOfVoice: string;
  sovValue: number;
  trafficForecast: string;
  trafficValue: number;
}

export interface SovRow {
  id: number;
  domain: string;
  urls: number;
  kw: number;
  sov: string;
  sovValue: number;
  traffic: string;
  trafficValue: number;
  isYou: boolean;
  expandedUrls?: SovUrl[];
}

export function SeRankingShareOfVoice({
  projectDomain = '',
  projectId,
  addedCompetitors = [],
  showToast = () => {},
  onOpenGuestLink = () => {},
  onOpenFeedback = () => {},
  onOpenNotes = () => {},
  notesCount = 50,
}: SeRankingShareOfVoiceProps) {
  const [selectedDates, setSelectedDates] = useState('8 Oct 2026; 9 Oct 2026');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchEngine, setSearchEngine] = useState('All search engines');
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'sov' | 'traffic' | 'kw' | 'urls'>('sov');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedDomainIds, setExpandedDomainIds] = useState<number[]>([1]);

  const cleanDomain = projectDomain
    ? projectDomain.replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase()
    : '';

  const baseRows = useMemo<SovRow[]>(() => {
    if (!cleanDomain) return [];

    const youRow: SovRow = {
      id: 1,
      domain: cleanDomain,
      urls: 1,
      kw: 0,
      sov: '100%',
      sovValue: 100,
      traffic: '—',
      trafficValue: 0,
      isYou: true,
      expandedUrls: [
        {
          id: 'u1',
          url: `https://${cleanDomain}/`,
          keywordsInTop20: 0,
          shareOfVoice: '100%',
          sovValue: 100,
          trafficForecast: '—',
          trafficValue: 0,
        },
      ],
    };

    const compRows: SovRow[] = (addedCompetitors || []).map((c, i) => {
      const sovScore = c.visibility || 0;
      return {
        id: i + 2,
        domain: c.domain,
        urls: 1,
        kw: c.totalKeywords || c.commonKeywords || 0,
        sov: `${sovScore}%`,
        sovValue: sovScore,
        traffic: c.organicTraffic || '—',
        trafficValue: 0,
        isYou: false,
        expandedUrls: [
          {
            id: `comp-u-${i + 1}`,
            url: `https://${c.domain}/`,
            keywordsInTop20: c.commonKeywords || 0,
            shareOfVoice: `${sovScore}%`,
            sovValue: sovScore,
            trafficForecast: c.organicTraffic || '—',
            trafficValue: 0,
          },
        ],
      };
    });

    return [youRow, ...compRows];
  }, [cleanDomain, addedCompetitors]);

  const filteredRows = useMemo(() => {
    let rows = [...baseRows];
    if (searchQuery.trim()) {
      rows = rows.filter((r) =>
        r.domain.toLowerCase().includes(searchQuery.toLowerCase().trim())
      );
    }
    rows.sort((a, b) => {
      let diff = 0;
      if (sortBy === 'sov') diff = b.sovValue - a.sovValue;
      if (sortBy === 'traffic') diff = b.trafficValue - a.trafficValue;
      if (sortBy === 'kw') diff = b.kw - a.kw;
      if (sortBy === 'urls') diff = b.urls - a.urls;
      return sortAsc ? -diff : diff;
    });
    return rows;
  }, [baseRows, searchQuery, sortBy, sortAsc]);

  const toggleExpand = (id: number) => {
    setExpandedDomainIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const csvHeaders =
      '#,Domain / URL,Type,URLs in Top 20,Keywords in Top 20,Share of Voice,Traffic Forecast';
    const csvRows: string[] = [];

    filteredRows.forEach((r, idx) => {
      csvRows.push(
        `${idx + 1},"${r.domain}",Domain,${r.urls},${r.kw},${r.sov},${r.traffic}`
      );
      if (r.expandedUrls && r.expandedUrls.length > 0) {
        r.expandedUrls.forEach((u) => {
          csvRows.push(
            `,"${u.url}",URL,-,${u.keywordsInTop20},${u.shareOfVoice},${u.trafficForecast}`
          );
        });
      }
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' + [csvHeaders, ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `share_of_voice_${cleanDomain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Share of Voice exported to CSV');
  };

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
          <span className="text-[#171B24] font-bold">Share of Voice</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenGuestLink}
            className="text-[#2563EB] hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Guest link</span>
          </button>
          <button
            type="button"
            onClick={onOpenFeedback}
            className="text-[#2563EB] hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedback</span>
          </button>
          <button
            type="button"
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
      {/* 2. SUBHEADER: ENGINE SELECTOR, DUAL-MONTH CALENDAR, EXPORT */}
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
                  {['All search engines', 'Google India (en)', 'Google US (en)', 'Google UK (en)'].map((eng) => (
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

            {/* Date Range Picker (Opens Dual-Month Calendar) */}
            <button
              type="button"
              onClick={() => setIsCalendarOpen(true)}
              className="bg-white border border-[#D5DAE5] rounded-md px-3 py-1.5 flex items-center gap-2 font-medium text-[#171B24] shadow-2xs hover:bg-[#F8FAFC] cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="font-semibold">{selectedDates}</span>
              <ChevronDown className="w-3 h-3 text-[#8F94A6]" />
            </button>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            className="bg-[#F0F2F6] hover:bg-[#E3E6EE] text-[#474D66] font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-2xs cursor-pointer tracking-wider transition-colors uppercase text-[11px]"
          >
            <Upload className="w-3.5 h-3.5 rotate-180" />
            <span>EXPORT</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. FOUR KPI CARDS (Matching SE Ranking Screenshot) */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E3E6EE] rounded-xl shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#EEF0F5]">
          <div className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8F94A6] uppercase tracking-wider">
              <span>TOTAL TRAFFIC FORECAST</span>
              <Info className="w-3 h-3 text-[#8F94A6] cursor-help" />
            </div>
            <div className="text-2xl font-extrabold text-[#171B24]">1.3M</div>
            <div className="text-[11px] text-[#EF4444] font-semibold flex items-center gap-1">
              <span>▼ -22.4K vs previous period</span>
            </div>
          </div>

          <div className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8F94A6] uppercase tracking-wider">
              <span>SHARE OF VOICE</span>
              <Info className="w-3 h-3 text-[#8F94A6] cursor-help" />
            </div>
            <div className="text-2xl font-extrabold text-[#2563EB]">96.7%</div>
            <div className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1">
              <span>▲ +53.8% lead against #2</span>
            </div>
          </div>

          <div className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8F94A6] uppercase tracking-wider">
              <span>TOTAL URLS IN THE TOP 20</span>
              <Info className="w-3 h-3 text-[#8F94A6] cursor-help" />
            </div>
            <div className="text-2xl font-extrabold text-[#171B24]">84</div>
            <div className="text-[11px] text-[#8F94A6]">Aggregated across all competitors</div>
          </div>

          <div className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8F94A6] uppercase tracking-wider">
              <span>TOTAL KEYWORDS IN THE TOP 20</span>
              <Info className="w-3 h-3 text-[#8F94A6] cursor-help" />
            </div>
            <div className="text-2xl font-extrabold text-[#171B24]">142</div>
            <div className="text-[11px] text-[#10B981] font-semibold">Active ranking tracked</div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. DOMAIN SEARCH INPUT */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="w-3.5 h-3.5 text-[#8F94A6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search domain"
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#D5DAE5] rounded-md text-xs text-[#171B24] placeholder-[#8F94A6] focus:outline-hidden focus:border-[#2563EB] shadow-2xs"
            />
          </div>
          <span className="text-[11px] text-[#8F94A6] font-medium">
            Showing {filteredRows.length} of {baseRows.length} domains
          </span>
        </div>

        {/* ========================================================================= */}
        {/* 5. TABLE: SHARE OF VOICE RANKINGS WITH ACCORDION NESTED URLS */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E3E6EE] rounded-xl shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E3E6EE] text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                <th className="py-3 px-3 w-12 text-center bg-[#F8FAFC]">#</th>
                <th className="py-3 px-4 bg-[#F8FAFC]">DOMAIN</th>
                <th
                  onClick={() => {
                    setSortBy('urls');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 bg-[#F8FAFC] text-right cursor-pointer hover:text-[#171B24]"
                >
                  URLS IN THE TOP 20
                </th>
                <th
                  onClick={() => {
                    setSortBy('kw');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 bg-[#F8FAFC] text-right cursor-pointer hover:text-[#171B24]"
                >
                  KEYWORDS IN THE TOP 20
                </th>
                {/* Active Column Header with Deep Slate SE Ranking Style (#3E4459) */}
                <th
                  onClick={() => {
                    setSortBy('sov');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 bg-[#3E4459] text-white text-right cursor-pointer select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>SHARE OF VOICE</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortAsc ? 'rotate-180' : ''}`} />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortBy('traffic');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 bg-[#F8FAFC] text-right cursor-pointer hover:text-[#171B24]"
                >
                  TRAFFIC FORECAST
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F5]">
              {filteredRows.map((row, index) => {
                const isExpanded = expandedDomainIds.includes(row.id);
                const hasUrls = Boolean(row.expandedUrls && row.expandedUrls.length > 0);
                const faviconUrl = row.domain.startsWith('>') || row.domain.startsWith('Other')
                  ? ''
                  : `https://www.google.com/s2/favicons?domain=${row.domain}&sz=64`;

                return (
                  <React.Fragment key={row.domain}>
                    {/* Main Domain Row */}
                    <tr
                      onClick={() => hasUrls && toggleExpand(row.id)}
                      className={`transition-colors ${
                        hasUrls ? 'cursor-pointer' : ''
                      } ${
                        row.isYou
                          ? 'bg-[#F0F5FF]/70 hover:bg-[#E6EFFF]'
                          : 'hover:bg-[#F9FAFB]'
                      }`}
                    >
                      <td className="py-3 px-3 text-center text-[#8F94A6] font-mono text-[11px]">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {/* Circular Favicon */}
                          <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-[#D5DAE5] bg-white flex items-center justify-center">
                            {faviconUrl ? (
                              <img
                                src={faviconUrl}
                                alt=""
                                className="w-3.5 h-3.5 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Globe className="w-3 h-3 text-[#8F94A6]" />
                            )}
                          </div>

                          {row.domain.startsWith('>') || row.domain.startsWith('Other') ? (
                            <span className="font-semibold text-[#474D66]">
                              {row.domain}
                            </span>
                          ) : (
                            <a
                              href={`https://${row.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold text-[#171B24] hover:text-[#2563EB] hover:underline"
                            >
                              {row.domain}
                            </a>
                          )}

                          {row.isYou && (
                            <div className="flex items-center gap-1 ml-1 bg-[#DBEAFE] text-[#1D4ED8] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              <Home className="w-3 h-3 text-[#1D4ED8]" />
                              <span>You</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* URLs count with expandable chevron if nested URLs exist */}
                      <td className="py-3 px-4 text-right font-mono text-[#171B24]">
                        {hasUrls ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(row.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F0F4FF] hover:bg-[#E0EAFF] text-[#2563EB] font-bold cursor-pointer transition-colors"
                            title="Click to toggle nested URLs"
                          >
                            <span>{row.urls}</span>
                            <ChevronDown
                              className={`w-3 h-3 text-[#2563EB] transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        ) : (
                          <span>{row.urls}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-[#171B24]">
                        {row.kw}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-[#2563EB] bg-[#F0F5FF]/50">
                        {row.sov}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-[#171B24]">
                        {row.traffic}
                      </td>
                    </tr>

                    {/* Expandable Accordion Sub-Rows: 10 Real URLs for Domain */}
                    {isExpanded &&
                      row.expandedUrls?.map((u) => {
                        const urlFavicon = `https://www.google.com/s2/favicons?domain=${row.domain}&sz=64`;
                        return (
                          <tr
                            key={u.id}
                            className="bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors border-l-2 border-[#2563EB]"
                          >
                            <td className="py-2 px-3 text-center text-[#94A3B8] font-mono text-[10px]">
                              ↳
                            </td>
                            <td className="py-2 px-4 pl-9">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-[#E2E8F0] bg-white flex items-center justify-center">
                                  <img
                                    src={urlFavicon}
                                    alt=""
                                    className="w-3 h-3 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                                <a
                                  href={u.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#2563EB] hover:underline font-mono text-[11px] truncate max-w-lg inline-flex items-center gap-1 group"
                                  title={u.url}
                                >
                                  <span>{u.url}</span>
                                  <ExternalLink className="w-3 h-3 text-[#94A3B8] group-hover:text-[#2563EB] shrink-0" />
                                </a>
                              </div>
                            </td>
                            <td className="py-2 px-4 text-right font-mono text-[#94A3B8]">
                              —
                            </td>
                            <td className="py-2 px-4 text-right font-mono text-[#171B24]">
                              {u.keywordsInTop20}
                            </td>
                            <td className="py-2 px-4 text-right font-mono font-bold text-[#2563EB] bg-[#F0F5FF]/40">
                              {u.shareOfVoice}
                            </td>
                            <td className="py-2 px-4 text-right font-mono text-[#171B24]">
                              {u.trafficForecast}
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })}
              {filteredRows.length <= 1 && (
                <tr>
                  <td colSpan={5} className="py-6 px-4 text-center text-gray-500 bg-gray-50/40">
                    <p className="font-semibold text-xs text-gray-700">No competitors added yet for {cleanDomain || 'this project'}.</p>
                    <p className="text-[11px] text-gray-400 mt-1">Add up to 5 competitors in the "Added Competitors" tab to view Share of Voice comparison.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dual Month Calendar Popover */}
      <SeRankingDualCalendar
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onApply={(range) => {
          setSelectedDates(range);
          showToast(`Applied date range: ${range}`);
        }}
      />
    </div>
  );
}
