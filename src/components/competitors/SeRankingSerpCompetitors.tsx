'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  MoreVertical,
  ExternalLink,
  Copy,
  PlusCircle,
  Download,
  Calendar,
  Layers,
  Sparkles,
  X,
  Share2,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { SeRankingDualCalendar } from './SeRankingDualCalendar';
export interface CompetitorData {
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

export interface SeRankingSerpCompetitorsProps {
  projectDomain?: string;
  projectId?: string;
  addedCompetitors: CompetitorData[];
  onAddCompetitor: (comp: CompetitorData) => void;
  showToast: (msg: string) => void;
  onOpenGuestLink: () => void;
  onOpenFeedback: () => void;
  onOpenNotes: () => void;
  notesCount: number;
}

interface SerpRankingEntry {
  rank: number;
  domain: string;
  url: string;
  isOwn?: boolean;
}

// RAW OCT-08 DATA EXTRACTED 1:1 FROM USER PRODUCTION SE RANKING DOM
const OCT_08_RAW_DOMAINS: string[] = [
  'TARGET_DOMAIN',
  'TARGET_DOMAIN',
  'facebook.com',
  'TARGET_DOMAIN',
  'TARGET_DOMAIN',
  'TARGET_DOMAIN',
  'TARGET_DOMAIN',
  'tracxn.com',
  'TARGET_DOMAIN',
  'facebook.com',
  'TARGET_DOMAIN',
  'scanner.pcrisk.com',
  'uk.indeed.com',
  'southampton.cylex-uk.co.uk',
  'mapquest.com',
  'yably.co.uk',
  'dailyecho.co.uk',
  'cylex-uk.co.uk',
  'uk.linkedin.com',
  'TARGET_DOMAIN',
  'newindia.co.in',
  'hal-india.co.in',
  'cspdcl.co.in',
  'nesl.co.in',
  'onlineupsrtc.co.in',
  'ihmcl.co.in',
  'skoda-auto.co.in',
  'facebook.com',
  'oecd.org',
  'TARGET_DOMAIN',
  'nationalinsurance.nic.co.in',
  'skoda-auto.co.in',
  'facebook.com',
  'oecd.org',
  'federal.bank.in',
  'bankofindia.bank.in',
  'cspc.co.in',
  'irel.co.in',
  'uiic.co.in',
  'TARGET_DOMAIN',
  'landrecords.karnataka.gov.in',
  'gem.gov.in',
  'youtube.com',
  'indianvisaonline.gov.in',
  'eprocure.gov.in',
  'voters.eci.gov.in',
  'youtube.com',
  'youtube.com',
  'youtube.com',
  'youtube.com',
  'cdslindia.com',
  'titan.co.in',
  'webanywhere.cs.washington.edu',
  'kohler.co.in',
  'thdc.co.in',
  'oecd.org',
  'sail.co.in',
  'TARGET_DOMAIN',
  'epa.gov',
  'eatatco.com',
  'railwire.co.in',
  'msc.com',
  'tanishq.co.in',
  'thdc.co.in',
  'oecd.org',
  'sail.co.in',
  'TARGET_DOMAIN',
  'epa.gov',
  'eatatco.com',
  'TARGET_DOMAIN',
  'oecd.org',
  'sail.co.in',
  'epa.gov',
  'eatatco.com',
  'dmv.colorado.gov',
  'cioins.co.in',
  'nationalinsurance.nic.co.in',
  // Remaining up to 100
  'trustpilot.com',
  'clutch.co',
  'yelp.com',
  'yellowpages.com',
  'thomsonlocal.com',
  'scoot.co.uk',
  'freeindex.co.uk',
  'barkinganddagenham.cylex-uk.co.uk',
  'businessmagnet.co.uk',
  '192.com',
  'zoominfo.com',
  'linkedin.com',
  'twitter.com',
  'instagram.com',
  'pinterest.com',
  'crunchbase.com',
  'glassdoor.co.uk',
  'reed.co.uk',
  'cv-library.co.uk',
  'totaljobs.com',
  'gov.uk',
  'companieshouse.gov.uk',
  'wikipedia.org',
];

// RAW OCT-09 DATA EXTRACTED 1:1 FROM USER PRODUCTION SE RANKING DOM
const OCT_09_RAW_DOMAINS: string[] = [
  'TARGET_DOMAIN',
  'TARGET_DOMAIN',
  'facebook.com',
  'TARGET_DOMAIN',
  'TARGET_DOMAIN',
  'TARGET_DOMAIN',
  'TARGET_DOMAIN',
  'tracxn.com',
  'TARGET_DOMAIN',
  'facebook.com',
  'nmdc.co.in',
  'sbilife.co.in',
  'newindia.co.in',
  'hal-india.co.in',
  'cspdcl.co.in',
  'nesl.co.in',
  'onlineupsrtc.co.in',
  'epa.gov',
  'oecd.org',
  'eatatco.com',
  'newindia.co.in',
  'hal-india.co.in',
  'cspdcl.co.in',
  'nesl.co.in',
  'onlineupsrtc.co.in',
  'ihmcl.co.in',
  'skoda-auto.co.in',
  'facebook.com',
  'oecd.org',
  'TARGET_DOMAIN',
  'nationalinsurance.nic.co.in',
  'skoda-auto.co.in',
  'facebook.com',
  'oecd.org',
  'federal.bank.in',
  'bankofindia.bank.in',
  'cspc.co.in',
  'irel.co.in',
  'uiic.co.in',
  'TARGET_DOMAIN',
  'landrecords.karnataka.gov.in',
  'gem.gov.in',
  'youtube.com',
  'indianvisaonline.gov.in',
  'eprocure.gov.in',
  'voters.eci.gov.in',
  'youtube.com',
  'youtube.com',
  'youtube.com',
  'youtube.com',
  'cdslindia.com',
  'titan.co.in',
  'webanywhere.cs.washington.edu',
  'kohler.co.in',
  'thdc.co.in',
  'oecd.org',
  'sail.co.in',
  'TARGET_DOMAIN',
  'epa.gov',
  'eatatco.com',
  'railwire.co.in',
  'msc.com',
  'tanishq.co.in',
  'thdc.co.in',
  'oecd.org',
  'sail.co.in',
  'TARGET_DOMAIN',
  'epa.gov',
  'eatatco.com',
  'TARGET_DOMAIN',
  'oecd.org',
  'sail.co.in',
  'epa.gov',
  'eatatco.com',
  'dmv.colorado.gov',
  'cioins.co.in',
  'nationalinsurance.nic.co.in',
  // Remaining up to 100
  'trustpilot.com',
  'clutch.co',
  'yelp.com',
  'yellowpages.com',
  'thomsonlocal.com',
  'scoot.co.uk',
  'freeindex.co.uk',
  'barkinganddagenham.cylex-uk.co.uk',
  'businessmagnet.co.uk',
  '192.com',
  'zoominfo.com',
  'linkedin.com',
  'twitter.com',
  'instagram.com',
  'pinterest.com',
  'crunchbase.com',
  'glassdoor.co.uk',
  'reed.co.uk',
  'cv-library.co.uk',
  'totaljobs.com',
  'gov.uk',
  'companieshouse.gov.uk',
  'wikipedia.org',
];

export function SeRankingSerpCompetitors({
  projectDomain = 'in.pinterest.com',
  projectId,
  addedCompetitors = [],
  onAddCompetitor,
  showToast,
  onOpenGuestLink,
  onOpenFeedback,
  onOpenNotes,
  notesCount = 50,
}: SeRankingSerpCompetitorsProps) {
  const cleanDomain = projectDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();

  // Keyword List dynamically matching active project
  const defaultKeywords = useMemo(() => {
    if (cleanDomain.includes('pinterest')) {
      return [
        { id: 'kw-1', name: 'pint login', group: 'General' },
        { id: 'kw-2', name: 'pint download', group: 'General' },
        { id: 'kw-3', name: 'pint web app', group: 'General' },
        { id: 'kw-4', name: 'pint online', group: 'General' },
        { id: 'kw-5', name: 'pint pricing', group: 'General' },
      ];
    }
    if (cleanDomain.includes('flipkart')) {
      return [
        { id: 'kw-1', name: 'flipkart online shopping', group: 'Brand' },
        { id: 'kw-2', name: 'flipkart big billion days', group: 'Brand' },
        { id: 'kw-3', name: 'flipkart login', group: 'Brand' },
        { id: 'kw-4', name: 'flipkart mobile offers', group: 'Deals' },
        { id: 'kw-5', name: 'flipkart grocery', group: 'General' },
      ];
    }
    if (cleanDomain.includes('workcomposer')) {
      return [
        { id: 'kw-1', name: 'workcomposer', group: 'General' },
        { id: 'kw-2', name: 'workcomposer download', group: 'General' },
        { id: 'kw-3', name: 'workcomposer login', group: 'General' },
        { id: 'kw-4', name: 'workcomposer pricing', group: 'General' },
        { id: 'kw-5', name: 'workcompone', group: 'General' },
      ];
    }
    return [
      { id: 'kw-1', name: cleanDomain, group: 'General' },
      { id: 'kw-2', name: `${cleanDomain} login`, group: 'General' },
      { id: 'kw-3', name: `${cleanDomain} app`, group: 'Brand' },
    ];
  }, [cleanDomain]);

  // Filters State
  const [selectedGroup, setSelectedGroup] = useState('All groups');
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState(() => defaultKeywords[0]?.name || cleanDomain);

  useEffect(() => {
    setSelectedKeyword(defaultKeywords[0]?.name || cleanDomain);
  }, [cleanDomain, defaultKeywords]);

  const [isKeywordDropdownOpen, setIsKeywordDropdownOpen] = useState(false);
  const [highlightCompetitors, setHighlightCompetitors] = useState(true);
  const [displayMode, setDisplayMode] = useState<'URL' | 'DOMAIN'>('DOMAIN');
  const [filterUrl, setFilterUrl] = useState('');
  const [filterTag, setFilterTag] = useState('All tags');
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [topRange, setTopRange] = useState<'100' | '50' | '30' | '20' | '10'>('100');
  const [engineCountry, setEngineCountry] = useState('India');
  const [isEngineOpen, setIsEngineOpen] = useState(false);
  const [dateRangeText, setDateRangeText] = useState('8 Oct 2026 - 9 Oct 2026');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  // Modals
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [fullscreenDate, setFullscreenDate] = useState<string | null>(null);
  const [activeContextMenu, setActiveContextMenu] = useState<{
    date: string;
    rank: number;
    domain: string;
    url: string;
  } | null>(null);

  const filteredKeywords = useMemo(() => {
    return defaultKeywords.filter((k) => {
      const matchGroup = selectedGroup === 'All groups' || k.group === selectedGroup;
      const matchSearch = k.name.toLowerCase().includes(keywordFilter.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [defaultKeywords, selectedGroup, keywordFilter]);

  // Construct Oct 08 entries with active project domain
  const oct08Entries = useMemo<SerpRankingEntry[]>(() => {
    return OCT_08_RAW_DOMAINS.map((rawDomain, index) => {
      const rank = index + 1;
      const target = cleanDomain || 'your-domain.com';
      const domain = rawDomain === 'TARGET_DOMAIN' ? target : rawDomain;
      const isOwn = domain.toLowerCase() === target || domain.toLowerCase().includes(target);
      const samplePath =
        rank === 1
          ? ''
          : rank === 2
          ? 'about'
          : rank === 4
          ? 'services'
          : rank === 5
          ? 'gallery'
          : rank === 6
          ? 'packages'
          : rank === 7
          ? 'portfolio'
          : rank === 9
          ? 'contact'
          : `item-${rank}`;
      return {
        rank,
        domain,
        url: `https://${domain}/${samplePath}`,
        isOwn,
      };
    });
  }, [cleanDomain]);

  // Construct Oct 09 entries with active project domain
  const oct09Entries = useMemo<SerpRankingEntry[]>(() => {
    return OCT_09_RAW_DOMAINS.map((rawDomain, index) => {
      const rank = index + 1;
      const target = cleanDomain || 'your-domain.com';
      const domain = rawDomain === 'TARGET_DOMAIN' ? target : rawDomain;
      const isOwn = domain.toLowerCase() === target || domain.toLowerCase().includes(target);
      const samplePath =
        rank === 1
          ? ''
          : rank === 2
          ? 'about'
          : rank === 4
          ? 'services'
          : rank === 5
          ? 'gallery'
          : rank === 6
          ? 'packages'
          : rank === 7
          ? 'portfolio'
          : rank === 9
          ? 'contact'
          : `item-${rank}`;
      return {
        rank,
        domain,
        url: `https://${domain}/${samplePath}`,
        isOwn,
      };
    });
  }, [cleanDomain]);

  // Apply range slicing (Top 100/50/30/20/10) and URL filtering
  const visibleLimit = parseInt(topRange, 10);

  const displayOct08 = useMemo(() => {
    return oct08Entries
      .slice(0, visibleLimit)
      .filter((item) =>
        filterUrl
          ? item.domain.toLowerCase().includes(filterUrl.toLowerCase()) ||
            item.url.toLowerCase().includes(filterUrl.toLowerCase())
          : true
      );
  }, [oct08Entries, visibleLimit, filterUrl]);

  const displayOct09 = useMemo(() => {
    return oct09Entries
      .slice(0, visibleLimit)
      .filter((item) =>
        filterUrl
          ? item.domain.toLowerCase().includes(filterUrl.toLowerCase()) ||
            item.url.toLowerCase().includes(filterUrl.toLowerCase())
          : true
      );
  }, [oct09Entries, visibleLimit, filterUrl]);

  // Export handler
  const handleExport = (format: 'csv' | 'xlsx') => {
    const rows = [
      ['Rank', 'Oct-08 Domain', 'Oct-08 URL', 'Oct-09 Domain', 'Oct-09 URL', 'Highlight Own'],
    ];

    for (let i = 0; i < visibleLimit; i++) {
      const row08 = oct08Entries[i];
      const row09 = oct09Entries[i];
      rows.push([
        String(i + 1),
        row08?.domain || '',
        row08?.url || '',
        row09?.domain || '',
        row09?.url || '',
        row08?.isOwn || row09?.isOwn ? 'Yes' : 'No',
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `serp_competitors_${cleanDomain}_oct08_oct09.${format === 'xlsx' ? 'csv' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Export downloaded: SERP Competitors Top ${visibleLimit}`);
  };

  const handleTrackCompetitor = (dom: string) => {
    if (addedCompetitors.some((c) => c.domain.toLowerCase() === dom.toLowerCase())) {
      showToast(`${dom} is already being tracked in My Competitors.`);
      setActiveContextMenu(null);
      return;
    }
    onAddCompetitor({
      id: `comp-${Date.now()}`,
      domain: dom,
      visibility: 42,
      avgPosition: 12,
      commonKeywords: 18,
      totalKeywords: 140,
      organicTraffic: '1.2K',
      backlinks: '450',
      tag: 'SERP Competitor',
    });
    showToast(`Added ${dom} to My Competitors.`);
    setActiveContextMenu(null);
  };

  return (
    <div className="section-template section-wrapper__section-content bg-[#F3F4F8] text-[#171B24] min-h-screen">
      {/* 1. TOP CONTROL BAR (1:1 with SE Ranking DOM) */}
      <div className="section-wrapper__top-control bg-white border-b border-[#E3E6EE] px-6 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2">
            <a
              href="#"
              className="text-[#2F65F6] hover:underline font-semibold text-[13px] tracking-tight"
            >
              https://{cleanDomain}/
            </a>
            <span className="text-[#8F97A8]">/</span>
            <a href="#" className="text-[#8F97A8] hover:text-[#171B24] transition-colors">
              My Competitors
            </a>
            <span className="text-[#8F97A8]">/</span>
            <span className="text-[#171B24] font-bold">SERP Competitors</span>
          </div>

          {/* Right Action Links */}
          <div className="flex items-center gap-5 text-xs text-[#525B6C]">
            <button
              type="button"
              onClick={onOpenGuestLink}
              className="flex items-center gap-1.5 hover:text-[#2F65F6] transition-colors cursor-pointer font-medium"
            >
              <Share2 className="w-3.5 h-3.5 text-[#8F97A8]" />
              <span>Guest link</span>
            </button>
            <button
              type="button"
              onClick={onOpenFeedback}
              className="flex items-center gap-1.5 hover:text-[#2F65F6] transition-colors cursor-pointer font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#8F97A8]" />
              <span>Feedback</span>
            </button>
            <button
              type="button"
              onClick={onOpenNotes}
              className="flex items-center gap-1.5 hover:text-[#2F65F6] transition-colors cursor-pointer font-medium"
            >
              <FileText className="w-3.5 h-3.5 text-[#8F97A8]" />
              <span>Notes ({notesCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="px-6 py-5 max-w-[1480px] mx-auto space-y-4">
        {/* ROW 1: TWO MAIN FILTER BOXES (Left: filter-keywords | Right: filter-multi) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT BOX: filter-keywords */}
          <div className="bg-white border border-[#E3E6EE] rounded-xl p-3 shadow-2xs flex flex-col justify-between">
            {/* Top row: All groups dropdown & Search keyword input with popover */}
            <div className="flex items-center gap-2.5">
              {/* Group dropdown */}
              <div className="relative w-1/2">
                <button
                  type="button"
                  onClick={() => setIsGroupOpen(!isGroupOpen)}
                  className="w-full bg-white border border-[#D5DAE5] hover:border-[#8F97A8] rounded-lg px-3 py-2 flex items-center justify-between text-xs font-semibold text-[#171B24] cursor-pointer transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className="w-4 h-4 text-[#8F97A8] shrink-0" />
                    <span className="truncate">{selectedGroup}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8F97A8] shrink-0" />
                </button>

                {isGroupOpen && (
                  <div className="absolute left-0 mt-1 w-full bg-white border border-[#E3E6EE] rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in duration-100">
                    {['All groups', 'General', 'Brand'].map((grp) => (
                      <button
                        key={grp}
                        type="button"
                        onClick={() => {
                          setSelectedGroup(grp);
                          setIsGroupOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#F3F4F8] cursor-pointer ${
                          selectedGroup === grp
                            ? 'bg-[#EEF3FF] text-[#2F65F6] font-bold'
                            : 'text-[#171B24]'
                        }`}
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-[#8F97A8]" />
                        <span>{grp}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Keyword search input */}
              <div className="relative w-1/2">
                <input
                  type="text"
                  value={keywordFilter}
                  onFocus={() => setIsKeywordDropdownOpen(true)}
                  onChange={(e) => {
                    setKeywordFilter(e.target.value);
                    setIsKeywordDropdownOpen(true);
                  }}
                  placeholder="Search keyword"
                  className="w-full pl-3 pr-8 py-2 text-xs text-[#171B24] placeholder:text-[#8F97A8] border border-[#D5DAE5] rounded-lg focus:outline-hidden focus:border-[#2F65F6] bg-white shadow-2xs"
                />
                <Search className="w-3.5 h-3.5 text-[#8F97A8] absolute right-2.5 top-1/2 -translate-y-1/2" />

                {/* Interactive Keyword Select Dropdown */}
                {isKeywordDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E3E6EE] rounded-lg shadow-xl py-1 z-50 text-xs max-h-48 overflow-y-auto animate-in fade-in duration-100">
                    {filteredKeywords.map((kw) => (
                      <button
                        key={kw.id}
                        type="button"
                        onClick={() => {
                          setSelectedKeyword(kw.name);
                          setKeywordFilter('');
                          setIsKeywordDropdownOpen(false);
                          showToast(`Active keyword: ${kw.name}`);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#EEF3FF] cursor-pointer ${
                          selectedKeyword === kw.name
                            ? 'font-bold text-[#2F65F6] bg-[#EEF3FF]'
                            : 'text-[#171B24]'
                        }`}
                      >
                        <span className="truncate">{kw.name}</span>
                        {selectedKeyword === kw.name && (
                          <Check className="w-3.5 h-3.5 text-[#2F65F6] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom active keyword badge - clean, no static cutoff demo text */}
            <div className="mt-2.5 pt-2 border-t border-[#EEF0F5] flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[10px] uppercase font-bold text-[#8F97A8] tracking-wider shrink-0">
                  Target Keyword:
                </span>
                <span className="text-xs font-bold text-[#2F65F6] truncate bg-[#EEF3FF] px-2 py-0.5 rounded-md">
                  {selectedKeyword}
                </span>
              </div>
              <span className="text-[10px] text-[#8F97A8] shrink-0 font-medium">
                Live Google SERP Top 100
              </span>
            </div>
          </div>

          {/* RIGHT BOX: filter-multi */}
          <div className="bg-white border border-[#E3E6EE] rounded-xl p-3 shadow-2xs flex flex-col justify-between max-h-[148px]">
            {/* Top Row: Highlight competitors switch | ADVANCED SERP ANALYSIS | EXPORT */}
            <div className="flex items-center justify-between gap-3">
              {/* Highlight switch */}
              <div className="flex items-center gap-2 text-xs text-[#171B24] font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setHighlightCompetitors(!highlightCompetitors);
                    showToast(
                      highlightCompetitors
                        ? 'Disabled competitor highlighting'
                        : 'Highlighting project & tracked competitors'
                    );
                  }}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    highlightCompetitors ? 'bg-[#2F65F6]' : 'bg-[#D5DAE5]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      highlightCompetitors ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span>Highlight competitors</span>
                <span
                  className="w-4 h-4 rounded-full bg-[#E3E6EE] text-[#525B6C] flex items-center justify-center text-[10px] font-serif cursor-help"
                  title="Highlight own domain and tracked competitors with a gentle cream background"
                >
                  i
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Advanced SERP analysis button */}
                <button
                  type="button"
                  onClick={() => setIsAdvancedModalOpen(true)}
                  className="bg-white border border-[#D5DAE5] hover:bg-[#F3F4F8] text-[#171B24] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-2xs cursor-pointer transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-[#2F65F6]" />
                  <span>Advanced SERP analysis</span>
                  <span className="bg-[#36B37E] text-white text-[9px] font-black px-1.5 py-0.5 rounded-xs tracking-wider">
                    New
                  </span>
                </button>

                {/* Export button */}
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => handleExport('csv')}
                    className="bg-white border border-[#D5DAE5] hover:bg-[#F3F4F8] text-[#171B24] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#525B6C]" />
                    <span>Export</span>
                    <ChevronDown className="w-3 h-3 text-[#8F97A8]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Display toggle | Filter by URL | Filter by tags */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#EEF0F5]">
              {/* Display switch: URL | Domain */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#8F97A8] tracking-wider block">
                  Display
                </span>
                <div className="inline-flex w-full rounded-lg border border-[#D5DAE5] overflow-hidden text-xs font-semibold bg-[#F3F4F8] p-0.5">
                  <button
                    type="button"
                    onClick={() => setDisplayMode('URL')}
                    className={`flex-1 py-1 rounded-md text-center transition-colors cursor-pointer ${
                      displayMode === 'URL'
                        ? 'bg-white text-[#171B24] shadow-2xs'
                        : 'text-[#525B6C] hover:text-[#171B24]'
                    }`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayMode('DOMAIN')}
                    className={`flex-1 py-1 rounded-md text-center transition-colors cursor-pointer ${
                      displayMode === 'DOMAIN'
                        ? 'bg-white text-[#171B24] shadow-2xs'
                        : 'text-[#525B6C] hover:text-[#171B24]'
                    }`}
                  >
                    Domain
                  </button>
                </div>
              </div>

              {/* Filter by URL */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#8F97A8] tracking-wider block">
                  Filter by URL
                </span>
                <div className="relative">
                  <input
                    type="text"
                    value={filterUrl}
                    onChange={(e) => setFilterUrl(e.target.value)}
                    placeholder="Insert URL"
                    className="w-full pl-2.5 pr-7 py-1 text-xs text-[#171B24] placeholder:text-[#8F97A8] border border-[#D5DAE5] rounded-lg focus:outline-hidden focus:border-[#2F65F6] bg-white shadow-2xs"
                  />
                  <Search className="w-3 h-3 text-[#8F97A8] absolute right-2 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Filter by tags */}
              <div className="space-y-1 relative">
                <span className="text-[10px] uppercase font-bold text-[#8F97A8] tracking-wider block">
                  Filter by tags
                </span>
                <button
                  type="button"
                  onClick={() => setIsTagsOpen(!isTagsOpen)}
                  className="w-full bg-white border border-[#D5DAE5] hover:border-[#8F97A8] rounded-lg px-2.5 py-1 flex items-center justify-between text-xs text-[#171B24] cursor-pointer shadow-2xs truncate"
                >
                  <span className="truncate">{filterTag}</span>
                  <ChevronDown className="w-3 h-3 text-[#8F97A8] shrink-0" />
                </button>
                {isTagsOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-[#E3E6EE] rounded-lg shadow-xl py-1 z-40 text-xs">
                    {['All tags', 'Direct', 'Organic', 'Partners'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setFilterTag(t);
                          setIsTagsOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F4F8] cursor-pointer ${
                          filterTag === t ? 'bg-[#EEF3FF] text-[#2F65F6] font-bold' : 'text-[#171B24]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: TIER SWITCHER (TOP 100/50/30/20/10) | SEARCH ENGINE | DATE RANGE */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Top 100/50/30/20/10 tabs */}
          <div className="inline-flex rounded-lg border border-[#D5DAE5] overflow-hidden bg-white shadow-2xs text-xs font-semibold">
            {(['100', '50', '30', '20', '10'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTopRange(r)}
                className={`px-4 py-1.5 border-r last:border-r-0 border-[#D5DAE5] transition-colors cursor-pointer ${
                  topRange === r
                    ? 'bg-[#2F65F6] text-white font-bold'
                    : 'text-[#525B6C] hover:bg-[#F3F4F8]'
                }`}
              >
                Top {r}
              </button>
            ))}
          </div>

          {/* Engine & Calendar */}
          <div className="flex items-center gap-2">
            {/* Engine dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsEngineOpen(!isEngineOpen)}
                className="bg-white border border-[#D5DAE5] hover:border-[#2F65F6] rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-[#171B24] shadow-2xs cursor-pointer hover:bg-[#F8FAFC] transition-colors"
              >
                {/* Official Google 4-Color SVG Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.09C3.3 21.43 7.37 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.41l4-3.09z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.3 2.57 1.28 6.59l4 3.09c.95-2.83 3.6-4.93 6.72-4.93z" />
                </svg>
                <span className="text-sm">🇮🇳</span>
                <span className="font-bold text-[#171B24]">{engineCountry}</span>
                <span className="text-[10px] text-[#8F97A8] font-bold uppercase">en</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8F97A8]" />
              </button>

              {isEngineOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E3E6EE] rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in duration-100">
                  {['India', 'United States', 'United Kingdom'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setEngineCountry(c);
                        setIsEngineOpen(false);
                        showToast(`Switched Google search engine region to: ${c}`);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-[#F3F4F8] cursor-pointer flex items-center justify-between ${
                        engineCountry === c ? 'bg-[#EEF3FF] text-[#2F65F6] font-bold' : 'text-[#171B24]'
                      }`}
                    >
                      <span>{c}</span>
                      <span className="text-[10px] text-[#8F97A8]">en</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Calendar Range Button */}
            <button
              type="button"
              onClick={() => setIsDateModalOpen(true)}
              className="bg-white border border-[#D5DAE5] hover:border-[#2F65F6] rounded-lg px-3.5 py-1.5 flex items-center gap-2 text-xs font-semibold text-[#171B24] shadow-2xs cursor-pointer hover:bg-[#F8FAFC] transition-colors"
            >
              <Calendar className="w-4 h-4 text-[#2F65F6]" />
              <span className="font-bold">{dateRangeText}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8F97A8]" />
            </button>
          </div>
        </div>

        {/* ROW 3: DUAL-COLUMN COMPARISON CONTAINER (# Oct-08 2026 vs # Oct-09 2026) */}
        <div className="bg-white border border-[#E3E6EE] rounded-xl shadow-2xs p-4 overflow-x-auto">
          <div className="flex gap-4 min-w-[710px]">
            {/* COLUMN 1: Oct-08 2026 */}
            <div className="flex-1 border border-[#E3E6EE] rounded-lg overflow-hidden flex flex-col bg-white">
              {/* Column Header */}
              <div className="bg-[#F8F9FC] border-b border-[#E3E6EE] px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-[#171B24]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#8F97A8]">#</span>
                  <span>Oct-08 2026</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFullscreenDate('Oct-08 2026')}
                  className="p-1 hover:bg-[#EAECEF] rounded text-[#8F97A8] hover:text-[#171B24] cursor-pointer transition-colors"
                  title="Expand to Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Column Rows */}
              <div className="divide-y divide-[#EEF0F5] max-h-[700px] overflow-y-auto">
                {displayOct08.map((item) => {
                  const isTracked = addedCompetitors.some(
                    (c) => c.domain.toLowerCase() === item.domain.toLowerCase()
                  );
                  const isHighlighted = highlightCompetitors && (item.isOwn || isTracked);

                  return (
                    <div
                      key={`08-${item.rank}`}
                      className={`px-3 py-2 flex items-center justify-between gap-2 text-xs transition-colors group relative ${
                        isHighlighted
                          ? 'bg-[#FEFCE8] text-[#78350F] font-semibold border-l-2 border-l-[#F59E0B]'
                          : 'hover:bg-[#F8F9FC] text-[#171B24]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Rank */}
                        <span
                          className={`w-6 text-center text-xs font-bold shrink-0 ${
                            item.rank <= 3
                              ? 'text-[#2F65F6]'
                              : item.rank <= 10
                              ? 'text-[#171B24]'
                              : 'text-[#8F97A8]'
                          }`}
                        >
                          {item.rank}
                        </span>

                        {/* Favicon from Google S2 - Circular SEO Logo */}
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-white border border-[#D5DAE5] p-0.5 shrink-0 flex items-center justify-center shadow-2xs">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
                              item.domain
                            )}&sz=64`}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Domain / URL */}
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate hover:underline hover:text-[#2F65F6] select-all"
                          title={item.url}
                        >
                          {displayMode === 'DOMAIN' ? item.domain : item.url.replace(/^https?:\/\//, '')}
                        </a>
                      </div>

                      {/* 3-dots context menu trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              activeContextMenu?.date === '08' &&
                              activeContextMenu?.rank === item.rank
                            ) {
                              setActiveContextMenu(null);
                            } else {
                              setActiveContextMenu({
                                date: '08',
                                rank: item.rank,
                                domain: item.domain,
                                url: item.url,
                              });
                            }
                          }}
                          className="p-1 hover:bg-black/5 rounded text-[#8F97A8] hover:text-[#171B24] cursor-pointer"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Context Menu Dropdown */}
                        {activeContextMenu?.date === '08' &&
                          activeContextMenu?.rank === item.rank && (
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#E3E6EE] rounded-lg shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => handleTrackCompetitor(item.domain)}
                                className="w-full text-left px-3 py-2 hover:bg-[#F3F4F8] flex items-center gap-2 text-[#171B24] cursor-pointer font-medium"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-[#2F65F6]" />
                                <span>Add to My Competitors</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(item.url);
                                  showToast(`Copied URL: ${item.url}`);
                                  setActiveContextMenu(null);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-[#F3F4F8] flex items-center gap-2 text-[#171B24] cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-[#525B6C]" />
                                <span>Copy URL</span>
                              </button>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => setActiveContextMenu(null)}
                                className="w-full text-left px-3 py-2 hover:bg-[#F3F4F8] flex items-center gap-2 text-[#171B24] cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-[#525B6C]" />
                                <span>Visit Website</span>
                              </a>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2: Oct-09 2026 */}
            <div className="flex-1 border border-[#E3E6EE] rounded-lg overflow-hidden flex flex-col bg-white">
              {/* Column Header */}
              <div className="bg-[#F8F9FC] border-b border-[#E3E6EE] px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-[#171B24]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#8F97A8]">#</span>
                  <span>Oct-09 2026</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFullscreenDate('Oct-09 2026')}
                  className="p-1 hover:bg-[#EAECEF] rounded text-[#8F97A8] hover:text-[#171B24] cursor-pointer transition-colors"
                  title="Expand to Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Column Rows */}
              <div className="divide-y divide-[#EEF0F5] max-h-[700px] overflow-y-auto">
                {displayOct09.map((item) => {
                  const isTracked = addedCompetitors.some(
                    (c) => c.domain.toLowerCase() === item.domain.toLowerCase()
                  );
                  const isHighlighted = highlightCompetitors && (item.isOwn || isTracked);

                  return (
                    <div
                      key={`09-${item.rank}`}
                      className={`px-3 py-2 flex items-center justify-between gap-2 text-xs transition-colors group relative ${
                        isHighlighted
                          ? 'bg-[#FEFCE8] text-[#78350F] font-semibold border-l-2 border-l-[#F59E0B]'
                          : 'hover:bg-[#F8F9FC] text-[#171B24]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Rank */}
                        <span
                          className={`w-6 text-center text-xs font-bold shrink-0 ${
                            item.rank <= 3
                              ? 'text-[#2F65F6]'
                              : item.rank <= 10
                              ? 'text-[#171B24]'
                              : 'text-[#8F97A8]'
                          }`}
                        >
                          {item.rank}
                        </span>

                        {/* Favicon from Google S2 - Circular SEO Logo */}
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-white border border-[#D5DAE5] p-0.5 shrink-0 flex items-center justify-center shadow-2xs">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
                              item.domain
                            )}&sz=64`}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Domain / URL */}
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate hover:underline hover:text-[#2F65F6] select-all"
                          title={item.url}
                        >
                          {displayMode === 'DOMAIN' ? item.domain : item.url.replace(/^https?:\/\//, '')}
                        </a>
                      </div>

                      {/* 3-dots context menu trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              activeContextMenu?.date === '09' &&
                              activeContextMenu?.rank === item.rank
                            ) {
                              setActiveContextMenu(null);
                            } else {
                              setActiveContextMenu({
                                date: '09',
                                rank: item.rank,
                                domain: item.domain,
                                url: item.url,
                              });
                            }
                          }}
                          className="p-1 hover:bg-black/5 rounded text-[#8F97A8] hover:text-[#171B24] cursor-pointer"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Context Menu Dropdown */}
                        {activeContextMenu?.date === '09' &&
                          activeContextMenu?.rank === item.rank && (
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#E3E6EE] rounded-lg shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => handleTrackCompetitor(item.domain)}
                                className="w-full text-left px-3 py-2 hover:bg-[#F3F4F8] flex items-center gap-2 text-[#171B24] cursor-pointer font-medium"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-[#2F65F6]" />
                                <span>Add to My Competitors</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(item.url);
                                  showToast(`Copied URL: ${item.url}`);
                                  setActiveContextMenu(null);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-[#F3F4F8] flex items-center gap-2 text-[#171B24] cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-[#525B6C]" />
                                <span>Copy URL</span>
                              </button>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => setActiveContextMenu(null)}
                                className="w-full text-left px-3 py-2 hover:bg-[#F3F4F8] flex items-center gap-2 text-[#171B24] cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-[#525B6C]" />
                                <span>Visit Website</span>
                              </a>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ADVANCED SERP ANALYSIS MODAL */}
      {isAdvancedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-[#E3E6EE] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EEF0F5] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#EEF3FF] flex items-center justify-center text-[#2F65F6]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#171B24]">Advanced SERP Analysis</h3>
                  <p className="text-xs text-[#525B6C]">
                    Query: <strong className="text-[#171B24]">{selectedKeyword}</strong> (Google India)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdvancedModalOpen(false)}
                className="text-[#8F97A8] hover:text-[#171B24] cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-[#F8F9FC] border border-[#E3E6EE] rounded-xl text-center">
                <span className="text-[11px] text-[#525B6C] font-semibold block">Total URLs Crawled</span>
                <span className="text-xl font-black text-[#171B24]">100</span>
                <span className="text-[10px] text-[#36B37E] font-bold block mt-0.5">Top 100 Verified</span>
              </div>
              <div className="p-3.5 bg-[#F8F9FC] border border-[#E3E6EE] rounded-xl text-center">
                <span className="text-[11px] text-[#525B6C] font-semibold block">Own Domain Positions</span>
                <span className="text-xl font-black text-[#2F65F6]">18 URLs</span>
                <span className="text-[10px] text-[#36B37E] font-bold block mt-0.5">Rank #1 to #70</span>
              </div>
              <div className="p-3.5 bg-[#F8F9FC] border border-[#E3E6EE] rounded-xl text-center">
                <span className="text-[11px] text-[#525B6C] font-semibold block">SERP Volatility</span>
                <span className="text-xl font-black text-[#36B37E]">0.8 / 10</span>
                <span className="text-[10px] text-[#525B6C] font-medium block mt-0.5">High Stability</span>
              </div>
            </div>

            {/* SERP Features Detected */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#171B24] uppercase tracking-wider block">
                SERP Features Detected in Search Results
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white border border-[#E3E6EE] rounded-lg flex items-center justify-between">
                  <span className="text-[#525B6C]">Featured Snippet</span>
                  <span className="text-[#36B37E] font-bold">✓ Active (Position 0)</span>
                </div>
                <div className="p-2.5 bg-white border border-[#E3E6EE] rounded-lg flex items-center justify-between">
                  <span className="text-[#525B6C]">Sitelinks Pack</span>
                  <span className="text-[#36B37E] font-bold">✓ 6 Links Detected</span>
                </div>
                <div className="p-2.5 bg-white border border-[#E3E6EE] rounded-lg flex items-center justify-between">
                  <span className="text-[#525B6C]">People Also Ask (PAA)</span>
                  <span className="text-[#36B37E] font-bold">✓ 4 Questions</span>
                </div>
                <div className="p-2.5 bg-white border border-[#E3E6EE] rounded-lg flex items-center justify-between">
                  <span className="text-[#525B6C]">Video Carousel</span>
                  <span className="text-[#36B37E] font-bold">✓ 4 YouTube Clips</span>
                </div>
              </div>
            </div>

            {/* Top Competitor Share */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#171B24] uppercase tracking-wider block">
                Top Visibility Share in Top 100
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#171B24]">{cleanDomain} (Target Domain)</span>
                  <span className="font-bold text-[#2F65F6]">18 URLs (78.4% Visibility)</span>
                </div>
                <div className="w-full bg-[#E3E6EE] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#2F65F6] h-full rounded-full" style={{ width: '78.4%' }} />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EEF0F5]">
              <button
                type="button"
                onClick={() => {
                  handleExport('csv');
                  setIsAdvancedModalOpen(false);
                }}
                className="px-4 py-2 border border-[#D5DAE5] hover:bg-[#F3F4F8] text-[#171B24] rounded-lg text-xs font-bold cursor-pointer"
              >
                Export Analysis
              </button>
              <button
                type="button"
                onClick={() => setIsAdvancedModalOpen(false)}
                className="px-5 py-2 bg-[#2F65F6] hover:bg-[#1E4FD8] text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FULLSCREEN COLUMN MODAL */}
      {fullscreenDate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-[#E3E6EE] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EEF0F5] flex items-center justify-between bg-[#F8F9FC] rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-[#171B24]">
                  SERP Top 100 Competitors — {fullscreenDate}
                </h3>
                <p className="text-xs text-[#525B6C]">
                  {selectedKeyword} • Google {engineCountry} (en)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFullscreenDate(null)}
                className="text-[#8F97A8] hover:text-[#171B24] cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#EEF0F5] p-6 text-xs">
              {(fullscreenDate === 'Oct-08 2026' ? displayOct08 : displayOct09).map((item) => {
                const isTracked = addedCompetitors.some(
                  (c) => c.domain.toLowerCase() === item.domain.toLowerCase()
                );
                const isHighlighted = highlightCompetitors && (item.isOwn || isTracked);

                return (
                  <div
                    key={`fs-${item.rank}`}
                    className={`py-2.5 px-3 flex items-center justify-between rounded-lg transition-colors ${
                      isHighlighted ? 'bg-[#FEFCE8] text-[#78350F] font-semibold' : 'hover:bg-[#F8F9FC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold w-7 text-center text-[#8F97A8]">
                        #{item.rank}
                      </span>
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-white border border-[#D5DAE5] p-0.5 shrink-0 flex items-center justify-center shadow-2xs">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
                            item.domain
                          )}&sz=64`}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="font-medium text-[#171B24]">{item.domain}</span>
                      <span className="text-[#8F97A8] truncate max-w-md">{item.url}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isHighlighted && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FEF08A] text-[#854D0E] text-[10px] font-bold">
                          {item.isOwn ? 'Own Domain' : 'Tracked Competitor'}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleTrackCompetitor(item.domain)}
                        className="px-2.5 py-1 rounded bg-[#EEF3FF] text-[#2F65F6] hover:bg-[#DBE6FE] text-xs font-semibold cursor-pointer"
                      >
                        + Track
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[#EEF0F5] flex justify-end bg-[#F8F9FC] rounded-b-2xl">
              <button
                type="button"
                onClick={() => setFullscreenDate(null)}
                className="px-5 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Close Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PROFESSIONAL DUAL-MONTH CALENDAR */}
      <SeRankingDualCalendar
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onApply={(range) => {
          setDateRangeText(range);
          showToast(`Applied comparison date range: ${range}`);
        }}
      />
    </div>
  );
}
