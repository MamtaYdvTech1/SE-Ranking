"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CompetitorOverviewDto } from "@/lib/types";
import { authFetch } from "@/lib/clientAuth";

export type TrendMetric =
  | "AVERAGE POSITION"
  | "TRAFFIC FORECAST"
  | "SEARCH VISIBILITY"
  | "% IN TOP 10"
  | "COMPETITOR DISTRIBUTION";

const COLORS = ["#ff0064", "#2563EB", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6", "#8b5cf6"];

interface CompetitorTrendChartProps {
  projectId: string;
  metric: TrendMetric;
  days?: number;
  /** Changes when competitors are added or removed, to refetch */
  refreshKey?: number;
}

/** Daily trend per tracked domain from stored rank checks (project + competitors). */
export function CompetitorTrendChart({ projectId, metric, days = 30, refreshKey = 0 }: CompetitorTrendChartProps) {
  const [overview, setOverview] = useState<CompetitorOverviewDto | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    authFetch(`/api/v1/projects/${encodeURIComponent(projectId)}/competitors/overview?days=${days}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.success) setOverview(json.data as CompetitorOverviewDto);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [projectId, days, refreshKey]);

  const { rows, series } = useMemo(() => {
    if (!overview) return { rows: [], series: [] };
    const total = overview.totalKeywordsCount || 0;
    const pick = (h: NonNullable<CompetitorOverviewDto["summaries"][number]["history"]>[number]): number | null => {
      switch (metric) {
        case "AVERAGE POSITION":
          return h.averagePosition ?? null;
        case "TRAFFIC FORECAST":
          return h.estimatedTraffic ?? 0;
        case "SEARCH VISIBILITY":
          return h.visibility;
        case "% IN TOP 10":
          return total > 0 ? Math.round(((h.top10Count ?? 0) / total) * 100) : 0;
        default:
          return h.rankedKeywordsCount;
      }
    };
    const dates = new Set<string>();
    for (const s of overview.summaries) for (const h of s.history || []) dates.add(h.date);
    const sortedDates = [...dates].sort();
    const series = overview.summaries.map((s, idx) => ({ key: s.domain, color: COLORS[idx % COLORS.length] }));
    const rows = sortedDates.map((date) => {
      const row: Record<string, string | number | null> = {
        date: new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
      for (const s of overview.summaries) {
        const point = (s.history || []).find((h) => h.date === date);
        row[s.domain] = point ? pick(point) : null;
      }
      return row;
    });
    return { rows, series };
  }, [overview, metric]);

  if (loaded && rows.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
        No ranking checks in the last {days} days. Run a rank check to see competitor trends.
      </div>
    );
  }

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
          <YAxis
            reversed={metric === "AVERAGE POSITION"}
            allowDecimals={metric !== "COMPETITOR DISTRIBUTION"}
            tick={{ fontSize: 10, fill: "#64748b" }}
            width={40}
          />
          <Tooltip contentStyle={{ fontSize: 11 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
