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
  ShieldCheck,
  Globe,
  Link2,
  X,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

const sampleBacklinkResponse = {
  target: "seranking.com",
  domain_trust: 78,
  page_trust: 64,
  total_backlinks: 4820000,
  referring_domains: 32400,
  dofollow_ratio: 0.82,
  nofollow_ratio: 0.18,
  top_anchors: [
    { anchor: "se ranking", count: 182000, ratio: 0.45 },
    { anchor: "seranking.com", count: 114000, ratio: 0.28 }
  ]
};

export default function BacklinksApiPage() {
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
      q: 'How fast are Backlinks API requests processed?',
      a: 'Our distributed multi-region cluster serves backlink profile queries in an average of under 140ms.',
    },
    {
      q: 'Can I filter backlinks by dofollow, toxicity score, or date discovered?',
      a: 'Yes! The API supports query parameters for `filter_type=dofollow`, `toxicity_threshold=min`, `date_from`, and `limit`.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Hello Bar */}
      {showHelloBar && (
        <div className="bg-[#00B074] text-white text-xs sm:text-sm font-semibold py-2 px-4 flex items-center justify-between text-center relative z-50">
          <div className="flex-1 flex items-center justify-center gap-2">
            <span>⚡ Access 3.2+ Trillion indexed backlinks with SE Ranking API</span>
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
              <Link href="/api-docs/keywords" className="hover:text-[#0B69FF] font-semibold transition-colors">
                Keywords API
              </Link>
              <Link href="/api-docs/backlinks" className="text-[#0B69FF] font-bold">
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
            <Link2 className="w-3.5 h-3.5" />
            <span>Link Intelligence API</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0f172a] tracking-tight leading-[1.12]">
            Backlinks API
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-normal">
            Stream real-time backlink metrics, referring domain authority, and anchor analysis directly into your products and applications.
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
              <span className="text-xl sm:text-2xl font-black text-gray-900 block">3.2 Trillion</span>
              <span className="text-gray-500">Backlinks indexed</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-gray-900 block">300M+</span>
              <span className="text-gray-500">Domains indexed</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 block">99.9%</span>
              <span className="text-gray-500">Uptime SLA guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CODE VIEWER */}
      <section className="py-20 bg-gray-50/60 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0B0F19] text-white rounded-3xl border border-gray-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
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
`curl -X GET "https://api.seranking.com/v1/backlinks/overview" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -d "target=seranking.com"`}
                  {activeCodeLang === 'python' &&
`import requests

url = "https://api.seranking.com/v1/backlinks/overview"
headers = {"Authorization": "Bearer YOUR_API_TOKEN"}
params = {"target": "seranking.com"}

res = requests.get(url, headers=headers, params=params)
print(res.json())`}
                  {activeCodeLang === 'node' &&
`import axios from 'axios';

const { data } = await axios.get('https://api.seranking.com/v1/backlinks/overview', {
  headers: { Authorization: 'Bearer YOUR_API_TOKEN' },
  params: { target: 'seranking.com' }
});
console.log(data);`}
                </pre>
              </div>

              <div className="pt-6 border-t border-gray-800 text-[11px] text-gray-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Enterprise grade SLA with 99.9% uptime guaranteed.</span>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 sm:p-8 bg-black/40">
              <div className="text-xs font-mono text-gray-400 pb-4 border-b border-gray-800 flex items-center justify-between">
                <span>Response (HTTP 200 OK)</span>
                <span className="text-emerald-400">110ms</span>
              </div>
              <pre className="mt-4 text-xs font-mono text-blue-300 overflow-x-auto leading-relaxed">
                {JSON.stringify(sampleBacklinkResponse, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
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
              <li><Link href="/api-docs/keywords" className="hover:text-blue-600">Keyword Research API</Link></li>
              <li><Link href="/api-docs/backlinks" className="text-[#0B69FF] font-bold">Backlinks API</Link></li>
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
        </div>
      </footer>
    </div>
  );
}
