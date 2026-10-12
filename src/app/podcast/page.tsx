'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Headphones,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Share2,
  Calendar,
  Clock,
  Menu,
  X,
  Radio,
  Sparkles,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

interface Episode {
  id: number;
  date: string;
  duration: string;
  title: string;
  guest: string;
  role: string;
  description: string;
  audioUrl?: string;
}

const episodes: Episode[] = [
  {
    id: 1,
    date: 'October 14, 2026',
    duration: '48 mins',
    title: 'Multi-platform search is here: Building brand visibility across Google, TikTok, and new search engines',
    guest: 'Adriana Tica',
    role: 'Founder of Idunn & Co-founder of Copywrite',
    description:
      'Adriana Tica explores why modern search strategies cannot rely solely on Google. Learn how users discover products and information through TikTok, Pinterest, Reddit, YouTube, and AI assistants, and how agencies can measure multi-touch organic performance.',
  },
  {
    id: 2,
    date: 'October 02, 2026',
    duration: '42 mins',
    title: 'The SEO Agency Renaissance with Callum Sherwood of Ecomedia Group Pty Ltd',
    guest: 'Callum Sherwood',
    role: 'Managing Director at Ecomedia Group',
    description:
      'Callum Sherwood discusses scaling an Australian digital agency to 7 figures, moving away from low-retainer models, integrating automated client reporting, and building lasting client retention strategies.',
  },
  {
    id: 3,
    date: 'September 18, 2026',
    duration: '54 mins',
    title: "Generational AI won't destroy SEO: Re-engineering search strategy for the future of search",
    guest: 'Jill Kocher Brown',
    role: 'Director of SEO at JumpFly',
    description:
      'Jill Kocher Brown breaks down how LLMs and generative search engines process intent, why technical SEO fundamentals still reign supreme, and how forward-thinking brands can optimize for AI Overviews.',
  },
  {
    id: 4,
    date: 'September 04, 2026',
    duration: '39 mins',
    title: "AI-ready schemas: Feeding Google's new answer engines with structured data",
    guest: 'Martha van Berkel',
    role: 'CEO of Schema App',
    description:
      "Martha van Berkel explains how semantic knowledge graphs, entity disambiguation, and JSON-LD structured data feed Google's search algorithms and modern AI assistants with structured facts.",
  },
  {
    id: 5,
    date: 'August 21, 2026',
    duration: '46 mins',
    title: 'The AI reality: No hype, forgotten fundamentals in SEO',
    guest: 'Dan Petrovic',
    role: 'Managing Director of DEJAN Marketing',
    description:
      'Dan Petrovic shares findings from real test experiments on how AI-generated text ranks, search penalty risks, and why original primary research remains the ultimate ranking moat in the generative AI era.',
  },
  {
    id: 6,
    date: 'August 07, 2026',
    duration: '44 mins',
    title: 'The SEO Agency Renaissance with Ryan Draving of SMB Marketing',
    guest: 'Ryan Draving',
    role: 'Head of Growth at SMB Marketing',
    description:
      'Ryan Draving dives into agency pricing models, client retention secrets, value-based billing vs hourly rates, and how building automated reporting workflows transforms customer loyalty.',
  },
  {
    id: 7,
    date: 'July 24, 2026',
    duration: '38 mins',
    title: 'Building a Sustainable SEO Strategy for Local Businesses',
    guest: 'Marcus Finch',
    role: 'Local SEO Lead at BrightLocal',
    description:
      'Local search playbook: Google Business Profile optimization, localized landing page architecture, citation building, customer review automation, and geo-targeted ranking tactics that survive core algorithm updates.',
  },
  {
    id: 8,
    date: 'July 10, 2026',
    duration: '50 mins',
    title: 'The SEO Agency Renaissance with Nancy Shenou of Turbov Digital',
    guest: 'Nancy Shenou',
    role: 'Founder & CEO of Turbov Digital',
    description:
      'Nancy shares how transitioning from transactional SEO to strategic brand partnerships helped her boutique agency scale retainer contracts by 300% while reducing team burnout.',
  },
  {
    id: 9,
    date: 'June 26, 2026',
    duration: '41 mins',
    title: 'Driving Real Revenue with SEO: Unpacking Demand Generation, Attribution & AI',
    guest: 'Alex Birkett',
    role: 'Co-founder of Omniscient Media',
    description:
      'Connecting organic search traffic directly to pipeline and closed revenue. How modern content teams avoid vanity metrics and use attribution modeling to prove clear ROI to executives.',
  },
  {
    id: 10,
    date: 'June 12, 2026',
    duration: '47 mins',
    title: 'The SEO Agency Renaissance with Tom Vangelis of Faros',
    guest: 'Tom Vangelis',
    role: 'Principal Consultant at Faros Strategy',
    description:
      'Tom shares lessons from managing international multilingual enterprise SEO campaigns and navigating Google core algorithmic updates across 20+ countries.',
  },
];

export default function PodcastPage() {
  const [showHelloBar, setShowHelloBar] = useState(true);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const togglePlay = (id: number) => {
    setPlayingId(playingId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#080C15] text-white font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Top Announcement Bar */}
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
      <header className="sticky top-0 z-40 bg-[#080C15]/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <SeRankingLogo variant="white" width={138} height={30} />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-[14px] font-medium text-gray-300">
              <Link href="/for-agencies" className="hover:text-white transition-colors">
                Solutions
              </Link>
              <Link href="/keyword-rank-tracker" className="hover:text-white transition-colors">
                Tools
              </Link>
              <Link href="/pricing" className="hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/academy" className="hover:text-white transition-colors">
                Academy
              </Link>
              <Link href="/podcast" className="text-[#0B69FF] font-bold">
                Podcast
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-300 hover:text-white px-3 py-2">
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
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0F172A] border-b border-gray-800 px-4 py-4 space-y-3">
            <Link href="/pricing" className="block text-base text-gray-200">
              Pricing
            </Link>
            <Link href="/academy" className="block text-base text-gray-200">
              Academy
            </Link>
            <Link href="/podcast" className="block text-base text-[#0B69FF] font-bold">
              Podcast
            </Link>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION - Exact Match to Screenshot */}
      <section className="pt-20 pb-16 px-4 text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Dofollow graphic header with headphones curve */}
          <div className="inline-flex flex-col items-center mb-6">
            <div className="w-16 h-8 border-t-2 border-x-2 border-gray-400 rounded-t-full mb-1 opacity-70" />
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white flex items-center justify-center gap-1 font-mono">
              <span>&ldquo;dofollow&rdquo;</span>
            </h1>
            <span className="text-lg sm:text-xl font-medium tracking-widest text-gray-400 uppercase mt-1">
              podcast
            </span>
          </div>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal">
            A podcast about search, SEO, and marketing with industry leaders, practitioners, and friends. Hosted by Travis and the SE Ranking team.
          </p>

          <p className="mt-8 text-xs font-bold uppercase tracking-wider text-gray-400">
            Listen on your favorite platform
          </p>

          {/* Platform listen buttons matching screenshot */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://podcasts.apple.com"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-800 text-xs font-bold text-gray-200 hover:text-white flex items-center gap-2.5 transition-all shadow-sm"
            >
              <span className="text-purple-400">🟣</span>
              <span>Apple Podcasts</span>
            </a>

            <a
              href="https://spotify.com"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-800 text-xs font-bold text-gray-200 hover:text-white flex items-center gap-2.5 transition-all shadow-sm"
            >
              <span className="text-emerald-400">🟢</span>
              <span>Spotify</span>
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-800 text-xs font-bold text-gray-200 hover:text-white flex items-center gap-2.5 transition-all shadow-sm"
            >
              <span className="text-rose-500">🔴</span>
              <span>YouTube</span>
            </a>

            <a
              href="#"
              className="px-5 py-2.5 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-800 text-xs font-bold text-gray-200 hover:text-white flex items-center gap-2.5 transition-all shadow-sm"
            >
              <span className="text-amber-400">📻</span>
              <span>RSS Feed</span>
            </a>
          </div>
        </div>
      </section>

      {/* 4. EPISODES LIST - Exact Match to Screenshot */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          {episodes.map((ep) => {
            const isPlaying = playingId === ep.id;
            return (
              <article
                key={ep.id}
                className="bg-[#0D1321] rounded-2xl p-6 sm:p-8 border border-gray-800/80 hover:border-gray-700 transition-all shadow-lg relative group"
              >
                {/* Meta info */}
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span>{ep.date}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span>{ep.duration}</span>
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug group-hover:text-blue-400 transition-colors">
                  {ep.title}
                </h2>

                {/* Guest & Description */}
                <p className="mt-3 text-sm text-gray-300 leading-relaxed">
                  <span className="font-semibold text-white">{ep.guest}</span>
                  {ep.role && <span className="text-gray-400"> ({ep.role})</span>}
                  {' — '}
                  {ep.description}
                </p>

                {/* Interactive Player Action */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-800/80">
                  <button
                    onClick={() => togglePlay(ep.id)}
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#0B69FF] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause episode</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Listen to episode</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="hover:text-white cursor-pointer flex items-center gap-1">
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </span>
                  </div>
                </div>

                {/* Simulated Audio Player if playing */}
                {isPlaying && (
                  <div className="mt-4 p-3 bg-gray-900/90 rounded-xl border border-blue-500/40 flex items-center gap-3 text-xs animate-in fade-in duration-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-blue-400">Now playing:</span>
                    <span className="truncate flex-1 text-gray-300">{ep.title}</span>
                    <span className="font-mono text-gray-400">12:45 / {ep.duration}</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Pagination matching screenshot */}
        <div className="mt-12 flex items-center justify-center gap-2 text-sm font-bold text-gray-400">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === page
                  ? 'bg-[#0B69FF] text-white'
                  : 'bg-gray-900 border border-gray-800 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
            className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="mt-20 border-t border-gray-800 text-gray-400 text-xs py-14 bg-[#050811]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div>
            <div className="mb-4">
              <SeRankingLogo variant="white" width={130} height={28} />
            </div>
            <p className="text-gray-500 leading-relaxed">
              All-in-one SEO and digital marketing platform built for agencies, enterprises, and growing businesses.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 text-sm">Core SEO Tools</h5>
            <ul className="space-y-2">
              <li><Link href="/keyword-rank-tracker" className="hover:text-blue-400">Rank Tracker</Link></li>
              <li><Link href="/keyword-tool" className="hover:text-blue-400">Keyword Tool</Link></li>
              <li><Link href="/website-audit-tool" className="hover:text-blue-400">Website Audit</Link></li>
              <li><Link href="/on-page-seo-checker" className="hover:text-blue-400">On-Page SEO Checker</Link></li>
              <li><Link href="/competitor-analysis-tool" className="hover:text-blue-400">Competitor Analysis Tool</Link></li>
              <li><Link href="/backlink-checker" className="hover:text-blue-400">Backlink Checker</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 text-sm">Solutions</h5>
            <ul className="space-y-2">
              <li><Link href="/for-agencies" className="hover:text-blue-400">For Agencies</Link></li>
              <li><Link href="/enterprise" className="hover:text-blue-400">Enterprise</Link></li>
              <li><Link href="/growing-business" className="hover:text-blue-400">Growing Business</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 text-sm">Resources</h5>
            <ul className="space-y-2">
              <li><Link href="/academy" className="hover:text-blue-400">SE Ranking Academy</Link></li>
              <li><Link href="/podcast" className="text-[#0B69FF] font-bold">Dofollow Podcast</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-400">Pricing</Link></li>
              <li><Link href="/help" className="hover:text-blue-400">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 text-sm">Download</h5>
            <div className="space-y-2 text-xs text-gray-500">
              <div>Available on iOS & Android</div>
              <p className="text-[11px] text-gray-600 mt-4">
                © {new Date().getFullYear()} SE Ranking. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
