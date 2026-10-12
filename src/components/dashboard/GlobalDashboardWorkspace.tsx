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
import { GlobalDashboardDto } from "../../lib/types";

export function GlobalDashboardWorkspace() {
  const [data, setData] = useState<GlobalDashboardDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGlobalDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.dashboard.getGlobalDashboard();
      if (res.data) {
        setData(res.data);
      } else if (!res.success) {
        setError(res.message || "Failed to load global portfolio dashboard.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while loading the global dashboard.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    api.dashboard
      .getGlobalDashboard()
      .then((res) => {
        if (!ignore) {
          if (res.data) {
            setData(res.data);
          } else if (!res.success) {
            setError(res.message || "Failed to load global portfolio dashboard.");
          }
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "An error occurred while loading the global dashboard.";
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
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="global-dashboard-loading">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
            </Card>
          ))}
        </div>
        <Card className="p-6 h-96"><Skeleton className="h-full w-full" /></Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="global-dashboard-error">
        <Alert variant="error">
          <div className="flex items-center justify-between">
            <span>{error || "Global portfolio dashboard is unavailable."}</span>
            <Button size="sm" variant="outline" onClick={loadGlobalDashboard}>
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="global-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Portfolio Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Consolidated enterprise health, rankings, and task remediation across authorized projects.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadGlobalDashboard} className="gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </Button>
          <Link href="/projects">
            <Button size="sm" variant="primary">All Projects</Button>
          </Link>
        </div>
      </div>

      {/* 4 Rollup KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="global-kpi-projects">
          <CardContent className="pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Projects</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">{data.totalProjects}</span>
              <span className="text-xs text-slate-400">Managed</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="global-kpi-keywords">
          <CardContent className="pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tracked Keywords</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">{data.totalTrackedKeywords.toLocaleString()}</span>
              <span className="text-xs text-slate-400">Portfolio</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="global-kpi-health">
          <CardContent className="pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average SEO Health</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">
                {data.averageHealthScore !== null && data.averageHealthScore !== undefined ? data.averageHealthScore : "—"}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="global-kpi-tasks">
          <CardContent className="pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Open Tasks</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white">{data.totalOpenTasks}</span>
              {data.totalOverdueTasks > 0 ? (
                <Badge variant="danger" className="text-[10px]">{data.totalOverdueTasks} Overdue</Badge>
              ) : (
                <span className="text-xs text-emerald-400">0 Overdue</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Portfolio Table */}
      <Card data-testid="global-projects-table">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base text-white">Managed Project Portfolio</CardTitle>
            <CardDescription>Live health and operational performance by website</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {data.projects.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-900/40 rounded-lg border border-slate-800">
              <p>No projects assigned or accessible.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/70 border-b border-slate-800 text-slate-400 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Project &amp; Domain</th>
                    <th className="px-4 py-3 text-center">Health Score</th>
                    <th className="px-4 py-3 text-center">Keywords</th>
                    <th className="px-4 py-3 text-center">Open Tasks</th>
                    <th className="px-4 py-3 text-center">GSC Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.projects.map((proj) => (
                    <tr key={proj.projectId} className="hover:bg-slate-900/30 transition">
                      <td className="px-4 py-3.5">
                        <Link href={`/projects/${proj.projectId}`} className="font-semibold text-white hover:text-blue-400 block">
                          {proj.name}
                        </Link>
                        <span className="text-slate-400 font-mono text-[11px]">{proj.primaryDomain}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {proj.healthScore !== null && proj.healthScore !== undefined ? (
                          <span className={`font-bold ${proj.healthScore >= 80 ? "text-emerald-400" : proj.healthScore >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                            {proj.healthScore} / 100
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center font-medium text-slate-200">
                        {proj.trackedKeywords}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-slate-200 font-medium">{proj.openTasks}</span>
                        {proj.overdueTasks > 0 && (
                          <Badge variant="danger" className="text-[10px] ml-1.5">{proj.overdueTasks} Overdue</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge variant={proj.gscSyncStatus === "Active" ? "success" : "default"} className="text-[10px]">
                          {proj.gscSyncStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link href={`/projects/${proj.projectId}`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            Dashboard &rarr;
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
