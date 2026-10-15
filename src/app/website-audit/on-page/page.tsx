'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileSearch,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { SearchEngineRegionSelector } from '@/components/ui/SearchEngineRegionSelector';
import type { OnPageAnalysisResult } from '@/services/seo/onpage.service';

type CheckState = 'pass' | 'warn' | 'fail';

function CheckRow({ label, state, text }: { label: string; state: CheckState; text: string }) {
  const color = state === 'pass' ? 'text-emerald-700' : state === 'warn' ? 'text-amber-700' : 'text-rose-700';
  const Icon = state === 'pass' ? CheckCircle2 : state === 'warn' ? AlertTriangle : XCircle;
  return (
    <div className="pt-2 flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <span className={`${color} font-semibold flex items-center gap-1`}>
        <Icon className="w-3.5 h-3.5" /> {text}
      </span>
    </div>
  );
}

function sectionStatus(states: CheckState[]): { text: string; className: string } {
  const passed = states.filter((s) => s === 'pass').length;
  if (passed === states.length) return { text: '100% Passed', className: 'text-emerald-600' };
  return { text: 'Action Needed', className: states.includes('fail') ? 'text-rose-600' : 'text-amber-600' };
}

export default function OnPageCheckerPage() {
  const { activeProject } = useApp();
  const domain = activeProject?.domain || '';

  const [urlInput, setUrlInput] = useState(domain ? `https://${domain}/` : '');
  const [keywordInput, setKeywordInput] = useState('');
  const [country, setCountry] = useState('India');
  const [isAuditing, setIsAuditing] = useState(false);
  const [analysis, setAnalysis] = useState<OnPageAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject?.id) {
      setError('Select a project before running the on-page check.');
      return;
    }
    setIsAuditing(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(activeProject.id)}/on-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput, targetKeyword: keywordInput }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(json?.error?.message || json?.error || 'On-page analysis failed.');
        setAnalysis(null);
      } else {
        setAnalysis(json.analysis as OnPageAnalysisResult);
      }
    } catch {
      setError('Network error while analyzing the page.');
      setAnalysis(null);
    } finally {
      setIsAuditing(false);
    }
  };

  // Checks derived from the analyzed page
  const kw = (analysis?.targetKeyword || '').toLowerCase().trim();
  const titlePos = analysis && kw ? analysis.title.toLowerCase().indexOf(kw) : -1;
  const titleLen = analysis?.title.length ?? 0;
  const descLen = analysis?.description.length ?? 0;

  const metaChecks: Array<{ label: string; state: CheckState; text: string }> = analysis
    ? [
        {
          label: 'Keyword in Title Tag',
          state: !kw ? 'warn' : titlePos >= 0 ? 'pass' : 'fail',
          text: !kw ? 'No keyword given' : titlePos >= 0 ? `Found at character ${titlePos + 1}` : 'Not found',
        },
        {
          label: 'Title Tag Length',
          state: titleLen === 0 ? 'fail' : titleLen <= 60 && titleLen >= 30 ? 'pass' : 'warn',
          text: titleLen === 0 ? 'Missing' : `${titleLen} / 60 characters`,
        },
        {
          label: 'Meta Description',
          state: descLen === 0 ? 'fail' : descLen <= 160 && descLen >= 70 ? 'pass' : 'warn',
          text: descLen === 0 ? 'Missing' : `${descLen} / 160 characters`,
        },
      ]
    : [];

  const contentChecks: Array<{ label: string; state: CheckState; text: string }> = analysis
    ? [
        {
          label: 'H1 Tag',
          state: analysis.h1 ? 'pass' : 'fail',
          text: analysis.h1 ? `"${analysis.h1.slice(0, 40)}${analysis.h1.length > 40 ? '…' : ''}"` : 'Missing',
        },
        {
          label: 'Keyword Density in Body',
          state: !kw ? 'warn' : analysis.keywordDensity >= 0.5 && analysis.keywordDensity <= 3 ? 'pass' : 'warn',
          text: !kw ? 'No keyword given' : `${analysis.keywordDensity.toFixed(1)}%`,
        },
        {
          label: 'Word Count',
          state: analysis.wordCount >= 300 ? 'pass' : analysis.wordCount >= 150 ? 'warn' : 'fail',
          text: `${analysis.wordCount.toLocaleString()} words`,
        },
        {
          label: 'Images Missing Alt',
          state: analysis.imagesMissingAlt === 0 ? 'pass' : 'warn',
          text: `${analysis.imagesMissingAlt} of ${analysis.imagesTotal}`,
        },
        {
          label: 'Canonical Tag',
          state: analysis.hasCanonical ? 'pass' : 'warn',
          text: analysis.hasCanonical ? 'Present' : 'Missing',
        },
      ]
    : [];

  const errorsCount = analysis?.issues.filter((i) => i.severity === 'Error').length ?? 0;
  const warningsCount = analysis?.issues.filter((i) => i.severity === 'Warning').length ?? 0;
  const passedCount = [...metaChecks, ...contentChecks].filter((c) => c.state === 'pass').length;
  const score = analysis?.score ?? 0;
  const scoreTone = score >= 80 ? 'emerald' : score >= 50 ? 'amber' : 'rose';
  const scoreLabel = score >= 80 ? 'Good On-Page Optimization' : score >= 50 ? 'On-Page Optimization Needs Work' : 'Poor On-Page Optimization';
  const metaStatus = sectionStatus(metaChecks.map((c) => c.state));
  const contentStatus = sectionStatus(contentChecks.map((c) => c.state));

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
                    <span>Analyzing Page...</span>
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

        {error && (
          <div className="px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-xs rounded-xl">{error}</div>
        )}

        {/* Audit Results */}
        {analysis && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Top Score Banner */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center ${
                    scoreTone === 'emerald'
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : scoreTone === 'amber'
                      ? 'border-amber-500 bg-amber-50/50'
                      : 'border-rose-500 bg-rose-50/50'
                  }`}
                >
                  <span
                    className={`text-2xl font-black ${
                      scoreTone === 'emerald' ? 'text-emerald-600' : scoreTone === 'amber' ? 'text-amber-600' : 'text-rose-600'
                    }`}
                  >
                    {score}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-gray-500">Score</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{scoreLabel}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 break-all">
                    {analysis.url}
                    {analysis.targetKeyword ? (
                      <>
                        {' '}for <strong>&ldquo;{analysis.targetKeyword}&rdquo;</strong>
                      </>
                    ) : null}
                    {' '}· loaded in {(analysis.loadTimeMs / 1000).toFixed(2)}s
                  </p>
                  <div className="flex items-center gap-4 text-xs font-semibold mt-2">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {passedCount} Passed
                    </span>
                    <span className="text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {warningsCount} Warnings
                    </span>
                    <span className="text-rose-700 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> {errorsCount} Critical Error{errorsCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Title Tag &amp; Meta Descriptions</span>
                  <span className={`${metaStatus.className} font-bold`}>{metaStatus.text}</span>
                </h4>
                <div className="space-y-2 text-xs divide-y divide-gray-100">
                  {metaChecks.map((c) => (
                    <CheckRow key={c.label} {...c} />
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Content &amp; Headings</span>
                  <span className={`${contentStatus.className} font-bold`}>{contentStatus.text}</span>
                </h4>
                <div className="space-y-2 text-xs divide-y divide-gray-100">
                  {contentChecks.map((c) => (
                    <CheckRow key={c.label} {...c} />
                  ))}
                </div>
              </div>
            </div>

            {analysis.issues.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Issues found</h4>
                <div className="divide-y divide-gray-100 text-xs">
                  {analysis.issues.map((issue, idx) => (
                    <div key={idx} className="py-2.5">
                      <div className="flex items-center gap-2 font-semibold text-gray-900">
                        {issue.severity === 'Error' ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        ) : issue.severity === 'Warning' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        {issue.title}
                      </div>
                      <p className="text-gray-500 mt-0.5">{issue.description}</p>
                      <p className="text-gray-700 mt-0.5">{issue.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
