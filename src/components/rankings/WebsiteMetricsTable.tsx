"use client";

import React, { useState } from "react";
import { WebsiteRankingSummary } from "../../lib/rankingsTypes";
import { Badge, Button, Skeleton } from "@internal-seo/ui";

export interface WebsiteMetricsTableProps {
  websites: WebsiteRankingSummary[];
  isLoading?: boolean;
}

type SortField = "domain" | "keywordsCount" | "averagePosition";
type SortDirection = "asc" | "desc";

export function WebsiteMetricsTable({
  websites,
  isLoading = false,
}: WebsiteMetricsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("domain");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(websites.map((w) => w.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleExpandRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortedWebsites = [...websites].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === "string") {
      return sortDir === "asc"
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string);
    }
    return sortDir === "asc"
      ? ((aVal as number) || 0) - ((bVal as number) || 0)
      : ((bVal as number) || 0) - ((aVal as number) || 0);
  });

  const isAllSelected = websites.length > 0 && selectedIds.size === websites.length;
  const isPartiallySelected = selectedIds.size > 0 && selectedIds.size < websites.length;

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3 pt-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (websites.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No websites match your filter</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No tracked domains match the active search term. Try resetting or clearing the query.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Sub-Header Controls matching Reference Screenshot */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">Projects</span>
          {selectedIds.size > 0 && (
            <Badge variant="info" className="text-[11px]">
              {selectedIds.size} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-xs text-slate-600 h-8"
            onClick={() => alert("Column customization settings")}
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <span>COLUMNS</span>
          </Button>
        </div>
      </div>

      {/* Horizontal Scrollable Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700" role="table" aria-label="Website Rankings Table">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 tracking-wider border-b border-slate-200 select-none">
            <tr>
              {/* Select All Checkbox */}
              <th scope="col" className="w-10 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isPartiallySelected;
                  }}
                  onChange={handleSelectAll}
                  aria-label="Select all websites"
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
              </th>

              {/* Website */}
              <th
                scope="col"
                onClick={() => handleSort("domain")}
                className="px-4 py-3 cursor-pointer hover:text-slate-900 group"
              >
                <div className="flex items-center gap-1.5">
                  <span>WEBSITES (1 - {websites.length} of {websites.length})</span>
                  <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </th>

              {/* Top 5 / 10 / 30 */}
              <th scope="col" className="px-4 py-3 text-center">
                TOP 5 / 10 / 30
              </th>

              {/* Keywords */}
              <th
                scope="col"
                onClick={() => handleSort("keywordsCount")}
                className="px-4 py-3 text-center cursor-pointer hover:text-slate-900 group"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>KEYWORDS</span>
                  <svg className="w-3 h-3 text-slate-400 group-hover:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </th>

              {/* Average Position */}
              <th
                scope="col"
                onClick={() => handleSort("averagePosition")}
                className="px-4 py-3 text-center cursor-pointer hover:text-slate-900 group"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>AVG. POSITION</span>
                  <svg className="w-3 h-3 text-slate-400 group-hover:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </th>

              {/* Last Updated */}
              <th scope="col" className="px-4 py-3 text-right">
                LAST UPDATED
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {sortedWebsites.map((site) => {
              const isSelected = selectedIds.has(site.id);
              const isExpanded = expandedId === site.id;

              return (
                <React.Fragment key={site.id}>
                  <tr
                    className={`transition hover:bg-slate-50/80 ${
                      isSelected ? "bg-blue-50/30" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(site.id)}
                        aria-label={`Select ${site.domain}`}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                    </td>

                    {/* Domain & Expand Chevron */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleExpandRow(site.id)}
                          aria-expanded={isExpanded}
                          aria-label={`Expand keyword breakdown for ${site.domain}`}
                          className="text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          <svg
                            className={`w-3.5 h-3.5 transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></span>

                        <span className="font-semibold text-slate-900 hover:text-blue-600 transition">
                          {site.domain}
                        </span>

                        {site.isPrimary && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Top 5 / 10 / 30 */}
                    <td className="px-4 py-3 text-center font-mono font-medium text-slate-700">
                      {site.top5 ?? "—"} / {site.top10 ?? "—"} / {site.top30 ?? "—"}
                    </td>

                    {/* Keywords */}
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-blue-600">{site.keywordsCount}</span>
                    </td>

                    {/* Avg Position */}
                    <td className="px-4 py-3 text-center font-bold text-slate-900">
                      {site.averagePosition}
                    </td>

                    {/* Last Updated */}
                    <td className="px-4 py-3 text-right text-slate-500 font-mono text-[11px]">
                      {site.lastUpdated || "—"}
                    </td>
                  </tr>

                  {/* Expandable Breakdown Drawer / Sub-Row */}
                  {isExpanded && (
                    <tr className="bg-slate-50/70 border-b border-slate-200">
                      <td colSpan={6} className="px-8 py-4">
                        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-inner space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-bold text-xs text-slate-800">
                              Top Keywords Preview for {site.domain}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Full Catalogue in Phase 2 Module
                            </span>
                          </div>

                          {site.keywordBreakdown?.top5Keywords && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                              {site.keywordBreakdown.top5Keywords.map((kw, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100"
                                >
                                  <span className="font-medium text-slate-700">{kw.keyword}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">Pos {kw.position}</span>
                                    <span
                                      className={`text-[10px] font-semibold ${
                                        kw.change > 0
                                          ? "text-emerald-600"
                                          : kw.change < 0
                                          ? "text-red-600"
                                          : "text-slate-400"
                                      }`}
                                    >
                                      {kw.change > 0 ? `+${kw.change}` : kw.change === 0 ? "0" : `${kw.change}`}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WebsiteMetricsTable;
