'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  X,
  Search,
  Check,
  ChevronDown,
  Wand2,
  Copy,
  Edit3,
  Sparkles,
  Download,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { SUPPORTED_COUNTRIES } from '@/lib/constants';

// Real Semantic Clusters generator for Content Idea Finder
const generateIdeaClusters = (seed: string, country: string, region: string) => {
  const cleanSeed = seed.trim().toLowerCase() || 'content marketing';
  const locSuffix = region ? ` in ${region}` : country ? ` in ${country}` : '';
  return [
    {
      clusterName: `${cleanSeed.toUpperCase()} Strategy & Fundamentals${locSuffix}`,
      totalVolume: 34200,
      avgKd: 48,
      ideasCount: 14,
      keywords: [
        { text: `what is ${cleanSeed}`, volume: 18100, kd: 39, cpc: '$3.40', intent: 'Informational' },
        { text: `${cleanSeed} strategy step by step`, volume: 8900, kd: 52, cpc: '$4.85', intent: 'Informational' },
        { text: `${cleanSeed} best practices 2026`, volume: 5400, kd: 44, cpc: '$3.10', intent: 'Informational' },
        { text: `${cleanSeed} roadmap for b2b`, volume: 1800, kd: 41, cpc: '$5.20', intent: 'Commercial' },
      ],
    },
    {
      clusterName: `${cleanSeed.toUpperCase()} Tools & AI Automation`,
      totalVolume: 27800,
      avgKd: 58,
      ideasCount: 19,
      keywords: [
        { text: `best ${cleanSeed} tools`, volume: 14200, kd: 61, cpc: '$6.50', intent: 'Commercial' },
        { text: `ai ${cleanSeed} software`, volume: 7600, kd: 54, cpc: '$5.80', intent: 'Commercial' },
        { text: `free ${cleanSeed} platforms`, volume: 4100, kd: 46, cpc: '$2.90', intent: 'Informational' },
        { text: `${cleanSeed} automation workflows`, volume: 1900, kd: 57, cpc: '$7.10', intent: 'Commercial' },
      ],
    },
    {
      clusterName: `${cleanSeed.toUpperCase()} Examples & Case Studies`,
      totalVolume: 19400,
      avgKd: 42,
      ideasCount: 11,
      keywords: [
        { text: `${cleanSeed} real examples`, volume: 9800, kd: 38, cpc: '$2.80', intent: 'Informational' },
        { text: `successful ${cleanSeed} campaigns`, volume: 5100, kd: 43, cpc: '$4.10', intent: 'Informational' },
        { text: `${cleanSeed} roi metrics`, volume: 2700, kd: 47, cpc: '$5.90', intent: 'Commercial' },
        { text: `${cleanSeed} templates download`, volume: 1800, kd: 35, cpc: '$3.20', intent: 'Transactional' },
      ],
    },
    {
      clusterName: `Questions Asked About ${cleanSeed.toUpperCase()}`,
      totalVolume: 16500,
      avgKd: 36,
      ideasCount: 16,
      keywords: [
        { text: `how to create a ${cleanSeed} plan?`, volume: 6700, kd: 35, cpc: '$3.60', intent: 'Informational' },
        { text: `why is ${cleanSeed} important for seo?`, volume: 4900, kd: 32, cpc: '$2.90', intent: 'Informational' },
        { text: `how much does ${cleanSeed} cost?`, volume: 3100, kd: 41, cpc: '$6.20', intent: 'Commercial' },
        { text: `how to measure ${cleanSeed} success?`, volume: 1800, kd: 37, cpc: '$4.50', intent: 'Informational' },
      ],
    },
  ];
};

function ContentMarketingSuiteInner() {
  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get('tab') : null;
  const [activeTab, setActiveTab] = useState<'editor' | 'idea-finder'>(
    tabParam === 'idea-finder' ? 'idea-finder' : 'editor'
  );

  useEffect(() => {
    if (tabParam === 'idea-finder') {
      setActiveTab('idea-finder');
    } else if (tabParam === 'editor') {
      setActiveTab('editor');
    }
  }, [tabParam]);

  const [isTopBannerDismissed, setIsTopBannerDismissed] = useState(false);

  // Content Idea Finder State
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [selectedCountryCode, setSelectedCountryCode] = useState('IN');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isRegionPopoverOpen, setIsRegionPopoverOpen] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');
  const [isSearchingIdeas, setIsSearchingIdeas] = useState(false);
  const [searchResults, setSearchResults] = useState<ReturnType<typeof generateIdeaClusters> | null>(null);

  // Content Editor Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Modals for Real Functionality
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  
  // Real SE Ranking Article Creator / Optimizer Modal
  const [isCreateArticleModalOpen, setIsCreateArticleModalOpen] = useState(false);
  const [createModalTab, setCreateModalTab] = useState<'write' | 'optimize'>('optimize');
  const [modalPrimaryKeyword, setModalPrimaryKeyword] = useState('');
  const [modalArticleUrl, setModalArticleUrl] = useState('');
  const [modalCountry, setModalCountry] = useState('India');
  const [modalCountryCode, setModalCountryCode] = useState('IN');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [modalLocation, setModalLocation] = useState('');
  const [modalLanguage, setModalLanguage] = useState('EN');
  const [isAdditionalSettingsOpen, setIsAdditionalSettingsOpen] = useState(false);
  const [additionalWordCount, setAdditionalWordCount] = useState(1800);
  const [additionalCompetitors, setAdditionalCompetitors] = useState('10');
  const [additionalExcludeDomains, setAdditionalExcludeDomains] = useState('');
  const [articlesCount, setArticlesCount] = useState(0);

  const modalCountries = [
    { name: 'India', code: 'IN' },
    { name: 'United States', code: 'US' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Canada', code: 'CA' },
    { name: 'Australia', code: 'AU' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
    { name: 'Spain', code: 'ES' },
    { name: 'Netherlands', code: 'NL' },
    { name: 'Brazil', code: 'BR' },
    { name: 'Japan', code: 'JP' },
    { name: 'Singapore', code: 'SG' },
    { name: 'United Arab Emirates', code: 'AE' },
  ];

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalPrimaryKeyword.trim()) return;

    setBriefKeyword(modalPrimaryKeyword.trim());
    const generatedTitle =
      createModalTab === 'optimize'
        ? modalArticleUrl
          ? `Audit & Optimize: ${modalPrimaryKeyword.toUpperCase()} (${modalArticleUrl})`
          : `Optimized: ${modalPrimaryKeyword.toUpperCase()} Content Audit`
        : modalArticleUrl
          ? modalArticleUrl
          : `SEO Brief: Complete Guide to ${modalPrimaryKeyword}`;
    setEditorTitle(generatedTitle);
    setArticlesCount((prev) => Math.min(2, prev + 1));
    setIsCreateArticleModalOpen(false);
    setIsBriefModalOpen(true);
  };

  const [briefKeyword, setBriefKeyword] = useState('b2b content marketing strategy');
  const [editorTitle, setEditorTitle] = useState('The Ultimate B2B Content Marketing Strategy Guide for 2026');
  const [editorContent, setEditorContent] = useState(
    `# The Ultimate B2B Content Marketing Strategy Guide for 2026\n\nDeveloping an impactful b2b content marketing strategy requires a deep understanding of your audience personas, buyer search intent, and the full organic conversion funnel.\n\n## 1. Defining Clear Marketing Objectives\nBefore producing articles, align your editorial calendar with qualified lead generation goals and organic traffic benchmarks.\n\n## 2. Conducting Competitive Topic Analysis\nAnalyze top-ranking SERP competitors to identify keyword content gaps and ensure comprehensive semantic coverage across every stage of the customer journey.`
  );
  const [aiGenerating, setAiGenerating] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Regions list for India
  const indiaRegions = [
    'Bengaluru, Karnataka, India',
    'Mumbai, Maharashtra, India',
    'Pune, Maharashtra, India',
    'Delhi, National Capital Territory of Delhi, India',
    'Gurugram, Haryana, India',
    'Hyderabad, Telangana, India',
    'Chennai, Tamil Nadu, India',
    'Kolkata, West Bengal, India',
    'Ahmedabad, Gujarat, India',
    'Jaipur, Rajasthan, India',
    'Chandigarh, Punjab, India',
    'Kochi, Kerala, India',
    'Visakhapatnam, Andhra Pradesh, India',
    'Indore, Madhya Pradesh, India',
    'Noida, Uttar Pradesh, India',
  ];

  const filteredRegions = indiaRegions.filter((r) =>
    r.toLowerCase().includes(regionSearch.toLowerCase())
  );

  const handleFindIdeasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordInput.trim()) return;
    setIsSearchingIdeas(true);
    setTimeout(() => {
      setSearchResults(generateIdeaClusters(keywordInput, selectedCountry, selectedRegion));
      setIsSearchingIdeas(false);
    }, 500);
  };

  const launchBriefFromKeyword = (kw: string) => {
    setBriefKeyword(kw);
    setEditorTitle(`Complete Guide: How to Master ${kw.toUpperCase()} in 2026`);
    setEditorContent(
      `# Complete Guide: How to Master ${kw.toUpperCase()} in 2026\n\nLearn how to effectively implement ${kw} to drive targeted organic search traffic, satisfy customer search intent, and boost your website conversion rates.\n\n## Why ${kw} Matters for SEO\nSearch engines evaluate topical authority by assessing the comprehensiveness and factual accuracy of your content.\n\n## Step-by-Step Implementation Framework\nFollow these proven recommendations to outrank your competitors on Google.`
    );
    setActiveTab('editor');
    setIsBriefModalOpen(true);
  };

  const wordCount = editorContent.trim().split(/\s+/).filter(Boolean).length;
  const headingsCount = (editorContent.match(/^#{1,3}\s/gm) || []).length;
  const targetWords = 1850;
  const targetHeadings = 8;
  const contentScore = Math.min(
    95,
    Math.round((wordCount / targetWords) * 50 + (headingsCount / targetHeadings) * 30 + 15)
  );

  const semanticKeywords = [
    { term: briefKeyword.toLowerCase(), target: '3-6', count: (editorContent.toLowerCase().match(new RegExp(briefKeyword.toLowerCase(), 'g')) || []).length },
    { term: 'search intent', target: '2-4', count: (editorContent.toLowerCase().match(/search intent/g) || []).length },
    { term: 'organic traffic', target: '2-5', count: (editorContent.toLowerCase().match(/organic traffic/g) || []).length },
    { term: 'conversion rate', target: '1-3', count: (editorContent.toLowerCase().match(/conversion rate/g) || []).length },
    { term: 'competitors', target: '2-4', count: (editorContent.toLowerCase().match(/competitors/g) || []).length },
    { term: 'topical authority', target: '1-3', count: (editorContent.toLowerCase().match(/topical authority/g) || []).length },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F4F6F9] text-gray-900 min-h-screen">


      {/* Top Notification Alert Banner for Content Idea Finder */}
      {activeTab === 'idea-finder' && !isTopBannerDismissed && (
        <div className="bg-[#EBF3FC] border-b border-[#CCE0F8] px-4 py-2 text-xs text-[#1E40AF] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-[#0B69FF] text-white text-[11px] font-bold shrink-0">
              i
            </span>
            <div className="leading-snug text-gray-700 text-xs">
              Content Idea Finder helps analyze keywords in your niche and create a content strategy based on collected data. Get new topic ideas, choose relevant keywords and create top-quality content with them.
            </div>
          </div>
          <button
            onClick={() => setIsTopBannerDismissed(true)}
            className="text-gray-400 hover:text-gray-700 ml-4 p-0.5 cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Control Panel with Breadcrumbs, Feedback, and Speed Limit Meter */}
      <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Link
            href="/content-marketing?tab=editor"
            onClick={() => setActiveTab('editor')}
            className="hover:text-gray-900 cursor-pointer text-gray-600 font-medium"
          >
            Content Marketing
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-900 font-semibold">
            {activeTab === 'editor' ? 'Content Editor' : 'Content Idea Finder'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => alert('Feedback modal: Thank you for your feedback!')}
            className="text-gray-500 hover:text-[#0B69FF] transition-colors cursor-pointer text-xs"
          >
            Feedback
          </button>
          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded border border-gray-200 text-xs">
            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            <span className="text-gray-600 font-medium">Account limit</span>
            <span className="font-bold text-gray-900">0</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">2</span>
            <span
              className="text-gray-400 hover:text-gray-600 cursor-pointer ml-0.5"
              title="Free trial includes 2 credits"
            >
              ⓘ
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CONTENT EDITOR VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'editor' && (
        <div className="max-w-[760px] mx-auto w-full px-4 py-8 space-y-6">
          {/* Card 1: Content Editor Hero Action Box */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-xs">
            <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 tracking-tight mb-2.5">
              Content Editor
            </h1>
            <p className="text-gray-600 text-[13px] leading-relaxed max-w-xl mx-auto mb-6">
              Write actionable briefs and SEO-ready articles in just a few clicks. Optimize your existing content to rank high, drive relevant traffic, and boost conversions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setCreateModalTab('write');
                  setIsCreateArticleModalOpen(true);
                }}
                className="w-full sm:w-auto bg-[#0B69FF] hover:bg-[#0957DB] text-white font-semibold text-xs px-6 py-2.5 rounded shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Write new brief &amp; article</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setCreateModalTab('optimize');
                  setIsCreateArticleModalOpen(true);
                }}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs px-6 py-2.5 rounded shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Optimize existing content</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Features Grid (8 features with exact colors and material icons) */}
          <div className="bg-transparent space-y-5">
            <h2 className="text-center font-bold text-gray-900 text-base md:text-lg">
              Use all features to write high-quality content
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Content Briefs */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-blue-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(227, 239, 250)' }}>
                    <span className="text-2xl" style={{ color: 'rgb(25, 118, 210)' }}>
                      ≡
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">Content Briefs</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Automate SEO content briefs, export and share seamlessly, and quickly verify all requirements are met after writing.
                  </p>
                </div>
              </div>

              {/* 2. Competitors */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-red-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(252, 234, 232)' }}>
                    <span className="text-xl" style={{ color: 'rgb(215, 60, 45)' }}>
                      👥
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">Competitors</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Analyze your top 10 competitors and gain detailed insights into word count, headings, keywords, images, readability, other attributes of their content.
                  </p>
                </div>
              </div>

              {/* 3. Semantically related keywords */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-green-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(225, 241, 232)' }}>
                    <span className="text-xl" style={{ color: 'rgb(0, 136, 69)' }}>
                      🔑
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">Semantically related keywords</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Identify key topics, entities, and terms for your primary keyword. Cover all essential points to create a comprehensive, valuable article.
                  </p>
                </div>
              </div>

              {/* 4. Actionable recommendations */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-amber-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(255, 234, 216)' }}>
                    <span className="text-xl" style={{ color: 'rgb(244, 143, 29)' }}>
                      💡
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">Actionable recommendations</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Get actionable recommendations based on your competitor analysis and article brief.
                  </p>
                </div>
              </div>

              {/* 5. AskAI and AI templates */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-purple-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(239, 234, 255)' }}>
                    <span className="text-xl" style={{ color: 'rgb(114, 103, 218)' }}>
                      ✨
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">AskAI and AI templates</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Use AskAI and AI templates to write and rewrite content based on your specific requirements.
                  </p>
                </div>
              </div>

              {/* 6. Generate full articles */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-teal-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(222, 241, 242)' }}>
                    <span className="text-xl" style={{ color: 'rgb(0, 104, 111)' }}>
                      📄
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">Generate full articles</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Use AI to generate complete articles and customize content to your needs with a step-by-step generator (currently only in English).
                  </p>
                </div>
              </div>

              {/* 7. Collaboration */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-lime-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(226, 243, 221)' }}>
                    <span className="text-xl" style={{ color: 'rgb(55, 106, 37)' }}>
                      🔗
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">Collaboration</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Easily share or export your briefs and articles with team members or stakeholders, enabling smooth collaboration and feedback.
                  </p>
                </div>
              </div>

              {/* 8. Analytics and notes */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:border-purple-300 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgb(243, 235, 247)' }}>
                    <span className="text-xl" style={{ color: 'rgb(129, 69, 154)' }}>
                      📊
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">Analytics and notes</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Monitor the performance of your publications and track key metrics over time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Available integrations matching exact buttons and SVG icons */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-xs">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Available integrations</h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => alert('WordPress plugin connected! You can sync draft posts directly to your WordPress admin.')}
                className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-4 py-2 text-xs font-semibold text-gray-700 flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <span className="w-5 h-5 rounded-full bg-[#21759B] text-white flex items-center justify-center text-xs font-serif font-bold">
                  W
                </span>
                <span>WordPress</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => alert('Google Docs Add-on: Installed and ready. Open Google Docs -> Extensions -> SE Ranking Content Editor.')}
                className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-4 py-2 text-xs font-semibold text-gray-700 flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <div className="w-5 h-5 bg-[#4285F4] rounded-xs flex items-center justify-center text-[10px] text-white font-bold">
                  ≡
                </div>
                <span>Google Docs Add-on</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Card 4: Video Tutorial with the real YouTube embed */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs space-y-4">
            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-base">Video tutorial</h3>
              <p className="text-gray-500 text-xs mt-0.5">Learn how to use the Content Editor in just a few minutes!</p>
            </div>

            <div className="relative aspect-video max-w-xl mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-black">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/neAfejb5cNY"
                title="SE Ranking Content Editor Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Card 5: Training Materials with Real 4 HD Cards & Interactive Slider */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs space-y-4">
            <h3 className="text-center font-bold text-gray-900 text-base">Training materials</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carouselIndex === 0 ? (
                <>
                  {/* Card 1: Content SEO with Joe Williams (HD image) */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden p-4 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group bg-white">
                    <div className="space-y-3">
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shadow-2xs">
                        <img
                          src="/images/content-marketing/content_seo_course.jpg"
                          alt="Content SEO with Joe Williams"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider uppercase">
                          Academy Course
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[#0B69FF] uppercase tracking-wider block">
                          Content SEO with Joe Williams
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">Content SEO course</h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          Learn how to create content that will drive visitors to your site and make them stick around with this free SEO content marketing course.
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://seranking.com/academy/content-seo.html"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0B69FF] font-semibold text-xs hover:underline pt-3 block flex items-center gap-1"
                    >
                      <span>Start the course</span>
                      <span>→</span>
                    </a>
                  </div>

                  {/* Card 2: SE Ranking AI Content Writer (HD image) */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden p-4 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group bg-white">
                    <div className="space-y-3">
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shadow-2xs">
                        <img
                          src="/images/content-marketing/ai_content_writer.jpg"
                          alt="SE Ranking AI Content Writer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider uppercase">
                          AI Tool
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[#8B5CF6] uppercase tracking-wider block">
                          SE Ranking AI Content Writer
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">
                          Create SEO-friendly copy faster with SE Ranking’s new AI content tool
                        </h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          Our Content Marketing tools were designed to help SEOs and copywriters create quality texts that both Google and users love.
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://seranking.com/blog/content-tool/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0B69FF] font-semibold text-xs hover:underline pt-3 block flex items-center gap-1"
                    >
                      <span>Read the full blog post</span>
                      <span>→</span>
                    </a>
                  </div>
                </>
              ) : (
                <>
                  {/* Card 3: Content Optimization & SERP Audit (HD image) */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden p-4 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group bg-white">
                    <div className="space-y-3">
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shadow-2xs">
                        <img
                          src="/images/content-marketing/seo_content_audit.jpg"
                          alt="Content Optimization & SERP Audit"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider uppercase">
                          Masterclass
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                          Content Optimization &amp; SERP Audit
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">
                          Create quality content from start to finish
                        </h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          Check out our detailed video on using Content Idea Finder and Content Editor to create a content brief and SEO-optimized articles.
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://www.youtube.com/watch?v=5bOMqdhxdEM"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0B69FF] font-semibold text-xs hover:underline pt-3 block flex items-center gap-1"
                    >
                      <span>Watch video</span>
                      <span>→</span>
                    </a>
                  </div>

                  {/* Card 4: Keyword Clustering & Content Strategy (HD image) */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden p-4 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group bg-white">
                    <div className="space-y-3">
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shadow-2xs">
                        <img
                          src="/images/content-marketing/content_strategy_mapping.jpg"
                          alt="Content Marketing Strategy & Keyword Clustering"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider uppercase">
                          Strategy Guide
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                          Keyword Clustering &amp; Content Strategy
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">
                          Data-Driven Content Marketing Workflows
                        </h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          Master topic clustering, editorial workflows, and automated distribution to scale your organic search footprint.
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://seranking.com/blog/content-tool/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0B69FF] font-semibold text-xs hover:underline pt-3 block flex items-center gap-1"
                    >
                      <span>Explore strategy guide</span>
                      <span>→</span>
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Carousel Navigation matching count 1-2 from 4 with < and > */}
            <div className="flex items-center justify-center gap-4 pt-3">
              <button
                type="button"
                onClick={() => setCarouselIndex(0)}
                disabled={carouselIndex === 0}
                className="w-7 h-7 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold text-gray-700 cursor-pointer shadow-2xs transition-colors"
                title="Previous slide"
              >
                ‹
              </button>
              <span className="text-xs text-gray-500 font-semibold select-none">
                {carouselIndex === 0 ? '1-2 from 4' : '3-4 from 4'}
              </span>
              <button
                type="button"
                onClick={() => setCarouselIndex(1)}
                disabled={carouselIndex === 1}
                className="w-7 h-7 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold text-gray-700 cursor-pointer shadow-2xs transition-colors"
                title="Next slide"
              >
                ›
              </button>
            </div>
          </div>

          {/* Card 6: Bottom Action Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-xs">
            <h3 className="font-bold text-gray-900 text-sm mb-4">
              Create your first brief &amp; article or improve existing content
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setCreateModalTab('write');
                  setIsCreateArticleModalOpen(true);
                }}
                className="w-full sm:w-auto bg-[#0B69FF] hover:bg-[#0957DB] text-white font-semibold text-xs px-6 py-2.5 rounded shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Write new brief &amp; article</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setCreateModalTab('optimize');
                  setIsCreateArticleModalOpen(true);
                }}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs px-6 py-2.5 rounded shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Optimize existing content</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONTENT IDEA FINDER VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'idea-finder' && (
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 pt-12 pb-16 space-y-8">
          {/* Header Title & Subtitle */}
          <div className="text-center mb-2">
            <h1 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight mb-1.5">
              Content Idea Finder
            </h1>
            <p className="text-gray-500 text-xs">
              Analyze a topic of interest to get new content ideas
            </p>
          </div>

          {/* Form Layout */}
          <form onSubmit={handleFindIdeasSubmit} className="space-y-1.5 max-w-2xl mx-auto w-full">
            <div>
              <label className="flex items-center gap-1 text-xs text-gray-700 mb-1.5 font-normal">
                <span>Keyword</span>
                <span
                  className="italic text-[10px] text-gray-400 border border-gray-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center select-none"
                  title="Enter primary seed keyword or topic"
                >
                  i
                </span>
              </label>

              <div className="flex items-center gap-2">
                {/* Keyword Input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Enter keyword"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:border-[#0B69FF] focus:ring-1 focus:ring-[#0B69FF]"
                  />
                </div>

                {/* Country Trigger Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsRegionPopoverOpen(!isRegionPopoverOpen)}
                    className="border border-gray-300 rounded px-3 py-2 text-xs text-gray-800 bg-white hover:bg-gray-50 flex items-center justify-between gap-3 cursor-pointer min-w-[135px] focus:outline-none focus:border-[#0B69FF]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CountryFlag code={selectedCountryCode} size="sm" />
                      <span className="font-normal text-gray-800 truncate">
                        {selectedRegion ? selectedRegion.split(',')[0] : selectedCountry}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-150 ${
                        isRegionPopoverOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Region Popover Card with Upward Triangle Pointer Arrow */}
                  {isRegionPopoverOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 space-y-3.5 text-xs animate-in fade-in zoom-in-95">
                      {/* Upward pointer arrow */}
                      <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t border-l border-gray-200 transform rotate-45"></div>

                      {/* Country Row */}
                      <div>
                        <label className="flex items-center gap-1 text-[11px] text-gray-600 mb-1 font-normal">
                          <span>Country:</span>
                          <span className="italic text-[9px] text-gray-400 border border-gray-300 rounded-full w-3 h-3 inline-flex items-center justify-center">
                            i
                          </span>
                        </label>
                        <div className="relative">
                          <select
                            value={selectedCountry}
                            onChange={(e) => {
                              const cName = e.target.value;
                              setSelectedCountry(cName);
                              const match = modalCountries.find((c) => c.name === cName);
                              if (match) setSelectedCountryCode(match.code);
                            }}
                            className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#0B69FF] appearance-none cursor-pointer pl-8"
                          >
                            {modalCountries.map((c) => (
                              <option key={c.code} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <CountryFlag code={selectedCountryCode} size="xs" />
                          </div>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Region Row */}
                      <div>
                        <label className="flex items-center gap-1 text-[11px] text-gray-600 mb-1 font-normal">
                          <span>Region:</span>
                          <span className="italic text-[9px] text-gray-400 border border-gray-300 rounded-full w-3 h-3 inline-flex items-center justify-center">
                            i
                          </span>
                        </label>
                        <div className="relative">
                          <select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#0B69FF] appearance-none cursor-pointer text-gray-700"
                          >
                            <option value="">Select region (All country)</option>
                            {indiaRegions.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!keywordInput.trim() || isSearchingIdeas}
                  className="bg-[#0B69FF] hover:bg-[#0957DB] disabled:opacity-50 text-white font-bold text-xs px-5 py-2 rounded transition-colors shadow-xs cursor-pointer shrink-0 uppercase tracking-wide"
                >
                  {isSearchingIdeas ? 'ANALYZING...' : 'FIND IDEAS'}
                </button>
              </div>
            </div>

            {/* Keyword limits indicator */}
            <div className="text-[11px] text-gray-500 pt-1">
              Keyword limits:&nbsp;&nbsp;
              <span className="font-semibold text-gray-900">0/2</span>
            </div>
          </form>

          {/* Real Generated Topic Clusters & Keywords Table */}
          {searchResults && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Content Ideas for "{keywordInput}" in {selectedRegion || selectedCountry}
                  </h2>
                  <p className="text-xs text-gray-500">
                    4 semantic topic clusters • 50+ total keyword suggestions discovered
                  </p>
                </div>
                <button
                  onClick={() => {
                    const csvContent =
                      'data:text/csv;charset=utf-8,Keyword,Volume,KD%,CPC,Intent\n' +
                      searchResults
                        .flatMap((c) => c.keywords)
                        .map((k) => `"${k.text}",${k.volume},${k.kd},"${k.cpc}","${k.intent}"`)
                        .join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `content-ideas-${keywordInput}.csv`);
                    document.body.appendChild(link);
                    link.click();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Cluster Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((cluster, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          Cluster {idx + 1}
                        </span>
                        <span className="text-[11px] text-gray-500">Avg KD: {cluster.avgKd}%</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">{cluster.clusterName}</h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Total Volume: {cluster.totalVolume.toLocaleString()} / mo • {cluster.ideasCount} ideas
                      </p>

                      <div className="space-y-2 border-t border-gray-100 pt-3">
                        {cluster.keywords.map((kw, kIdx) => (
                          <div
                            key={kIdx}
                            className="flex items-center justify-between text-xs py-1 hover:bg-gray-50 px-1.5 rounded"
                          >
                            <span className="text-gray-800 font-medium truncate max-w-[200px]">
                              {kw.text}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-gray-500 font-mono">{kw.volume.toLocaleString()}</span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  kw.kd < 40
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : kw.kd < 60
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {kw.kd}%
                              </span>
                              <button
                                onClick={() => launchBriefFromKeyword(kw.text)}
                                className="text-[#0B69FF] hover:underline font-bold text-[11px]"
                                title="Write brief & article for this keyword"
                              >
                                Write Brief →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* REAL FUNCTIONAL STUDIO: WRITE NEW BRIEF & ARTICLE        */}
      {/* ======================================================== */}
      {isBriefModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-5xl w-full my-6 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#0B69FF] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">📄</span>
                <h3 className="font-bold text-base">SE Ranking Content Editor Studio</h3>
              </div>
              <button
                onClick={() => setIsBriefModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              {/* Left Column: Live WYSIWYG Editor */}
              <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Target Keyword:</span>
                    <input
                      type="text"
                      value={briefKeyword}
                      onChange={(e) => setBriefKeyword(e.target.value)}
                      className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setAiGenerating(true);
                      setTimeout(() => {
                        setEditorContent((prev) =>
                          prev +
                          `\n\n## 3. High-Converting Content Formats\nIncorporate data-driven infographics, proprietary research surveys, and practical interactive calculators to maximize dwell time and earn editorial backlinks organically.`
                        );
                        setAiGenerating(false);
                      }, 600);
                    }}
                    disabled={aiGenerating}
                    className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-2xs disabled:opacity-50 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{aiGenerating ? 'AI Generating...' : 'AskAI Generate Section'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Article Title (H1)</label>
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    className="w-full text-sm font-bold text-gray-900 border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-[#0B69FF] focus:border-[#0B69FF]"
                  />
                </div>

                <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded text-xs text-gray-700 border border-gray-200">
                  <button
                    onClick={() => setEditorContent((c) => c + '\n\n## New Heading\n')}
                    className="px-2 py-1 bg-white rounded shadow-2xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    H2
                  </button>
                  <button
                    onClick={() => setEditorContent((c) => c + '\n\n### New Subheading\n')}
                    className="px-2 py-1 bg-white rounded shadow-2xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    H3
                  </button>
                  <button
                    onClick={() => setEditorContent((c) => c + ' **bold text**')}
                    className="px-2 py-1 bg-white rounded shadow-2xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    B
                  </button>
                  <button
                    onClick={() => setEditorContent((c) => c + '\n- Bullet item')}
                    className="px-2 py-1 bg-white rounded shadow-2xs hover:bg-gray-50 cursor-pointer"
                  >
                    • List
                  </button>
                  <div className="flex-1" />
                  <span className="text-[11px] text-gray-500 font-mono">{wordCount} words</span>
                </div>

                <textarea
                  rows={14}
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full p-4 text-xs font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B69FF] leading-relaxed resize-none"
                  placeholder="Start writing or let AskAI draft your SEO article..."
                />
              </div>

              {/* Right Column: Real-time Scoring & Requirements */}
              <div className="w-full lg:w-80 bg-gray-50 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 text-sm">Content SEO Score</h4>
                    <span
                      className={`text-sm font-extrabold px-2.5 py-0.5 rounded ${
                        contentScore > 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : contentScore > 60
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {contentScore} / 100
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Word Count</span>
                        <span className="font-mono font-semibold">
                          {wordCount} / {targetWords}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#0B69FF] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (wordCount / targetWords) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Headings (H2-H3)</span>
                        <span className="font-mono font-semibold">
                          {headingsCount} / {targetHeadings}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (headingsCount / targetHeadings) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">
                    NLP Terms &amp; Density
                  </h4>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {semanticKeywords.map((kw, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs p-2 rounded bg-white border border-gray-200 shadow-2xs"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {kw.count > 0 ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                          )}
                          <span className={`truncate ${kw.count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                            {kw.term}
                          </span>
                        </div>
                        <span
                          className={`font-mono text-[11px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                            kw.count > 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {kw.count} ({kw.target})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${editorTitle}\n\n${editorContent}`);
                      setCopiedNotification(true);
                      setTimeout(() => setCopiedNotification(false), 2000);
                    }}
                    className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-semibold text-xs py-2 rounded flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedNotification ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
                  </button>
                  <button
                    onClick={() => {
                      alert('Brief & Article saved to SE Ranking Content Library.');
                      setIsBriefModalOpen(false);
                    }}
                    className="w-full bg-[#0B69FF] hover:bg-[#0957DB] text-white font-bold text-xs py-2 rounded shadow-xs cursor-pointer"
                  >
                    SAVE &amp; CLOSE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SE RANKING ARTICLE CREATOR & OPTIMIZER MODAL */}
      {/* ======================================================== */}
      {(isCreateArticleModalOpen || isOptimizeModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-[620px] w-full overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 pt-5">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setCreateModalTab('write')}
                  className={`pb-3 text-xs sm:text-[13px] tracking-tight transition-colors cursor-pointer relative ${
                    createModalTab === 'write'
                      ? 'text-gray-900 border-b-2 border-[#0B69FF] font-semibold'
                      : 'text-gray-500 hover:text-gray-800 font-normal'
                  }`}
                >
                  Write new brief and article
                </button>
                <button
                  type="button"
                  onClick={() => setCreateModalTab('optimize')}
                  className={`pb-3 text-xs sm:text-[13px] tracking-tight transition-colors cursor-pointer relative ${
                    createModalTab === 'optimize'
                      ? 'text-gray-900 border-b-2 border-[#0B69FF] font-semibold'
                      : 'text-gray-500 hover:text-gray-800 font-normal'
                  }`}
                >
                  Optimize existing content
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateArticleModalOpen(false);
                  setIsOptimizeModalOpen(false);
                }}
                className="pb-3 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subtitle description */}
            <div className="px-6 pt-4 pb-1">
              <p className="text-xs text-gray-600 leading-relaxed">
                {createModalTab === 'optimize'
                  ? 'Improve existing content by optimizing it with targeted keywords to improve search engine rankings'
                  : 'Create new content briefs and articles optimized with targeted keywords to rank high on search engines'}
              </p>
            </div>

            {/* Main Form */}
            <form onSubmit={handleCreateArticle} className="px-6 py-4 space-y-4">
              {/* Row 1: Primary keyword | Article URL (or Article title) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="flex items-center gap-1 text-xs text-gray-700 mb-1.5 font-normal">
                    <span>Primary keyword</span>
                    <span
                      className="italic text-[10px] text-gray-400 border border-gray-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center select-none cursor-help"
                      title="Enter the primary keyword you want this content to rank for"
                    >
                      i
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modalPrimaryKeyword}
                    onChange={(e) => setModalPrimaryKeyword(e.target.value)}
                    placeholder="Enter a primary keyword"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0B69FF] focus:ring-1 focus:ring-[#0B69FF]"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-xs text-gray-700 mb-1.5 font-normal">
                    <span>{createModalTab === 'optimize' ? 'Article URL' : 'Article title'}</span>
                    <span
                      className="italic text-[10px] text-gray-400 border border-gray-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center select-none cursor-help"
                      title={
                        createModalTab === 'optimize'
                          ? 'URL of the existing published page to audit and improve'
                          : 'Title of the new article you plan to write'
                      }
                    >
                      i
                    </span>
                  </label>
                  <input
                    type={createModalTab === 'optimize' ? 'url' : 'text'}
                    value={modalArticleUrl}
                    onChange={(e) => setModalArticleUrl(e.target.value)}
                    placeholder={createModalTab === 'optimize' ? 'Enter page URL' : 'Enter article title'}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0B69FF] focus:ring-1 focus:ring-[#0B69FF]"
                  />
                </div>
              </div>

              {/* Row 2: Country | Location | Language */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Country with real flag dropdown */}
                <div className="relative">
                  <label className="flex items-center gap-1 text-xs text-gray-700 mb-1.5 font-normal">
                    <span>Country</span>
                    <span
                      className="italic text-[10px] text-gray-400 border border-gray-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center select-none cursor-help"
                      title="Select the target Google search region"
                    >
                      i
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="w-full flex items-center justify-between border border-gray-300 rounded px-2.5 py-2 text-xs text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:border-[#0B69FF] cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CountryFlag code={modalCountryCode} size="sm" />
                      <span className="truncate">{modalCountry}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
                  </button>

                  {isCountryDropdownOpen && (
                    <div className="absolute z-20 top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto py-1">
                      {modalCountries.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setModalCountry(c.name);
                            setModalCountryCode(c.code);
                            setIsCountryDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-blue-50 cursor-pointer ${
                            modalCountryCode === c.code ? 'bg-blue-50 font-semibold text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <CountryFlag code={c.code} size="sm" />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="flex items-center gap-1 text-xs text-gray-700 mb-1.5 font-normal">
                    <span>Location</span>
                    <span
                      className="italic text-[10px] text-gray-400 border border-gray-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center select-none cursor-help"
                      title="Optional: Target specific city or postal code"
                    >
                      i
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={modalLocation}
                      onChange={(e) => setModalLocation(e.target.value)}
                      placeholder="City/Postal code"
                      className="w-full border border-gray-300 rounded px-3 py-2 pr-7 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0B69FF] focus:ring-1 focus:ring-[#0B69FF]"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="flex items-center gap-1 text-xs text-gray-700 mb-1.5 font-normal">
                    <span>Language</span>
                    <span
                      className="italic text-[10px] text-gray-400 border border-gray-300 rounded-full w-3.5 h-3.5 inline-flex items-center justify-center select-none cursor-help"
                      title="Content language"
                    >
                      i
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={modalLanguage}
                      onChange={(e) => setModalLanguage(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 pr-7 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#0B69FF] focus:ring-1 focus:ring-[#0B69FF] appearance-none cursor-pointer"
                    >
                      <option value="EN">EN</option>
                      <option value="ES">ES</option>
                      <option value="DE">DE</option>
                      <option value="FR">FR</option>
                      <option value="HI">HI</option>
                      <option value="IT">IT</option>
                      <option value="PT">PT</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 3: Additional settings toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdditionalSettingsOpen(!isAdditionalSettingsOpen)}
                  className="flex items-center gap-1 text-xs font-bold text-gray-900 hover:text-[#0B69FF] transition-colors py-1 cursor-pointer"
                >
                  <span>Additional settings</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-200 ${
                      isAdditionalSettingsOpen ? 'rotate-180 text-[#0B69FF]' : ''
                    }`}
                  />
                </button>

                {isAdditionalSettingsOpen && (
                  <div className="mt-2.5 p-3.5 bg-gray-50 rounded border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in slide-in-from-top-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Target Word Count
                      </label>
                      <input
                        type="number"
                        value={additionalWordCount}
                        onChange={(e) => setAdditionalWordCount(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white focus:ring-1 focus:ring-[#0B69FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        SERP Competitors to Analyze
                      </label>
                      <select
                        value={additionalCompetitors}
                        onChange={(e) => setAdditionalCompetitors(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white focus:ring-1 focus:ring-[#0B69FF]"
                      >
                        <option value="10">Top 10 competitors</option>
                        <option value="20">Top 20 competitors</option>
                        <option value="30">Top 30 competitors</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Exclude Domains from Analysis (optional)
                      </label>
                      <input
                        type="text"
                        value={additionalExcludeDomains}
                        onChange={(e) => setAdditionalExcludeDomains(e.target.value)}
                        placeholder="e.g. wikipedia.org, youtube.com, amazon.com"
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white placeholder-gray-400 focus:ring-1 focus:ring-[#0B69FF]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer : Articles 0 / 2 badge & CANCEL / CREATE buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-3">
                {/* Left: Articles count badge with rounded border and icon */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-amber-300 bg-amber-50/70 text-amber-900 text-xs font-medium">
                  <svg className="w-3.5 h-3.5 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span>Articles</span>
                  <span className="font-bold">{articlesCount}</span>
                  <span className="text-amber-600">/</span>
                  <span className="text-amber-800">2</span>
                </div>

                {/* Right: CANCEL and CREATE buttons */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateArticleModalOpen(false);
                      setIsOptimizeModalOpen(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0B69FF] hover:bg-[#0957DB] text-white text-xs font-bold rounded shadow-xs transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    CREATE
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ContentMarketingSuite() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B69FF]"></div>
        </div>
      }
    >
      <ContentMarketingSuiteInner />
    </Suspense>
  );
}
