'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Code2,
  Terminal,
  Database,
  Zap,
  Check,
  ChevronDown,
  ArrowRight,
  Copy,
  ExternalLink,
  ShieldCheck,
  Server,
  Layers,
  Key,
  Globe,
  Users,
  X,
  Play,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

const sampleResponse = {
  keyword: "best running shoes",
  country_code: "US",
  search_volume: 165000,
  cpc: 2.14,
  competition: 0.78,
  keyword_difficulty: 64,
  serp_features: ["ai_overview", "featured_snippet", "people_also_ask"],
  intent: "commercial",
  history: [
    { month: "Jan", volume: 140000 },
    { month: "Feb", volume: 150000 },
    { month: "Mar", volume: 165000 }
  ]
};

export default function KeywordResearchApiPage() {
  const [showHelloBar, setShowHelloBar] = useState(true);
  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'python' | 'node'>('curl');
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs = [
    {
      q: 'How fresh is the Keyword Research API data?',
      a: 'Search volume data, SERP features, and competition metrics are refreshed on a continuous monthly basis across 190+ regional Google databases.',
    },
    {
      q: 'What rate limits apply to the Keyword Research API?',
      a: 'Starter plans support up to 50 requests per second. Scale and Enterprise plans support up to 200+ requests per second with dedicated queue prioritization.',
    },
    {
      q: 'Can I get search intent and SERP features in the response?',
      a: 'Yes! Every keyword lookup returns the intent classification (Informational, Commercial, Transactional, Navigational) and detected SERP elements like AI Overviews, Featured Snippets, and Video packs.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Top Hello Bar */}
      {showHelloBar && (
        <div className="bg-[#00B074] text-white text-xs sm:text-sm font-semibold py-2 px-4 flex items-center justify-between text-center relative z-50">
          <div className="flex-1 flex items-center justify-center gap-2">
            <span>⚡ Integrate 3+ billion keywords into your stack with SE Ranking API</span>
            <Link href="/signup" className="underline font-bold hover:text-white/90 transition-colors ml-1">
              Get free API key
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
              <Link href="/api-docs/keywords" className="text-[#0B69FF] font-bold">
                Keywords API
              </Link>
              <Link href="/api-docs/backlinks" className="hover:text-[#0B69FF] font-semibold transition-colors">
                Backlinks API
              </Link>
              <Link href="/api-docs/domains" className="hover:text-[#0B69FF] font-semibold transition-colors">
                Domain Analysis API
              </Link>
              <Link href="/api-docs/mcp" className="hover:text-[#0B69FF] font-semibold transition-colors">
                MCP Server
              </Link>
              <Link href="/pricing" className="hover:text-[#0B69FF] font-semibold transition-colors">
                Pricing
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
              Get API Key
            </Link>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="pt-16 pb-14 bg-gradient-to-b from-blue-50/40 via-white to-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0B69FF] text-xs font-bold mb-4">
            <Database className="w-3.5 h-3.5" />
            <span>Official SE Ranking Data Pipeline</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0f172a] tracking-tight leading-[1.12]">
            Keyword Research API
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-normal">
            Access 3+ billion search queries, real search volumes, CPC, organic difficulty, and SERP features directly via REST endpoints.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-[#0B69FF] hover:bg-blue-600 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Get 1,000 free API credits</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm sm:text-base rounded-xl transition-all"
            >
              View API Pricing
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-16 pt-8 border-t border-gray-100 text-gray-600 text-xs sm:text-sm font-semibold">
            <div>
              <span className="text-xl sm:text-2xl font-black text-gray-900 block">3.0 Billion+</span>
              <span className="text-gray-500">Keywords indexed</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-gray-900 block">190+</span>
              <span className="text-gray-500">Regional search engines</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 block">&lt; 120ms</span>
              <span className="text-gray-500">Average response time</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LIVE CODE & RESPONSE VIEWER */}
      <section className="py-20 bg-gray-50/60 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
              Simple REST API. Instant structured JSON responses.
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Integrate with simple HTTP requests in Python, Node.js, Go, or cURL.
            </p>
          </div>

          <div className="bg-[#0B0F19] text-white rounded-3xl border border-gray-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* Left: Code snippet */}
            <div className="lg:col-span-6 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-gray-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                  <div className="flex gap-2">
                    {(['curl', 'python', 'node'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveCodeLang(lang)}
                        className={`px-3 py-1 rounded text-xs font-mono uppercase cursor-pointer ${
                          activeCodeLang === lang ? 'bg-[#0B69FF] text-white font-bold' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => copyCode('curl code')}
                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <pre className="mt-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                  {activeCodeLang === 'curl' &&
`curl -X GET "https://api.seranking.com/v1/keywords/research" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -d "query=best+running+shoes" \\
  -d "country_code=US"`}
                  {activeCodeLang === 'python' &&
`import requests

url = "https://api.seranking.com/v1/keywords/research"
headers = {"Authorization": "Bearer YOUR_API_TOKEN"}
params = {"query": "best running shoes", "country_code": "US"}

res = requests.get(url, headers=headers, params=params)
data = res.json()
print(f"Volume: {data['search_volume']}, CPC: {data['cpc']}")`}
                  {activeCodeLang === 'node' &&
`import axios from 'axios';

const { data } = await axios.get('https://api.seranking.com/v1/keywords/research', {
  headers: { Authorization: 'Bearer YOUR_API_TOKEN' },
  params: { query: 'best running shoes', country_code: 'US' }
});
console.log(data);`}
                </pre>
              </div>

              <div className="pt-6 border-t border-gray-800 text-[11px] text-gray-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Enterprise grade SLA with 99.9% uptime guaranteed.</span>
              </div>
            </div>

            {/* Right: JSON Response */}
            <div className="lg:col-span-6 p-6 sm:p-8 bg-black/40">
              <div className="text-xs font-mono text-gray-400 pb-4 border-b border-gray-800 flex items-center justify-between">
                <span>Response (HTTP 200 OK)</span>
                <span className="text-emerald-400">92ms</span>
              </div>
              <pre className="mt-4 text-xs font-mono text-blue-300 overflow-x-auto leading-relaxed">
                {JSON.stringify(sampleResponse, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-2xl border border-gray-200/80 p-5 cursor-pointer"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div className="flex items-center justify-between font-bold text-sm sm:text-base text-gray-900">
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === idx ? 'rotate-180 text-[#0B69FF]' : ''}`} />
                </div>
                {openFaq === idx && (
                  <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-200 pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-white border-t border-gray-200 text-gray-600 text-xs py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div>
            <div className="mb-4">
              <SeRankingLogo variant="dark" width={130} height={28} />
            </div>
            <p className="text-gray-500 leading-relaxed">
              All-in-one SEO and digital marketing platform built for agencies, enterprises, and growing businesses.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 text-sm">Data APIs</h5>
            <ul className="space-y-2">
              <li><Link href="/api-docs/keywords" className="text-[#0B69FF] font-bold">Keyword Research API</Link></li>
              <li><Link href="/api-docs/backlinks" className="hover:text-blue-600">Backlinks API</Link></li>
              <li><Link href="/api-docs/domains" className="hover:text-blue-600">Domain Analysis API</Link></li>
              <li><Link href="/api-docs/mcp" className="hover:text-blue-600">MCP Server</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 text-sm">Solutions</h5>
            <ul className="space-y-2">
              <li><Link href="/for-agencies" className="hover:text-blue-600">For Agencies</Link></li>
              <li><Link href="/enterprise" className="hover:text-blue-600">Enterprise</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-600">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 text-sm">Company</h5>
            <ul className="space-y-2">
              <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
