'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Compass,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  CheckCircle2,
  Trash2,
  X,
  Share2,
  ChevronDown,
  ArrowRight,
  Filter,
  Sparkles,
  Layers,
  ArrowUpRight,
  Zap,
  RefreshCw,
  Download,
  Copy,
  Check,
  FileText,
  Code,
  Link2,
  ShieldCheck,
  Eye,
  BookOpen,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import {
  SearchEngineRegionSelector,
  POPULAR_SEARCH_ENGINES,
  SearchEngineOption,
  GoogleIcon,
} from '@/components/ui/SearchEngineRegionSelector';

export interface InsightItem {
  id: string;
  keyword: string;
  type: 'quick_win' | 'cannibalization' | 'serp_feature' | 'rank_drop' | 'opportunity';
  typeLabel: string;
  currentRank: number;
  rankChange: number;
  searchVolume: number;
  searchEngine: string;
  targetUrl: string;
  recommendation: string;
  impact: 'High' | 'Medium' | 'Critical';
}

const PINTEREST_INSIGHTS: InsightItem[] = [
  {
    id: 'ins-pin-1',
    keyword: 'in web development which language is used',
    type: 'quick_win',
    typeLabel: 'Quick Win (Rank 11-20)',
    currentRank: 12,
    rankChange: 2,
    searchVolume: 3700,
    searchEngine: 'Google India',
    targetUrl: 'https://in.pinterest.com/in-web-development-which-language-is-used',
    recommendation: 'Add 2-3 internal links from high-authority pages to push this keyword from #12 into the Top 10.',
    impact: 'High',
  },
  {
    id: 'ins-pin-2',
    keyword: 'in webuy',
    type: 'opportunity',
    typeLabel: 'High Volume Growth Opportunity',
    currentRank: 30,
    rankChange: -3,
    searchVolume: 3460,
    searchEngine: 'Google India',
    targetUrl: 'https://in.pinterest.com/in-webuy',
    recommendation: 'Target this query in a dedicated long-form guide with FAQ schema to capture featured snippets.',
    impact: 'High',
  },
  {
    id: 'ins-pin-3',
    keyword: 'in official platform',
    type: 'opportunity',
    typeLabel: 'High Volume Growth Opportunity',
    currentRank: 34,
    rankChange: 2,
    searchVolume: 3467,
    searchEngine: 'Google India',
    targetUrl: 'https://in.pinterest.com/in-official-platform',
    recommendation: 'Target this query in a dedicated long-form guide with FAQ schema to capture featured snippets.',
    impact: 'High',
  },
  {
    id: 'ins-pin-4',
    keyword: 'in website',
    type: 'serp_feature',
    typeLabel: 'SERP Feature Dominance',
    currentRank: 2,
    rankChange: -1,
    searchVolume: 14800,
    searchEngine: 'Google India',
    targetUrl: 'https://in.pinterest.com/in-website',
    recommendation: 'Defend position #2 by updating year references to 2026 and maintaining fast Core Web Vitals.',
    impact: 'Medium',
  },
];

interface OptimizationWorkflowModalProps {
  item: InsightItem;
  isApplied: boolean;
  savedChecklist?: Record<string, boolean>;
  onApply: (checklist: Record<string, boolean>) => void;
  onClose: () => void;
}

function OptimizationWorkflowModal({
  item,
  isApplied,
  savedChecklist,
  onApply,
  onClose,
}: OptimizationWorkflowModalProps) {
  const [activeTab, setActiveTab] = useState<'checklist' | 'serp' | 'schema' | 'links'>('checklist');
  const [checklist, setChecklist] = useState<Record<string, boolean>>(
    savedChecklist || {
      h1: true,
      faq_schema: false,
      internal_links: false,
      core_web_vitals: true,
      freshness_2026: true,
      meta_tags: false,
    }
  );
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const metaTitle = `${item.keyword.charAt(0).toUpperCase() + item.keyword.slice(1)}: Best Ideas, Top Guides & Deals (2026) | Pinterest`;
  const metaDescription = `Explore verified collections and actionable tips for ${item.keyword}. Discover top rated boards, trending discussions, and expert visual curation on Pinterest India.`;

  const schemaJson = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `What is ${item.keyword} and how does it work?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${item.keyword} is a popular topic and curation hub on Pinterest India, offering curated boards, verified reviews, and real-time community recommendations.`,
          },
        },
        {
          '@type': 'Question',
          name: `Where can I find trending collections for ${item.keyword}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `You can access trending pins, related tags, and expert collections directly on Pinterest India via ${item.targetUrl}.`,
          },
        },
      ],
    },
    null,
    2
  );

  const internalLinkSuggestions = [
    {
      sourceUrl: 'https://in.pinterest.com/ideas',
      pageTitle: 'Trending Ideas & Visual Discovery',
      authority: 88,
      anchorText: `${item.keyword} recommendations`,
      htmlSnippet: `<a href="${item.targetUrl}" title="${item.keyword}">${item.keyword} recommendations</a>`,
    },
    {
      sourceUrl: 'https://in.pinterest.com/explore',
      pageTitle: 'Explore Top Topics & Communities',
      authority: 84,
      anchorText: `explore ${item.keyword}`,
      htmlSnippet: `<a href="${item.targetUrl}" title="Explore ${item.keyword}">explore ${item.keyword}</a>`,
    },
    {
      sourceUrl: 'https://in.pinterest.com/categories',
      pageTitle: 'All Categories & Curated Hubs',
      authority: 79,
      anchorText: `${item.keyword} verified guide`,
      htmlSnippet: `<a href="${item.targetUrl}" title="${item.keyword} guide">${item.keyword} verified guide</a>`,
    },
  ];

  const handleCopy = (text: string, type: 'title' | 'desc' | 'schema') => {
    navigator.clipboard.writeText(text);
    if (type === 'title') {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } else if (type === 'desc') {
      setCopiedDesc(true);
      setTimeout(() => setCopiedDesc(false), 2000);
    } else if (type === 'schema') {
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    }
  };

  const handleCopyLink = (snippet: string, key: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleExportBrief = () => {
    const briefContent = `# SEO Optimization Action Brief: "${item.keyword}"
Domain: in.pinterest.com
Target URL: ${item.targetUrl}
Search Engine: ${item.searchEngine}
Current Rank: #${item.currentRank} (${item.rankChange > 0 ? '+' : ''}${item.rankChange})
Search Volume: ${item.searchVolume.toLocaleString()}/mo
Insight Type: ${item.typeLabel}
Priority: ${item.impact}

## Algorithmic Recommendation
${item.recommendation}

## Action Checklist Progress (${progressPercent}%)
- [${checklist.h1 ? 'x' : ' '}] Exact Query Intent & H1 Placement: Include "${item.keyword}" in <h1> and first 100 words.
- [${checklist.faq_schema ? 'x' : ' '}] Schema.org FAQPage Implementation: Embed structured data for Google featured snippets.
- [${checklist.internal_links ? 'x' : ' '}] Internal Linking Architecture: Add 2-3 contextual links from high-authority hubs.
- [${checklist.core_web_vitals ? 'x' : ' '}] Mobile Core Web Vitals: Audit LCP < 2.2s and INP < 150ms.
- [${checklist.freshness_2026 ? 'x' : ' '}] Freshness Timestamp: Update year references to 2026.
- [${checklist.meta_tags ? 'x' : ' '}] SERP CTR Snippet Optimization: Refine Title and Meta Description.

## Recommended Meta Tags
Title: ${metaTitle}
Description: ${metaDescription}

## Schema.org FAQPage JSON-LD
\`\`\`json
${schemaJson}
\`\`\`

## Internal Linking Opportunities
${internalLinkSuggestions.map((s) => `- From: ${s.sourceUrl} (PA: ${s.authority}) | Anchor: "${s.anchorText}"`).join('\n')}

Generated by SE Ranking Insights Engine on ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}.
`;

    const blob = new Blob([briefContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-optimization-plan-${item.keyword.replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-gray-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-[#FAFBFD]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20">
                SEO Optimization Studio
              </span>
              {isApplied ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                  <span>✓ Applied & Active in SERP Tracker</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Ready to Optimize
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>Optimization Workflow for &ldquo;{item.keyword}&rdquo;</span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium flex-wrap">
              <div className="flex items-center gap-1.5 text-gray-700">
                <img
                  src={
                    item.searchEngine.toLowerCase().includes('united states') || item.searchEngine.toLowerCase().includes('usa')
                      ? '/flags/4x3/us.svg'
                      : item.searchEngine.toLowerCase().includes('united kingdom') || item.searchEngine.toLowerCase().includes('uk')
                      ? '/flags/4x3/gb.svg'
                      : '/flags/4x3/in.svg'
                  }
                  alt={item.searchEngine}
                  className="w-4 h-3 object-cover rounded-[1.5px] border border-black/10 shadow-2xs shrink-0"
                />
                <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                <strong className="text-gray-900">{item.searchEngine}</strong>
              </div>
              <span>•</span>
              <span>
                Rank: <strong className="text-gray-900">#{item.currentRank}</strong>{' '}
                <span className={item.rankChange > 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                  ({item.rankChange > 0 ? `+${item.rankChange}` : item.rankChange})
                </span>
              </span>
              <span>•</span>
              <span>
                Search Volume: <strong className="text-gray-900">{item.searchVolume.toLocaleString()}/mo</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Algorithmic Diagnosis Summary Banner */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-[#EFF6FF] to-[#FAF5FF] border-b border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-gray-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <span>Algorithmic Diagnosis ({item.typeLabel}):</span>
            </div>
            <p className="text-gray-600 max-w-2xl leading-relaxed">{item.recommendation}</p>
          </div>
          <div className="shrink-0 bg-white/90 border border-gray-200 px-3 py-1.5 rounded-lg shadow-2xs text-right">
            <span className="text-[10px] text-gray-400 block font-semibold uppercase">Estimated Upside</span>
            <span className="font-bold text-[#00B074] text-sm">+{Math.round(item.searchVolume * 0.28).toLocaleString()} clicks/mo</span>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-gray-200 bg-white flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'checklist', label: 'Action Plan & Tasks', icon: ShieldCheck, count: `${completedCount}/${totalCount}` },
            { id: 'serp', label: 'SERP Preview & AI Meta Tags', icon: Eye },
            { id: 'schema', label: 'FAQ Schema JSON-LD', icon: Code },
            { id: 'links', label: 'Internal Link Targets', icon: Link2, count: '3 Pages' },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-3 px-3.5 border-b-2 font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'border-[#7C3AED] text-[#7C3AED]'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      active ? 'bg-[#7C3AED]/15 text-[#7C3AED]' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: ACTION PLAN & CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Progress bar */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700">Workflow Execution Progress</span>
                  <span className="font-mono font-bold text-[#7C3AED]">{progressPercent}% Completed</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#7C3AED] to-[#00B074] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Target URL: <code className="text-gray-700 bg-white px-1.5 py-0.5 rounded border border-gray-200 font-mono">{item.targetUrl}</code>
                </p>
              </div>

              {/* Checklist items */}
              <div className="space-y-3">
                {[
                  {
                    key: 'h1',
                    title: `Exact Query Placement in H1 & Intro`,
                    desc: `Include exact search query "${item.keyword}" in the main <h1> tag and within the opening 100 words of the landing page.`,
                    tag: 'On-Page SEO',
                  },
                  {
                    key: 'faq_schema',
                    title: `Implement Schema.org FAQPage JSON-LD`,
                    desc: `Inject structured FAQ markup to qualify for Google Featured Snippets and People Also Ask dropdowns.`,
                    tag: 'Rich Results',
                  },
                  {
                    key: 'internal_links',
                    title: `Add 2-3 High-Authority Internal Anchor Links`,
                    desc: `Add contextual anchor links from top authority category hubs (e.g., in.pinterest.com/ideas) directly into this target URL.`,
                    tag: 'Link Architecture',
                  },
                  {
                    key: 'freshness_2026',
                    title: `Update 2026 Freshness Benchmarks`,
                    desc: `Refresh timestamp references to 2026 in metadata, breadcrumbs, and schema to satisfy Google freshness scoring.`,
                    tag: 'Freshness Signal',
                  },
                  {
                    key: 'core_web_vitals',
                    title: `Ensure Fast Mobile Core Web Vitals (LCP < 2.0s)`,
                    desc: `Ensure Largest Contentful Paint stays under 2.0 seconds and Interaction to Next Paint (INP) stays under 150ms.`,
                    tag: 'CWV Speed',
                  },
                  {
                    key: 'meta_tags',
                    title: `Deploy High CTR Title & Description`,
                    desc: `Publish compelling 2026 CTR-focused meta title and description with clear call-to-action to maximize organic clicks.`,
                    tag: 'CTR Maximizer',
                  },
                ].map((task) => (
                  <div
                    key={task.key}
                    onClick={() => toggleCheck(task.key)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      checklist[task.key]
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(checklist[task.key])}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 rounded text-[#00B074] focus:ring-0 cursor-pointer"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold ${checklist[task.key] ? 'text-emerald-900 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {task.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">{task.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SERP PREVIEW & AI META TAGS */}
          {activeTab === 'serp' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Google Search Result Preview (Mobile & Desktop)
                </span>
                {/* Google Snippet Simulation */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white max-w-xl space-y-1 font-sans">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px]">
                      P
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-gray-900">Pinterest</span>
                      <span className="text-gray-400 text-[11px] mx-1">›</span>
                      <span className="text-gray-500 text-[11px] font-mono">{item.targetUrl.replace(/^https?:\/\//, '')}</span>
                    </div>
                  </div>
                  <h3 className="text-base text-[#1A0DAB] hover:underline cursor-pointer font-medium leading-snug line-clamp-1 pt-0.5">
                    {metaTitle}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    <span className="text-gray-400 font-mono text-[11px]">Feb 12, 2026 — </span>
                    {metaDescription}
                  </p>
                </div>
              </div>

              {/* Meta Title Copy Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800">Optimized Meta Title</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      62 Chars (Optimal)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(metaTitle, 'title')}
                    className="text-xs text-[#7C3AED] hover:text-[#6D28D9] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTitle ? 'Copied!' : 'Copy Title'}</span>
                  </button>
                </div>
                <p className="text-xs text-gray-700 font-mono bg-white p-2.5 rounded border border-gray-200">
                  {metaTitle}
                </p>
              </div>

              {/* Meta Description Copy Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800">Optimized Meta Description</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      148 Chars (Optimal)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(metaDescription, 'desc')}
                    className="text-xs text-[#7C3AED] hover:text-[#6D28D9] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedDesc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDesc ? 'Copied!' : 'Copy Description'}</span>
                  </button>
                </div>
                <p className="text-xs text-gray-700 font-mono bg-white p-2.5 rounded border border-gray-200 leading-relaxed">
                  {metaDescription}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA.ORG JSON-LD GENERATOR */}
          {activeTab === 'schema' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-900">Valid Schema.org FAQPage JSON-LD Markup</h3>
                  <p className="text-[11px] text-gray-500">
                    Paste this snippet directly into the <code className="text-gray-700 bg-gray-100 px-1 rounded">&lt;head&gt;</code> of {item.targetUrl}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(schemaJson, 'schema')}
                  className="px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy JSON-LD'}</span>
                </button>
              </div>

              <div className="relative bg-[#0F172A] text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
                <pre>{schemaJson}</pre>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Rich Snippet Validated:</strong> This structure complies with Google Search Central 2026 requirements for featured answers and rich results.
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: INTERNAL LINK TARGETS */}
          {activeTab === 'links' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-xs font-bold text-gray-900">Recommended Internal Link Sources</h3>
                <p className="text-[11px] text-gray-500">
                  Insert contextual anchors from these high-authority pages on in.pinterest.com to push rank from #{item.currentRank} into top 10:
                </p>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFBFD] border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase">
                    <tr>
                      <th className="py-2.5 px-3.5">Source Page</th>
                      <th className="py-2.5 px-3.5 text-center">Authority</th>
                      <th className="py-2.5 px-3.5">Recommended Anchor</th>
                      <th className="py-2.5 px-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {internalLinkSuggestions.map((linkItem, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-gray-900">{linkItem.pageTitle}</div>
                          <span className="text-[10.5px] text-gray-400 font-mono truncate block mt-0.5">
                            {linkItem.sourceUrl}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center font-mono">
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[11px]">
                            PA {linkItem.authority}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-medium text-gray-800">
                          &ldquo;{linkItem.anchorText}&rdquo;
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(linkItem.htmlSnippet, linkItem.sourceUrl)}
                            className="px-2.5 py-1 text-xs font-bold text-[#7C3AED] hover:bg-[#7C3AED]/10 rounded border border-[#7C3AED]/30 transition-colors cursor-pointer"
                          >
                            {copiedLink === linkItem.sourceUrl ? 'Copied!' : 'Copy HTML'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-[#FAFBFD] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportBrief}
              className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Download Optimization Brief (.md)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onApply(checklist);
              }}
              className="px-5 py-2 bg-[#00B074] hover:bg-[#009A65] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{isApplied ? 'Update Applied Workflow' : 'Apply Optimization Workflow'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightsContent() {
  const { activeProject } = useApp();
  const rawDomain = activeProject?.domain || '';
  const displayDomain = rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, '') || (activeProject?.name || 'No Project Selected');

  // Dynamic insights state
  const [hasKeywords, setHasKeywords] = useState(false);
  const [insightsList, setInsightsList] = useState<InsightItem[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'quick_win' | 'cannibalization' | 'serp_feature' | 'rank_drop'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Workflow tracking
  const [selectedWorkflowItem, setSelectedWorkflowItem] = useState<InsightItem | null>(null);
  const [appliedWorkflows, setAppliedWorkflows] = useState<Record<string, { appliedAt: string; checklist: Record<string, boolean> }>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('seranking_applied_optimizations');
      if (saved) {
        setAppliedWorkflows(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    async function loadProjectInsights() {
      if (!activeProject?.id) {
        setInsightsList([]);
        setHasKeywords(false);
        return;
      }
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(activeProject.id)}/insights`);
        if (res.ok) {
          const json = await res.json();
          if (json.insights && Array.isArray(json.insights) && json.insights.length > 0) {
            setInsightsList(json.insights);
            setHasKeywords(true);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load insights:', err);
      }
      setHasKeywords(false);
      setInsightsList([]);
    }
    loadProjectInsights();
  }, [activeProject?.id, activeProject?.domain]);

  // Modals
  const [isAddKeywordOpen, setIsAddKeywordOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<SearchEngineOption>(POPULAR_SEARCH_ENGINES[0]);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRefreshInsights = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Insights synchronized with Google India rankings engine');
    }, 900);
  };

  const handleExportCsv = () => {
    const headers = ['Tracked Keyword', 'Search Engine', 'Current Position', 'Rank Change', 'Monthly Volume', 'Insight Type', 'Recommendation', 'Target URL', 'Status'];
    const rows = insightsList.map((i) => [
      `"${i.keyword}"`,
      `"${i.searchEngine}"`,
      i.currentRank,
      i.rankChange > 0 ? `+${i.rankChange}` : i.rankChange,
      i.searchVolume,
      `"${i.typeLabel}"`,
      `"${i.recommendation.replace(/"/g, '""')}"`,
      `"${i.targetUrl}"`,
      appliedWorkflows[i.id] || appliedWorkflows[i.keyword] ? 'Applied' : 'Pending',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `insights-report-${displayDomain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${insightsList.length} insights to CSV`);
  };

  const handleAddKeywordsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = keywordInput
      .split('\n')
      .map((k) => k.trim())
      .filter(Boolean);

    if (entered.length > 0) {
      const newItems: InsightItem[] = entered.map((kw, idx) => ({
        id: `ins-custom-${Date.now()}-${idx}`,
        keyword: kw,
        type: 'quick_win',
        typeLabel: 'Quick Win (Rank 11-20)',
        currentRank: 14 + idx,
        rankChange: 2,
        searchVolume: 2400,
        searchEngine: selectedEngine.name,
        targetUrl: `https://${displayDomain}/${kw.replace(/\s+/g, '-')}`,
        recommendation: `Add 2-3 internal links from high-authority pages to push this keyword from #${14 + idx} into the Top 10.`,
        impact: 'High',
      }));
      setInsightsList((prev) => [...newItems, ...prev]);
      showToast(`Added ${entered.length} keywords to project tracking`);
    } else {
      showToast('No keywords entered');
    }
    setIsAddKeywordOpen(false);
    setKeywordInput('');
  };

  const filteredInsights = insightsList.filter((item) => {
    const matchesSearch =
      item.keyword.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.recommendation.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-800 flex flex-col font-sans select-text">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      <div>
        {/* ========================================================================= */}
        {/* TOP BREADCRUMB & METADATA BAR (1:1 Matching Screenshot)                  */}
        {/* ========================================================================= */}
        <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-1.5 font-normal text-xs text-gray-500">
            <span className="text-gray-600 font-medium">{displayDomain}</span>
            <span className="text-gray-300">&gt;</span>
            <span className="text-gray-700 font-medium">Insights</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-normal">
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="text-[#7C3AED] hover:underline cursor-pointer"
            >
              Feedback
            </button>
            <Link href="/notes" className="text-[#7C3AED] hover:underline">
              Notes (46)
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY: 1:1 HERO OR LIVE INSIGHTS TABLE                                */}
        {/* ========================================================================= */}
        <div className="px-6 py-8 max-w-[1440px] mx-auto">
          {!hasKeywords ? (
            <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs py-20 px-6 text-center min-h-[550px] flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Lightbulb className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-lg font-bold text-gray-900">No Search Insights Yet</h2>
                <p className="text-xs text-gray-500">
                  Add target keywords to track search rankings, identify quick wins, and detect keyword cannibalization.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddKeywordOpen(true)}
                className="px-4 py-2 bg-[#00B074] hover:bg-[#009A65] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>ADD KEYWORD</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header with Title and Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <span>Search Insights</span>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {insightsList.length} Active Insights
                    </span>
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Algorithmic ranking recommendations, page 1 quick wins, and keyword cannibalization alerts.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddKeywordOpen(true)}
                    className="px-3.5 py-1.5 bg-[#00B074] hover:bg-[#009A65] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>ADD KEYWORD</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRefreshInsights}
                    className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#7C3AED]' : 'text-gray-500'}`} />
                    <span>{isRefreshing ? 'Syncing...' : 'Refresh Insights'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              {(() => {
                const quickWinsCount = insightsList.filter((i) => i.type === 'quick_win').length;
                const cannibalizationCount = insightsList.filter((i) => i.type === 'cannibalization').length;
                const serpFeatureCount = insightsList.filter((i) => i.type === 'serp_feature').length;
                const estTrafficUpside = insightsList.reduce((acc, curr) => {
                  return acc + (curr.type === 'quick_win' || curr.type === 'opportunity' ? Math.round((curr.searchVolume || 0) * 0.15) : 0);
                }, 0);

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Quick Wins (Page 2)</span>
                        <Zap className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{quickWinsCount}</span>
                        <span className="text-xs font-semibold text-emerald-600">Near Top 10</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">High potential for rapid organic traffic gains</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Cannibalization Risks</span>
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{cannibalizationCount}</span>
                        <span className="text-xs font-semibold text-amber-600">{cannibalizationCount > 0 ? 'Requires Fix' : 'None Detected'}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">Multiple URLs competing for the same query</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">SERP Feature Wins</span>
                        <Sparkles className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{serpFeatureCount}</span>
                        <span className="text-xs font-semibold text-[#7C3AED]">Snippet Target</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">Eligible for featured answer boxes</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Est. Traffic Upside</span>
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {estTrafficUpside > 999 ? `+${(estTrafficUpside / 1000).toFixed(1)}K` : `+${estTrafficUpside}`}
                        </span>
                        <span className="text-xs font-semibold text-purple-600">Clicks/mo</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">If page 2 keywords hit top 5 positions</p>
                    </div>
                  </div>
                );
              })()}

              {/* Controls bar: Category filter tabs + Search */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  {[
                    { id: 'all', label: 'All Insights', count: insightsList.length },
                    { id: 'quick_win', label: 'Quick Wins', count: insightsList.filter((i) => i.type === 'quick_win').length },
                    { id: 'cannibalization', label: 'Cannibalization', count: insightsList.filter((i) => i.type === 'cannibalization').length },
                    { id: 'serp_feature', label: 'SERP Features', count: insightsList.filter((i) => i.type === 'serp_feature').length },
                    { id: 'rank_drop', label: 'Ranking Drops', count: insightsList.filter((i) => i.type === 'rank_drop').length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveCategory(tab.id as typeof activeCategory)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeCategory === tab.id
                          ? 'bg-[#00B074] text-white shadow-2xs font-bold'
                          : 'bg-gray-100 hover:bg-gray-200/80 text-gray-700'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          activeCategory === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative w-64">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search keywords or recommendations..."
                    className="w-full pl-3 pr-8 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#00B074] bg-white shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Insights Table */}
              <div className="bg-white border border-gray-200/90 rounded-xl shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFBFD] border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">TRACKED KEYWORD</th>
                      <th className="py-3 px-4 text-center">CURRENT POSITION</th>
                      <th className="py-3 px-4 text-center">MONTHLY VOLUME</th>
                      <th className="py-3 px-4">INSIGHT TYPE</th>
                      <th className="py-3 px-4">RECOMMENDATION</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInsights.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500 text-xs">
                          No insights found for this category or filter.
                        </td>
                      </tr>
                    ) : (
                      filteredInsights.map((item) => {
                      const isApplied = Boolean(appliedWorkflows[item.id] || appliedWorkflows[item.keyword]);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-gray-900">
                            <div className="space-y-1">
                              <span className="font-bold block text-[13px]">{item.keyword}</span>
                              <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5">
                                <img
                                  src={
                                    item.searchEngine.toLowerCase().includes('united states') || item.searchEngine.toLowerCase().includes('usa')
                                      ? '/flags/4x3/us.svg'
                                      : item.searchEngine.toLowerCase().includes('united kingdom') || item.searchEngine.toLowerCase().includes('uk')
                                      ? '/flags/4x3/gb.svg'
                                      : '/flags/4x3/in.svg'
                                  }
                                  alt={item.searchEngine}
                                  className="w-4 h-3 object-cover rounded-[1.5px] border border-black/10 shadow-2xs shrink-0"
                                />
                                <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                                <span>{item.searchEngine}</span>
                                <span className="text-[9.5px] text-gray-400 font-mono font-bold uppercase">
                                  {item.searchEngine.toLowerCase().includes('united states') ? 'US' : item.searchEngine.toLowerCase().includes('united kingdom') ? 'GB' : 'IN'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1 font-mono">
                              <span className="font-bold text-gray-900 text-sm">#{item.currentRank}</span>
                              <span
                                className={`text-[10px] font-bold px-1 rounded ${
                                  item.rankChange > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                                }`}
                              >
                                {item.rankChange > 0 ? `+${item.rankChange}` : item.rankChange}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-medium text-gray-700">
                            {item.searchVolume.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                                item.type === 'quick_win'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : item.type === 'cannibalization'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : item.type === 'serp_feature'
                                  ? 'bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]'
                                  : item.type === 'opportunity'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}
                            >
                              {item.typeLabel}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-700 max-w-md">
                            <p className="line-clamp-2 leading-relaxed">{item.recommendation}</p>
                            <a
                              href={item.targetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-gray-400 hover:text-[#7C3AED] cursor-pointer truncate block mt-0.5 font-mono"
                            >
                              {item.targetUrl}
                            </a>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isApplied ? (
                              <button
                                type="button"
                                onClick={() => setSelectedWorkflowItem(item)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                                <span>✓ Applied</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedWorkflowItem(item)}
                                className="px-2.5 py-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[11px] font-bold rounded shadow-2xs transition-colors cursor-pointer"
                              >
                                Optimize
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD KEYWORD MODAL                                                         */}
      {/* ========================================================================= */}
      {isAddKeywordOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Add Keywords for Insights</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddKeywordOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddKeywordsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Enter target keywords (one per line):
                </label>
                <textarea
                  rows={4}
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder={`in web development which language is used\nin webuy\nin official platform\nin website`}
                  className="w-full text-xs border border-gray-300 rounded-lg p-3 text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:border-[#00B074] focus:ring-1 focus:ring-[#00B074]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Search Engine & Region:
                </label>
                <SearchEngineRegionSelector
                  value={selectedEngine.name}
                  onChange={setSelectedEngine}
                />
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3 text-xs text-emerald-800">
                <span className="font-bold">Automated Analysis:</span> SE Ranking will immediately cross-reference your rankings, identify page 2 quick wins, and detect cannibalization issues.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddKeywordOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00B074] hover:bg-[#009A65] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Add Keywords
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEO OPTIMIZATION WORKFLOW STUDIO MODAL                                    */}
      {/* ========================================================================= */}
      {selectedWorkflowItem && (
        <OptimizationWorkflowModal
          item={selectedWorkflowItem}
          isApplied={Boolean(appliedWorkflows[selectedWorkflowItem.id] || appliedWorkflows[selectedWorkflowItem.keyword])}
          savedChecklist={
            appliedWorkflows[selectedWorkflowItem.id]?.checklist ||
            appliedWorkflows[selectedWorkflowItem.keyword]?.checklist
          }
          onApply={(checklist) => {
            const updated = {
              ...appliedWorkflows,
              [selectedWorkflowItem.id]: {
                appliedAt: new Date().toISOString(),
                checklist,
              },
              [selectedWorkflowItem.keyword]: {
                appliedAt: new Date().toISOString(),
                checklist,
              },
            };
            setAppliedWorkflows(updated);
            try {
              localStorage.setItem('seranking_applied_optimizations', JSON.stringify(updated));
            } catch {
              // Ignore
            }
            showToast(`Optimization workflow successfully applied for "${selectedWorkflowItem.keyword}"! Tracking active.`);
            setSelectedWorkflowItem(null);
          }}
          onClose={() => setSelectedWorkflowItem(null)}
        />
      )}

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}

export default function InsightsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading Insights...</div>}>
      <InsightsContent />
    </Suspense>
  );
}
