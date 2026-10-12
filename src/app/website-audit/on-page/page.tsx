'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileSearch,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Globe,
  Sliders,
  ExternalLink,
  ChevronDown,
  Info,
  RefreshCw,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { SearchEngineRegionSelector } from '@/components/ui/SearchEngineRegionSelector';

export default function OnPageCheckerPage() {
  const { activeProject } = useApp();
  const domain = activeProject?.domain || 'workco.com';

  const [urlInput, setUrlInput] = useState(`https://${domain}/`);
  const [keywordInput, setKeywordInput] = useState('social media management');
  const [country, setCountry] = useState('India');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(true);

  const handleRunAudit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditComplete(true);
    }, 1200);
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
              <span className="text-gray-900 font-semibold">On-Page SEO Checker</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-[#0B69FF]" />
              On-Page SEO Checker
            </h1>
          </div>

          <a
            href="https://help.seranking.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            How on-page audit works
          </a>
        </div>

        {/* Input Form Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <form onSubmit={handleRunAudit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Page URL *
                </label>
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/page"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Main Keyword *
                </label>
                <input
                  type="text"
                  required
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="e.g. social media scheduler"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Search Location
                </label>
                <SearchEngineRegionSelector
                  value={country}
                  onChange={(opt) => setCountry(opt.countryName)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isAuditing}
                className="px-5 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2 uppercase tracking-wider"
              >
                {isAuditing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing SERP &amp; Content...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Analyze Webpage</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Audit Results View */}
        {auditComplete && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Top Score Banner */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center bg-emerald-50/50">
                  <span className="text-2xl font-black text-emerald-600">84</span>
                  <span className="text-[9px] uppercase font-bold text-gray-500">Score</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Good On-Page Optimization</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Analyzed against Top 10 organic ranking competitors for <strong>&ldquo;{keywordInput}&rdquo;</strong>
                  </p>
                  <div className="flex items-center gap-4 text-xs font-semibold mt-2">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 18 Passed
                    </span>
                    <span className="text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> 3 Warnings
                    </span>
                    <span className="text-rose-700 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> 1 Critical Error
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => alert('Exporting On-Page Audit PDF report...')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Export Report
                </button>
              </div>
            </div>

            {/* Checklist Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Category 1: Title & Meta Tags */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Title Tag &amp; Meta Descriptions</span>
                  <span className="text-emerald-600 font-bold">100% Passed</span>
                </h4>
                <div className="space-y-2 text-xs divide-y divide-gray-100">
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-gray-700">Keyword in Title Tag</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Found at position 1
                    </span>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-gray-700">Title Tag Length</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 54 / 60 characters
                    </span>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-gray-700">Meta Description</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 148 / 160 characters
                    </span>
                  </div>
                </div>
              </div>

              {/* Category 2: Content & Headings */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Content &amp; Headings</span>
                  <span className="text-amber-600 font-bold">Action Needed</span>
                </h4>
                <div className="space-y-2 text-xs divide-y divide-gray-100">
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-gray-700">H1 Tag Count</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Exactly 1 H1
                    </span>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-gray-700">Keyword Density in Body</span>
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> 0.8% (Target: 1.5%)
                    </span>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-gray-700">Word Count vs Competitors</span>
                    <span className="text-rose-700 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> 1,240 words (Avg: 2,100)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
