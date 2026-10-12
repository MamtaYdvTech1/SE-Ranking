"use client";

import React, { useState, useRef, useEffect } from "react";
import { MetricType, RankingTrendPoint } from "../../lib/rankingsTypes";
import { DEFAULT_SELECTED_CHART_NOTES } from "@/hooks/useRankingSettings";
import { Alert, Button, Skeleton } from "@internal-seo/ui";

export interface ChartTimelineNote {
  id: string;
  date?: string;
  pointIndex?: number;
  category: "Keyword note" | "Project note" | "Google update" | "Important update" | "Keywords added" | string;
  title: string;
  description?: string;
}

export const DEFAULT_TIMELINE_NOTES: ChartTimelineNote[] = [
  {
    id: "note-google-core",
    category: "Google update",
    pointIndex: 0,
    title: "Google Core Algorithm Update",
    description: "Broad core algorithm refresh rolled out globally across desktop & mobile SERPs.",
  },
  {
    id: "note-kw-add",
    category: "Keywords added",
    pointIndex: 1,
    title: "Keywords Added (+25)",
    description: "Added 25 new primary transactional keywords to active tracking portfolio.",
  },
  {
    id: "note-proj-revamp",
    category: "Project note",
    pointIndex: 2,
    title: "Project Migration Deployed",
    description: "Next.js migration and structured schema data deployed to production.",
  },
  {
    id: "note-serp-shift",
    category: "Important update",
    pointIndex: 3,
    title: "Important SERP Layout Shift",
    description: "Google AI Overviews expanded in target location search results.",
  },
  {
    id: "note-kw-target",
    category: "Keyword note",
    pointIndex: 4,
    title: "Target URL Canonical Fixed",
    description: "Resolved duplicate canonical tag on enterprise product landing page.",
  },
];

export function getNoteCategorySymbol(cat: string): string {
  switch (cat) {
    case "Keyword note":
      return "💬";
    case "Project note":
      return "🗩";
    case "Google update":
      return "🇬";
    case "Important update":
      return "⚠️";
    case "Keywords added":
      return "➕";
    default:
      return "📌";
  }
}

export interface RankingTrendChartProps {
  data: RankingTrendPoint[];
  metric: MetricType;
  metricName: string;
  domain: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  selectedChartNotes?: string[];
  notes?: ChartTimelineNote[];
  projectId?: string;
}

export function RankingTrendChart({
  data,
  metric,
  metricName,
  domain,
  isLoading = false,
  error = null,
  onRetry,
  selectedChartNotes,
  notes,
  projectId,
}: RankingTrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoveredNote, setHoveredNote] = useState<ChartTimelineNote | null>(null);
  const [persistedChartNotes, setPersistedChartNotes] = useState<string[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!projectId || typeof window === "undefined" || !window.localStorage) return;
    try {
      const raw = localStorage.getItem(`ranking_settings_${projectId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.selectedChartNotes) {
          setPersistedChartNotes(parsed.selectedChartNotes);
        }
      }
    } catch {
      // ignore
    }
  }, [projectId]);

  const activeSelectedNotes =
    selectedChartNotes !== undefined
      ? selectedChartNotes
      : persistedChartNotes !== null
      ? persistedChartNotes
      : DEFAULT_SELECTED_CHART_NOTES;

  const allNotes = notes || DEFAULT_TIMELINE_NOTES;
  const filteredTimelineNotes = allNotes.filter((note) =>
    activeSelectedNotes.includes(note.category)
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-44 w-full rounded-lg" />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
        <Alert variant="error">
          <div className="flex flex-col items-center gap-3 py-2">
            <span className="font-semibold text-sm">{error}</span>
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                Retry Loading Chart Data
              </Button>
            )}
          </div>
        </Alert>
      </div>
    );
  }

  // Empty State
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No ranking data recorded</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No historical position snapshots match the selected time range or metric.
        </p>
      </div>
    );
  }

  // Dimensions & Coordinates
  const width = 900;
  const height = 180;
  const padding = { top: 20, right: 25, bottom: 30, left: 55 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);

  // Buffer scale
  const isPos = metric === "average_position";
  // For average position, lower number (better rank) is higher on screen
  const minVal = Math.max(1, Math.floor(rawMin - 2));
  const maxVal = Math.ceil(rawMax + 2);
  const valSpan = maxVal - minVal || 1;

  const points = data.map((d, index) => {
    const x =
      data.length > 1
        ? padding.left + (index / (data.length - 1)) * plotWidth
        : padding.left + plotWidth / 2;

    const norm = (d.value - minVal) / valSpan;
    // If average position, invert so top position is visually high
    const y = isPos
      ? padding.top + norm * plotHeight
      : padding.top + (1 - norm) * plotHeight;

    return { x, y, ...d };
  });

  // SVG Path generator
  let pathD = "";
  if (points.length === 1) {
    pathD = `M ${padding.left} ${points[0].y} L ${width - padding.right} ${points[0].y}`;
  } else {
    pathD = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");
  }

  // Y-axis grid ticks (3 ticks)
  const yTicks = [
    { val: minVal, y: isPos ? padding.top : padding.top + plotHeight },
    {
      val: Math.round((minVal + maxVal) / 2),
      y: padding.top + plotHeight / 2,
    },
    { val: maxVal, y: isPos ? padding.top + plotHeight : padding.top },
  ];

  // Mouse interactivity
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;

    let closestIdx = 0;
    let minDist = Infinity;
    points.forEach((pt, i) => {
      const dist = Math.abs(pt.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    });
    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4 select-none relative"
    >
      {/* Chart Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Vertical Y-Axis Label */}
          <text
            x={-height / 2}
            y="18"
            transform="rotate(-90)"
            textAnchor="middle"
            className="fill-slate-400 text-[10px] uppercase font-bold tracking-wider"
          >
            {metricName}
          </text>

          {/* Horizontal Gridlines & Y labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px] font-medium"
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* Trend Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={i === hoverIndex ? 5 : 3}
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth="2"
              className="transition-all duration-150"
            />
          ))}

          {/* Active Hover Guide Line */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={height - padding.bottom}
                stroke="#3b82f6"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="6"
                fill="#1e40af"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Filtered Timeline Note Markers */}
          {filteredTimelineNotes.map((note) => {
            const targetPt = note.date
              ? points.find((p) => p.date === note.date) || points[0]
              : points[Math.min(points.length - 1, Math.max(0, note.pointIndex ?? 0))];

            if (!targetPt) return null;

            const isHovered = hoveredNote?.id === note.id;

            return (
              <g
                key={note.id}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setHoveredNote(note)}
                onMouseLeave={() => setHoveredNote(null)}
              >
                <line
                  x1={targetPt.x}
                  y1={height - padding.bottom - 4}
                  x2={targetPt.x}
                  y2={height - 24}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={targetPt.x}
                  cy={height - 24}
                  r={isHovered ? "8" : "6.5"}
                  fill="#ffffff"
                  stroke={isHovered ? "#2563eb" : "#94a3b8"}
                  strokeWidth={isHovered ? "2" : "1.5"}
                />
                <text
                  x={targetPt.x}
                  y={height - 21}
                  textAnchor="middle"
                  className="text-[8px] select-none"
                >
                  {getNoteCategorySymbol(note.category)}
                </text>
              </g>
            );
          })}

          {/* X-Axis Date Labels (First, Middle, Last) */}
          {points.length > 0 && (
            <>
              <text
                x={points[0].x}
                y={height - 10}
                textAnchor="start"
                className="fill-slate-400 text-[10px] font-medium"
              >
                {points[0].label}
              </text>
              {points.length > 2 && (
                <text
                  x={points[Math.floor(points.length / 2)].x}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px] font-medium"
                >
                  {points[Math.floor(points.length / 2)].label}
                </text>
              )}
              {points.length > 1 && (
                <text
                  x={points[points.length - 1].x}
                  y={height - 10}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-medium"
                >
                  {points[points.length - 1].label}
                </text>
              )}
            </>
          )}
        </svg>

        {/* Hovered Timeline Note Tooltip */}
        {hoveredNote && (
          <div
            className="absolute pointer-events-none transition-all duration-75 bg-slate-900 text-white rounded-lg shadow-xl p-3 text-left z-30 max-w-xs"
            style={{
              left: `${Math.min(75, Math.max(15, (((points[Math.min(points.length - 1, Math.max(0, hoveredNote.pointIndex ?? 0))]?.x || width / 2) / width) * 100)))}%`,
              top: `${height - 35}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400">
              <span>{getNoteCategorySymbol(hoveredNote.category)}</span>
              <span>{hoveredNote.category}</span>
            </div>
            <div className="text-xs font-semibold text-slate-100 mt-1">
              {hoveredNote.title}
            </div>
            {hoveredNote.description && (
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {hoveredNote.description}
              </p>
            )}
          </div>
        )}

        {/* Floating Tooltip matching Reference Screenshot */}
        {activePoint && !hoveredNote && (
          <div
            className="absolute pointer-events-none transition-all duration-75 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-xl p-3 text-left z-20"
            style={{
              left: `${Math.min(75, Math.max(15, (activePoint.x / width) * 100))}%`,
              top: `${Math.min(60, Math.max(10, (activePoint.y / height) * 100))}%`,
              transform: "translate(-50%, -110%)",
              minWidth: "150px",
            }}
          >
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {activePoint.label}
            </div>
            <div className="text-[11px] font-bold text-slate-800 uppercase mt-0.5">
              {metricName}
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0"></span>
              <span className="font-semibold text-slate-800 truncate">{domain}:</span>
              <span className="font-bold text-slate-900 ml-auto">{activePoint.value}</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend below chart */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{domain}</span>
        </div>

        {/* Timeline Notes Active Status */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Timeline notes:</span>
          {filteredTimelineNotes.length > 0 ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from(new Set(filteredTimelineNotes.map((n) => n.category))).map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  <span>{getNoteCategorySymbol(cat)}</span>
                  <span>{cat}</span>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic">No notes displayed</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default RankingTrendChart;
