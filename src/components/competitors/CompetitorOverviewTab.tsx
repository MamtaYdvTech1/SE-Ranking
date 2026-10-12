"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { CompetitorOverviewDto } from "@/lib/types";

interface CompetitorOverviewTabProps {
  projectId: string;
}

export function CompetitorOverviewTab({ projectId }: CompetitorOverviewTabProps) {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<CompetitorOverviewDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOverview();
  }, [projectId, days]);

  const loadOverview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = api.competitors.getVisibility
        ? await api.competitors.getVisibility(projectId, days)
        : await api.competitors.getOverview(projectId, days);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || "Failed to load competitor visibility overview.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load competitor visibility overview.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-sm rounded-lg flex items-center justify-between">
        <span>{error}</span>
        <button
          onClick={loadOverview}
          className="px-3 py-1 bg-rose-100 dark:bg-rose-900 text-rose-900 dark:text-rose-100 rounded text-xs font-semibold hover:bg-rose-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.summaries.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 text-xl font-bold">
          📊
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          No visibility metrics available yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Add competitors to this project to track SERP visibility and keyword overlap.
        </p>
      </div>
    );
  }

  const competitorSummaries = data.summaries.filter((s) => !s.isTargetDomain);

  return (
    <div className="space-y-6">
      {/* Timeframe Selector & Staleness Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
        <div>
          {data.isStale && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              ⚠ SERP ranking data is older than 48 hours or daily sync is pending.
            </span>
          )}
          {data.lastCheckedAt && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Last check recorded: {new Date(data.lastCheckedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Timeframe:
          </label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Side-by-Side KPI Cards */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Competitor Visibility Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Side-by-Side Search Visibility &amp; Share of Voice
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.summaries.map((s) => (
            <div
              key={s.competitorId || "target"}
              className={`p-5 rounded-lg border shadow-sm transition-all ${
                s.isTargetDomain
                  ? "bg-blue-50/40 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800 ring-1 ring-blue-500/20"
                  : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 pr-2">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
                    <span className="truncate">{s.name}</span>
                    {s.isTargetDomain && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded shrink-0">
                        Primary
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{s.domain}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {s.currentVisibility}%
                  </span>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Visibility</p>
                </div>
              </div>

              {/* Core Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-sm border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Average Rank</span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {s.currentAveragePosition !== null && s.currentAveragePosition !== undefined
                      ? `#${s.currentAveragePosition}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Ranked Keywords</span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {s.currentRankedCount}{" "}
                    <span className="text-slate-400 font-normal text-xs">/ {data.totalKeywordsCount}</span>
                  </p>
                </div>
              </div>

              {/* Overlap Indicator */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="text-[11px] font-medium">
                    {s.isTargetDomain ? "Target Top 20 Count:" : "Top 20 SERP Overlap:"}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {s.top20OverlapCount}{" "}
                    <span className="text-slate-400 font-normal">
                      ({s.top20OverlapPercentage}%)
                    </span>
                  </span>
                </div>
              </div>

              {/* Quick Distribution Summary */}
              <div className="grid grid-cols-4 gap-1 text-[11px] text-slate-600 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center">
                <div className="bg-slate-50 dark:bg-slate-800/50 py-1 rounded">
                  <span className="block text-[10px] text-slate-400">Top 3</span>
                  <strong>{s.top3Count}</strong>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 py-1 rounded">
                  <span className="block text-[10px] text-slate-400">Top 10</span>
                  <strong>{s.top10Count}</strong>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 py-1 rounded">
                  <span className="block text-[10px] text-slate-400">Top 20</span>
                  <strong>{s.top20Count}</strong>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 py-1 rounded">
                  <span className="block text-[10px] text-slate-400">Unranked</span>
                  <strong className="text-slate-500">{s.unrankedCount}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SERP Overlap Section with Deep Link to Keyword Gap */}
      {competitorSummaries.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>🎯</span> Page 1 &amp; 2 SERP Overlap Analysis (Top 20)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Measures keyword competition where both your primary domain and competitor rank within the Top 20.
              </p>
            </div>
            <Link
              href={`/projects/${projectId}/competitors/gap`}
              className="inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 gap-1 self-start sm:self-center"
            >
              View Keyword Gap Opportunities &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitorSummaries.map((comp) => (
              <div
                key={comp.competitorId}
                className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-800 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {comp.name}
                    </h5>
                    <span className="text-[11px] text-slate-500">{comp.domain}</span>
                  </div>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                    {comp.top20OverlapCount} Shared Top 20
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>SERP Overlap</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {comp.top20OverlapPercentage}% of total keywords
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, comp.top20OverlapPercentage))}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ranking Distribution Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Ranking Distribution Breakdown (Top 3, Top 10, Top 20, Top 100 &amp; Unranked)
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Domain</th>
                <th className="px-4 py-3 text-right">Visibility</th>
                <th className="px-4 py-3 text-right">Avg Rank</th>
                <th className="px-4 py-3 text-right">Ranked (Total)</th>
                <th className="px-4 py-3 text-right">Top 3</th>
                <th className="px-4 py-3 text-right">Top 10</th>
                <th className="px-4 py-3 text-right">Top 20</th>
                <th className="px-4 py-3 text-right">Top 100</th>
                <th className="px-4 py-3 text-right">Unranked</th>
                <th className="px-4 py-3 text-right">Top 20 Overlap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {data.summaries.map((s) => (
                <tr
                  key={s.competitorId || "target"}
                  className={
                    s.isTargetDomain
                      ? "bg-blue-50/30 dark:bg-blue-950/20 font-medium"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  }
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 dark:text-slate-100">{s.name}</span>
                      {s.isTargetDomain && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold">
                          Target
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{s.domain}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                    {s.currentVisibility}%
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                    {s.currentAveragePosition !== null && s.currentAveragePosition !== undefined
                      ? `#${s.currentAveragePosition}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                    {s.currentRankedCount}{" "}
                    <span className="text-xs text-slate-400">/ {data.totalKeywordsCount}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {s.top3Count}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-blue-600 dark:text-blue-400">
                    {s.top10Count}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-indigo-600 dark:text-indigo-400">
                    {s.top20Count}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                    {s.top100Count}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400 dark:text-slate-500">
                    {s.unrankedCount}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                    {s.isTargetDomain ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : (
                      <span>
                        {s.top20OverlapCount}{" "}
                        <span className="text-xs text-slate-400 font-normal">
                          ({s.top20OverlapPercentage}%)
                        </span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
