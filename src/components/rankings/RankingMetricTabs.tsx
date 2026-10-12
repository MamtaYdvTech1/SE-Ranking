"use client";

import React from "react";
import { MetricType, RankingMetric } from "../../lib/rankingsTypes";

interface RankingMetricTabsProps {
  metrics: RankingMetric[];
  activeMetric: MetricType;
  onSelectMetric: (metric: MetricType) => void;
}

export function RankingMetricTabs({
  metrics,
  activeMetric,
  onSelectMetric,
}: RankingMetricTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Ranking Metrics"
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-left">
        {metrics.map((metric) => {
          const isActive = activeMetric === metric.id;
          const isSupportedOrMock = metric.status === "supported" || metric.status === "future_ready";
          const isComingSoon = metric.status === "coming_soon";

          return (
            <button
              key={metric.id}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isComingSoon}
              disabled={isComingSoon}
              onClick={() => {
                if (isSupportedOrMock) {
                  onSelectMetric(metric.id);
                }
              }}
              className={`p-3.5 sm:p-4 text-left transition relative flex flex-col justify-between group focus:outline-none focus:bg-slate-50 ${
                isActive
                  ? "bg-blue-50/40"
                  : isComingSoon
                  ? "opacity-60 cursor-not-allowed bg-slate-50/50"
                  : "hover:bg-slate-50 cursor-pointer"
              }`}
            >
              {/* Active Indicator Top/Bottom Line */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
              )}

              {/* Metric Label & Badge */}
              <div className="flex items-center justify-between gap-1 w-full mb-1.5">
                <span
                  className={`text-[11px] font-semibold tracking-wider uppercase truncate ${
                    isActive
                      ? "text-blue-600"
                      : isComingSoon
                      ? "text-slate-400"
                      : "text-slate-600 group-hover:text-slate-900"
                  }`}
                >
                  {metric.name}
                </span>

                {isComingSoon && (
                  <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                    {metric.phaseLabel || "Soon"}
                  </span>
                )}
              </div>

              {/* Metric Value & Trend */}
              <div className="flex items-baseline justify-between gap-2 mt-auto">
                <div className="text-xl font-bold text-slate-900 tracking-tight">
                  {metric.formattedValue}
                </div>

                {metric.changeLabel && isSupportedOrMock && (
                  <span
                    className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                      metric.isPositive ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {metric.changeLabel}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RankingMetricTabs;
