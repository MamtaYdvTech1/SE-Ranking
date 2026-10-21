'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  ChevronUp,
  X,
  MessageCircle,
  Flag,
  HelpCircle,
  UserCheck,
  Folder,
  FileSearch,
  Key,
  Link2,
  Sparkles,
  PieChart,
  Package,
  MapPin,
  PenTool,
  Zap,
  ArrowRight,
  BookOpen,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { authLanguages } from '@/lib/i18n/authTranslations';

interface HelpCategory {
  id: string;
  title: string;
  desc: string;
  iconType?: string;
  articles: { title: string; readTime: string; summary: string }[];
}

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    desc: 'Everything you need for a smooth launch with SE Ranking',
    iconType: 'flag',
    articles: [
      {
        title: 'Quick Start: Setting up your first project',
        readTime: '3 min read',
        summary: 'Step-by-step instructions to create your project, input target domains, and select search engines.',
      },
      {
        title: 'Connecting Google Search Console & GA4',
        readTime: '4 min read',
        summary: 'Synchronize organic search impressions, clicks, and analytics traffic directly into your studio dashboard.',
      },
      {
        title: 'Navigating the SE Ranking workspace',
        readTime: '2 min read',
        summary: 'Understand the primary modules: Rankings, Competitors, Backlinks, Audits, and AI Search.',
      },
    ],
  },
  {
    id: 'faq',
    title: 'FAQ',
    desc: 'Find answers to common questions in one place',
    iconType: 'question',
    articles: [
      {
        title: 'How often does SE Ranking update keyword rankings?',
        readTime: '2 min read',
        summary: 'Rankings are checked daily, on-demand upon manual refresh, or on custom scheduled cadences.',
      },
      {
        title: 'What search engines and regions are supported?',
        readTime: '3 min read',
        summary: 'Over 190 countries across Google, Bing, Yahoo, YouTube, and mobile/desktop SERPs.',
      },
      {
        title: 'Can I invite clients or teammates with restricted roles?',
        readTime: '3 min read',
        summary: 'Yes, with Client Seats, Guest Links, and role-based access control under User Management.',
      },
    ],
  },
  {
    id: 'user-account',
    title: 'User account & settings',
    desc: 'Configure your account, preferences, and billing',
    iconType: 'user-gear',
    articles: [
      {
        title: 'Managing account profiles and notification alerts',
        readTime: '3 min read',
        summary: 'Change your work email, password, 2FA credentials, and daily/weekly email digests.',
      },
      {
        title: 'Subscription tiers, billing cycles, and invoice history',
        readTime: '4 min read',
        summary: 'Upgrade plans, view upcoming invoice dates, download PDF receipts, and configure payment methods.',
      },
    ],
  },
  {
    id: 'project-tools',
    title: 'Project tools',
    desc: 'Use essential tools to monitor and manage your websites',
    iconType: 'folder',
    articles: [
      {
        title: 'Configuring project search settings & target locations',
        readTime: '4 min read',
        summary: 'Define exact zip codes, cities, languages, and competitor tracking limits for every campaign.',
      },
      {
        title: 'Creating and managing Project Notes & Google Algorithm Updates',
        readTime: '3 min read',
        summary: 'Annotate rankings graphs with milestone notes and automatic Google core updates.',
      },
    ],
  },
  {
    id: 'audit-tools',
    title: 'Website Audit tools',
    desc: 'Comprehensive technical analysis of your site and pages',
    iconType: 'audit',
    articles: [
      {
        title: 'Understanding Health Score, Errors, and Warnings',
        readTime: '5 min read',
        summary: 'Deep-dive into 110+ technical SEO checks: crawlability, SSL, Core Web Vitals, and duplicate tags.',
      },
      {
        title: 'Fixing canonical issues, 404s, and redirect chains',
        readTime: '4 min read',
        summary: 'How to remediate server errors, broken anchors, and orphaned pages identified by the crawler.',
      },
    ],
  },
  {
    id: 'seo-research',
    title: 'SEO Research tools',
    desc: 'Keyword and domain insights across organic and paid search',
    iconType: 'wrench',
    articles: [
      {
        title: 'Competitive Research: Analyzing competitor keywords and traffic',
        readTime: '4 min read',
        summary: 'Uncover organic keyword overlap, paid Google Ads copy, and estimated monthly visits.',
      },
      {
        title: 'Keyword Suggestion tool & Difficulty Score calculation',
        readTime: '3 min read',
        summary: 'Evaluate search volume trends, intent badges (Informational, Transactional), and CPC bids.',
      },
    ],
  },
  {
    id: 'backlink-tools',
    title: 'Backlink tools',
    desc: 'Evaluate link profiles and uncover new backlink opportunities',
    iconType: 'link',
    articles: [
      {
        title: 'Backlink Checker: Domain Trust & Page Trust metrics',
        readTime: '4 min read',
        summary: 'Analyze referring domains, dofollow/nofollow ratio, anchor text distribution, and toxic links.',
      },
      {
        title: 'Backlink Gap Analyzer: Finding link intersect opportunities',
        readTime: '3 min read',
        summary: 'Compare your backlink profile against 5 competitors simultaneously to discover high-value link gaps.',
      },
    ],
  },
  {
    id: 'ai-search',
    title: 'AI Search',
    desc: 'Monitor AI-driven snippets and stay ahead in AI-powered search',
    iconType: 'sparkles',
    articles: [
      {
        title: 'Tracking Google AI Overviews and ChatGPT Citations',
        readTime: '4 min read',
        summary: 'Identify queries triggering AI generative summaries and track if your domain is cited as a source.',
      },
      {
        title: 'Optimizing content for Perplexity, Copilot, and Gemini',
        readTime: '5 min read',
        summary: 'Structure schema markup, conversational headers, and concise answers to capture AI snippet real estate.',
      },
    ],
  },
  {
    id: 'seo-reporting',
    title: 'SEO Reporting',
    desc: 'Create customizable drag-and-drop reports for teams and clients',
    iconType: 'chart',
    articles: [
      {
        title: 'Building automated White-Label reports with Report Builder',
        readTime: '4 min read',
        summary: 'Add company logos, custom palettes, custom introductory notes, and automate weekly scheduled PDF sends.',
      },
    ],
  },
  {
    id: 'agency-pack',
    title: 'Agency Pack',
    desc: 'White-label tools designed for agency growth and branding',
    iconType: 'cube',
    articles: [
      {
        title: 'Setting up custom CNAME domains and White-Label login portals',
        readTime: '5 min read',
        summary: 'Host SE Ranking under your own agency domain with custom favicon and email sender addresses.',
      },
      {
        title: 'Listing your agency in SE Ranking’s Agency Catalog',
        readTime: '3 min read',
        summary: 'Attract qualified client leads by publishing your agency profile, portfolio, and verified badges.',
      },
    ],
  },
  {
    id: 'local-marketing',
    title: 'Local Marketing',
    desc: 'Boost your local search visibility and Google Maps rankings',
    iconType: 'pin',
    articles: [
      {
        title: 'Google Business Profile (GBP) sync & Grid Rank Tracker',
        readTime: '4 min read',
        summary: 'Track geo-specific 3-pack rankings across customized radial coordinates and city centers.',
      },
      {
        title: 'Reputation Management & Review monitoring',
        readTime: '3 min read',
        summary: 'Receive instant notifications for new client reviews across Google, Yelp, and Facebook.',
      },
    ],
  },
  {
    id: 'content-marketing',
    title: 'Content Marketing',
    desc: 'AI-assisted content creation and insights for top rankings',
    iconType: 'note-pen',
    articles: [
      {
        title: 'Content Editor: Optimizing articles in real-time with NLP terms',
        readTime: '4 min read',
        summary: 'Analyze top 10 SERP competitors to gauge recommended word count, heading density, and related terms.',
      },
      {
        title: 'AI Content Generation & plagiarism verification',
        readTime: '3 min read',
        summary: 'Generate outlines, meta titles, paragraphs, and check uniqueness directly inside the studio.',
      },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    desc: 'Connect your favorite tools with step-by-step instructions',
    iconType: 'integrations',
    articles: [
      {
        title: 'Google Looker Studio (formerly Data Studio) connector',
        readTime: '4 min read',
        summary: 'Stream live ranking positions and backlink growth directly into your custom Looker dashboards.',
      },
      {
        title: 'Zapier, Slack, and Webhook alert integrations',
        readTime: '3 min read',
        summary: 'Receive instant notifications in Slack channels when significant ranking drops or gains occur.',
      },
    ],
  },
  {
    id: 'mcp-hub',
    title: 'MCP Hub',
    desc: 'Everything you need to work from your AI assistant',
    iconType: 'mcp-hub',
    articles: [
      {
        title: 'Configuring SE Ranking Model Context Protocol (MCP) in Claude Desktop',
        readTime: '4 min read',
        summary: 'Connect your live SEO databases to Claude, Cursor, and Anthropic agents via stdio and SSE servers.',
      },
      {
        title: 'Executing natural language competitive keyword queries via MCP',
        readTime: '3 min read',
        summary: 'Ask your AI assistant to generate keyword clustering, gap matrices, and audit summaries autonomously.',
      },
    ],
  },
  {
    id: 'api',
    title: 'API',
    desc: 'Build custom solutions with developer documentation',
    iconType: 'api',
    articles: [
      {
        title: 'API Authentication: Generating API keys and managing rate limits',
        readTime: '3 min read',
        summary: 'Authenticate REST API endpoints, check wallet token balance, and handle response headers.',
      },
      {
        title: 'Keywords & Rankings endpoints: Live JSON payload specs',
        readTime: '5 min read',
        summary: 'Endpoints for retrieving historical rankings, search volume, SERP competitors, and SERP features.',
      },
    ],
  },
  {
    id: 'se-visible',
    title: 'SE Visible',
    desc: "Track and compare your brand's visibility in AI search",
    iconType: 'se-visible',
    articles: [
      {
        title: 'Understanding AI Visibility Score & Share of Voice in LLMs',
        readTime: '4 min read',
        summary: 'Measure brand appearance percentages across ChatGPT, Perplexity, Google SGE, and Gemini prompts.',
      },
      {
        title: 'Sentiment and citation brand analysis for AI search engines',
        readTime: '4 min read',
        summary: 'Monitor whether AI recommendations depict your brand favorably or cite your domain as authoritative.',
      },
    ],
  },
  {
    id: 'mobile-app',
    title: 'Mobile App',
    desc: 'Access SE Ranking on the go from your smartphone',
    iconType: 'mobile-app',
    articles: [
      {
        title: 'SE Ranking for iOS & Android: Real-time rankings in your pocket',
        readTime: '2 min read',
        summary: 'Download from the Apple App Store and Google Play Store to monitor rankings changes on mobile.',
      },
      {
        title: 'Push alerts for ranking milestones and audit failures',
        readTime: '2 min read',
        summary: 'Customize instant mobile push notifications for critical site health alerts.',
      },
    ],
  },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<HelpCategory | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    document.title = 'Knowledge Base | SE Ranking Help Center';

    try {
      const isAuth =
        (typeof window !== 'undefined' &&
          (sessionStorage.getItem('seranking_auth_status') === 'logged_in' ||
            localStorage.getItem('seranking_auth_status') === 'logged_in')) ||
        (typeof document !== 'undefined' &&
          document.cookie.includes('seranking_auth_status=logged_in'));
      setIsLoggedIn(!!isAuth);
    } catch {
      // ignore
    }
  }, []);
  const [chatMessages, setChatMessages] = useState<
    { sender: 'bot' | 'user'; text: string; time: string }[]
  >([
    {
      sender: 'bot',
      text: 'Hello! Welcome to SE Ranking Support. How can we help you today?',
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const currentLangObj =
    authLanguages.find((l) => l.code === selectedLang) || authLanguages[0];

  const handleSelectLang = (code: string) => {
    setSelectedLang(code);
    setIsLangOpen(false);
    localStorage.setItem('seranking_lang', code);
  };

  const filteredCategories = HELP_CATEGORIES.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchCat =
      c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
    const matchArticle = c.articles.some(
      (a) =>
        a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)
    );
    return matchCat || matchArticle;
  });

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: 'Just now' },
    ]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Thanks for asking about "${userText}". Our support specialists are available 24/7. You can also explore our guides in the Knowledge Base above!`,
          time: 'Just now',
        },
      ]);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-gray-900 flex flex-col justify-between font-sans select-none">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-100 py-3.5 px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={isLoggedIn ? "/projects" : "/"} className="hover:opacity-90 flex items-center">
              <SeRankingLogo variant="brand" width={130} height={30} />
            </Link>
            <span className="text-[#1054E2] font-bold text-sm tracking-tight border-l border-gray-200 pl-3">
              Help Center
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-gray-700">
            <div className="hidden md:flex items-center gap-6">
              <button
                type="button"
                className="flex items-center gap-1 hover:text-[#1054E2] cursor-pointer"
              >
                <span>Getting Started</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              <button
                type="button"
                className="flex items-center gap-1 hover:text-[#1054E2] cursor-pointer"
              >
                <span>Documentation</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              <button
                type="button"
                className="flex items-center gap-1 hover:text-[#1054E2] cursor-pointer"
              >
                <span>Resources</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium px-2 py-1 rounded cursor-pointer"
                >
                  <span>{currentLangObj.short}</span>
                  <span>{currentLangObj.label}</span>
                  {isLangOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>

                {isLangOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 text-xs animate-in fade-in duration-100">
                    {authLanguages.map((lang) => {
                      const isActive = lang.code === selectedLang;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => handleSelectLang(lang.code)}
                          className={`w-full text-left px-3.5 py-2 flex items-center gap-2.5 transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 text-[#1054E2] font-bold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span
                            className={`w-6 text-center py-0.5 rounded text-[11px] font-bold shrink-0 ${
                              isActive
                                ? 'bg-[#1054E2] text-white'
                                : 'bg-[#8E9AA8] text-white'
                            }`}
                          >
                            {lang.short}
                          </span>
                          <span className="truncate">{lang.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {isLoggedIn ? (
                <Link
                  href="/projects"
                  className="px-4 py-2 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Projects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 font-bold hover:bg-gray-50 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-lg font-bold shadow-xs transition-colors"
                  >
                    Start free trial
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Royal Blue Hero Banner */}
      <section className="bg-[#1054E2] text-white py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Hi, how can we help you?
          </h1>

          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers"
              className="w-full px-5 py-3.5 pl-11 bg-white text-gray-900 rounded-xl text-sm placeholder:text-gray-400 focus:outline-hidden shadow-lg"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 17 Category Cards Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-14 w-full">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-gray-500 text-sm">
              No matching categories found for &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#1054E2] text-xs font-bold hover:underline"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => {
              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategory(cat)}
                  className="p-8 bg-white border border-gray-100 rounded-[24px] shadow-2xs hover:shadow-xl transition-all duration-200 group flex flex-col justify-between space-y-5 cursor-pointer text-left relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Render exact icons */}
                    {cat.iconType === 'mcp-hub' ? (
                      /* MCP Hub 3 connected icons */
                      <div className="flex items-center gap-2.5 py-1">
                        <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                          <Zap className="w-4 h-4 fill-white text-white" />
                        </div>
                        <div className="w-5 h-0.5 bg-gray-300 relative shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400 absolute left-1/2 -top-[2px] -translate-x-1/2" />
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#5B45FF] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <svg
                            className="w-5 h-5 fill-none stroke-white"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M7 15a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5m-7-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="w-5 h-0.5 bg-gray-300 relative shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400 absolute left-1/2 -top-[2px] -translate-x-1/2" />
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2L15 8H9L12 2ZM2 14L8 11V17L2 14ZM22 14L16 11V17L22 14Z" />
                          </svg>
                        </div>
                      </div>
                    ) : cat.iconType === 'se-visible' ? (
                      /* SE Visible with wavy topographic contours */
                      <div className="relative pt-2 pb-1">
                        <svg
                          className="absolute -top-6 -left-8 -right-8 w-[120%] h-20 text-[#00897B]/20 pointer-events-none"
                          viewBox="0 0 400 100"
                          fill="none"
                        >
                          <path
                            d="M0 15 C 60 5, 140 30, 200 15 C 260 0, 340 30, 400 15"
                            stroke="currentColor"
                            strokeWidth="1.2"
                          />
                          <path
                            d="M0 30 C 70 15, 130 45, 200 30 C 270 15, 330 45, 400 30"
                            stroke="currentColor"
                            strokeWidth="1.2"
                          />
                          <path
                            d="M0 45 C 80 25, 120 60, 200 45 C 280 30, 320 60, 400 45"
                            stroke="currentColor"
                            strokeWidth="1.2"
                          />
                        </svg>
                        <div className="w-12 h-12 rounded-xl bg-[#00897B] text-white flex items-center justify-center shadow-md relative z-10">
                          <span className="font-extrabold text-2xl tracking-tighter italic">
                            N
                          </span>
                        </div>
                      </div>
                    ) : cat.iconType === 'integrations' ? (
                      /* Integrations 3 branching nodes */
                      <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="18" cy="6" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="18" r="3" />
                          <path d="m8.5 13.5 7 3.5" />
                          <path d="m8.5 10.5 7-3.5" />
                        </svg>
                      </div>
                    ) : cat.iconType === 'api' ? (
                      /* API tech 4-dot diamond */
                      <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="2.5" />
                          <circle cx="12" cy="4" r="1.5" />
                          <circle cx="12" cy="20" r="1.5" />
                          <circle cx="4" cy="12" r="1.5" />
                          <circle cx="20" cy="12" r="1.5" />
                        </svg>
                      </div>
                    ) : cat.iconType === 'mobile-app' ? (
                      /* Mobile App with checkmark */
                      <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                        <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="5" y="2" width="14" height="20" rx="3" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      </div>
                    ) : (
                      /* Default light green rounded badge */
                      <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                        {cat.iconType === 'flag' && <Flag className="w-6 h-6 stroke-[1.8]" />}
                        {cat.iconType === 'question' && <HelpCircle className="w-6 h-6 stroke-[1.8]" />}
                        {cat.iconType === 'user-gear' && <UserCheck className="w-6 h-6 stroke-[1.8]" />}
                        {cat.iconType === 'folder' && <Folder className="w-6 h-6 stroke-[1.8]" />}
                        {cat.iconType === 'audit' && <FileSearch className="w-6 h-6 stroke-[1.8]" />}
                        {cat.iconType === 'wrench' && <Key className="w-6 h-6 stroke-[1.8]" />}
                        {cat.iconType === 'link' && <Link2 className="w-6 h-6 stroke-[1.8]" />}
                        {cat.iconType === 'sparkles' && <Sparkles className="w-6 h-6 stroke-[1.8]" />}
                        {cat.iconType === 'chart' && <PieChart className="w-6 h-6 stroke-[1.8]" />}
                        {cat.iconType === 'cube' && <Package className="w-6 h-6 stroke-[1.8]" />}
                        {cat.iconType === 'pin' && <MapPin className="w-6 h-6 stroke-[1.8]" />}
                        {cat.iconType === 'note-pen' && <PenTool className="w-6 h-6 stroke-[1.8]" />}
                      </div>
                    )}

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#1054E2] transition-colors tracking-tight">
                        {cat.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2 leading-relaxed font-normal">
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 text-xs font-semibold text-[#1054E2] flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View {cat.articles.length} articles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* In-App Category Articles Modal (No external redirect!) */}
      {activeCategory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150 border border-gray-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1054E2]">
                  Knowledge Base Guide
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  {activeCategory.title}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activeCategory.desc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {activeCategory.articles.map((art, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#1054E2] transition-colors flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#1054E2]" />
                      <span>{art.title}</span>
                    </h4>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {art.readTime}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed pl-6">
                    {art.summary}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500">
              <span>Looking for more specialized assistance?</span>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory(null);
                  setIsChatOpen(true);
                }}
                className="px-4 py-2 bg-[#1054E2] text-white rounded-lg font-bold hover:bg-[#0B44BA] transition-colors cursor-pointer"
              >
                Talk to support
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Support Drawer */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 rounded-full bg-[#1054E2] hover:bg-[#0B44BA] text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-pointer"
          title="Chat with Support"
        >
          {isChatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6 fill-white" />
          )}
        </button>

        {isChatOpen && (
          <div className="absolute right-0 bottom-16 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-200 flex flex-col">
            {/* Header */}
            <div className="bg-[#1054E2] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold">SE Ranking Support</h4>
                  <p className="text-[10px] text-blue-100">Typically replies in under 2 minutes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 space-y-3 h-72 overflow-y-auto bg-gray-50 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-[#1054E2] text-white rounded-br-xs'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendChat}
              className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:border-[#1054E2]"
              />
              <button
                type="submit"
                className="p-2 bg-[#1054E2] text-white rounded-lg hover:bg-[#0B44BA] cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <SeRankingLogo variant="brand" width={110} height={26} />
            <span className="text-gray-400 font-normal">Knowledge Base</span>
          </div>

          <div>© 2013 - 2026 SER Acquisition Inc. All Rights Reserved</div>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-gray-600 font-bold">
            <span className="cursor-pointer hover:text-blue-600">f</span>
            <span className="cursor-pointer hover:text-black">𝕏</span>
            <span className="cursor-pointer hover:text-red-600">▶</span>
            <span className="cursor-pointer hover:text-blue-700">in</span>
            <span className="cursor-pointer hover:text-pink-600">📷</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
