"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Alert, Badge, Button, Skeleton } from "@internal-seo/ui";
import { api } from "../../lib/api";
import {
  GscCountryStatDto,
  GscDeviceStatDto,
  GscPageRowDto,
  GscPerformanceOverviewDto,
  GscQueryRowDto,
  PaginatedList,
} from "../../lib/types";
import { formatDate } from "../../lib/formatters";
import { useAuth } from "../../context/AuthContext";
import { GscKpiCards } from "./GscKpiCards";
import { GscTrendChart } from "./GscTrendChart";
import { GscQueryTable } from "./GscQueryTable";
import { GscPageTable } from "./GscPageTable";
import { GscDeviceCountryBreakdown } from "./GscDeviceCountryBreakdown";
import { GscQueryDetailDrawer } from "./GscQueryDetailDrawer";

export interface GscPerformanceWorkspaceProps {
  projectId: string;
}

export function GscPerformanceWorkspace({ projectId }: GscPerformanceWorkspaceProps) {
  const { user } = useAuth();
  const isWriter = user?.role === "SuperAdmin" || user?.role === "SEOExecutive";

  // Date Range Selection (7d, 28d, 90d)
  const [dateRangeKey, setDateRangeKey] = useState<"7d" | "28d" | "90d">("28d");
  const [activeTab, setActiveTab] = useState<"queries" | "pages" | "devices">("queries");

  // Data States
  const [overview, setOverview] = useState<GscPerformanceOverviewDto | null>(null);
  const [queries, setQueries] = useState<PaginatedList<GscQueryRowDto> | null>(null);
  const [pages, setPages] = useState<PaginatedList<GscPageRowDto> | null>(null);
  const [devices, setDevices] = useState<GscDeviceStatDto[]>([]);
  const [countries, setCountries] = useState<GscCountryStatDto[]>([]);

  // Loading & Sync States
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Queries Table State
  const [querySearch, setQuerySearch] = useState("");
  const [queryPage, setQueryPage] = useState(1);
  const [querySortBy, setQuerySortBy] = useState("clicks");
  const [querySortDesc, setQuerySortDesc] = useState(true);

  // Pages Table State
  const [pageSearch, setPageSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSortBy, setPageSortBy] = useState("clicks");
  const [pageSortDesc, setPageSortDesc] = useState(true);

  // Screen 33 Drawer State
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Calculate Date Boundaries
  const getDateRange = useCallback(() => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 1); // 24-48h GSC lag

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

      const [overviewRes, queriesRes, pagesRes, devicesRes, countriesRes] = await Promise.all([
        api.gsc.getOverview(projectId, { startDate, endDate }),
        api.gsc.getQueries(projectId, {
          startDate,
          endDate,
          search: querySearch || undefined,
          page: queryPage,
          pageSize: 50,
          sortBy: querySortBy,
          sortDescending: querySortDesc,
        }),
        api.gsc.getPages(projectId, {
          startDate,
          endDate,
          search: pageSearch || undefined,
          page: pageNumber,
          pageSize: 50,
          sortBy: pageSortBy,
          sortDescending: pageSortDesc,
        }),
        api.gsc.getDeviceBreakdown(projectId, { startDate, endDate }),
        api.gsc.getCountryBreakdown(projectId, { startDate, endDate, topCount: 10 }),
      ]);

      if (overviewRes.data) setOverview(overviewRes.data);
      if (queriesRes.data) setQueries(queriesRes.data);
      if (pagesRes.data) setPages(pagesRes.data);
      if (devicesRes.data) setDevices(devicesRes.data);
      if (countriesRes.data) setCountries(countriesRes.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load Search Console performance data.";
      setFeedbackError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, getDateRange, querySearch, queryPage, querySortBy, querySortDesc, pageSearch, pageNumber, pageSortBy, pageSortDesc]);

  useEffect(() => {
    let ignore = false;
    const { startDate, endDate } = getDateRange();

    Promise.all([
      api.gsc.getOverview(projectId, { startDate, endDate }),
      api.gsc.getQueries(projectId, {
        startDate,
        endDate,
        search: querySearch || undefined,
        page: queryPage,
        pageSize: 50,
        sortBy: querySortBy,
        sortDescending: querySortDesc,
      }),
      api.gsc.getPages(projectId, {
        startDate,
        endDate,
        search: pageSearch || undefined,
        page: pageNumber,
        pageSize: 50,
        sortBy: pageSortBy,
        sortDescending: pageSortDesc,
      }),
      api.gsc.getDeviceBreakdown(projectId, { startDate, endDate }),
      api.gsc.getCountryBreakdown(projectId, { startDate, endDate, topCount: 10 }),
    ])
      .then(([overviewRes, queriesRes, pagesRes, devicesRes, countriesRes]) => {
        if (!ignore) {
          if (overviewRes.data) setOverview(overviewRes.data);
          if (queriesRes.data) setQueries(queriesRes.data);
          if (pagesRes.data) setPages(pagesRes.data);
          if (devicesRes.data) setDevices(devicesRes.data);
          if (countriesRes.data) setCountries(countriesRes.data);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load Search Console performance data.";
          setFeedbackError(msg);
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
  }, [projectId, getDateRange, querySearch, queryPage, querySortBy, querySortDesc, pageSearch, pageNumber, pageSortBy, pageSortDesc]);

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      setFeedbackError(null);
      setFeedbackSuccess(null);

      await api.gsc.triggerSync(projectId);
      setFeedbackSuccess("Background Search Console daily sync initiated. Reloading data...");
      setTimeout(() => {
        loadData();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to trigger GSC sync.";
      setFeedbackError(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleQuerySort = (column: string) => {
    if (querySortBy === column) {
      setQuerySortDesc(!querySortDesc);
    } else {
      setQuerySortBy(column);
      setQuerySortDesc(true);
    }
    setQueryPage(1);
  };

  const handlePageSort = (column: string) => {
    if (pageSortBy === column) {
      setPageSortDesc(!pageSortDesc);
    } else {
      setPageSortBy(column);
      setPageSortDesc(true);
    }
    setPageNumber(1);
  };

  const handleSelectQuery = (q: string) => {
    setSelectedQuery(q);
    setIsDrawerOpen(true);
  };

  if (isLoading && !overview) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="gsc-loading">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const isDisconnected = overview?.syncStatus === "Disconnected" || !overview?.lastSyncedAt;
  const isError = overview?.syncStatus === "Error";
  const { startDate, endDate } = getDateRange();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="gsc-workspace">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight">Google Search Console</h1>
            <Badge variant={isError ? "danger" : isDisconnected ? "warning" : "success"}>
              {isError ? "Error" : isDisconnected ? "Not Connected" : "Active Sync"}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            First-party organic search performance (Clicks, Impressions, CTR, Average Position) from Google Search Console.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
            {(["7d", "28d", "90d"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDateRangeKey(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  dateRangeKey === r
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {r === "7d" ? "Last 7 Days" : r === "28d" ? "Last 28 Days" : "Last 3 Months"}
              </button>
            ))}
          </div>

          {/* Manual Sync Button */}
          {isWriter && !isDisconnected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="gap-1.5"
            >
              <svg className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
            </Button>
          )}

          <Link href={`/projects/${projectId}/settings/integrations/gsc`}>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </Button>
          </Link>
        </div>
      </div>

      {feedbackSuccess && (
        <Alert variant="success">
          {feedbackSuccess}
        </Alert>
      )}

      {feedbackError && (
        <Alert variant="error">
          {feedbackError}
        </Alert>
      )}

      {/* Freshness & Lag Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>Showing data from <strong className="text-slate-200">{startDate}</strong> to <strong className="text-slate-200">{endDate}</strong> (48h Google data availability latency applied).</span>
        </div>
        {overview?.lastSyncedAt && (
          <span className="text-[11px] text-slate-500">
            Last Synced: <span className="text-slate-300 font-medium">{formatDate(overview.lastSyncedAt)}</span>
          </span>
        )}
      </div>

      {isDisconnected ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4" data-testid="gsc-disconnected">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-white">Google Search Console Not Connected</h3>
            <p className="text-xs text-slate-400">
              Connect your Google account in project settings to start synchronizing first-party search performance metrics and search queries.
            </p>
          </div>
          <Link href={`/projects/${projectId}/settings/integrations/gsc`}>
            <Button variant="primary" size="sm">
              Open Integration Settings →
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <GscKpiCards
            totalClicks={overview?.totalClicks ?? 0}
            totalImpressions={overview?.totalImpressions ?? 0}
            averageCtr={overview?.averageCtr ?? 0}
            averagePosition={overview?.averagePosition ?? 0}
          />

          {/* Trend Chart */}
          <GscTrendChart series={overview?.dailySeries ?? []} />

          {/* Tab Navigation for Breakdown Tables */}
          <div className="flex border-b border-slate-800 space-x-6">
            <button
              type="button"
              onClick={() => setActiveTab("queries")}
              className={`pb-3 text-xs font-semibold transition border-b-2 ${
                activeTab === "queries"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Queries ({queries?.totalCount ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pages")}
              className={`pb-3 text-xs font-semibold transition border-b-2 ${
                activeTab === "pages"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Landing Pages ({pages?.totalCount ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("devices")}
              className={`pb-3 text-xs font-semibold transition border-b-2 ${
                activeTab === "devices"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Devices & Markets
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "queries" && (
            <GscQueryTable
              queries={queries}
              isLoading={isLoading}
              search={querySearch}
              onSearchChange={(val) => {
                setQuerySearch(val);
                setQueryPage(1);
              }}
              page={queryPage}
              onPageChange={setQueryPage}
              sortBy={querySortBy}
              sortDescending={querySortDesc}
              onSortChange={handleQuerySort}
              onSelectQuery={handleSelectQuery}
            />
          )}

          {activeTab === "pages" && (
            <GscPageTable
              pages={pages}
              isLoading={isLoading}
              search={pageSearch}
              onSearchChange={(val) => {
                setPageSearch(val);
                setPageNumber(1);
              }}
              page={pageNumber}
              onPageChange={setPageNumber}
              sortBy={pageSortBy}
              sortDescending={pageSortDesc}
              onSortChange={handlePageSort}
            />
          )}

          {activeTab === "devices" && (
            <GscDeviceCountryBreakdown
              deviceStats={devices}
              countryStats={countries}
            />
          )}
        </>
      )}

      {/* Screen 33 Query Detail Drawer */}
      <GscQueryDetailDrawer
        projectId={projectId}
        queryText={selectedQuery}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
}
