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
} from 'lucide-react';
import { SeRankingDualCalendar } from './SeRankingDualCalendar';

export interface SeRankingShareOfVoiceProps {
  projectDomain?: string;
  projectId?: string;
  showToast?: (msg: string) => void;
  onOpenGuestLink?: () => void;
  onOpenFeedback?: () => void;
  onOpenNotes?: () => void;
  notesCount?: number;
}

interface SovRow {
  id: number;
  domain: string;
  urls: number;
  kw: number;
  sov: string;
  sovValue: number;
  traffic: string;
  trafficValue: number;
  isYou: boolean;
  favicon?: string;
}

const DEFAULT_SOV_ROWS: SovRow[] = [
  {
    id: 1,
    domain: 'your-domain.com',
    urls: 28,
    kw: 64,
    sov: '28.4%',
    sovValue: 28.4,
    traffic: '18,420',
    trafficValue: 18420,
    isYou: true,
  },
  {
    id: 2,
    domain: 'southampton.cylex-uk.co.uk',
    urls: 24,
    kw: 52,
    sov: '22.1%',
    sovValue: 22.1,
    traffic: '14,350',
    trafficValue: 14350,
    isYou: false,
  },
  {
    id: 3,
    domain: 'threebestrated.co.uk',
    urls: 19,
    kw: 45,
    sov: '18.6%',
    sovValue: 18.6,
    traffic: '11,200',
    trafficValue: 11200,
    isYou: false,
  },
  {
    id: 4,
    domain: 'julianporter.com',
    urls: 15,
    kw: 36,
    sov: '15.2%',
    sovValue: 15.2,
    traffic: '8,760',
    trafficValue: 8760,
    isYou: false,
  },
  {
    id: 5,
    domain: 'www.bark.com',
    urls: 12,
    kw: 28,
    sov: '9.8%',
    sovValue: 9.8,
    traffic: '5,420',
    trafficValue: 5420,
    isYou: false,
  },
  {
    id: 6,
    domain: 'thebws.biz',
    urls: 8,
    kw: 19,
    sov: '5.9%',
    sovValue: 5.9,
    traffic: '3,210',
    trafficValue: 3210,
    isYou: false,
  },
];

export function SeRankingShareOfVoice({
  projectDomain = 'in.pinterest.com',
  projectId,
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

  const cleanDomain = projectDomain.replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase();

  const baseRows = useMemo<SovRow[]>(() => {
    if (cleanDomain.includes('pinterest')) {
      return [
        {
          id: 1,
          domain: 'in.pinterest.com',
          urls: 28,
          kw: 64,
          sov: '28.4%',
          sovValue: 28.4,
          traffic: '18,420',
          trafficValue: 18420,
          isYou: true,
        },
        {
          id: 2,
          domain: 'instagram.com',
          urls: 24,
          kw: 52,
          sov: '22.1%',
          sovValue: 22.1,
          traffic: '14,350',
          trafficValue: 14350,
          isYou: false,
        },
        {
          id: 3,
          domain: 'facebook.com',
          urls: 19,
          kw: 45,
          sov: '18.6%',
          sovValue: 18.6,
          traffic: '11,200',
          trafficValue: 11200,
          isYou: false,
        },
        {
          id: 4,
          domain: 'canva.com',
          urls: 15,
          kw: 36,
          sov: '15.2%',
          sovValue: 15.2,
          traffic: '8,760',
          trafficValue: 8760,
          isYou: false,
        },
        {
          id: 5,
          domain: 'unsplash.com',
          urls: 12,
          kw: 28,
          sov: '9.8%',
          sovValue: 9.8,
          traffic: '5,420',
          trafficValue: 5420,
          isYou: false,
        },
        {
          id: 6,
          domain: 'reddit.com',
          urls: 8,
          kw: 19,
          sov: '5.9%',
          sovValue: 5.9,
          traffic: '3,210',
          trafficValue: 3210,
          isYou: false,
        },
      ];
    }
    if (cleanDomain.includes('workcomposer')) {
      return [
        {
          id: 1,
          domain: 'workcomposer.com',
          urls: 28,
          kw: 64,
          sov: '28.4%',
          sovValue: 28.4,
          traffic: '18,420',
          trafficValue: 18420,
          isYou: true,
        },
        {
          id: 2,
          domain: 'hubstaff.com',
          urls: 24,
          kw: 52,
          sov: '22.1%',
          sovValue: 22.1,
          traffic: '14,350',
          trafficValue: 14350,
          isYou: false,
        },
        {
          id: 3,
          domain: 'timedoctor.com',
          urls: 19,
          kw: 45,
          sov: '18.6%',
          sovValue: 18.6,
          traffic: '11,200',
          trafficValue: 11200,
          isYou: false,
        },
        {
          id: 4,
          domain: 'clockify.me',
          urls: 15,
          kw: 36,
          sov: '15.2%',
          sovValue: 15.2,
          traffic: '8,760',
          trafficValue: 8760,
          isYou: false,
        },
        {
          id: 5,
          domain: 'activtrak.com',
          urls: 12,
          kw: 28,
          sov: '9.8%',
          sovValue: 9.8,
          traffic: '5,420',
          trafficValue: 5420,
          isYou: false,
        },
        {
          id: 6,
          domain: 'teramind.com',
          urls: 8,
          kw: 19,
          sov: '5.9%',
          sovValue: 5.9,
          traffic: '3,210',
          trafficValue: 3210,
          isYou: false,
        },
      ];
    }
    return DEFAULT_SOV_ROWS.map((r, i) =>
      i === 0
        ? { ...r, domain: cleanDomain, isYou: true }
        : r
    );
  }, [cleanDomain]);

  const filteredRows = useMemo(() => {
    let rows = [...baseRows];
    if (searchQuery.trim()) {
      rows = rows.filter((r) => r.domain.toLowerCase().includes(searchQuery.toLowerCase().trim()));
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

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['#,Domain,URLs in Top 20,Keywords in Top 20,Share of Voice,Traffic Forecast']
        .concat(
          filteredRows.map(
            (r, idx) =>
              `${idx + 1},${r.domain},${r.urls},${r.kw},${r.sov},${r.traffic}`
          )
        )
        .join('\n');
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
                  {['All search engines', 'Google UK (en)', 'Google US (en)', 'Google India (en)'].map((eng) => (
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
            <div className="text-2xl font-extrabold text-[#171B24]">48.2K</div>
            <div className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1">
              <span>▲ +1.4K vs previous period</span>
            </div>
          </div>

          <div className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8F94A6] uppercase tracking-wider">
              <span>SHARE OF VOICE</span>
              <Info className="w-3 h-3 text-[#8F94A6] cursor-help" />
            </div>
            <div className="text-2xl font-extrabold text-[#2563EB]">28.4%</div>
            <div className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1">
              <span>▲ +2.3% lead against #2</span>
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
            Showing {filteredRows.length} of {DEFAULT_SOV_ROWS.length} domains
          </span>
        </div>

        {/* ========================================================================= */}
        {/* 5. TABLE: SHARE OF VOICE RANKINGS */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E3E6EE] rounded-xl shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E3E6EE] text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                <th className="py-3 px-3 w-10 text-center bg-[#F8FAFC]">#</th>
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
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${row.domain}&sz=64`;
                return (
                  <tr
                    key={row.domain}
                    className={`hover:bg-[#F9FAFB] transition-colors ${
                      row.isYou ? 'bg-[#F0F5FF]' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center text-[#8F94A6] font-mono text-[11px]">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
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
                          href={`https://${row.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#171B24] hover:text-[#2563EB] hover:underline"
                        >
                          {row.domain}
                        </a>

                        {row.isYou && (
                          <div className="flex items-center gap-1 ml-1 bg-[#DBEAFE] text-[#1D4ED8] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            <Home className="w-3 h-3 text-[#1D4ED8]" />
                            <span>You</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#171B24]">
                      {row.urls}
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
                );
              })}
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
