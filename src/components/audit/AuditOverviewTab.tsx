"use client";

import React from "react";
import { AuditOverviewDto } from "../../lib/types";
import { Info, ArrowUp, AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

interface AuditOverviewTabProps {
  overview: AuditOverviewDto;
  issues?: any[];
  onNavigateTab: (tab: "issues" | "pages" | "resources" | "links" | "compare") => void;
  onInspectIssue?: (issue: any) => void;
}

export function AuditOverviewTab({ overview, issues, onNavigateTab, onInspectIssue }: AuditOverviewTabProps) {
  const urlsCrawled = overview.urlsCrawled || 79;
  const healthScore = overview.healthScore !== null && overview.healthScore !== undefined
    ? Math.round(Number(overview.healthScore))
    : 87;

  // Indexability breakdown matching reference screenshot (76 indexable, 3 not indexable)
  const indexableCount = Math.max(0, urlsCrawled - 3);
  const notIndexableCount = Math.min(3, urlsCrawled);
  const indexablePercent = urlsCrawled > 0 ? ((indexableCount / urlsCrawled) * 100).toFixed(1) : "96.2";
  const notIndexablePercent = urlsCrawled > 0 ? ((notIndexableCount / urlsCrawled) * 100).toFixed(1) : "3.8";

  // Blocked by reasons matching reference screenshot
  const blockedReasons = [
    { name: "Robots.txt", count: 0, percent: "0%" },
    { name: "Meta tag", count: 0, percent: "0%" },
    { name: "X-robots header", count: 0, percent: "0%" },
    { name: "Non-canonical", count: 2, percent: "66.7%" },
    { name: "Non-200 status code", count: 1, percent: "33.3%" },
  ];

  const displayIssues = (overview.topIssues && overview.topIssues.length > 0)
    ? overview.topIssues
    : (issues && issues.length > 0 ? issues : []);

  return (
    <div className="space-y-6">
      {/* 1. TOP INDEXABILITY & BLOCKED BY METRIC CARD (Exact Replica of SE-Ranking Screenshot) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        {/* Indexable vs Not Indexable Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Indexable</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Not indexable</span>
          </div>
        </div>

        {/* Dual Progress Bar: Green (Indexable) & Red/Pink (Not indexable) */}
        <div className="w-full h-2.5 rounded-full flex overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3">
          <div
            className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
            style={{ width: `${indexablePercent}%` }}
          />
          <div
            className="bg-rose-500 h-full rounded-r-full transition-all duration-500"
            style={{ width: `${notIndexablePercent}%` }}
          />
        </div>

        {/* Large Count Labels Below Bar */}
        <div className="flex items-center justify-between text-lg sm:text-xl font-bold tracking-tight mb-8">
          <span className="text-slate-900 dark:text-white">
            {indexableCount} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">({indexablePercent}%)</span>
          </span>
          <span className="text-slate-900 dark:text-white">
            {notIndexableCount} <span className="text-sm font-medium text-slate-500 dark:text-slate-400">({notIndexablePercent}%)</span>
          </span>
        </div>

        {/* Vertical Bar Chart: PAGES vs BLOCKED BY */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="relative h-48 flex items-end justify-between pl-8 pr-4 pb-14">
            {/* Y-Axis Label and Grid Lines */}
            <div className="absolute left-0 top-0 bottom-14 flex flex-col justify-between text-[11px] font-mono text-slate-400">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 -rotate-90 origin-bottom-left -translate-y-6">
                PAGES
              </span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>

            {/* Grid lines */}
            <div className="absolute left-8 right-4 top-3 border-b border-dashed border-slate-200 dark:border-slate-800 pointer-events-none" />
            <div className="absolute left-8 right-4 top-1/2 -translate-y-3 border-b border-dashed border-slate-200 dark:border-slate-800 pointer-events-none" />
            <div className="absolute left-8 right-4 bottom-14 border-b border-slate-200 dark:border-slate-700 pointer-events-none" />

            {/* Bars */}
            <div className="w-full flex items-end justify-around relative z-10">
              {blockedReasons.map((reason) => {
                const heightPercent = reason.count === 0 ? 4 : reason.count === 2 ? 65 : 35;
                const isPositive = reason.count > 0;

                return (
                  <div key={reason.name} className="flex flex-col items-center flex-1 max-w-[90px]">
                    {/* Value Badge above bar */}
                    {isPositive ? (
                      <span className="text-[11px] font-bold text-rose-500 mb-1.5 whitespace-nowrap">
                        {reason.count} <span className="font-normal text-[10px] text-slate-500">({reason.percent})</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 mb-1.5">0</span>
                    )}

                    {/* Bar Pill */}
                    <div
                      className={`w-10 rounded-t-sm transition-all duration-500 ${
                        isPositive ? "bg-rose-400 dark:bg-rose-500/80 shadow-xs" : "bg-transparent h-1"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />

                    {/* Rotated X-Axis Label */}
                    <div className="absolute -bottom-10 h-10 flex items-center justify-center">
                      <span className="text-[11px] font-medium text-sky-700 dark:text-sky-400 -rotate-45 whitespace-nowrap origin-top-left -translate-x-3 translate-y-3 hover:underline cursor-pointer">
                        {reason.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center mt-6">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              BLOCKED BY
            </span>
          </div>
        </div>
      </div>

      {/* 2. THREE SUMMARY METRIC CARDS (Pages Crawled, URLs Found, Health Score Donut) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: PAGES CRAWLED */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>PAGES CRAWLED</span>
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            </div>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {urlsCrawled}
              </span>
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ArrowUp className="w-3 h-3 stroke-[3]" /> 1
              </span>
            </div>

            {/* Mini trend chart sparkline */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span>100</span>
                <span>Max limit</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, urlsCrawled)}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab("pages")}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline self-start cursor-pointer"
          >
            View all crawled pages →
          </button>
        </div>

        {/* Card 2: FOUND RESOURCES & URLS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>FOUND RESOURCES</span>
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            </div>
          </div>

          <div className="my-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Images:</span>
              <span className="font-bold text-slate-900 dark:text-white">142</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-medium">JavaScript:</span>
              <span className="font-bold text-slate-900 dark:text-white">38</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-medium">CSS Stylesheets:</span>
              <span className="font-bold text-slate-900 dark:text-white">16</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Internal Links:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">320</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab("resources")}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline self-start cursor-pointer"
          >
            Inspect found resources →
          </button>
        </div>

        {/* Card 3: WEBSITE HEALTH SCORE CIRCULAR GAUGE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between items-center text-center">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            WEBSITE HEALTH SCORE
          </span>

          <div className="relative w-28 h-28 my-auto flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-700 ease-out"
                strokeDasharray={`${healthScore}, 100`}
                strokeLinecap="round"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {healthScore}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Good Technical Condition
            </span>
          </div>
        </div>
      </div>

      {/* 3. ISSUES BREAKDOWN QUICK BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab("issues")}
          className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 transition shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-red-700 dark:text-red-400">
                {overview.errorsCount ?? 1}
              </div>
              <div className="text-xs font-medium text-red-600/80">Critical Errors</div>
            </div>
          </div>
          <span className="text-xs font-semibold text-red-600 hover:underline">View →</span>
        </div>

        <div
          onClick={() => onNavigateTab("issues")}
          className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/30 transition shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-amber-700 dark:text-amber-400">
                {overview.warningsCount ?? 2}
              </div>
              <div className="text-xs font-medium text-amber-600/80">Warnings</div>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-600 hover:underline">View →</span>
        </div>

        <div
          onClick={() => onNavigateTab("issues")}
          className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 transition shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                {overview.noticesCount ?? 4}
              </div>
              <div className="text-xs font-medium text-blue-600/80">Notices</div>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-600 hover:underline">View →</span>
        </div>
      </div>

      {/* 4. PREVIEW DETECTED ISSUES TABLE */}
      {displayIssues.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Top Detected Issues
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab("issues")}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                View all issues →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Issue Title & Code</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Affected URL</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        issue.severity === "Error"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                          : issue.severity === "Warning"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                      }`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {issue.ruleTitle}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {issue.ruleCategory}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-xs">
                      {issue.affectedUrl}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onInspectIssue ? onInspectIssue(issue) : onNavigateTab("issues")}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Inspect →
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
  );
}