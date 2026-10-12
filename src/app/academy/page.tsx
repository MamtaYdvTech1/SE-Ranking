'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Award,
  BookOpen,
  Clock,
  Users,
  Search,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
  FileSearch,
  Target,
  Key,
  Globe,
  Briefcase,
  Menu,
  X,
  Star,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

interface Course {
  id: string;
  category: 'all' | 'agencies' | 'technical' | 'local';
  title: string;
  instructor: string;
  role: string;
  duration: string;
  lessons: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  badge?: string;
}

const courses: Course[] = [
  {
    id: 'c1',
    category: 'all',
    title: 'Getting started: Mastering the fundamentals of SE Ranking',
    instructor: 'Travis Jamison',
    role: 'Head of Content at SE Ranking',
    duration: '45 mins',
    lessons: 8,
    level: 'Beginner',
    description: 'Learn how to set up your first project, track rankings, configure automated reports, and navigate the platform like a pro.',
    badge: 'Popular',
  },
  {
    id: 'c2',
    category: 'all',
    title: 'Keyword Research Masterclass: Finding High-Intent Search Queries',
    instructor: 'Elena Vasylyshyna',
    role: 'Senior SEO Strategist',
    duration: '1 hr 10 mins',
    lessons: 6,
    level: 'Intermediate',
    description: 'Uncover untapped keyword opportunities with Keyword Tool, analyze search intent, and group keywords into high-converting topical clusters.',
  },
  {
    id: 'c3',
    category: 'technical',
    title: 'Technical SEO Audit: Diagnosing and Fixing 100+ Website Errors',
    instructor: 'Marcus Stone',
    role: 'Technical SEO Specialist',
    duration: '1 hr 30 mins',
    lessons: 9,
    level: 'Advanced',
    description: 'Deep dive into crawl budgets, indexing issues, canonical tags, Core Web Vitals optimization, and 404 redirect loop fixes.',
    badge: 'Certified',
  },
  {
    id: 'c4',
    category: 'agencies',
    title: 'The Agency Growth Playbook: Scaling Client SEO Retainers',
    instructor: 'Callum Sherwood',
    role: 'Agency Growth Consultant',
    duration: '55 mins',
    lessons: 7,
    level: 'Intermediate',
    description: 'How to pitch SEO services, white-label client portals, streamline monthly reporting, and retain high-value agency clients for years.',
  },
  {
    id: 'c5',
    category: 'local',
    title: 'Local SEO Mastery: Dominating Google Maps & 3-Pack Rankings',
    instructor: 'Sarah Jenkins',
    role: 'Local Marketing Lead',
    duration: '50 mins',
    lessons: 5,
    level: 'Beginner',
    description: 'Optimize Google Business Profiles, automate customer review acquisition, build high-authority citations, and rank in localized SERPs.',
  },
  {
    id: 'c6',
    category: 'technical',
    title: 'Competitive Intelligence: Reverse Engineering SERP Rivals',
    instructor: 'David Miller',
    role: 'Competitive Intelligence Director',
    duration: '1 hr 15 mins',
    lessons: 8,
    level: 'Intermediate',
    description: 'Analyze competitors’ organic search traffic, paid Google Ads, keyword gaps, and backlink strategies to outrank them.',
  },
  {
    id: 'c7',
    category: 'all',
    title: 'Backlink Building & Link Profile Auditing in 2026',
    instructor: 'Nate Thompson',
    role: 'Off-Page SEO Lead',
    duration: '1 hr',
    lessons: 6,
    level: 'Advanced',
    description: 'Evaluate link authority with Domain Trust, filter toxic links, perform backlink gap analysis, and execute safe outreach campaigns.',
  },
  {
    id: 'c8',
    category: 'agencies',
    title: 'White-Label Reporting & Automated SEO Client Portals',
    instructor: 'Jessica Alvarez',
    role: 'Product Specialist',
    duration: '40 mins',
    lessons: 4,
    level: 'Beginner',
    description: 'Create custom branded reports with your agency logo and domain name, schedule email deliveries, and share live client dashboard links.',
  },
];

export default function AcademyPage() {
  const [showHelloBar, setShowHelloBar] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'agencies' | 'technical' | 'local'>('all');
  const [enrolledCourse, setEnrolledCourse] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredCourses =
    activeCategory === 'all'
      ? courses
      : courses.filter((c) => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Top Hello Bar */}
      {showHelloBar && (
        <div className="bg-[#00B074] text-white text-xs sm:text-sm font-semibold py-2 px-4 flex items-center justify-between text-center relative z-50">
          <div className="flex-1 flex items-center justify-center gap-2">
            <span>Discover organic growth with Visibility Index</span>
            <Link href="/signup" className="underline font-bold hover:text-white/90 transition-colors ml-1">
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

      {/* 2. Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <SeRankingLogo variant="dark" width={138} height={30} />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-[14px] font-medium text-gray-800">
              <Link href="/for-agencies" className="hover:text-[#0B69FF] font-semibold transition-colors">
                Solutions
              </Link>
              <Link href="/keyword-rank-tracker" className="hover:text-[#0B69FF] font-semibold transition-colors">
                Tools
              </Link>
              <Link href="/pricing" className="hover:text-[#0B69FF] font-semibold transition-colors">
                Pricing
              </Link>
              <Link href="/academy" className="text-[#0B69FF] font-bold">
                Academy
              </Link>
              <Link href="/podcast" className="hover:text-[#0B69FF] font-semibold transition-colors">
                Podcast
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-[#0B69FF] px-3 py-2">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-[#0B69FF] hover:bg-blue-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all"
            >
              Start free trial
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION - Exact Match to Screenshot */}
      <section className="pt-16 pb-12 bg-gradient-to-b from-blue-50/50 via-white to-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0f172a] tracking-tight leading-[1.12]">
            SE Ranking Academy
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-normal">
            Free online SEO courses, certificates, and guides taught by top industry experts. Master SE Ranking and rank #1 on Google.
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href="#courses"
              className="px-8 py-3.5 bg-[#0B69FF] hover:bg-blue-600 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Start learning</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* 3 Stat/Benefit Cards matching screenshot */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            {/* Card 1: Free */}
            <div className="p-6 rounded-2xl bg-[#E0F2FE] border border-blue-200">
              <div className="w-10 h-10 rounded-xl bg-white text-[#0B69FF] flex items-center justify-center font-black mb-4 shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-[#0f172a]">Free</h3>
              <p className="text-xs text-gray-600 mt-1 font-medium">100% free courses &amp; resources</p>
            </div>

            {/* Card 2: Expert-led */}
            <div className="p-6 rounded-2xl bg-[#0f172a] text-white">
              <div className="w-10 h-10 rounded-xl bg-gray-800 text-white flex items-center justify-center font-black mb-4 shadow-xs">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-black text-white">Expert-led</h3>
              <p className="text-xs text-gray-300 mt-1 font-medium">Practical advice from seasoned SEOs</p>
            </div>

            {/* Card 3: Certifications */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-black mb-4 shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-white">Certifications</h3>
              <p className="text-xs text-purple-100 mt-1 font-medium">Earn recognized badges for LinkedIn</p>
            </div>
          </div>

          {/* Student Photo Banner matching screenshot */}
          <div className="mt-10 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black uppercase">
                Free for all
              </span>
              <span className="text-sm font-bold text-gray-900">
                Over 20,000+ marketers and agencies certified worldwide
              </span>
            </div>
            <div className="flex text-amber-400 text-sm">
              {'★'.repeat(5)}
              <span className="text-xs font-bold text-gray-700 ml-1.5">4.9 / 5</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION 2: FEATURED COURSE SHOWCASE */}
      <section className="py-20 bg-gray-50/60 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Expand your SEO expertise with SE Ranking
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Interactive video courses designed to take you from beginner to advanced SEO strategist.
            </p>
          </div>

          {/* Featured Course Hero Card */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 mb-8">
            <div className="lg:col-span-7 bg-[#0B0F19] text-white p-8 flex flex-col justify-between relative">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#0B69FF] text-white text-xs font-black uppercase">
                  Featured Course
                </span>
                <span className="text-xs text-gray-400">8 Lessons • 45 Minutes</span>
              </div>

              <div className="py-12">
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Getting started: Mastering the fundamentals of SE Ranking
                </h3>
                <p className="mt-3 text-sm text-gray-300 leading-relaxed max-w-lg">
                  Learn how to configure your projects, run comprehensive website audits, track keyword positions across 190+ search engines, and automate client reporting.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Certificate included</span>
                </div>
                <button
                  onClick={() => setEnrolledCourse('c1')}
                  className="px-6 py-2.5 bg-[#0B69FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Watch course</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-blue-50/80 to-white p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100">
              <div>
                <span className="text-xs font-bold text-[#0B69FF] uppercase tracking-wider">What you will learn</span>
                <ul className="mt-4 space-y-3 text-xs text-gray-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>How to set up domain projects &amp; competitor tracking</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>How to interpret Website Audit health scores &amp; fix critical errors</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>How to perform Keyword Research and discover high-intent keywords</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>How to build automated white-label client PDF reports</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0B69FF] flex items-center justify-center font-bold text-sm">
                    TJ
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Travis Jamison</div>
                    <div className="text-[11px] text-gray-500">Head of Content at SE Ranking</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION 3: ALL COURSES & CERTIFICATIONS */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                All courses and certifications
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Explore our full library of on-demand SEO and agency training modules.
              </p>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-bold">
              {[
                { id: 'all', label: 'All courses' },
                { id: 'agencies', label: 'For Agencies' },
                { id: 'technical', label: 'Technical SEO' },
                { id: 'local', label: 'Local SEO' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveCategory(t.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeCategory === t.id
                      ? 'bg-white text-[#0B69FF] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                    <span className="font-semibold text-[#0B69FF] bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {c.level}
                    </span>
                    <span>{c.duration} • {c.lessons} lessons</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0B69FF] transition-colors leading-snug">
                    {c.title}
                  </h3>

                  <p className="mt-2.5 text-xs text-gray-600 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Instructor</span>
                    <span className="text-xs font-bold text-gray-900">{c.instructor}</span>
                  </div>

                  <button
                    onClick={() => setEnrolledCourse(c.id)}
                    className="px-4 py-2 bg-[#0B69FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Enroll free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SECTION 4: MORE RESOURCES TO SUPPORT YOUR GROWTH */}
      <section className="py-20 bg-gray-50/70 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
              More resources to support your growth
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Continue exploring tutorials, podcasts, product updates, and community guides.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/help"
              className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B69FF] flex items-center justify-center font-bold mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#0B69FF]">Help Center</h3>
              <p className="text-xs text-gray-500 mt-1">Detailed documentation and tool walkthroughs.</p>
            </Link>

            <Link
              href="/whats-new"
              className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#0B69FF]">What&apos;s New</h3>
              <p className="text-xs text-gray-500 mt-1">Latest product releases and algorithmic features.</p>
            </Link>

            <Link
              href="/podcast"
              className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#0B69FF]">Dofollow Podcast</h3>
              <p className="text-xs text-gray-500 mt-1">Interviews with search leaders and founders.</p>
            </Link>

            <a
              href="https://seranking.com/blog/"
              target="_blank"
              rel="noreferrer"
              className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#0B69FF] flex items-center gap-1">
                <span>SE Ranking Blog</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </h3>
              <p className="text-xs text-gray-500 mt-1">In-depth research studies, experiments, and guides.</p>
            </a>
          </div>
        </div>
      </section>

      {/* 7. SECTION 5: DARK GREEN QUOTE BANNER */}
      <section className="py-16 bg-[#04281E] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <blockquote className="text-lg sm:text-xl font-medium leading-relaxed italic text-emerald-100">
            &ldquo;SE Ranking Academy transformed how our 14-person agency trains junior SEOs. The certifications helped us standardize our audit deliverables and build instant trust with new enterprise clients.&rdquo;
          </blockquote>
          <div className="mt-4 font-bold text-white text-sm">Liam Wright</div>
          <div className="text-xs text-emerald-300">VP of SEO &amp; Organic Growth, Hyperion Digital</div>
        </div>
      </section>

      {/* 8. SECTION 6: BLUE CTA BANNER */}
      <section className="py-16 bg-[#0B69FF] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Get 14 days of full access to the SE Ranking platform
          </h2>
          <p className="mt-3 text-base text-blue-100 max-w-xl mx-auto">
            Test all tools risk-free. No credit card required. Cancel anytime.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-[#0B69FF] hover:bg-gray-100 font-extrabold text-base rounded-xl shadow-lg transition-all"
            >
              Start 14-day free trial
            </Link>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
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
            <h5 className="font-bold text-gray-900 mb-3 text-sm">Resources</h5>
            <ul className="space-y-2">
              <li><Link href="/academy" className="text-[#0B69FF] font-bold">SE Ranking Academy</Link></li>
              <li><Link href="/podcast" className="hover:text-blue-600">Dofollow Podcast</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-600">Pricing</Link></li>
              <li><Link href="/help" className="hover:text-blue-600">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 text-sm">Download</h5>
            <div className="space-y-2 text-xs text-gray-500">
              <div>Available on iOS &amp; Android</div>
              <p className="text-[11px] text-gray-400 mt-4">
                © {new Date().getFullYear()} SE Ranking. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Enrollment Modal */}
      {enrolledCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl text-center">
            <button
              onClick={() => setEnrolledCourse(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Enrolled Successfully!</h3>
            <p className="text-xs text-gray-600 mt-2">
              You now have free lifetime access to this course and its certification test.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setEnrolledCourse(null)}
                className="px-6 py-2.5 bg-[#0B69FF] text-white font-bold rounded-xl text-xs hover:bg-blue-600"
              >
                Start Watching Lesson 1
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
