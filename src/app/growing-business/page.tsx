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
  Lightbulb,
  Compass,
} from 'lucide-react';
import {
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

const mockRankTable = [
  { keyword: 'artisan coffee roasters', rank: 1, change: '+4', volume: '14.2K', audit: 'Good' },
  { keyword: 'organic bakery delivery', rank: 2, change: '+6', volume: '8.9K', audit: 'Good' },
  { keyword: 'local boutique gift shop', rank: 1, change: '+1', volume: '6.1K', audit: 'Optimal' },
  { keyword: 'custom handcrafted watches', rank: 3, change: '+8', volume: '11.5K', audit: 'Good' },
];

export default function GrowingBusinessPage() {
  const [showHelloBar, setShowHelloBar] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Section 2 tool tab
  const [activeToolTab, setActiveToolTab] = useState<'rankings' | 'audit' | 'onpage' | 'competitors' | 'keywords'>('rankings');

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
        "We are constantly researching keywords and competitor stats on SE Ranking. It’s easy for us to understand as a growing business without an in-house SEO specialist. We've tripled our organic sales without paying for expensive agency fees.",
      author: 'Eric V. Heenskerk',
      role: 'Founder',
      company: 'Heenskerk Watches',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    {
      quote:
        "The step-by-step Marketing Plan gave our small team a clear checklist. Within 4 months of fixing on-page issues, our local store traffic jumped from page 4 to Google Maps #1.",
      author: 'Camila Rodriguez',
      role: 'Co-Owner',
      company: 'Verde Organics',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    {
      quote:
        "SE Ranking gives us enterprise-grade data at a price a bootstrap company can actually afford. Our search visibility has grown 6x year-over-year.",
      author: 'David Thorne',
      role: 'Marketing Director',
      company: 'Japan Ski Experience',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
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
                      className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-3 text-xs font-semibold"
                    >
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>Enterprises</span>
                    </Link>
                    <Link
                      href="/growing-business"
                      className="p-2.5 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center gap-3 font-bold text-xs"
                    >
                      <Users className="w-4 h-4 text-[#0B69FF]" />
                      <span>Growing Businesses</span>
                      <span className="ml-auto text-[10px] bg-[#0B69FF] text-white px-1.5 py-0.5 rounded font-bold">Active</span>
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/billing" className="py-4 hover:text-[#0B69FF] transition-colors">
                Pricing
              </Link>
              <Link href="/marketing-plan" className="py-4 hover:text-[#0B69FF] transition-colors">
                SEO Guide
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
            <Link href="/growing-business" className="block text-base font-bold text-[#0B69FF] py-2">
              Small & Mid-Sized Business
            </Link>
            <Link href="/for-agencies" className="block text-base font-medium text-gray-800 py-2">
              For Agencies
            </Link>
            <Link href="/enterprise" className="block text-base font-medium text-gray-800 py-2">
              Enterprises
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
            <Users className="w-3.5 h-3.5" />
            <span>Built for Small & Growing Businesses</span>
          </div>

          <h1 className="se-title heading-1 text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.12] mb-6">
            Smart SEO solutions for small and mid-sized businesses
          </h1>

          <p className="se-text se-text_regular se-text_hero text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Cut out the complexity and grow your business with easy-to-use SEO tools, actionable guidance, and reliable metrics.
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
              alt="Smart SEO solutions for small and mid-sized businesses"
              src="https://seranking.com/wp-content/uploads/sites/9/2025/03/smb-hero-2x.png"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://seranking.com/wp-content/uploads/sites/9/2025/03/seranking-for-agencies-2x.png';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating Badge 1: SEO Health 85 */}
          <div className="hidden sm:flex absolute -left-4 top-1/4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-gray-100 items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 font-black text-sm flex items-center justify-center border-2 border-emerald-500">
              85
            </div>
            <div className="text-left leading-tight">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">SEO Health</div>
              <div className="text-xs font-black text-gray-900">0 Critical Errors</div>
            </div>
          </div>

          {/* Floating Badge 2: Keywords in Top 10 */}
          <div className="hidden sm:flex absolute -right-4 top-1/3 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-gray-100 items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0B69FF] font-black text-sm flex items-center justify-center border-2 border-blue-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Keywords Top 10</div>
              <div className="text-xs font-black text-emerald-600">24 (+6 this week)</div>
            </div>
          </div>
        </div>

        {/* Partner Logos */}
        <AgencyPartnerLogos />
      </section>

      {/* 4. SECTION 1: "Take control of your SEO and drive results that stick" (2x2 Grid) */}
      <section className="py-20 bg-gray-50/70 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Take control of your SEO and drive results that stick
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Clear steps, reliable data, and measurable growth without the steep learning curve
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Card 1: Do more with less */}
            <div className="bg-[#F0F9FF] rounded-3xl p-8 border border-sky-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-sky-200/80 text-sky-800 flex items-center justify-center mb-4 font-bold text-sm">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Do more with less</h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-6">
                  Get all the essential SEO tools in one affordable platform without juggling costly subscriptions or complex dashboards.
                </p>
              </div>
              <Link href="/projects" className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
                <span>Explore core tools</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Get SEO clarity */}
            <div className="bg-[#F0F9FF] rounded-3xl p-8 border border-sky-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-sky-200/80 text-sky-800 flex items-center justify-center mb-4 font-bold text-sm">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Get SEO clarity</h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-6">
                  Follow step-by-step marketing plans and prioritized tasks that tell you exactly what to fix and how to rank higher on Google.
                </p>
              </div>
              <Link href="/marketing-plan" className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
                <span>View Marketing Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3: Track your progress */}
            <div className="bg-[#F0FDF4] rounded-3xl p-8 border border-emerald-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-emerald-200/80 text-emerald-800 flex items-center justify-center mb-4 font-bold text-sm">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Track your progress</h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-6">
                  See how your keywords rank across local and national search engines. Celebrate wins and spot ranking drops immediately.
                </p>
              </div>
              <Link href="/rankings" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
                <span>See Rank Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4: Grow local presence */}
            <div className="bg-[#F5F3FF] rounded-3xl p-8 border border-purple-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-full bg-purple-200/80 text-purple-800 flex items-center justify-center mb-4 font-bold text-sm">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Grow local presence</h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-6">
                  Attract nearby customers searching on Google Maps and local search. Keep business listings accurate and monitor customer reviews.
                </p>
              </div>
              <Link href="/local-marketing" className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1">
                <span>Explore Local Marketing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* G2 Small Business Awards Row */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="text-left">
              <div className="font-bold text-gray-900 text-sm">Top-rated by small and mid-sized businesses</div>
              <div className="text-xs text-gray-500">Rated #1 Easiest to Use on G2 with 4.8 / 5 stars</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-blue-50 text-blue-700 font-bold text-xs">Easiest to Use</span>
              <span className="px-3 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-xs">Best Support</span>
              <span className="px-3 py-1 rounded bg-amber-50 text-amber-700 font-bold text-xs">Users Love Us</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION 2: "Get powerful SEO tools backed by reliable data and make better business decisions" */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Get powerful SEO tools backed by reliable data and make better business decisions
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Everything you need to compete with bigger brands without an enterprise budget.
            </p>

            {/* Tab Pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {[
                { id: 'rankings', label: 'Rankings & AI Results Tracker' },
                { id: 'audit', label: 'Website Audit' },
                { id: 'onpage', label: 'On-Page SEO Checker' },
                { id: 'competitors', label: 'Competitor Research' },
                { id: 'keywords', label: 'Keyword Research' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveToolTab(t.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeToolTab === t.id
                      ? 'bg-gray-900 text-white shadow-sm'
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
            <div className="lg:col-span-7 bg-[#F8FAFC] border border-gray-200 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#0B69FF]" />
                  <span className="text-xs font-bold text-gray-900">Tracked Search Keywords (Local Market)</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600">All Keywords in Top 3</span>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 text-[11px]">
                    <tr>
                      <th className="p-3">Target Keyword</th>
                      <th className="p-3">Google Rank</th>
                      <th className="p-3">Weekly Change</th>
                      <th className="p-3">Search Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mockRankTable.map((row, i) => (
                      <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-3 font-semibold text-gray-900">{row.keyword}</td>
                        <td className="p-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-bold inline-flex items-center justify-center">
                            #{row.rank}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-emerald-600">{row.change}</td>
                        <td className="p-3 text-gray-600">{row.volume}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                <span>Updated daily with 100% Google SERP snapshots</span>
                <Link href="/rankings" className="font-bold text-[#0B69FF] hover:underline">
                  Open Rank Tracker →
                </Link>
              </div>
            </div>

            {/* Right Checklist (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">Rankings & AI Results Tracker</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Track where your website ranks on Google for the terms your customers actually type. Spot whether your brand appears in new AI Overviews.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">Website Audit</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Automatically scan your website for broken links, slow loading pages, mobile issues, and indexation errors with clear fix recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">On-Page SEO Checker</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Get concrete recommendations on how to optimize page titles, meta descriptions, headings, and keyword density to outrank competitors.
                  </p>
                </div>
              </div>

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

      {/* 6. SECTION 3: "Why we’re the top choice for small and mid-sized businesses from 150+ countries" */}
      <section className="py-24 bg-gray-50 border-t border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Why we’re the top choice for small and mid-sized businesses from 150+ countries
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm relative">
            <div className="text-5xl text-blue-500 font-serif leading-none mb-4 select-none">“</div>
            <p className="text-lg sm:text-2xl text-gray-800 font-medium leading-relaxed mb-8">
              {testimonials[activeTestimonial].quote}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
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

      {/* 7. SECTION 4: "Flexible pricing to help your business thrive" */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Flexible pricing to help your business thrive
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8">
              Transparent pricing that scales as you grow. Cancel or change plans anytime.
            </p>

            <div className="inline-flex items-center p-1 rounded-full bg-gray-100 border border-gray-200 shadow-sm gap-2">
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
                  <li className="flex items-center gap-2">✓ 2,000 tracked keywords</li>
                  <li className="flex items-center gap-2">✓ Daily ranking updates</li>
                  <li className="flex items-center gap-2">✓ Website Audit (150K pages)</li>
                  <li className="flex items-center gap-2">✓ 3 user accounts</li>
                </ul>
              </div>

              <Link
                href="/signup?plan=pro"
                className="w-full py-3 rounded-full bg-[#0B69FF] hover:bg-[#0052cc] text-white font-bold text-xs text-center shadow-md transition-all cursor-pointer"
              >
                Choose Pro
              </Link>
            </div>

            {/* Business Plan */}
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
                  <li className="flex items-center gap-2 font-bold text-gray-900">✓ 5,000 tracked keywords</li>
                  <li className="flex items-center gap-2">✓ Unlimited projects</li>
                  <li className="flex items-center gap-2">✓ 10 team user accounts</li>
                  <li className="flex items-center gap-2">✓ White-label client reporting</li>
                  <li className="flex items-center gap-2">✓ Full API access</li>
                </ul>
              </div>

              <Link
                href="/signup?plan=business"
                className="w-full py-3 rounded-full bg-[#0B69FF] hover:bg-[#0052cc] text-white font-bold text-xs text-center shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                Choose Business
              </Link>
            </div>
          </div>

          {/* Add-on Row */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 max-w-4xl mx-auto">
            <div className="text-center font-bold text-sm text-gray-900 mb-6">
              Need More? Upgrade with Add-ons
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="text-[11px] text-gray-500 font-bold uppercase">Agency Pack</div>
                <div className="text-lg font-black text-gray-900 mt-1">$69.00 /mo</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="text-[11px] text-gray-500 font-bold uppercase">AI Writer</div>
                <div className="text-lg font-black text-gray-900 mt-1">$71.20 /mo</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="text-[11px] text-gray-500 font-bold uppercase">API</div>
                <div className="text-lg font-black text-gray-900 mt-1">$149.00 /mo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION 5: "Witness real success stories from businesses like yours" (Japan Ski Experience) */}
      <section className="py-20 bg-[#072415] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
              Witness real success stories from businesses like yours
            </h2>
          </div>

          <div className="bg-[#0C3520] border border-emerald-700/60 rounded-3xl p-8 sm:p-12 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl text-left">
                <div className="text-emerald-400 font-black tracking-widest text-lg uppercase flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span>Japan Ski Experience</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Japan Ski Experience, a UK-based company specializing in ski holidays to Japan, boosted search visibility 6 times
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                  "With SE Ranking's keyword tracker and on-page audit recommendations, we were able to systematically outrank major booking portals and capture high-intent seasonal travelers."
                </p>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 gap-6 shrink-0 w-full sm:w-auto">
                <div className="bg-[#072415] p-6 rounded-2xl border border-emerald-800 text-center min-w-[160px]">
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400">59%</div>
                  <div className="text-xs font-semibold text-emerald-200 mt-1 uppercase">Keywords in Top 5</div>
                </div>
                <div className="bg-[#072415] p-6 rounded-2xl border border-emerald-800 text-center min-w-[160px]">
                  <div className="text-3xl sm:text-4xl font-black text-white">Reduced</div>
                  <div className="text-xs font-semibold text-emerald-200 mt-1 uppercase">Dependence on PPC</div>
                </div>
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
                <li><Link href="/enterprise" className="hover:text-blue-600">For Enterprises</Link></li>
                <li><Link href="/growing-business" className="text-[#0B69FF] font-bold">For Small Business</Link></li>
                <li><Link href="/local-marketing" className="hover:text-blue-600">Local Marketing</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Resources</div>
              <ul className="space-y-2">
                <li><Link href="/marketing-plan" className="hover:text-blue-600">Marketing Plan</Link></li>
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
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Add-ons</div>
              <ul className="space-y-2">
                <li><Link href="/local-marketing" className="hover:text-blue-600">Local Marketing</Link></li>
                <li><Link href="/content-marketing" className="hover:text-blue-600">Content Marketing</Link></li>
                <li><Link href="/agency-pack" className="hover:text-blue-600">Agency Pack</Link></li>
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
                <span>SE Ranking Small Business Tour</span>
                <span>•</span>
                <span>Step {tourStep + 1} of 3</span>
              </div>

              {tourStep === 0 && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">1. Keyword Tracking Made Simple</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    See exactly where you rank on Google for terms that drive real paying customers. Get notified automatically whenever your positions change.
                  </p>
                </div>
              )}

              {tourStep === 1 && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">2. Actionable Website Audit Checklist</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    No technical jargon. SE Ranking scans your pages and lists fixes in plain English with easy guides so anyone on your team can resolve them.
                  </p>
                </div>
              )}

              {tourStep === 2 && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">3. Google Maps & Local Storefront Rank</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    Dominate local search. Track your business on Google Maps across surrounding neighborhoods and monitor reviews in one place.
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
