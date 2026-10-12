"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { CompetitorDto, CompetitorGapResponseDto } from "@/lib/types";

interface CompetitorGapTabProps {
  projectId: string;
  competitors?: CompetitorDto[];
}

export function CompetitorGapTab({ projectId, competitors = [] }: CompetitorGapTabProps) {
  const { user } = useAuth();
  const [data, setData] = useState<CompetitorGapResponseDto | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string>("");
  const [sort, setSort] = useState<string>("opportunityscore");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activatingKeywordId, setActivatingKeywordId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Authoritative role check: Viewer is read-only; SuperAdmin, Admin, SEOExecutive, SEOManager, ContentWriter can edit
  const canEdit = !!user && user.role !== "Viewer";

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    loadGapData();
  }, [projectId, debouncedSearch, selectedCompetitorId, sort, page]);

  const loadGapData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.competitors.getGap(projectId, {
        search: debouncedSearch || undefined,
        competitorId: selectedCompetitorId || undefined,
        sort,
        page,
        pageSize: 25,
      });

      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || "Failed to load keyword gap analysis.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load keyword gap analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateKeyword = async (keywordId: string) => {
    if (!canEdit) return;
    setActivatingKeywordId(keywordId);
    setActionMessage(null);
    try {
      const res = await api.keywords.bulkStatus(projectId, [keywordId], true);
      if (res.success) {
        // Update local state to reflect Tracked immediately
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((item) =>
              item.keywordId === keywordId ? { ...item, isActive: true } : item
            ),
          };
        });
        setActionMessage("Keyword activated and added to tracked rankings.");
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        setError(res.message || "Failed to activate keyword.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to activate keyword.");
    } finally {
      setActivatingKeywordId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-emerald-500 text-emerald-700 dark:text-emerald-300";
    if (score >= 40) return "bg-blue-500 text-blue-700 dark:text-blue-300";
    if (score >= 15) return "bg-amber-500 text-amber-700 dark:text-amber-300";
    return "bg-slate-400 text-slate-700 dark:text-slate-300";
  };

  return (
    <div className="space-y-4">
      {/* Action and Alert Notifications */}
      {actionMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-md text-sm text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
          <span>✓ {actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-md text-sm text-rose-800 dark:text-rose-200 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadGapData}
            className="px-3 py-1 bg-rose-100 dark:bg-rose-900 text-rose-900 dark:text-rose-100 rounded text-xs font-semibold hover:bg-rose-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search gap keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Competitor Dropdown Filter */}
          <div className="w-full sm:w-56">
            <select
              value={selectedCompetitorId}
              onChange={(e) => {
                setSelectedCompetitorId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Competitors</option>
              {(data?.competitors || competitors).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.domain})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-48">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="opportunityscore">Sort: Opportunity Score</option>
              <option value="searchvolume">Sort: Search Volume</option>
              <option value="bestcompetitorrank">Sort: Competitor Rank</option>
              <option value="keyword">Sort: Keyword (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Freshness / Staleness Badge */}
        {data?.isStale && (
          <span className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-md font-medium">
            ⚠ Ranking data is stale (&gt;48h).
          </span>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-bold">
              🎯
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              No Keyword Gaps Detected
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Keyword gap opportunities appear when tracked competitors rank in the Top 20 for
              keywords where your domain is unranked or outside the Top 20.
            </p>
            {debouncedSearch && (
              <p className="text-xs text-slate-400">
                Try clearing your search query to view all gap opportunities.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Keyword</th>
                  <th className="py-3.5 px-4 text-center">Tracked State</th>
                  <th className="py-3.5 px-4 text-right">Search Volume</th>
                  <th className="py-3.5 px-4">Best Competitor</th>
                  <th className="py-3.5 px-4 text-center">Competitor Rank</th>
                  <th className="py-3.5 px-4 text-center">Target Domain Rank</th>
                  <th className="py-3.5 px-4">Opportunity Score</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {data.items.map((row) => (
                  <tr
                    key={row.keywordId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Keyword Text & Metadata */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {row.keywordText}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        {row.keywordDifficulty !== undefined && row.keywordDifficulty !== null && (
                          <span>KD: {Number(row.keywordDifficulty).toFixed(0)}</span>
                        )}
                        {row.cpcUsd !== undefined && row.cpcUsd !== null && (
                          <span>CPC: ${Number(row.cpcUsd).toFixed(2)}</span>
                        )}
                      </div>
                    </td>

                    {/* Tracked State */}
                    <td className="py-3.5 px-4 text-center">
                      {row.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          Tracked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Search Volume */}
                    <td className="py-3.5 px-4 text-right font-medium text-slate-800 dark:text-slate-200">
                      {row.searchVolume !== undefined && row.searchVolume !== null
                        ? row.searchVolume.toLocaleString()
                        : "—"}
                    </td>

                    {/* Best Competitor Name & Domain */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {row.bestCompetitorName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                        {row.bestCompetitorDomain}
                      </div>
                    </td>

                    {/* Best Competitor Position */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                        #{row.bestCompetitorPosition}
                      </span>
                    </td>

                    {/* Target Domain Position */}
                    <td className="py-3.5 px-4 text-center">
                      {row.targetPosition ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          #{row.targetPosition}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          Unranked (&gt;100)
                        </span>
                      )}
                    </td>

                    {/* Opportunity Score */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              row.opportunityScore >= 70
                                ? "bg-emerald-500"
                                : row.opportunityScore >= 40
                                ? "bg-blue-500"
                                : row.opportunityScore >= 15
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, row.opportunityScore))}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {row.opportunityScore.toFixed(1)}
                        </span>
                      </div>
                    </td>

                    {/* Action Button: "+ Add to Tracked" vs "Tracked" */}
                    <td className="py-3.5 px-4 text-right">
                      {row.isActive ? (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          ✓ Tracked
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivateKeyword(row.keywordId)}
                          disabled={!canEdit || activatingKeywordId === row.keywordId}
                          title={
                            !canEdit
                              ? "Viewers cannot activate keywords (read-only mode)"
                              : "Activate keyword in ranking tracker"
                          }
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {activatingKeywordId === row.keywordId ? "Activating..." : "+ Add to Tracked"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-sm">
            <div className="text-slate-500 text-xs">
              Showing {(page - 1) * data.pageSize + 1} to{" "}
              {Math.min(page * data.pageSize, data.totalCount)} of {data.totalCount} gap opportunities
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * data.pageSize >= data.totalCount}
                className="px-3 py-1 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
