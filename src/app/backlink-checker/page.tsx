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
  DollarSign,
  Link2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

// Mock backlink growth history
const mockBacklinkGrowth = [
  { month: 'Jan', newLinks: 1420, lostLinks: 310 },
  { month: 'Feb', newLinks: 1850, lostLinks: 420 },
  { month: 'Mar', newLinks: 2100, lostLinks: 380 },
  { month: 'Apr', newLinks: 2450, lostLinks: 510 },
  { month: 'May', newLinks: 2890, lostLinks: 490 },
  { month: 'Jun', newLinks: 3240, lostLinks: 450 },
];

export default function BacklinkCheckerPage() {
  const [showHelloBar, setShowHelloBar] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search input state
  const [targetUrl, setTargetUrl] = useState('seranking.com');
  const [crawlScope, setCrawlScope] = useState<'domain' | 'exact'>('domain');
  const [activeCheckedDomain, setActiveCheckedDomain] = useState('seranking.com');

  // Sub tab switcher
  const [activeTab, setActiveTab] = useState<'overview' | 'domains' | 'anchors' | 'gap'>('overview');

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Product tour modal
  const [isProductTourOpen, setIsProductTourOpen] = useState(false);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;
    setActiveCheckedDomain(targetUrl);
  };

  const faqs = [
    {
      q: 'How does SE Ranking’s Backlink Checker work?',
      a: 'SE Ranking crawls and indexes the entire web in real time with our high-speed bot network. We maintain a database of 3.2+ trillion backlinks and 300+ million domains, giving you instant insights into referring domains, anchor texts, dofollow vs nofollow attributes, and historical link velocity.',
    },
    {
      q: 'What is Domain Trust and Page Trust?',
      a: 'Domain Trust (DT) and Page Trust (PT) are proprietary SE Ranking metrics from 0 to 100 that predict how likely a website or specific URL is to rank high on Google based on the quantity and quality of high-authority referring domains.',
    },
    {
      q: 'Can I find and disavow toxic spam backlinks?',
      a: 'Yes. Backlink Checker evaluates every incoming link for spam markers, unnatural link networks, and toxic referring domains. You can easily generate a ready-to-upload Google Disavow text file in a single click.',
    },
    {
      q: 'Can I see competitor backlink gaps?',
      a: 'With Backlink Gap analysis, you can compare your backlink profile against up to 5 competitors. The tool highlights the high-authority websites linking to your competitors that are not yet linking to you, revealing prime outreach targets.',
    },
    {
      q: 'How frequently is the backlink index updated?',
      a: 'Our index is continuously updated 24/7. New links and lost links are identified and indexed daily, ensuring your backlink monitoring and link-building campaigns reflect the freshest data.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Top Hello Bar matching official SE Ranking announcement */}
      {showHelloBar && (
        <div className="bg-[#00B074] text-white text-xs sm:text-sm font-semibold py-2 px-4 flex items-center justify-between text-center relative z-50">
          <div className="flex-1 flex items-center justify-center gap-2">
            <span>🚀 Explore 3.2 Trillion indexed backlinks with SE Ranking!</span>
            <Link
              href="/signup"
              className="underline font-bold hover:text-white/90 transition-colors ml-1"
            >
              Start 14-day free trial
            </Link>
          </div>
          <button
            onClick={() => setShowHelloBar(false)}
            aria-label="Close banner"
            className="text-white/80 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Official SE Ranking Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Left: Brand Logo & Main Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <SeRankingLogo variant="dark" width={138} height={30} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 text-[14px] font-medium text-gray-800">
              {/* Solutions Dropdown */}
              <div
                className="relative py-5"
                onMouseEnter={() => setActiveMenu('solutions')}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  type="button"
                  className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                    activeMenu === 'solutions' ? 'text-[#0B69FF]' : 'hover:text-[#0B69FF]'
                  }`}
                >
                  <span>Solutions</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {activeMenu === 'solutions' && (
                  <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50">
                    <Link
                      href="/for-agencies"
                      className="p-2 rounded-lg hover:bg-gray-50 flex items-center gap-3 text-xs font-semibold text-gray-700"
                    >
                      <Target className="w-4 h-4 text-[#0B69FF]" />
                      <span>For Agencies</span>
                    </Link>
                    <Link
                      href="/enterprise"
                      className="p-2 rounded-lg hover:bg-gray-50 flex items-center gap-3 text-xs font-semibold text-gray-700"
                    >
                      <Building className="w-4 h-4 text-[#0B69FF]" />
                      <span>Enterprise</span>
                    </Link>
                    <Link
                      href="/growing-business"
                      className="p-2 rounded-lg hover:bg-gray-50 flex items-center gap-3 text-xs font-semibold text-gray-700"
                    >
                      <TrendingUp className="w-4 h-4 text-[#0B69FF]" />
                      <span>Growing Business</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Tools Dropdown */}
              <div
                className="relative py-5"
                onMouseEnter={() => setActiveMenu('tools')}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  type="button"
                  className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                    activeMenu === 'tools' ? 'text-[#0B69FF]' : 'hover:text-[#0B69FF]'
                  }`}
                >
                  <span className="text-[#0B69FF]">Tools</span>
                  <ChevronDown className="w-4 h-4 text-[#0B69FF]" />
                </button>
                {activeMenu === 'tools' && (
                  <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50">
                    <Link
                      href="/keyword-rank-tracker"
                      className="p-2.5 rounded-lg hover:bg-blue-50/60 flex items-center gap-3 text-xs font-semibold text-gray-700 hover:text-[#0B69FF]"
                    >
                      <BarChart3 className="w-4 h-4 text-[#0B69FF]" />
                      <span>Rank Tracker</span>
                    </Link>
                    <Link
                      href="/keyword-tool"
                      className="p-2.5 rounded-lg hover:bg-blue-50/60 flex items-center gap-3 text-xs font-semibold text-gray-700 hover:text-[#0B69FF]"
                    >
                      <Key className="w-4 h-4 text-[#0B69FF]" />
                      <span>Keyword Tool</span>
                    </Link>
                    <Link
                      href="/website-audit-tool"
                      className="p-2.5 rounded-lg hover:bg-blue-50/60 flex items-center gap-3 text-xs font-semibold text-gray-700 hover:text-[#0B69FF]"
                    >
                      <FileSearch className="w-4 h-4 text-[#0B69FF]" />
                      <span>Website Audit</span>
                    </Link>
                    <Link
                      href="/on-page-seo-checker"
                      className="p-2.5 rounded-lg hover:bg-blue-50/60 flex items-center gap-3 text-xs font-semibold text-gray-700 hover:text-[#0B69FF]"
                    >
                      <Search className="w-4 h-4 text-[#0B69FF]" />
                      <span>On-Page SEO Checker</span>
                    </Link>
                    <Link
                      href="/competitor-analysis-tool"
                      className="p-2.5 rounded-lg hover:bg-blue-50/60 flex items-center gap-3 text-xs font-semibold text-gray-700 hover:text-[#0B69FF]"
                    >
                      <Target className="w-4 h-4 text-[#0B69FF]" />
                      <span>Competitor Analysis Tool</span>
                    </Link>
                    <Link
                      href="/backlink-checker"
                      className="p-2.5 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center gap-3 text-xs font-bold"
                    >
                      <Globe className="w-4 h-4 text-[#0B69FF]" />
                      <span>Backlink Checker</span>
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/billing" className="font-semibold text-gray-700 hover:text-[#0B69FF] transition-colors">
                Pricing
              </Link>
              <Link href="/enterprise" className="font-semibold text-gray-700 hover:text-[#0B69FF] transition-colors">
                Enterprise
              </Link>
              <Link href="/help" className="font-semibold text-gray-700 hover:text-[#0B69FF] transition-colors">
                Resources
              </Link>
            </nav>
          </div>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-700 hover:text-[#0B69FF] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-[#0B69FF] hover:bg-blue-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <span>Start free trial</span>
            </Link>
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3">
            <Link href="/keyword-rank-tracker" className="block text-base font-medium text-gray-800 py-2">
              Rank Tracker
            </Link>
            <Link href="/keyword-tool" className="block text-base font-medium text-gray-800 py-2">
              Keyword Tool
            </Link>
            <Link href="/website-audit-tool" className="block text-base font-medium text-gray-800 py-2">
              Website Audit
            </Link>
            <Link href="/competitor-analysis-tool" className="block text-base font-medium text-gray-800 py-2">
              Competitor Analysis Tool
            </Link>
            <Link href="/backlink-checker" className="block text-base font-bold text-[#0B69FF] py-2">
              Backlink Checker
            </Link>
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center py-2.5 border border-gray-300 rounded-xl font-bold text-gray-700"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="w-full text-center py-2.5 bg-[#0B69FF] text-white rounded-xl font-bold"
              >
                Start free trial
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION - Exact Match to Screenshot */}
      <section className="pt-16 pb-14 bg-gradient-to-b from-blue-50/40 via-white to-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0f172a] tracking-tight leading-[1.12]">
            Backlink Checker
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-normal">
            Check backlink profiles for any domain or URL. Discover linking domains, anchor texts, backlink growth trends, and evaluate link quality.
          </p>

          {/* Interactive Search Bar with Scope Selector */}
          <div className="mt-8 max-w-2xl mx-auto bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl border border-gray-200/80">
            <form onSubmit={handleCheck} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2 w-full">
                <Globe className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="Enter domain or URL e.g. seranking.com"
                  className="w-full bg-transparent text-sm sm:text-base font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>

              {/* Scope selector */}
              <div className="flex items-center gap-1.5 px-3 py-2 border-t sm:border-t-0 sm:border-l border-gray-200 shrink-0 w-full sm:w-auto">
                <select
                  value={crawlScope}
                  onChange={(e) => setCrawlScope(e.target.value as any)}
                  className="text-xs font-bold text-gray-800 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="domain">Entire domain</option>
                  <option value="exact">Exact URL</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#0B69FF] hover:bg-blue-600 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Check backlinks</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Trust Metrics & Database Counter */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-16 pt-8 border-t border-gray-100 text-gray-600 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {'★'.repeat(5)}
              </div>
              <span className="text-gray-900 font-bold">4.8</span>
              <span className="text-gray-500">on G2</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#0B69FF]" />
              <span className="text-gray-900 font-bold">3.2 Trillion</span>
              <span className="text-gray-500">Live indexed links</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="text-gray-900 font-bold">300M+</span>
              <span className="text-gray-500">Domains indexed</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION 2: BACKLINK PROFILE DASHBOARD MOCKUP */}
      <section className="py-20 bg-gray-50/60 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Deep-dive backlink analysis for any website or URL
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Evaluate link authority, anchor text profiles, toxicity flags, and referring domain quality.
            </p>
          </div>

          {/* Main Simulator Card */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xl overflow-hidden p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B69FF] flex items-center justify-center font-bold">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span>{activeCheckedDomain}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold">
                      Domain Trust: 78
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">Crawled scope: {crawlScope === 'domain' ? 'Root domain' : 'Exact URL'}</p>
                </div>
              </div>

              {/* Sub tabs */}
              <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl text-xs font-bold">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'domains', label: 'Referring Domains' },
                  { id: 'anchors', label: 'Anchor Texts' },
                  { id: 'gap', label: 'Backlink Gap' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === t.id
                        ? 'bg-white text-[#0B69FF] shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3 Highlight Purple/Blue Stat Cards matching screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md">
                <div className="text-xs font-semibold text-purple-100 uppercase tracking-wider">Total Backlinks</div>
                <div className="text-3xl font-black mt-1">4,820,000</div>
                <div className="text-xs text-purple-200 mt-2 flex items-center gap-2">
                  <span className="bg-white/20 px-2 py-0.5 rounded font-bold">82% Dofollow</span>
                  <span>18% Nofollow</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0f172a] text-white shadow-md">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Referring Domains</div>
                <div className="text-3xl font-black mt-1">32,400</div>
                <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+1,240 new domains this month</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#0B69FF] text-white shadow-md">
                <div className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Domain Trust (DT)</div>
                <div className="text-3xl font-black mt-1">78 / 100</div>
                <div className="text-xs text-blue-100 mt-2">
                  Top 5% authority in business & tech niche
                </div>
              </div>
            </div>

            {/* Backlink Growth Line Chart */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-900">
                  New vs Lost Backlinks Acquisition Trend
                </h4>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-[#0B69FF]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0B69FF]" />
                    New Backlinks
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-rose-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Lost Backlinks
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockBacklinkGrowth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip />
                    <Bar dataKey="newLinks" fill="#0B69FF" radius={[4, 4, 0, 0]} name="New Backlinks" />
                    <Bar dataKey="lostLinks" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Lost Backlinks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Anchor Texts Breakdown */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Top Anchor Texts Distribution
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-xs font-bold text-gray-900 truncate">&ldquo;se ranking&rdquo;</div>
                  <div className="text-lg font-black text-gray-900 mt-1">45%</div>
                  <div className="text-[11px] text-gray-500">Brand anchor (Safe)</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-xs font-bold text-gray-900 truncate">&ldquo;seranking.com&rdquo;</div>
                  <div className="text-lg font-black text-gray-900 mt-1">28%</div>
                  <div className="text-[11px] text-gray-500">Naked URL (Safe)</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-xs font-bold text-gray-900 truncate">&ldquo;seo platform&rdquo;</div>
                  <div className="text-lg font-black text-gray-900 mt-1">14%</div>
                  <div className="text-[11px] text-gray-500">Exact match query</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-xs font-bold text-gray-900 truncate">&ldquo;learn more / visit&rdquo;</div>
                  <div className="text-lg font-black text-gray-900 mt-1">13%</div>
                  <div className="text-[11px] text-gray-500">Generic anchors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION 3: 4 Core Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Powerful link intelligence to build high-authority links
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Everything you need to analyze link profiles, find new outreach opportunities, and audit toxicity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B69FF] flex items-center justify-center mb-5 font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Referring Domains Analysis</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Inspect every domain linking to your website. Check Domain Trust scores, unique C-block IPs, dofollow percentages, and target landing pages.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-purple-50/40 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-5 font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Anchor Text Profile & Ratios</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ensure your anchor text ratios look natural to Google algorithms. Prevent over-optimization penalties with clear categorizations for branded, naked, and commercial anchors.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-rose-50/40 border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-5 font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Toxic Links & Disavow Tool</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Protect your domain from negative SEO attacks and spammy link schemes. Automatically identify low-quality link networks and generate disavow lists.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 font-bold">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Competitor Backlink Gap</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Discover the high-DA websites linking to 2 or more of your top competitors, but not to you. Fast-track your link-building outreach with proven targets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 4: MID-PAGE CTA BANNER */}
      <section className="py-16 bg-[#0B69FF] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Check any backlink profile for free in seconds
          </h2>
          <p className="mt-3 text-base text-blue-100 max-w-xl mx-auto">
            Access 3.2+ trillion indexed links and build a stronger, more resilient backlink profile.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-[#0B69FF] hover:bg-gray-100 font-extrabold text-base rounded-xl shadow-lg transition-all"
            >
              Start 14-day free trial
            </Link>
            <button
              onClick={() => setIsProductTourOpen(true)}
              className="px-6 py-4 bg-blue-700/80 hover:bg-blue-700 text-white font-bold text-base rounded-xl border border-blue-400/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>See product tour</span>
            </button>
          </div>
        </div>
      </section>

      {/* 7. SECTION 5: FAQ ACCORDION */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Common questions about SE Ranking Backlink Checker.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-gray-900 text-sm sm:text-base hover:text-[#0B69FF] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isOpen ? 'rotate-180 text-[#0B69FF]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-white border-t border-gray-200 text-gray-600 text-xs py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div>
            <div className="mb-4">
              <SeRankingLogo variant="dark" width={130} height={28} />
            </div>
            <p className="text-gray-500 leading-relaxed">
              All-in-one SEO and digital marketing platform built for agencies, enterprises, and growing businesses.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 text-sm">Tools</h5>
            <ul className="space-y-2">
              <li><Link href="/keyword-rank-tracker" className="hover:text-blue-600">Rank Tracker</Link></li>
              <li><Link href="/keyword-tool" className="hover:text-blue-600">Keyword Tool</Link></li>
              <li><Link href="/website-audit-tool" className="hover:text-blue-600">Website Audit</Link></li>
              <li><Link href="/on-page-seo-checker" className="hover:text-blue-600">On-Page SEO Checker</Link></li>
              <li><Link href="/competitor-analysis-tool" className="hover:text-blue-600">Competitor Analysis Tool</Link></li>
              <li><Link href="/backlink-checker" className="text-[#0B69FF] font-bold">Backlink Checker</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 text-sm">Solutions</h5>
            <ul className="space-y-2">
              <li><Link href="/for-agencies" className="hover:text-blue-600">For Agencies</Link></li>
              <li><Link href="/enterprise" className="hover:text-blue-600">Enterprise</Link></li>
              <li><Link href="/growing-business" className="hover:text-blue-600">Growing Business</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 text-sm">Company</h5>
            <ul className="space-y-2">
              <li><Link href="/help" className="hover:text-blue-600">About Us</Link></li>
              <li><Link href="/affiliate" className="hover:text-blue-600">Affiliate Program</Link></li>
              <li><Link href="/billing" className="hover:text-blue-600">Pricing</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 text-sm">Community</h5>
            <div className="flex gap-3 text-gray-400 mb-3">
              <span className="hover:text-[#0B69FF] cursor-pointer">Twitter</span>
              <span className="hover:text-[#0B69FF] cursor-pointer">LinkedIn</span>
              <span className="hover:text-[#0B69FF] cursor-pointer">YouTube</span>
            </div>
            <p className="text-[11px] text-gray-400">
              © {new Date().getFullYear()} SE Ranking. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Product Tour Modal */}
      {isProductTourOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setIsProductTourOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0B69FF] mx-auto flex items-center justify-center mb-4">
                <Link2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Backlink Checker Tour</h3>
              <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                Explore how SE Ranking lets you monitor link acquisition velocity, audit toxic domains, and identify competitor backlink gaps.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/signup"
                  className="px-6 py-2.5 bg-[#0B69FF] text-white font-bold rounded-xl text-sm hover:bg-blue-600"
                >
                  Start live trial
                </Link>
                <button
                  onClick={() => setIsProductTourOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 font-bold rounded-xl text-sm hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
