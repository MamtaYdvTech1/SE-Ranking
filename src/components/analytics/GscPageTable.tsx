"use client";

import React from "react";
import { GscPageRowDto, PaginatedList } from "../../lib/types";
import { formatNumber, formatPercent } from "../../lib/formatters";
import { Button } from "@internal-seo/ui";

export interface GscPageTableProps {
  pages: PaginatedList<GscPageRowDto> | null;
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  sortBy: string;
  sortDescending: boolean;
  onSortChange: (column: string) => void;
}

export function GscPageTable({
  pages,
  isLoading,
  search,
  onSearchChange,
  page,
  onPageChange,
  sortBy,
  sortDescending,
  onSortChange,
}: GscPageTableProps) {
  const renderSortArrow = (column: string) => {
    if (sortBy !== column) return null;
    return <span className="ml-1 text-blue-400">{sortDescending ? "▼" : "▲"}</span>;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4" data-testid="gsc-page-table">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-white">Top Landing Pages</h4>
          <p className="text-[11px] text-slate-400">Pages driving the highest search visibility and traffic</p>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search pages..."
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
                  onClick={() => onSortChange("page")}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-white transition"
                >
                  Landing Page URL {renderSortArrow("page")}
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
                <th
                  onClick={() => onSortChange("queries")}
                  className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition"
                >
                  Queries {renderSortArrow("queries")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading landing pages...
                  </td>
                </tr>
              ) : pages?.items && pages.items.length > 0 ? (
                pages.items.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-blue-400 max-w-xs sm:max-w-md truncate">
                      {row.pageUrl}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-white">{formatNumber(row.clicks)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{formatNumber(row.impressions)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">{formatPercent(row.ctr)}</td>
                    <td className="py-2.5 px-3 text-right text-amber-300 font-semibold">{row.averagePosition.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{row.queryCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No Search Console landing pages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages && pages.totalPages > 1 && (
          <div className="flex items-center justify-between p-3 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400">
            <span>
              Showing {((page - 1) * pages.pageSize) + 1} to {Math.min(page * pages.pageSize, pages.totalCount)} of {pages.totalCount} pages
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
                {page} / {pages.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pages.totalPages}
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
