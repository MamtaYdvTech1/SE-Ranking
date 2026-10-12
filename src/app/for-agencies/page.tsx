'use client';

import React, { useState, useEffect } from 'react';
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
  GraduationCap,
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
  Compass,
  Smile,
  Tag,
  DollarSign,
  MousePointerClick,
  Wrench,
  Banknote,
  Shield,
  User,
  Square,
  Menu,
  X,
  Copy,
  Calendar,
  Clock,
  Laptop,
  Smartphone,
  Star,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import { AgencyPartnerLogos } from '@/components/landing/AgencyPartnerLogos';

// Sample rank tracker dataset
const mockKeywordTrend = [
  { day: 'Mon', rank: 4, traffic: 420 },
  { day: 'Tue', rank: 3, traffic: 480 },
  { day: 'Wed', rank: 3, traffic: 510 },
  { day: 'Thu', rank: 2, traffic: 590 },
  { day: 'Fri', rank: 2, traffic: 630 },
  { day: 'Sat', rank: 1, traffic: 710 },
  { day: 'Sun', rank: 1, traffic: 740 },
];

const mockRankingsTable = [
  { keyword: 'digital marketing agency', pos: 1, change: '+3', vol: '18.1K', diff: 'Hard', ai: true },
  { keyword: 'b2b seo consulting', pos: 2, change: '+5', vol: '6.4K', diff: 'Med', ai: true },
  { keyword: 'enterprise rank tracker', pos: 1, change: '0', vol: '9.8K', diff: 'Hard', ai: false },
  { keyword: 'white label seo reports', pos: 3, change: '+8', vol: '4.2K', diff: 'Easy', ai: true },
  { keyword: 'local seo audit tool', pos: 1, change: '+2', vol: '12.5K', diff: 'Med', ai: false },
];

export default function ForAgenciesPage() {
  // Banner state
  const [showHelloBar, setShowHelloBar] = useState(true);

  // Active top nav dropdown
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Section 2 interactive tabs
  const [activeFeatureTab, setActiveFeatureTab] = useState<'reports' | 'tracker' | 'insights'>('reports');

  // Section 3 AI visibility demo modal
  const [selectedAiQuery, setSelectedAiQuery] = useState<string | null>(null);

  // Section 5 API Code switcher
  const [apiLang, setApiLang] = useState<'curl' | 'python' | 'node' | 'looker'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  // Section 6 Agency Pack simulator
  const [agencyPackTab, setAgencyPackTab] = useState<'whitelabel' | 'leadgen' | 'portal' | 'seats' | 'reports'>('whitelabel');
  const [simAgencyName, setSimAgencyName] = useState('Apex Digital Group');
  const [simBrandColor, setSimBrandColor] = useState('#0B69FF');

  // Section 7 Testimonials index
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Section 8 Pricing toggle & slider
  const [billingPeriod, setBillingPeriod] = useState<'annual' | 'monthly'>('annual');
  const [keywordTier, setKeywordTier] = useState(2000); // 750, 2000, 5000, 10000

  // Product tour modal
  const [isProductTourOpen, setIsProductTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Copy code handler
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Testimonial list
  const testimonials = [
    {
      quote:
        "SE Ranking gives our agency the depth of data of enterprise tools at a fraction of the cost, while White Label reporting saves our account managers 15+ hours every month.",
      author: 'Stephen Kenwright',
      role: 'Strategy Director & Co-Founder',
      company: 'Rise at Seven',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      quote:
        "Switching our 60+ clients to SE Ranking automated our entire monthly reporting pipeline. The client portal and lead generator have paid for themselves 10x over.",
      author: 'Paul Gordon',
      role: 'Founder & CEO',
      company: 'Automyze Marketing',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      quote:
        "The AI Search Overviews tracking is an absolute game-changer. We're pitching GEO and AI Visibility to our enterprise clients before any competing agency even has the data.",
      author: 'Sarah Jenkins',
      role: 'VP of Organic Growth',
      company: 'PixelCraft SEO',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const codeSnippets = {
    curl: `curl -X GET "https://api.seranking.com/v1/projects/4821/keywords" \\
  -H "Authorization: Bearer sec_live_94821038472" \\
  -H "Content-Type: application/json"`,
    python: `import requests

url = "https://api.seranking.com/v1/projects/4821/keywords"
headers = {
    "Authorization": "Bearer sec_live_94821038472",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
print(response.json())`,
    node: `const response = await fetch("https://api.seranking.com/v1/projects/4821/keywords", {
  headers: {
    "Authorization": "Bearer sec_live_94821038472",
    "Content-Type": "application/json"
  }
});
const data = await response.json();
console.log(data);`,
    looker: `// Connect SE Ranking Native Looker Studio Connector
// 1. Add Data Source -> Search "SE Ranking Agency Suite"
// 2. Insert API Token: sec_live_94821038472
// 3. Select Project ID: 4821 (Apex Digital Group)
// 4. Dimensions: Keyword, SERP Position, AI Overview Presence`,
  };

  // Pricing calculations
  const calculatePrice = (baseAnnual: number, baseMonthly: number) => {
    let multiplier = 1;
    if (keywordTier === 5000) multiplier = 1.4;
    if (keywordTier === 10000) multiplier = 1.9;
    const price = billingPeriod === 'annual' ? baseAnnual * multiplier : baseMonthly * multiplier;
    return Math.round(price * 100) / 100;
  };

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
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group">
              <SeRankingLogo variant="brand" width={130} height={32} />
            </Link>

            {/* Desktop Navigation Links */}
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
                    <Link
                      href="/keyword-rank-tracker"
                      className="p-2.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">Keyword Rank Tracker</div>
                        <div className="text-[11px] text-gray-500">100% accurate daily ranking data</div>
                      </div>
                    </Link>
                    <Link
                      href="/keyword-tool"
                      className="p-2.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">Keyword Tool</div>
                        <div className="text-[11px] text-gray-500">Discover high-intent keyword ideas</div>
                      </div>
                    </Link>
                    <Link
                      href="/website-audit-tool"
                      className="p-2.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <FileSearch className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">Website Audit</div>
                        <div className="text-[11px] text-gray-500">Deep technical health checks</div>
                      </div>
                    </Link>
                    <Link
                      href="/on-page-seo-checker"
                      className="p-2.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">On-Page SEO Checker</div>
                        <div className="text-[11px] text-gray-500">Benchmark against SERP leaders</div>
                      </div>
                    </Link>
                    <Link
                      href="/competitor-analysis-tool"
                      className="p-2.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">Competitor Analysis Tool</div>
                        <div className="text-[11px] text-gray-500">Reverse engineer organic & paid traffic</div>
                      </div>
                    </Link>
                    <Link
                      href="/backlink-checker"
                      className="p-2.5 rounded-lg hover:bg-blue-50/70 flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 group-hover:text-[#0B69FF]">Backlink Checker</div>
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
                      className="p-2.5 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center gap-3 font-bold text-xs"
                    >
                      <Briefcase className="w-4 h-4 text-[#0B69FF]" />
                      <span>For Marketing Agencies</span>
                      <span className="ml-auto text-[10px] bg-[#0B69FF] text-white px-1.5 py-0.5 rounded font-bold">Active</span>
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
                      className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-3 text-xs font-semibold"
                    >
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>Growing Businesses</span>
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/billing" className="py-4 hover:text-[#0B69FF] transition-colors">
                Pricing
              </Link>
              <Link href="/api-docs" className="py-4 hover:text-[#0B69FF] transition-colors">
                API & Docs
              </Link>
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-bold text-gray-700 hover:text-[#0B69FF] transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-[#0B69FF] hover:bg-[#0052cc] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 flex items-center gap-1.5"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-6 space-y-4">
            <Link
              href="/for-agencies"
              className="block text-base font-bold text-[#0B69FF] py-2 border-b border-gray-50"
            >
              For Agencies
            </Link>
            <Link
              href="/agency-pack"
              className="block text-base font-medium text-gray-800 py-2 border-b border-gray-50"
            >
              Agency Pack Settings
            </Link>
            <Link
              href="/projects"
              className="block text-base font-medium text-gray-800 py-2 border-b border-gray-50"
            >
              Projects Dashboard
            </Link>
            <Link
              href="/ai-results-tracker"
              className="block text-base font-medium text-gray-800 py-2 border-b border-gray-50"
            >
              AI Visibility Tracker
            </Link>
            <Link
              href="/billing"
              className="block text-base font-medium text-gray-800 py-2 border-b border-gray-50"
            >
              Pricing
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center py-2.5 border border-gray-200 rounded-lg text-sm font-bold"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="w-full text-center py-2.5 bg-[#0B69FF] text-white rounded-lg text-sm font-bold shadow-md shadow-blue-500/20"
              >
                Start free trial
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION (Exact Match with provided HTML & screenshot) */}
      <section className="top-block container pt-12 sm:pt-16 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Title & Subtitle */}
        <div className="se-title-text max-w-4xl mx-auto" data-size="h1" data-alignment="center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#0B69FF] text-xs font-bold mb-6 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for Modern SEO & Digital Marketing Agencies</span>
          </div>

          <h1 className="se-title heading-1 text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.12] mb-6">
            Expand your agency’s capacity with&nbsp;SE&nbsp;Ranking
          </h1>

          <p className="se-text se-text_regular se-text_hero text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Build smarter SEO workflows and expand your agency with automation, powerful AI insights, and&nbsp;seamless collaboration.
          </p>
        </div>

        {/* Buttons Group */}
        <div className="se-buttons-group flex flex-wrap items-center justify-center gap-4 mb-12 sm:mb-16">
          <Link
            href="/projects"
            className="trial-btn se-btn_main button-group-btn se-btn se-btn_large px-8 py-3.5 rounded-full bg-[#0B69FF] hover:bg-[#0052cc] text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all flex items-center gap-2 group cursor-pointer"
          >
            <span>Projects</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            onClick={() => setIsProductTourOpen(true)}
            className="se-btn_tert button-group-btn se-btn se-btn_large view-demo-btn px-7 py-3.5 rounded-full border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 font-bold text-base transition-all flex items-center gap-2 shadow-sm cursor-pointer"
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
              alt="Expand your agency’s capacity with SE Ranking"
              src="https://seranking.com/wp-content/uploads/sites/9/2025/03/seranking-for-agencies-2x.png"
              onError={(e) => {
                // High-fidelity fallback if image fails loading
                (e.target as HTMLImageElement).src = 'https://seranking.com/blog/wp-content/uploads/2023/11/SE-Ranking-Brand-Kit.png';
              }}
            />

            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating Live Badge 1: Audit Score */}
          <div className="hidden sm:flex absolute -left-4 top-1/4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-gray-100 items-center gap-3 animate-bounce [animation-duration:5s]">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 font-black text-sm flex items-center justify-center border-2 border-emerald-500">
              88
            </div>
            <div className="text-left leading-tight">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Health Score</div>
              <div className="text-xs font-black text-gray-900">12 Client Audits Passed</div>
            </div>
          </div>

          {/* Floating Live Badge 2: Positions Gain */}
          <div className="hidden sm:flex absolute -right-4 top-1/3 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-gray-100 items-center gap-3 animate-bounce [animation-duration:6s]">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0B69FF] font-black text-sm flex items-center justify-center border-2 border-blue-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Rankings Gain</div>
              <div className="text-xs font-black text-emerald-600">+24% Top 3 Positions</div>
            </div>
          </div>

          {/* Floating Live Badge 3: Client Satisfaction */}
          <div className="hidden md:flex absolute left-8 -bottom-5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg border border-gray-100 items-center gap-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs font-black text-gray-800">4.8 / 5 Rating on G2</span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs font-bold text-gray-600">40,000+ Agencies</span>
          </div>
        </div>

        {/* Official Partner Logos Marquee with vector SVGs from user prompt */}
        <AgencyPartnerLogos />
      </section>

      {/* 4. SECTION 1: "Build a stronger foundation for how your agency runs" */}
      <section className="py-20 bg-gray-50/70 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Build a stronger foundation for how your agency runs
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              A platform built to support your clients, team, and your agency’s bottom line
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-200/80 hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B69FF] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Client-ready reporting</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Automate routine reporting so your team can focus on strategy, not slide decks. Schedule PDF or web reports with white-label branding.
                </p>
              </div>

              {/* Graphic Mockup */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2 font-medium">
                  <span>Monthly Client Report</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Scheduled
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0B69FF] w-4/5 rounded-full" />
                </div>
                <div className="flex justify-between items-center text-[11px] text-gray-400 mt-2">
                  <span>Delivered via client email</span>
                  <span className="font-bold text-gray-700">1st of Month</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-200/80 hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Globe2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Cross-channel visibility</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Track organic and local rankings, paid search, social media, and more from one central dashboard across 190+ regional search engines.
                </p>
              </div>

              {/* Graphic Mockup */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-gray-100">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Organic</div>
                  <div className="text-sm font-black text-gray-900">48.2K</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-100">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Maps</div>
                  <div className="text-sm font-black text-emerald-600">#1 Top 3</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-100">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Paid</div>
                  <div className="text-sm font-black text-blue-600">$12.4K</div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-200/80 hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">High-ROI strategic insights</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Uncover the keywords and content opportunities that drive revenue for your clients. Detect ranking cannibalization before it hurts traffic.
                </p>
              </div>

              {/* Graphic Mockup */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                <div className="text-left">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Growth Potential</div>
                  <div className="text-sm font-black text-emerald-600">+14,500 Visits</div>
                </div>
                <div className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                  High Priority
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION 2: "Protect your agency with AI-driven SEO tools and reliable data" */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Protect your agency with AI-driven SEO tools and reliable data
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Give your team access to clean, verified data they can actually trust.
            </p>

            {/* Tab Buttons */}
            <div className="inline-flex p-1.5 rounded-full bg-gray-100 border border-gray-200 mt-8 gap-1">
              <button
                onClick={() => setActiveFeatureTab('reports')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeFeatureTab === 'reports'
                    ? 'bg-[#0B69FF] text-white shadow-md shadow-blue-500/20'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Automated SEO Reports
              </button>
              <button
                onClick={() => setActiveFeatureTab('tracker')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeFeatureTab === 'tracker'
                    ? 'bg-[#0B69FF] text-white shadow-md shadow-blue-500/20'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Rank Tracker
              </button>
              <button
                onClick={() => setActiveFeatureTab('insights')}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeFeatureTab === 'insights'
                    ? 'bg-[#0B69FF] text-white shadow-md shadow-blue-500/20'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Strategic SEO Insights
              </button>
            </div>
          </div>

          {/* Interactive Split View */}
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left: Dynamic Mockup Canvas (7 cols) */}
            <div className="lg:col-span-7 bg-[#F8FAFC] border border-gray-200 rounded-2xl p-6 shadow-xl relative overflow-hidden min-h-[420px] flex flex-col justify-between">
              {activeFeatureTab === 'reports' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                        SR
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Apex Marketing | Q1 Organic Audit</div>
                        <div className="text-[10px] text-gray-500">Client: WorkComposer Inc. (https://workcomposer.com)</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Automated PDF
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <div className="text-[10px] text-gray-500 font-semibold uppercase">Visibility Score</div>
                      <div className="text-lg font-black text-gray-900 mt-1">84.6%</div>
                      <span className="text-[10px] text-emerald-600 font-bold">+12.4% vs last mo</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <div className="text-[10px] text-gray-500 font-semibold uppercase">Top 10 Keywords</div>
                      <div className="text-lg font-black text-gray-900 mt-1">412</div>
                      <span className="text-[10px] text-emerald-600 font-bold">+38 new positions</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <div className="text-[10px] text-gray-500 font-semibold uppercase">Organic Traffic</div>
                      <div className="text-lg font-black text-gray-900 mt-1">128.4K</div>
                      <span className="text-[10px] text-blue-600 font-bold">+21.2% growth</span>
                    </div>
                  </div>

                  {/* Area chart in report */}
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xs font-bold text-gray-800 mb-2">Organic Search Trend & Forecast</div>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockKeywordTrend}>
                          <defs>
                            <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0B69FF" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#0B69FF" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} />
                          <Tooltip />
                          <Area type="monotone" dataKey="traffic" stroke="#0B69FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTraffic)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'tracker' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#0B69FF]" />
                      <span className="text-xs font-bold text-gray-900">Global Rank Tracking (Google US - Desktop & Mobile)</span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-500">Updated: Today 08:30 AM</span>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 text-[11px]">
                        <tr>
                          <th className="p-2.5 pl-3">Target Keyword</th>
                          <th className="p-2.5">Position</th>
                          <th className="p-2.5">Change</th>
                          <th className="p-2.5">Volume</th>
                          <th className="p-2.5 pr-3">AI Overview</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {mockRankingsTable.map((row, i) => (
                          <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-2.5 pl-3 font-semibold text-gray-900">{row.keyword}</td>
                            <td className="p-2.5 font-black text-gray-900">
                              <span className="w-6 h-6 rounded-full bg-blue-50 text-[#0B69FF] inline-flex items-center justify-center font-bold">
                                #{row.pos}
                              </span>
                            </td>
                            <td className="p-2.5 font-bold text-emerald-600">{row.change}</td>
                            <td className="p-2.5 text-gray-600">{row.vol}</td>
                            <td className="p-2.5 pr-3">
                              {row.ai ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Sparkles className="w-3 h-3" /> Cited
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[11px]">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'insights' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-bold text-gray-900">Actionable AI Opportunities & Competitor Gaps</span>
                    </div>
                    <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                      3 Urgent Actions
                    </span>
                  </div>

                  <div className="grid gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-gray-900">Unclaimed AI Overview Citation</div>
                        <p className="text-gray-500 mt-0.5">
                          Query <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">"top seo tools for enterprise"</code> is citing Competitor A. Add structured comparison table to capture citation.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Target className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-gray-900">Keyword Cannibalization Detected</div>
                        <p className="text-gray-500 mt-0.5">
                          URLs <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">/services/seo</code> and <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">/agency-services</code> both compete for "b2b seo". Consolidate internal links.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom control bar */}
              <div className="pt-4 mt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Live Verified Data (190+ Countries)
                </span>
                <Link
                  href="/projects"
                  className="font-bold text-[#0B69FF] hover:underline flex items-center gap-1"
                >
                  View interactive project →
                </Link>
              </div>
            </div>

            {/* Right: Feature Highlights (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div
                onClick={() => setActiveFeatureTab('reports')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  activeFeatureTab === 'reports'
                    ? 'bg-blue-50/50 border-[#0B69FF] shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <h3 className="font-bold text-base text-gray-900">Automated SEO Reports</h3>
                </div>
                <p className="text-xs text-gray-600 pl-9 leading-relaxed">
                  Generate pixel-perfect client reports on schedule with custom agency branding, dynamic widgets, and automated email dispatching.
                </p>
              </div>

              <div
                onClick={() => setActiveFeatureTab('tracker')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  activeFeatureTab === 'tracker'
                    ? 'bg-blue-50/50 border-[#0B69FF] shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <h3 className="font-bold text-base text-gray-900">100% Verified Rank Tracker</h3>
                </div>
                <p className="text-xs text-gray-600 pl-9 leading-relaxed">
                  Track keyword positions across global search engines with mobile, desktop, and Google Maps local 3-pack breakdown.
                </p>
              </div>

              <div
                onClick={() => setActiveFeatureTab('insights')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  activeFeatureTab === 'insights'
                    ? 'bg-blue-50/50 border-[#0B69FF] shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <h3 className="font-bold text-base text-gray-900">Strategic SEO Insights</h3>
                </div>
                <p className="text-xs text-gray-600 pl-9 leading-relaxed">
                  Diagnose ranking drops, discover hidden competitor gaps, and prioritize high-impact SEO wins with machine learning recommendations.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0B69FF] hover:bg-[#0052cc] text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <span>Explore tools</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 3: "Add AI visibility to what your agency delivers" (Vibrant Signature Green Section) */}
      <section className="py-24 bg-gradient-to-b from-emerald-50/60 to-emerald-50/20 border-t border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generative Engine Optimization (GEO)</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Add AI visibility to what your agency delivers
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Help your clients win in the new era of generative search and answer engines.
            </p>
          </div>

          {/* 5 Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div
              onClick={() => setSelectedAiQuery('best seo software for agencies')}
              className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-200/80 hover:shadow-lg hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-4">
                  Opportunity
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  Find the opportunity before it hits the SERP
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">
                  Spot which queries trigger AI Overviews and optimize client content before competitors catch on.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Test live prompt demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => setSelectedAiQuery('top enterprise crm systems')}
              className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-200/80 hover:shadow-lg hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-4">
                  Citations
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  Pinpoint who, what & where
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">
                  See exactly which domains, URLs, and source citations AI engines recommend to your audience.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>View citation sources</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => setSelectedAiQuery('b2b marketing automation tools')}
              className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-200/80 hover:shadow-lg hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-4">
                  Client Value
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  Shape a stronger agreement strategy
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">
                  Demonstrate tangible AI visibility value to prospective and existing clients with verifiable share-of-voice data.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>See SOV breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 4 */}
            <div
              onClick={() => setSelectedAiQuery('cloud accounting software')}
              className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-200/80 hover:shadow-lg hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-4">
                  Historical Trends
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  Reveal AI results over time
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">
                  Historical tracking of AI Overviews, chat citations, and brand share-of-voice across weeks and quarters.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>View trend history</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 5 */}
            <div
              onClick={() => setSelectedAiQuery('reliable seo rank tracking')}
              className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-200/80 hover:shadow-lg hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between md:col-span-2 lg:col-span-2"
            >
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-4">
                  Brand Sentiment
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  Know how searchers see you
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">
                  Understand conversational brand sentiment across ChatGPT, Google AI Mode, Gemini, and Claude. Catch brand hallucinations early.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Explore conversational brand sentiment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 4: "Tell your clients a fuller performance story" */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Tell your clients a fuller performance story
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Expand your service offerings with integrated local marketing and content workflows
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Local Marketing Add-on */}
            <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>Add-on: Local Marketing</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  Local visibility for more client conversations
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Track rankings on Google Maps down to specific postal codes. Manage Google Business Profiles, monitor reviews, and audit local citations.
                </p>
              </div>

              {/* Local Heatmap Grid Mockup */}
              <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-4">
                  <span>Geo-Grid Local Rank Tracker (Miami, FL)</span>
                  <span className="text-emerald-600 font-bold">Avg Rank: #1.4</span>
                </div>
                {/* 3x3 Heatmap Pins */}
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {['#1', '#1', '#2', '#1', '#1', '#1', '#2', '#3', '#1'].map((pin, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-500/20"
                    >
                      {pin}
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-center text-gray-400 mt-4">
                  Radius: 5.0 miles • 9 Grid Points Checked
                </div>
              </div>
            </div>

            {/* Content Marketing Add-on */}
            <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>Add-on: Content Marketing</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  Always stay on top of your marketing calendar
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Plan editorial campaigns, assign articles to writers, analyze text with AI Content Editor, and coordinate client approvals.
                </p>
              </div>

              {/* Editorial Calendar Board Mockup */}
              <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-4">
                  <span>Editorial Workflow & Approvals</span>
                  <span className="text-blue-600 font-bold">3 Posts This Week</span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                    <span className="font-semibold text-gray-800">"Ultimate Guide to B2B SEO in 2026"</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Ready</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                    <span className="font-semibold text-gray-800">"How to Optimize for ChatGPT & GEO"</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">In Review</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                    <span className="font-semibold text-gray-800">"Case Study: 320% Traffic Growth"</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">Draft</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION 5: "Plug SE Ranking into your AI workflows, reporting pipelines, and custom tools" */}
      <section className="py-24 bg-[#0F172A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left: Code Snippet (7 cols) */}
            <div className="lg:col-span-7 bg-[#1E293B] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
              {/* Header with Lang switcher */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#0F172A] border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">api.seranking.com/v1</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg bg-slate-800 p-0.5 text-xs font-mono">
                    <button
                      onClick={() => setApiLang('curl')}
                      className={`px-2.5 py-1 rounded cursor-pointer ${apiLang === 'curl' ? 'bg-[#0B69FF] text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      cURL
                    </button>
                    <button
                      onClick={() => setApiLang('python')}
                      className={`px-2.5 py-1 rounded cursor-pointer ${apiLang === 'python' ? 'bg-[#0B69FF] text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Python
                    </button>
                    <button
                      onClick={() => setApiLang('node')}
                      className={`px-2.5 py-1 rounded cursor-pointer ${apiLang === 'node' ? 'bg-[#0B69FF] text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Node.js
                    </button>
                    <button
                      onClick={() => setApiLang('looker')}
                      className={`px-2.5 py-1 rounded cursor-pointer ${apiLang === 'looker' ? 'bg-[#0B69FF] text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Looker
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopyCode(codeSnippets[apiLang])}
                    className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800 transition-colors cursor-pointer"
                    title="Copy snippet"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Code Pre */}
              <div className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                <pre>{codeSnippets[apiLang]}</pre>
              </div>

              {/* Response Preview */}
              <div className="bg-[#090D16] p-4 border-t border-slate-800 text-[11px] font-mono text-emerald-400">
                <span className="text-slate-500">// Response 200 OK</span>
                <div>{`{ "success": true, "keywords_count": 412, "avg_position": 2.4, "ai_overview_share": "74.8%" }`}</div>
              </div>
            </div>

            {/* Right: API Feature Pitch (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                <Code2 className="w-3.5 h-3.5" />
                <span>Developer-Friendly Agency Infrastructure</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Plug SE Ranking into your AI workflows, reporting pipelines, and custom tools
              </h2>

              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>High-throughput REST API with 99.9% uptime SLA and generous agency rate limits</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Real-time webhooks for ranking drops, competitor surges, and site audit anomalies</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Native connectors for Google Looker Studio, Google Sheets, Zapier, and PowerBI</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Bulk raw SERP exports for feeding your agency's custom internal AI models</span>
                </li>
              </ul>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/api-docs"
                  className="px-6 py-3 rounded-full bg-[#0B69FF] hover:bg-[#0052cc] text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
                >
                  Explore API Documentation
                </Link>
                <Link
                  href="/billing"
                  className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
                >
                  View API limits →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SECTION 6: "Brand, serve and win more clients with SE Ranking’s Agency Pack" */}
      <section className="py-24 bg-gray-50/60 border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Brand, serve and win more clients with SE Ranking’s Agency Pack
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Custom branding, automated lead gen, and dedicated client portals designed for modern marketing agencies.
            </p>

            {/* Feature Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {[
                { id: 'whitelabel', label: 'White Label' },
                { id: 'leadgen', label: 'Lead Generator' },
                { id: 'portal', label: 'Client Portal' },
                { id: 'seats', label: 'Team Seats & Roles' },
                { id: 'reports', label: 'Unlimited Reports' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAgencyPackTab(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    agencyPackTab === tab.id
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive White-Label Simulator */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xl max-w-4xl mx-auto">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              {/* Controls (5 cols) */}
              <div className="md:col-span-5 space-y-5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Live Branding Simulator
                </div>
                <h3 className="text-xl font-black text-gray-900 leading-snug">
                  Deliver software that looks 100% like your own
                </h3>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Agency Name</label>
                  <input
                    type="text"
                    value={simAgencyName}
                    onChange={(e) => setSimAgencyName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#0B69FF]"
                    placeholder="e.g. Apex Digital Marketing"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Brand Accent Color</label>
                  <div className="flex items-center gap-2">
                    {['#0B69FF', '#10B981', '#8B5CF6', '#F97316', '#0F172A'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setSimBrandColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                          simBrandColor === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <div className="font-semibold text-gray-700">Custom Domain Preview:</div>
                  <code className="text-[#0B69FF] font-mono text-[11px] block mt-0.5">
                    https://seo.{simAgencyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'youragency'}.com
                  </code>
                </div>

                <Link
                  href="/agency-pack"
                  className="inline-flex items-center gap-2 w-full justify-center px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>Configure Full Agency Pack</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Live Preview Screen (7 cols) */}
              <div className="md:col-span-7 bg-[#F8FAFC] p-5 rounded-2xl border border-gray-200 shadow-inner">
                {/* Simulated Custom Branded Dashboard */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-xs">
                  {/* Custom Header Bar */}
                  <div
                    style={{ backgroundColor: simBrandColor }}
                    className="px-4 py-3 text-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center font-black text-white text-[11px]">
                        {simAgencyName.charAt(0) || 'A'}
                      </div>
                      <span className="font-black text-sm">{simAgencyName || 'Agency Name'}</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">
                      Client Portal
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="font-bold">Organic Search Visibility</span>
                      <span className="text-emerald-600 font-bold">+18.4%</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded bg-gray-50 border border-gray-100">
                        <div className="text-[10px] text-gray-400">Top 3 Keywords</div>
                        <div className="text-base font-black text-gray-900">42</div>
                      </div>
                      <div className="p-2.5 rounded bg-gray-50 border border-gray-100">
                        <div className="text-[10px] text-gray-400">Total Backlinks</div>
                        <div className="text-base font-black text-gray-900">2,480</div>
                      </div>
                    </div>

                    <button
                      style={{ backgroundColor: simBrandColor }}
                      className="w-full py-2 rounded text-white font-bold text-[11px] shadow-sm cursor-pointer"
                    >
                      Download Branded Client PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. SECTION 7: "Why agencies from 150+ countries choose us" */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Why agencies from 150+ countries choose us
            </h2>
            <div className="flex items-center justify-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400" />
              ))}
              <span className="ml-2 text-sm font-bold text-gray-700">4.8 / 5 based on 4,500+ agency reviews</span>
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="bg-[#F8FAFC] rounded-3xl p-8 sm:p-12 border border-gray-200 relative shadow-sm">
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

              {/* Slider Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 hover:border-gray-400 bg-white flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 hover:border-gray-400 bg-white flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. SECTION 8: "Flexible pricing that adapts to your agency's needs" */}
      <section className="py-24 bg-gray-50 border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
              Flexible pricing that adapts to your agency’s needs
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8">
              Scale your plan as your client roster grows. No hidden fees or locked contracts.
            </p>

            {/* Monthly / Annual Toggle */}
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

            {/* Keyword volume selector */}
            <div className="mt-8 max-w-sm mx-auto flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs">
              <span className="text-gray-600 font-bold">Tracked Keywords:</span>
              <div className="flex gap-1.5 font-bold">
                {[750, 2000, 5000, 10000].map((k) => (
                  <button
                    key={k}
                    onClick={() => setKeywordTier(k)}
                    className={`px-2 py-1 rounded cursor-pointer ${
                      keywordTier === k ? 'bg-blue-100 text-[#0B69FF]' : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {k >= 1000 ? `${k / 1000}K` : k}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {/* Essential */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Essential</div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Boutique Agency</h3>
                <p className="text-xs text-gray-500 mb-6">Ideal for freelancers and boutique shops with up to 10 clients.</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-gray-900">${calculatePrice(55.2, 69)}</span>
                  <span className="text-xs text-gray-500 font-semibold">/ month</span>
                </div>

                <ul className="space-y-3 text-xs text-gray-600 border-t border-gray-100 pt-6 mb-8">
                  <li className="flex items-center gap-2">✓ 10 Projects included</li>
                  <li className="flex items-center gap-2">✓ {keywordTier} Tracked Keywords</li>
                  <li className="flex items-center gap-2">✓ 1 Team User Seat</li>
                  <li className="flex items-center gap-2">✓ Automated PDF Reporting</li>
                  <li className="flex items-center gap-2">✓ Weekly rankings refresh</li>
                </ul>
              </div>

              <Link
                href="/signup?plan=essential"
                className="w-full py-3 rounded-full border border-gray-300 hover:border-gray-900 text-gray-900 font-bold text-xs text-center transition-colors cursor-pointer"
              >
                Start 14-day free trial
              </Link>
            </div>

            {/* Pro (Highlighted) */}
            <div className="bg-white rounded-3xl p-8 border-2 border-[#0B69FF] shadow-2xl relative flex flex-col justify-between scale-105 z-10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0B69FF] text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                Most Popular for Agencies
              </div>

              <div>
                <div className="text-xs font-bold text-[#0B69FF] uppercase tracking-wider mb-2">Pro</div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Growing Agency</h3>
                <p className="text-xs text-gray-500 mb-6">For scaling teams that need unlimited projects and client seats.</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-gray-900">${calculatePrice(103.2, 129)}</span>
                  <span className="text-xs text-gray-500 font-semibold">/ month</span>
                </div>

                <ul className="space-y-3 text-xs text-gray-700 border-t border-gray-100 pt-6 mb-8 font-medium">
                  <li className="flex items-center gap-2 font-bold text-gray-900">✓ Unlimited Projects</li>
                  <li className="flex items-center gap-2">✓ {keywordTier} Tracked Keywords (Daily Refresh)</li>
                  <li className="flex items-center gap-2">✓ 3 Team Manager Seats included</li>
                  <li className="flex items-center gap-2">✓ Historical SERP Data Archive</li>
                  <li className="flex items-center gap-2">✓ Add-on: White Label & Lead Gen</li>
                </ul>
              </div>

              <Link
                href="/signup?plan=pro"
                className="w-full py-3 rounded-full bg-[#0B69FF] hover:bg-[#0052cc] text-white font-bold text-xs text-center shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                Start 14-day free trial
              </Link>
            </div>

            {/* Business */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Business</div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Enterprise Agency</h3>
                <p className="text-xs text-gray-500 mb-6">Complete suite with White Label and API included out of the box.</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-gray-900">${calculatePrice(239.2, 299)}</span>
                  <span className="text-xs text-gray-500 font-semibold">/ month</span>
                </div>

                <ul className="space-y-3 text-xs text-gray-600 border-t border-gray-100 pt-6 mb-8">
                  <li className="flex items-center gap-2">✓ Unlimited Projects</li>
                  <li className="flex items-center gap-2">✓ {keywordTier} Keywords</li>
                  <li className="flex items-center gap-2">✓ 10 Team Seats</li>
                  <li className="flex items-center gap-2 font-bold text-gray-900">✓ Full White Label Suite Included</li>
                  <li className="flex items-center gap-2 font-bold text-gray-900">✓ Full REST API Access</li>
                </ul>
              </div>

              <Link
                href="/signup?plan=business"
                className="w-full py-3 rounded-full border border-gray-300 hover:border-gray-900 text-gray-900 font-bold text-xs text-center transition-colors cursor-pointer"
              >
                Start 14-day free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 12. SECTION 9: "Learn how agencies succeed with SE Ranking" (Direction.com Banner) */}
      <section className="py-20 bg-[#0A2617] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
              Learn how agencies succeed with SE Ranking
            </h2>
            <p className="text-sm sm:text-base text-emerald-300">
              Real agencies scaling revenue, automating reporting, and winning high-ticket client retainers.
            </p>
          </div>

          <div className="bg-[#0F3925] border border-emerald-700/60 rounded-3xl p-8 sm:p-12 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl text-left">
                <div className="text-emerald-400 font-black tracking-widest text-lg uppercase flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span>Direction.com</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Direction scaled client SEO deliverables across 85+ accounts with SE Ranking automation
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                  "Before SE Ranking, our account executives spent 3 days at the end of every month building manual reports. Now, client reports dispatch automatically on the 1st, saving over $18,000 in monthly labor costs."
                </p>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 gap-6 shrink-0 w-full sm:w-auto">
                <div className="bg-[#0A2617] p-6 rounded-2xl border border-emerald-800 text-center min-w-[160px]">
                  <div className="text-3xl sm:text-4xl font-black text-white">54,000</div>
                  <div className="text-xs font-semibold text-emerald-300 mt-1 uppercase">Organic Visits Gain</div>
                </div>
                <div className="bg-[#0A2617] p-6 rounded-2xl border border-emerald-800 text-center min-w-[160px]">
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400">$58,200</div>
                  <div className="text-xs font-semibold text-emerald-300 mt-1 uppercase">Monthly SEO Value</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. BOTTOM CTA BANNER */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6">
            Ready to expand your agency’s capacity?
          </h2>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto mb-10">
            Join 40,000+ agencies using SE Ranking to automate client reporting, monitor AI search, and scale profits.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-full bg-white text-[#0B69FF] font-black text-base shadow-xl hover:bg-gray-50 transition-all cursor-pointer"
            >
              Start 14-day free trial
            </Link>
            <Link
              href="/projects"
              className="px-8 py-3.5 rounded-full border border-white/40 hover:border-white text-white font-bold text-base transition-all cursor-pointer"
            >
              Explore Projects
            </Link>
          </div>
        </div>
      </section>

      {/* 14. OFFICIAL SE RANKING FOOTER */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Core SEO Tools</div>
              <ul className="space-y-2">
                <li><Link href="/rankings" className="hover:text-blue-600 transition-colors">Rank Tracker</Link></li>
                <li><Link href="/website-audit" className="hover:text-blue-600 transition-colors">Website Audit</Link></li>
                <li><Link href="/competitors" className="hover:text-blue-600 transition-colors">Competitor Research</Link></li>
                <li><Link href="/research" className="hover:text-blue-600 transition-colors">Keyword Research</Link></li>
                <li><Link href="/backlinks" className="hover:text-blue-600 transition-colors">Backlink Checker</Link></li>
                <li><Link href="/ai-results-tracker" className="hover:text-blue-600 transition-colors">AI Overview Tracker</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Solutions</div>
              <ul className="space-y-2">
                <li><Link href="/for-agencies" className="text-[#0B69FF] font-bold">For Agencies</Link></li>
                <li><Link href="/project-overview" className="hover:text-blue-600 transition-colors">For Enterprises</Link></li>
                <li><Link href="/projects" className="hover:text-blue-600 transition-colors">For Small Business</Link></li>
                <li><Link href="/agency-pack" className="hover:text-blue-600 transition-colors">White Label Suite</Link></li>
                <li><Link href="/local-marketing" className="hover:text-blue-600 transition-colors">Local Marketing</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Resources</div>
              <ul className="space-y-2">
                <li><a href="https://seranking.com/blog/" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">SEO Blog</a></li>
                <li><a href="https://seranking.com/academy.html" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">SE Ranking Academy</a></li>
                <li><a href="https://seranking.com/webinars.html" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">Webinars</a></li>
                <li><Link href="/api-docs" className="hover:text-blue-600 transition-colors">API Documentation</Link></li>
                <li><Link href="/whats-new" className="hover:text-blue-600 transition-colors">What's New</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Company</div>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:text-blue-600 transition-colors">About SE Ranking</Link></li>
                <li><Link href="/affiliate" className="hover:text-blue-600 transition-colors">Affiliate Program</Link></li>
                <li><Link href="/bonus-offers" className="hover:text-blue-600 transition-colors">Bonus Offers</Link></li>
                <li><Link href="/help" className="hover:text-blue-600 transition-colors">Contact Support</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Agency Add-ons</div>
              <ul className="space-y-2">
                <li><Link href="/agency-pack" className="hover:text-blue-600 transition-colors">White Labeling</Link></li>
                <li><Link href="/agency-pack" className="hover:text-blue-600 transition-colors">Lead Gen Widget</Link></li>
                <li><Link href="/agency-pack" className="hover:text-blue-600 transition-colors">Custom Login Portal</Link></li>
                <li><Link href="/users" className="hover:text-blue-600 transition-colors">Unlimited Team Seats</Link></li>
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

      {/* 15. AI OVERVIEW TEST QUERY MODAL */}
      {selectedAiQuery && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-emerald-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-sm text-gray-900">AI Search Overview Simulator</span>
              </div>
              <button
                onClick={() => setSelectedAiQuery(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Prompt Tested:</span>
                <div className="font-mono font-bold text-gray-900 mt-0.5">"{selectedAiQuery}"</div>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">Simulated AI Answer</span>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-bold">
                    Confidence: 96%
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "Based on industry evaluations and verified client reviews, leading agencies rely on platforms like <strong>Apex Digital Group</strong> for comprehensive position tracking, automated white-label reporting, and generative engine optimization."
                </p>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase block mb-2">Sources & Citations:</span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                    <span className="font-semibold text-gray-800">1. https://youragency.com/services</span>
                    <span className="text-emerald-600 font-bold">Citation #1</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                    <span className="font-semibold text-gray-800">2. https://g2.com/products/apex-digital</span>
                    <span className="text-gray-500 font-bold">Citation #2</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedAiQuery(null)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                >
                  Close
                </button>
                <Link
                  href="/ai-results-tracker"
                  className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-emerald-600 text-white font-bold"
                >
                  Explore in AI Tracker
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 16. PRODUCT TOUR MODAL */}
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
                <span>SE Ranking Agency Tour</span>
                <span>•</span>
                <span>Step {tourStep + 1} of 4</span>
              </div>

              {tourStep === 0 && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">1. 100% Accurate Daily Rank Tracking</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    Track client keywords across Google, Bing, Yahoo, YouTube, and Google Maps. Compare mobile vs desktop visibility, analyze historical trends, and spot SERP features like AI Overviews and Local 3-Packs.
                  </p>
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 font-mono">
                    ✓ 190+ Countries • City & Postal Code Level • Daily SERP Snapshots
                  </div>
                </div>
              )}

              {tourStep === 1 && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">2. Automated White-Label Client Reports</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    Eliminate manual reporting. Build custom-branded PDF and live web reports with your agency logo, domain, and color palette. Set up automated schedules for the 1st or 15th of every month.
                  </p>
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 font-mono">
                    ✓ Custom SMTP Sender • Branded Live Links • Unlimited PDF Exports
                  </div>
                </div>
              )}

              {tourStep === 2 && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">3. Generative Engine Optimization (GEO)</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    Stay ahead of Google's AI Overviews, ChatGPT Search, and Gemini. Identify which prompts recommend your clients and discover new citation opportunities.
                  </p>
                  <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900 font-mono">
                    ✓ Brand Sentiment Tracking • Citation URL Analysis • Share of Voice
                  </div>
                </div>
              )}

              {tourStep === 3 && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">4. Embeddable Lead Generator Widget</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    Convert agency website visitors into paying clients. Embed a customized on-page SEO audit widget on your site that captures visitor name, email, and website url.
                  </p>
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-amber-900 font-mono">
                    ✓ Automatic Lead Audit Delivery • CRM Webhook Integrations
                  </div>
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

                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((step) => (
                    <button
                      key={step}
                      onClick={() => setTourStep(step)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        tourStep === step ? 'bg-[#0B69FF] w-6' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {tourStep < 3 ? (
                  <button
                    onClick={() => setTourStep((prev) => Math.min(3, prev + 1))}
                    className="px-5 py-2 rounded-lg bg-[#0B69FF] text-white text-xs font-bold"
                  >
                    Next
                  </button>
                ) : (
                  <Link
                    href="/signup"
                    onClick={() => setIsProductTourOpen(false)}
                    className="px-5 py-2 rounded-lg bg-[#0B69FF] hover:bg-[#0052cc] text-white text-xs font-bold"
                  >
                    Start Free Trial
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
