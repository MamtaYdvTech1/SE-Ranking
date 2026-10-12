"use client";

import React, { useEffect, useState } from "react";
import { Skeleton, Button } from "@internal-seo/ui";
import { api } from "../../lib/api";
import { GscQueryDetailDto } from "../../lib/types";
import { formatNumber, formatPercent } from "../../lib/formatters";

export interface GscQueryDetailDrawerProps {
  projectId: string;
  queryText: string | null;
  isOpen: boolean;
  onClose: () => void;
  startDate?: string;
  endDate?: string;
}

export function GscQueryDetailDrawer({
  projectId,
  queryText,
  isOpen,
  onClose,
  startDate,
  endDate,
}: GscQueryDetailDrawerProps) {
  const [detail, setDetail] = useState<GscQueryDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setDetail(null);
    setError(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen || !queryText) {
      return;
    }

    let ignore = false;
    setIsLoading(true);
    api.gsc.getQueryHistory(projectId, queryText, { startDate, endDate })
      .then((res) => {
        if (!ignore && res.data) {
          setDetail(res.data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load query history.");
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
  }, [projectId, queryText, isOpen, startDate, endDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" data-testid="gsc-query-drawer">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                Google Search Console • Query Drilldown
              </span>
              <h3 className="text-base font-bold text-white truncate max-w-md mt-0.5">
                {queryText ? `Query: ${queryText}` : "Query Details"}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </Button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {isLoading ? (
              <div className="space-y-4" data-testid="gsc-drawer-loading">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-xs" data-testid="gsc-drawer-error">
                {error}
              </div>
            ) : detail ? (
              <>
                {/* Quick KPI summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Clicks</span>
                    <p className="text-lg font-bold text-white">{formatNumber(detail.totalClicks)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Impressions</span>
                    <p className="text-lg font-bold text-indigo-300">{formatNumber(detail.totalImpressions)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">CTR</span>
                    <p className="text-lg font-bold text-emerald-400">{formatPercent(detail.averageCtr)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Avg. Position</span>
                    <p className="text-lg font-bold text-amber-300">{detail.averagePosition.toFixed(1)}</p>
                  </div>
                </div>

                {/* Top Landing Pages */}
                {detail.topPages.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Top Landing Pages</h5>
                    <div className="space-y-1.5">
                      {detail.topPages.map((page, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 truncate"
                        >
                          <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                          <span className="truncate font-mono text-[11px] text-blue-400">{page}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Daily History Table */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Date-by-Date Breakdown</h5>
                  <div className="border border-slate-800 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800 sticky top-0">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Date</th>
                          <th className="py-2 px-3 font-semibold text-right">Clicks</th>
                          <th className="py-2 px-3 font-semibold text-right">Impressions</th>
                          <th className="py-2 px-3 font-semibold text-right">CTR</th>
                          <th className="py-2 px-3 font-semibold text-right">Position</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                        {detail.history.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-300">{row.date}</td>
                            <td className="py-2 px-3 text-right font-medium text-white">{formatNumber(row.clicks)}</td>
                            <td className="py-2 px-3 text-right text-slate-300">{formatNumber(row.impressions)}</td>
                            <td className="py-2 px-3 text-right text-emerald-400">{formatPercent(row.ctr)}</td>
                            <td className="py-2 px-3 text-right text-amber-300 font-semibold">{row.position.toFixed(1)}</td>
                          </tr>
                        ))}
                        {detail.history.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-400">
                              No daily history records found for this query.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
