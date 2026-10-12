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
  Gauge,
  CheckCircle,
  AlertTriangle,
  FileCheck,
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

// Mock competitor content benchmark
const mockBenchmarkData = [
  { metric: 'Word count', yourPage: 1420, serpAvg: 2150, status: 'Needs +730 words' },
  { metric: 'Keyword in Title', yourPage: 1, serpAvg: 1, status: 'Passed' },
  { metric: 'Keyword in H1', yourPage: 1, serpAvg: 1, status: 'Passed' },
  { metric: 'Keyword density', yourPage: '1.2%', serpAvg: '1.8%', status: 'Add 4 mentions' },
  { metric: 'Images with ALT', yourPage: '60%', serpAvg: '95%', status: 'Fix 3 images' },
  { metric: 'Internal links', yourPage: 8, serpAvg: 14, status: 'Add 6 internal links' },
];

export default function OnPageSeoCheckerPage() {
  const [showHelloBar, setShowHelloBar] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search input state
  const [pageUrl, setPageUrl] = useState('https://seranking.com/blog/seo-checklist');
  const [targetKeyword, setTargetKeyword] = useState('seo checklist');
  const [countryCode, setCountryCode] = useState('US');

  // Sub tab switcher
  const [activeTab, setActiveTab] = useState<'content' | 'meta' | 'technical' | 'links'>('content');

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Product tour modal
  const [isProductTourOpen, setIsProductTourOpen] = useState(false);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const faqs = [
    {
      q: 'How does SE Ranking’s On-Page SEO Checker work?',
      a: 'The tool compares your specific webpage URL against the top 10 to 20 organic ranking competitors on Google for your target keyword. It evaluates content length, keyword density, semantic LSI keywords, heading hierarchy, image optimization, Core Web Vitals, and backlink requirements to generate a prioritized step-by-step action plan.',
    },
    {
      q: 'What is the On-Page SEO Score?',
      a: 'The On-Page SEO Score is a benchmark from 0 to 100 based on Google search ranking factors and top-performing SERP rivals. A score above 80 indicates that your content and technical setup match or exceed the standard set by the top 3 ranking competitors.',
    },
    {
      q: 'Can it suggest NLP and semantic keywords to include?',
      a: 'Yes. Our AI and NLP algorithms extract the exact topical phrases, entities, and secondary search queries that high-ranking pages use, showing you which terms to add to your copy to improve relevance without keyword stuffing.',
    },
    {
      q: 'Does it check schema markup and structured data?',
      a: 'Yes. It verifies JSON-LD, Microdata, Open Graph tags, and Twitter Cards to ensure your page qualifies for rich snippets like FAQs, star ratings, and product cards in SERPs.',
    },
    {
      q: 'Can I track on-page score changes over time?',
      a: 'Yes. Every time you update your content, re-audit the page with one click to see how your score improves and monitor your ranking movement.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Top Hello Bar matching official SE Ranking announcement */}
      {showHelloBar && (
        <div className="bg-[#00B074] text-white text-xs sm:text-sm font-semibold py-2 px-4 flex items-center justify-between text-center relative z-50">
          <div className="flex-1 flex items-center justify-center gap-2">
            <span>🚀 Benchmark your content against top 10 Google results with On-Page SEO Checker!</span>
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
                      className="p-2.5 rounded-lg bg-blue-50 text-[#0B69FF] flex items-center gap-3 text-xs font-bold"
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
            <Link href="/website-audit-tool" className="block text-base font-medium text-gray-800 py-2">
              Website Audit
            </Link>
            <Link href="/on-page-seo-checker" className="block text-base font-bold text-[#0B69FF] py-2">
              On-Page SEO Checker
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
            On-Page SEO Checker
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-normal">
            Optimize your web pages for target keywords with step-by-step actionable recommendations based on top-ranking SERP competitors.
          </p>

          {/* Interactive URL + Keyword Form */}
          <div className="mt-8 max-w-2xl mx-auto bg-white p-2.5 rounded-2xl shadow-xl border border-gray-200/80">
            <form onSubmit={handleCheck} className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50/70 rounded-xl border border-gray-200/60 w-full">
                  <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={pageUrl}
                    onChange={(e) => setPageUrl(e.target.value)}
                    placeholder="Enter URL e.g. https://domain.com/blog-post"
                    className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>

                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50/70 rounded-xl border border-gray-200/60 w-full">
                  <Key className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    placeholder="Enter target keyword"
                    className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                  <span>Location:</span>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-transparent text-gray-900 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="US">🇺🇸 United States (Google.com)</option>
                    <option value="UK">🇬🇧 United Kingdom (Google.co.uk)</option>
                    <option value="DE">🇩🇪 Germany (Google.de)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0B69FF] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Audit page</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
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
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-gray-900 font-bold">AI-Powered</span>
              <span className="text-gray-500">NLP Suggestions</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0B69FF]" />
              <span className="text-gray-900 font-bold">1,200,000+</span>
              <span className="text-gray-500">Global SEO users</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION 2: ON-PAGE SCORE SIMULATOR & BENCHMARK */}
      <section className="py-20 bg-gray-50/60 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Actionable recommendations based on real SERP leaders
            </h2>
            <p className="mt-3 text-base text-gray-600">
              See exactly how your page stacks up against the top 10 competitors currently ranking on Google.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xl overflow-hidden p-6 sm:p-8">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500 shrink-0">
                  <span className="text-xl font-black text-emerald-600">78</span>
                  <span className="text-[9px] font-bold text-gray-400 absolute bottom-1">/100</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    On-Page SEO Score: Good
                  </h3>
                  <p className="text-xs text-gray-500">Target Keyword: <span className="font-bold text-gray-700">&ldquo;{targetKeyword}&rdquo;</span> • 6 priority fixes found</p>
                </div>
              </div>

              {/* Sub tabs */}
              <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl text-xs font-bold">
                {[
                  { id: 'content', label: 'Content & Words' },
                  { id: 'meta', label: 'Meta & Headings' },
                  { id: 'technical', label: 'Tech & Speed' },
                  { id: 'links', label: 'Internal Links' },
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

            {/* Benchmark Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Ranking Factor</th>
                    <th className="py-3 px-4">Your Page</th>
                    <th className="py-3 px-4">Top 10 Competitors Avg</th>
                    <th className="py-3 px-4">Action Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {mockBenchmarkData.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/60">
                      <td className="py-3 px-4 font-bold text-gray-900">{row.metric}</td>
                      <td className="py-3 px-4 text-gray-700">{row.yourPage}</td>
                      <td className="py-3 px-4 text-gray-500">{row.serpAvg}</td>
                      <td className="py-3 px-4">
                        {row.status === 'Passed' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3" /> Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> {row.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Want to analyze all your key landing pages automatically?
              </span>
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-[#0B69FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Audit your entire website</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION 3: 4 Feature Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              A complete on-page SEO checklist for every URL
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Eliminate guesswork with clear recommendations powered by AI and competitive SERP data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B69FF] flex items-center justify-center mb-5 font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Content & NLP Terms</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                See which related phrases, semantic terms, and entities the top Google results are using. Get exact recommendations on where and how often to include them.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-emerald-50/40 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-5 font-bold">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Meta Tags & SERP Snippet Preview</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Verify title and description lengths with real-time desktop and mobile previews. Check click-through rate factors and avoid snippet truncation.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-purple-50/40 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-5 font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Heading Structure & Outline</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Analyze your H1, H2, and H3 outline. Ensure your primary and secondary keywords are placed strategically throughout the document hierarchy.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 font-bold">
                <Gauge className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Technical & Usability Factors</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Check URL structure, canonical tags, schema markup validation, image alt attributes, and mobile responsiveness in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 4: MID-PAGE CTA */}
      <section className="py-16 bg-[#0B69FF] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Optimize your pages and rank higher on Google today
          </h2>
          <p className="mt-3 text-base text-blue-100 max-w-xl mx-auto">
            Audit your highest-value URLs and unlock effortless on-page optimization.
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

      {/* 7. FAQ ACCORDION */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Common questions about SE Ranking On-Page SEO Checker.
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
              <li><Link href="/on-page-seo-checker" className="text-[#0B69FF] font-bold">On-Page SEO Checker</Link></li>
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
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">On-Page SEO Checker Tour</h3>
              <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                Explore how SE Ranking audits your content, headings, and NLP entities against top Google SERP competitors.
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
