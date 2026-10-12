"use client";

import React, { useState } from "react";
import { GitCompare, ArrowUp, ArrowDown, CheckCircle2, AlertTriangle, AlertCircle, Calendar } from "lucide-react";
import { Badge } from "@internal-seo/ui";

export function AuditCrawlComparisonTab() {
  const [selectedRunId, setSelectedRunId] = useState("run-prev-1");

  return (
    <div className="space-y-6">
      {/* Run Selector Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-blue-600" />
            <span>Crawl Runs Comparison</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare latest crawl against historical crawls to identify fixed issues and newly introduced regressions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Compare with:</span>
          <select
            value={selectedRunId}
            onChange={(e) => setSelectedRunId(e.target.value)}
            className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="run-prev-1">Crawl on Sep 21, 2026 (Score 84)</option>
            <option value="run-prev-2">Crawl on Sep 14, 2026 (Score 81)</option>
            <option value="run-prev-3">Crawl on Sep 07, 2026 (Score 78)</option>
          </select>
        </div>
      </div>

      {/* Delta Metrics Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Health Score Delta</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">87</span>
            <span className="text-xs text-slate-400 font-medium">vs 84</span>
          </div>
          <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
            <ArrowUp className="w-3.5 h-3.5" /> +3% improvement
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Fixed Issues</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">4</span>
            <span className="text-xs text-slate-400 font-medium">resolved</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 2 errors, 2 warnings fixed
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">New Regressions</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600">1</span>
            <span className="text-xs text-slate-400 font-medium">new issue</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Broken link detected
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Crawled URLs</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">79</span>
            <span className="text-xs text-slate-400 font-medium">vs 78</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-blue-600 flex items-center gap-1">
            <ArrowUp className="w-3.5 h-3.5" /> 1 new landing page
          </div>
        </div>
      </div>

      {/* Changes Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200">
          Detected Changes Between Crawl Runs
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Rule Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Affected URL</th>
                <th className="px-4 py-3">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Fixed
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  Duplicate H1 tags on homepage
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Content</td>
                <td className="px-4 py-3 font-mono text-[11px] text-slate-600">https://acme.example/</td>
                <td className="px-4 py-3 text-emerald-600 font-semibold">+1.5 score</td>
              </tr>
              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Fixed
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  Missing canonical tag on /pricing
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Indexability</td>
                <td className="px-4 py-3 font-mono text-[11px] text-slate-600">https://acme.example/pricing</td>
                <td className="px-4 py-3 text-emerald-600 font-semibold">+1.0 score</td>
              </tr>
              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                    <AlertCircle className="w-3 h-3" /> New
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  Page returns HTTP 404 (Not Found)
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Links</td>
                <td className="px-4 py-3 font-mono text-[11px] text-rose-600">https://acme.example/old-pricing-archived</td>
                <td className="px-4 py-3 text-rose-600 font-semibold">-0.5 score</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}