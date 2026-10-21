'use client';

import React, { useState } from 'react';

// ============================================================================
// 1. SEARCH VISIBILITY TREND CHART
// ============================================================================
export interface SearchVisibilityChartProps {
  domain?: string;
  periodText?: string;
}

export function SearchVisibilityChart({
  domain = 'teams.com',
  periodText = 'Sep 28 2026 - Oct 04 2026',
}: SearchVisibilityChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // 7 dates corresponding to the period Sep 28 - Oct 04
  const dates = ['Sep 28', 'Sep 29', 'Sep 30', 'Oct 01', 'Oct 02', 'Oct 03', 'Oct 04'];

  // Exact data lines :
  // Google USA (#ab5e1a) - stays very high around 96 -> 95
  // Bing USA (#7b38d8) - dips from 95 down to ~78 then recovers to 92
  // Google UK (#ea3966) - dips from 91 down to ~74 then recovers to 90
  // Average for all (#10b981) - dashed line dipping down to ~69 then recovers to 88
  const seriesData = [
    {
      id: 'google-usa',
      name: 'Google USA',
      color: '#AB5E1A',
      strokeWidth: 2.5,
      dashed: false,
      values: [96.0, 95.8, 95.2, 94.8, 94.6, 94.9, 95.0],
    },
    {
      id: 'bing-usa',
      name: 'Bing USA (English)',
      color: '#7B38D8',
      strokeWidth: 2,
      dashed: false,
      values: [95.0, 93.4, 88.5, 81.2, 79.6, 88.4, 92.0],
    },
    {
      id: 'google-uk',
      name: 'Google United Kingdom',
      color: '#EA3966',
      strokeWidth: 2,
      dashed: false,
      values: [91.0, 89.2, 84.1, 76.8, 75.2, 85.3, 90.0],
    },
    {
      id: 'avg-all',
      name: 'Average for all',
      color: '#10B981',
      strokeWidth: 2,
      dashed: true,
      values: [89.0, 87.5, 81.0, 72.4, 71.0, 82.1, 88.0],
    },
  ];

  // SVG dimensions
  const svgWidth = 716;
  const svgHeight = 180;
  const paddingLeft = 36;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  // Scale Y from 60 to 100
  const minY = 65;
  const maxY = 100;
  const getY = (val: number) => {
    const ratio = (val - minY) / (maxY - minY);
    return paddingTop + plotHeight * (1 - ratio);
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (dates.length - 1)) * plotWidth;
  };

  // Convert array of values to smooth cubic bezier SVG path
  const makeSmoothPath = (values: number[]) => {
    const points = values.map((v, i) => ({ x: getX(i), y: getY(v) }));
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  return (
    <div className="rb-a-chart rb-cc overflow-hidden w-full border border-[#E6E8EE] rounded-sm bg-white p-3 space-y-2 select-none">
      <div className="relative overflow-hidden w-full h-[180px]">
        <svg
          version="1.1"
          className="highcharts-root w-full h-full"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Subtle animated path styles */}
          <style>{`
            @keyframes drawPath {
              from { stroke-dashoffset: 1000; }
              to { stroke-dashoffset: 0; }
            }
            .animate-chart-line {
              stroke-dasharray: 1000;
              stroke-dashoffset: 0;
              animation: drawPath 1.2s ease-out forwards;
            }
          `}</style>

          {/* Plot Background */}
          <rect fill="#ffffff" x="0" y="0" width={svgWidth} height={svgHeight} />

          {/* Horizontal Grid lines (65, 75, 85, 95, 100) */}
          {[65, 75, 85, 95, 100].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#F1F3F5"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Vertical Grid lines */}
          {dates.map((_, i) => {
            const x = getX(i);
            return (
              <line
                key={i}
                x1={x}
                y1={paddingTop}
                x2={x}
                y2={paddingTop + plotHeight}
                stroke="#F8FAFC"
                strokeWidth="1"
              />
            );
          })}

          {/* Series Curves */}
          {seriesData.map((s) => (
            <g key={s.id} className="highcharts-series">
              <path
                d={makeSmoothPath(s.values)}
                fill="none"
                stroke={s.color}
                strokeWidth={s.strokeWidth}
                strokeDasharray={s.dashed ? '4,4' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-chart-line transition-all duration-300"
              />
            </g>
          ))}

          {/* Point Labels: (96, 95 at start; 95, 92 at end) */}
          {/* Start Points */}
          <g className="highcharts-data-labels" fontSize="11" fontWeight="bold">
            {/* 96 Google USA */}
            <g transform={`translate(${getX(0) + 4}, ${getY(96) - 5})`}>
              <text fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3px" strokeLinejoin="round">96</text>
              <text fill="#171B24">96</text>
            </g>
            {/* 95 Bing USA */}
            <g transform={`translate(${getX(0) + 4}, ${getY(95) + 12})`}>
              <text fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3px" strokeLinejoin="round">95</text>
              <text fill="#171B24">95</text>
            </g>

            {/* End Points */}
            {/* 95 Google USA */}
            <g transform={`translate(${getX(dates.length - 1) - 22}, ${getY(95) - 5})`}>
              <text fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3px" strokeLinejoin="round">95</text>
              <text fill="#171B24">95</text>
            </g>
            {/* 92 Bing USA */}
            <g transform={`translate(${getX(dates.length - 1) - 22}, ${getY(92) + 12})`}>
              <text fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3px" strokeLinejoin="round">92</text>
              <text fill="#171B24">92</text>
            </g>
          </g>

          {/* Transparent Hover Columns for Interactive Tooltip */}
          {dates.map((d, i) => {
            const x = getX(i);
            const colWidth = plotWidth / (dates.length - 1);
            return (
              <rect
                key={d}
                x={x - colWidth / 2}
                y={paddingTop}
                width={colWidth}
                height={plotHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}

          {/* Crosshair & Active Point on Hover */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={paddingTop + plotHeight}
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              {seriesData.map((s) => (
                <circle
                  key={s.id}
                  cx={getX(hoverIndex)}
                  cy={getY(s.values[hoverIndex])}
                  r="4.5"
                  fill={s.color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              ))}
            </g>
          )}

          {/* X Axis Labels */}
          <g fontSize="10" fill="#79797B">
            <text x={getX(0)} y={svgHeight - 10} textAnchor="start">
              Sep 28 2026
            </text>
            <text x={getX(dates.length - 1)} y={svgHeight - 10} textAnchor="end">
              Oct 04 2026
            </text>
          </g>
        </svg>

        {/* Floating Tooltip matching SE Ranking */}
        {hoverIndex !== null && (
          <div
            className="absolute top-2 z-40 bg-[#1E293B] text-white text-[11px] rounded px-3 py-2 shadow-xl pointer-events-none transform -translate-x-1/2 transition-all duration-75 space-y-1"
            style={{
              left: `${(getX(hoverIndex) / svgWidth) * 100}%`,
            }}
          >
            <div className="font-bold text-gray-200 border-b border-gray-600/60 pb-1 mb-1">
              {dates[hoverIndex]}, 2026
            </div>
            {seriesData.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 text-[10.5px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-300">{s.name}</span>
                </span>
                <span className="font-semibold text-white">{s.values[hoverIndex]}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart Legend :1 */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#171B24] pt-1">
        {seriesData.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 cursor-default hover:opacity-80 transition-opacity">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: s.color,
                border: s.dashed ? '1px dashed #10B981' : undefined,
              }}
            />
            <span className="font-medium text-[#232A32]">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 2. AVERAGE POSITION TREND CHART
// ============================================================================
export interface AvgPositionChartProps {
  domain?: string;
  periodText?: string;
}

export function AvgPositionChart({
  domain = 'teams.com',
  periodText = 'Sep 28 2026 - Oct 04 2026',
}: AvgPositionChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const dates = ['Sep 28', 'Sep 29', 'Sep 30', 'Oct 01', 'Oct 02', 'Oct 03', 'Oct 04'];

  // Y axis is inverted: Rank 1 is top, Rank 50 is bottom
  // Google USA (#ab5e1a): steady line at rank 4 across all dates!
  // Bing USA (#7b38d8): starts at 27, dips down to 35 around Oct 01, surges to 11 on Oct 04!
  // Google UK (#ea3966): starts at 29, dips down to 42, surges to 14 on Oct 04!
  // Average for all (#10b981): starts at 30, dips to 45, surges to 12 on Oct 04!
  const seriesData = [
    {
      id: 'google-usa',
      name: 'Google USA',
      color: '#AB5E1A',
      strokeWidth: 2.5,
      dashed: false,
      values: [4.0, 4.0, 4.2, 4.3, 4.1, 4.0, 4.0],
    },
    {
      id: 'bing-usa',
      name: 'Bing USA (English)',
      color: '#7B38D8',
      strokeWidth: 2,
      dashed: false,
      values: [27.0, 28.5, 32.0, 35.4, 34.0, 22.0, 11.0],
    },
    {
      id: 'google-uk',
      name: 'Google United Kingdom',
      color: '#EA3966',
      strokeWidth: 2,
      dashed: false,
      values: [29.0, 31.0, 36.5, 42.0, 40.5, 26.5, 14.0],
    },
    {
      id: 'avg-all',
      name: 'Average for all',
      color: '#10B981',
      strokeWidth: 2,
      dashed: false,
      values: [30.0, 33.0, 39.0, 46.0, 44.0, 27.0, 12.0],
    },
  ];

  const svgWidth = 716;
  const svgHeight = 180;
  const paddingLeft = 36;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  // Inverted Y: 1 at top, 50 at bottom
  const minY = 1;
  const maxY = 50;
  const getY = (rank: number) => {
    const ratio = (rank - minY) / (maxY - minY);
    return paddingTop + plotHeight * ratio;
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (dates.length - 1)) * plotWidth;
  };

  const makeSmoothPath = (values: number[]) => {
    const points = values.map((v, i) => ({ x: getX(i), y: getY(v) }));
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  return (
    <div className="rb-a-chart rb-cc overflow-hidden w-full border border-[#E6E8EE] rounded-sm bg-white p-3 space-y-2 select-none">
      <div className="relative overflow-hidden w-full h-[180px]">
        <svg
          version="1.1"
          className="highcharts-root w-full h-full"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <rect fill="#ffffff" x="0" y="0" width={svgWidth} height={svgHeight} />

          {/* Grid lines */}
          {[1, 10, 20, 30, 40, 50].map((val) => {
            const y = getY(val);
            return (
              <line
                key={val}
                x1={paddingLeft}
                y1={y}
                x2={svgWidth - paddingRight}
                y2={y}
                stroke="#F1F3F5"
                strokeWidth="1"
              />
            );
          })}

          {/* Series Curves */}
          {seriesData.map((s) => (
            <g key={s.id} className="highcharts-series">
              <path
                d={makeSmoothPath(s.values)}
                fill="none"
                stroke={s.color}
                strokeWidth={s.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-chart-line transition-all duration-300"
              />
            </g>
          ))}

          {/* Point Labels:
              Start: 4 (Google USA), 27 (Bing USA)
              End: 4, 11 (Bing USA), 12 (Average for all), 14 (Google UK)
          */}
          <g className="highcharts-data-labels" fontSize="11" fontWeight="bold">
            {/* Start 4 */}
            <g transform={`translate(${getX(0) + 4}, ${getY(4) - 6})`}>
              <text fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3px" strokeLinejoin="round">4</text>
              <text fill="#171B24">4</text>
            </g>
            {/* Start 27 */}
            <g transform={`translate(${getX(0) + 4}, ${getY(27) - 6})`}>
              <text fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3px" strokeLinejoin="round">27</text>
              <text fill="#171B24">27</text>
            </g>

            {/* End 4 */}
            <g transform={`translate(${getX(dates.length - 1) - 18}, ${getY(4) - 6})`}>
              <text fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3px" strokeLinejoin="round">4</text>
              <text fill="#171B24">4</text>
            </g>
            {/* End 11 */}
            <g transform={`translate(${getX(dates.length - 1) - 20}, ${getY(11) - 6})`}>
              <text fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3px" strokeLinejoin="round">11</text>
              <text fill="#171B24">11</text>
            </g>
            {/* End 12 */}
            <g transform={`translate(${getX(dates.length - 1) - 20}, ${getY(12) + 12})`}>
              <text fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3px" strokeLinejoin="round">12</text>
              <text fill="#171B24">12</text>
            </g>
            {/* End 14 */}
            <g transform={`translate(${getX(dates.length - 1) - 20}, ${getY(14) + 24})`}>
              <text fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3px" strokeLinejoin="round">14</text>
              <text fill="#171B24">14</text>
            </g>
          </g>

          {/* Hover interactive columns */}
          {dates.map((d, i) => {
            const x = getX(i);
            const colWidth = plotWidth / (dates.length - 1);
            return (
              <rect
                key={d}
                x={x - colWidth / 2}
                y={paddingTop}
                width={colWidth}
                height={plotHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}

          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={paddingTop + plotHeight}
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              {seriesData.map((s) => (
                <circle
                  key={s.id}
                  cx={getX(hoverIndex)}
                  cy={getY(s.values[hoverIndex])}
                  r="4.5"
                  fill={s.color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              ))}
            </g>
          )}

          {/* X Axis Labels */}
          <g fontSize="10" fill="#79797B">
            <text x={getX(0)} y={svgHeight - 10} textAnchor="start">
              Sep 28 2026
            </text>
            <text x={getX(dates.length - 1)} y={svgHeight - 10} textAnchor="end">
              Oct 04 2026
            </text>
          </g>
        </svg>

        {hoverIndex !== null && (
          <div
            className="absolute top-2 z-40 bg-[#1E293B] text-white text-[11px] rounded px-3 py-2 shadow-xl pointer-events-none transform -translate-x-1/2 transition-all duration-75 space-y-1"
            style={{
              left: `${(getX(hoverIndex) / svgWidth) * 100}%`,
            }}
          >
            <div className="font-bold text-gray-200 border-b border-gray-600/60 pb-1 mb-1">
              {dates[hoverIndex]}, 2026
            </div>
            {seriesData.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 text-[10.5px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-300">{s.name}</span>
                </span>
                <span className="font-semibold text-white">#{s.values[hoverIndex]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#171B24] pt-1">
        {seriesData.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 cursor-default hover:opacity-80 transition-opacity">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="font-medium text-[#232A32]">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 3. TRAFFIC FORECAST TREND CHART
// ============================================================================
export interface TrafficForecastChartProps {
  domain?: string;
  periodText?: string;
}

export function TrafficForecastChart({
  domain = 'teams.com',
  periodText = 'Sep 28 2026 - Oct 04 2026',
}: TrafficForecastChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const dates = ['Sep 28', 'Sep 29', 'Sep 30', 'Oct 01', 'Oct 02', 'Oct 03', 'Oct 04'];

  // Exact Traffic :
  // Google UK (#ea3966): starts at 4,370,875, stays level, then sharp spike to 9,201,464, and 8,510,900 at end!
  // Bing USA (#7b38d8): starts around 3.8M, spikes to 7.8M, finishes ~6.5M
  // Google USA (#ab5e1a): low steady curve around 1.5M, minor bump to 3.8M at end
  const seriesData = [
    {
      id: 'google-uk',
      name: 'Google United Kingdom',
      color: '#EA3966',
      strokeWidth: 2.5,
      values: [4370875, 4350000, 4320000, 4280000, 4300000, 9201464, 8510900],
    },
    {
      id: 'bing-usa',
      name: 'Bing USA (English)',
      color: '#7B38D8',
      strokeWidth: 2,
      values: [3850000, 3810000, 3750000, 3680000, 3700000, 7820000, 6540000],
    },
    {
      id: 'google-usa',
      name: 'Google USA',
      color: '#AB5E1A',
      strokeWidth: 2,
      values: [1450000, 1420000, 1400000, 1380000, 1390000, 3650000, 2450000],
    },
  ];

  const svgWidth = 716;
  const svgHeight = 180;
  const paddingLeft = 36;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const minY = 500000;
  const maxY = 10000000;
  const getY = (val: number) => {
    const ratio = (val - minY) / (maxY - minY);
    return paddingTop + plotHeight * (1 - ratio);
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (dates.length - 1)) * plotWidth;
  };

  const makeSmoothPath = (values: number[]) => {
    const points = values.map((v, i) => ({ x: getX(i), y: getY(v) }));
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const formatTrafficNum = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="rb-a-chart rb-cc overflow-hidden w-full border border-[#E6E8EE] rounded-sm bg-white p-3 space-y-2 select-none">
      <div className="relative overflow-hidden w-full h-[180px]">
        <svg
          version="1.1"
          className="highcharts-root w-full h-full"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <rect fill="#ffffff" x="0" y="0" width={svgWidth} height={svgHeight} />

          {/* Grid lines */}
          {[1000000, 3000000, 5000000, 7000000, 9000000].map((val) => {
            const y = getY(val);
            return (
              <line
                key={val}
                x1={paddingLeft}
                y1={y}
                x2={svgWidth - paddingRight}
                y2={y}
                stroke="#F1F3F5"
                strokeWidth="1"
              />
            );
          })}

          {/* Series Curves */}
          {seriesData.map((s) => (
            <g key={s.id} className="highcharts-series">
              <path
                d={makeSmoothPath(s.values)}
                fill="none"
                stroke={s.color}
                strokeWidth={s.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-chart-line transition-all duration-300"
              />
            </g>
          ))}

          {/* Point Labels:
              Start: 4,370,875
              Spike peak: 9,201,464
              End: 8,510,900
          */}
          <g className="highcharts-data-labels" fontSize="10" fontWeight="bold">
            {/* Start 4,370,875 */}
            <g transform={`translate(${getX(0) + 4}, ${getY(4370875) - 6})`}>
              <text fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3px" strokeLinejoin="round">4,370,875</text>
              <text fill="#171B24">4,370,875</text>
            </g>

            {/* Peak 9,201,464 */}
            <g transform={`translate(${getX(5) - 30}, ${getY(9201464) - 6})`}>
              <text fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3px" strokeLinejoin="round">9,201,464</text>
              <text fill="#171B24">9,201,464</text>
            </g>

            {/* End 8,510,900 */}
            <g transform={`translate(${getX(6) - 45}, ${getY(8510900) - 6})`}>
              <text fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3px" strokeLinejoin="round">8,510,900</text>
              <text fill="#171B24">8,510,900</text>
            </g>
          </g>

          {/* Hover interactive columns */}
          {dates.map((d, i) => {
            const x = getX(i);
            const colWidth = plotWidth / (dates.length - 1);
            return (
              <rect
                key={d}
                x={x - colWidth / 2}
                y={paddingTop}
                width={colWidth}
                height={plotHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}

          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={paddingTop + plotHeight}
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              {seriesData.map((s) => (
                <circle
                  key={s.id}
                  cx={getX(hoverIndex)}
                  cy={getY(s.values[hoverIndex])}
                  r="4.5"
                  fill={s.color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              ))}
            </g>
          )}

          {/* X Axis Labels */}
          <g fontSize="10" fill="#79797B">
            <text x={getX(0)} y={svgHeight - 10} textAnchor="start">
              Sep 28 2026
            </text>
            <text x={getX(dates.length - 1)} y={svgHeight - 10} textAnchor="end">
              Oct 04 2026
            </text>
          </g>
        </svg>

        {hoverIndex !== null && (
          <div
            className="absolute top-2 z-40 bg-[#1E293B] text-white text-[11px] rounded px-3 py-2 shadow-xl pointer-events-none transform -translate-x-1/2 transition-all duration-75 space-y-1"
            style={{
              left: `${(getX(hoverIndex) / svgWidth) * 100}%`,
            }}
          >
            <div className="font-bold text-gray-200 border-b border-gray-600/60 pb-1 mb-1">
              {dates[hoverIndex]}, 2026
            </div>
            {seriesData.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 text-[10.5px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-300">{s.name}</span>
                </span>
                <span className="font-semibold text-white">{formatTrafficNum(s.values[hoverIndex])} visits</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#171B24] pt-1">
        {seriesData.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 cursor-default hover:opacity-80 transition-opacity">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="font-medium text-[#232A32]">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
