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

// Multi-line wave chart data matching reference screenshot
const mockEnterpriseTrend = [
  { month: 'Jan', pink: 72, green: 80, blue: 65, purple: 45 },
  { month: 'Feb', pink: 85, green: 88, blue: 72, purple: 52 },
  { month: 'Mar', pink: 78, green: 92, blue: 70, purple: 58 },
  { month: 'Apr', pink: 95, green: 96, blue: 85, purple: 66 },
  { month: 'May', pink: 88, green: 94, blue: 82, purple: 74 },
  { month: 'Jun', pink: 104, green: 110, blue: 95, purple: 88 },
  { month: 'Jul', pink: 98, green: 108, blue: 92, purple: 82 },
  { month: 'Aug', pink: 112, green: 118, blue: 102, purple: 94 },
];

export default function EnterprisePage() {
  const [showHelloBar, setShowHelloBar] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Section 1 tab switcher
  const [activeTab, setActiveTab] = useState<'tracking' | 'audit' | 'intelligence' | 'backlinks'>('tracking');

  // Testimonials index
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Billing toggle
  const [billingPeriod, setBillingPeriod] = useState<'annual' | 'monthly'>('annual');

  // Product tour modal
  const [isProductTourOpen, setIsProductTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const testimonials = [
    {
      quote:
        "We switched to SE Ranking's Enterprise plan and immediately cut our SaaS tool stack costs by 40%. The speed and depth of the API combined with dedicated account management give our team the exact enterprise capabilities we need to handle 200+ enterprise accounts seamlessly.",
      author: 'Adam Heitzman',
      role: 'Co-Founder & Managing Partner',
      company: 'HigherVisibility',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      quote:
        "Managing multi-regional domains across 32 countries was impossible with fragmented tools. SE Ranking's Looker Studio connector and automated API workflows give our executive leadership real-time visibility.",
      author: 'Elena Rostova',
      role: 'Director of Global SEO',
      company: 'OmniChannel Tech',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      quote:
        "The dedicated Customer Success Manager and SAML SSO integration made onboarding our 80-person marketing division frictionless. Enterprise SEO at its finest.",
      author: 'Marcus Vance',
      role: 'VP of Digital Marketing',
      company: 'Vanguard Media Group',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
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
            <Link
              href="/ai-results-tracker"
              className="underline font-bold hover:text-white/80 transition-colors ml-1"
            >
              Get started →
            </Link>
          </div>
          <button
            onClick={() => setShowHelloBar(false)}
            className="text-white/80 hover:text-white p-1 rounded transition-colors shrink-0"
            aria-label="Close announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. OFFICIAL SE RANKING NAVBAR */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group">
              <SeRankingLogo variant="brand" width={130} height={32} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-700">
              {/* Product */}
              <div
                className="relative"
                onMouseEnter={() => setActiveMenu('product')}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className="flex items-center gap-1 py-4 hover:text-[#0B69FF] transition-colors cursor-pointer">
                  <span>Product</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {activeMenu === 'product' && (
                  <div className="absolute top-full left-0 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-3 grid gap-1 z-50">
                    <Link href="/keyword-rank-tracker" className="p-2.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Keyword Rank Tracker</div>
                        <div className="text-[11px] text-gray-500">100% accurate daily ranking data</div>
                      </div>
                    </Link>
                    <Link href="/keyword-tool" className="p-2.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Keyword Tool</div>
                        <div className="text-[11px] text-gray-500">Discover high-intent keyword ideas</div>
                      </div>
                    </Link>
                    <Link href="/website-audit-tool" className="p-2.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <FileSearch className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Website Audit</div>
                        <div className="text-[11px] text-gray-500">Deep technical health checks</div>
                      </div>
                    </Link>
                    <Link href="/on-page-seo-checker" className="p-2.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">On-Page SEO Checker</div>
                        <div className="text-[11px] text-gray-500">Benchmark against SERP leaders</div>
                      </div>
                    </Link>
                    <Link href="/competitor-analysis-tool" className="p-2.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Competitor Analysis Tool</div>
                        <div className="text-[11px] text-gray-500">Reverse engineer organic & paid traffic</div>
                      </div>
                    </Link>
                    <Link href="/backlink-checker" className="p-2.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Backlink Checker</div>
                        <div className="text-[11px] text-gray-500">3.2T backlinks database</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Solutions */}
              <div
                className="relative"
                onMouseEnter={() => setActiveMenu('solutions')}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className="flex items-center gap-1 py-4 text-[#0B69FF] font-bold transition-colors cursor-pointer">
                  <span>Solutions</span>
                  <ChevronDown className="w-4 h-4 text-[#0B69FF]" />
                </button>
                {activeMenu === 'solutions' && (
                  <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-2.5 grid gap-1 z-50">
                    <Link
                      href="/for-agencies"
                      className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-3 text-xs font-semibold"
                    >
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>For Marketing Agencies</span>
                    </Link>
                    <Link
                      href="/enterprise"
                      className="p-2.5 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center gap-3 font-bold text-xs"
                    >
                      <Building className="w-4 h-4 text-[#0B69FF]" />
                      <span>Enterprises</span>
                      <span className="ml-auto text-[10px] bg-[#0B69FF] text-white px-1.5 py-0.5 rounded font-bold">Active</span>
                    </Link>
                    <Link
                      href="/growing-business"
                      className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-3 text-xs font-semibold"
                    >
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>Growing Businesses</span>
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/enterprise" className="py-4 text-[#0B69FF] font-bold">
                Enterprise
              </Link>
              <Link href="/billing" className="py-4 hover:text-[#0B69FF] transition-colors">
                Pricing
              </Link>
              <Link href="/api-docs" className="py-4 hover:text-[#0B69FF] transition-colors">
                API & Docs
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
            <Link href="/enterprise" className="block text-base font-bold text-[#0B69FF] py-2">
              Enterprise Suite
            </Link>
            <Link href="/for-agencies" className="block text-base font-medium text-gray-800 py-2">
              For Agencies
            </Link>
            <Link href="/growing-business" className="block text-base font-medium text-gray-800 py-2">
              Growing Businesses
            </Link>
            <Link href="/projects" className="block text-base font-medium text-gray-800 py-2">
              Projects
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
            <Building className="w-3.5 h-3.5" />
            <span>SE Ranking for Enterprise Organizations</span>
          </div>

          <h1 className="se-title heading-1 text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.12] mb-6">
            SE Ranking Enterprise: Where smart teams rank faster
          </h1>

          <p className="se-text se-text_regular se-text_hero text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            An industry-acclaimed SEO solution with custom data vending capacities, intelligent workflow automation, seamless data integration, and strategic insights.
          </p>
        </div>

        <div className="se-buttons-group flex flex-wrap items-center justify-center gap-4 mb-12 sm:mb-16">
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

        {/* Hero Image Container with floating stats badges */}
        <div className="relative max-w-5xl mx-auto mb-14">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200/80 bg-gradient-to-b from-gray-50 to-white">
            <img
              className="top-block__image w-full h-auto object-cover block"
              alt="SE Ranking Enterprise: Where smart teams rank faster"
              src="https://seranking.com/wp-content/uploads/sites/9/2025/03/enterprise-hero-2x.png"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://seranking.com/wp-content/uploads/sites/9/2025/03/seranking-for-agencies-2x.png';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating Badge 1: Website Health Score */}
          <div className="hidden sm:flex absolute -left-4 top-1/4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-gray-100 items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0B69FF] font-black text-sm flex items-center justify-center border-2 border-blue-500">
              86
            </div>
            <div className="text-left leading-tight">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Health Score</div>
              <div className="text-xs font-black text-gray-900">450K URLs Audited</div>
            </div>
          </div>

          {/* Floating Badge 2: Total Keywords */}
          <div className="hidden sm:flex absolute -right-4 top-1/3 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-gray-100 items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 font-black text-sm flex items-center justify-center border-2 border-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Keywords</div>
              <div className="text-xs font-black text-emerald-600">18,450 (+24%)</div>
            </div>
          </div>
        </div>

        {/* Partner Logos */}
        <AgencyPartnerLogos />
      </section>

      {/* 4. SECTION 1: "Grow your online presence with Enterprise-level SEO" */}
      <section className="py-20 bg-gray-50/70 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Grow your online presence with Enterprise-level SEO
            </h2>

            {/* Tab pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {[
                { id: 'tracking', label: 'Seamless Rank Tracking' },
                { id: 'audit', label: 'Website Audit' },
                { id: 'intelligence', label: 'Competitive Intelligence' },
                { id: 'backlinks', label: 'Backlink Analysis' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Split Layout */}
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Mockup: Multi-line chart (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-200 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-bold text-gray-900">Enterprise SERP Position Movements (Global)</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1 text-pink-500"><span className="w-2 h-2 rounded-full bg-pink-500" /> Google US</span>
                  <span className="flex items-center gap-1 text-emerald-500"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Google UK</span>
                  <span className="flex items-center gap-1 text-blue-500"><span className="w-2 h-2 rounded-full bg-blue-500" /> Google DE</span>
                  <span className="flex items-center gap-1 text-purple-500"><span className="w-2 h-2 rounded-full bg-purple-500" /> Google JP</span>
                </div>
              </div>

              {/* Multi-wave line chart matching screenshot */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockEnterpriseTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="pink" stroke="#EC4899" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="green" stroke="#10B981" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="blue" stroke="#0B69FF" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="purple" stroke="#8B5CF6" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center">
                <div className="p-2.5 rounded-lg bg-gray-50">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Avg. SERP Rank</div>
                  <div className="text-base font-black text-gray-900 mt-0.5">#2.1</div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-50">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Keywords in Top 3</div>
                  <div className="text-base font-black text-emerald-600 mt-0.5">4,820</div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-50">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">AI Overview Citations</div>
                  <div className="text-base font-black text-blue-600 mt-0.5">1,240</div>
                </div>
              </div>
            </div>

            {/* Right: Feature Description (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-2xl font-black text-gray-900 leading-tight">
                Seamless Rank Tracking
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Achieve real-time accuracy across global and local search engines with zero data sampling. Track millions of keywords with custom update intervals.
              </p>

              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Precision tracking across desktop, mobile, and multilingual regions</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Evaluate SERP features: AI Overviews, Local 3-Pack, Featured Snippets</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Monitor millions of keywords with custom update frequencies</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Historical SERP data snapshots and archive comparison</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Flexible segmentation by tags, target URL, and search intent</span>
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

      {/* 5. SECTION 2: "Unify SEO Data Across Your Entire Enterprise" */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Unify SEO Data Across Your Entire Enterprise
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Integrate verified search intelligence directly into your team's existing technology stack.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left 3 Checklist Items (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Check 1 */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 mb-1.5">API</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Access high-throughput endpoints to feed raw ranking, keyword, and backlink data directly into your internal data lakes, custom dashboards, and business intelligence systems.
                  </p>
                </div>
              </div>

              {/* Check 2 */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 mb-1.5">Data Studio (Looker Studio) Integration</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Connect SE Ranking directly to Looker Studio with native connectors to create interactive, dynamic reports for executives, stakeholders, and department heads.
                  </p>
                </div>
              </div>

              {/* Check 3 */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 mb-1.5">Automated SEO Reporting</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Prepare customized, white-label client and internal reports that dispatch automatically on schedule via email or secure live links with custom domain mapping.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/api-docs"
                  className="font-bold text-[#0B69FF] hover:underline flex items-center gap-1.5 text-sm"
                >
                  <span>Explore SE Ranking API</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Code / Data Studio Mockup (6 cols) */}
            <div className="lg:col-span-6 bg-[#0F172A] rounded-2xl p-6 border border-slate-700 shadow-2xl text-white font-mono text-xs overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>GET /v1/enterprise/rankings</span>
                </div>
                <span className="text-[11px] text-emerald-400">200 OK • 42ms</span>
              </div>

              <pre className="text-slate-300 leading-relaxed overflow-x-auto">
{`{
  "status": "success",
  "enterprise_account": "OmniGlobal Corp",
  "project_id": 98201,
  "tracked_domains": 45,
  "daily_quota": 500000,
  "metrics": {
    "organic_keywords_total": 482910,
    "top_3_positions": 34120,
    "ai_overview_citations": 8420,
    "average_position": 2.8
  },
  "looker_studio_sync": "active",
  "data_retention_years": 5
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 3: "Built for Enterprise Teams" */}
      <section className="py-24 bg-gray-50 border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Built for Enterprise Teams
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Tailored workflows, dedicated support, and enterprise-grade data security.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Card 1: Team Collaboration (Light Blue #E0F2FE) */}
            <div className="bg-[#F0F9FF] rounded-3xl p-8 border border-sky-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Team Collaboration</h3>
                <p className="text-xs text-gray-700 leading-relaxed mb-6">
                  Equip every department with tailored access. Granular user roles, shared workspaces, and team seats so your entire marketing division stays aligned.
                </p>

                <ul className="space-y-2.5 text-xs text-gray-800 font-medium">
                  <li className="flex items-center gap-2">✓ Dedicated user workspaces</li>
                  <li className="flex items-center gap-2">✓ Granular permissions & access control</li>
                  <li className="flex items-center gap-2">✓ Unlimited team seats on enterprise contracts</li>
                </ul>
              </div>
            </div>

            {/* Card 2: Customer Success Support (Light Purple/Blue #EDE9FE) */}
            <div className="bg-[#F5F3FF] rounded-3xl p-8 border border-purple-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-6">
                  <Headphones className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Customer Success Support</h3>
                <p className="text-xs text-gray-700 leading-relaxed mb-6">
                  A personal Customer Success Manager to assist with onboarding, custom query setup, technical training, and priority SLA resolution.
                </p>

                <ul className="space-y-2.5 text-xs text-gray-800 font-medium">
                  <li className="flex items-center gap-2">✓ Dedicated account manager & onboarding</li>
                  <li className="flex items-center gap-2">✓ Custom team training & workshops</li>
                  <li className="flex items-center gap-2">✓ Priority 24/7 dedicated chat & phone support</li>
                </ul>
              </div>
            </div>

            {/* Card 3: Governance & Control (Light Green #DCFCE7) */}
            <div className="bg-[#F0FDF4] rounded-3xl p-8 border border-emerald-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Governance & Control</h3>
                <p className="text-xs text-gray-700 leading-relaxed mb-6">
                  Ensure full enterprise security, SOC 2 compliance standards, SAML 2.0 Single Sign-On (SSO), and customized data retention policies.
                </p>

                <ul className="space-y-2.5 text-xs text-gray-800 font-medium">
                  <li className="flex items-center gap-2">✓ Single Sign-On (SSO / SAML 2.0)</li>
                  <li className="flex items-center gap-2">✓ Enterprise SLA & uptime guarantees (99.9%)</li>
                  <li className="flex items-center gap-2">✓ Flexible payment terms: Wire, Net 30, Annual invoicing</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom rating banner */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center shadow-sm max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <div className="font-bold text-gray-900 text-sm">Highly rated by large teams running SEO at scale</div>
              <div className="text-xs text-gray-500">Recognized as G2 Enterprise Leader across Rank Tracking & SEO Software</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">G2 Leader 2026</span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs">SOC 2 Type II</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 4: "Why Enterprises from 150+ Countries Choose Us" */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Why Enterprises from 150+ Countries Choose Us
            </h2>
          </div>

          <div className="bg-[#F8FAFC] rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm relative">
            <div className="text-5xl text-blue-500 font-serif leading-none mb-4 select-none">“</div>
            <p className="text-lg sm:text-2xl text-gray-800 font-medium leading-relaxed mb-8">
              {testimonials[activeTestimonial].quote}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <img
                  src={testimonials[activeTestimonial].avatar}
                  alt={testimonials[activeTestimonial].author}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <div className="font-bold text-gray-900 text-base">{testimonials[activeTestimonial].author}</div>
                  <div className="text-xs text-gray-500">
                    {testimonials[activeTestimonial].role}, <strong className="text-gray-700">{testimonials[activeTestimonial].company}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-700 hover:border-gray-500 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-700 hover:border-gray-500 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION 5: "Scalable pricing built for large SEO teams" */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Scalable pricing built for large SEO teams
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8">
              Unlock enterprise data limits, dedicated management, and custom integrations.
            </p>

            <div className="inline-flex items-center p-1 rounded-full bg-white border border-gray-200 shadow-sm gap-2">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  billingPeriod === 'monthly' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingPeriod === 'annual' ? 'bg-[#0B69FF] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>Annual</span>
                <span className="bg-emerald-400 text-emerald-950 text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Pro Plan */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-[#0B69FF] uppercase tracking-wider mb-2">Pro</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-gray-900">
                    ${billingPeriod === 'annual' ? '103.20' : '129.00'}
                  </span>
                  <span className="text-xs text-gray-500 font-semibold">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-gray-600 border-t border-gray-100 pt-6 mb-8">
                  <li className="flex items-center gap-2">✓ Unlimited projects</li>
                  <li className="flex items-center gap-2">✓ 2,000 tracked keywords</li>
                  <li className="flex items-center gap-2">✓ 3 team manager seats</li>
                  <li className="flex items-center gap-2">✓ Historical data archive</li>
                </ul>
              </div>

              <Link
                href="/signup?plan=pro"
                className="w-full py-3 rounded-full bg-[#0B69FF] hover:bg-[#0052cc] text-white font-bold text-xs text-center shadow-md transition-all cursor-pointer"
              >
                Start free trial
              </Link>
            </div>

            {/* Business Plan (Highlighted) */}
            <div className="bg-white rounded-3xl p-8 border-2 border-[#0B69FF] shadow-xl relative flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-[#0B69FF] uppercase tracking-wider mb-2">Business</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-gray-900">
                    ${billingPeriod === 'annual' ? '239.20' : '299.00'}
                  </span>
                  <span className="text-xs text-gray-500 font-semibold">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-gray-700 border-t border-gray-100 pt-6 mb-8 font-medium">
                  <li className="flex items-center gap-2 font-bold text-gray-900">✓ Unlimited projects</li>
                  <li className="flex items-center gap-2 font-bold text-gray-900">✓ 5,000 tracked keywords</li>
                  <li className="flex items-center gap-2">✓ 10 team seats</li>
                  <li className="flex items-center gap-2">✓ Full White Label Suite included</li>
                  <li className="flex items-center gap-2">✓ Dedicated REST API access</li>
                </ul>
              </div>

              <Link
                href="/signup?plan=business"
                className="w-full py-3 rounded-full bg-[#0B69FF] hover:bg-[#0052cc] text-white font-bold text-xs text-center shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                Start free trial
              </Link>
            </div>
          </div>

          {/* Add-on Row matching screenshot */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-4xl mx-auto">
            <div className="text-center font-bold text-sm text-gray-900 mb-6">
              Need More Limits? Upgrade with Add-Ons
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="text-[11px] text-gray-500 font-bold uppercase">Agency Pack</div>
                <div className="text-lg font-black text-gray-900 mt-1">$69.00 /mo</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="text-[11px] text-gray-500 font-bold uppercase">AI Writer</div>
                <div className="text-lg font-black text-gray-900 mt-1">$71.20 /mo</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="text-[11px] text-gray-500 font-bold uppercase">API</div>
                <div className="text-lg font-black text-gray-900 mt-1">$149.00 /mo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Core SEO Tools</div>
              <ul className="space-y-2">
                <li><Link href="/rankings" className="hover:text-blue-600">Rank Tracker</Link></li>
                <li><Link href="/website-audit" className="hover:text-blue-600">Website Audit</Link></li>
                <li><Link href="/competitors" className="hover:text-blue-600">Competitor Research</Link></li>
                <li><Link href="/research" className="hover:text-blue-600">Keyword Research</Link></li>
                <li><Link href="/backlinks" className="hover:text-blue-600">Backlink Checker</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Solutions</div>
              <ul className="space-y-2">
                <li><Link href="/for-agencies" className="hover:text-blue-600">For Agencies</Link></li>
                <li><Link href="/enterprise" className="text-[#0B69FF] font-bold">For Enterprises</Link></li>
                <li><Link href="/growing-business" className="hover:text-blue-600">For Small Business</Link></li>
                <li><Link href="/agency-pack" className="hover:text-blue-600">White Label Suite</Link></li>
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
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Enterprise</div>
              <ul className="space-y-2">
                <li><Link href="/enterprise" className="hover:text-blue-600">Custom Volume</Link></li>
                <li><Link href="/enterprise" className="hover:text-blue-600">SAML SSO</Link></li>
                <li><Link href="/enterprise" className="hover:text-blue-600">SLA Guarantees</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Mobile Apps</div>
              <div className="space-y-2">
                <a
                  href="https://apps.apple.com/app/se-ranking-pro/id1455209351"
                  target="_blank"
                  rel="noreferrer"
                  className="block px-3 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition-colors text-center"
                >
                  App Store
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.seranking.pro"
                  target="_blank"
                  rel="noreferrer"
                  className="block px-3 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition-colors text-center"
                >
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
              <span className="text-gray-400">|</span>
              <span className="font-bold text-gray-700">English (US)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* PRODUCT TOUR MODAL */}
      {isProductTourOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setIsProductTourOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0B69FF] uppercase tracking-wider">
                <span>SE Ranking Enterprise Tour</span>
                <span>•</span>
                <span>Step {tourStep + 1} of 3</span>
              </div>

              {tourStep === 0 && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">1. High-Throughput REST API & Data Pipelines</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    Connect enterprise databases, data lakes, and custom BI reports directly to SE Ranking endpoints. Get real-time SERP updates without rate-limit bottlenecks.
                  </p>
                </div>
              )}

              {tourStep === 1 && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">2. Native Google Looker Studio Connectors</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    Build executive-level dashboards with zero custom code. Blend organic traffic, revenue data, and keyword positions seamlessly.
                  </p>
                </div>
              )}

              {tourStep === 2 && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">3. SSO & Enterprise Security Governance</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    SAML 2.0 Single Sign-On (Okta, Azure AD, Google Workspace), SOC 2 compliance, and dedicated Customer Success Manager with priority SLA.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  disabled={tourStep === 0}
                  onClick={() => setTourStep((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-bold disabled:opacity-40"
                >
                  Previous
                </button>

                {tourStep < 2 ? (
                  <button
                    onClick={() => setTourStep((prev) => prev + 1)}
                    className="px-5 py-2 rounded-lg bg-[#0B69FF] text-white text-xs font-bold"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => setIsProductTourOpen(false)}
                    className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                  >
                    Close Tour
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
