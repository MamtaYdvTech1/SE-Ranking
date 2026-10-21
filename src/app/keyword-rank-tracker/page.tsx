'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Search,
  Zap,
  Globe2,
  BarChart3,
  Users,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Play,
  Layers,
  FileSearch,
  Building,
  Check,
  CreditCard,
  Bot,
  ExternalLink,
  Database,
  Code2,
  FileText,
  Megaphone,
  Radio,
  Target,
  Key,
  Globe,
  Award,
  Sliders,
  CheckSquare,
  MapPin,
  Briefcase,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  Lock,
  Headphones,
  UserCheck,
  FileCode2,
  X,
  Copy,
  Star,
  CheckCircle2,
  Menu,
  Smartphone,
  Laptop,
  HelpCircle,
  Plus,
  Filter,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { AgencyPartnerLogos } from '@/components/landing/AgencyPartnerLogos';

const mockRankTrackerData = [
  { keyword: 'seo audit tools', pos: 1, prev: 4, change: '+3', vol: '22.5K', serp: 'Featured Snippet', ai: true },
  { keyword: 'rank tracker software', pos: 2, prev: 3, change: '+1', vol: '18.1K', serp: 'AI Overview', ai: true },
  { keyword: 'keyword difficulty score', pos: 1, prev: 1, change: '0', vol: '9.4K', serp: 'People Also Ask', ai: false },
  { keyword: 'local seo geo grid', pos: 3, prev: 8, change: '+5', vol: '6.2K', serp: 'Local 3-Pack', ai: false },
  { keyword: 'b2b competitor search', pos: 2, prev: 6, change: '+4', vol: '12.8K', serp: 'Video Carousel', ai: true },
];

const mockMiniWave = [
  { day: '1', rank: 3 },
  { day: '2', rank: 2 },
  { day: '3', rank: 3 },
  { day: '4', rank: 2 },
  { day: '5', rank: 1 },
  { day: '6', rank: 2 },
  { day: '7', rank: 1 },
  { day: '8', rank: 1 },
];

export default function WebsiteRankTrackerPage() {
  const [showHelloBar, setShowHelloBar] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quick check form states
  const [checkType, setCheckType] = useState<'domain' | 'url'>('domain');
  const [domainInput, setDomainInput] = useState('');
  const [countryInput, setCountryInput] = useState('US');
  const [searchEngine, setSearchEngine] = useState('Google');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [checkResult, setCheckResult] = useState<any | null>(null);

  // Feature tabs
  const [activeTab, setActiveTab] = useState<'position' | 'competitors' | 'serp' | 'history'>('position');

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Billing toggle
  const [billingPeriod, setBillingPeriod] = useState<'annual' | 'monthly'>('annual');

  // Product tour modal
  const [isProductTourOpen, setIsProductTourOpen] = useState(false);

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    setCheckResult({
      domain: domainInput,
      avgRank: '#1.8',
      top3: 42,
      top10: 184,
      visibility: '88.2%',
    });
  };

  const faqs = [
    {
      q: 'What is a website rank tracker?',
      a: 'A website rank tracker is an SEO tool that monitors where your web pages appear in search engine results pages (SERPs) for specific keywords. SE Ranking checks rankings with 100% accuracy across 190+ countries, mobile and desktop devices, and local zip codes.',
    },
    {
      q: 'How accurate is SE Ranking’s keyword rank tracking data?',
      a: 'SE Ranking captures live SERP snapshots directly from Google, Bing, Yahoo, and YouTube without data sampling or caching approximations. You can verify every single position against a cached screenshot of the live search results page.',
    },
    {
      q: 'Can I track local and mobile rankings?',
      a: 'Yes. You can specify exact geographic coordinates, city boundaries, or postal codes down to neighborhood levels, and track how rankings differ between mobile smartphone searchers and desktop users.',
    },
    {
      q: 'How often are ranking positions updated?',
      a: 'Rankings are updated automatically on a daily basis. You can also trigger manual on-demand re-checks whenever you publish major content updates or algorithm shifts occur.',
    },
    {
      q: 'Can I track competitors’ keyword rankings?',
      a: 'Absolutely. You can add up to 20 direct competitor domains to each project and compare daily ranking movements, share-of-voice, and SERP feature ownership side-by-side.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. TOP PROMO BANNER */}
      {showHelloBar && (
        <div className="bg-[#10B981] text-white py-2 px-4 text-xs sm:text-sm font-medium flex items-center justify-between z-50 relative">
          <div className="flex-1 flex items-center justify-center gap-2 text-center">
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>
              Try our new <strong>AI Search Overview generator</strong> for free!
            </span>
            <Link href="/ai-results-tracker" className="underline font-bold hover:text-white/80 transition-colors ml-1">
              Get started →
            </Link>
          </div>
          <button onClick={() => setShowHelloBar(false)} className="text-white/80 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. OFFICIAL NAVBAR */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group">
              <SeRankingLogo variant="brand" width={130} height={32} />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-700">
              <div
                className="relative"
                onMouseEnter={() => setActiveMenu('product')}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className="flex items-center gap-1 py-4 text-[#0B69FF] font-bold cursor-pointer">
                  <span>Product</span>
                  <ChevronDown className="w-4 h-4 text-[#0B69FF]" />
                </button>
                {activeMenu === 'product' && (
                  <div className="absolute top-full left-0 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-3 grid gap-1 z-50">
                    <Link href="/keyword-rank-tracker" className="p-2.5 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center gap-3 font-bold text-xs">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0B69FF] flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <div>Keyword Rank Tracker</div>
                        <div className="text-[10px] text-blue-600 font-normal">Active Tool</div>
                      </div>
                    </Link>
                    <Link href="/keyword-tool" className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-800 flex items-center gap-3 text-xs">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">Keyword Tool</div>
                        <div className="text-[10px] text-gray-500">Search volume & difficulty</div>
                      </div>
                    </Link>
                    <Link href="/website-audit-tool" className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-800 flex items-center gap-3 text-xs">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <FileSearch className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">Website Audit</div>
                        <div className="text-[10px] text-gray-500">Technical health check</div>
                      </div>
                    </Link>
                    <Link href="/on-page-seo-checker" className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-800 flex items-center gap-3 text-xs">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">On-Page SEO Checker</div>
                        <div className="text-[10px] text-gray-500">Benchmark against SERP leaders</div>
                      </div>
                    </Link>
                    <Link href="/competitor-analysis-tool" className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-800 flex items-center gap-3 text-xs">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">Competitor Analysis Tool</div>
                        <div className="text-[10px] text-gray-500">Reverse engineer organic & paid traffic</div>
                      </div>
                    </Link>
                    <Link href="/backlink-checker" className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-800 flex items-center gap-3 text-xs">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">Backlink Checker</div>
                        <div className="text-[10px] text-gray-500">3.2T backlinks database</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <div
                className="relative"
                onMouseEnter={() => setActiveMenu('solutions')}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className="flex items-center gap-1 py-4 hover:text-[#0B69FF] transition-colors cursor-pointer">
                  <span>Solutions</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {activeMenu === 'solutions' && (
                  <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2.5 grid gap-1 z-50">
                    <Link href="/for-agencies" className="p-2 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-3 text-xs font-semibold">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>For Marketing Agencies</span>
                    </Link>
                    <Link href="/enterprise" className="p-2 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-3 text-xs font-semibold">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>Enterprises</span>
                    </Link>
                    <Link href="/growing-business" className="p-2 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-3 text-xs font-semibold">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>Growing Businesses</span>
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/enterprise" className="py-4 hover:text-[#0B69FF] transition-colors">
                Enterprise
              </Link>
              <Link href="/billing" className="py-4 hover:text-[#0B69FF] transition-colors">
                Pricing
              </Link>
              <Link href="/api-docs" className="py-4 hover:text-[#0B69FF] transition-colors">
                API
              </Link>
            </nav>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-[#0B69FF] px-3 py-2">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-[#0B69FF] hover:bg-[#0052cc] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-6 space-y-4">
            <Link href="/keyword-rank-tracker" className="block text-base font-bold text-[#0B69FF] py-2">
              Rank Tracker
            </Link>
            <Link href="/keyword-tool" className="block text-base font-medium text-gray-800 py-2">
              Keyword Tool
            </Link>
            <Link href="/for-agencies" className="block text-base font-medium text-gray-800 py-2">
              For Agencies
            </Link>
            <Link href="/enterprise" className="block text-base font-medium text-gray-800 py-2">
              Enterprise
            </Link>
            <Link href="/billing" className="block text-base font-medium text-gray-800 py-2">
              Pricing
            </Link>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section className="top-block container pt-12 sm:pt-16 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="se-title-text max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#0B69FF] text-xs font-bold mb-6 border border-blue-100">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Accurate Search Engine Position Monitoring</span>
          </div>

          <h1 className="se-title heading-1 text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.12] mb-6">
            Website Rank Tracker
          </h1>

          <p className="se-text se-text_regular se-text_hero text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Monitor search engine positions with 100% accurate data across all major search engines, locations, and devices.
          </p>
        </div>

        <div className="se-buttons-group flex flex-wrap items-center justify-center gap-4 mb-10">
          <Link
            href="/signup"
            className="px-8 py-3.5 rounded-full bg-[#0B69FF] hover:bg-[#0052cc] text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 group cursor-pointer"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            onClick={() => setIsProductTourOpen(true)}
            className="px-7 py-3.5 rounded-full border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 font-bold text-base transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-gray-800 text-gray-800" />
            <span>See product tour</span>
          </button>
        </div>

        {/* Live Mini Rank Trend Preview Widget from */}
        <div className="max-w-xl mx-auto mb-10 bg-white rounded-2xl p-4 shadow-xl border border-gray-200">
          <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Organic SERP Average: <strong className="text-emerald-600 text-sm">#1.4</strong>
            </span>
            <span className="text-gray-400">Total Tracked: 1,250</span>
          </div>

          <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockMiniWave}>
                <Line type="monotone" dataKey="rank" stroke="#0B69FF" strokeWidth={3} dot={{ r: 3, fill: '#0B69FF' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Check Form matching reference */}
        <div className="bg-[#F8FAFC] rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl max-w-4xl mx-auto mb-16 text-left">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setCheckType('domain')}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                checkType === 'domain' ? 'bg-[#0B69FF] text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Domain
            </button>
            <button
              onClick={() => setCheckType('url')}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                checkType === 'url' ? 'bg-[#0B69FF] text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Exact URL
            </button>
          </div>

          <form onSubmit={handleQuickCheck} className="grid sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-4">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="Enter domain (e.g. yoursite.com)"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#0B69FF] bg-white shadow-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <select
                value={countryInput}
                onChange={(e) => setCountryInput(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-gray-300 text-xs font-bold bg-white focus:outline-none focus:border-[#0B69FF]"
              >
                <option value="US">🇺🇸 United States</option>
                <option value="UK">🇬🇧 United Kingdom</option>
                <option value="DE">🇩🇪 Germany</option>
                <option value="FR">🇫🇷 France</option>
                <option value="JP">🇯🇵 Japan</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <select
                value={searchEngine}
                onChange={(e) => setSearchEngine(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-gray-300 text-xs font-bold bg-white focus:outline-none focus:border-[#0B69FF]"
              >
                <option value="Google">Google</option>
                <option value="Bing">Bing</option>
                <option value="Yahoo">Yahoo</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="flex rounded-xl bg-gray-200 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDevice('desktop')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 ${
                    device === 'desktop' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDevice('mobile')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 ${
                    device === 'mobile' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0B69FF] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md transition-all cursor-pointer text-center"
              >
                Check Rankings
              </button>
            </div>
          </form>

          {/* Quick Check Simulated Result */}
          {checkResult && (
            <div className="mt-6 p-4 rounded-2xl bg-white border border-blue-200 shadow-sm grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">Avg Rank</div>
                <div className="text-xl font-black text-emerald-600">{checkResult.avgRank}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">Top 3 Keywords</div>
                <div className="text-xl font-black text-gray-900">{checkResult.top3}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">Top 10 Keywords</div>
                <div className="text-xl font-black text-gray-900">{checkResult.top10}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">Search Visibility</div>
                <div className="text-xl font-black text-[#0B69FF]">{checkResult.visibility}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. SECTION 1: "All your search engine data in one central rank tracking suite" */}
      <section className="py-20 bg-gray-50/70 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              All your search engine data in one central rank tracking suite
            </h2>

            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {[
                { id: 'position', label: 'Position Tracking' },
                { id: 'competitors', label: 'Competitor Rankings' },
                { id: 'serp', label: 'SERP Features' },
                { id: 'history', label: 'Historical Progress' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Mockup Table (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-200 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-bold text-gray-900">Live Keyword Position Table</span>
                </div>
                <div className="flex gap-1.5 text-[11px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">Top 3: 42</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Top 10: 184</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 text-[11px]">
                    <tr>
                      <th className="p-3">Tracked Keyword</th>
                      <th className="p-3">Position</th>
                      <th className="p-3">Change</th>
                      <th className="p-3">Volume</th>
                      <th className="p-3">SERP Features</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mockRankTrackerData.map((row, i) => (
                      <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-3 font-semibold text-gray-900">{row.keyword}</td>
                        <td className="p-3 font-black text-gray-900">
                          <span className="w-6 h-6 rounded-full bg-blue-50 text-[#0B69FF] inline-flex items-center justify-center font-bold">
                            #{row.pos}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-emerald-600">{row.change}</td>
                        <td className="p-3 text-gray-600">{row.vol}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-medium">
                            {row.serp}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Feature Highlights (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-2xl font-black text-gray-900 leading-tight">
                Track positions across all search engines and locations
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Monitor Google, Bing, Yahoo, and YouTube rankings across 190+ countries down to precise city or postal code level with zero data sampling.
              </p>

              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Mobile vs desktop ranking breakdown with daily automated updates</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>SERP feature detection: AI Overviews, Featured Snippets, Local 3-Pack</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Historical position comparison and ranking drop alerts</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/projects"
                  className="px-7 py-3 rounded-full bg-[#0B69FF] hover:bg-[#0052cc] text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION 2: "Keep an eye on key SEO metrics beyond position data" */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Keep an eye on key SEO metrics beyond position data
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Transform raw ranking numbers into actionable business revenue indicators.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-[#F0F9FF] rounded-3xl p-8 border border-sky-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">SERP Features</h3>
                <p className="text-xs text-gray-700 leading-relaxed mb-6">
                  Track whether your website occupies Featured Snippets, Knowledge Panels, Video Carousels, or AI Overviews across target queries.
                </p>
              </div>
            </div>

            <div className="bg-[#F5F3FF] rounded-3xl p-8 border border-purple-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-6">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Search Visibility</h3>
                <p className="text-xs text-gray-700 leading-relaxed mb-6">
                  A comprehensive visibility index showing how prominently your brand appears to real searchers across all target keywords combined.
                </p>
              </div>
            </div>

            <div className="bg-[#F0FDF4] rounded-3xl p-8 border border-emerald-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Organic Traffic & CPC</h3>
                <p className="text-xs text-gray-700 leading-relaxed mb-6">
                  Estimate potential organic traffic and financial advertising equivalent value for every tracked position you gain.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-full bg-[#0B69FF] hover:bg-[#0052cc] text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Start free trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. SECTION 3: "How to use our Keyword Rank Tracker" */}
      <section className="py-24 bg-gray-50 border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              How to use our Keyword Rank Tracker
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Set up automated tracking in less than 3 minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0B69FF] font-black text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-2">Enter Domain or URL</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Add your main website domain or specific landing pages you want to monitor.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0B69FF] font-black text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-2">Select Regions & Engines</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Choose Google, Bing, Yahoo, or YouTube and select countries or exact postal codes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0B69FF] font-black text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-2">Add Your Keywords</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Paste keywords manually, import via CSV, or sync directly from Google Search Console.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-2">Get Daily Updates</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Receive automated daily rankings, historical graphs, and email drop notifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 4: Local 3-Pack & Geo-Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <MapPin className="w-3.5 h-3.5" />
                <span>Local 3-Pack & Google Maps</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                Dominate the Local 3-Pack and Maps
              </h2>

              <p className="text-sm text-gray-600 leading-relaxed">
                Track how your business ranks neighborhood by neighborhood. Identify where competitors outrank you and optimize your Google Business Profile to capture foot traffic.
              </p>

              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-center gap-2">✓ Multi-location Google Business Profile sync</li>
                <li className="flex items-center gap-2">✓ 3x3 to 15x15 Geo-Grid ranking heatmaps</li>
                <li className="flex items-center gap-2">✓ Local citation verification and review alerts</li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/local-marketing"
                  className="px-7 py-3 rounded-full bg-[#0B69FF] hover:bg-[#0052cc] text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
                >
                  <span>Explore Local Marketing</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Geo-Grid Heatmap Visual */}
            <div className="lg:col-span-6 bg-[#F8FAFC] p-6 rounded-3xl border border-gray-200 shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-4">
                <span>Geo-Grid Local Rank (Downtown Miami)</span>
                <span className="text-emerald-600 font-bold">Average Rank: #1.2</span>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {['#1', '#1', '#2', '#1', '#1', '#1', '#2', '#3', '#1'].map((pin, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-emerald-500 text-white font-black text-base flex items-center justify-center shadow-lg shadow-emerald-500/20"
                  >
                    {pin}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. MID-PAGE CTA BANNER */}
      <section className="py-20 bg-[#0B69FF] text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6">
            Experience rank tracking with clean and verified data you can trust
          </h2>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            Get instant access to real-time search engine rankings for your website today.
          </p>
          <Link
            href="/signup"
            className="px-8 py-3.5 rounded-full bg-white text-[#0B69FF] font-black text-base shadow-xl hover:bg-gray-50 transition-all inline-block cursor-pointer"
          >
            Start 14-day free trial
          </Link>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section className="py-24 bg-gray-50 border-t border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-gray-600">Everything you need to know about website rank tracking.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-gray-900 text-base hover:text-blue-600 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180 text-blue-600' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. OFFICIAL FOOTER */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Core SEO Tools</div>
              <ul className="space-y-2">
                <li><Link href="/keyword-rank-tracker" className="text-[#0B69FF] font-bold">Rank Tracker</Link></li>
                <li><Link href="/keyword-tool" className="hover:text-blue-600">Keyword Tool</Link></li>
                <li><Link href="/website-audit" className="hover:text-blue-600">Website Audit</Link></li>
                <li><Link href="/competitors" className="hover:text-blue-600">Competitor Research</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Solutions</div>
              <ul className="space-y-2">
                <li><Link href="/for-agencies" className="hover:text-blue-600">For Agencies</Link></li>
                <li><Link href="/enterprise" className="hover:text-blue-600">For Enterprises</Link></li>
                <li><Link href="/growing-business" className="hover:text-blue-600">For Small Business</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Resources</div>
              <ul className="space-y-2">
                <li><Link href="/api-docs" className="hover:text-blue-600">API Documentation</Link></li>
                <li><Link href="/help" className="hover:text-blue-600">Help Center</Link></li>
                <li><Link href="/whats-new" className="hover:text-blue-600">What's New</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Company</div>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:text-blue-600">About Us</Link></li>
                <li><Link href="/affiliate" className="hover:text-blue-600">Affiliate Program</Link></li>
                <li><Link href="/bonus-offers" className="hover:text-blue-600">Bonus Offers</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Features</div>
              <ul className="space-y-2">
                <li><Link href="/rankings" className="hover:text-blue-600">Daily Updates</Link></li>
                <li><Link href="/rankings" className="hover:text-blue-600">SERP Snapshots</Link></li>
                <li><Link href="/rankings" className="hover:text-blue-600">Mobile vs Desktop</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Mobile Apps</div>
              <div className="space-y-2">
                <a href="https://apps.apple.com" target="_blank" rel="noreferrer" className="block px-3 py-2 bg-gray-900 text-white rounded-lg font-semibold text-center">
                  App Store
                </a>
                <a href="https://play.google.com" target="_blank" rel="noreferrer" className="block px-3 py-2 bg-gray-900 text-white rounded-lg font-semibold text-center">
                  Google Play
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SeRankingLogo variant="dark" width={100} height={24} />
              <span>© {new Date().getFullYear()} SE Ranking Ltd. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
              <Link href="/terms" className="hover:underline">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* PRODUCT TOUR MODAL */}
      {isProductTourOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setIsProductTourOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-gray-900">Rank Tracker Product Tour</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Learn how SE Ranking captures 100% accurate daily search engine positions across 190+ countries, local 3-packs, and new AI Overviews with zero data approximations.
              </p>
              <div className="pt-4 flex justify-end gap-3">
                <button onClick={() => setIsProductTourOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs">
                  Close
                </button>
                <Link href="/signup" className="px-5 py-2 rounded-lg bg-[#0B69FF] text-white font-bold text-xs">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
