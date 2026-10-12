"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Alert, Badge, Button, Skeleton } from "@internal-seo/ui";
import { api } from "../../lib/api";
import {
  Ga4ConnectionDto,
  Ga4OverviewDto,
  Ga4PageRowDto,
  PaginatedList,
} from "../../lib/types";
import { formatDate } from "../../lib/formatters";
import { useAuth } from "../../context/AuthContext";

interface Ga4PerformanceWorkspaceProps {
  projectId: string;
}

export function Ga4PerformanceWorkspace({ projectId }: Ga4PerformanceWorkspaceProps) {
  const { user } = useAuth();
  const isWriter = user?.role === "SuperAdmin" || user?.role === "SEOExecutive";

  // Date Range Selection (7d, 28d, 90d)
  const [dateRangeKey, setDateRangeKey] = useState<"7d" | "28d" | "90d">("28d");

  // Data States
  const [status, setStatus] = useState<Ga4ConnectionDto | null>(null);
  const [overview, setOverview] = useState<Ga4OverviewDto | null>(null);
  const [pages, setPages] = useState<PaginatedList<Ga4PageRowDto> | null>(null);

  // Loading & Sync States
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Pages Table State
  const [pageSearch, setPageSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSortBy, setPageSortBy] = useState("sessions");
  const [pageSortDesc, setPageSortDesc] = useState(true);

  // Calculate Date Boundaries
  const getDateRange = useCallback(() => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 1); // 24-48h GA4 lag

    const startDate = new Date(endDate);
    if (dateRangeKey === "7d") {
      startDate.setDate(endDate.getDate() - 6);
    } else if (dateRangeKey === "90d") {
      startDate.setDate(endDate.getDate() - 89);
    } else {
      startDate.setDate(endDate.getDate() - 27);
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }, [dateRangeKey]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setFeedbackError(null);
      const { startDate, endDate } = getDateRange();

      const [statusRes, overviewRes, pagesRes] = await Promise.all([
        api.ga4.getStatus(projectId),
        api.ga4.getOverview(projectId, { startDate, endDate }),
        api.ga4.getPages(projectId, {
          startDate,
          endDate,
          search: pageSearch || undefined,
          page: pageNumber,
          pageSize: 50,
          sortBy: pageSortBy,
          sortDescending: pageSortDesc,
        }),
      ]);

      if (statusRes.data) setStatus(statusRes.data);
      if (overviewRes.data) setOverview(overviewRes.data);
      if (pagesRes.data) setPages(pagesRes.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load GA4 analytics data.";
      setFeedbackError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, getDateRange, pageSearch, pageNumber, pageSortBy, pageSortDesc]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTriggerSync = async () => {
    try {
      setIsSyncing(true);
      setFeedbackError(null);
      setFeedbackSuccess(null);

      const res = await api.ga4.triggerSync(projectId);
      if (res.data) {
        setFeedbackSuccess("GA4 organic traffic sync job queued successfully in background.");
        setTimeout(() => {
          loadData();
        }, 1500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to trigger GA4 synchronization.";
      setFeedbackError(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading && !overview) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6" data-testid="ga4-loading">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  // Not Connected or Unbound State
  if (!status || !status.propertyIdentifier) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6" data-testid="ga4-not-connected">
        {feedbackError && (
          <Alert variant="error" data-testid="ga4-feedback-error" className="mb-4">
            {feedbackError}
          </Alert>
        )}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-semibold text-white">Google Analytics 4 Not Connected</h3>
            <p className="text-xs text-slate-400">
              Connect and bind a verified GA4 property to synchronize organic search sessions, active users, engagement, and revenue.
            </p>
          </div>
          <div>
            <Link href={`/projects/${projectId}/settings/integrations/ga4`}>
              <Button variant="primary" size="sm">
                Configure GA4 Integration Settings →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isError = status.syncStatus === "Error";

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6" data-testid="ga4-workspace">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Google Analytics 4</h1>
            <Badge variant={isError ? "danger" : "success"}>
              {isError ? "Sync Error" : "Active"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organic search performance for property <span className="font-semibold text-slate-700">{status.propertyIdentifier}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe Selector */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setDateRangeKey("7d")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                dateRangeKey === "7d"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setDateRangeKey("28d")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                dateRangeKey === "28d"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Last 28 Days
            </button>
            <button
              type="button"
              onClick={() => setDateRangeKey("90d")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                dateRangeKey === "90d"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Last 90 Days
            </button>
          </div>

          {/* Sync Trigger */}
          {isWriter && (
            <Button
              variant="outline"
              size="sm"
              disabled={isSyncing}
              onClick={handleTriggerSync}
              className="gap-1.5"
            >
              <svg className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
            </Button>
          )}

          <Link href={`/projects/${projectId}/settings/integrations/ga4`}>
            <Button variant="ghost" size="sm" className="text-slate-600">
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Freshness & Error Alerts */}
      {status.lastSyncedAt && (
        <div className="flex items-center gap-2 text-xs text-slate-500" data-testid="ga4-freshness">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Last Synced: {formatDate(status.lastSyncedAt)} UTC</span>
        </div>
      )}

      {feedbackSuccess && (
        <Alert variant="success" data-testid="ga4-feedback-success">
          {feedbackSuccess}
        </Alert>
      )}

      {feedbackError && (
        <Alert variant="error" data-testid="ga4-feedback-error">
          {feedbackError}
        </Alert>
      )}

      {/* Overview KPI Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" data-testid="ga4-kpis">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Organic Sessions</span>
            <p className="text-2xl font-bold text-slate-900">{overview.totalSessions.toLocaleString()}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Active Users</span>
            <p className="text-2xl font-bold text-slate-900">{overview.totalActiveUsers.toLocaleString()}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Avg Engagement Rate</span>
            <p className="text-2xl font-bold text-slate-900">{(overview.averageEngagementRate * 100).toFixed(2)}%</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Conversions</span>
            <p className="text-2xl font-bold text-slate-900">{overview.totalConversions.toLocaleString()}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <p className="text-2xl font-bold text-slate-900">${overview.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}

      {/* Daily Organic Traffic Trend */}
      {overview && overview.dailySeries && overview.dailySeries.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4" data-testid="ga4-trend-chart">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Daily Organic Sessions & Active Users</h3>
              <p className="text-xs text-slate-500">Nightly synchronized daily metrics from Google Analytics 4 Data API</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-blue-500"></span>
                <span className="text-slate-600">Sessions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                <span className="text-slate-600">Active Users</span>
              </div>
            </div>
          </div>

          <div className="h-48 flex items-end gap-1.5 pt-4">
            {overview.dailySeries.map((pt) => {
              const maxVal = Math.max(...overview.dailySeries.map((d) => Math.max(d.sessions, d.activeUsers)), 1);
              const sessionsHeight = Math.max(Math.round((pt.sessions / maxVal) * 100), 4);
              const usersHeight = Math.max(Math.round((pt.activeUsers / maxVal) * 100), 4);

              const dateStr = pt.date || "";
              return (
                <div key={dateStr} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-16 bg-slate-900 text-white text-[10px] rounded px-2 py-1 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                    <p className="font-semibold">{dateStr}</p>
                    <p>Sessions: {pt.sessions.toLocaleString()}</p>
                    <p>Active Users: {pt.activeUsers.toLocaleString()}</p>
                  </div>

                  {/* Bars */}
                  <div className="w-full flex items-end justify-center gap-0.5 h-full">
                    <div
                      style={{ height: `${sessionsHeight}%` }}
                      className="w-1/2 bg-blue-500 rounded-t-xs hover:bg-blue-600 transition"
                    ></div>
                    <div
                      style={{ height: `${usersHeight}%` }}
                      className="w-1/2 bg-emerald-500 rounded-t-xs hover:bg-emerald-600 transition"
                    ></div>
                  </div>
                  <span className="text-[9px] text-slate-400 truncate max-w-full">
                    {dateStr.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Landing Pages Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4" data-testid="ga4-pages-table">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Organic Landing Pages</h3>
            <p className="text-xs text-slate-500">Pages receiving organic search traffic, sessions, engagement, and attributed revenue</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search landing page URL..."
              value={pageSearch}
              onChange={(e) => {
                setPageSearch(e.target.value);
                setPageNumber(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <th
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-100"
                  onClick={() => {
                    if (pageSortBy === "landingpage") setPageSortDesc(!pageSortDesc);
                    else { setPageSortBy("landingpage"); setPageSortDesc(false); }
                  }}
                >
                  Landing Page URL
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100"
                  onClick={() => {
                    if (pageSortBy === "sessions") setPageSortDesc(!pageSortDesc);
                    else { setPageSortBy("sessions"); setPageSortDesc(true); }
                  }}
                >
                  Sessions {pageSortBy === "sessions" ? (pageSortDesc ? "↓" : "↑") : ""}
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100"
                  onClick={() => {
                    if (pageSortBy === "activeusers") setPageSortDesc(!pageSortDesc);
                    else { setPageSortBy("activeusers"); setPageSortDesc(true); }
                  }}
                >
                  Active Users {pageSortBy === "activeusers" ? (pageSortDesc ? "↓" : "↑") : ""}
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100"
                  onClick={() => {
                    if (pageSortBy === "engagementrate") setPageSortDesc(!pageSortDesc);
                    else { setPageSortBy("engagementrate"); setPageSortDesc(true); }
                  }}
                >
                  Engagement Rate {pageSortBy === "engagementrate" ? (pageSortDesc ? "↓" : "↑") : ""}
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100"
                  onClick={() => {
                    if (pageSortBy === "conversions") setPageSortDesc(!pageSortDesc);
                    else { setPageSortBy("conversions"); setPageSortDesc(true); }
                  }}
                >
                  Conversions {pageSortBy === "conversions" ? (pageSortDesc ? "↓" : "↑") : ""}
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100"
                  onClick={() => {
                    if (pageSortBy === "revenue") setPageSortDesc(!pageSortDesc);
                    else { setPageSortBy("revenue"); setPageSortDesc(true); }
                  }}
                >
                  Revenue {pageSortBy === "revenue" ? (pageSortDesc ? "↓" : "↑") : ""}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages && pages.items.length > 0 ? (
                pages.items.map((row, idx) => (
                  <tr key={`${row.landingPage}-${idx}`} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-800 break-all">
                      {row.landingPage}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                      {row.sessions.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {row.activeUsers.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {(row.engagementRate * 100).toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {row.conversions.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      ${row.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No organic landing page metrics found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages && pages.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Showing Page {pages.pageNumber} of {pages.totalPages} ({pages.totalCount} total landing pages)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pages.hasPreviousPage}
                onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pages.hasNextPage}
                onClick={() => setPageNumber((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
