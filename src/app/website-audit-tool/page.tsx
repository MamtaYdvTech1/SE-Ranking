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
  AlertTriangle,
  AlertOctagon,
  Info,
  ShieldCheck,
  Gauge,
  Clock,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

// Mock crawl history trend
const mockCrawlHistory = [
  { crawl: 'Audit #1 (Jan)', score: 71, errors: 42, warnings: 85 },
  { crawl: 'Audit #2 (Feb)', score: 76, errors: 31, warnings: 68 },
  { crawl: 'Audit #3 (Mar)', score: 81, errors: 22, warnings: 52 },
  { crawl: 'Audit #4 (Apr)', score: 84, errors: 16, warnings: 38 },
  { crawl: 'Audit #5 (May)', score: 88, errors: 12, warnings: 24 },
];

export default function WebsiteAuditToolPage() {
  const [showHelloBar, setShowHelloBar] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search input state
  const [auditDomain, setAuditDomain] = useState('seranking.com');
  const [activeAuditedDomain, setActiveAuditedDomain] = useState('seranking.com');

  // Sub tab switcher for audit dashboard mockup
  const [activeTab, setActiveTab] = useState<'overview' | 'crawled' | 'issues' | 'vitals' | 'changes'>('overview');

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Product tour modal
  const [isProductTourOpen, setIsProductTourOpen] = useState(false);

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditDomain.trim()) return;
    setActiveAuditedDomain(auditDomain);
  };

  const faqs = [
    {
      q: 'How does SE Ranking’s Website Audit tool work?',
      a: 'Our high-speed cloud crawler inspects every accessible page of your website just like a search engine bot. It evaluates more than 110 technical SEO checkpoints, including crawlability, HTTP status codes, meta tags, Core Web Vitals, internal link architecture, images, and security protocols.',
    },
    {
      q: 'How often should I run an audit on my website?',
      a: 'We recommend scheduling automated weekly or bi-weekly audits. Whenever you publish new content, update plugins, or migrate code, running an on-demand audit ensures you catch any broken links, redirect loops, or 404 errors before search engine crawlers index them.',
    },
    {
      q: 'Can I audit staging environments or password-protected websites?',
      a: 'Yes! SE Ranking allows you to audit password-protected websites using HTTP Basic Authentication or by specifying custom cookies and user-agent headers in the audit crawl settings.',
    },
    {
      q: 'Does the tool check Core Web Vitals (LCP, FID, CLS)?',
      a: 'Absolutely. Website Audit integrates with Google Lighthouse and Chrome User Experience Report (CrUX) APIs to report real-world Core Web Vitals, First Input Delay (FID), Largest Contentful Paint (LCP), and Cumulative Layout Shift (CLS) for both mobile and desktop views.',
    },
    {
      q: 'Can agencies download white-label PDF audit reports for clients?',
      a: 'Yes. You can generate custom-branded PDF reports featuring your agency logo, color palette, and bespoke domain name. You can also schedule automated email dispatches directly to your clients.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Top Hello Bar matching official SE Ranking announcement */}
      {showHelloBar && (
        <div className="bg-[#00B074] text-white text-xs sm:text-sm font-semibold py-2 px-4 flex items-center justify-between text-center relative z-50">
          <div className="flex-1 flex items-center justify-center gap-2">
            <span>🚀 Get started with technical website audits for free today!</span>
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
                      className="p-2.5 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center gap-3 text-xs font-bold"
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
                      className="p-2.5 rounded-lg hover:bg-blue-50/60 flex items-center gap-3 text-xs font-semibold text-gray-700 hover:text-[#0B69FF]"
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
            <Link href="/website-audit-tool" className="block text-base font-bold text-[#0B69FF] py-2">
              Website Audit
            </Link>
            <Link href="/competitor-analysis-tool" className="block text-base font-medium text-gray-800 py-2">
              Competitor Analysis Tool
            </Link>
            <Link href="/backlink-checker" className="block text-base font-medium text-gray-800 py-2">
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
            Website Audit
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-normal">
            Run an in-depth website audit to find technical SEO errors, optimize site speed, indexation, and user experience to improve rankings.
          </p>

          {/* Interactive Domain Audit Input Form */}
          <div className="mt-8 max-w-2xl mx-auto bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl border border-gray-200/80">
            <form onSubmit={handleAudit} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2 w-full">
                <Globe className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={auditDomain}
                  onChange={(e) => setAuditDomain(e.target.value)}
                  placeholder="Enter domain e.g. seranking.com"
                  className="w-full bg-transparent text-sm sm:text-base font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#0B69FF] hover:bg-blue-600 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Audit now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-4 text-xs text-gray-500 flex items-center justify-center gap-3">
            <span>Free crawl limit: 100 pages</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>No credit card required</span>
          </div>

          {/* Trust Metrics */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-16 pt-8 border-t border-gray-100 text-gray-600 text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {'★'.repeat(5)}
              </div>
              <span className="text-gray-900 font-bold">4.8</span>
              <span className="text-gray-500">on G2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {'★'.repeat(5)}
              </div>
              <span className="text-gray-900 font-bold">4.9</span>
              <span className="text-gray-500">on Capterra</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0B69FF]" />
              <span className="text-gray-900 font-bold">1,200,000+</span>
              <span className="text-gray-500">Global SEO users</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION 2: "Get a full picture of your website’s technical SEO health" */}
      <section className="py-20 bg-gray-50/60 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Get a full picture of your website’s technical SEO health
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Quickly detect and fix technical issues holding back your site from ranking at the top of Google.
            </p>
          </div>

          {/* Side-by-side interactive Dashboard Card */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Health Score & Menu tabs */}
            <div className="lg:col-span-4 bg-gradient-to-b from-gray-50/80 to-white p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-gray-200/70 flex flex-col justify-between">
              <div>
                {/* Health Score Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-bold mb-5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Audit Completed: {activeAuditedDomain}</span>
                </div>

                {/* Big Score Radial/Number */}
                <div className="flex items-center gap-5">
                  <div className="relative w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500">
                    <span className="text-3xl font-black text-emerald-600">88</span>
                    <span className="absolute bottom-2 text-[10px] font-bold text-gray-500">/100</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-snug">Website Health Score</h3>
                    <p className="text-xs text-gray-500 mt-1">Excellent condition. 12 critical errors require immediate attention.</p>
                  </div>
                </div>

                {/* Quick stats grid */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-100">
                  <div className="bg-white p-3 rounded-xl border border-gray-200/60 shadow-xs">
                    <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Crawled Pages</div>
                    <div className="text-lg font-bold text-gray-900 mt-0.5">1,420</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200/60 shadow-xs">
                    <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Passed Checks</div>
                    <div className="text-lg font-bold text-emerald-600 mt-0.5">94%</div>
                  </div>
                </div>

                {/* Sub Tab buttons matching screenshot */}
                <div className="mt-8 space-y-1.5">
                  {[
                    { id: 'overview', label: 'Audit Overview', icon: FileSearch },
                    { id: 'crawled', label: 'Crawled Pages (1,420)', icon: Layers },
                    { id: 'issues', label: 'Issue Report (84 items)', icon: AlertOctagon },
                    { id: 'vitals', label: 'Core Web Vitals', icon: Gauge },
                    { id: 'changes', label: 'Page Changes Monitor', icon: RefreshCw },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-[#0B69FF] text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                          <span>{tab.label}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-gray-300'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6">
                <button
                  onClick={() => setIsProductTourOpen(true)}
                  className="w-full py-2.5 px-4 bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-[#0B69FF]" />
                  <span>Interactive product tour</span>
                </button>
              </div>
            </div>

            {/* Right Column: Dynamic Mockup Content */}
            <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                {/* Header status bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">Breakdown by Severity</span>
                    <span className="text-xs text-gray-400">Target: {activeAuditedDomain}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      12 Errors
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      24 Warnings
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      48 Notices
                    </span>
                  </div>
                </div>

                {/* Category Progress Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-gray-700">Crawlability & Indexing</span>
                      <span className="text-emerald-600 font-extrabold">96%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96%' }} />
                    </div>
                    <div className="mt-2 text-[11px] text-gray-500 flex justify-between">
                      <span>Robots.txt: Valid</span>
                      <span>Sitemap: 1,420 URLs</span>
                    </div>
                  </div>

                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-gray-700">Pages & Status Codes</span>
                      <span className="text-emerald-600 font-extrabold">91%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '91%' }} />
                    </div>
                    <div className="mt-2 text-[11px] text-gray-500 flex justify-between">
                      <span>200 OK: 1,388</span>
                      <span className="text-rose-500 font-semibold">404 Errors: 8</span>
                    </div>
                  </div>

                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-gray-700">Meta Tags & Content</span>
                      <span className="text-amber-600 font-extrabold">84%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '84%' }} />
                    </div>
                    <div className="mt-2 text-[11px] text-gray-500 flex justify-between">
                      <span>Duplicate Titles: 14</span>
                      <span>Missing H1: 6</span>
                    </div>
                  </div>

                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-gray-700">Core Web Vitals & Speed</span>
                      <span className="text-blue-600 font-extrabold">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: '87%' }} />
                    </div>
                    <div className="mt-2 text-[11px] text-gray-500 flex justify-between">
                      <span>LCP: 1.8s (Good)</span>
                      <span>CLS: 0.04 (Good)</span>
                    </div>
                  </div>
                </div>

                {/* Top Critical Issues Table */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Priority Issues to Fix
                    </h4>
                    <span className="text-xs text-[#0B69FF] font-semibold cursor-pointer hover:underline">
                      Export to CSV / PDF
                    </span>
                  </div>

                  <div className="border border-gray-200/80 rounded-xl overflow-hidden divide-y divide-gray-100 text-xs">
                    <div className="p-3 bg-white hover:bg-gray-50/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900">Duplicate Title Tags found</p>
                          <p className="text-[11px] text-gray-500">Affects localized blog templates & categories</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">14 pages</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="p-3 bg-white hover:bg-gray-50/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900">Broken internal links (404 Not Found)</p>
                          <p className="text-[11px] text-gray-500">Dead link references inside footer and docs navigation</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">8 pages</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="p-3 bg-white hover:bg-gray-50/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900">Missing Meta Descriptions</p>
                          <p className="text-[11px] text-gray-500">Search engines will auto-generate snippets from body text</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">22 pages</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="p-3 bg-white hover:bg-gray-50/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900">Images missing ALT attributes</p>
                          <p className="text-[11px] text-gray-500">Decreases image search accessibility and Google Image rankings</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">35 images</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Ready to test with your own website?
                </span>
                <Link
                  href="/signup"
                  className="px-5 py-2 bg-[#0B69FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Crawl your website for free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION 3: "Technical SEO audit in 100+ checks" - 6 Card Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Technical SEO audit in 100+ checks
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Everything you need to crawl, diagnose, and fix site-wide issues across all devices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1 */}
            <div className="p-7 rounded-2xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B69FF] flex items-center justify-center mb-5 font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Crawlability & Indexing</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ensure search engines can access and index every valuable page. Identify robots.txt blocks, noindex directives, broken sitemaps, and orphan pages.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-7 rounded-2xl bg-blue-50/50 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-5 font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Status Codes & Redirects</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Find 404 broken pages, 500 server errors, 301/302 redirects, and redirect loops or chains that drain your crawl budget and harm user experience.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-7 rounded-2xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Meta Tags & Content Quality</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Detect duplicate or missing title tags, meta descriptions, missing H1 headings, and thin body content that fails search intent guidelines.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-7 rounded-2xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 font-bold">
                <Gauge className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Performance & Core Web Vitals</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Measure LCP, FID, CLS, TTFB, and server response times. Pinpoint render-blocking scripts, uncompressed images, and CSS issues slowing down users.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-7 rounded-2xl bg-blue-50/50 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#0B69FF] text-white flex items-center justify-center mb-5 font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Internal Linking Architecture</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Analyze link depth, internal PageRank distribution, and dead anchor texts. Ensure crucial high-conversion landing pages are reachable in 3 clicks.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-7 rounded-2xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Security & Mobile Usability</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Validate SSL/HTTPS certificates, find mixed content vulnerabilities, and detect non-responsive elements that fail Google’s Mobile-First index.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 4: DEEP DIVE SHOWCASE (3 Alternating Rows matching screenshot) */}
      <section className="py-20 bg-gray-50/60 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {/* Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-md">
              <div className="bg-[#0f172a] text-white p-4 rounded-2xl font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-gray-400 pb-2 border-b border-gray-800">
                  <span>Issue Diagnostic Console</span>
                  <span className="text-emerald-400">Status: Complete</span>
                </div>
                <div className="text-rose-400">✗ [Critical Error]: 404 Not Found at /pricing/enterprise-quote</div>
                <div className="text-amber-400">▲ [Warning]: Duplicate meta description on 14 product URLs</div>
                <div className="text-blue-400">ℹ [Notice]: 12 images over 350KB could be converted to WebP</div>
                <div className="text-gray-400 pt-2 border-t border-gray-800">Crawl completed in 38.4 seconds • 1,420 URLs</div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="inline-block text-xs font-bold uppercase tracking-wider text-[#0B69FF] bg-blue-50 px-3 py-1 rounded-full mb-3">
                Actionable Fix Guides
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                Detect SEO issues before they impact your rankings
              </h3>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                Every detected issue comes with clear, step-by-step instructions on why it matters for SEO and exactly how your developers or content team can fix it immediately.
              </p>
              <div className="mt-6">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#0B69FF] hover:underline"
                >
                  <span>Explore full list of checks</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="inline-block text-xs font-bold uppercase tracking-wider text-[#0B69FF] bg-blue-50 px-3 py-1 rounded-full mb-3">
                Crawl Tree & Depth
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                Analyze page crawlability and verify indexation status
              </h3>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                View your website structure through the eyes of a search bot. Filter by click depth (1 to 5 levels), canonical status, and HTTP responses to eliminate deep orphan pages.
              </p>
              <div className="mt-6">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#0B69FF] hover:underline"
                >
                  <span>Learn about crawl depth analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>Click Depth Distribution</span>
                  <span>1,420 total pages</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-gray-600 mb-1">
                      <span>Level 1 (Homepage)</span>
                      <span className="font-bold">1 URL</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#0B69FF] h-full" style={{ width: '4%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-gray-600 mb-1">
                      <span>Level 2 (Main categories)</span>
                      <span className="font-bold">84 URLs</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#0B69FF] h-full" style={{ width: '38%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-gray-600 mb-1">
                      <span>Level 3 (Articles & Products)</span>
                      <span className="font-bold">1,120 URLs</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#0B69FF] h-full" style={{ width: '82%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-rose-600 mb-1">
                      <span>Level 4+ (Too deep)</span>
                      <span className="font-bold">215 URLs</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: '22%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-md">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <div className="text-[11px] font-bold text-gray-500">LCP</div>
                  <div className="text-xl font-black text-emerald-600 mt-1">1.6s</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Good (&lt;2.5s)</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <div className="text-[11px] font-bold text-gray-500">INP</div>
                  <div className="text-xl font-black text-emerald-600 mt-1">120ms</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Good (&lt;200ms)</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <div className="text-[11px] font-bold text-gray-500">CLS</div>
                  <div className="text-xl font-black text-emerald-600 mt-1">0.03</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Good (&lt;0.1)</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="inline-block text-xs font-bold uppercase tracking-wider text-[#0B69FF] bg-blue-50 px-3 py-1 rounded-full mb-3">
                Speed & User Experience
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                Check Core Web Vitals and optimize page speed
              </h3>
              <p className="mt-4 text-base text-gray-600 leading-relaxed">
                Direct integration with Google PageSpeed Insights provides immediate recommendations for reducing render-blocking resources, compressing heavy scripts, and boosting real-user experience scores.
              </p>
              <div className="mt-6">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#0B69FF] hover:underline"
                >
                  <span>Test Core Web Vitals</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 5: HISTORICAL AUDIT COMPARISON */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Full overview of website crawl results & history
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Track how your technical SEO health improves over time across automated weekly crawls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Previous Audit Card */}
            <div className="bg-rose-50/40 border border-rose-100 rounded-3xl p-6 sm:p-8">
              <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">Previous Audit (30 Days Ago)</div>
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-4xl font-black text-rose-600">74</span>
                <span className="text-sm font-semibold text-gray-500">/ 100 Health Score</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>38 Critical technical errors</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>62 High-priority warnings</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  <span>1,240 Indexed URLs</span>
                </li>
              </ul>
            </div>

            {/* Current Audit Card */}
            <div className="bg-emerald-50/50 border border-emerald-200/90 rounded-3xl p-6 sm:p-8 relative">
              <span className="absolute top-6 right-6 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                +14 pts Improvement
              </span>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Current Audit (Today)</div>
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-4xl font-black text-emerald-600">88</span>
                <span className="text-sm font-semibold text-gray-500">/ 100 Health Score</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-gray-800">
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Only 12 Errors remaining (-26 fixed)</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>24 Warnings (-38 resolved)</span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1,352 Indexed URLs (+112 new pages indexed)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. MID-PAGE CTA BANNER */}
      <section className="py-16 bg-[#0B69FF] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Start your website audit now and uncover technical SEO errors in minutes
          </h2>
          <p className="mt-3 text-base text-blue-100 max-w-xl mx-auto">
            Test your domain with 100+ technical SEO checks. Fix critical issues and protect your search traffic.
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

      {/* 9. TESTIMONIAL SECTION */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xl text-[#0B69FF]">
                LM
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-base">Laura Miller</h4>
                <p className="text-xs text-gray-500">Head of Technical SEO at Elevate Digital Agency</p>
              </div>
            </div>
            <blockquote className="text-base sm:text-lg text-gray-700 leading-relaxed italic">
              “SE Ranking’s Website Audit tool has completely streamlined our client onboarding. We can crawl 500,000+ client URLs every week with automated alerts. During one major e-commerce migration, it caught a 404 redirect loop within hours, saving our client over $120,000 in lost organic revenue.”
            </blockquote>
          </div>
        </div>
      </section>

      {/* 10. PRICING TIERS PREVIEW */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Flexible Website Audit pricing for all team sizes
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Every plan includes weekly automated crawls, Core Web Vitals checks, and white-label reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Essential */}
            <div className="p-7 rounded-3xl bg-white border border-gray-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Essential</h3>
                <p className="text-xs text-gray-500 mt-1">For freelancers and solo site owners</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">$65</span>
                  <span className="text-xs font-semibold text-gray-500">/ month</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-xs text-gray-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B69FF]" />
                    <span>40,000 pages audited / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B69FF]" />
                    <span>10 websites monitored</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B69FF]" />
                    <span>Full Core Web Vitals analysis</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="mt-8 block text-center py-3 border border-[#0B69FF] text-[#0B69FF] hover:bg-blue-50 font-bold rounded-xl text-xs transition-colors"
              >
                Start free trial
              </Link>
            </div>

            {/* Pro - Featured */}
            <div className="p-7 rounded-3xl bg-[#0f172a] text-white shadow-xl border-2 border-[#0B69FF] relative flex flex-col justify-between">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0B69FF] text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-full">
                Most Popular
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Pro</h3>
                <p className="text-xs text-gray-400 mt-1">For growing marketing teams & agencies</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$119</span>
                  <span className="text-xs font-semibold text-gray-400">/ month</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B69FF]" />
                    <span>250,000 pages audited / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B69FF]" />
                    <span>Unlimited websites</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B69FF]" />
                    <span>Automated weekly crawl schedule</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B69FF]" />
                    <span>White-label PDF reports</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="mt-8 block text-center py-3 bg-[#0B69FF] hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Start free trial
              </Link>
            </div>

            {/* Business */}
            <div className="p-7 rounded-3xl bg-white border border-gray-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Business</h3>
                <p className="text-xs text-gray-500 mt-1">For large enterprise sites and high-volume agencies</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">$239</span>
                  <span className="text-xs font-semibold text-gray-500">/ month</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-xs text-gray-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B69FF]" />
                    <span>700,000 pages audited / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B69FF]" />
                    <span>API access & Custom crawl speed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B69FF]" />
                    <span>Staging & basic auth support</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="mt-8 block text-center py-3 border border-[#0B69FF] text-[#0B69FF] hover:bg-blue-50 font-bold rounded-xl text-xs transition-colors"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ ACCORDION SECTION */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Everything you need to know about SE Ranking Website Audit.
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

      {/* 12. OFFICIAL FOOTER */}
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
              <li><Link href="/website-audit-tool" className="text-[#0B69FF] font-bold">Website Audit</Link></li>
              <li><Link href="/on-page-seo-checker" className="hover:text-blue-600">On-Page SEO Checker</Link></li>
              <li><Link href="/competitor-analysis-tool" className="hover:text-blue-600">Competitor Analysis Tool</Link></li>
              <li><Link href="/backlink-checker" className="hover:text-blue-600">Backlink Checker</Link></li>
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
                <FileSearch className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">SE Ranking Website Audit Tour</h3>
              <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                Explore how SE Ranking crawls and scores your entire website in under 2 minutes.
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
