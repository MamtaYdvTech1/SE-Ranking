"use client";

import React, { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import {
  ProjectDetailDto,
  RankingsHistoricalResponseDto,
  RankingsHistoricalKeywordDto,
} from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import {
  RankingsHeader,
  RankingSettingsState,
  defaultRankingSettings,
  DEFAULT_SELECTED_COLUMNS,
  filterDatesByAmount,
} from "./RankingsHeader";
import { AddKeywordModal } from "../keywords/AddKeywordModal";

interface RankingsHistoricalWorkspaceProps {
  project: ProjectDetailDto;
}

type MetricCardTab = "average_position" | "traffic_forecast" | "search_visibility" | "top_10";

export function RankingsHistoricalWorkspace({ project }: RankingsHistoricalWorkspaceProps) {
  const { isViewer } = useAuth();

  // Column Visibility & Preferences State
  const [rankingSettings, setRankingSettings] = useState<RankingSettingsState>(defaultRankingSettings);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = localStorage.getItem(`ranking_settings_${project.id}`);
        if (saved) {
          setRankingSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
        }
      } catch (e) {
        // ignore
      }
    }
  }, [project.id]);

  const visibleColumns = useMemo(
    () => new Set(rankingSettings.selectedColumns || DEFAULT_SELECTED_COLUMNS),
    [rankingSettings.selectedColumns]
  );

  // Data State
  const [data, setData] = useState<RankingsHistoricalResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date Range Controls (Baseline vs Current)
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Position Filters State
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [minPosInput, setMinPosInput] = useState<string>("");
  const [maxPosInput, setMaxPosInput] = useState<string>("");
  const [appliedMinPos, setAppliedMinPos] = useState<number | undefined>(undefined);
  const [appliedMaxPos, setAppliedMaxPos] = useState<number | undefined>(undefined);
  const [changesOnly, setChangesOnly] = useState<"up" | "down" | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [device, setDevice] = useState<string>("all");

  // Metric Tab & Chart State
  const [activeMetricTab, setActiveMetricTab] = useState<MetricCardTab>("average_position");
  const [isChartExpanded, setIsChartExpanded] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  // Selection & Expand State
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<Set<string>>(new Set());
  const [expandedKeywordIds, setExpandedKeywordIds] = useState<Set<string>>(new Set());

  // Modals & Action State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);

  const lastFetchedDatesRef = React.useRef<{ dateFrom: string; dateTo: string; skipNext: boolean }>({
    dateFrom: "",
    dateTo: "",
    skipNext: false,
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load historical rankings
  useEffect(() => {
    if (
      data &&
      dateFrom === lastFetchedDatesRef.current.dateFrom &&
      dateTo === lastFetchedDatesRef.current.dateTo &&
      lastFetchedDatesRef.current.skipNext
    ) {
      lastFetchedDatesRef.current.skipNext = false;
      return;
    }
    loadHistoricalData();
  }, [
    project.id,
    dateFrom,
    dateTo,
    positionFilter,
    appliedMinPos,
    appliedMaxPos,
    changesOnly,
    debouncedSearch,
    device,
    page,
    pageSize,
  ]);

  const loadHistoricalData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.rankings.getHistorical(project.id, {
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        positionFilter,
        minPosition: appliedMinPos,
        maxPosition: appliedMaxPos,
        changesOnly,
        search: debouncedSearch || undefined,
        device: device === "all" ? undefined : device,
        page,
        pageSize,
      });

      if (res.success && res.data) {
        setData(res.data);
        const nextFrom = dateFrom || res.data.dateFrom || "";
        const nextTo = dateTo || res.data.dateTo || "";
        const hadDateChange = (!dateFrom && res.data.dateFrom) || (!dateTo && res.data.dateTo);

        if (hadDateChange) {
          lastFetchedDatesRef.current = {
            dateFrom: res.data.dateFrom || "",
            dateTo: res.data.dateTo || "",
            skipNext: true,
          };
          if (!dateFrom && res.data.dateFrom) setDateFrom(res.data.dateFrom);
          if (!dateTo && res.data.dateTo) setDateTo(res.data.dateTo);
        } else {
          lastFetchedDatesRef.current = {
            dateFrom: nextFrom,
            dateTo: nextTo,
            skipNext: false,
          };
        }
      } else {
        setError(res.message || "Failed to load historical rankings.");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while loading historical rankings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecheck = () => {
    if (isViewer) return;
    setIsRechecking(true);
    setTimeout(() => {
      setIsRechecking(false);
      loadHistoricalData();
    }, 800);
  };

  const handleApplyPositionRange = (e: React.FormEvent) => {
    e.preventDefault();
    const min = minPosInput.trim() ? parseInt(minPosInput.trim(), 10) : undefined;
    const max = maxPosInput.trim() ? parseInt(maxPosInput.trim(), 10) : undefined;
    setAppliedMinPos(Number.isNaN(min) ? undefined : min);
    setAppliedMaxPos(Number.isNaN(max) ? undefined : max);
    setPositionFilter("all");
    setPage(1);
  };

  const clearAllFilters = () => {
    setPositionFilter("all");
    setMinPosInput("");
    setMaxPosInput("");
    setAppliedMinPos(undefined);
    setAppliedMaxPos(undefined);
    setChangesOnly(undefined);
    setSearch("");
    setDebouncedSearch("");
    setDevice("all");
    setPage(1);
  };

  // Row selection helpers
  const toggleSelectAll = () => {
    if (!data?.keywords?.items) return;
    if (selectedKeywordIds.size === data.keywords.items.length) {
      setSelectedKeywordIds(new Set());
    } else {
      setSelectedKeywordIds(new Set(data.keywords.items.map((k) => k.keywordId)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedKeywordIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedKeywordIds(next);
  };

  const toggleExpandRow = (id: string) => {
    const next = new Set(expandedKeywordIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedKeywordIds(next);
  };

  // Number formatting
  const formatNumber = (num?: number | null) => {
    if (num === null || num === undefined) return "—";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Tier accent color for keyword rows
  const getTierAccentColor = (pos?: number | null) => {
    if (!pos || pos > 100) return "bg-slate-300 dark:bg-slate-700";
    if (pos === 1) return "bg-emerald-500";
    if (pos <= 3) return "bg-emerald-400";
    if (pos <= 10) return "bg-blue-500";
    if (pos <= 30) return "bg-indigo-500";
    return "bg-amber-400";
  };

  // SERP feature chip rendering
  const renderSerpFeatureChip = (feature: string) => {
    const f = feature.toLowerCase();
    let label = feature;
    let icon = "⚡";
    let bg = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

    if (f.includes("snippet")) {
      icon = "📄";
      label = "Snippet";
      bg = "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";
    } else if (f.includes("local")) {
      icon = "📍";
      label = "Local Pack";
      bg = "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
    } else if (f.includes("star") || f.includes("review")) {
      icon = "⭐";
      label = "Stars";
      bg = "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300";
    } else if (f.includes("video")) {
      icon = "🎥";
      label = "Video";
      bg = "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300";
    } else if (f.includes("site") || f.includes("link")) {
      icon = "🔗";
      label = "Sitelinks";
      bg = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
    } else if (f.includes("news")) {
      icon = "📰";
      label = "News";
      bg = "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300";
    }

    return (
      <span
        key={feature}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${bg}`}
        title={label}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </span>
    );
  };

  // Content Score Badge
  const renderContentScoreBadge = (score?: number | null) => {
    if (score === null || score === undefined) {
      return <span className="text-slate-400 font-mono text-xs">—</span>;
    }

    let colorClass = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200";
    if (score >= 60) {
      colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
    } else if (score >= 30) {
      colorClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${colorClass}`}>
        {score}
      </span>
    );
  };

  // Current Rankings Pill with Change Arrow (SE Ranking style)
  const renderRankingPillWithDelta = (cur?: number | null, base?: number | null, change?: number | null) => {
    if (cur === null || cur === undefined || cur > 100) {
      return <span className="text-slate-400 font-mono text-xs">—</span>;
    }

    let badgeBg = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    if (cur === 1) badgeBg = "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold";
    else if (cur <= 3) badgeBg = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold";
    else if (cur <= 10) badgeBg = "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-medium";

    return (
      <div className="inline-flex items-center gap-1.5 font-mono">
        <span className={`px-2 py-0.5 rounded text-xs ${badgeBg}`}>
          {cur}
        </span>
        {change !== null && change !== undefined && change !== 0 && (
          <span
            className={`text-[11px] font-bold flex items-center ${
              change > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {change > 0 ? `▲${change}` : `▼${Math.abs(change)}`}
          </span>
        )}
        {base !== null && base !== undefined && base !== cur && (
          <span className="text-[10px] text-slate-400 font-normal">
            (was #{base})
          </span>
        )}
      </div>
    );
  };

  // Extract trajectory points for selected metric
  const trajectorySeries = useMemo(() => {
    if (!data?.trajectory || data.trajectory.length === 0) return [];
    return data.trajectory.map((point) => {
      let val = 0;
      if (activeMetricTab === "average_position") val = point.averagePosition ?? 0;
      else if (activeMetricTab === "traffic_forecast") val = point.trafficForecast ?? 0;
      else if (activeMetricTab === "search_visibility") val = point.searchVisibility ?? 0;
      else if (activeMetricTab === "top_10") val = point.percentInTop10 ?? 0;

      return {
        date: point.date,
        label: point.formattedDate || point.date,
        value: val,
      };
    });
  }, [data, activeMetricTab]);

  const hasActiveFilters =
    positionFilter !== "all" ||
    appliedMinPos !== undefined ||
    appliedMaxPos !== undefined ||
    changesOnly !== undefined ||
    debouncedSearch !== "" ||
    device !== "all";

  return (
    <div className="space-y-6 pb-20">
      {/* Centralized Rankings Header */}
      <RankingsHeader
        project={project}
        activeSubTab="Historical Data"
        title="Historical Rankings"
        description="Compare ranking movements, visibility trajectories, and keyword performance between any two historical check dates."
        badge="Comparison Mode"
        badgeColor="rose"
        dateRange={dateFrom && dateTo ? `${dateFrom} - ${dateTo}` : undefined}
        isRechecking={isRechecking}
        onRecheck={handleRecheck}
        onAddKeywords={() => setIsAddModalOpen(true)}
        keywordsCount={data?.keywords?.totalCount}
        onSaveRankingSettings={setRankingSettings}
      />

      {/* Comparison Date Range Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 uppercase text-[10px] tracking-wider">Baseline Date:</span>
            <select
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs"
            >
              {data?.availableDates && data.availableDates.length > 0 ? (
                data.availableDates.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))
              ) : (
                <option value={dateFrom}>{dateFrom || "Default baseline"}</option>
              )}
            </select>
          </div>

          <span className="text-slate-400 font-bold">vs</span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 uppercase text-[10px] tracking-wider">Current Rankings Date:</span>
            <select
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs"
            >
              {data?.availableDates && data.availableDates.length > 0 ? (
                data.availableDates.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))
              ) : (
                <option value={dateTo}>{dateTo || "Default current"}</option>
              )}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Comparing <strong className="text-slate-800 dark:text-slate-200">{dateFrom}</strong> with{" "}
          <strong className="text-slate-800 dark:text-slate-200">{dateTo}</strong>
        </div>
      </div>

      {/* 1. Position Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Segmented Position Bucket Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
            {[
              { id: "all", label: "ALL", metric: data?.header?.all },
              { id: "top1", label: "TOP 1", metric: data?.header?.top1 },
              { id: "top3", label: "TOP 3", metric: data?.header?.top3 },
              { id: "top5", label: "TOP 5", metric: data?.header?.top5 },
              { id: "top10", label: "TOP 10", metric: data?.header?.top10 },
              { id: "top30", label: "TOP 30", metric: data?.header?.top30 },
              { id: "over100", label: "> 100", metric: data?.header?.over100 },
            ].map((b) => {
              const isSelected = positionFilter === b.id && appliedMinPos === undefined && appliedMaxPos === undefined;
              const delta = b.metric?.delta ?? 0;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setPositionFilter(b.id);
                    setAppliedMinPos(undefined);
                    setAppliedMaxPos(undefined);
                    setMinPosInput("");
                    setMaxPosInput("");
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md text-center transition flex flex-col items-center min-w-[62px] ${
                    isSelected
                      ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 font-bold shadow-xs ring-1 ring-slate-300 dark:ring-slate-600"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider">{b.label}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs font-semibold">{b.metric?.count ?? 0}</span>
                    {delta !== 0 && (
                      <span
                        className={`text-[9px] font-bold ${
                          delta > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 font-normal">
                    {b.metric ? `${b.metric.percentage}%` : "0%"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Position Range & Changes Filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Range Input Box */}
            <form onSubmit={handleApplyPositionRange} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-medium">Position range:</span>
              <input
                type="number"
                min="1"
                max="100"
                placeholder="min"
                value={minPosInput}
                onChange={(e) => setMinPosInput(e.target.value)}
                className="w-14 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-xs font-mono text-center text-slate-900 dark:text-slate-100"
              />
              <span>—</span>
              <input
                type="number"
                min="1"
                max="100"
                placeholder="max"
                value={maxPosInput}
                onChange={(e) => setMaxPosInput(e.target.value)}
                className="w-14 px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-xs font-mono text-center text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium text-xs transition"
              >
                Apply
              </button>
            </form>

            {/* Changes Filter */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="text-xs text-slate-500 font-medium">Changes:</span>
              <button
                onClick={() => {
                  setChangesOnly(changesOnly === "up" ? undefined : "up");
                  setPage(1);
                }}
                className={`px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                  changesOnly === "up"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100"
                }`}
              >
                <span>▲</span>
                <span>{data?.header?.jumpedCount ?? 0}</span>
                <span className="text-[10px] opacity-80 font-normal">({data?.header?.jumpedPercentage ?? 0}%)</span>
              </button>

              <button
                onClick={() => {
                  setChangesOnly(changesOnly === "down" ? undefined : "down");
                  setPage(1);
                }}
                className={`px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                  changesOnly === "down"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100"
                }`}
              >
                <span>▼</span>
                <span>{data?.header?.droppedCount ?? 0}</span>
                <span className="text-[10px] opacity-80 font-normal">({data?.header?.droppedPercentage ?? 0}%)</span>
              </button>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline pl-2"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Search Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <input
                type="text"
                placeholder="Search keywords, target URLs, ranked URLs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
              <svg
                className="w-4 h-4 absolute left-2.5 top-2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={device}
              onChange={(e) => {
                setDevice(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="all">All Devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900 dark:text-slate-100">{data?.keywords?.items.length || 0}</strong> of{" "}
              <strong className="text-slate-900 dark:text-slate-100">{data?.keywords?.totalCount || 0}</strong> keywords
            </span>
            {selectedKeywordIds.size > 0 && (
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 font-medium text-[11px]">
                {selectedKeywordIds.size} selected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Metrics Selector Cards & Red Line Trajectory Chart */}
      {rankingSettings.showCharts !== false && (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        {/* 4 Selector Cards with Red Accent */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: "average_position" as MetricCardTab,
              label: "AVERAGE POSITION",
              metric: data?.metrics?.averagePosition,
              formatValue: (v?: number) => (v ? v.toFixed(1) : "—"),
              showDeltaSign: true,
              isPosInverted: true,
            },
            {
              id: "traffic_forecast" as MetricCardTab,
              label: "TRAFFIC FORECAST",
              metric: data?.metrics?.trafficForecast,
              formatValue: (v?: number) => formatNumber(v),
              showDeltaSign: false,
              isPosInverted: false,
            },
            {
              id: "search_visibility" as MetricCardTab,
              label: "SEARCH VISIBILITY",
              metric: data?.metrics?.searchVisibility,
              formatValue: (v?: number) => (v != null ? `${v}%` : "0%"),
              showDeltaSign: false,
              isPosInverted: false,
            },
            {
              id: "top_10" as MetricCardTab,
              label: "% IN TOP 10",
              metric: data?.metrics?.percentInTop10,
              formatValue: (v?: number) => (v != null ? `${v}%` : "0%"),
              showDeltaSign: false,
              isPosInverted: false,
            },
          ].map((card) => {
            const isSelected = activeMetricTab === card.id;
            const change = card.metric?.change ?? 0;
            return (
              <button
                key={card.id}
                onClick={() => setActiveMetricTab(card.id)}
                className={`p-4 rounded-xl text-left transition relative border ${
                  isSelected
                    ? "border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                }`}
              >
                {/* Red Underline Accent when active */}
                {isSelected && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 rounded-b-xl" />
                )}

                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.label}
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {card.formatValue(card.metric?.currentValue)}
                  </span>

                  {change !== 0 && (
                    <span
                      className={`text-xs font-bold flex items-center gap-0.5 ${
                        card.isPosInverted
                          ? change > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                          : change > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      <span>{change > 0 ? "▲" : "▼"}</span>
                      <span>{Math.abs(change)}</span>
                    </span>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 mt-1">
                  Baseline: {card.formatValue(card.metric?.baselineValue)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Collapsible Chevron & Chart Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>Red Line Trajectory Comparison</span>
            <span className="text-[10px] font-normal text-slate-400">
              ({dateFrom} &rarr; {dateTo})
            </span>
          </div>

          <button
            onClick={() => setIsChartExpanded(!isChartExpanded)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isChartExpanded ? "Collapse comparison chart" : "Expand comparison chart"}
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${isChartExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Red Line Trajectory SVG Chart */}
        {isChartExpanded && (
          <div className="w-full h-44 border border-slate-100 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/50 relative">
            {trajectorySeries.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                No trajectory points available between {dateFrom} and {dateTo}
              </div>
            ) : (
              <svg className="w-full h-full pt-4 pb-2" viewBox="0 0 600 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="redTrajectoryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Guide Lines */}
                <line x1="0" y1="20" x2="600" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                <line x1="0" y1="60" x2="600" y2="60" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />

                {(() => {
                  const values = trajectorySeries.map((p) => p.value ?? 0);
                  const min = values.length > 0 ? Math.min(...values, 0) : 0;
                  const max = values.length > 0 ? Math.max(...values, 10) : 10;
                  const range = max - min || 1;

                  const pointsString = trajectorySeries
                    .map((p, idx) => {
                      const val = p.value ?? 0;
                      const x = (idx / Math.max(1, trajectorySeries.length - 1)) * 600;
                      // Invert Y-axis if average position (so rank 1 is at top!)
                      const y =
                        activeMetricTab === "average_position"
                          ? 20 + ((val - min) / range) * 85
                          : 110 - ((val - min) / range) * 85;
                      return `${x},${y}`;
                    })
                    .join(" ");

                  const areaPoints = `0,120 ${pointsString} 600,120`;

                  return (
                    <>
                      <polygon points={areaPoints} fill="url(#redTrajectoryGradient)" />
                      <polyline
                        points={pointsString}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {trajectorySeries.map((p, idx) => {
                        const val = p.value ?? 0;
                        const x = (idx / Math.max(1, trajectorySeries.length - 1)) * 600;
                        const y =
                          activeMetricTab === "average_position"
                            ? 20 + ((val - min) / range) * 85
                            : 110 - ((val - min) / range) * 85;
                        return (
                          <circle
                            key={idx}
                            cx={x}
                            cy={y}
                            r="4"
                            className="fill-red-600 hover:r-5 transition-all cursor-pointer"
                          >
                            <title>{`${p.label}: ${val}`}</title>
                          </circle>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            )}
          </div>
        )}
      </div>
      )}

      {/* 3. Historical Keyword Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto min-h-[350px]">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-28">
              <div className="w-9 h-9 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading historical comparison rankings...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-600 text-xs font-semibold">{error}</div>
          ) : !data?.keywords?.items || data.keywords.items.length === 0 ? (
            <div className="py-24 text-center text-slate-400">
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No historical ranking data matched</p>
              <p className="text-xs text-slate-500 mt-1">Try selecting different comparison dates or adjust position filters.</p>
              <button
                onClick={clearAllFilters}
                className="mt-3 px-3 py-1.5 rounded-md bg-rose-600 text-white text-xs font-semibold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <table className="min-w-full text-xs text-left divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider select-none">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        data.keywords.items.length > 0 &&
                        selectedKeywordIds.size === data.keywords.items.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-3 w-8"></th>
                  <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200">
                    KEYWORDS (1 - {data.keywords.items.length} OUT OF {data.keywords.totalCount})
                  </th>
                  {visibleColumns.has("URL") && (
                    <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200">URL</th>
                  )}
                  {visibleColumns.has("Search vol.") && (
                    <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200 text-right">SEARCH VOL.</th>
                  )}
                  {visibleColumns.has("SERP features") && (
                    <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200">SERP FEATURES</th>
                  )}
                  {visibleColumns.has("Content Score") && (
                    <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200 text-center">CONTENT SCORE</th>
                  )}
                  {visibleColumns.has("Tags") && (
                    <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200">TAGS</th>
                  )}
                  {visibleColumns.has("Group") && (
                    <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200">GROUP</th>
                  )}
                  {visibleColumns.has("Date added") && (
                    <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200">DATE ADDED</th>
                  )}
                  {visibleColumns.has("Competition") && (
                    <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200 text-center">COMPETITION</th>
                  )}
                  {visibleColumns.has("CPC") && (
                    <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200 text-right">CPC</th>
                  )}
                  {visibleColumns.has("Results") && (
                    <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200 text-center">RESULTS</th>
                  )}
                  {visibleColumns.has("Traffic Forecast") && (
                    <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200 text-center">TRAFFIC FORECAST</th>
                  )}
                  {visibleColumns.has("Dynamics") && (
                    <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200 text-center">DYNAMICS</th>
                  )}
                  {visibleColumns.has("Visibility") && (
                    <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200 text-center">VISIBILITY</th>
                  )}
                  {visibleColumns.has("Notes") && (
                    <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200 text-center">NOTES</th>
                  )}
                  {visibleColumns.has("Clicks") && (
                    <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200 text-center">CLICKS</th>
                  )}
                  <th className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 text-center font-mono">
                    CURRENT RANKINGS [{dateTo}]
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.keywords.items.map((item) => {
                  const isSelected = selectedKeywordIds.has(item.keywordId);
                  const isExpanded = expandedKeywordIds.has(item.keywordId);
                  const accentColor = getTierAccentColor(item.currentPosition);

                  return (
                    <React.Fragment key={item.keywordId}>
                      <tr
                        className={`transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                          isSelected ? "bg-rose-50/30 dark:bg-rose-950/20" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(item.keywordId)}
                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                          />
                        </td>

                        {/* Expand Chevron */}
                        <td className="px-1 py-3 text-center">
                          <button
                            onClick={() => toggleExpandRow(item.keywordId)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                            title="Toggle keyword details"
                          >
                            <svg
                              className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? "rotate-90 text-rose-600" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>

                        {/* Keyword Column with Tier Accent Stripe */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-1 h-5 rounded-full ${accentColor}`} />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">
                                {item.keywordText}
                              </div>
                              {item.groupName && (
                                <span className="text-[10px] text-slate-400 font-normal">
                                  {item.groupName}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* URL Column */}
                        {visibleColumns.has("URL") && (
                          <td className="px-3 py-3 max-w-[200px]">
                            {item.rankedUrl ? (
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={item.rankedUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 dark:text-blue-400 truncate hover:underline font-medium"
                                  title={item.rankedUrl}
                                >
                                  {item.rankedUrl.replace(/^https?:\/\/(www\.)?/, "")}
                                </a>
                                <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No URL ranked</span>
                            )}
                          </td>
                        )}

                        {/* Search Volume */}
                        {visibleColumns.has("Search vol.") && (
                          <td className="px-3 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                            {formatNumber(item.monthlySearchVolume)}
                          </td>
                        )}

                        {/* SERP Features Chips */}
                        {visibleColumns.has("SERP features") && (
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap items-center gap-1 max-w-[180px]">
                              {item.serpFeatures && item.serpFeatures.length > 0 ? (
                                item.serpFeatures.map((f) => renderSerpFeatureChip(f))
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </div>
                          </td>
                        )}

                        {/* Content Score Badge */}
                        {visibleColumns.has("Content Score") && (
                          <td className="px-3 py-3 text-center">
                            {renderContentScoreBadge(item.contentScore)}
                          </td>
                        )}

                        {/* Tags */}
                        {visibleColumns.has("Tags") && (
                          <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                            {item.groupName ? (
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
                                {item.groupName}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        )}

                        {/* Group */}
                        {visibleColumns.has("Group") && (
                          <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                            {item.groupName || <span className="text-slate-400">—</span>}
                          </td>
                        )}

                        {/* Date added */}
                        {visibleColumns.has("Date added") && (
                          <td className="px-3 py-3 text-center text-slate-400">
                            —
                          </td>
                        )}

                        {/* Competition */}
                        {visibleColumns.has("Competition") && (
                          <td className="px-3 py-3 text-center text-slate-600 dark:text-slate-400">
                            —
                          </td>
                        )}

                        {/* CPC */}
                        {visibleColumns.has("CPC") && (
                          <td className="px-3 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                            —
                          </td>
                        )}

                        {/* Results */}
                        {visibleColumns.has("Results") && (
                          <td className="px-3 py-3 text-center text-slate-600 dark:text-slate-400">
                            —
                          </td>
                        )}

                        {/* Traffic Forecast */}
                        {visibleColumns.has("Traffic Forecast") && (
                          <td className="px-3 py-3 text-center text-slate-600 dark:text-slate-400">
                            —
                          </td>
                        )}

                        {/* Dynamics */}
                        {visibleColumns.has("Dynamics") && (
                          <td className="px-3 py-3 text-center">
                            {item.positionChange !== undefined && item.positionChange !== null ? (
                              <span className={`font-mono font-bold text-[11px] ${
                                item.positionChange > 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : item.positionChange < 0
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-slate-400"
                              }`}>
                                {item.positionChange > 0 ? `+${item.positionChange}` : item.positionChange}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        )}

                        {/* Visibility */}
                        {visibleColumns.has("Visibility") && (
                          <td className="px-3 py-3 text-center text-slate-600 dark:text-slate-400">
                            —
                          </td>
                        )}

                        {/* Notes */}
                        {visibleColumns.has("Notes") && (
                          <td className="px-3 py-3 text-center text-slate-400">
                            —
                          </td>
                        )}

                        {/* Clicks */}
                        {visibleColumns.has("Clicks") && (
                          <td className="px-3 py-3 text-center text-slate-600 dark:text-slate-400">
                            —
                          </td>
                        )}

                        {/* Current Rankings with Delta Pillar */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {renderRankingPillWithDelta(
                            item.currentPosition,
                            item.baselinePosition,
                            item.positionChange
                          )}
                        </td>
                      </tr>

                      {/* Expandable Comparison Detail Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 dark:bg-slate-800/30">
                          <td colSpan={3 + visibleColumns.size + 1} className="px-6 py-4 border-y border-slate-100 dark:border-slate-800">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                              <div>
                                <span className="text-slate-400 uppercase font-semibold text-[10px]">Target vs Ranked URL</span>
                                <p className="font-mono text-slate-800 dark:text-slate-200 mt-1 truncate">
                                  {item.targetUrl || "No target specified"}
                                </p>
                                <span className={`inline-block mt-1 text-[10px] font-bold ${item.isTargetUrlMatched ? "text-emerald-600" : "text-amber-600"}`}>
                                  {item.isTargetUrlMatched ? "✓ Target URL matched" : "⚠️ Target diverged"}
                                </span>
                              </div>

                              <div>
                                <span className="text-slate-400 uppercase font-semibold text-[10px]">Comparison Window</span>
                                <p className="text-slate-800 dark:text-slate-200 mt-1">
                                  From <strong>{dateFrom}</strong> to <strong>{dateTo}</strong>
                                </p>
                              </div>

                              <div>
                                <span className="text-slate-400 uppercase font-semibold text-[10px]">Rank Movement</span>
                                <p className="text-slate-800 dark:text-slate-200 mt-1 font-mono">
                                  Baseline: #{item.baselinePosition ?? ">100"} &rarr; Current: #{item.currentPosition ?? ">100"}{" "}
                                  ({item.positionChange !== null && item.positionChange !== undefined && item.positionChange > 0 ? `+${item.positionChange}` : item.positionChange})
                                </p>
                              </div>

                              <div>
                                <span className="text-slate-400 uppercase font-semibold text-[10px]">Engine & Device</span>
                                <p className="text-slate-800 dark:text-slate-200 mt-1 capitalize">
                                  {item.searchEngine} · {item.device} · {item.countryCode}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* 4. Bottom Status Bar & Legend */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Legend Dots */}
          <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400 font-medium text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>• Entered Top 10</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>• Left Top 10</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>• In Top 10</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>• Entered Top 100</span>
            </div>
          </div>

          {/* Pagination and View-On-Page Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">View on page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {data?.keywords && data.keywords.totalPages > 1 && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">
                  {data.keywords.pageNumber} of {data.keywords.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!data.keywords.hasPreviousPage}
                  className="px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.keywords.totalPages, p + 1))}
                  disabled={!data.keywords.hasNextPage}
                  className="px-2 py-1 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Keyword Modal */}
      {isAddModalOpen && (
        <AddKeywordModal
          isOpen={isAddModalOpen}
          projectId={project.id}
          groups={[]}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            loadHistoricalData();
          }}
        />
      )}
    </div>
  );
}
