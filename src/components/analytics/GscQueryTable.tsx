"use client";

import React from "react";
import { GscQueryRowDto, PaginatedList } from "../../lib/types";
import { formatNumber, formatPercent } from "../../lib/formatters";
import { Button } from "@internal-seo/ui";

export interface GscQueryTableProps {
  queries: PaginatedList<GscQueryRowDto> | null;
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  sortBy: string;
  sortDescending: boolean;
  onSortChange: (column: string) => void;
  onSelectQuery: (queryText: string) => void;
}

export function GscQueryTable({
  queries,
  isLoading,
  search,
  onSearchChange,
  page,
  onPageChange,
  sortBy,
  sortDescending,
  onSortChange,
  onSelectQuery,
}: GscQueryTableProps) {
  const renderSortArrow = (column: string) => {
    if (sortBy !== column) return null;
    return <span className="ml-1 text-blue-400">{sortDescending ? "▼" : "▲"}</span>;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4" data-testid="gsc-query-table">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-white">Search Queries</h4>
          <p className="text-[11px] text-slate-400">Queries bringing organic Google impressions to your site</p>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search queries..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => onSortChange("query")}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-white transition"
                >
                  Top Query {renderSortArrow("query")}
                </th>
                <th
                  onClick={() => onSortChange("clicks")}
                  className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition"
                >
                  Clicks {renderSortArrow("clicks")}
                </th>
                <th
                  onClick={() => onSortChange("impressions")}
                  className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition"
                >
                  Impressions {renderSortArrow("impressions")}
                </th>
                <th
                  onClick={() => onSortChange("ctr")}
                  className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition"
                >
                  CTR {renderSortArrow("ctr")}
                </th>
                <th
                  onClick={() => onSortChange("position")}
                  className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition"
                >
                  Avg. Position {renderSortArrow("position")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading queries...
                  </td>
                </tr>
              ) : queries?.items && queries.items.length > 0 ? (
                queries.items.map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onSelectQuery(row.queryText || row.query || "")}
                    className="hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-100 hover:text-blue-400 flex items-center gap-2">
                      <span className="truncate max-w-xs sm:max-w-md">{row.queryText || row.query}</span>
                      <svg className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-white">{formatNumber(row.clicks)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{formatNumber(row.impressions)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">{formatPercent(row.ctr)}</td>
                    <td className="py-2.5 px-3 text-right text-amber-300 font-semibold">{(row.position ?? row.averagePosition ?? 0).toFixed(1)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No Search Console queries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {queries && queries.totalPages > 1 && (
          <div className="flex items-center justify-between p-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400">
            <span>
              Showing {((page - 1) * queries.pageSize) + 1} to {Math.min(page * queries.pageSize, queries.totalCount)} of {queries.totalCount} queries
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                Previous
              </Button>
              <span className="font-semibold text-slate-200">
                {page} / {queries.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= queries.totalPages}
                onClick={() => onPageChange(page + 1)}
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
