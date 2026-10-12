"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Skeleton,
  Alert,
} from "@internal-seo/ui";
import { api } from "../../lib/api";
import { ProjectDashboardDto } from "../../lib/types";
import { formatDate } from "../../lib/formatters";

interface ProjectDashboardWorkspaceProps {
  projectId: string;
}

export function ProjectDashboardWorkspace({ projectId }: ProjectDashboardWorkspaceProps) {
  const [data, setData] = useState<ProjectDashboardDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.dashboard.getProjectDashboard(projectId);
      if (res.data) {
        setData(res.data);
      } else if (!res.success) {
        setError(res.message || "Failed to load project dashboard.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while loading the dashboard.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    let ignore = false;
    api.dashboard
      .getProjectDashboard(projectId)
      .then((res) => {
        if (!ignore) {
          if (res.data) {
            setData(res.data);
          } else if (!res.success) {
            setError(res.message || "Failed to load project dashboard.");
          }
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "An error occurred while loading the dashboard.";
          setError(msg);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto" data-testid="dashboard-loading">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 h-64"><Skeleton className="h-full w-full" /></Card>
          <Card className="p-6 h-64"><Skeleton className="h-full w-full" /></Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto" data-testid="dashboard-error">
        <Alert variant="error">
          <div className="flex items-center justify-between">
            <span>{error || "Project dashboard is unavailable."}</span>
            <Button size="sm" variant="outline" onClick={loadDashboard}>
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const { health, rankings, gsc, criticalIssues, tasks, freshness } = data;
  const isGscConnected = gsc.syncStatus === "Active" && gsc.lastSyncedAt;

  return (
    <div className="space-y-6 max-w-7xl mx-auto" data-testid="project-dashboard">
      {/* Header & Subsystem Freshness Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{data.projectName}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational SEO Command Center for <span className="text-slate-200 font-medium">{data.primaryDomain}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadDashboard} className="gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Freshness Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-900/70 border border-slate-800 rounded-lg text-xs" data-testid="freshness-bar">
        {/* Rank Check Freshness */}
        <div className="flex items-center justify-between md:justify-start md:gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${freshness.isRankingsStale ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
            <span className="text-slate-400">Rank Check:</span>
          </div>
          <span className="text-slate-200 font-medium">
            {freshness.lastRankCheckAt ? formatDate(freshness.lastRankCheckAt) : "Not checked yet"}
          </span>
          {freshness.isRankingsStale && (
            <Badge variant="warning" className="text-[10px] ml-1">Stale (&gt;48h)</Badge>
          )}
        </div>

        {/* Audit Crawl Freshness */}
        <div className="flex items-center justify-between md:justify-start md:gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${freshness.lastAuditCrawlAt ? "bg-emerald-400" : "bg-slate-500"}`} />
            <span className="text-slate-400">Audit Crawl:</span>
          </div>
          <span className="text-slate-200 font-medium">
            {freshness.lastAuditCrawlAt ? formatDate(freshness.lastAuditCrawlAt) : "No crawl completed"}
          </span>
        </div>

        {/* GSC Sync Freshness */}
        <div className="flex items-center justify-between md:justify-start md:gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isGscConnected ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span className="text-slate-400">GSC Sync:</span>
          </div>
          <span className="text-slate-200 font-medium">
            {freshness.lastGscSyncAt ? formatDate(freshness.lastGscSyncAt) : "Disconnected"}
          </span>
          <Badge variant={freshness.gscSyncStatus === "Active" ? "success" : "default"} className="text-[10px] ml-1">
            {freshness.gscSyncStatus}
          </Badge>
        </div>
      </div>

      {/* Row 1: 4 Primary Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. SEO Technical Health Card */}
        <Card className="hover:border-slate-700 transition" data-testid="kpi-health">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Technical Health</span>
              <Link href={`/projects/${projectId}/audit`} className="text-xs text-blue-400 hover:text-blue-300">
                Audit &rarr;
              </Link>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">
                {health.healthScore !== null && health.healthScore !== undefined ? health.healthScore : "—"}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="text-rose-400 font-medium">{health.errorsCount} Errors</span>
              <span className="text-amber-400">{health.warningsCount} Warnings</span>
              <span className="text-slate-400">{health.totalUrlsCrawled} URLs</span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Tracked Keywords & Visibility Card */}
        <Card className="hover:border-slate-700 transition" data-testid="kpi-rankings">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Keywords Tracked</span>
              <Link href={`/projects/${projectId}/rankings`} className="text-xs text-blue-400 hover:text-blue-300">
                Rankings &rarr;
              </Link>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">{rankings.totalKeywords}</span>
              <span className="text-xs text-emerald-400 font-medium">
                {rankings.averagePosition ? `Avg Pos ${rankings.averagePosition}` : "Unranked"}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Visibility: <strong className="text-slate-200">{rankings.searchVisibility !== null && rankings.searchVisibility !== undefined ? `${rankings.searchVisibility}%` : "—"}</strong></span>
              <span>Top 10: <strong className="text-slate-200">{rankings.top10Count}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* 3. GSC 28-Day Performance Card */}
        <Card className="hover:border-slate-700 transition" data-testid="kpi-gsc">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">GSC 28-Day Clicks</span>
              <Link href={`/projects/${projectId}/integrations/gsc`} className="text-xs text-blue-400 hover:text-blue-300">
                Performance &rarr;
              </Link>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">
                {isGscConnected ? gsc.totalClicks.toLocaleString() : "—"}
              </span>
              {isGscConnected ? (
                <span className="text-xs text-blue-400">{(gsc.averageCtr * 100).toFixed(1)}% CTR</span>
              ) : (
                <Badge variant="outline" className="text-[10px]">Disconnected</Badge>
              )}
            </div>
            <div className="mt-3 text-xs text-slate-400">
              {isGscConnected ? (
                <span>{gsc.totalImpressions.toLocaleString()} Impressions &bull; Avg Pos {gsc.averagePosition}</span>
              ) : (
                <Link href={`/projects/${projectId}/settings/integrations/gsc`} className="text-blue-400 hover:underline">
                  Connect Google Account
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 4. Remediation Tasks Card */}
        <Card className="hover:border-slate-700 transition" data-testid="kpi-tasks">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Remediation Tasks</span>
              <Link href={`/projects/${projectId}/tasks`} className="text-xs text-blue-400 hover:text-blue-300">
                Tasks &rarr;
              </Link>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">{tasks.openCount + tasks.inProgressCount}</span>
              <span className="text-xs text-slate-400">Active</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">{tasks.readyForVerificationCount} Ready for verify</span>
              {tasks.overdueCount > 0 ? (
                <Badge variant="danger" className="text-[10px]">{tasks.overdueCount} Overdue</Badge>
              ) : (
                <span className="text-emerald-400">0 Overdue</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Deep Dive Cards (Rankings Distribution & GSC Performance Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rank Distribution & Movements Card */}
        <Card data-testid="card-rankings-detail">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base text-white">Rank Distribution & Movements</CardTitle>
              <CardDescription>Position tiers and keyword volatility</CardDescription>
            </div>
            <Link href={`/projects/${projectId}/rankings`}>
              <Button size="sm" variant="outline">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {rankings.totalKeywords === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-lg border border-slate-800">
                <p>No keywords tracked yet.</p>
                <Link href={`/projects/${projectId}/keywords`} className="text-blue-400 hover:underline mt-2 inline-block">
                  Add keywords to track rankings
                </Link>
              </div>
            ) : (
              <>
                {/* Position Buckets */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1 font-medium">Top 3</span>
                    <span className="text-lg font-bold text-emerald-400">{rankings.top3Count}</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1 font-medium">Top 10</span>
                    <span className="text-lg font-bold text-blue-400">{rankings.top10Count}</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1 font-medium">Top 20</span>
                    <span className="text-lg font-bold text-indigo-400">{rankings.top20Count}</span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-1 font-medium">Top 100</span>
                    <span className="text-lg font-bold text-slate-300">{rankings.top100Count}</span>
                  </div>
                </div>

                {/* Movements Breakdown */}
                <div className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center justify-around text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">&uarr; {rankings.improvedCount}</span>
                    <span className="text-slate-400">Improved</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-rose-400 font-bold">&darr; {rankings.declinedCount}</span>
                    <span className="text-slate-400">Declined</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-300 font-bold">= {rankings.unchangedCount}</span>
                    <span className="text-slate-400">Unchanged</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* GSC 28-Day Performance Trend Card */}
        <Card data-testid="card-gsc-detail">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base text-white">First-Party Search Trend</CardTitle>
              <CardDescription>Google Search Console 28-day organic volume</CardDescription>
            </div>
            <Link href={`/projects/${projectId}/integrations/gsc`}>
              <Button size="sm" variant="outline">GSC Console</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isGscConnected ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-lg border border-slate-800">
                <p>Google Search Console is not connected.</p>
                <Link href={`/projects/${projectId}/settings/integrations/gsc`} className="text-blue-400 hover:underline mt-2 inline-block">
                  Configure OAuth &amp; Select Property
                </Link>
              </div>
            ) : gsc.dailySeries.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-lg border border-slate-800">
                <p>No search console metrics synchronized for this period.</p>
              </div>
            ) : (
              <>
                {/* Mini Daily Point Sparkline / Volume Bars */}
                <div className="space-y-1.5">
                  <div className="flex items-end gap-1 h-24 pt-4 px-2 bg-slate-950/40 rounded-lg border border-slate-900 overflow-hidden">
                    {gsc.dailySeries.map((point) => {
                      const maxClicks = Math.max(...gsc.dailySeries.map((p) => p.clicks), 1);
                      const heightPercent = Math.max(8, Math.round((point.clicks / maxClicks) * 100));
                      return (
                        <div
                          key={point.date}
                          className="flex-1 bg-blue-500/80 hover:bg-blue-400 rounded-xs transition-all cursor-pointer group relative"
                          style={{ height: `${heightPercent}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 px-2 py-1 bg-slate-900 text-[10px] text-white rounded-md shadow-lg border border-slate-800 pointer-events-none whitespace-nowrap">
                            {point.date}: {point.clicks} clicks
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 px-1">
                    <span>{gsc.startDate}</span>
                    <span>{gsc.endDate} (48h latency)</span>
                  </div>
                </div>

                {/* GSC Key Metrics Grid */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Clicks</span>
                    <span className="font-bold text-white">{gsc.totalClicks.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Impressions</span>
                    <span className="font-bold text-white">{gsc.totalImpressions.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Avg CTR</span>
                    <span className="font-bold text-white">{(gsc.averageCtr * 100).toFixed(2)}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Avg Pos</span>
                    <span className="font-bold text-white">{gsc.averagePosition}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Operational Remediation (Critical Issues & Tasks Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Critical Audit Issues */}
        <Card data-testid="card-critical-issues">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base text-white">Critical Audit Issues</CardTitle>
              <CardDescription>Top unresolved error-severity issues requiring action</CardDescription>
            </div>
            <Link href={`/projects/${projectId}/audit`}>
              <Button size="sm" variant="outline">Audit Issues</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {criticalIssues.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-semibold block mb-1">No Critical Errors Found</span>
                <span>Technical audit health is clean or no crawl has been executed.</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {criticalIssues.map((issue) => (
                  <div key={issue.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="danger" className="text-[10px]">{issue.ruleCode}</Badge>
                        <span className="text-slate-400 text-[11px]">{formatDate(issue.firstSeenAt)}</span>
                      </div>
                      <p className="text-slate-200 font-mono text-[11px] truncate">{issue.affectedUrl}</p>
                    </div>
                    <Link href={`/projects/${projectId}/tasks`}>
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 text-xs shrink-0">
                        Create Task
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks Summary Breakdown */}
        <Card data-testid="card-tasks-breakdown">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base text-white">Remediation Status</CardTitle>
              <CardDescription>Closed-loop issue resolution pipeline</CardDescription>
            </div>
            <Link href={`/projects/${projectId}/tasks`}>
              <Button size="sm" variant="outline">Task Board</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.totalCount === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-lg border border-slate-800">
                <p>No remediation tasks created for this project.</p>
                <Link href={`/projects/${projectId}/tasks`} className="text-blue-400 hover:underline mt-2 inline-block">
                  Create task on Kanban board
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Open</span>
                  <span className="text-lg font-bold text-white">{tasks.openCount}</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">In Progress</span>
                  <span className="text-lg font-bold text-blue-400">{tasks.inProgressCount}</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Ready to Verify</span>
                  <span className="text-lg font-bold text-amber-400">{tasks.readyForVerificationCount}</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Closed</span>
                  <span className="text-lg font-bold text-emerald-400">{tasks.closedCount}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
