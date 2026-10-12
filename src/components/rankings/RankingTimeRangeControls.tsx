"use client";

import React from "react";
import { GroupBy, TimeRange, ViewFilter } from "../../lib/rankingsTypes";

export interface RankingTimeRangeControlsProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  groupBy: GroupBy;
  onGroupByChange: (group: GroupBy) => void;
  viewFilter: ViewFilter;
  onViewFilterChange: (filter: ViewFilter) => void;
}

export function RankingTimeRangeControls({
  timeRange,
  onTimeRangeChange,
  groupBy,
  onGroupByChange,
  viewFilter,
  onViewFilterChange,
}: RankingTimeRangeControlsProps) {
  const ranges: { id: TimeRange; label: string }[] = [
    { id: "week", label: "WEEK" },
    { id: "month", label: "MONTH" },
    { id: "3months", label: "3 MONTHS" },
    { id: "6months", label: "6 MONTHS" },
  ];

  const viewFilters: { id: ViewFilter; label: string }[] = [
    { id: "all", label: "ALL" },
    { id: "websites", label: "WEBSITES" },
    { id: "groups", label: "GROUPS" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 text-xs select-none">
      {/* Left: Time Range Toggles & Group By */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Time Ranges */}
        <div className="flex items-center gap-4">
          {ranges.map((r) => {
            const isActive = timeRange === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onTimeRangeChange(r.id)}
                className={`py-1 font-bold text-[11px] tracking-wider transition relative focus:outline-none ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {r.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                )}
              </button>
            );
          })}
        </div>

        <span className="text-slate-300 hidden sm:inline">|</span>

        {/* Group By Selector */}
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="text-[11px] font-semibold uppercase text-slate-400">GROUP BY:</span>
          <select
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value as GroupBy)}
            className="bg-transparent border-0 font-bold text-[11px] text-blue-600 hover:text-blue-700 cursor-pointer focus:outline-none"
            aria-label="Group by granularity"
          >
            <option value="days">DAYS ▾</option>
            <option value="weeks">WEEKS ▾</option>
          </select>
        </div>
      </div>

      {/* Right: View Filter Toggles (ALL / WEBSITES / GROUPS) */}
      <div className="flex items-center gap-4">
        {viewFilters.map((vf) => {
          const isActive = viewFilter === vf.id;
          return (
            <button
              key={vf.id}
              type="button"
              onClick={() => onViewFilterChange(vf.id)}
              className={`py-1 font-bold text-[11px] tracking-wider transition relative focus:outline-none ${
                isActive
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {vf.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RankingTimeRangeControls;
