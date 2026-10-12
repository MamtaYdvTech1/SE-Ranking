"use client";

import React, { useState } from "react";
import {
  ProjectDetailDto,
  AuditOverviewDto,
  AuditIssueDto,
} from "../../lib/types";
import {
  RefreshCw,
  Settings,
  Share2,
  Download,
  MoreVertical,
  Calendar,
  ChevronDown,
  Info,
  X,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Monitor,
  Smartphone,
  Globe,
  Link as LinkIcon,
  Clock,
  FileText,
  MessageSquare,
  ArrowUpRight,
  TrendingUp,
  Layers,
  Database,
  Lock,
} from "lucide-react";

export interface AuditOverviewViewProps {
  project?: ProjectDetailDto;
  projectId?: string;
  overview?: AuditOverviewDto | null;
  issues?: AuditIssueDto[];
  onNavigateTab?: (tab: "issues" | "pages" | "resources" | "links" | "compare") => void;
  onInspectIssue?: (issue: AuditIssueDto) => void;
}

export function AuditOverviewView({
  project,
  projectId,
  overview,
  issues,
  onNavigateTab,
  onInspectIssue,
}: AuditOverviewViewProps) {
  // Banner dismiss states
  const [showIpBanner, setShowIpBanner] = useState(true);
  const [showBottomFeedback, setShowBottomFeedback] = useState(true);

  // Core Web Vitals device toggle
  const [cwvDevice, setCwvDevice] = useState<"desktop" | "mobile">("desktop");

  // Re-audit state
  const [isReauditing, setIsReauditing] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Date selectors
  const [currentDate] = useState("Sep 22, 2026 14:04:08");
  const [compareDate] = useState("Sep 15, 2026 14:14:01");

  const projectDomain = project?.primaryDomain || "workcomposer.com";

  const handleExport = (useCaseName: string) => {
    setExportNotice(`Export started for "${useCaseName}"`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleReaudit = () => {
    setIsReauditing(true);
    setTimeout(() => {
      setIsReauditing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 dark:text-slate-100">
      {/* EXPORT TOAST NOTIFICATION */}
      {exportNotice && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Download className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}


      {showIpBanner && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl px-4 py-3 flex items-start justify-between gap-3 text-xs text-blue-900 dark:text-blue-200 shadow-xs">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-blue-950 dark:text-blue-100">Whitelist our IP addresses. </span>
              <span>If you can't run an audit or crawl certain pages, make sure the current Website Audit IP addresses are allowed by your server or security system. Whitelist the server: </span>
              <button
                type="button"
                onClick={() => alert("Server IP: 198.51.100.42, 198.51.100.43")}
                className="underline text-blue-700 dark:text-blue-300 font-semibold hover:text-blue-800"
              >
                [IP addresses]
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowIpBanner(false)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 cursor-pointer p-0.5"
            aria-label="Dismiss IP notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. BREADCRUMBS & RIGHT UTILITY ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 font-medium">
          <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">{projectDomain}</span>
          <span>&gt;</span>
          <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">Website Audit</span>
          <span>&gt;</span>
          <span className="text-slate-900 dark:text-white font-semibold">Overview</span>
        </div>

        {/* Right utility links */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <button type="button" className="flex items-center gap-1 hover:text-blue-600 transition cursor-pointer">
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Guest link</span>
          </button>
          <button type="button" className="flex items-center gap-1 hover:text-blue-600 transition cursor-pointer">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedback</span>
          </button>
          <button type="button" className="flex items-center gap-1 hover:text-blue-600 transition cursor-pointer">
            <FileText className="w-3.5 h-3.5" />
            <span>Notes (46)</span>
          </button>
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            <span>Account limit 151 / 1000</span>
            <Info className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 3. TITLE, CRAWL META & ACTION ROW */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Overview / {projectDomain}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            <span>Last audit: <strong className="text-slate-700 dark:text-slate-200">Sep 22, 2026</strong></span>
            <span>•</span>
            <span>Scheduled audit: <strong className="text-slate-700 dark:text-slate-200">Sep 29, 2026</strong></span>
            <span>•</span>
            <span>Pages analyzed: <strong className="text-slate-700 dark:text-slate-200">121/283</strong></span>
            <span>•</span>
            <span>Scanned by: <strong className="text-slate-700 dark:text-slate-200">Desktop</strong></span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleReaudit}
            disabled={isReauditing}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-75 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReauditing ? "animate-spin" : ""}`} />
            <span>{isReauditing ? "AUDITING..." : "RE-AUDIT"}</span>
          </button>

          <button
            type="button"
            title="Settings"
            className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            title="Share"
            className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleExport("Complete Website Audit Overview Report")}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          <button
            type="button"
            title="More Options"
            className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. DATE COMPARISON SELECTORS */}
      <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Current report:</span>
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg font-semibold text-slate-800 dark:text-slate-200 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDate}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Compare to:</span>
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg font-semibold text-slate-800 dark:text-slate-200 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{compareDate}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>
        </div>

        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 ml-auto">
          <TrendingUp className="w-3 h-3" />
          <span>vs 7 days ago (+2.4% score improved)</span>
        </div>
      </div>

      {/* 5. HIGH-LEVEL KPI BENCHMARKS (TOP 3 CARDS GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CARD 1: HEALTH SCORE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                HEALTH SCORE <Info className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Category: 1
              </span>
            </div>

            {/* Circular Gauge Meter Representation */}
            <div className="flex items-center gap-5 my-2">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                    strokeDasharray="83, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">83</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">Strong</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Your website
                  </span>
                  <strong className="text-slate-900 dark:text-white font-bold">83</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                    Top competitors
                  </span>
                  <strong className="text-slate-700 dark:text-slate-300 font-semibold">94.6</strong>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                  ▲ +2 vs Sep 15
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: FOUND ISSUES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                FOUND ISSUES <Info className="w-3.5 h-3.5 text-slate-400" />
              </span>
            </div>

            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-1">
              312
            </div>

            {/* Segmented Bar */}
            <div className="w-full h-2.5 rounded-full flex overflow-hidden bg-slate-100 dark:bg-slate-800 my-3">
              <div className="bg-rose-500 h-full" style={{ width: "3%" }} title="Errors: 3" />
              <div className="bg-amber-400 h-full" style={{ width: "39%" }} title="Warnings: 121" />
              <div className="bg-blue-500 h-full" style={{ width: "58%" }} title="Notices: 188" />
            </div>

            {/* Metrics List */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Errors
                </span>
                <span className="font-bold text-slate-900 dark:text-white">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Warnings
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  121 <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">▲ 12</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Notices
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  188 <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">▲ 1</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab("issues") : null}
            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-between cursor-pointer"
          >
            <span>View all issues</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CARD 3: INDEXED PAGES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                INDEXED PAGES <Info className="w-3.5 h-3.5 text-slate-400" />
              </span>
            </div>

            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight my-1">
              79
            </div>

            {/* Two-tone bar */}
            <div className="w-full h-2.5 rounded-full flex overflow-hidden bg-slate-100 dark:bg-slate-800 my-3">
              <div className="bg-emerald-500 h-full" style={{ width: "96.2%" }} title="Indexable: 76 (96.2%)" />
              <div className="bg-rose-500 h-full" style={{ width: "3.8%" }} title="Not indexable: 3 (3.8%)" />
            </div>

            {/* Metrics List */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Disallowed from crawling
                </span>
                <span className="font-bold text-slate-900 dark:text-white">76 (96.2%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Blocked by robots.txt
                </span>
                <span className="font-bold text-slate-900 dark:text-white">3 (3.8%)</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab("pages") : null}
            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-between cursor-pointer"
          >
            <span>View all analyzed pages</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6. MOST POPULAR USE CASES & TOP ISSUES (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CARD A: MOST POPULAR USE CASES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
              MOST POPULAR USE CASES <Info className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-2">Use case</th>
                  <th className="pb-2 text-center">Quantity</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { title: "View non-indexed pages", qty: "38" },
                  { title: "View crawlable non-indexable pages", qty: "0" },
                  { title: "View pages with internal redirect issues", qty: "24 + 5" },
                  { title: "View links to redirect/broken pages", qty: "1 + 14" },
                  { title: "View redirect chains and loops", qty: "0" },
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-medium text-slate-700 dark:text-slate-300">
                      {item.title}
                    </td>
                    <td className="py-2.5 text-center font-bold text-slate-900 dark:text-white">
                      {item.qty}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleExport(item.title)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CARD B: TOP ISSUES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
                TOP ISSUES <Info className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab ? onNavigateTab("issues") : null}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>VIEW ALL (312)</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: "🛑",
                  severity: "Error",
                  badgeColor: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400",
                  title: "Web Server offline",
                  count: "1",
                  unit: "error",
                },
                {
                  icon: "🛑",
                  severity: "Error",
                  badgeColor: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400",
                  title: "Incorrect status codes in hreflang tags",
                  count: "2",
                  unit: "errors",
                },
                {
                  icon: "⚠️",
                  severity: "Warning",
                  badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
                  title: "H1 tag missing, duplicate, or empty",
                  count: "79",
                  unit: "warnings",
                },
                {
                  icon: "⚠️",
                  severity: "Warning",
                  badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
                  title: "Alt text missing for 50% of website images",
                  count: "3",
                  unit: "warnings",
                },
                {
                  icon: "ℹ",
                  severity: "Notice",
                  badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",
                  title: "Page slow load speed",
                  count: "38",
                  unit: "notices",
                },
              ].map((issue, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateTab ? onNavigateTab("issues") : null}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <span className="text-sm">{issue.icon}</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {issue.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${issue.badgeColor}`}>
                      {issue.count} {issue.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7. TECHNICAL CRAWL & PERFORMANCE BREAKDOWN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* WIDGET 1: PAGE INDEXABILITY */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              PAGE INDEXABILITY <Info className="w-3 h-3 text-slate-400" />
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <span>Indexable: 76 (96.2%)</span>
            <span>Non-indexable: 3 (3.8%)</span>
          </div>
          <div className="w-full h-2 rounded-full flex overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4">
            <div className="bg-emerald-500 h-full" style={{ width: "96.2%" }} />
            <div className="bg-rose-500 h-full" style={{ width: "3.8%" }} />
          </div>

          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">2xx Success</span>
              <strong className="text-emerald-600 font-bold">76</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">3xx Redirect</span>
              <strong className="text-slate-600 dark:text-slate-400 font-bold">0</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">4xx Client Error</span>
              <strong className="text-rose-600 font-bold">3</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">5xx Server Error</span>
              <strong className="text-slate-600 dark:text-slate-400 font-bold">0</strong>
            </div>
          </div>
        </div>

        {/* WIDGET 2: HTTP STATUS CODES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              HTTP STATUS CODES <Info className="w-3 h-3 text-slate-400" />
            </span>
          </div>

          <div className="flex items-center justify-center my-2">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray="96.2, 100"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-rose-500"
                  strokeDasharray="3.8, 100"
                  strokeDashoffset="-96.2"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-black text-slate-800 dark:text-white">79 URLs</span>
            </div>
          </div>

          <div className="space-y-1 text-[11px] pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                200 OK
              </span>
              <strong className="text-slate-900 dark:text-white">76 (96.2%)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                301 Moved Permanently
              </span>
              <strong className="text-slate-500">0</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                404 Not Found
              </span>
              <strong className="text-rose-600 font-bold">3 (3.8%)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                500 Server Error
              </span>
              <strong className="text-slate-500">0</strong>
            </div>
          </div>
        </div>

        {/* WIDGET 3: PAGES CRAWLED */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                PAGES CRAWLED <Info className="w-3 h-3 text-slate-400" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">79</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">▲ 1</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Historical crawl timeline</div>

            {/* Sparkline simulation */}
            <div className="h-14 flex items-end justify-between gap-1.5 mt-3 pt-2">
              {[45, 52, 60, 68, 72, 78, 79].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all group-hover:bg-blue-600"
                    style={{ height: `${(val / 80) * 100}%` }}
                    title={`${val} pages`}
                  />
                  <span className="text-[9px] text-slate-400">c{i+1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 text-center mt-2 border-t border-slate-100 dark:border-slate-800 pt-1.5">
            Updated: Sep 22, 14:04:08
          </div>
        </div>

        {/* WIDGET 4: PAGES FOUND */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                PAGES FOUND <Info className="w-3 h-3 text-slate-400" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">241</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">▲ 12</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Total discovered URLs on domain</div>

            {/* Acquisition timeline sparkline */}
            <div className="h-14 flex items-end justify-between gap-1.5 mt-3 pt-2">
              {[180, 195, 208, 220, 230, 235, 241].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full bg-emerald-500 rounded-t transition-all group-hover:bg-emerald-600"
                    style={{ height: `${(val / 250) * 100}%` }}
                    title={`${val} found`}
                  />
                  <span className="text-[9px] text-slate-400">d{i+1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 text-center mt-2 border-t border-slate-100 dark:border-slate-800 pt-1.5">
            Acquisition trend stable
          </div>
        </div>
      </div>

      {/* 8. DISTRIBUTION OF ISSUES BY CATEGORY (FULL WIDTH) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
            DISTRIBUTION OF ISSUES BY CATEGORY <Info className="w-3.5 h-3.5 text-slate-400" />
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Errors
            </span>
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Warnings
            </span>
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Notices
            </span>
          </div>
        </div>

        {/* Categories Bar Chart */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 pt-3">
          {[
            { cat: "Crawlability", err: 1, warn: 12, not: 4 },
            { cat: "HTTPS", err: 0, warn: 2, not: 0 },
            { cat: "Core Web Vitals", err: 0, warn: 18, not: 38 },
            { cat: "Titles", err: 0, warn: 8, not: 2 },
            { cat: "Descriptions", err: 0, warn: 14, not: 16 },
            { cat: "Keywords", err: 0, warn: 6, not: 24 },
            { cat: "Images", err: 0, warn: 34, not: 42 },
            { cat: "Links", err: 2, warn: 18, not: 28 },
            { cat: "Localization", err: 0, warn: 5, not: 14 },
            { cat: "AMP", err: 0, warn: 4, not: 20 },
          ].map((item, idx) => {
            const total = item.err + item.warn + item.not;
            const errH = (item.err / Math.max(total, 1)) * 100;
            const warnH = (item.warn / Math.max(total, 1)) * 100;
            const notH = (item.not / Math.max(total, 1)) * 100;

            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="relative h-28 w-6 bg-slate-100 dark:bg-slate-800 rounded flex flex-col justify-end overflow-hidden">
                  <div className="bg-rose-500 w-full" style={{ height: `${errH}%` }} title={`Errors: ${item.err}`} />
                  <div className="bg-amber-400 w-full" style={{ height: `${warnH}%` }} title={`Warnings: ${item.warn}`} />
                  <div className="bg-blue-500 w-full" style={{ height: `${notH}%` }} title={`Notices: ${item.not}`} />
                </div>
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mt-1">{total}</span>
                <span className="text-[10px] text-slate-500 text-center leading-tight mt-0.5 truncate w-full" title={item.cat}>
                  {item.cat}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 9. CORE WEB VITALS & DOMAIN METRICS (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CORE WEB VITALS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
              CORE WEB VITALS <Info className="w-3.5 h-3.5 text-slate-400" />
            </span>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setCwvDevice("desktop")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                  cwvDevice === "desktop"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white font-bold shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setCwvDevice("mobile")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                  cwvDevice === "mobile"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white font-bold shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* LCP */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  LCP (Largest Contentful Paint)
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {cwvDevice === "desktop" ? "1.8s (Good)" : "2.4s (Good)"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full flex overflow-hidden bg-slate-100 dark:bg-slate-800">
                <div className="bg-emerald-500 h-full" style={{ width: "82%" }} title="Good: 82%" />
                <div className="bg-amber-400 h-full" style={{ width: "12%" }} title="Needs Improvement: 12%" />
                <div className="bg-rose-500 h-full" style={{ width: "6%" }} title="Poor: 6%" />
              </div>
            </div>

            {/* INP */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  INP (Interaction to Next Paint)
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {cwvDevice === "desktop" ? "85ms (Good)" : "110ms (Good)"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full flex overflow-hidden bg-slate-100 dark:bg-slate-800">
                <div className="bg-emerald-500 h-full" style={{ width: "91%" }} title="Good: 91%" />
                <div className="bg-amber-400 h-full" style={{ width: "7%" }} title="Needs Improvement: 7%" />
                <div className="bg-rose-500 h-full" style={{ width: "2%" }} title="Poor: 2%" />
              </div>
            </div>

            {/* CLS */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  CLS (Cumulative Layout Shift)
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {cwvDevice === "desktop" ? "0.04 (Good)" : "0.07 (Good)"}
                </span>
              </div>
              <div className="w-full h-2 rounded-full flex overflow-hidden bg-slate-100 dark:bg-slate-800">
                <div className="bg-emerald-500 h-full" style={{ width: "95%" }} title="Good: 95%" />
                <div className="bg-amber-400 h-full" style={{ width: "4%" }} title="Needs Improvement: 4%" />
                <div className="bg-rose-500 h-full" style={{ width: "1%" }} title="Poor: 1%" />
              </div>
            </div>
          </div>
        </div>

        {/* DOMAIN METRICS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
              DOMAIN METRICS <Info className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="text-slate-500">Domain expiration</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Sep 14, 2030 <span className="text-[11px] text-emerald-600 font-normal">(Renew in 4 years)</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="text-slate-500">Domain Trust</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">40 / 100</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="text-slate-500">Backlinks</span>
              <div className="flex items-center gap-2">
                <strong className="text-slate-900 dark:text-white">258</strong>
                <button
                  type="button"
                  onClick={() => handleExport("Backlinks Report")}
                  className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-0.5"
                >
                  <span>Get full report</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="text-slate-500">Pages in Google</span>
              <strong className="text-slate-900 dark:text-white">82</strong>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Referring domains</span>
              <div className="flex items-center gap-2">
                <strong className="text-slate-900 dark:text-white">180</strong>
                <button
                  type="button"
                  onClick={() => handleExport("Referring Domains Report")}
                  className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-0.5"
                >
                  <span>Get full report</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 10. PAGE DEPTH, SERVER RESPONSE TIME & LINKS BREAKDOWN (3 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PAGE DEPTH */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-3">
            PAGE DEPTH <Info className="w-3 h-3 text-slate-400" />
          </span>
          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                <span>Level 1 (Direct)</span>
                <span className="font-bold">42% (33 pages)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: "42%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                <span>Level 2</span>
                <span className="font-bold">38% (30 pages)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full" style={{ width: "38%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                <span>Level 3</span>
                <span className="font-bold">16% (13 pages)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-300 h-full" style={{ width: "16%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                <span>Level 4+</span>
                <span className="font-bold">4% (3 pages)</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full" style={{ width: "4%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* SERVER RESPONSE TIME & PROTOCOL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-3">
              SERVER RESPONSE TIME <Info className="w-3 h-3 text-slate-400" />
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">&lt; 0.5s (Fast)</span>
                <strong className="text-emerald-600 font-bold">68 pages (86%)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">0.5s - 1s (Average)</span>
                <strong className="text-slate-700 dark:text-slate-300">8 pages (10%)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">1s - 2s (Slow)</span>
                <strong className="text-amber-600 font-bold">3 pages (4%)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">&gt; 2s (Critical)</span>
                <strong className="text-slate-400 font-bold">0 pages</strong>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Protocol Distribution:</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <Lock className="w-3 h-3" /> HTTPS 100% (79)
            </span>
          </div>
        </div>

        {/* INTERNAL & EXTERNAL LINKS BREAKDOWN */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-3">
            INTERNAL & EXTERNAL LINKS <Info className="w-3 h-3 text-slate-400" />
          </span>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Internal */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Internal Links</div>
              <div className="text-lg font-black text-slate-900 dark:text-white my-1">655</div>
              <div className="space-y-0.5 text-[10px] text-slate-500">
                <div>Follow: <strong className="text-slate-700 dark:text-slate-300">655</strong></div>
                <div>Nofollow: <strong className="text-slate-400">0</strong></div>
              </div>
            </div>

            {/* External */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">External Links</div>
              <div className="text-lg font-black text-slate-900 dark:text-white my-1">14</div>
              <div className="space-y-0.5 text-[10px] text-slate-500">
                <div>Follow: <strong className="text-emerald-600 font-semibold">11</strong></div>
                <div>Nofollow: <strong className="text-amber-600 font-semibold">3</strong></div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-center">
            <button
              type="button"
              onClick={() => onNavigateTab ? onNavigateTab("links") : null}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
            >
              Analyze link profile & anchors →
            </button>
          </div>
        </div>
      </div>

      {/* 11. BOTTOM FEEDBACK BANNER */}
      {showBottomFeedback && (
        <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>
              <strong>Need some specific data?</strong> If you'd like to see some particular data in our Website Audit tool, share your feedback with us.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowBottomFeedback(false)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 cursor-pointer"
            aria-label="Dismiss feedback prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}