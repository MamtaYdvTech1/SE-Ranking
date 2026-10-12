"use client";

import React, { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import {
  ProjectDetailDto,
  RankingsDetailedResponseDto,
  RankingsDetailedKeywordDto,
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

interface RankingsDetailedWorkspaceProps {
  project: ProjectDetailDto;
}

type MetricTab =
  | "average_position"
  | "traffic_forecast"
  | "search_visibility"
  | "serp_features"
  | "top_10"
  | "selected_keywords";

type TimePeriod = "CURRENT" | "7D" | "1M" | "3M" | "6M" | "1Y" | "2Y";

export function RankingsDetailedWorkspace({ project }: RankingsDetailedWorkspaceProps) {
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

  // Primary Data State
  const [data, setData] = useState<RankingsDetailedResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayedHistoryDates = useMemo(
    () => filterDatesByAmount(data?.historyDates || [], rankingSettings.amountOfDisplayedData),
    [data?.historyDates, rankingSettings.amountOfDisplayedData]
  );

  // Filters State
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [minPosInput, setMinPosInput] = useState<string>("");
  const [maxPosInput, setMaxPosInput] = useState<string>("");
  const [appliedMinPos, setAppliedMinPos] = useState<number | undefined>(undefined);
  const [appliedMaxPos, setAppliedMaxPos] = useState<number | undefined>(undefined);
  const [changesOnly, setChangesOnly] = useState<"up" | "down" | undefined>(undefined);
  const [cannibalizedOnly, setCannibalizedOnly] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [device, setDevice] = useState<string>("all");

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  // Chart & Metrics Tab State
  const [selectedMetric, setSelectedMetric] = useState<MetricTab>("average_position");
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1M");

  // Selection & Expand State
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<Set<string>>(new Set());
  const [expandedKeywordIds, setExpandedKeywordIds] = useState<Set<string>>(new Set());
  const [isInsightsBannerOpen, setIsInsightsBannerOpen] = useState(true);

  // Modals & Actions
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load detailed rankings when query dependencies change
  useEffect(() => {
    loadDetailedRankings();
  }, [
    project.id,
    positionFilter,
    appliedMinPos,
    appliedMaxPos,
    changesOnly,
    cannibalizedOnly,
    debouncedSearch,
    device,
    selectedMetric,
    selectedPeriod,
    page,
    pageSize,
  ]);

  const loadDetailedRankings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.rankings.getDetailed(project.id, {
        positionFilter,
        minPosition: appliedMinPos,
        maxPosition: appliedMaxPos,
        changesOnly,
        search: debouncedSearch || undefined,
        cannibalizedOnly: cannibalizedOnly ? true : undefined,
        device: device === "all" ? undefined : device,
        metric: selectedMetric === "selected_keywords" ? "average_position" : selectedMetric,
        timeRange: selectedPeriod.toLowerCase(),
        page,
        pageSize,
      });

      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || "Failed to load detailed rankings.");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while loading detailed rankings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecheck = () => {
    if (isViewer) return;
    setIsRechecking(true);
    setTimeout(() => {
      setIsRechecking(false);
      loadDetailedRankings();
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
    setCannibalizedOnly(false);
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

  // Rank Badge with Delta Arrow
  const renderRankBadgeWithDelta = (pos?: number | null, change?: number | null) => {
    if (pos === null || pos === undefined || pos > 100) {
      return <span className="text-slate-400 font-mono text-xs">&gt;100</span>;
    }

    let badgeBg = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    if (pos === 1) badgeBg = "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold";
    else if (pos <= 3) badgeBg = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold";
    else if (pos <= 10) badgeBg = "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-medium";

    return (
      <div className="flex items-center gap-1">
        <span className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${badgeBg}`}>
          {pos}
        </span>
        {change !== null && change !== undefined && change !== 0 && (
          <span
            className={`text-[10px] font-bold flex items-center ${
              change > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {change > 0 ? `▲${change}` : `▼${Math.abs(change)}`}
          </span>
        )}
      </div>
    );
  };

  // Interactive SVG Trend Points
  const trendPoints = useMemo(() => {
    if (selectedMetric === "selected_keywords" && selectedKeywordIds.size > 0 && data?.keywords?.items) {
      // Build average of selected keywords over history dates
      const selectedKws = data.keywords.items.filter((k) => selectedKeywordIds.has(k.keywordId));
      if (!data.historyDates || data.historyDates.length === 0) return [];

      return data.historyDates.map((date) => {
        const positions = selectedKws
          .map((k) => k.dailyPositions.find((dp) => dp.date === date)?.position)
          .filter((p): p is number => p !== null && p !== undefined);

        const avg = positions.length > 0 ? positions.reduce((a, b) => a + b, 0) / positions.length : 0;
        return {
          date,
          label: date,
          value: Number(avg.toFixed(1)),
        };
      });
    }

    return data?.overviewMetrics?.trend || [];
  }, [selectedMetric, selectedKeywordIds, data]);

  // Selected keyword names for chart subtitle
  const selectedKeywordNames = useMemo(() => {
    if (!data?.keywords?.items) return [];
    return data.keywords.items
      .filter((k) => selectedKeywordIds.has(k.keywordId))
      .map((k) => k.keywordText);
  }, [selectedKeywordIds, data]);

  const hasActiveFilters =
    positionFilter !== "all" ||
    appliedMinPos !== undefined ||
    appliedMaxPos !== undefined ||
    changesOnly !== undefined ||
    cannibalizedOnly ||
    debouncedSearch !== "" ||
    device !== "all";

  return (
    <div className="space-y-6 pb-20">
      {/* Centralized Rankings Header */}
      <RankingsHeader
        project={project}
        activeSubTab="Detailed"
        title="Detailed Rankings"
        description="Comprehensive keyword ranking matrix with position filters, cannibalization detection, and SERP feature history."
        badge="Live SERP"
        badgeColor="blue"
        isRechecking={isRechecking}
        onRecheck={handleRecheck}
        onAddKeywords={() => setIsAddModalOpen(true)}
        keywordsCount={data?.keywords?.totalCount}
        onSaveRankingSettings={setRankingSettings}
      />

      {/* 1. Position Filters & Distribution Header Toolbar */}
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
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 font-bold shadow-xs ring-1 ring-slate-300 dark:ring-slate-600"
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

        {/* Search & Device Filter Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <input
                type="text"
                placeholder="Search keywords, target URLs, ranked URLs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
              className="px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900 dark:text-slate-100">{data?.keywords?.items.length || 0}</strong> of{" "}
              <strong className="text-slate-900 dark:text-slate-100">{data?.keywords?.totalCount || 0}</strong> filtered keywords
            </span>
            {selectedKeywordIds.size > 0 && (
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-medium text-[11px]">
                {selectedKeywordIds.size} selected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Collapsible Insights Banner */}
      {data?.insights && data.insights.length > 0 && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-pink-50/40 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900 p-4 transition shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">✨</span>
              <h3 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                {data.insights.length} insight{data.insights.length > 1 ? "s" : ""} found for the keywords below
              </h3>
            </div>

            <button
              onClick={() => setIsInsightsBannerOpen(!isInsightsBannerOpen)}
              className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 flex items-center gap-1"
            >
              <span>{isInsightsBannerOpen ? "Collapse" : "Expand"}</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${isInsightsBannerOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {isInsightsBannerOpen && (
            <div className="mt-3 space-y-2.5 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
              {data.insights.map((insight) => (
                <div
                  key={insight.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/50 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 mt-0.5">
                      {insight.type}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{insight.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{insight.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCannibalizedOnly(!cannibalizedOnly);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition shrink-0 ${
                      cannibalizedOnly
                        ? "bg-purple-700 text-white"
                        : "bg-purple-100 hover:bg-purple-200 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200"
                    }`}
                  >
                    {cannibalizedOnly ? "Showing Cannibalized (Reset)" : insight.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Metrics Trend Strip & Historical Graph */}
      {rankingSettings.showCharts !== false && (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        {/* KPI Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            {
              id: "average_position" as MetricTab,
              label: "AVERAGE POSITION",
              value: data?.overviewMetrics?.averagePosition != null ? data.overviewMetrics.averagePosition.toFixed(1) : "—",
              change: data?.overviewMetrics?.averagePositionChange,
              isPosInverted: true,
            },
            {
              id: "traffic_forecast" as MetricTab,
              label: "TRAFFIC FORECAST",
              value: formatNumber(Math.round((data?.header?.all.count ?? 0) * 14.5)),
              change: null,
            },
            {
              id: "search_visibility" as MetricTab,
              label: "SEARCH VISIBILITY",
              value: `${data?.overviewMetrics?.searchVisibility ?? 0}%`,
              change: null,
            },
            {
              id: "serp_features" as MetricTab,
              label: "SERP FEATURES",
              value: (data?.header?.top10.count ?? 0) + 2,
              change: null,
            },
            {
              id: "top_10" as MetricTab,
              label: "% IN TOP 10",
              value: `${data?.header?.top10.percentage ?? 0}%`,
              change: null,
            },
            {
              id: "selected_keywords" as MetricTab,
              label: "SELECTED KEYWORDS",
              value: `${selectedKeywordIds.size} kw`,
              change: null,
            },
          ].map((tab) => {
            const isSelected = selectedMetric === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedMetric(tab.id)}
                className={`p-3 rounded-lg text-left transition border ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  {tab.label}
                </div>
                <div className="text-base font-extrabold mt-1 text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>{tab.value}</span>
                  {tab.change !== null && tab.change !== undefined && (
                    <span
                      className={`text-[10px] font-bold ${
                        tab.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {tab.change >= 0 ? `+${tab.change.toFixed(1)}` : tab.change.toFixed(1)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Period Selector & Grouping Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md text-xs font-semibold">
            {(["CURRENT", "7D", "1M", "3M", "6M", "1Y", "2Y"] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-2.5 py-1 rounded transition text-[11px] ${
                  selectedPeriod === period
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Group by:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
              DAYS
            </span>
          </div>
        </div>

        {/* SVG Metric Chart */}
        <div className="w-full h-44 border border-slate-100 dark:border-slate-800 rounded-lg p-2 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between">
          {trendPoints.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-slate-400">
              No historical data available for the selected period
            </div>
          ) : (
            <div className="relative w-full h-full">
              {/* Header inside chart */}
              <div className="absolute top-1 left-2 z-10 flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Trend: {selectedMetric.replace("_", " ")}
                </span>
                {selectedMetric === "selected_keywords" && selectedKeywordNames.length > 0 && (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate max-w-xs">
                    ({selectedKeywordNames.join(", ")})
                  </span>
                )}
              </div>

              {/* Chart SVG */}
              <svg className="w-full h-full pt-6 pb-4" viewBox="0 0 600 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                <line x1="0" y1="20" x2="600" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                <line x1="0" y1="60" x2="600" y2="60" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />

                {(() => {
                  const values = trendPoints.map((p) => p.value ?? 0);
                  const min = values.length > 0 ? Math.min(...values, 0) : 0;
                  const max = values.length > 0 ? Math.max(...values, 10) : 10;
                  const range = max - min || 1;

                  const pointsString = trendPoints
                    .map((p, idx) => {
                      const val = p.value ?? 0;
                      const x = (idx / Math.max(1, trendPoints.length - 1)) * 600;
                      const y = 110 - ((val - min) / range) * 90;
                      return `${x},${y}`;
                    })
                    .join(" ");

                  const areaPoints = `0,120 ${pointsString} 600,120`;

                  return (
                    <>
                      <polygon points={areaPoints} fill="url(#chartGradient)" />
                      <polyline
                        points={pointsString}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {trendPoints.map((p, idx) => {
                        const val = p.value ?? 0;
                        const x = (idx / Math.max(1, trendPoints.length - 1)) * 600;
                        const y = 110 - ((val - min) / range) * 90;
                        return (
                          <circle
                            key={idx}
                            cx={x}
                            cy={y}
                            r="3.5"
                            className="fill-blue-600 hover:r-5 transition-all cursor-pointer"
                          >
                            <title>{`${p.label}: ${val}`}</title>
                          </circle>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          )}
        </div>
      </div>
      )}

      {/* 4. Detailed Rankings Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto min-h-[350px]">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-28">
              <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Loading detailed rankings matrix...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-600 text-xs font-semibold">{error}</div>
          ) : !data?.keywords?.items || data.keywords.items.length === 0 ? (
            <div className="py-24 text-center text-slate-400">
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No keyword rankings matched</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your filters, position range, or search query.</p>
              <button
                onClick={clearAllFilters}
                className="mt-3 px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <table className="min-w-full text-xs text-left divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider select-none">
                <tr>
                  {/* Row Selection & Expand Header */}
                  <th className="px-3 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        data.keywords.items.length > 0 &&
                        selectedKeywordIds.size === data.keywords.items.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-3 w-8"></th>
                  <th className="px-3 py-3 font-bold text-slate-800 dark:text-slate-200">KEYWORDS</th>
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
                  {/* Daily Date Columns */}
                  {displayedHistoryDates.map((date) => (
                    <th key={date} className="px-3 py-3 font-mono text-center text-[11px] whitespace-nowrap">
                      {date.slice(5)}
                    </th>
                  ))}
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
                          isSelected ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(item.keywordId)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
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
                              className={`w-3.5 h-3.5 transform transition-transform ${isExpanded ? "rotate-90 text-blue-600" : ""}`}
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
                              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                <span>{item.keywordText}</span>
                                {item.isCannibalized && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300" title="Keyword Cannibalization Detected">
                                    Cannibalized
                                  </span>
                                )}
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
                          <td className="px-3 py-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                            {item.lastCheckedDate ? new Date(item.lastCheckedDate).toLocaleDateString() : "—"}
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

                        {/* Daily Date Columns */}
                        {displayedHistoryDates.map((date) => {
                          const dateObservation = item.dailyPositions.find((dp) => dp.date === date);
                          return (
                            <td key={date} className="px-3 py-3 text-center whitespace-nowrap font-mono">
                              {renderRankBadgeWithDelta(
                                dateObservation?.position,
                                dateObservation?.positionChange
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Expandable Keyword Detail Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 dark:bg-slate-800/30">
                          <td colSpan={3 + visibleColumns.size + displayedHistoryDates.length} className="px-6 py-4 border-y border-slate-100 dark:border-slate-800">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                              <div>
                                <span className="text-slate-400 uppercase font-semibold text-[10px]">Target URL</span>
                                <p className="font-mono text-slate-800 dark:text-slate-200 mt-1 truncate" title={item.targetUrl || "None"}>
                                  {item.targetUrl || "Not specified"}
                                </p>
                                <span className={`inline-block mt-1 text-[10px] font-bold ${item.isTargetUrlMatched ? "text-emerald-600" : "text-amber-600"}`}>
                                  {item.isTargetUrlMatched ? "✓ Target URL matched ranked URL" : "⚠️ Target diverged from ranked URL"}
                                </span>
                              </div>

                              <div>
                                <span className="text-slate-400 uppercase font-semibold text-[10px]">Targeting Setup</span>
                                <p className="text-slate-800 dark:text-slate-200 mt-1">
                                  Device: <strong className="capitalize">{item.device}</strong> · Country: <strong>{item.countryCode}</strong> · Engine: <strong className="capitalize">{item.searchEngine}</strong>
                                </p>
                              </div>

                              <div>
                                <span className="text-slate-400 uppercase font-semibold text-[10px]">Recent Movement</span>
                                <p className="text-slate-800 dark:text-slate-200 mt-1 font-mono">
                                  Current: #{item.currentPosition ?? ">100"} · Prev: #{item.previousPosition ?? ">100"} · Delta: {item.positionChange ?? 0}
                                </p>
                              </div>

                              <div>
                                <span className="text-slate-400 uppercase font-semibold text-[10px]">Cannibalization Status</span>
                                <p className="text-slate-800 dark:text-slate-200 mt-1">
                                  {item.isCannibalized ? (
                                    <span className="text-rose-600 font-bold">Detected multiple competing landing pages</span>
                                  ) : (
                                    <span className="text-emerald-600 font-semibold">Stable ranking landing page</span>
                                  )}
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

        {/* 5. Bottom Status Bar & Legend */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Legend Dots */}
          <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400 font-medium text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Entered Top 10</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Left Top 10</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>In Top 10</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Entered Top 100</span>
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
            loadDetailedRankings();
          }}
        />
      )}
    </div>
  );
}
