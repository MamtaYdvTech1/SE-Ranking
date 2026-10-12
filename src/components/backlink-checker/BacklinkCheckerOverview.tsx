"use client";

import React, { useState } from "react";
import {
  MOCK_TIME_SERIES,
  MOCK_TOP_ANCHORS,
  MOCK_DOMAIN_TRUST_DISTRIBUTION,
  MOCK_COUNTRY_DISTRIBUTION,
  TimeSeriesPoint,
} from "./mockBacklinkData";
import { CountryFlag } from "@/components/ui/CountryFlag";

interface BacklinkCheckerOverviewProps {
  projectDomain: string;
  onNavigateTab: (tab: string) => void;
}

export function BacklinkCheckerOverview({
  projectDomain,
  onNavigateTab,
}: BacklinkCheckerOverviewProps) {
  // Periods
  const [activePeriod, setActivePeriod] = useState<"7D" | "1M" | "3M" | "6M" | "12M">("3M");
  const [groupBy, setGroupBy] = useState<"WEEKS" | "DAYS" | "MONTHS">("WEEKS");

  // Metric series checkboxes for Top Dual Chart
  const [visibleSeries, setVisibleSeries] = useState({
    referringDomains: true,
    backlinks: true,
    domainTrust: false,
    pageTrust: false,
    organicTraffic: false,
  });

  // Hover states for top dual chart
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Hover states for bar charts
  const [hoverRefDomainIndex, setHoverRefDomainIndex] = useState<number | null>(null);
  const [hoverBacklinkIndex, setHoverBacklinkIndex] = useState<number | null>(null);

  // Time series data
  const data = MOCK_TIME_SERIES;

  // Chart dimensions for top chart
  const topWidth = 900;
  const topHeight = 220;
  const topPadding = { top: 20, right: 50, bottom: 30, left: 45 };
  const innerTopWidth = topWidth - topPadding.left - topPadding.right;
  const innerTopHeight = topHeight - topPadding.top - topPadding.bottom;

  // Scales for dual chart
  // Left axis (Ref domains): 150 to 270
  const minRef = 150;
  const maxRef = 270;
  // Right axis (Backlinks): 240 to 360
  const minBacklinks = 240;
  const maxBacklinks = 360;

  const getX = (idx: number) =>
    topPadding.left + (idx / (data.length - 1)) * innerTopWidth;

  const getYRef = (val: number) =>
    topPadding.top +
    innerTopHeight -
    ((val - minRef) / (maxRef - minRef)) * innerTopHeight;

  const getYBacklink = (val: number) =>
    topPadding.top +
    innerTopHeight -
    ((val - minBacklinks) / (maxBacklinks - minBacklinks)) * innerTopHeight;

  // Generate SVG path strings
  const refPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getYRef(d.referringDomains).toFixed(1)}`)
    .join(" ");

  const backlinksPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getYBacklink(d.backlinks).toFixed(1)}`)
    .join(" ");

  // Domain Trust (scaled 0-100 into height)
  const getYDT = (val: number) =>
    topPadding.top + innerTopHeight - (val / 100) * innerTopHeight;
  const dtPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getYDT(d.domainTrust).toFixed(1)}`)
    .join(" ");

  // Page Trust (scaled 0-100)
  const ptPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getYDT(d.pageTrust).toFixed(1)}`)
    .join(" ");

  // Organic Traffic (scaled 1000-1600)
  const getYTraffic = (val: number) =>
    topPadding.top + innerTopHeight - ((val - 1000) / 600) * innerTopHeight;
  const trafficPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getYTraffic(d.organicTraffic).toFixed(1)}`)
    .join(" ");

  // Bar charts dimensions
  const barChartWidth = 440;
  const barChartHeight = 160;
  const barPadding = { top: 25, right: 20, bottom: 25, left: 35 };
  const innerBarWidth = barChartWidth - barPadding.left - barPadding.right;
  const innerBarHeight = barChartHeight - barPadding.top - barPadding.bottom;
  const zeroY = barPadding.top + (innerBarHeight / 3) * 1; // 0 baseline near top-middle

  // Max bounds: -20 to +10 for ref domains, -20 to +20 for backlinks
  const getRefDomainBarY = (val: number) => {
    // scale from -20 to +10
    // range is 30 units
    const fraction = (10 - val) / 30;
    return barPadding.top + fraction * innerBarHeight;
  };

  const getBacklinkBarY = (val: number) => {
    // scale from -20 to +20 (range 40)
    const fraction = (20 - val) / 40;
    return barPadding.top + fraction * innerBarHeight;
  };

  const currentHoverItem: TimeSeriesPoint | null =
    hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="space-y-6">
      {/* 1. TOP DUAL METRIC CHART */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Total referring domains
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Total backlinks
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Period Filters */}
            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                PERIOD:
              </span>
              {(["7D", "1M", "3M", "6M", "12M"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setActivePeriod(period)}
                  className={`px-2 py-1 transition relative ${
                    activePeriod === period
                      ? "text-blue-600 font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {period}
                  {activePeriod === period && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Group By Selector */}
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                GROUP BY:
              </span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="DAYS">DAYS</option>
                <option value="WEEKS">WEEKS</option>
                <option value="MONTHS">MONTHS</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dual Axis Chart Canvas */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${topWidth} ${topHeight}`}
            className="w-full h-56 select-none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac, idx) => {
              const y = topPadding.top + frac * innerTopHeight;
              const refVal = Math.round(maxRef - frac * (maxRef - minRef));
              const blVal = Math.round(maxBacklinks - frac * (maxBacklinks - minBacklinks));

              return (
                <g key={idx}>
                  <line
                    x1={topPadding.left}
                    y1={y}
                    x2={topWidth - topPadding.right}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-100 dark:text-slate-800/80"
                    strokeDasharray={idx === 4 ? "none" : "2 2"}
                    strokeWidth="1"
                  />
                  {/* Left Axis label (Ref Domains) */}
                  <text
                    x={topPadding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-blue-600 dark:fill-blue-400"
                  >
                    {refVal}
                  </text>
                  {/* Right Axis label (Backlinks) */}
                  <text
                    x={topWidth - topPadding.right + 8}
                    y={y + 3}
                    textAnchor="start"
                    className="text-[10px] font-mono fill-emerald-600 dark:fill-emerald-400"
                  >
                    {blVal}
                  </text>
                </g>
              );
            })}

            {/* X-axis date labels */}
            {data.map((d, i) => {
              const x = getX(i);
              return (
                <text
                  key={i}
                  x={x}
                  y={topHeight - 8}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-slate-400"
                >
                  {d.date}
                </text>
              );
            })}

            {/* Lines */}
            {visibleSeries.referringDomains && (
              <path
                d={refPath}
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {visibleSeries.backlinks && (
              <path
                d={backlinksPath}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {visibleSeries.domainTrust && (
              <path
                d={dtPath}
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            )}

            {visibleSeries.pageTrust && (
              <path
                d={ptPath}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeDasharray="3 3"
                strokeLinecap="round"
              />
            )}

            {visibleSeries.organicTraffic && (
              <path
                d={trafficPath}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}

            {/* Interactive hover tracking */}
            {data.map((_, i) => {
              const x = getX(i);
              const colWidth = innerTopWidth / data.length;
              return (
                <rect
                  key={i}
                  x={x - colWidth / 2}
                  y={topPadding.top}
                  width={colWidth}
                  height={innerTopHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                />
              );
            })}

            {/* Hover guideline and dots */}
            {hoverIndex !== null && (
              <g>
                <line
                  x1={getX(hoverIndex)}
                  y1={topPadding.top}
                  x2={getX(hoverIndex)}
                  y2={topHeight - topPadding.bottom}
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {visibleSeries.referringDomains && (
                  <circle
                    cx={getX(hoverIndex)}
                    cy={getYRef(data[hoverIndex].referringDomains)}
                    r="4.5"
                    fill="#2563EB"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                )}
                {visibleSeries.backlinks && (
                  <circle
                    cx={getX(hoverIndex)}
                    cy={getYBacklink(data[hoverIndex].backlinks)}
                    r="4.5"
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                )}
              </g>
            )}
          </svg>

          {/* Hover Tooltip Popup */}
          {hoverIndex !== null && currentHoverItem && (
            <div
              className="absolute pointer-events-none bg-slate-900/90 text-white text-xs rounded-lg py-2 px-3 shadow-xl backdrop-blur-xs z-30 transition-all border border-slate-700"
              style={{
                left: `${Math.min(Math.max(getX(hoverIndex) - 70, 10), topWidth - 160)}px`,
                top: "15px",
              }}
            >
              <div className="font-semibold text-slate-300 border-b border-slate-700 pb-1 mb-1.5 flex justify-between gap-4">
                <span>{currentHoverItem.date}</span>
                <span className="text-[10px] text-slate-400">Weekly Summary</span>
              </div>
              <div className="space-y-1">
                {visibleSeries.referringDomains && (
                  <div className="flex items-center justify-between gap-3 text-blue-400">
                    <span className="text-[11px]">Ref. Domains:</span>
                    <span className="font-mono font-bold">{currentHoverItem.referringDomains}</span>
                  </div>
                )}
                {visibleSeries.backlinks && (
                  <div className="flex items-center justify-between gap-3 text-emerald-400">
                    <span className="text-[11px]">Backlinks:</span>
                    <span className="font-mono font-bold">{currentHoverItem.backlinks}</span>
                  </div>
                )}
                {visibleSeries.domainTrust && (
                  <div className="flex items-center justify-between gap-3 text-red-400">
                    <span className="text-[11px]">Domain Trust:</span>
                    <span className="font-mono font-bold">{currentHoverItem.domainTrust}</span>
                  </div>
                )}
                {visibleSeries.pageTrust && (
                  <div className="flex items-center justify-between gap-3 text-amber-400">
                    <span className="text-[11px]">Page Trust:</span>
                    <span className="font-mono font-bold">{currentHoverItem.pageTrust}</span>
                  </div>
                )}
                {visibleSeries.organicTraffic && (
                  <div className="flex items-center justify-between gap-3 text-purple-400">
                    <span className="text-[11px]">Organic Traffic:</span>
                    <span className="font-mono font-bold">{currentHoverItem.organicTraffic.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Checkbox Legend at bottom */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-6 text-xs select-none">
          <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={visibleSeries.referringDomains}
              onChange={(e) =>
                setVisibleSeries((prev) => ({ ...prev, referringDomains: e.target.checked }))
              }
              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
            />
            <span className="font-medium">Total referring domains</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={visibleSeries.backlinks}
              onChange={(e) =>
                setVisibleSeries((prev) => ({ ...prev, backlinks: e.target.checked }))
              }
              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
            />
            <span className="font-medium">Total backlinks</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={visibleSeries.domainTrust}
              onChange={(e) =>
                setVisibleSeries((prev) => ({ ...prev, domainTrust: e.target.checked }))
              }
              className="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500 border-slate-300 dark:border-slate-700"
            />
            <span className="font-medium">Domain Trust</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={visibleSeries.pageTrust}
              onChange={(e) =>
                setVisibleSeries((prev) => ({ ...prev, pageTrust: e.target.checked }))
              }
              className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
            />
            <span className="font-medium">Page Trust</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={visibleSeries.organicTraffic}
              onChange={(e) =>
                setVisibleSeries((prev) => ({ ...prev, organicTraffic: e.target.checked }))
              }
              className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 border-slate-300 dark:border-slate-700"
            />
            <span className="font-medium">Organic traffic</span>
          </label>
        </div>
      </div>

      {/* 2. TWO SIDE-BY-SIDE BI-DIRECTIONAL BAR CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: New & lost referring domains */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              New & lost referring domains
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1 font-medium">
                <span className="text-[10px] uppercase">PERIOD:</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold border-b border-blue-600">
                  3M
                </span>
              </div>
              <span className="text-[10px] uppercase">GROUP BY: WEEKS ▾</span>
            </div>
          </div>

          {/* SVG Bi-directional Bar Chart */}
          <div className="relative">
            <svg
              viewBox={`0 0 ${barChartWidth} ${barChartHeight}`}
              className="w-full h-44 select-none"
              onMouseLeave={() => setHoverRefDomainIndex(null)}
            >
              {/* Y-axis guidelines: 10, 0, -10, -20 */}
              {[10, 0, -10, -20].map((levelVal) => {
                const y = getRefDomainBarY(levelVal);
                return (
                  <g key={levelVal}>
                    <line
                      x1={barPadding.left}
                      y1={y}
                      x2={barChartWidth - barPadding.right}
                      y2={y}
                      stroke="currentColor"
                      className={
                        levelVal === 0
                          ? "text-slate-400 dark:text-slate-600"
                          : "text-slate-100 dark:text-slate-800"
                      }
                      strokeWidth={levelVal === 0 ? "1.5" : "1"}
                    />
                    <text
                      x={barPadding.left - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] font-mono fill-slate-400"
                    >
                      {levelVal}
                    </text>
                  </g>
                );
              })}

              {/* Zero baseline */}
              const baselineY = getRefDomainBarY(0);

              {/* Bars and Change Line */}
              {data.map((d, i) => {
                const step = innerBarWidth / data.length;
                const barX = barPadding.left + i * step + step * 0.15;
                const barW = step * 0.7;

                const zeroYPos = getRefDomainBarY(0);
                const newY = getRefDomainBarY(d.newRefDomains);
                const lostY = getRefDomainBarY(-d.lostRefDomains);

                const newBarH = Math.max(zeroYPos - newY, 2);
                const lostBarH = Math.max(lostY - zeroYPos, 2);

                return (
                  <g key={i}>
                    {/* Positive green bar (New) */}
                    <rect
                      x={barX}
                      y={newY}
                      width={barW}
                      height={newBarH}
                      fill="#10B981"
                      rx="1"
                    />
                    {/* Negative red bar (Lost) */}
                    <rect
                      x={barX}
                      y={zeroYPos}
                      width={barW}
                      height={lostBarH}
                      fill="#EF4444"
                      rx="1"
                    />
                    {/* Mouse hit area */}
                    <rect
                      x={barPadding.left + i * step}
                      y={barPadding.top}
                      width={step}
                      height={innerBarHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoverRefDomainIndex(i)}
                    />
                  </g>
                );
              })}

              {/* Change Trend Line (New - Lost) */}
              <path
                d={data
                  .map((d, i) => {
                    const step = innerBarWidth / data.length;
                    const cx = barPadding.left + i * step + step * 0.5;
                    const change = d.newRefDomains - d.lostRefDomains;
                    const cy = getRefDomainBarY(change);
                    return `${i === 0 ? "M" : "L"} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#334155"
                className="dark:stroke-slate-400"
                strokeWidth="1.5"
              />

              {/* Dots on change trend */}
              {data.map((d, i) => {
                const step = innerBarWidth / data.length;
                const cx = barPadding.left + i * step + step * 0.5;
                const change = d.newRefDomains - d.lostRefDomains;
                const cy = getRefDomainBarY(change);
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="2.5"
                    fill="#334155"
                    className="dark:fill-slate-300"
                  />
                );
              })}

              {/* X-axis labels */}
              {data.map((d, i) => {
                if (i % 2 !== 0 && i !== data.length - 1) return null;
                const step = innerBarWidth / data.length;
                const cx = barPadding.left + i * step + step * 0.5;
                return (
                  <text
                    key={i}
                    x={cx}
                    y={barChartHeight - 4}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-slate-400"
                    transform={`rotate(-25, ${cx}, ${barChartHeight - 4})`}
                  >
                    {d.date}
                  </text>
                );
              })}
            </svg>

            {/* Hover Tooltip for Ref Domains Bar Chart */}
            {hoverRefDomainIndex !== null && (
              <div className="absolute top-2 right-4 bg-slate-900 text-white text-[11px] rounded px-2.5 py-1.5 shadow-lg border border-slate-700 pointer-events-none z-20">
                <div className="font-semibold text-slate-300">
                  {data[hoverRefDomainIndex].date}
                </div>
                <div className="text-emerald-400 font-mono">
                  New: +{data[hoverRefDomainIndex].newRefDomains}
                </div>
                <div className="text-red-400 font-mono">
                  Lost: -{data[hoverRefDomainIndex].lostRefDomains}
                </div>
                <div className="text-slate-300 font-mono">
                  Change:{" "}
                  {data[hoverRefDomainIndex].newRefDomains -
                    data[hoverRefDomainIndex].lostRefDomains >
                  0
                    ? `+${
                        data[hoverRefDomainIndex].newRefDomains -
                        data[hoverRefDomainIndex].lostRefDomains
                      }`
                    : data[hoverRefDomainIndex].newRefDomains -
                      data[hoverRefDomainIndex].lostRefDomains}
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-2 flex items-center justify-start gap-4 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> New
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Lost
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600 dark:bg-slate-300"></span> Change
            </span>
          </div>
        </div>

        {/* Card 2: New & lost backlinks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              New & lost backlinks
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1 font-medium">
                <span className="text-[10px] uppercase">PERIOD:</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold border-b border-blue-600">
                  3M
                </span>
              </div>
              <span className="text-[10px] uppercase">GROUP BY: WEEKS ▾</span>
            </div>
          </div>

          {/* SVG Bi-directional Bar Chart */}
          <div className="relative">
            <svg
              viewBox={`0 0 ${barChartWidth} ${barChartHeight}`}
              className="w-full h-44 select-none"
              onMouseLeave={() => setHoverBacklinkIndex(null)}
            >
              {/* Y-axis guidelines: 20, 10, 0, -10, -20 */}
              {[20, 10, 0, -10, -20].map((levelVal) => {
                const y = getBacklinkBarY(levelVal);
                return (
                  <g key={levelVal}>
                    <line
                      x1={barPadding.left}
                      y1={y}
                      x2={barChartWidth - barPadding.right}
                      y2={y}
                      stroke="currentColor"
                      className={
                        levelVal === 0
                          ? "text-slate-400 dark:text-slate-600"
                          : "text-slate-100 dark:text-slate-800"
                      }
                      strokeWidth={levelVal === 0 ? "1.5" : "1"}
                    />
                    <text
                      x={barPadding.left - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] font-mono fill-slate-400"
                    >
                      {levelVal}
                    </text>
                  </g>
                );
              })}

              {/* Bars and Change Line */}
              {data.map((d, i) => {
                const step = innerBarWidth / data.length;
                const barX = barPadding.left + i * step + step * 0.15;
                const barW = step * 0.7;

                const zeroYPos = getBacklinkBarY(0);
                const newY = getBacklinkBarY(d.newBacklinks);
                const lostY = getBacklinkBarY(-d.lostBacklinks);

                const newBarH = Math.max(zeroYPos - newY, 2);
                const lostBarH = Math.max(lostY - zeroYPos, 2);

                return (
                  <g key={i}>
                    {/* Positive green bar (New) */}
                    <rect
                      x={barX}
                      y={newY}
                      width={barW}
                      height={newBarH}
                      fill="#10B981"
                      rx="1"
                    />
                    {/* Negative red bar (Lost) */}
                    <rect
                      x={barX}
                      y={zeroYPos}
                      width={barW}
                      height={lostBarH}
                      fill="#EF4444"
                      rx="1"
                    />
                    {/* Mouse hit area */}
                    <rect
                      x={barPadding.left + i * step}
                      y={barPadding.top}
                      width={step}
                      height={innerBarHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoverBacklinkIndex(i)}
                    />
                  </g>
                );
              })}

              {/* Change Trend Line (New - Lost) */}
              <path
                d={data
                  .map((d, i) => {
                    const step = innerBarWidth / data.length;
                    const cx = barPadding.left + i * step + step * 0.5;
                    const change = d.newBacklinks - d.lostBacklinks;
                    const cy = getBacklinkBarY(change);
                    return `${i === 0 ? "M" : "L"} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#334155"
                className="dark:stroke-slate-400"
                strokeWidth="1.5"
              />

              {/* Dots on change trend */}
              {data.map((d, i) => {
                const step = innerBarWidth / data.length;
                const cx = barPadding.left + i * step + step * 0.5;
                const change = d.newBacklinks - d.lostBacklinks;
                const cy = getBacklinkBarY(change);
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="2.5"
                    fill="#334155"
                    className="dark:fill-slate-300"
                  />
                );
              })}

              {/* X-axis labels */}
              {data.map((d, i) => {
                if (i % 2 !== 0 && i !== data.length - 1) return null;
                const step = innerBarWidth / data.length;
                const cx = barPadding.left + i * step + step * 0.5;
                return (
                  <text
                    key={i}
                    x={cx}
                    y={barChartHeight - 4}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-slate-400"
                    transform={`rotate(-25, ${cx}, ${barChartHeight - 4})`}
                  >
                    {d.date}
                  </text>
                );
              })}
            </svg>

            {/* Hover Tooltip for Backlinks Bar Chart */}
            {hoverBacklinkIndex !== null && (
              <div className="absolute top-2 right-4 bg-slate-900 text-white text-[11px] rounded px-2.5 py-1.5 shadow-lg border border-slate-700 pointer-events-none z-20">
                <div className="font-semibold text-slate-300">
                  {data[hoverBacklinkIndex].date}
                </div>
                <div className="text-emerald-400 font-mono">
                  New: +{data[hoverBacklinkIndex].newBacklinks}
                </div>
                <div className="text-red-400 font-mono">
                  Lost: -{data[hoverBacklinkIndex].lostBacklinks}
                </div>
                <div className="text-slate-300 font-mono">
                  Change:{" "}
                  {data[hoverBacklinkIndex].newBacklinks -
                    data[hoverBacklinkIndex].lostBacklinks >
                  0
                    ? `+${
                        data[hoverBacklinkIndex].newBacklinks -
                        data[hoverBacklinkIndex].lostBacklinks
                      }`
                    : data[hoverBacklinkIndex].newBacklinks -
                      data[hoverBacklinkIndex].lostBacklinks}
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-2 flex items-center justify-start gap-4 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> New
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Lost
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600 dark:bg-slate-300"></span> Change
            </span>
          </div>
        </div>
      </div>

      {/* 3. THREE SUMMARY TABLE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Top backlink anchors */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Top backlink anchors
                </h3>
                <span
                  className="text-slate-400 hover:text-slate-600 cursor-help text-xs"
                  title="Most frequent anchor texts in backlinks pointing to your domain"
                >
                  ⓘ
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-medium">
                    <th className="py-2 font-medium">Anchor text</th>
                    <th className="py-2 text-right font-medium">Backlinks</th>
                    <th className="py-2 text-right font-medium">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-normal">
                  {MOCK_TOP_ANCHORS.map((anchor, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2 text-slate-800 dark:text-slate-200 truncate max-w-[140px]" title={anchor.anchorText}>
                        {anchor.anchorText}
                      </td>
                      <td className="py-2 text-right text-blue-600 dark:text-blue-400 font-medium">
                        {anchor.backlinks}
                      </td>
                      <td className="py-2 text-right text-slate-500 dark:text-slate-400">
                        {anchor.percent.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onNavigateTab("anchor-texts")}
              className="w-full py-2 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded text-xs font-semibold uppercase tracking-wider transition text-center"
            >
              VIEW FULL REPORT
            </button>
          </div>
        </div>

        {/* Card 2: Domains by Domain Trust */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Domains by Domain Trust
                </h3>
                <span
                  className="text-slate-400 hover:text-slate-600 cursor-help text-xs"
                  title="Distribution of referring domains across domain trust scoring brackets"
                >
                  ⓘ
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-medium">
                    <th className="py-2 font-medium">Domain Trust</th>
                    <th className="py-2 text-right font-medium">Ref.domains</th>
                    <th className="py-2 text-right font-medium">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-normal">
                  {MOCK_DOMAIN_TRUST_DISTRIBUTION.map((dt, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2 text-slate-800 dark:text-slate-200 font-medium">
                        {dt.range}
                      </td>
                      <td className="py-2 text-right text-blue-600 dark:text-blue-400 font-medium">
                        {dt.refDomains}
                      </td>
                      <td className="py-2 text-right text-slate-500 dark:text-slate-400">
                        {dt.percent.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onNavigateTab("referring-domains")}
              className="w-full py-2 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded text-xs font-semibold uppercase tracking-wider transition text-center"
            >
              VIEW FULL REPORT
            </button>
          </div>
        </div>

        {/* Card 3: Countries */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Countries
                </h3>
                <span
                  className="text-slate-400 hover:text-slate-600 cursor-help text-xs"
                  title="Geographical distribution of referring domains"
                >
                  ⓘ
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-medium">
                    <th className="py-2 font-medium">Country</th>
                    <th className="py-2 text-right font-medium">Ref.domains</th>
                    <th className="py-2 text-right font-medium">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-normal">
                  {MOCK_COUNTRY_DISTRIBUTION.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <CountryFlag code={item.countryCode} name={item.countryName} />
                        <span className="truncate max-w-[120px]">{item.countryName}</span>
                      </td>
                      <td className="py-2 text-right text-blue-600 dark:text-blue-400 font-medium">
                        {item.refDomains}
                      </td>
                      <td className="py-2 text-right text-slate-500 dark:text-slate-400">
                        {item.percent.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onNavigateTab("referring-domains")}
              className="w-full py-2 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded text-xs font-semibold uppercase tracking-wider transition text-center"
            >
              VIEW FULL REPORT
            </button>
          </div>
        </div>
      </div>


    </div>
  );
}