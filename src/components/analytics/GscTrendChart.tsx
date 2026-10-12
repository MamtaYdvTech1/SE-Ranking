"use client";

import React, { useState } from "react";
import { GscDailyPointDto } from "../../lib/types";
import { formatNumber } from "../../lib/formatters";

export interface GscTrendChartProps {
  series: GscDailyPointDto[];
}

export function GscTrendChart({ series }: GscTrendChartProps) {
  const [activeMetric, setActiveMetric] = useState<"clicks" | "impressions" | "ctr" | "position">("clicks");

  if (!series || series.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-xs py-12">
        No Search Console daily performance records available for this date window.
      </div>
    );
  }

  const values = series.map((s) => {
    switch (activeMetric) {
      case "clicks":
        return s.clicks;
      case "impressions":
        return s.impressions;
      case "ctr":
        return (s.ctr ?? 0) * 100;
      case "position":
        return s.averagePosition ?? 0;
    }
  });

  const maxValue = Math.max(...values, 1);
  const minValue = activeMetric === "position" ? Math.min(...values, 1) : 0;

  // Chart dimensions
  const height = 180;
  const width = 600;
  const padding = 20;

  const points = series.map((item, index) => {
    const x = padding + (index / (series.length - 1 || 1)) * (width - padding * 2);
    const val = values[index];
    
    // For position, lower is better (top of chart)
    let normalizedY = 0;
    if (activeMetric === "position") {
      const range = Math.max(maxValue - minValue, 1);
      normalizedY = (val - minValue) / range;
    } else {
      normalizedY = 1 - val / maxValue;
    }

    const y = padding + normalizedY * (height - padding * 2);
    return { x, y, val, date: item.date };
  });

  const pathD = points.length > 1
    ? points.reduce((acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), "")
    : "";

  const areaD = points.length > 1
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : "";

  const colorConfig = {
    clicks: { stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.15)", label: "Clicks" },
    impressions: { stroke: "#818cf8", fill: "rgba(129, 140, 248, 0.15)", label: "Impressions" },
    ctr: { stroke: "#34d399", fill: "rgba(52, 211, 153, 0.15)", label: "CTR (%)" },
    position: { stroke: "#fbbf24", fill: "rgba(251, 191, 36, 0.15)", label: "Avg. Position" },
  }[activeMetric];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4" data-testid="gsc-trend-chart">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-sm font-semibold text-white">Performance Over Time</h4>
          <p className="text-[11px] text-slate-400">Daily Google Search Console trends</p>
        </div>

        {/* Metric Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          {(["clicks", "impressions", "ctr", "position"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setActiveMetric(m)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition capitalize ${
                activeMetric === m
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {m === "ctr" ? "CTR" : m === "position" ? "Avg. Pos" : m}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 select-none"
          preserveAspectRatio="none"
        >
          {/* Background Area */}
          {areaD && <path d={areaD} fill={colorConfig.fill} />}

          {/* Line Path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={colorConfig.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill={colorConfig.stroke}
              className="hover:r-5 transition-all cursor-pointer"
            >
              <title>{`${p.date}: ${
                activeMetric === "ctr"
                  ? (p.val / 100).toLocaleString(undefined, { style: "percent", minimumFractionDigits: 2 })
                  : activeMetric === "position"
                  ? p.val.toFixed(1)
                  : formatNumber(p.val)
              }`}</title>
            </circle>
          ))}
        </svg>

        {/* X Axis Dates */}
        <div className="flex justify-between text-[10px] text-slate-500 pt-2 px-1">
          <span>{series[0]?.date}</span>
          {series.length > 2 && <span>{series[Math.floor(series.length / 2)]?.date}</span>}
          <span>{series[series.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
}
