"use client";

import React from "react";
import { Alert } from "@internal-seo/ui";

export interface DataFreshnessIndicatorProps {
  lastChecked: string;
  lastSynced: string;
  isStale: boolean;
  staleNotice?: string;
  dataNotice?: string;
}

export function DataFreshnessIndicator({
  lastChecked,
  lastSynced,
  isStale,
  staleNotice,
  dataNotice,
}: DataFreshnessIndicatorProps) {
  return (
    <div className="space-y-2">
      {/* Stale Data Warning Banner */}
      {isStale && (
        <Alert variant="warning">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold text-xs">Stale Data Warning:</span>
            <span className="text-xs">
              {staleNotice || "SERP position snapshot from 72h ago. Latest automated rank run is pending."}
            </span>
          </div>
        </Alert>
      )}

      {/* Freshness Bar */}
      <div className="bg-slate-100/80 border border-slate-200/80 rounded-lg px-3.5 py-1.5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isStale ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`}></span>
            <span>
              Last updated: <strong className="text-slate-800 font-medium">{lastChecked}</strong>
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <div>
            Last synced: <strong className="text-slate-800 font-medium">{lastSynced}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200 text-[10px]">
            {dataNotice || "Live Real-Time SERP Data"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DataFreshnessIndicator;
