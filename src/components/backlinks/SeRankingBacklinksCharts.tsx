'use client';

import React, { useState } from 'react';

export interface OverallDataPoint {
  date: string;
  range: string;
  refDomains: number;
  backlinks: number;
  dt: number;
  pt: number;
  organic: number;
}

export interface NewLostDataPoint {
  date: string;
  range: string;
  newCount: number;
  lostCount: number;
  change: number;
}

interface SeRankingBacklinksOverallChartProps {
  data: OverallDataPoint[];
}

export function SeRankingBacklinksOverallChart({ data }: SeRankingBacklinksOverallChartProps) {
  const [period, setPeriod] = useState<'7D' | '1M' | '3M' | '6M' | '12M'>('3M');
  const [groupBy, setGroupBy] = useState<'Days' | 'Weeks' | 'Months'>('Weeks');
  const [isGroupOpen, setIsGroupOpen] = useState(false);

  // Series visibility toggles
  const [showRefDomains, setShowRefDomains] = useState(true);
  const [showBacklinks, setShowBacklinks] = useState(true);
  const [showDomainTrust, setShowDomainTrust] = useState(false);
  const [showPageTrust, setShowPageTrust] = useState(false);
  const [showOrganicTraffic, setShowOrganicTraffic] = useState(false);

  const [hoverIndex, setHoverIndex] = useState<number | null>(data && data.length > 0 ? Math.min(7, data.length - 1) : null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-[#E3E6EE] rounded-xl shadow-2xs p-8 text-center">
        <h3 className="text-sm font-bold text-[#2E2E30] text-left mb-6">Overall</h3>
        <div className="py-10 text-gray-500">
          <p className="text-sm font-semibold text-gray-700">No historical backlink dynamics yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Historical trends will be tracked as backlink synchronization runs for this project.
          </p>
        </div>
      </div>
    );
  }

  const svgWidth = 1077;
  const svgHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 55;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  // Scales
  const refVals = data.map((d) => Number(d.refDomains) || 0);
  const blVals = data.map((d) => Number(d.backlinks) || 0);
  const maxRefVal = Math.max(...refVals, 1);
  const minRefVal = Math.min(...refVals, 0);
  const minRef = Math.max(0, Math.floor(minRefVal * 0.9));
  const maxRef = Math.max(minRef + 4, Math.ceil(maxRefVal * 1.1));

  const getYLeft = (val: number) => {
    const clamped = Math.max(minRef, Math.min(maxRef, val));
    return paddingTop + chartH - ((clamped - minRef) / (maxRef - minRef || 1)) * chartH;
  };

  const maxBlVal = Math.max(...blVals, 1);
  const minBlVal = Math.min(...blVals, 0);
  const minBl = Math.max(0, Math.floor(minBlVal * 0.9));
  const maxBl = Math.max(minBl + 4, Math.ceil(maxBlVal * 1.1));

  const getYRight = (val: number) => {
    const clamped = Math.max(minBl, Math.min(maxBl, val));
    return paddingTop + chartH - ((clamped - minBl) / (maxBl - minBl || 1)) * chartH;
  };

  const getX = (idx: number) => {
    if (data.length <= 1) return paddingLeft + chartW / 2;
    return paddingLeft + (idx / (data.length - 1)) * chartW;
  };

  // Generate smooth SVG paths
  const makePath = (getYFn: (val: number) => number, key: keyof OverallDataPoint) => {
    const pts = data.map((d, i) => ({ x: getX(i), y: getYFn(Number(d[key]) || 0) }));
    return pts.reduce((acc, curr, i, arr) => {
      if (i === 0) return `M ${curr.x} ${curr.y}`;
      const prev = arr[i - 1];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }, '');
  };

  const refPath = makePath(getYLeft, 'refDomains');
  const blPath = makePath(getYRight, 'backlinks');
  const dtPath = makePath((v) => getYLeft(v * 4), 'dt');
  const ptPath = makePath((v) => getYLeft(v * 15), 'pt');

  const safeHoverIndex = hoverIndex !== null && hoverIndex < data.length ? hoverIndex : null;
  const activePoint = safeHoverIndex !== null ? data[safeHoverIndex] : null;
  const activeX = safeHoverIndex !== null ? getX(safeHoverIndex) : 0;

  return (
    <div className="bg-white border border-[#E3E6EE] rounded-xl shadow-2xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-[#E3E6EE] flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[#2E2E30]">Overall</h3>

        <div className="flex items-center gap-4 text-xs">
          {/* Period Tabs */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#8F94A6] font-medium text-[11px]">Period:</span>
            <div className="flex items-center gap-1">
              {(['7D', '1M', '3M', '6M', '12M'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    period === p
                      ? 'text-[#257CBA] font-bold border-b-2 border-[#257CBA]'
                      : 'text-[#5D5F64] hover:text-[#171B24]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Group By Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1.5 text-[11px] text-[#8F94A6]">
              <span>Group by:</span>
              <button
                type="button"
                onClick={() => setIsGroupOpen(!isGroupOpen)}
                className="flex items-center gap-1 font-semibold text-[#257CBA] hover:underline cursor-pointer"
              >
                <span>{groupBy}</span>
                <span className="material-icons notranslate text-[14px]">expand_more</span>
              </button>
            </div>
            {isGroupOpen && (
              <div className="absolute right-0 mt-1 w-28 bg-white border border-[#E3E6EE] rounded-lg shadow-lg py-1 z-30">
                {(['Days', 'Weeks', 'Months'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setGroupBy(g);
                      setIsGroupOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#2E2E30] hover:bg-gray-50"
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="p-4 sm:p-5 relative select-none">
        {/* Y-axis Titles above chart */}
        <div className="flex items-center justify-between text-xs font-medium px-4 mb-2">
          <span className="text-[#3093DB] font-semibold">Total referring domains</span>
          <span className="text-[#0EA15F] font-semibold">Total backlinks</span>
        </div>

        <div
          className="relative w-full overflow-hidden"
          onMouseLeave={() => setHoverIndex(7)}
        >
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto max-h-[300px] overflow-visible"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clientX = e.clientX - rect.left;
              const scale = svgWidth / rect.width;
              const svgX = clientX * scale;
              // find nearest index
              let nearestIdx = 0;
              let nearestDist = Infinity;
              data.forEach((_, i) => {
                const x = getX(i);
                const dist = Math.abs(x - svgX);
                if (dist < nearestDist) {
                  nearestDist = dist;
                  nearestIdx = i;
                }
              });
              setHoverIndex(nearestIdx);
            }}
          >
            {/* Horizontal Grid Lines */}
            {[0, 1, 2, 3].map((step) => {
              const y = paddingTop + (step / 3) * chartH;
              return (
                <line
                  key={step}
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#E6E6E6"
                  strokeWidth="1"
                />
              );
            })}

            {/* Left Y-axis labels */}
            {[0, 1, 2, 3].map((step) => {
              const val = Math.round(maxRef - (step / 3) * (maxRef - minRef));
              const y = paddingTop + (step / 3) * chartH + 4;
              return (
                <text key={`l-${step}`} x={paddingLeft - 10} y={y} textAnchor="end" fill="#3093DB" fontSize="11" fontWeight="500">{val}</text>
              );
            })}

            {/* Right Y-axis labels */}
            {[0, 1, 2, 3].map((step) => {
              const val = Math.round(maxBl - (step / 3) * (maxBl - minBl));
              const y = paddingTop + (step / 3) * chartH + 4;
              return (
                <text key={`r-${step}`} x={svgWidth - paddingRight + 10} y={y} textAnchor="start" fill="#0EA15F" fontSize="11" fontWeight="500">{val}</text>
              );
            })}

            {/* Vertical grid lines & X-axis dates */}
            {data.map((d, i) => {
              const x = getX(i);
              return (
                <g key={d.date}>
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + chartH}
                    stroke="#F2F2F2"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    fill="#171B24B3"
                    fontSize="11"
                  >
                    {d.date}
                  </text>
                </g>
              );
            })}

            {/* Highcharts Crosshair (Vertical dashed line on hover) */}
            {hoverIndex !== null && (
              <line
                x1={activeX}
                y1={paddingTop}
                x2={activeX}
                y2={paddingTop + chartH}
                stroke="rgb(44, 62, 80)"
                strokeWidth="1"
                strokeDasharray="4,3"
                pointerEvents="none"
              />
            )}

            {/* Spline Lines */}
            {showRefDomains && (
              <path
                d={refPath}
                fill="none"
                stroke="#3093DB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {showBacklinks && (
              <path
                d={blPath}
                fill="none"
                stroke="#0EA15F"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {showDomainTrust && (
              <path
                d={dtPath}
                fill="none"
                stroke="#F65449"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {showPageTrust && (
              <path
                d={ptPath}
                fill="none"
                stroke="#FECB4D"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Active markers on hover */}
            {hoverIndex !== null && activePoint && (
              <>
                {showRefDomains && (
                  <circle
                    cx={activeX}
                    cy={getYLeft(activePoint.refDomains)}
                    r={5}
                    fill="#3093DB"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                )}
                {showBacklinks && (
                  <circle
                    cx={activeX}
                    cy={getYRight(activePoint.backlinks)}
                    r={5}
                    fill="#0EA15F"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                )}
              </>
            )}
          </svg>

          {/* Interactive Tooltip matching SE Ranking Screenshot 2 */}
          {hoverIndex !== null && activePoint && (
            <div
              className="absolute z-30 pointer-events-none transition-all duration-75"
              style={{
                left: `${(activeX / svgWidth) * 100}%`,
                top: '28%',
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="bg-white/95 backdrop-blur-xs border border-gray-300 rounded-lg shadow-xl px-3.5 py-2.5 text-xs min-w-[210px] space-y-1.5 font-sans">
                <div className="text-[11px] font-bold text-gray-700 pb-1 border-b border-gray-100">
                  {activePoint.range}
                </div>
                {showBacklinks && (
                  <div className="flex items-center justify-between text-gray-800 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#0EA15F] inline-block" />
                      <span>Total backlinks</span>
                    </div>
                    <span className="font-bold font-mono">{activePoint.backlinks}</span>
                  </div>
                )}
                {showRefDomains && (
                  <div className="flex items-center justify-between text-gray-800 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#3093DB] inline-block" />
                      <span>Total referring domains</span>
                    </div>
                    <span className="font-bold font-mono">{activePoint.refDomains}</span>
                  </div>
                )}
                {showDomainTrust && (
                  <div className="flex items-center justify-between text-gray-800 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#F65449] inline-block" />
                      <span>Domain Trust</span>
                    </div>
                    <span className="font-bold font-mono">{activePoint.dt}</span>
                  </div>
                )}
                {showPageTrust && (
                  <div className="flex items-center justify-between text-gray-800 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FECB4D] inline-block" />
                      <span>Page Trust</span>
                    </div>
                    <span className="font-bold font-mono">{activePoint.pt}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Legend matching SE Ranking Checkboxes */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100 text-xs text-[#171B24]">
          <button
            type="button"
            onClick={() => setShowRefDomains(!showRefDomains)}
            className="flex items-center gap-1.5 cursor-pointer font-medium hover:opacity-80"
          >
            <span
              className="material-icons notranslate text-[18px]"
              style={{ color: '#3093DB' }}
            >
              {showRefDomains ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span>Total referring domains</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBacklinks(!showBacklinks)}
            className="flex items-center gap-1.5 cursor-pointer font-medium hover:opacity-80"
          >
            <span
              className="material-icons notranslate text-[18px]"
              style={{ color: '#0EA15F' }}
            >
              {showBacklinks ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span>Total backlinks</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDomainTrust(!showDomainTrust)}
            className="flex items-center gap-1.5 cursor-pointer font-medium hover:opacity-80"
          >
            <span
              className="material-icons notranslate text-[18px]"
              style={{ color: '#F65449' }}
            >
              {showDomainTrust ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span>Domain Trust</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPageTrust(!showPageTrust)}
            className="flex items-center gap-1.5 cursor-pointer font-medium hover:opacity-80"
          >
            <span
              className="material-icons notranslate text-[18px]"
              style={{ color: '#FECB4D' }}
            >
              {showPageTrust ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span>Page Trust</span>
          </button>

          <button
            type="button"
            onClick={() => setShowOrganicTraffic(!showOrganicTraffic)}
            className="flex items-center gap-1.5 cursor-pointer font-medium hover:opacity-80"
          >
            <span
              className="material-icons notranslate text-[18px]"
              style={{ color: '#8A7DF8' }}
            >
              {showOrganicTraffic ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span>Organic traffic</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface SeRankingNewLostBarChartProps {
  title: string;
  data: NewLostDataPoint[];
  defaultHoverIndex?: number;
}

export function SeRankingNewLostBarChart({
  title,
  data,
  defaultHoverIndex = 11,
}: SeRankingNewLostBarChartProps) {
  const [period, setPeriod] = useState<'7D' | '1M' | '3M' | '6M' | '12M'>('3M');
  const [groupBy, setGroupBy] = useState<'Weeks' | 'Days'>('Weeks');
  const [hoverIdx, setHoverIdx] = useState<number | null>(data && data.length > 0 ? Math.min(defaultHoverIndex, data.length - 1) : null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-[#E3E6EE] rounded-xl shadow-2xs p-6 text-center flex flex-col justify-between min-h-[220px]">
        <div className="p-1 border-b border-[#E3E6EE] flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-[#2E2E30]">{title}</h4>
        </div>
        <div className="py-12 text-gray-400 text-xs">
          <p className="font-semibold text-gray-600">No new or lost links recorded</p>
          <p className="text-gray-400 mt-1">Changes will be shown here as link status updates are tracked.</p>
        </div>
      </div>
    );
  }

  const svgWidth = 508;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 66;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;
  const zeroY = paddingTop + chartH / 2;

  // Dynamic Y scale range
  const allAbs = data.map((d) => Math.max(Math.abs(d.newCount || 0), Math.abs(d.lostCount || 0), Math.abs(d.change || 0)));
  const maxAbs = Math.max(...allAbs, 1);
  const maxY = Math.max(2, Math.ceil(maxAbs * 1.2 * 10) / 10);
  const minY = -maxY;
  const getY = (val: number) => {
    return paddingTop + chartH - ((val - minY) / (maxY - minY || 1)) * chartH;
  };

  const barWidth = Math.min(14, Math.max(4, chartW / ((data.length || 1) * 2)));
  const colStep = chartW / (data.length || 1);

  // Path for Change line
  const changePts = data.map((d, i) => {
    const x = paddingLeft + i * colStep + colStep / 2;
    const y = getY(d.change || 0);
    return { x, y };
  });

  const changePath = changePts.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }, '');

  const active = hoverIdx !== null && hoverIdx < data.length ? data[hoverIdx] : null;
  const activeX = hoverIdx !== null && hoverIdx < data.length ? paddingLeft + hoverIdx * colStep + colStep / 2 : 0;
  const yTicks = [-maxY, -Math.round((maxY / 2) * 10) / 10, 0, Math.round((maxY / 2) * 10) / 10, maxY];

  return (
    <div className="bg-white border border-[#E3E6EE] rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="p-3.5 border-b border-[#E3E6EE] flex items-center justify-between">
        <h4 className="text-xs font-bold text-[#2E2E30]">{title}</h4>
        <div className="flex items-center gap-2 text-[10px] text-[#8F94A6]">
          <span>Period:</span>
          {(['7D', '1M', '3M', '6M', '12M'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`font-semibold cursor-pointer ${
                period === p ? 'text-[#257CBA] font-bold border-b border-[#257CBA]' : 'text-gray-500'
              }`}
            >
              {p}
            </button>
          ))}
          <span className="text-[#257CBA] font-semibold ml-1 cursor-pointer">Weeks ⌄</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="p-3 relative select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clientX = e.clientX - rect.left;
            const scale = svgWidth / rect.width;
            const svgX = clientX * scale;
            let nearest = 0;
            let minDist = Infinity;
            data.forEach((_, i) => {
              const x = paddingLeft + i * colStep + colStep / 2;
              const d = Math.abs(x - svgX);
              if (d < minDist) {
                minDist = d;
                nearest = i;
              }
            });
            setHoverIdx(nearest);
          }}
          onMouseLeave={() => setHoverIdx(defaultHoverIndex)}
        >
          {/* Grid lines */}
          {yTicks.map((v) => {
            const y = getY(v);
            return (
              <g key={v}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke={v === 0 ? '#CBD5E1' : '#E6E6E6'}
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#171B24B3"
                  fontSize="10"
                >
                  {v}
                </text>
              </g>
            );
          })}

          {/* Vertical Grid & Rotated X Labels */}
          {data.map((d, i) => {
            const x = paddingLeft + i * colStep + colStep / 2;
            return (
              <g key={d.date}>
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={paddingTop + chartH}
                  stroke="#F5F5F5"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={paddingTop + chartH + 16}
                  transform={`rotate(-45 ${x} ${paddingTop + chartH + 16})`}
                  textAnchor="end"
                  fill="#171B24B3"
                  fontSize="10"
                >
                  {d.date}
                </text>
              </g>
            );
          })}

          {/* Bars: New (green upward) & Lost (red downward) */}
          {data.map((d, i) => {
            const x = paddingLeft + i * colStep + (colStep - barWidth) / 2;

            // Positive New bar
            const newHeight = d.newCount > 0 ? (d.newCount / maxY) * (chartH / 2) : 2;
            const newY = zeroY - newHeight;

            // Negative Lost bar
            const lostHeight = Math.abs(d.lostCount) > 0 ? (Math.abs(d.lostCount) / maxY) * (chartH / 2) : 2;
            const lostY = zeroY;

            return (
              <g key={d.date}>
                {/* New Bar */}
                <rect
                  x={x}
                  y={newY}
                  width={barWidth}
                  height={Math.max(2, newHeight)}
                  fill="#0CA15F"
                  rx="1"
                  opacity={hoverIdx === i ? 1 : 0.9}
                />
                {/* Lost Bar */}
                <rect
                  x={x}
                  y={lostY}
                  width={barWidth}
                  height={Math.max(2, lostHeight)}
                  fill="#F65449"
                  rx="1"
                  opacity={hoverIdx === i ? 1 : 0.9}
                />
              </g>
            );
          })}

          {/* Change Spline Curve */}
          <path
            d={changePath}
            fill="none"
            stroke="#5D5F64"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Hover Marker on Change line */}
          {hoverIdx !== null && active && (
            <circle
              cx={activeX}
              cy={getY(active.change)}
              r={4}
              fill="#5D5F64"
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
          )}
        </svg>

        {/* Hover Tooltip Popup matching Screenshot 3 */}
        {hoverIdx !== null && active && (
          <div
            className="absolute z-30 pointer-events-none transition-all duration-75"
            style={{
              left: `${(activeX / svgWidth) * 100}%`,
              top: '40%',
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-white/95 backdrop-blur-xs border border-gray-300 rounded-lg shadow-xl px-3 py-2 text-xs min-w-[170px] space-y-1.5 font-sans">
              <div className="text-[10px] font-bold text-gray-700 pb-1 border-b border-gray-100">
                {active.range}
              </div>
              <div className="flex items-center justify-between text-gray-800 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0CA15F] inline-block" />
                  <span>New</span>
                </div>
                <span className="font-bold font-mono">{active.newCount}</span>
              </div>
              <div className="flex items-center justify-between text-gray-800 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F65449] inline-block" />
                  <span>Lost</span>
                </div>
                <span className="font-bold font-mono">{Math.abs(active.lostCount)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-800 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#5D5F64] inline-block" />
                  <span>Change</span>
                </div>
                <span className="font-bold font-mono">{active.change}</span>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-[#171B24] pt-2 border-t border-gray-100">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0CA15F] inline-block" />
            <span>New</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F65449] inline-block" />
            <span>Lost</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#5D5F64] inline-block" />
            <span>Change</span>
          </span>
        </div>
      </div>
    </div>
  );
}
