'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

const RELEASES_2026 = [
  {
    id: 'local-api',
    title: 'New release: Local Marketing API & MCP',
    date: 'September 15, 2026',
    tag: 'NEW',
    headline: 'Build client reports from Local Marketing data via API',
    description:
      "All Local Marketing data is now available through the API: local rankings, reviews, business listings, audits, and Google Business Profile insights. Our new Local Marketing API adds 15 read-only endpoints that return every connected location's data as structured JSON, ready for your dashboards, integrations, and automation workflows.",
    featuresTitle: 'Features and capabilities',
    features: [
      'List your locations: Get all connected locations with health scores, ratings, and listing counts, plus each location’s full business profile.',
      'Pull a combined overview: Retrieve a location’s ranking data, audit score, listing status, review info, and GBP metrics in a single request.',
      'Track local rankings: Access positions by keyword and tracking point, with history and the indexed percentage.',
      'Get audit reports: Read the latest Local Marketing audit with categorized issues and see the full audit history.',
      'Monitor Google Business Profile: Retrieve performance metrics, keyword reports, and search trends.',
      'Check business listings: See per-directory sync status and NAP consistency across all connected directories.',
      'Analyze reviews: List reviews from all connected sources and read aggregated review info.',
    ],
    benefitsTitle: 'How can you benefit from it',
    benefits: [
      'Automate client reporting: Pull each location’s rankings, reviews, and listing status into Looker Studio, your own dashboard, or a client-ready report.',
      'Check business listings: See each directory’s sync status and presence, and spot NAP errors surfaced in the latest audit.',
      'Rebuild the rankings grid in your own tools: Positions are returned per keyword per tracking point (the data behind the map view), so you can recreate it in any BI tool.',
    ],
  },
  {
    id: 'se-visible',
    title: 'Latest SE Visible Updates',
    date: 'July 3, 2026',
    tag: 'NEW',
    headline: 'Competitor gaps, calendar comparison, and prompt management',
    description:
      'SE Visible got more actionable — it’s easier to see where competitors win in AI answers, track whether you’re improving, and manage large prompt sets in minutes.',
    featuresTitle: 'Competitor Gap Analysis in Sources',
    features: [
      'Gap Score ranks every source by how often it’s cited in AI answers and how many competitors it mentions — a prioritized action list, not just raw data.',
      'Filter sources by competitor, by the number of competitors present, and by whether your brand is mentioned.',
      'New Brand mentions column and Mention Rate per domain reveal the sites that shape AI answers in your space, but leave you out.',
      'Alias-aware detection, with every new column included in CSV/XLSX export.',
    ],
    benefitsTitle: 'Period comparison (calendar-based)',
    benefits: [
      'Every key Dashboard metric now shows absolute and % change next to its current value — Visibility Score, Average Position, Your Rank, Net Sentiment, Competitors, and Sources.',
      'Faster prompt management: View prompts grouped by topic (collapsible) or as a flat list, and use bulk actions to multi-select across pages.',
    ],
  },
  {
    id: 'se-ranking-updates',
    title: 'Latest SE Ranking Updates',
    date: 'July 3, 2026',
    tag: 'NEW',
    headline: 'AI Results Tracker: Groups, Import, and Reporting',
    description:
      'Managing AI prompts at scale — and reporting on them — just got a lot easier. Three additions make AI Results Tracker more useful day to day and simpler to hand off to clients.',
    featuresTitle: 'Prompt Groups',
    features: [
      'Organize prompts into groups that match how you work — by topic or content pillar, or by optimization goal (e.g. brand mention vs. source citation).',
      'Track group-level visibility trends across Google AI Overviews, ChatGPT, Gemini, and Perplexity.',
      'Prompt Import: Add prompts in bulk, not one at a time via CSV or text file.',
      'AIRT in Report Builder: Report on AI tracking metrics directly in Report Builder with three new modules.',
    ],
    benefitsTitle: 'Why it matters',
    benefits: [
      'Group-level analysis surfaces trends you cannot see prompt-by-prompt.',
      'Makes coverage gaps easier to spot and demonstrates the real ROI of generative engine optimization.',
    ],
  },
  {
    id: 'api-planable',
    title: 'Latest Updates for SE Ranking API and Planable',
    date: 'June 29, 2026',
    tag: 'NEW',
    headline: 'Data API: New API limits and pre-built Claude skills',
    description:
      'Monthly API credits on every new plan. All new plans now include a recurring monthly Data API credit allocation and Project API access — no API add-on required just to get started.',
    featuresTitle: 'Claude SEO Skills',
    features: [
      'Seven pre-built Skills turn common SEO and GEO tasks into guided workflows Claude can run with live SE Ranking data.',
      'Content Brief: Turn a topic into a writer-ready SEO brief grounded in live SERP and keyword data.',
      'AI Search Visibility: See who AI engines cite across ChatGPT, Perplexity, Gemini, and AI Overviews.',
      'Backlink Gap Analysis: Find domains linking to competitors but not to you, prioritized by authority.',
      'Planable MCP: Create social content that feeds AI search directly from your AI conversation.',
    ],
    benefitsTitle: 'Simple to connect, powerful to use',
    benefits: [
      'Once connected, your AI assistant has live access to SE Ranking data across keyword research, domain analysis, backlinks, and website audits.',
      'Zero CSV exports or jumping between dashboards required.',
    ],
  },
  {
    id: 'remote-mcp',
    title: 'New Release: SE Ranking API — Remote MCP Server',
    date: 'April 23, 2026',
    tag: 'NEW',
    headline: 'Connect SE Ranking to your AI assistant in minutes',
    description:
      'The SE Ranking MCP server is now centrally hosted and managed by SE Ranking. Previously, connecting required Node.js, Docker, and manual configuration. Now you connect directly from your AI tool’s settings with zero technical setup.',
    featuresTitle: 'What you can do',
    features: [
      'Generate a content brief in one prompt with real-time competitor keyword gap data.',
      'Monitor AI Search visibility across all LLMs.',
      'Catch technical issues before rankings drop by comparing recent audit snapshots.',
      'Combine SE Ranking with other data sources in a single conversation.',
    ],
    benefitsTitle: 'Get started easily',
    benefits: [
      'Grab your API key and connect to the remote endpoint.',
      'Works seamlessly in Claude, Cursor, Antigravity, and all MCP-compliant AI assistants.',
    ],
  },
];

export default function WhatsNewPage() {
  const [activeYear, setActiveYear] = useState('2026');
  const [selectedReleaseId, setSelectedReleaseId] = useState('local-api');

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between font-sans select-none">
      {/* 1. Purple Announcement Banner matching brand */}
      <div className="bg-[#7C3AED] text-white py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2">
        <span>Start doing more with your AI Visibility Data</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>

      {/* 2. Top Header matching screenshot */}
      <header className="border-b border-gray-100 bg-white py-4 px-6 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="hover:opacity-90">
              <SeRankingLogo variant="brand" width={135} height={32} />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-gray-700">
              <button type="button" className="flex items-center gap-1 hover:text-blue-600">
                <span>Solutions</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              <button type="button" className="flex items-center gap-1 hover:text-blue-600">
                <span>Tools</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              <button type="button" className="flex items-center gap-1 hover:text-blue-600">
                <span>Resources</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              <Link href="/pricing" className="hover:text-blue-600">
                Pricing
              </Link>
              <Link href="/api-docs" className="hover:text-blue-600">
                API &amp; MCP
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-gray-500 font-medium mr-2">EN ⌄</span>
            <Link
              href="/login"
              className="text-gray-700 hover:text-[#0B69FF] font-bold px-2 py-1.5 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 bg-[#0B69FF] hover:bg-[#0052cc] text-white rounded-lg font-bold shadow-xs transition-colors"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Hero Blue Section matching screenshot */}
      <section className="bg-[#4D7CFF] text-white py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            What&apos;s New at SE Ranking
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto font-normal leading-relaxed">
            New features, improvements and updates all in one place to help you make the most of SE Ranking
          </p>
        </div>
      </section>

      {/* 4. Release Timeline Section matching screenshots */}
      <main className="max-w-7xl mx-auto px-6 py-14 w-full flex-1">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-12">
          Release timeline
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Years and Submenu List */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-4 text-xl font-bold text-[#1B66FF]">
              <span>2026</span>
            </div>

            <div className="space-y-3 text-xs font-semibold text-gray-600 pl-2 border-l-2 border-gray-200">
              {RELEASES_2026.map((rel) => {
                const isSelected = selectedReleaseId === rel.id;
                return (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => setSelectedReleaseId(rel.id)}
                    className={`block w-full text-left py-1 px-3 rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'text-[#1B66FF] font-bold bg-blue-50/70 border-l-2 border-[#1B66FF] -ml-[14px]'
                        : 'hover:text-gray-950'
                    }`}
                  >
                    {rel.title}
                  </button>
                );
              })}
            </div>

            {/* Other Years */}
            <div className="space-y-5 text-xl font-bold text-gray-400 pt-6">
              {['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'].map((yr) => (
                <div key={yr} className="cursor-pointer hover:text-gray-700 transition-colors">
                  {yr}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Timeline Detailed Entries matching screenshot */}
          <div className="lg:col-span-8 space-y-16 relative pl-6 border-l-2 border-blue-400">
            {RELEASES_2026.map((rel) => (
              <article key={rel.id} id={rel.id} className="relative space-y-5">
                {/* Timeline circle dot */}
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-4 border-[#1B66FF]" />

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {rel.title}
                  </h3>
                  <div className="text-xs text-gray-400 mt-1 font-medium">
                    {rel.date}
                  </div>
                </div>

                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  <div className="inline-block px-2.5 py-0.5 rounded bg-blue-100 text-[#1B66FF] text-[11px] font-extrabold uppercase">
                    {rel.tag}
                  </div>

                  <h4 className="text-lg font-bold text-gray-900">
                    {rel.headline}
                  </h4>

                  <p className="text-gray-600">
                    {rel.description}
                  </p>

                  <div className="pt-2 space-y-2">
                    <h5 className="font-bold text-gray-900 text-sm">
                      {rel.featuresTitle}
                    </h5>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600 leading-relaxed">
                      {rel.features.map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 space-y-2">
                    <h5 className="font-bold text-gray-900 text-sm">
                      {rel.benefitsTitle}
                    </h5>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600 leading-relaxed">
                      {rel.benefits.map((ben, idx) => (
                        <li key={idx}>{ben}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      {/* 5. Royal Blue CTA Section matching exact screenshot */}
      <section className="bg-[#1B66FF] text-white py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Want to see all updates in action?
          </h2>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="px-8 py-3 rounded-lg border-2 border-white text-white font-bold text-sm hover:bg-white/10 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-sm shadow-md transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6 px-6 text-center text-xs text-gray-400">
        © 2013 - 2026 SE Ranking. All rights reserved.
      </footer>
    </div>
  );
}
