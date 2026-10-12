'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Sliders,
  TrendingUp,
  Globe,
  ExternalLink,
  ChevronDown,
  Info,
  RefreshCw,
  BarChart2,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { SearchEngineRegionSelector } from '@/components/ui/SearchEngineRegionSelector';

interface SerpItem {
  pos: number;
  title: string;
  url: string;
  domain: string;
  domainTrust: number;
  pageTrust: number;
  refDomains: number;
  wordCount: number;
  loadSpeed: string;
}

export default function SerpAnalyzerPage() {
  const { activeProject } = useApp();
  const domain = activeProject?.domain || 'workco.com';

  const [keyword, setKeyword] = useState('social media management tool');
  const [country, setCountry] = useState('India');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [serpResults, setSerpResults] = useState<SerpItem[]>([
    {
      pos: 1,
      title: 'WorkCo: Digital Product & Platform Engineering for Enterprises',
      url: `https://${domain}/`,
      domain: domain,
      domainTrust: 78,
      pageTrust: 64,
      refDomains: 1240,
      wordCount: 2450,
      loadSpeed: '0.8s',
    },
    {
      pos: 2,
      title: 'Sprout Social: Social Media Management Solutions',
      url: 'https://sproutsocial.com/',
      domain: 'sproutsocial.com',
      domainTrust: 86,
      pageTrust: 72,
      refDomains: 3410,
      wordCount: 2890,
      loadSpeed: '1.1s',
    },
    {
      pos: 3,
      title: 'Hootsuite: Social Media Marketing & Management Dashboard',
      url: 'https://hootsuite.com/',
      domain: 'hootsuite.com',
      domainTrust: 89,
      pageTrust: 76,
      refDomains: 4890,
      wordCount: 3100,
      loadSpeed: '1.4s',
    },
    {
      pos: 4,
      title: 'Buffer: All-you-need social media toolkit for small businesses',
      url: 'https://buffer.com/',
      domain: 'buffer.com',
      domainTrust: 84,
      pageTrust: 68,
      refDomains: 2950,
      wordCount: 1980,
      loadSpeed: '0.9s',
    },
    {
      pos: 5,
      title: 'Later: Social Media Marketing Platform & Scheduler',
      url: 'https://later.com/',
      domain: 'later.com',
      domainTrust: 81,
      pageTrust: 61,
      refDomains: 1840,
      wordCount: 2200,
      loadSpeed: '1.2s',
    },
  ]);

  const handleRunSerp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 p-6 select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 flex items-center gap-1.5 mb-1">
              <Link href="/website-audit" className="hover:text-blue-600">Website Audit</Link>
              <span>›</span>
              <span className="text-gray-900 font-semibold">SERP Analyzer</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#0B69FF]" />
              SERP Analyzer
            </h1>
          </div>

          <a
            href="https://help.seranking.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            Learn how SERP ranking factors work
          </a>
        </div>

        {/* Search Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <form onSubmit={handleRunSerp} className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[260px] relative">
              <input
                type="text"
                required
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter search keyword"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
              />
            </div>

            <div className="w-64">
              <SearchEngineRegionSelector
                value={country}
                onChange={(opt) => setCountry(opt.countryName)}
              />
            </div>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden bg-gray-50 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`px-3 py-2 transition-colors cursor-pointer ${
                  device === 'desktop' ? 'bg-[#0B69FF] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`px-3 py-2 transition-colors cursor-pointer ${
                  device === 'mobile' ? 'bg-[#0B69FF] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Mobile
              </button>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-5 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning SERP...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Top 10 SERP Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Top Organic SERP Competitors for &ldquo;{keyword}&rdquo;
            </h3>
            <span className="text-xs text-gray-500">Google India • Live Top 10</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Page Title &amp; URL</th>
                  <th className="px-4 py-3">Domain Trust</th>
                  <th className="px-4 py-3">Page Trust</th>
                  <th className="px-4 py-3">Ref. Domains</th>
                  <th className="px-4 py-3">Word Count</th>
                  <th className="px-4 py-3 text-right">Load Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {serpResults.map((item) => (
                  <tr key={item.pos} className={`hover:bg-gray-50/70 ${item.domain === domain ? 'bg-blue-50/40 font-semibold' : ''}`}>
                    <td className="px-4 py-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-900 font-bold flex items-center justify-center text-xs">
                        #{item.pos}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-sm">
                      <div className="font-bold text-gray-900 truncate">{item.title}</div>
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-[11px] truncate block">
                        {item.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{item.domainTrust}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{item.pageTrust}</td>
                    <td className="px-4 py-3 text-gray-600">{item.refDomains.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">{item.wordCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600 font-bold">{item.loadSpeed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
