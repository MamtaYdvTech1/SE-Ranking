'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Sparkles,
  BarChart2,
  Globe,
  Database,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Table,
  CheckCircle2,
  Tag,
  Check,
  Star,
  MapPin,
  Link2,
  Shield,
  Trophy,
} from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '@/lib/constants';
import { KeywordResearchDashboard } from '@/components/research/KeywordResearchDashboard';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { GoogleLogo } from '@/components/ui/GoogleLogo';

function KeywordResearchContent() {
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');
  const router = useRouter();
  const [viewState, setViewState] = useState<'start' | 'dashboard'>('start');
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordsList, setKeywordsList] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState(
    SUPPORTED_COUNTRIES.find((c) => c.code === 'in') || SUPPORTED_COUNTRIES[0]
  );
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carousel 1 Slide State (0 = 1-2 of 4, 1 = 3-4 of 4)
  const [carousel1Page, setCarousel1Page] = useState<0 | 1>(0);

  // Carousel 2 Slide State (0 = 1-2 of 4, 1 = 3-4 of 4)
  const [carousel2Page, setCarousel2Page] = useState<0 | 1>(0);

  // Section 3 Image Tabs State (0: Similar, 1: Related, 2: Competitive)
  const [activeImageTab, setActiveImageTab] = useState(0);

  // Handlers for Keywords
  const handleAddKeyword = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (!keywordsList.includes(trimmed)) {
      setKeywordsList([...keywordsList, trimmed]);
    }
    setKeywordInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddKeyword(keywordInput);
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywordsList(keywordsList.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const parsed = text
        .split(/[\r\n,]+/)
        .map((k) => k.trim())
        .filter(Boolean);
      const unique = Array.from(new Set([...keywordsList, ...parsed]));
      setKeywordsList(unique.slice(0, 50));
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    const activeKw = keywordsList.length > 0 ? keywordsList[0] : keywordInput.trim();
    if (!activeKw) return;
    setViewState('dashboard');
  };

  if (tab === 'database-expansion') {
    return (
      <div className="flex-1 overflow-y-auto bg-white min-h-[calc(100vh-80px)] text-gray-900 select-none flex flex-col justify-between">
        <div className="p-4 sm:p-6 w-full space-y-3.5 max-w-[1400px] mx-auto">
          {/* Dismissible Notice Banner matching Screenshot 6 */}
          <div className="p-3.5 sm:p-4 bg-[#F0F6FD] border border-[#D5E6F7] rounded-lg relative text-[12px] text-gray-700 leading-relaxed">
            <div className="font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#7C3AED] text-white text-[9px] flex items-center justify-center font-bold">i</span>
              <span>How does it work?</span>
            </div>
            <p className="pr-6 mb-1.5">
              We aim to keep our databases squeaky clean and are constantly expanding them. But, of course, we still have a long way to go before we cover every single search request out there. That&apos;s where you come in! Help us help you by submitting additional search queries for analysis.
            </p>
            <p className="pr-6">
              Suppose you have a specific niche that the relevant database doesn&apos;t have any keyword data on. Don&apos;t panic! Just upload a list of all the relevant search queries, and in a month&apos;s time, you&apos;ll get all the information you need, including a complete overview of organic and paid traffic, search queries and competitors.{' '}
              <a
                href="https://help.seranking.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#7C3AED] font-medium hover:underline inline-flex items-center gap-0.5"
              >
                <span>Learn more</span>
              </a>
            </p>
          </div>

          {/* Header matching Screenshot 6 */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="text-[13px] text-[#8C98A9] font-normal flex items-center gap-1.5">
              <Link href="/research/keyword-research" className="hover:text-[#7C3AED]">
                Keyword Research
              </Link>
              <span>›</span>
              <span className="text-gray-800 font-semibold">Database Expansion</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <button
                type="button"
                onClick={() => alert('Support & Help: 24/7 technical assistance for keyword expansion.')}
                className="flex items-center gap-1 hover:text-[#7C3AED] transition-colors cursor-pointer"
              >
                <span>Have any questions?</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              <button
                type="button"
                onClick={() => alert('Feedback: Tell us what keyword databases you need expanded!')}
                className="hover:text-[#7C3AED] transition-colors cursor-pointer"
              >
                Feedback
              </button>
            </div>
          </div>

          {/* Controls matching Screenshot 6 */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white max-w-sm flex-1 min-w-[260px] focus-within:border-[#7C3AED]">
              <input
                type="text"
                placeholder="Enter a keyword"
                className="px-3.5 py-2 text-xs flex-1 focus:outline-hidden text-gray-900"
              />
              <div className="relative border-l border-gray-200 px-2 flex items-center">
                <CountryFlag code={selectedCountry.code} size="sm" />
              </div>
            </div>

            <button
              type="button"
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              Analyze
            </button>

            <div className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 flex items-center gap-1.5">
              <span>September 2026</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>

            <div className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 flex items-center gap-1.5">
              <span>$ USD</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>

            <Link
              href="/research/keyword-research"
              className="text-xs text-gray-600 hover:text-[#7C3AED] font-medium ml-2 cursor-pointer"
            >
              Bulk keyword Analysis
            </Link>
          </div>

          {/* Diagonal Striped Background Area matching Screenshot 6 */}
          <div
            className="relative rounded-lg border border-gray-200 overflow-hidden min-h-[500px] flex items-center justify-center p-6 text-center"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #F9FBFC 0, #F9FBFC 9px, #FFFFFF 9px, #FFFFFF 18px)',
            }}
          >
            <div className="relative z-10 max-w-lg bg-white/95 backdrop-blur-xs p-8 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Want to submit your search queries for analysis?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                This feature is only available under the Pro and Business pricing plans. Upgrade your subscription plan to get a comprehensive SERP analysis of your search queries.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link
                  href="/pricing"
                  className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded uppercase tracking-wider transition-colors shadow-xs"
                >
                  UPGRADE SUBSCRIPTION
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewState === 'dashboard') {
    const activeKw = keywordsList.length > 0 ? keywordsList[0] : keywordInput.trim() || 'seo software';
    return (
      <KeywordResearchDashboard
        keyword={activeKw}
        country={selectedCountry.name}
        countryCode={selectedCountry.code}
        onNewSearch={() => setViewState('start')}
      />
    );
  }

  // Section 3 Table Data by Tab
  const section3Data = [
    // Tab 0: Similar keywords
    [
      { kw: 'seo ranking factors', vol: '6,540', kd: 28, trend: [20, 25, 30, 45, 60, 55, 70, 85], features: ['site_links', 'snippet'] },
      { kw: 'website audit seo tools', vol: '3,210', kd: 34, trend: [40, 35, 50, 60, 55, 65, 75, 80], features: ['people_also_ask', 'site_links'] },
      { kw: 'rank tracking software', vol: '2,900', kd: 22, trend: [30, 40, 45, 50, 65, 70, 85, 90], features: ['snippet', 'images'] },
      { kw: 'competitor backlink analysis', vol: '1,950', kd: 19, trend: [15, 20, 35, 40, 55, 60, 75, 80], features: ['site_links'] },
      { kw: 'keyword search volume checker', vol: '1,600', kd: 15, trend: [25, 30, 40, 50, 60, 70, 80, 95], features: ['snippet'] },
    ],
    // Tab 1: Related keywords
    [
      { kw: 'google ranking algorithm update', vol: '9,800', kd: 45, trend: [50, 45, 70, 85, 90, 80, 75, 85], features: ['snippet', 'site_links'] },
      { kw: 'how to improve domain authority', vol: '5,400', kd: 31, trend: [30, 35, 45, 55, 60, 70, 75, 80], features: ['people_also_ask'] },
      { kw: 'serp features tracking', vol: '2,100', kd: 18, trend: [20, 25, 40, 50, 60, 65, 80, 85], features: ['images', 'site_links'] },
      { kw: 'on page seo checklist 2026', vol: '4,200', kd: 26, trend: [35, 40, 50, 60, 70, 80, 85, 90], features: ['snippet'] },
      { kw: 'best backlink monitoring tools', vol: '1,800', kd: 21, trend: [25, 30, 35, 45, 55, 65, 75, 85], features: ['site_links'] },
    ],
    // Tab 2: Low search volume / Long tail
    [
      { kw: 'automatic screenshot employee monitor tool', vol: '880', kd: 14, trend: [15, 20, 30, 45, 60, 75, 85, 90], features: ['snippet'] },
      { kw: 'real time position rank checker api', vol: '720', kd: 18, trend: [20, 30, 35, 50, 60, 70, 80, 85], features: ['site_links'] },
      { kw: 'saas competitor keyword gap analyzer', vol: '590', kd: 16, trend: [10, 25, 35, 45, 55, 70, 80, 90], features: ['snippet'] },
      { kw: 'local rank tracker google map pack', vol: '940', kd: 22, trend: [30, 40, 50, 65, 70, 80, 85, 95], features: ['map_pack'] },
      { kw: 'white label seo reporting software', vol: '680', kd: 19, trend: [25, 35, 40, 55, 65, 75, 85, 90], features: ['site_links'] },
    ],
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-[calc(100vh-80px)] text-gray-900 select-none pb-12">
      {/* Hidden file input for TXT/CSV */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".txt,.csv"
        className="hidden"
      />



      {/* Subheader questions & feedback row matching screenshot */}
      <div className="max-w-[1100px] mx-auto px-4 pt-3 flex items-center justify-end gap-6 text-xs text-[#7C3AED]">
        <button type="button" className="flex items-center gap-1 hover:underline cursor-pointer font-medium text-[#7C3AED]">
          <span>Have any questions?</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button type="button" className="hover:underline cursor-pointer font-medium text-[#7C3AED]">
          Feedback
        </button>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-6 space-y-12">
        {/* ========================================================================= */}
        {/* 1. TOP INTERACTIVE SEARCH BLOCK matching user screenshot */}
        {/* ========================================================================= */}
        <div className="text-center pt-2">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Keyword Research
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Find the most profitable keywords to rank for
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-300 shadow-sm focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 transition-all p-1.5 flex flex-wrap sm:flex-nowrap items-center gap-2">
              {/* Keywords Input with Tag Chips */}
              <div className="flex-1 flex flex-wrap items-center gap-1.5 px-2 py-1 min-h-[38px] text-left">
                {keywordsList.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F5F3FF] text-[#7C3AED] text-xs font-medium border border-[#DDD6FE]"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(idx)}
                      className="hover:text-[#5B21B6] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    keywordsList.length === 0
                      ? 'Enter keywords or drop a TXT/CSV file'
                      : 'Add more keywords...'
                  }
                  className="flex-1 min-w-[220px] text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
                />
              </div>

              {/* Upload TXT/CSV Icon Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Drop or upload a TXT/CSV file"
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Upload className="w-4 h-4" />
              </button>

              {/* Region & Search Engine Select Button with Real Google Logo and Flag */}
              <div className="relative border-l border-gray-200 pl-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                  className="h-10 px-3 flex items-center gap-2 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                >
                  <GoogleLogo className="w-4 h-4 shrink-0" />
                  <CountryFlag code={selectedCountry.code} size="sm" />
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {isCountryOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1.5 max-h-56 overflow-y-auto text-xs">
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c);
                          setIsCountryOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#F5F3FF] cursor-pointer ${
                          selectedCountry.code === c.code
                            ? 'bg-[#F5F3FF] font-bold text-[#7C3AED]'
                            : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CountryFlag code={c.code} size="sm" />
                          <span>{c.name}</span>
                        </div>
                        {selectedCountry.code === c.code && (
                          <Check className="w-3.5 h-3.5 text-[#7C3AED]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button: Analyze */}
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!keywordInput.trim() && keywordsList.length === 0}
                  className={`h-10 px-5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider ${
                    keywordInput.trim() || keywordsList.length > 0
                      ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>ANALYZE</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. CAROUSEL 1: Investigate keyword parameters down to the core */}
        {/* ========================================================================= */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Investigate keyword parameters down to the core
            </h2>

            {/* Carousel Navigation: 1-2 of 4 matching user screenshot */}
            <div className="flex items-center gap-2.5 text-xs text-gray-500">
              <span className="font-semibold text-gray-700">
                {carousel1Page === 0 ? '1-2 of 4' : '3-4 of 4'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCarousel1Page(0)}
                  disabled={carousel1Page === 0}
                  className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Previous items"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCarousel1Page(1)}
                  disabled={carousel1Page === 1}
                  className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Next items"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel 1 Cards: Exactly 2 visible per slide matching user screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {carousel1Page === 0 ? (
              <>
                {/* Card 1: Difficulty score (Exact visual diagram from screenshot) */}
                <div className="bg-white rounded-2xl border border-gray-200/90 p-6 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="mb-5">
                    {/* Visual Diagram: Circular Difficulty Gauge */}
                    <div className="h-44 bg-gray-50/70 rounded-xl border border-gray-100 p-4 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        DIFFICULTY
                      </div>
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-200"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-[#10B981]"
                            strokeDasharray="18, 100"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute text-center flex flex-col items-center">
                          <span className="text-2xl font-black text-gray-900 tracking-tight">18</span>
                          <span className="text-[10px] font-bold text-[#10B981] uppercase -mt-0.5">EASY</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 text-center max-w-xs mt-2 leading-tight">
                        From 0 to 100, how difficult it will be to get a website ranking in the top 10 for the analyzed keyword with SEO efforts.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Difficulty score</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      See how difficult it will be to rank a web page at the top of Google for a specific keyword.
                    </p>
                  </div>
                </div>

                {/* Card 2: Search volume (Exact visual diagram from screenshot) */}
                <div className="bg-white rounded-2xl border border-gray-200/90 p-6 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="mb-5">
                    {/* Visual Diagram: Monthly Search Volume Bars */}
                    <div className="h-44 bg-gray-50/70 rounded-xl border border-gray-100 p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          SEARCH VOLUME
                        </span>
                        <span className="text-xs font-bold text-[#7C3AED]">Monthly trend</span>
                      </div>
                      <div className="text-2xl font-black text-gray-900 tracking-tight">390</div>
                      <div className="flex items-end gap-2 h-20 pt-2 border-b border-gray-200 pb-1">
                        {[
                          { m: 'Oct', h: 45 },
                          { m: 'Nov', h: 60 },
                          { m: 'Dec', h: 50 },
                          { m: 'Jan', h: 80 },
                          { m: 'Feb', h: 90 },
                          { m: 'Mar', h: 75 },
                          { m: 'Apr', h: 85 },
                          { m: 'May', h: 95 },
                          { m: 'Jun', h: 85 },
                          { m: 'Jul', h: 90 },
                        ].map((col, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <div
                              className="w-full bg-[#7C3AED] hover:bg-[#7C3AED] rounded-t-sm transition-all"
                              style={{ height: `${col.h}%` }}
                              title={`${col.m}: ${col.h * 10} searches`}
                            />
                            <span className="text-[8px] text-gray-400 truncate">{col.m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Search volume</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Find out how many monthly organic searches the selected keyword gets on Google.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Card 3: CPC and paid competition */}
                <div className="bg-white rounded-2xl border border-gray-200/90 p-6 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="mb-5">
                    <div className="h-44 bg-gray-50/70 rounded-xl border border-gray-100 p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                          CPC &amp; COMPETITION
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px]">
                          Google Ads
                        </span>
                      </div>
                      <div className="text-2xl font-black text-purple-700 tracking-tight">$3.20</div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                          <span>Paid Competition Index</span>
                          <span className="font-bold text-gray-900">0.45 (Medium)</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-purple-600 h-full rounded-full" style={{ width: '45%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">CPC and Competition</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Analyze paid advertising costs and competitor density to optimize your PPC budget.
                    </p>
                  </div>
                </div>

                {/* Card 4: Search Intent */}
                <div className="bg-white rounded-2xl border border-gray-200/90 p-6 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="mb-5">
                    <div className="h-44 bg-gray-50/70 rounded-xl border border-gray-100 p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                          SEARCH INTENT
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px]">
                          AI Categorized
                        </span>
                      </div>
                      <div className="text-xl font-black text-gray-900">Commercial / Informational</div>
                      <div className="space-y-1.5 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />Informational</span>
                          <span className="font-bold">48%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Commercial</span>
                          <span className="font-bold">36%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Search Intent</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Understand user intent behind queries to create content that matches search expectations.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. CAROUSEL 2: Get the most out of keywords with our platform */}
        {/* ========================================================================= */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Get the most out of keywords with our platform
            </h2>

            {/* Carousel 2 Navigation: 1-2 of 4 matching user screenshot */}
            <div className="flex items-center gap-2.5 text-xs text-gray-500">
              <span className="font-semibold text-gray-700">
                {carousel2Page === 0 ? '1-2 of 4' : '3-4 of 4'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCarousel2Page(0)}
                  disabled={carousel2Page === 0}
                  className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Previous items"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCarousel2Page(1)}
                  disabled={carousel2Page === 1}
                  className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Next items"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel 2 Cards: Exactly 2 visible per slide matching user screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {carousel2Page === 0 ? (
              <>
                {/* Card 1: Bulk keyword analysis (Exact visual diagram from screenshot) */}
                <div className="bg-white rounded-2xl border border-gray-200/90 p-6 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="mb-5">
                    {/* Visual Diagram: Table with colored difficulty circles */}
                    <div className="h-44 bg-gray-50/70 rounded-xl border border-gray-100 p-3.5 overflow-hidden flex flex-col justify-between text-xs">
                      <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-gray-200 font-bold text-gray-500 uppercase tracking-wider">
                        <span>Keyword</span>
                        <span>Diff</span>
                        <span>Volume</span>
                        <span>CPC</span>
                      </div>
                      <div className="space-y-2 py-1 text-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="truncate max-w-[130px] font-medium text-gray-900">employee tracker</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[11px] font-bold">18</span></span>
                          <span className="font-semibold">14.8K</span>
                          <span className="font-mono text-gray-500">$4.50</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="truncate max-w-[130px] font-medium text-gray-900">work time tracker</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-[11px] font-bold">34</span></span>
                          <span className="font-semibold">8.1K</span>
                          <span className="font-mono text-gray-500">$3.20</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="truncate max-w-[130px] font-medium text-gray-900">screenshot monitor</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className="text-[11px] font-bold">52</span></span>
                          <span className="font-semibold">2.4K</span>
                          <span className="font-mono text-gray-500">$5.10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Bulk keyword analysis</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Need to analyze hundreds or even thousands of keywords fast? With bulk keyword analysis, you don&apos;t have to worry about it taking ages to get done.
                    </p>
                  </div>
                </div>

                {/* Card 2: Keyword Manager (Exact visual diagram from screenshot) */}
                <div className="bg-white rounded-2xl border border-gray-200/90 p-6 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="mb-5">
                    {/* Visual Diagram: Add keywords dialog modal */}
                    <div className="h-44 bg-gray-50/70 rounded-xl border border-gray-100 p-3.5 flex flex-col justify-between text-xs">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 font-bold text-gray-800 text-[11px]">
                        <span>Add keywords</span>
                        <span className="text-gray-400">✕</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="bg-white border border-gray-200 rounded p-1.5 text-[11px] text-gray-500">
                          Search or select list...
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 rounded bg-[#F5F3FF] text-[#6D28D9] text-[10px] font-semibold flex items-center gap-1">
                            <span>SaaS core</span> ✕
                          </span>
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-semibold flex items-center gap-1">
                            <span>Competitor gap</span> ✕
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <span className="px-3 py-1 bg-[#7C3AED] text-white rounded font-bold text-[10px]">Save List</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Keyword Manager</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Keyword Manager allows you to add, update, and save keyword lists for different regions all in one place. You can also monitor how keyword metrics and search results change over time.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Card 3: Keyword Grouper */}
                <div className="bg-white rounded-2xl border border-gray-200/90 p-6 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="mb-5">
                    <div className="h-44 bg-gray-50/70 rounded-xl border border-gray-100 p-4 flex flex-col justify-center items-center text-center">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center mb-2 shadow-2xs">
                        <Database className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <div className="text-sm font-bold text-gray-900">Keyword Grouper &amp; Clustering</div>
                      <div className="text-xs text-gray-500 mt-1">Automatic SERP similarity clustering</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Keyword Grouper</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Automatically cluster keywords based on SERP similarity to build structured website architecture and avoid cannibalization.
                    </p>
                  </div>
                </div>

                {/* Card 4: Historical Data */}
                <div className="bg-white rounded-2xl border border-gray-200/90 p-6 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="mb-5">
                    <div className="h-44 bg-gray-50/70 rounded-xl border border-gray-100 p-4 flex flex-col justify-center items-center text-center">
                      <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 shadow-2xs">
                        <Calendar className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <div className="text-sm font-bold text-gray-900">Historical Volume Trends</div>
                      <div className="text-xs text-gray-500 mt-1">Track seasonal spikes and multi-year query demand</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">Historical Volume Trends</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Track seasonal spikes and multi-year query popularity to time your marketing campaigns effectively.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. SECTION 3: Go keyword hunting and stock up on your keyword arsenal */}
        {/* ========================================================================= */}
        <div className="pt-2">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-4">
            Go keyword hunting and stock up on your keyword arsenal
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: 3 Interactive Feature Items matching user screenshot */}
            <div className="lg:col-span-5 space-y-4">
              <div
                onClick={() => setActiveImageTab(0)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeImageTab === 0
                    ? 'bg-[#F5F3FF] border-[#7C3AED] border-l-4 shadow-2xs text-gray-900 font-semibold'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <p className="text-xs leading-relaxed">
                  Keywords that are similar to the target keyword that often contain the analyzed search term.
                </p>
              </div>

              <div
                onClick={() => setActiveImageTab(1)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeImageTab === 1
                    ? 'bg-[#F5F3FF] border-[#7C3AED] border-l-4 shadow-2xs text-gray-900 font-semibold'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <p className="text-xs leading-relaxed">
                  Related keywords tied to the same high-ranking pages as the target keyword.
                </p>
              </div>

              <div
                onClick={() => setActiveImageTab(2)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeImageTab === 2
                    ? 'bg-[#F5F3FF] border-[#7C3AED] border-l-4 shadow-2xs text-gray-900 font-semibold'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <p className="text-xs leading-relaxed">
                  When picking keywords to target in search campaigns, you can immediately see who you&apos;ll be competing with in organic and paid search.
                </p>
              </div>
            </div>

            {/* Right Column: Real Interactive Data Table Diagram matching user screenshot */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              {/* Header Tabs matching user screenshot */}
              <div className="flex items-center gap-4 px-5 pt-3 border-b border-gray-100 text-xs font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setActiveImageTab(0)}
                  className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                    activeImageTab === 0
                      ? 'border-[#7C3AED] text-[#7C3AED]'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  SIMILAR
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageTab(1)}
                  className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                    activeImageTab === 1
                      ? 'border-[#7C3AED] text-[#7C3AED]'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  RELATED
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageTab(2)}
                  className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                    activeImageTab === 2
                      ? 'border-[#7C3AED] text-[#7C3AED]'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  LOW SEARCH VOLUME
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto p-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-gray-100 pb-2">
                      <th className="pb-2">KEYWORD</th>
                      <th className="pb-2 text-right">SEARCH VOLUME</th>
                      <th className="pb-2 text-center w-28">TREND</th>
                      <th className="pb-2 text-center w-28">SERP FEATURES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {section3Data[activeImageTab].map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-2.5 font-semibold text-gray-900 truncate max-w-[200px]">
                          {row.kw}
                        </td>
                        <td className="py-2.5 text-right font-medium text-gray-700">
                          {row.vol}
                        </td>
                        <td className="py-2.5 text-center">
                          {/* Sparkline Trend SVG */}
                          <div className="flex items-center justify-center">
                            <svg className="w-20 h-5" viewBox="0 0 100 25">
                              <polyline
                                fill="none"
                                stroke="#7C3AED"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={row.trend.map((pt, i) => `${(i * 100) / 7},${25 - (pt * 20) / 100}`).join(' ')}
                              />
                            </svg>
                          </div>
                        </td>
                        <td className="py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-gray-500">
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            <MapPin className="w-3.5 h-3.5 text-blue-500" />
                            <Link2 className="w-3.5 h-3.5 text-purple-500" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. BOTTOM CALL TO ACTION: Get all the data you need on any keyword */}
        {/* ========================================================================= */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200/90 p-8 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Get all the data you need on any keyword
          </h2>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-300 shadow-sm focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 transition-all p-1.5 flex flex-wrap sm:flex-nowrap items-center gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter keywords or drop a TXT/CSV file"
                className="flex-1 px-3 py-1 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
              />

              <div className="flex items-center gap-2 px-2 border-l border-gray-200 shrink-0">
                <GoogleLogo className="w-4 h-4 shrink-0" />
                <CountryFlag code={selectedCountry.code} size="sm" />
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!keywordInput.trim()}
                className="h-9 px-5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer uppercase tracking-wider"
              >
                <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>ANALYZE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KeywordResearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-gray-500">Loading Keyword Research...</div>}>
      <KeywordResearchContent />
    </Suspense>
  );
}
