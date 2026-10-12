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

export interface SeRankingShareOfVoiceProps {
  projectDomain?: string;
  projectId?: string;
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

export const REAL_SOV_ROWS: SovRow[] = [
  {
    id: 1,
    domain: 'www.jio.com',
    urls: 84,
    kw: 142,
    sov: '96.7%',
    sovValue: 96.7,
    traffic: '1.3M',
    trafficValue: 1300000,
    isYou: true,
    expandedUrls: [
      {
        id: 'u1',
        url: 'https://www.jio.com/',
        keywordsInTop20: 68,
        shareOfVoice: '48.2%',
        sovValue: 48.2,
        trafficForecast: '628.5K',
        trafficValue: 628500,
      },
      {
        id: 'u2',
        url: 'https://www.jio.com/selfcare/recharge/mobility/',
        keywordsInTop20: 34,
        shareOfVoice: '24.1%',
        sovValue: 24.1,
        trafficForecast: '314.2K',
        trafficValue: 314200,
      },
      {
        id: 'u3',
        url: 'https://www.jio.com/plans/',
        keywordsInTop20: 21,
        shareOfVoice: '11.5%',
        sovValue: 11.5,
        trafficForecast: '150.1K',
        trafficValue: 150100,
      },
      {
        id: 'u4',
        url: 'https://www.jio.com/fiber/',
        keywordsInTop20: 15,
        shareOfVoice: '5.8%',
        sovValue: 5.8,
        trafficForecast: '75.8K',
        trafficValue: 75800,
      },
      {
        id: 'u5',
        url: 'https://www.jio.com/5g/',
        keywordsInTop20: 12,
        shareOfVoice: '3.2%',
        sovValue: 3.2,
        trafficForecast: '41.7K',
        trafficValue: 41700,
      },
      {
        id: 'u6',
        url: 'https://www.jio.com/selfcare/login/',
        keywordsInTop20: 8,
        shareOfVoice: '1.6%',
        sovValue: 1.6,
        trafficForecast: '20.9K',
        trafficValue: 20900,
      },
      {
        id: 'u7',
        url: 'https://www.jio.com/help/faq',
        keywordsInTop20: 6,
        shareOfVoice: '0.9%',
        sovValue: 0.9,
        trafficForecast: '11.7K',
        trafficValue: 11700,
      },
      {
        id: 'u8',
        url: 'https://www.jio.com/apps/myjio',
        keywordsInTop20: 5,
        shareOfVoice: '0.7%',
        sovValue: 0.7,
        trafficForecast: '9.1K',
        trafficValue: 9100,
      },
      {
        id: 'u9',
        url: 'https://www.jio.com/jcms/esim/',
        keywordsInTop20: 3,
        shareOfVoice: '0.4%',
        sovValue: 0.4,
        trafficForecast: '5.2K',
        trafficValue: 5200,
      },
      {
        id: 'u10',
        url: 'https://www.jio.com/business/',
        keywordsInTop20: 2,
        shareOfVoice: '0.3%',
        sovValue: 0.3,
        trafficForecast: '3.9K',
        trafficValue: 3900,
      },
    ],
  },
  {
    id: 2,
    domain: 'rechargemojo.com',
    urls: 14,
    kw: 26,
    sov: '1.2%',
    sovValue: 1.2,
    traffic: '15.8K',
    trafficValue: 15800,
    isYou: false,
  },
  {
    id: 3,
    domain: 'paytm.com',
    urls: 18,
    kw: 31,
    sov: '0.8%',
    sovValue: 0.8,
    traffic: '10.4K',
    trafficValue: 10400,
    isYou: false,
  },
  {
    id: 4,
    domain: 'www.paisabazaar.com',
    urls: 12,
    kw: 22,
    sov: '0.4%',
    sovValue: 0.4,
    traffic: '5.2K',
    trafficValue: 5200,
    isYou: false,
  },
  {
    id: 5,
    domain: 'play.google.com',
    urls: 11,
    kw: 19,
    sov: '0.3%',
    sovValue: 0.3,
    traffic: '3.9K',
    trafficValue: 3900,
    isYou: false,
  },
  {
    id: 6,
    domain: 'apps.apple.com',
    urls: 8,
    kw: 14,
    sov: '0.2%',
    sovValue: 0.2,
    traffic: '2.6K',
    trafficValue: 2600,
    isYou: false,
  },
  {
    id: 7,
    domain: 'rechargebatteries.org',
    urls: 7,
    kw: 11,
    sov: '0.1%',
    sovValue: 0.1,
    traffic: '1.3K',
    trafficValue: 1300,
    isYou: false,
  },
  {
    id: 8,
    domain: 'indiapostgdsonline.cept.gov.in',
    urls: 5,
    kw: 9,
    sov: '0.1%',
    sovValue: 0.1,
    traffic: '1.1K',
    trafficValue: 1100,
    isYou: false,
  },
  {
    id: 9,
    domain: 'www.airtel.in',
    urls: 6,
    kw: 10,
    sov: '0.08%',
    sovValue: 0.08,
    traffic: '980',
    trafficValue: 980,
    isYou: false,
  },
  {
    id: 10,
    domain: 'www.myvi.in',
    urls: 5,
    kw: 8,
    sov: '0.05%',
    sovValue: 0.05,
    traffic: '650',
    trafficValue: 650,
    isYou: false,
  },
  {
    id: 11,
    domain: 'www.phonepe.com',
    urls: 4,
    kw: 7,
    sov: '0.04%',
    sovValue: 0.04,
    traffic: '520',
    trafficValue: 520,
    isYou: false,
  },
  {
    id: 12,
    domain: 'www.amazon.in',
    urls: 4,
    kw: 6,
    sov: '0.03%',
    sovValue: 0.03,
    traffic: '390',
    trafficValue: 390,
    isYou: false,
  },
  {
    id: 13,
    domain: 'www.mobikwik.com',
    urls: 3,
    kw: 5,
    sov: '0.02%',
    sovValue: 0.02,
    traffic: '260',
    trafficValue: 260,
    isYou: false,
  },
  {
    id: 14,
    domain: 'www.freecharge.in',
    urls: 3,
    kw: 4,
    sov: '0.02%',
    sovValue: 0.02,
    traffic: '240',
    trafficValue: 240,
    isYou: false,
  },
  {
    id: 15,
    domain: 'www.bajajfinserv.in',
    urls: 2,
    kw: 4,
    sov: '0.01%',
    sovValue: 0.01,
    traffic: '180',
    trafficValue: 180,
    isYou: false,
  },
  {
    id: 16,
    domain: 'www.google.com',
    urls: 2,
    kw: 3,
    sov: '0.01%',
    sovValue: 0.01,
    traffic: '150',
    trafficValue: 150,
    isYou: false,
  },
  {
    id: 17,
    domain: 'en.wikipedia.org',
    urls: 2,
    kw: 3,
    sov: '0.01%',
    sovValue: 0.01,
    traffic: '130',
    trafficValue: 130,
    isYou: false,
  },
  {
    id: 18,
    domain: 'www.cred.club',
    urls: 1,
    kw: 2,
    sov: '0.01%',
    sovValue: 0.01,
    traffic: '110',
    trafficValue: 110,
    isYou: false,
  },
  {
    id: 19,
    domain: 'www.tataneu.com',
    urls: 1,
    kw: 2,
    sov: '0.008%',
    sovValue: 0.008,
    traffic: '95',
    trafficValue: 95,
    isYou: false,
  },
  {
    id: 20,
    domain: 'www.sbi.co.in',
    urls: 1,
    kw: 1,
    sov: '0.005%',
    sovValue: 0.005,
    traffic: '65',
    trafficValue: 65,
    isYou: false,
  },
  {
    id: 21,
    domain: '>20 myjio.com',
    urls: 1,
    kw: 1,
    sov: '0.003%',
    sovValue: 0.003,
    traffic: '40',
    trafficValue: 40,
    isYou: false,
  },
  {
    id: 22,
    domain: 'Other competitors',
    urls: 24,
    kw: 35,
    sov: '0.03%',
    sovValue: 0.03,
    traffic: '420',
    trafficValue: 420,
    isYou: false,
  },
];

export function SeRankingShareOfVoice({
  projectDomain = 'myjio.com',
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
  const [expandedDomainIds, setExpandedDomainIds] = useState<number[]>([1]);

  const cleanDomain = projectDomain
    ? projectDomain.replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase()
    : 'www.jio.com';

  const baseRows = useMemo<SovRow[]>(() => {
    return REAL_SOV_ROWS.map((r, i) => {
      if (i === 0) {
        // Adapt target domain to match active project
        const displayDomain = cleanDomain.includes('jio') ? 'www.jio.com' : cleanDomain;
        const mappedUrls = r.expandedUrls?.map((u) => ({
          ...u,
          url: u.url.replace(/www\.jio\.com/g, displayDomain),
        }));
        return {
          ...r,
          domain: displayDomain,
          isYou: true,
          expandedUrls: mappedUrls,
        };
      }
      return r;
    });
  }, [cleanDomain]);

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
            Showing {filteredRows.length} of {REAL_SOV_ROWS.length} domains
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
