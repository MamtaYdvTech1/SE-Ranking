"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@internal-seo/ui";
import { ViewStateMode } from "../../lib/rankingsTypes";

export interface WorkspaceActionBarProps {
  totalWebsites: number;
  canManage: boolean;
  isViewer: boolean;
  isRechecking: boolean;
  onRecheck: () => void;
  fixtureMode: ViewStateMode;
  onFixtureChange: (mode: ViewStateMode) => void;
}

export function WorkspaceActionBar({
  totalWebsites,
  canManage,
  isViewer,
  isRechecking,
  onRecheck,
  fixtureMode,
  onFixtureChange,
}: WorkspaceActionBarProps) {
  const [showRecheckMenu, setShowRecheckMenu] = useState(false);

  return (
    <div className="space-y-4">
      {/* Top Banner / Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Workspace Title & Count Badge */}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Active websites
            </h1>
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-slate-800 text-white shadow-sm">
              {totalWebsites}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tracked digital properties and search ranking visibility baselines
          </p>
        </div>

        {/* Global Action Toolbar (Right-aligned) */}
        <div className="flex items-center gap-2">
          {/* Dev Fixture Selector (strictly development & testing fixture; excluded from production) */}
          {process.env.NODE_ENV !== "production" && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 px-1">Fixture:</span>
              <select
                value={fixtureMode}
                onChange={(e) => onFixtureChange(e.target.value as ViewStateMode)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="Development State Fixture"
              >
                <option value="populated">Populated</option>
                <option value="loading">Loading</option>
                <option value="empty">Empty</option>
                <option value="error">Error</option>
                <option value="stale">Stale Data</option>
                <option value="permission-restricted">Restricted (403)</option>
              </select>
            </div>
          )}

          {/* Export Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("CSV/XLSX ranking export queued. Arriving in reporting phase.")}
            className="flex items-center gap-1.5 font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>EXPORT</span>
          </Button>

          {/* Settings Action */}
          <Link href="/projects">
            <Button
              variant="outline"
              size="sm"
              className="p-2"
              title="Workspace Settings"
              aria-label="Settings"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Action Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* "+ Create Project / Add Website" (Role-Aware) */}
        {canManage ? (
          <Link href="/projects/create">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-sm text-xs h-9">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>CREATE PROJECT</span>
            </Button>
          </Link>
        ) : (
          <div
            className="text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200"
            title="Viewer accounts have read-only access to project data"
          >
            Read-only mode (Viewer)
          </div>
        )}

        {/* "Recheck Data" Button with Dropdown Chevron */}
        <div className="relative inline-flex">
          <Button
            variant="primary"
            size="sm"
            onClick={onRecheck}
            disabled={isViewer || isRechecking}
            isLoading={isRechecking}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 text-xs h-9"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRechecking ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isRechecking ? "RECHECKING..." : "RECHECK DATA"}</span>
          </Button>
          <button
            type="button"
            disabled={isViewer}
            onClick={() => setShowRecheckMenu(!showRecheckMenu)}
            className="bg-blue-700 hover:bg-blue-800 text-white px-2 border-l border-blue-500 rounded-r-md flex items-center justify-center disabled:opacity-50"
            aria-label="Recheck Options"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showRecheckMenu && (
            <div className="absolute top-10 left-0 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 w-48 text-xs text-slate-700">
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50"
                onClick={() => {
                  setShowRecheckMenu(false);
                  onRecheck();
                }}
              >
                Recheck All Keywords
              </button>
              <button
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-400 cursor-not-allowed"
                disabled
              >
                Schedule Daily Check (Phase 2)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkspaceActionBar;
