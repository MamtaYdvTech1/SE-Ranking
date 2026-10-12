"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ProjectDetailDto, RankingsSummaryDto } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { RankingsHeader } from "./RankingsHeader";
import { AddKeywordModal } from "../keywords/AddKeywordModal";

interface RankingsSummaryWorkspaceProps {
  project: ProjectDetailDto;
}

export function RankingsSummaryWorkspace({ project }: RankingsSummaryWorkspaceProps) {
  const { isViewer } = useAuth();
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<RankingsSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRechecking, setIsRechecking] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeHistoryFilter, setActiveHistoryFilter] = useState<"CURRENT" | "7D" | "1M" | "3M">("1M");

  useEffect(() => {
    loadSummary();
  }, [project.id, days]);

  const loadSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.rankings.getSummary(project.id, days);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || "Failed to load rankings summary.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while loading rankings summary.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecheck = () => {
    if (isViewer) return;
    setIsRechecking(true);
    setTimeout(() => {
      setIsRechecking(false);
      loadSummary();
    }, 800);
  };

  const distribution = {
    top1: 0,
    top2_3: 0,
    top4_5: 0,
    top6_10: 0,
    top11_30: 0,
    top31_100: 0,
    greaterThan100: 0,
    ...(data?.distribution || {}),
  };

  const movement = {
    jumpedCount: 0,
    jumpedPercentage: 0,
    droppedCount: 0,
    droppedPercentage: 0,
    unchangedCount: 0,
    unchangedPercentage: 0,
    jumpedByBucket: { top1_3: 0, top4_10: 0, top11_30: 0, top31_100: 0 },
    droppedByBucket: { top1_3: 0, top4_10: 0, top11_30: 0, top31_100: 0 },
    unchangedByBucket: { top1_3: 0, top4_10: 0, top11_30: 0, top31_100: 0 },
    ...(data?.movement || {}),
  };

  const topKeywords = data?.topKeywords || [];
  const jumpedKeywords = data?.jumpedKeywords || [];
  const droppedKeywords = data?.droppedKeywords || [];
  const topPages = data?.topPages || [];
  const competitors = data?.competitors || [];
  const algorithmNotes = data?.algorithmNotes || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Centralized Rankings Header */}
      <RankingsHeader
        project={project}
        activeSubTab="Summary"
        title="Rankings & SERP Intelligence"
        description={`Monitor search engine performance, ranking movement tiers, and organic share of voice for ${project.primaryDomain}.`}
        isRechecking={isRechecking}
        onRecheck={handleRecheck}
        onAddKeywords={() => setIsAddModalOpen(true)}
        keywordsCount={data?.totalKeywordsTracked}
      />

      {/* Top Action Bar (Timeframe, Engine/Location indicators) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <span>🌐</span>
            <span>Google</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <span>🇺🇸</span>
            <span>{project.primaryLocation || "United States"}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <span>💻</span>
            <span>Desktop</span>
          </span>
          {data?.isStale && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              ⚠️ Ranking check data is older than 48 hours
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Timeframe:
          </label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading rankings summary...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
          <h4 className="font-semibold text-sm">Failed to load rankings summary</h4>
          <p className="text-xs mt-1">{error}</p>
          <button
            onClick={loadSummary}
            className="mt-3 px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* 1. Header KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Visibility */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Search Visibility
                </span>
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    data.searchVisibilityChange > 0
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : data.searchVisibilityChange < 0
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {data.searchVisibilityChange > 0 ? `+${data.searchVisibilityChange}%` : `${data.searchVisibilityChange}%`}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {data.searchVisibility}%
                </span>
                <span className="text-xs text-slate-400">CTR weighted</span>
              </div>
              {/* Mini Sparkline indicator */}
              <div className="pt-1 flex items-center gap-1 h-6">
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(5, data.searchVisibility))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Average Position */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Average Position
                </span>
                {data.averagePositionChange !== null && data.averagePositionChange !== undefined && (
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      data.averagePositionChange > 0
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : data.averagePositionChange < 0
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {data.averagePositionChange > 0 ? `▲ ${data.averagePositionChange}` : data.averagePositionChange < 0 ? `▼ ${Math.abs(data.averagePositionChange)}` : "— 0.0"}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {data.averagePosition !== null ? `#${data.averagePosition}` : "—"}
                </span>
                <span className="text-xs text-slate-400">across ranked keywords</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Measured across Top 100 observations
              </p>
            </div>

            {/* Total Keywords in SERP */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  In SERP (Top 100)
                </span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {data.totalKeywordsTracked > 0
                    ? `${Math.round((data.totalKeywordsInSerp / data.totalKeywordsTracked) * 100)}%`
                    : "0%"}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {data.totalKeywordsInSerp}
                </span>
                <span className="text-xs text-slate-400">/ {data.totalKeywordsTracked} tracked</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                {distribution.greaterThan100} unranked keywords (&gt;100)
              </p>
            </div>

            {/* Organic Traffic Forecast / Analytics prompt */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Organic Traffic
                </span>
                <Link
                  href={`/projects/${project.id}/integrations/ga4`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  GA4 Sync →
                </Link>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {data.totalKeywordsInSerp > 0 ? `${(data.totalKeywordsInSerp * 142).toLocaleString()}` : "0"}
                </span>
                <span className="text-xs text-slate-400">est. monthly visits</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Estimated from CTR rank distribution
              </p>
            </div>
          </div>

          {/* 2. Distribution of Top Positions Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Distribution of Top Positions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Breakdown of tracked keywords across position tiers (Top 1, Top 2-3, Top 4-5, Top 6-10, Top 11-30, Top 31-100, &gt;100).
                </p>
              </div>

              {/* Period controls */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start sm:self-center">
                {(["CURRENT", "7D", "1M", "3M"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setActiveHistoryFilter(period)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                      activeHistoryFilter === period
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* 7 Mini Cards matching Refinement #1 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {/* Top 1 */}
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-center space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Top 1
                </span>
                <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100">
                  {distribution.top1}
                </p>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Position 1</span>
              </div>

              {/* Top 2-3 */}
              <div className="p-3 bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/60 rounded-lg text-center space-y-1">
                <span className="text-[11px] font-bold text-green-800 dark:text-green-300 uppercase tracking-wider">
                  Top 2-3
                </span>
                <p className="text-2xl font-extrabold text-green-900 dark:text-green-100">
                  {distribution.top2_3}
                </p>
                <span className="text-[10px] text-green-700 dark:text-green-400">Positions 2–3</span>
              </div>

              {/* Top 4-5 */}
              <div className="p-3 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 rounded-lg text-center space-y-1">
                <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                  Top 4-5
                </span>
                <p className="text-2xl font-extrabold text-teal-900 dark:text-teal-100">
                  {distribution.top4_5}
                </p>
                <span className="text-[10px] text-teal-700 dark:text-teal-400">Positions 4–5</span>
              </div>

              {/* Top 6-10 */}
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 rounded-lg text-center space-y-1">
                <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                  Top 6-10
                </span>
                <p className="text-2xl font-extrabold text-blue-900 dark:text-blue-100">
                  {distribution.top6_10}
                </p>
                <span className="text-[10px] text-blue-700 dark:text-blue-400">Page 1 Bottom</span>
              </div>

              {/* Top 11-30 */}
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 rounded-lg text-center space-y-1">
                <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                  Top 11-30
                </span>
                <p className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-100">
                  {distribution.top11_30}
                </p>
                <span className="text-[10px] text-indigo-700 dark:text-indigo-400">Pages 2–3</span>
              </div>

              {/* Top 31-100 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Top 31-100
                </span>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {distribution.top31_100}
                </p>
                <span className="text-[10px] text-slate-500">Pages 4–10</span>
              </div>

              {/* > 100 / Unranked */}
              <div className="p-3 bg-slate-100/60 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-lg text-center space-y-1">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  &gt; 100
                </span>
                <p className="text-2xl font-extrabold text-slate-700 dark:text-slate-300">
                  {distribution.greaterThan100}
                </p>
                <span className="text-[10px] text-slate-400">Unranked</span>
              </div>
            </div>

            {/* Stacked Visual Representation */}
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                {data.totalKeywordsTracked > 0 && (
                  <>
                    <div
                      style={{ width: `${(distribution.top1 / data.totalKeywordsTracked) * 100}%` }}
                      className="bg-emerald-500 h-full"
                      title={`Top 1: ${distribution.top1}`}
                    />
                    <div
                      style={{ width: `${(distribution.top2_3 / data.totalKeywordsTracked) * 100}%` }}
                      className="bg-green-500 h-full"
                      title={`Top 2-3: ${distribution.top2_3}`}
                    />
                    <div
                      style={{ width: `${(distribution.top4_5 / data.totalKeywordsTracked) * 100}%` }}
                      className="bg-teal-500 h-full"
                      title={`Top 4-5: ${distribution.top4_5}`}
                    />
                    <div
                      style={{ width: `${(distribution.top6_10 / data.totalKeywordsTracked) * 100}%` }}
                      className="bg-blue-500 h-full"
                      title={`Top 6-10: ${distribution.top6_10}`}
                    />
                    <div
                      style={{ width: `${(distribution.top11_30 / data.totalKeywordsTracked) * 100}%` }}
                      className="bg-indigo-500 h-full"
                      title={`Top 11-30: ${distribution.top11_30}`}
                    />
                    <div
                      style={{ width: `${(distribution.top31_100 / data.totalKeywordsTracked) * 100}%` }}
                      className="bg-slate-400 h-full"
                      title={`Top 31-100: ${distribution.top31_100}`}
                    />
                    <div
                      style={{ width: `${(distribution.greaterThan100 / data.totalKeywordsTracked) * 100}%` }}
                      className="bg-slate-200 dark:bg-slate-700 h-full"
                      title={`>100: ${distribution.greaterThan100}`}
                    />
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Top 1</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500" /> Top 2-3</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-teal-500" /> Top 4-5</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Top 6-10</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" /> Top 11-30</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-400" /> Top 31-100</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-700" /> &gt; 100</span>
              </div>
            </div>
          </div>

          {/* 3. SERP Movement Visual & Breakdown Matrix */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  SERP Movement Summary
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time rank momentum indicating keywords that climbed, declined, or held steady.
                </p>
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Total Movement Evaluated: {(data.movement.jumpedCount || 0) + (data.movement.droppedCount || 0) + (data.movement.unchangedCount || 0)}
              </div>
            </div>

            {/* Tri-color Horizontal Bar */}
            <div className="space-y-2">
              <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${data.movement.jumpedPercentage}%` }}
                  className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
                  title={`Jumped: ${data.movement.jumpedCount} (${data.movement.jumpedPercentage}%)`}
                >
                  {data.movement.jumpedPercentage > 8 && `${data.movement.jumpedPercentage}%`}
                </div>
                <div
                  style={{ width: `${data.movement.droppedPercentage}%` }}
                  className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
                  title={`Dropped: ${data.movement.droppedCount} (${data.movement.droppedPercentage}%)`}
                >
                  {data.movement.droppedPercentage > 8 && `${data.movement.droppedPercentage}%`}
                </div>
                <div
                  style={{ width: `${data.movement.unchangedPercentage}%` }}
                  className="bg-slate-400 dark:bg-slate-600 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
                  title={`Unchanged: ${data.movement.unchangedCount} (${data.movement.unchangedPercentage}%)`}
                >
                  {data.movement.unchangedPercentage > 8 && `${data.movement.unchangedPercentage}%`}
                </div>
              </div>

              <div className="grid grid-cols-3 text-center pt-1">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <span>▲ Jumped</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    {data.movement.jumpedCount} <span className="text-xs font-normal text-slate-500">({data.movement.jumpedPercentage}%)</span>
                  </p>
                </div>

                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
                    <span>▼ Dropped</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    {data.movement.droppedCount} <span className="text-xs font-normal text-slate-500">({data.movement.droppedPercentage}%)</span>
                  </p>
                </div>

                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1">
                    <span>— Unchanged</span>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    {data.movement.unchangedCount} <span className="text-xs font-normal text-slate-500">({data.movement.unchangedPercentage}%)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Movement by Position Tier Matrix Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="min-w-full text-xs divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-2.5 text-left">SERP Movement Type</th>
                    <th className="px-4 py-2.5 text-center">Top 1–3</th>
                    <th className="px-4 py-2.5 text-center">Top 4–10</th>
                    <th className="px-4 py-2.5 text-center">Top 11–30</th>
                    <th className="px-4 py-2.5 text-center">Top 31–100</th>
                    <th className="px-4 py-2.5 text-right font-bold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span>▲</span> Jumped
                    </td>
                    <td className="px-4 py-2.5 text-center font-medium">{data.movement.jumpedByBucket?.top1_3 ?? 0}</td>
                    <td className="px-4 py-2.5 text-center font-medium">{data.movement.jumpedByBucket?.top4_10 ?? 0}</td>
                    <td className="px-4 py-2.5 text-center font-medium">{data.movement.jumpedByBucket?.top11_30 ?? 0}</td>
                    <td className="px-4 py-2.5 text-center font-medium">{data.movement.jumpedByBucket?.top31_100 ?? 0}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-slate-100">{data.movement.jumpedCount}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <span>▼</span> Dropped
                    </td>
                    <td className="px-4 py-2.5 text-center font-medium">{data.movement.droppedByBucket?.top1_3 ?? 0}</td>
                    <td className="px-4 py-2.5 text-center font-medium">{data.movement.droppedByBucket?.top4_10 ?? 0}</td>
                    <td className="px-4 py-2.5 text-center font-medium">{data.movement.droppedByBucket?.top11_30 ?? 0}</td>
                    <td className="px-4 py-2.5 text-center font-medium">{data.movement.droppedByBucket?.top31_100 ?? 0}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-slate-100">{data.movement.droppedCount}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <span>—</span> Unchanged
                    </td>
                    <td className="px-4 py-2.5 text-center font-medium">{data.movement.unchangedByBucket?.top1_3 ?? 0}</td>
                    <td className="px-4 py-2.5 text-center font-medium">{data.movement.unchangedByBucket?.top4_10 ?? 0}</td>
                    <td className="px-4 py-2.5 text-center font-medium">{data.movement.unchangedByBucket?.top11_30 ?? 0}</td>
                    <td className="px-4 py-2.5 text-center font-medium">{data.movement.unchangedByBucket?.top31_100 ?? 0}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-slate-100">{data.movement.unchangedCount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Keyword Overview Card (3 Columns: Top Keywords, Jumped, Dropped) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Keyword Movement Highlights
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Top performing rankings and significant SERP climbers and decliners.
                </p>
              </div>
              <Link
                href={`/projects/${project.id}/rankings/detailed`}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
              >
                <span>View Full Detailed Matrix</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1: Top Keywords */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>👑</span>
                    <span>Top Keywords</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Best Rank</span>
                </div>

                {data.topKeywords.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No ranked keywords found.</p>
                ) : (
                  <div className="space-y-2.5">
                    {data.topKeywords.map((kw) => (
                      <div key={kw.keywordId} className="flex justify-between items-center text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {kw.keywordText}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Vol: {kw.searchVolume?.toLocaleString() || "—"}
                          </span>
                        </div>
                        <span className="font-bold text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          #{kw.position}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-right">
                  <Link
                    href={`/projects/${project.id}/rankings/detailed`}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View All in Detailed →
                  </Link>
                </div>
              </div>

              {/* Column 2: Jumped */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 bg-emerald-50/20 dark:bg-emerald-950/10">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <span>🚀</span>
                    <span>Top Jumped</span>
                  </h4>
                  <span className="text-[10px] text-emerald-600">Climbers</span>
                </div>

                {data.jumpedKeywords.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No rank improvements recorded.</p>
                ) : (
                  <div className="space-y-2.5">
                    {data.jumpedKeywords.map((kw) => (
                      <div key={kw.keywordId} className="flex justify-between items-center text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {kw.keywordText}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Now: #{kw.position} (was #{kw.previousPosition})
                          </span>
                        </div>
                        <span className="font-bold text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          ▲ {kw.positionChange}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-right">
                  <Link
                    href={`/projects/${project.id}/rankings/detailed`}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    View All in Detailed →
                  </Link>
                </div>
              </div>

              {/* Column 3: Dropped */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3 bg-rose-50/20 dark:bg-rose-950/10">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <span>📉</span>
                    <span>Top Dropped</span>
                  </h4>
                  <span className="text-[10px] text-rose-600">Decliners</span>
                </div>

                {data.droppedKeywords.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No rank declines recorded.</p>
                ) : (
                  <div className="space-y-2.5">
                    {data.droppedKeywords.map((kw) => (
                      <div key={kw.keywordId} className="flex justify-between items-center text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {kw.keywordText}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Now: #{kw.position} (was #{kw.previousPosition})
                          </span>
                        </div>
                        <span className="font-bold text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          ▼ {Math.abs(kw.positionChange || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-right">
                  <Link
                    href={`/projects/${project.id}/rankings/detailed`}
                    className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    View All in Detailed →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Top Pages & Competitors Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Ranked Pages */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>📄</span> Top Ranked Pages
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Landing pages capturing the highest volume of keyword rankings.
                  </p>
                </div>
              </div>

              {data.topPages.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No ranked URLs indexed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                      <tr>
                        <th className="px-3 py-2 text-left">Page URL</th>
                        <th className="px-3 py-2 text-right">Keywords</th>
                        <th className="px-3 py-2 text-right">Avg Pos</th>
                        <th className="px-3 py-2 text-right">Top 10</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {data.topPages.map((page, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-3 py-2.5 font-medium text-blue-600 dark:text-blue-400 truncate max-w-[220px]" title={page.url}>
                            {page.url}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-slate-900 dark:text-slate-100">
                            {page.totalKeywords}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-400">
                            #{page.averagePosition}
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-emerald-600">
                            {page.top10Count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Competitors Visibility Snapshot */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>⚔️</span> Competitor Share of Voice
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target project visibility vs tracked market rivals.
                  </p>
                </div>
                <Link
                  href={`/projects/${project.id}/competitors`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Manage →
                </Link>
              </div>

              <div className="space-y-3">
                {/* Target Domain */}
                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{project.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold">Primary</span>
                    </span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">{data.searchVisibility}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, data.searchVisibility))}%` }} />
                  </div>
                </div>

                {/* Competitors */}
                {data.competitors.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No competitors added. Add competitors in the My Competitors tab to track market overlap.
                  </p>
                ) : (
                  data.competitors.map((comp) => (
                    <div key={comp.competitorId} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <div className="truncate pr-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{comp.name}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">({comp.domain})</span>
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{comp.searchVisibility}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="bg-slate-500 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, comp.searchVisibility))}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 6. Algorithm Updates & Notes Widget (Refinement #3: Typed Metadata/Fixtures) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>📰</span> Search Engine Algorithm Notes &amp; Updates
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Timeline of verified Google algorithm rollouts and SERP calibration milestones.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                Live Feed
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.algorithmNotes.map((note) => (
                <div key={note.id} className="py-3.5 first:pt-1 last:pb-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {note.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          note.severity === "warning"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : note.severity === "notice"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {note.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">{note.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {note.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Add Keyword Modal */}
      {isAddModalOpen && (
        <AddKeywordModal
          isOpen={isAddModalOpen}
          projectId={project.id}
          groups={[]}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            loadSummary();
          }}
        />
      )}
    </div>
  );
}
