"use client";

import React from "react";
import { formatNumber, formatPercent } from "../../lib/formatters";

interface GscKpiCardsProps {
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
}

export function GscKpiCards({
  totalClicks,
  totalImpressions,
  averageCtr,
  averagePosition,
}: GscKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="gsc-kpi-cards">
      {/* Total Clicks */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs relative overflow-hidden" data-testid="kpi-clicks">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Clicks</span>
          <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatNumber(totalClicks)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">First-party search clicks</p>
        </div>
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Total Impressions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs relative overflow-hidden" data-testid="kpi-impressions">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Impressions</span>
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatNumber(totalImpressions)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Search result appearances</p>
        </div>
        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Average CTR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs relative overflow-hidden" data-testid="kpi-ctr">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average CTR</span>
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            {formatPercent(averageCtr)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Click-through rate</p>
        </div>
        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Average Position */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs relative overflow-hidden" data-testid="kpi-position">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GSC Avg. Position</span>
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-amber-300 tracking-tight">
            {averagePosition > 0 ? averagePosition.toFixed(1) : "—"}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <p className="text-[11px] text-amber-400/90 font-medium">1st-Party Google Data</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
      </div>
    </div>
  );
}
