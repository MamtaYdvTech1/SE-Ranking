"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { CompetitorKeywordsResponseDto } from "@/lib/types";

interface CompetitorKeywordsTabProps {
  projectId: string;
}

export function CompetitorKeywordsTab({ projectId }: CompetitorKeywordsTabProps) {
  const [data, setData] = useState<CompetitorKeywordsResponseDto | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    loadKeywords();
  }, [projectId, debouncedSearch, page]);

  const loadKeywords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.competitors.getKeywords(projectId, {
        search: debouncedSearch || undefined,
        page,
        pageSize: 25,
      });

      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || "Failed to load keyword comparison matrix.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load keyword comparison matrix.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderRankBadge = (pos?: number | null, change?: number | null) => {
    if (pos === undefined || pos === null) {
      return <span className="text-slate-400">—</span>;
    }

    let changeEl = null;
    if (change !== undefined && change !== null) {
      if (change > 0) {
        changeEl = <span className="text-[10px] text-emerald-600 font-semibold">▲{change}</span>;
      } else if (change < 0) {
        changeEl = <span className="text-[10px] text-rose-600 font-semibold">▼{Math.abs(change)}</span>;
      } else {
        changeEl = <span className="text-[10px] text-slate-400">—</span>;
      }
    }

    return (
      <div className="flex items-center justify-end space-x-1">
        <span className="font-semibold text-slate-900 dark:text-slate-100">#{pos}</span>
        {changeEl}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar & Staleness Notice */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {data?.isStale && (
          <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
            ⚠ Ranking check data is stale (&gt;48h).
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
          {error}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500">No tracked keywords found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Keyword</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Volume</th>
                  <th className="px-4 py-3 text-right font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20">
                    Primary Domain
                  </th>
                  {data.competitors.map((comp) => (
                    <th key={comp.id} className="px-4 py-3 text-right font-medium text-slate-500">
                      <div className="truncate max-w-[120px] text-right" title={comp.name}>
                        {comp.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {data.items.map((item) => (
                  <tr key={item.keywordId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {item.keywordText}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      {item.searchVolume?.toLocaleString() || "—"}
                    </td>
                    <td className="px-4 py-3 text-right bg-blue-50/30 dark:bg-blue-950/10">
                      {renderRankBadge(item.targetPosition, item.targetPositionChange)}
                    </td>
                    {data.competitors.map((comp) => {
                      const cell = item.competitorRanks[comp.id];
                      return (
                        <td key={comp.id} className="px-4 py-3 text-right">
                          {renderRankBadge(cell?.position, cell?.positionChange)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalCount > data.pageSize && (
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm">
              <span className="text-slate-500">
                Showing {(data.pageNumber - 1) * data.pageSize + 1} to{" "}
                {Math.min(data.pageNumber * data.pageSize, data.totalCount)} of {data.totalCount}
              </span>
              <div className="space-x-2">
                <button
                  disabled={data.pageNumber <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 border border-slate-300 dark:border-slate-700 rounded text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={data.pageNumber * data.pageSize >= data.totalCount}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border border-slate-300 dark:border-slate-700 rounded text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
