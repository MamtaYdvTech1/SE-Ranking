"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Badge, Button, Input, Skeleton, Alert } from "@internal-seo/ui";
import { api } from "../../lib/api";
import {
  AuditOverviewDto,
  AuditIssueDto,
  CrawlPageDto,
  CrawlRunDto,
  ProjectDetailDto,
} from "../../lib/types";
import { formatDate } from "../../lib/formatters";
import { AuditHeader } from "./AuditHeader";
import { CrawlProgressBanner } from "./CrawlProgressBanner";
import { AuditSummaryCards } from "./AuditSummaryCards";
import { AuditIssueDrawer } from "./AuditIssueDrawer";
import { AuditSettingsModal } from "./AuditSettingsModal";
import { AuditOverviewTab } from "./AuditOverviewTab";
import { AuditOverviewView } from "./AuditOverviewView";
import { AuditFoundResourcesTab } from "./AuditFoundResourcesTab";
import { AuditFoundLinksTab } from "./AuditFoundLinksTab";
import { AuditCrawlComparisonTab } from "./AuditCrawlComparisonTab";

export type AuditSubTab = "overview" | "issues" | "pages" | "resources" | "links" | "compare" | "history";

interface AuditWorkspaceProps {
  project: ProjectDetailDto;
  initialTab?: AuditSubTab;
}

export function AuditWorkspace({ project, initialTab }: AuditWorkspaceProps) {
  const [overview, setOverview] = useState<AuditOverviewDto | null>(null);
  const [activeRun, setActiveRun] = useState<CrawlRunDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs: 'overview' | 'issues' | 'pages' | 'resources' | 'links' | 'compare'
  const [activeTab, setActiveTab] = useState<AuditSubTab>(initialTab || "issues");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Issues Tab State
  const [issues, setIssues] = useState<AuditIssueDto[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issueSeverity, setIssueSeverity] = useState<string>("all");
  const [issueCategory, setIssueCategory] = useState<string>("all");
  const [issueSearch, setIssueSearch] = useState<string>("");
  const [selectedIssue, setSelectedIssue] = useState<AuditIssueDto | null>(null);

  // Crawled Pages Tab State
  const [pages, setPages] = useState<CrawlPageDto[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pageSearch, setPageSearch] = useState<string>("");
  const [pageStatusFilter, setPageStatusFilter] = useState<string>("all");

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isWriter = project.userAccessLevel !== "ReadOnly";
  const isMountedRef = useRef(true);

  // Load Overview Callback (for polling and manual refresh)
  const loadOverview = useCallback(async () => {
    try {
      const res = await api.audit.getOverview(project.id);
      if (res.data && isMountedRef.current) {
        setOverview(res.data);
        if (
          res.data.lastCrawlRun &&
          (res.data.lastCrawlRun.status === "Queued" ||
            res.data.lastCrawlRun.status === "Crawling" ||
            res.data.lastCrawlRun.status === "Evaluating")
        ) {
          setActiveRun(res.data.lastCrawlRun);
        } else {
          setActiveRun(null);
        }
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        console.error("Failed to load audit overview:", err);
        setError("Failed to load technical audit overview.");
      }
    }
  }, [project.id]);

  // Initial Load Overview Effect
  useEffect(() => {
    let ignore = false;
    api.audit
      .getOverview(project.id)
      .then((res) => {
        if (!ignore && res.data) {
          setOverview(res.data);
          if (
            res.data.lastCrawlRun &&
            (res.data.lastCrawlRun.status === "Queued" ||
              res.data.lastCrawlRun.status === "Crawling" ||
              res.data.lastCrawlRun.status === "Evaluating")
          ) {
            setActiveRun(res.data.lastCrawlRun);
          } else {
            setActiveRun(null);
          }
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load audit overview:", err);
          setError("Failed to load technical audit overview.");
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [project.id]);

  // Load Issues Effect
  useEffect(() => {
    if (activeTab !== "issues" && activeTab !== "overview") return;

    let ignore = false;
    api.audit
      .getIssues(project.id, {
        severity: issueSeverity === "all" ? undefined : issueSeverity,
        category: issueCategory === "all" ? undefined : issueCategory,
        search: issueSearch.trim() || undefined,
        pageSize: 100,
      })
      .then((res) => {
        if (!ignore && res.data) {
          setIssues(res.data.items);
        }
      })
      .catch((err) => {
        if (!ignore) console.error("Failed to load audit issues:", err);
      })
      .finally(() => {
        if (!ignore) setIssuesLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [project.id, activeTab, issueSeverity, issueCategory, issueSearch]);

  // Load Pages Effect
  useEffect(() => {
    if (activeTab !== "pages") return;

    let statusCode: number | undefined;
    let isIndexable: boolean | undefined;

    if (pageStatusFilter === "200") statusCode = 200;
    else if (pageStatusFilter === "404") statusCode = 404;
    else if (pageStatusFilter === "redirect") statusCode = 301;
    else if (pageStatusFilter === "noindex") isIndexable = false;

    let ignore = false;
    api.audit
      .getPages(project.id, {
        statusCode,
        isIndexable,
        search: pageSearch.trim() || undefined,
        pageSize: 100,
      })
      .then((res) => {
        if (!ignore && res.data) {
          setPages(res.data.items);
        }
      })
      .catch((err) => {
        if (!ignore) console.error("Failed to load crawled pages:", err);
      })
      .finally(() => {
        if (!ignore) setPagesLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [project.id, activeTab, pageStatusFilter, pageSearch]);

  // Polling for active crawl run
  useEffect(() => {
    if (!activeRun) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.audit.getStatus(project.id, activeRun.id);
        if (res.data && isMountedRef.current) {
          setActiveRun(res.data);
          if (res.data.status === "Completed" || res.data.status === "Failed" || res.data.status === "Cancelled") {
            // Crawl finished, refresh full overview and lists
            await loadOverview();
            setActiveRun(null);
          }
        }
      } catch (err) {
        console.error("Error polling crawl status:", err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [activeRun, project.id, loadOverview]);

  // Trigger New Crawl
  const handleTriggerCrawl = async () => {
    if (!isWriter) return;
    setError(null);
    try {
      const res = await api.audit.startCrawl(project.id);
      if (res.data) {
        setActiveRun({
          id: res.data,
          projectId: project.id,
          status: "Queued",
          triggerSource: "Manual",
          urlsDiscovered: 1,
          urlsCrawled: 0,
          errorsCount: 0,
          warningsCount: 0,
          noticesCount: 0,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: unknown) {
      console.error("Failed to start crawl:", err);
      setError(err instanceof Error ? err.message : "Failed to initiate crawl.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid grid-cols-5 gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const isCrawling = !!activeRun;
  const hasEverCrawled = !!overview?.lastCrawlRun;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <AuditHeader
        primaryDomain={project.primaryDomain}
        protocol={project.protocol || "https://"}
        lastCrawlRun={activeRun || overview?.lastCrawlRun}
        isCrawling={isCrawling}
        canTriggerCrawl={isWriter}
        onTriggerCrawl={handleTriggerCrawl}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {error && (
        <Alert variant="error">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-xs underline hover:no-underline ml-4"
            >
              Dismiss
            </button>
          </div>
        </Alert>
      )}

      {/* Real-time Crawl Progress Banner */}
      {isCrawling && activeRun && (
        <CrawlProgressBanner activeRun={activeRun} />
      )}

      {/* Empty State: No Crawls Yet */}
      {!hasEverCrawled && !isCrawling && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Technical Audits Performed Yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Run your first bounded website crawl to analyze technical health, detect HTTP errors, indexability blockers, duplicate titles, and broken internal links.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              disabled={!isWriter}
              onClick={handleTriggerCrawl}
              className="shadow-sm"
            >
              {isWriter ? "Launch First Audit Crawl" : "Read-Only: Awaiting Crawl by Project Writer"}
            </Button>
          </div>
        </div>
      )}

      {/* Crawl Summary Metrics Cards (shown on issues, pages, resources, links tabs) */}
      {overview && hasEverCrawled && activeTab !== "overview" && (
        <AuditSummaryCards overview={overview} />
      )}

      {/* Main Workspace Navigation & Content */}
      {hasEverCrawled && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Sub-Tabs Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-3 overflow-x-auto">
            <div className="flex gap-1.5 whitespace-nowrap">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60"
                }`}
              >
                Overview
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("issues")}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition ${
                  activeTab === "issues"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60"
                }`}
              >
                Issue Report ({overview?.errorsCount ? overview.errorsCount + overview.warningsCount + overview.noticesCount : issues.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pages")}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition ${
                  activeTab === "pages"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60"
                }`}
              >
                Crawled Pages ({overview?.urlsCrawled ?? 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("resources")}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition ${
                  activeTab === "resources"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60"
                }`}
              >
                Found Resources
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("links")}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition ${
                  activeTab === "links"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60"
                }`}
              >
                Found Links
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("compare")}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition ${
                  activeTab === "compare" || activeTab === "history"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60"
                }`}
              >
                Crawl Comparison ({overview?.recentRuns?.length ?? 0})
              </button>
            </div>
          </div>

          {/* TAB 0: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="p-6">
              <AuditOverviewView
                project={project}
                overview={overview}
                issues={issues}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onInspectIssue={(issue) => setSelectedIssue(issue)}
              />
            </div>
          )}

          {/* TAB 1: ISSUES */}
          {activeTab === "issues" && (
            <div className="p-6 space-y-4">
              {/* Issue Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={issueSeverity}
                    onChange={(e) => setIssueSeverity(e.target.value)}
                    className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Severities</option>
                    <option value="Error">Errors Only</option>
                    <option value="Warning">Warnings Only</option>
                    <option value="Notice">Notices Only</option>
                  </select>

                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Indexability">Indexability</option>
                    <option value="Content">Content</option>
                    <option value="Links">Links</option>
                  </select>
                </div>

                <div className="w-full sm:w-64">
                  <Input
                    type="search"
                    placeholder="Search URL or rule..."
                    value={issueSearch}
                    onChange={(e) => setIssueSearch(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Issues Table */}
              {issuesLoading ? (
                <div className="space-y-2 py-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : issues.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No issues found matching the selected filters.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Severity</th>
                        <th className="px-4 py-3">Issue Title & Code</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Affected URL</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {issues.map((issue) => (
                        <tr
                          key={issue.id}
                          onClick={() => setSelectedIssue(issue)}
                          className="hover:bg-slate-50/80 cursor-pointer transition"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge
                              variant={
                                issue.severity === "Error"
                                  ? "danger"
                                  : issue.severity === "Warning"
                                  ? "warning"
                                  : "info"
                              }
                            >
                              {issue.severity}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{issue.ruleTitle}</div>
                            <div className="font-mono text-[10px] text-slate-400 mt-0.5">{issue.ruleCode}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-medium text-slate-600">{issue.ruleCategory}</span>
                          </td>
                          <td className="px-4 py-3 max-w-xs truncate font-mono text-[11px] text-slate-700" title={issue.affectedUrl}>
                            {issue.affectedUrl}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIssue(issue);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                            >
                              Inspect →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CRAWLED PAGES */}
          {activeTab === "pages" && (
            <div className="p-6 space-y-4">
              {/* Pages Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <select
                    value={pageStatusFilter}
                    onChange={(e) => setPageStatusFilter(e.target.value)}
                    className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All HTTP Status Codes</option>
                    <option value="200">200 OK Only</option>
                    <option value="404">404 Not Found Only</option>
                    <option value="redirect">3xx Redirects Only</option>
                    <option value="noindex">Non-Indexable Only</option>
                  </select>
                </div>

                <div className="w-full sm:w-64">
                  <Input
                    type="search"
                    placeholder="Filter by URL or title..."
                    value={pageSearch}
                    onChange={(e) => setPageSearch(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Pages Table */}
              {pagesLoading ? (
                <div className="space-y-2 py-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : pages.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No pages found matching the selected filter criteria.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">URL</th>
                        <th className="px-4 py-3">Page Title</th>
                        <th className="px-4 py-3 text-center">Depth</th>
                        <th className="px-4 py-3 text-center">Inlinks</th>
                        <th className="px-4 py-3 text-center">Load Time</th>
                        <th className="px-4 py-3">Indexability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pages.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge
                              variant={
                                p.httpStatusCode === 200
                                  ? "success"
                                  : p.httpStatusCode >= 300 && p.httpStatusCode < 400
                                  ? "info"
                                  : "danger"
                              }
                            >
                              {p.httpStatusCode}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] max-w-sm truncate text-slate-900" title={p.url}>
                            {p.url}
                          </td>
                          <td className="px-4 py-3 max-w-xs truncate text-slate-700" title={p.title ?? "—"}>
                            {p.title ?? <span className="text-slate-400 italic">No Title</span>}
                          </td>
                          <td className="px-4 py-3 text-center font-mono">{p.crawlDepth}</td>
                          <td className="px-4 py-3 text-center font-mono font-medium">{p.inlinksCount}</td>
                          <td className="px-4 py-3 text-center font-mono text-slate-500">
                            {p.loadTimeMs !== null ? `${p.loadTimeMs}ms` : "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge variant={p.isIndexable ? "success" : "outline"} className="text-[10px]">
                              {p.indexabilityStatus ?? (p.isIndexable ? "Indexable" : "Blocked")}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CRAWL HISTORY */}
          {activeTab === "history" && (
            <div className="p-6 space-y-4">
              {overview?.recentRuns && overview.recentRuns.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Trigger</th>
                        <th className="px-4 py-3">Started</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3 text-center">URLs Crawled</th>
                        <th className="px-4 py-3 text-center">Errors</th>
                        <th className="px-4 py-3 text-right">Health Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {overview.recentRuns.map((run) => (
                        <tr key={run.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge
                              variant={
                                run.status === "Completed"
                                  ? "success"
                                  : run.status === "Failed"
                                  ? "danger"
                                  : "info"
                              }
                            >
                              {run.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 capitalize font-medium text-slate-800">
                            {run.triggerSource}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                            {run.startedAt ? formatDate(run.startedAt) : formatDate(run.createdAt)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono">
                            {run.completedAt && run.startedAt
                              ? `${Math.max(
                                  1,
                                  Math.round(
                                    (new Date(run.completedAt).getTime() -
                                      new Date(run.startedAt).getTime()) /
                                      1000
                                  )
                                )}s`
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-medium">
                            {run.urlsCrawled}
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-semibold text-red-600">
                            {run.errorsCount}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">
                            {run.healthScore !== null && run.healthScore !== undefined
                              ? `${Math.round(Number(run.healthScore))}/100`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No crawl history available.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Slide-over Diagnostic Drawer */}
      <AuditIssueDrawer
        projectId={project.id}
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />

      {/* Crawl Settings Modal */}
      <AuditSettingsModal
        projectId={project.id}
        isOpen={isSettingsOpen}
        canEdit={isWriter}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={loadOverview}
      />
    </div>
  );
}