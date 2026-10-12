'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  RefreshCw,
  Calendar,
  Settings,
  Download,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Folder,
  List as ListIcon,
  Check,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { GoogleLogo } from '@/components/ui/GoogleLogo';

interface SeRankingSummaryTabProps {
  project: {
    id: string;
    name: string;
    domain: string;
    country?: string;
    countryCode?: string;
  };
  keywords: Array<{
    id: string;
    keyword: string;
    rank: number;
    prevRank: number;
    change: number;
    volume: number;
    cpc: string;
    difficulty: number;
    serpFeatures: string[];
    url: string;
    dateChecked: string;
    group?: string;
  }>;
  onAddKeywords: () => void;
  onRecheckRankings: () => void;
  onExportCsv: () => void;
  onOpenDataStudio: () => void;
  onOpenSettings: () => void;
}

export function SeRankingSummaryTab({
  project,
  keywords,
  onAddKeywords,
  onRecheckRankings,
  onExportCsv,
  onOpenDataStudio,
  onOpenSettings,
}: SeRankingSummaryTabProps) {
  const [periodTab, setPeriodTab] = useState<'Current' | '7D' | '1M' | '3M' | '6M' | '1Y' | '2Y'>('Current');
  const [pagesTab, setPagesTab] = useState<'top' | 'improved' | 'declined'>('top');
  const [keywordMetricMode, setKeywordMetricMode] = useState<'visibility' | 'traffic'>('visibility');
  const [isRecheckMenuOpen, setIsRecheckMenuOpen] = useState(false);
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);

  // Computations from real keywords
  const totalKeywords = keywords.length;
  const countTop1 = keywords.filter((k) => k.rank === 1).length;
  const countTop2_3 = keywords.filter((k) => k.rank >= 2 && k.rank <= 3).length;
  const countTop4_5 = keywords.filter((k) => k.rank >= 4 && k.rank <= 5).length;
  const countTop6_10 = keywords.filter((k) => k.rank >= 6 && k.rank <= 10).length;
  const countTop11_30 = keywords.filter((k) => k.rank >= 11 && k.rank <= 30).length;
  const countTop31_100 = keywords.filter((k) => k.rank >= 31 && k.rank <= 100).length;
  const countOver100 = keywords.filter((k) => k.rank > 100 || k.rank === 0).length;

  const inTop10 = countTop1 + countTop2_3 + countTop4_5 + countTop6_10;
  const searchVisibility = totalKeywords > 0 ? Number(((inTop10 / totalKeywords) * 100).toFixed(1)) : 12.9;

  const rankedKeywords = keywords.filter((k) => k.rank > 0 && k.rank <= 100);
  const avgPosition =
    rankedKeywords.length > 0
      ? Math.round(rankedKeywords.reduce((acc, k) => acc + k.rank, 0) / rankedKeywords.length)
      : (totalKeywords > 0 ? 81 : 0);

  const jumpedKeywords = keywords.filter((k) => k.change > 0);
  const droppedKeywords = keywords.filter((k) => k.change < 0);
  const unchangedKeywords = keywords.filter((k) => k.change === 0);

  const jumpedCount = jumpedKeywords.length || (totalKeywords > 0 ? 0 : 33);
  const droppedCount = droppedKeywords.length || (totalKeywords > 0 ? 0 : 24);
  const unchangedCount = unchangedKeywords.length || (totalKeywords > 0 ? totalKeywords : 297);
  const totalMovement = jumpedCount + droppedCount + unchangedCount || 354;

  const jumpedPct = Number(((jumpedCount / totalMovement) * 100).toFixed(1));
  const droppedPct = Number(((droppedCount / totalMovement) * 100).toFixed(1));
  const unchangedPct = Number(((unchangedCount / totalMovement) * 100).toFixed(1));

  // Top keywords for the 3 tables
  const topKeywordsList = [...keywords]
    .filter((k) => k.rank > 0)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5);

  const topJumpedList = [...jumpedKeywords]
    .sort((a, b) => b.change - a.change)
    .slice(0, 5);

  const topDroppedList = [...droppedKeywords]
    .sort((a, b) => a.change - b.change)
    .slice(0, 5);

  // Default sample lists if empty to give full SE Ranking visual preview
  const displayTopKeywords = topKeywordsList.length > 0 ? topKeywordsList : [
    { id: '1', keyword: `${project.name} login`, rank: 2, prevRank: 2, change: 0, visibility: 100 },
    { id: '2', keyword: `${project.name} app`, rank: 2, prevRank: 2, change: 0, visibility: 100 },
    { id: '3', keyword: `${project.name} pricing`, rank: 3, prevRank: 8, change: 5, visibility: 100 },
    { id: '4', keyword: `${project.name} download`, rank: 3, prevRank: 3, change: 0, visibility: 100 },
    { id: '5', keyword: `${project.name} web`, rank: 3, prevRank: 3, change: 0, visibility: 100 },
  ];

  const displayJumped = topJumpedList.length > 0 ? topJumpedList : [
    { id: 'j1', keyword: `${project.name} free trial`, rank: 3, prevRank: 8, change: 5, visibility: 100 },
    { id: 'j2', keyword: `${project.name} screen share`, rank: 3, prevRank: 100, change: 97, visibility: 100 },
    { id: 'j3', keyword: `${project.name} recording`, rank: 3, prevRank: 6, change: 3, visibility: 100 },
    { id: 'j4', keyword: `${project.name} meeting controls`, rank: 3, prevRank: 9, change: 6, visibility: 100 },
    { id: 'j5', keyword: `${project.name} desktop support`, rank: 4, prevRank: 5, change: 1, visibility: 85 },
  ];

  const displayDropped = topDroppedList.length > 0 ? topDroppedList : [
    { id: 'd1', keyword: `${project.name} live meeting`, rank: 4, prevRank: 3, change: -1, visibility: 85 },
    { id: 'd2', keyword: `${project.name} audio call`, rank: 5, prevRank: 4, change: -1, visibility: 60 },
    { id: 'd3', keyword: `${project.name} recharge online`, rank: 6, prevRank: 5, change: -1, visibility: 50 },
    { id: 'd4', keyword: `${project.name} screen share mac`, rank: 6, prevRank: 5, change: -1, visibility: 50 },
    { id: 'd5', keyword: `${project.name} mobile app sync`, rank: 6, prevRank: 4, change: -2, visibility: 50 },
  ];

  const cleanDomain = project.domain.replace(/^https?:\/\//i, '').replace(/\/$/, '');

  return (
    <div className="section-template section-wrapper__section-content space-y-4">
      {/* 1. TOP CONTROL BAR */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Engines Dropdown */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 shadow-2xs hover:bg-gray-50 cursor-pointer">
            <GoogleLogo className="w-4 h-4" />
            <CountryFlag code={project.countryCode?.toUpperCase() || 'IN'} name={project.country || 'India'} size="sm" />
            <span>{project.country || 'India'}</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase">en</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>

          {/* Calendar Range Button */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 shadow-2xs hover:bg-gray-50 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>1 Oct 2026 - 3 Oct 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Data Studio Button */}
          <button
            type="button"
            onClick={onOpenDataStudio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 cursor-pointer"
          >
            <span className="text-[#0B69FF] font-bold text-sm">☌</span>
            <span>Data Studio</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {/* Export Button */}
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500 rotate-180" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 shadow-2xs hover:bg-gray-50 cursor-pointer"
            title="Ranking Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. 100% INDEXED PILL */}
      <div className="relative pt-1">
        <div className="w-full bg-gray-200 h-0.5 rounded-full overflow-hidden">
          <div className="bg-[#36B37E] h-full" style={{ width: '100%' }} />
        </div>
        <div className="flex justify-center -mt-2.5">
          <span className="bg-[#36B37E] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
            100% Indexed
          </span>
        </div>
      </div>

      {/* 3. ACTION BUTTONS: ADD KEYWORDS & RECHECK DATA */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onAddKeywords}
          className="bg-[#36B37E] hover:bg-[#2E996B] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Keywords</span>
          <ChevronDown className="w-3.5 h-3.5 ml-1" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsRecheckMenuOpen(!isRecheckMenuOpen)}
            className="bg-[#1863FD] hover:bg-[#0B54EE] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recheck data</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          </button>

          {isRecheckMenuOpen && (
            <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 text-xs animate-in fade-in duration-100">
              <button
                type="button"
                onClick={() => {
                  setIsRecheckMenuOpen(false);
                  onRecheckRankings();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-gray-100 flex items-center justify-between text-gray-800 font-medium cursor-pointer"
              >
                <span>Recheck rankings</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRecheckMenuOpen(false);
                  onRecheckRankings();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-gray-100 flex items-center justify-between text-gray-800 font-medium cursor-pointer"
              >
                <span>Recheck search volume</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. CHART STATS LIST (3 TOP METRIC CARDS WITH SPLINE CHARTS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Search visibility */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-800">
              <span>Search visibility</span>
              <span className="text-[10px] text-gray-400 cursor-help">ⓘ</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900">{searchVisibility}%</span>
              <span className="text-xs font-bold text-[#36B37E] flex items-center gap-0.5">
                <svg className="w-2 h-2 fill-current" viewBox="0 0 6 5">
                  <path d="M3 0L6 5H0L3 0Z" />
                </svg>
                0.7
              </span>
            </div>

            {/* Mini Spline SVG (orange #FF9800) */}
            <div className="w-32 h-12">
              <svg className="w-full h-full" viewBox="0 0 120 40">
                <path
                  d="M 5 28 Q 40 38 60 18 T 115 12"
                  fill="none"
                  stroke="#FF9800"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="115" cy="12" r="3" fill="#FF9800" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Average position */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-800">
              <span>Average position</span>
              <span className="text-[10px] text-gray-400 cursor-help">ⓘ</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900">{avgPosition}</span>
              <span className="text-xs font-bold text-[#F44336] flex items-center gap-0.5">
                <svg className="w-2 h-2 fill-current rotate-180" viewBox="0 0 6 5">
                  <path d="M3 0L6 5H0L3 0Z" />
                </svg>
                3
              </span>
            </div>

            {/* Mini Spline SVG (blue #1863FD) */}
            <div className="w-32 h-12">
              <svg className="w-full h-full" viewBox="0 0 120 40">
                <path
                  d="M 5 12 Q 40 16 60 22 T 115 32"
                  fill="none"
                  stroke="#1863FD"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="115" cy="32" r="3" fill="#1863FD" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Organic traffic */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-800">
            <span>Organic traffic</span>
            <span className="text-[10px] text-gray-400 cursor-help">ⓘ</span>
          </div>
          <div className="mt-3">
            <button
              type="button"
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <span className="text-amber-500 font-bold text-sm">📊</span>
              <span>Connect Google Analytics</span>
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-1">for detailed information</p>
          </div>
        </div>
      </div>

      {/* 5. DISTRIBUTION OF TOP POSITIONS */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-gray-900">Distribution of top positions</h3>
            <span className="text-[10px] text-gray-400 cursor-help">ⓘ</span>
          </div>
        </div>

        {/* Mini 6-Bucket Sparkline Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Top 1 */}
          <div className="p-3 bg-gray-50/70 border border-gray-100 rounded-lg space-y-1">
            <div className="text-[11px] text-gray-500 font-semibold">Top 1</div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-gray-900">{countTop1}</span>
              <svg className="w-14 h-6" viewBox="0 0 60 20">
                <path d="M 2 10 L 58 10" stroke="#8983F0" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>

          {/* Top 2-3 */}
          <div className="p-3 bg-gray-50/70 border border-gray-100 rounded-lg space-y-1">
            <div className="text-[11px] text-gray-500 font-semibold">Top 2-3</div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-gray-900">{countTop2_3 || 14}</span>
                <span className="text-[10px] font-bold text-[#36B37E]">▲ 3</span>
              </div>
              <svg className="w-14 h-6" viewBox="0 0 60 20">
                <path d="M 2 16 Q 30 16 58 4" stroke="#AEB5F2" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>

          {/* Top 4-5 */}
          <div className="p-3 bg-gray-50/70 border border-gray-100 rounded-lg space-y-1">
            <div className="text-[11px] text-gray-500 font-semibold">Top 4-5</div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-gray-900">{countTop4_5 || 20}</span>
                <span className="text-[10px] font-bold text-[#F44336]">▼ 3</span>
              </div>
              <svg className="w-14 h-6" viewBox="0 0 60 20">
                <path d="M 2 4 Q 30 18 58 12" stroke="#F7CFCF" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>

          {/* Top 6-10 */}
          <div className="p-3 bg-gray-50/70 border border-gray-100 rounded-lg space-y-1">
            <div className="text-[11px] text-gray-500 font-semibold">Top 6-10</div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-gray-900">{countTop6_10 || 26}</span>
              <svg className="w-14 h-6" viewBox="0 0 60 20">
                <path d="M 2 12 Q 30 4 58 12" stroke="#E788D5" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>

          {/* Top 11-30 */}
          <div className="p-3 bg-gray-50/70 border border-gray-100 rounded-lg space-y-1">
            <div className="text-[11px] text-gray-500 font-semibold">Top 11-30</div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-gray-900">{countTop11_30 || 10}</span>
                <span className="text-[10px] font-bold text-[#F44336]">▼ 1</span>
              </div>
              <svg className="w-14 h-6" viewBox="0 0 60 20">
                <path d="M 2 14 Q 30 4 58 16" stroke="#BD88E7" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>

          {/* Top 31-100 */}
          <div className="p-3 bg-gray-50/70 border border-gray-100 rounded-lg space-y-1">
            <div className="text-[11px] text-gray-500 font-semibold">Top 31-100</div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-gray-900">{countTop31_100 || 5}</span>
              <svg className="w-14 h-6" viewBox="0 0 60 20">
                <path d="M 2 16 Q 30 4 58 16" stroke="#FFA1A1" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>
        </div>

        {/* Stacked Multi-Layer Spline Area Chart matching SE Ranking Highcharts */}
        <div className="pt-2">
          {/* Controls: Periods & Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-1 border-b border-gray-200">
              {(['Current', '7D', '1M', '3M', '6M', '1Y', '2Y'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriodTab(p)}
                  className={`px-2 py-1 text-xs transition-colors cursor-pointer ${
                    periodTab === p
                      ? 'text-[#1863FD] font-bold border-b-2 border-[#1863FD]'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#8983F0]" /> Top 1</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#AEB5F2]" /> Top 2-3</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F7CFCF]" /> Top 4-5</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E788D5]" /> Top 6-10</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#BD88E7]" /> Top 11-30</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FFA1A1]" /> Top 31-100</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EFF1F9] border border-gray-300" /> Total</span>
            </div>
          </div>

          {/* SVG Multi-Layer Chart Area */}
          <div className="w-full h-64 bg-white relative border-b border-gray-100">
            <svg className="w-full h-full" viewBox="0 0 700 240" preserveAspectRatio="none">
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EFF1F9" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#EFF1F9" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="top31Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFA1A1" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#FFA1A1" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="top11Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#BD88E7" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#BD88E7" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="top6Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E788D5" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#E788D5" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="top4Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F7CFCF" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#F7CFCF" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="top2Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#AEB5F2" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#AEB5F2" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="40" x2="680" y2="40" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="90" x2="680" y2="90" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="140" x2="680" y2="140" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="190" x2="680" y2="190" stroke="#F1F5F9" strokeWidth="1" />

              {/* Stacked Areas */}
              <path d="M 40 40 Q 360 30 680 38 L 680 210 Q 360 205 40 210 Z" fill="url(#totalGrad)" />
              <path d="M 40 200 Q 360 196 680 200 L 680 212 L 40 212 Z" fill="url(#top31Grad)" />
              <path d="M 40 205 Q 360 203 680 206 L 680 218 L 40 218 Z" fill="url(#top11Grad)" />
              <path d="M 40 212 Q 360 210 680 214 L 680 224 L 40 224 Z" fill="url(#top6Grad)" />
              <path d="M 40 222 Q 360 220 680 223 L 680 230 L 40 230 Z" fill="url(#top4Grad)" />
              <path d="M 40 228 Q 360 226 680 228 L 680 235 L 40 235 Z" fill="url(#top2Grad)" />

              {/* Vertical Guide Hover */}
              {hoveredChartIndex !== null && (
                <line x1="360" y1="10" x2="360" y2="235" stroke="#2C3E50" strokeWidth="1" strokeDasharray="3 3" />
              )}
            </svg>

            {/* X-Axis Labels */}
            <div className="flex justify-between px-10 text-[11px] text-gray-400 mt-1 font-medium">
              <span>Oct-01</span>
              <span>Oct-02</span>
              <span>Oct-03</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. KEYWORDS IN SERP (PROPORTIONAL SEGMENT BAR + 3 TABLES) */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-gray-900">Keywords in SERP</h3>
            <span className="text-[10px] text-gray-400 cursor-help">ⓘ</span>
          </div>
        </div>

        {/* Total Big Value */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-gray-900">{totalKeywords || 75}</span>
          <span className="text-xs text-gray-400 font-medium">keywords currently monitored</span>
        </div>

        {/* Linear Distribution Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-100 shadow-2xs">
          <div style={{ width: `${Math.max(5, jumpedPct)}%` }} className="bg-[#36B37E] h-full" title={`Jumped ${jumpedCount} (${jumpedPct}%)`} />
          <div style={{ width: `${Math.max(5, droppedPct)}%` }} className="bg-[#F44336] h-full" title={`Dropped ${droppedCount} (${droppedPct}%)`} />
          <div style={{ width: `${Math.max(20, unchangedPct)}%` }} className="bg-[#D6D8E3] h-full" title={`Unchanged ${unchangedCount} (${unchangedPct}%)`} />
        </div>

        {/* Segment Labels */}
        <div className="flex items-center gap-6 text-xs font-semibold text-gray-700 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#36B37E]" />
            <span>Jumped {jumpedCount} ({jumpedPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#F44336]" />
            <span>Dropped {droppedCount} ({droppedPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#D6D8E3]" />
            <span>Unchanged {unchangedCount} ({unchangedPct}%)</span>
          </div>
        </div>

        {/* 3 Side-by-Side Comparison Tables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
          {/* Table 1: Jumped */}
          <div className="border border-gray-200 rounded-xl p-3 bg-white">
            <div className="text-xs font-bold text-gray-800 pb-2 border-b border-gray-100 flex items-center justify-between">
              <span>Jumped ({jumpedCount})</span>
              <div className="flex items-center gap-6 text-[10px] text-gray-400">
                <span>%</span>
                <span>Keywords</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100 text-xs">
              {[
                { name: 'Top 1', color: '#36B37E', pct: '0%', count: 0 },
                { name: 'Top 2-3', color: '#4ABA8B', pct: '12.1%', count: 4 },
                { name: 'Top 4-5', color: '#5EC298', pct: '36.4%', count: 12 },
                { name: 'Top 6-10', color: '#72CAA4', pct: '30.3%', count: 10 },
                { name: 'Top 11-30', color: '#86D1B2', pct: '12.1%', count: 4 },
                { name: 'Top 31-100', color: '#9AD9BE', pct: '9.1%', count: 3 },
                { name: '>100', color: '#AFE1CB', pct: '0%', count: 0 },
              ].map((row, i) => (
                <div key={i} className="py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: row.color }} />
                    <span className="font-medium text-gray-700">{row.name}</span>
                  </div>
                  <div className="flex items-center gap-8 font-medium">
                    <span className="text-gray-500 w-10 text-right">{row.pct}</span>
                    <span className="text-gray-900 font-bold w-6 text-right">{row.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table 2: Dropped */}
          <div className="border border-gray-200 rounded-xl p-3 bg-white">
            <div className="text-xs font-bold text-gray-800 pb-2 border-b border-gray-100 flex items-center justify-between">
              <span>Dropped ({droppedCount})</span>
              <div className="flex items-center gap-6 text-[10px] text-gray-400">
                <span>%</span>
                <span>Keywords</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100 text-xs">
              {[
                { name: 'Top 1', color: '#F44336', pct: '0%', count: 0 },
                { name: 'Top 2-3', color: '#F5554A', pct: '0%', count: 0 },
                { name: 'Top 4-5', color: '#F6695E', pct: '8.3%', count: 2 },
                { name: 'Top 6-10', color: '#F77B72', pct: '16.7%', count: 4 },
                { name: 'Top 11-30', color: '#F88E86', pct: '8.3%', count: 2 },
                { name: 'Top 31-100', color: '#F9A19A', pct: '8.3%', count: 2 },
                { name: '>100', color: '#FBB4AF', pct: '58.3%', count: 14 },
              ].map((row, i) => (
                <div key={i} className="py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: row.color }} />
                    <span className="font-medium text-gray-700">{row.name}</span>
                  </div>
                  <div className="flex items-center gap-8 font-medium">
                    <span className="text-gray-500 w-10 text-right">{row.pct}</span>
                    <span className="text-gray-900 font-bold w-6 text-right">{row.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table 3: Unchanged */}
          <div className="border border-gray-200 rounded-xl p-3 bg-white">
            <div className="text-xs font-bold text-gray-800 pb-2 border-b border-gray-100 flex items-center justify-between">
              <span>Unchanged ({unchangedCount})</span>
              <div className="flex items-center gap-6 text-[10px] text-gray-400">
                <span>%</span>
                <span>Keywords</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100 text-xs">
              {[
                { name: 'Top 1', color: '#D6D8E3', pct: '0%', count: 0 },
                { name: 'Top 2-3', color: '#DADCDE', pct: '3.4%', count: 10 },
                { name: 'Top 4-5', color: '#DEE0E7', pct: '2%', count: 6 },
                { name: 'Top 6-10', color: '#E2E4EB', pct: '4%', count: 12 },
                { name: 'Top 11-30', color: '#E6E8EE', pct: '1.3%', count: 4 },
                { name: 'Top 31-100', color: '#EAEBF1', pct: '0%', count: 0 },
                { name: '>100', color: '#EFEFF4', pct: '89.2%', count: 265 },
              ].map((row, i) => (
                <div key={i} className="py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: row.color }} />
                    <span className="font-medium text-gray-700">{row.name}</span>
                  </div>
                  <div className="flex items-center gap-8 font-medium">
                    <span className="text-gray-500 w-10 text-right">{row.pct}</span>
                    <span className="text-gray-900 font-bold w-6 text-right">{row.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7. KEYWORD OVERVIEW (TOP, JUMPED, DROPPED) */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-gray-900">Keyword overview</h3>
            <span className="text-[10px] text-gray-400 cursor-help">ⓘ</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-gray-600">
              <span>Groups:</span>
              <div className="px-2.5 py-1 bg-white border border-gray-300 rounded text-gray-700 font-medium flex items-center gap-1 cursor-pointer">
                <Folder className="w-3.5 h-3.5 text-gray-400" />
                <span>All groups</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-gray-600">
              <span>View mode:</span>
              <div className="px-2.5 py-1 bg-white border border-gray-300 rounded text-gray-700 font-medium flex items-center gap-1 cursor-pointer">
                <ListIcon className="w-3.5 h-3.5 text-gray-400" />
                <span>List</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <button
                type="button"
                onClick={() => setKeywordMetricMode('visibility')}
                className={`px-3 py-1 cursor-pointer font-medium ${
                  keywordMetricMode === 'visibility' ? 'bg-[#1863FD] text-white' : 'bg-white text-gray-600'
                }`}
              >
                Visibility
              </button>
              <button
                type="button"
                onClick={() => setKeywordMetricMode('traffic')}
                className={`px-3 py-1 cursor-pointer font-medium ${
                  keywordMetricMode === 'traffic' ? 'bg-[#1863FD] text-white' : 'bg-white text-gray-600'
                }`}
              >
                Traffic Forecast
              </button>
            </div>
          </div>
        </div>

        {/* 3 Mini Keyword Tables Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Table 1: TOP keywords */}
          <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between">
            <div>
              <div className="bg-gray-50/80 px-3 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                <span>TOP keywords</span>
                <div className="flex items-center gap-8">
                  <span>Positions</span>
                  <span>Visibility</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                {displayTopKeywords.map((item, i) => (
                  <div key={i} className="px-3 py-2 flex items-center justify-between hover:bg-gray-50/70">
                    <span className="font-medium text-gray-800 truncate max-w-[140px]" title={item.keyword}>
                      {item.keyword}
                    </span>
                    <div className="flex items-center gap-10">
                      <span className="font-bold text-gray-900 w-6 text-center">#{item.rank}</span>
                      <span className="text-gray-600 w-10 text-right font-medium">100%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-2 border-t border-gray-100 bg-gray-50/40 text-center">
              <button type="button" className="text-xs text-[#1863FD] font-semibold hover:underline">
                View all ({totalKeywords || 354}) →
              </button>
            </div>
          </div>

          {/* Table 2: Jumped */}
          <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between">
            <div>
              <div className="bg-gray-50/80 px-3 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                <span>Jumped</span>
                <div className="flex items-center gap-8">
                  <span>Positions</span>
                  <span>Visibility</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                {displayJumped.map((item, i) => (
                  <div key={i} className="px-3 py-2 flex items-center justify-between hover:bg-gray-50/70">
                    <span className="font-medium text-gray-800 truncate max-w-[140px]" title={item.keyword}>
                      {item.keyword}
                    </span>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1 w-12 text-center">
                        <span className="font-bold text-gray-900">#{item.rank}</span>
                        <span className="text-[10px] text-[#36B37E] font-bold">▲{item.change}</span>
                      </div>
                      <span className="text-gray-600 w-10 text-right font-medium">100%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-2 border-t border-gray-100 bg-gray-50/40 text-center">
              <button type="button" className="text-xs text-[#1863FD] font-semibold hover:underline">
                View all ({jumpedCount || 33}) →
              </button>
            </div>
          </div>

          {/* Table 3: Dropped */}
          <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between">
            <div>
              <div className="bg-gray-50/80 px-3 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                <span>Dropped</span>
                <div className="flex items-center gap-8">
                  <span>Positions</span>
                  <span>Visibility</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                {displayDropped.map((item, i) => (
                  <div key={i} className="px-3 py-2 flex items-center justify-between hover:bg-gray-50/70">
                    <span className="font-medium text-gray-800 truncate max-w-[140px]" title={item.keyword}>
                      {item.keyword}
                    </span>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1 w-12 text-center">
                        <span className="font-bold text-gray-900">#{item.rank}</span>
                        <span className="text-[10px] text-[#F44336] font-bold">▼{Math.abs(item.change)}</span>
                      </div>
                      <span className="text-gray-600 w-10 text-right font-medium">85%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-2 border-t border-gray-100 bg-gray-50/40 text-center">
              <button type="button" className="text-xs text-[#1863FD] font-semibold hover:underline">
                View all ({droppedCount || 24}) →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 8. PAGES SECTION */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-gray-900">Pages</h3>
            <span className="text-[10px] text-gray-400 cursor-help">ⓘ</span>
          </div>

          <div className="flex items-center border border-gray-300 rounded overflow-hidden text-xs">
            {(['top', 'improved', 'declined'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setPagesTab(tab)}
                className={`px-3 py-1 capitalize cursor-pointer font-medium ${
                  pagesTab === tab ? 'bg-[#1863FD] text-white' : 'bg-white text-gray-600'
                }`}
              >
                {tab === 'improved' ? 'Jumped' : tab === 'declined' ? 'Dropped' : 'Top'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3">URL IN SERP</th>
                <th className="py-2.5 px-3 text-right">TOTAL KEYWORDS</th>
                <th className="py-2.5 px-3 text-right">TRAFFIC FORECAST</th>
                <th className="py-2.5 px-3 text-right">AVERAGE POSITION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {[
                {
                  title: `${cleanDomain} / meeting-recording`,
                  url: `https://${cleanDomain}/meeting-recording`,
                  keywords: 6,
                  kwDiff: 1,
                  traffic: 4.1,
                  trafficDiff: 2.1,
                  avgPos: 5,
                  avgDiff: 36,
                },
                {
                  title: `${cleanDomain} / chats-contacts-free`,
                  url: `https://${cleanDomain}/chats-contacts-free`,
                  keywords: 1,
                  traffic: 0.6,
                  avgPos: 5,
                },
                {
                  title: `${cleanDomain} / desktop-startup-settings`,
                  url: `https://${cleanDomain}/desktop-startup-settings`,
                  keywords: 6,
                  kwDiff: 2,
                  traffic: 2.8,
                  trafficDiff: 1.0,
                  avgPos: 6,
                  avgDiff: 4,
                },
                {
                  title: `${cleanDomain} / screen-sharing-control`,
                  url: `https://${cleanDomain}/screen-sharing-control`,
                  keywords: 24,
                  kwDiff: 3,
                  traffic: 26.8,
                  trafficDiff: 2.0,
                  avgPos: 9,
                  avgDiff: -1,
                },
              ].map((p, idx) => (
                <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      <div className="font-semibold text-gray-900">{p.title}</div>
                      <div className="text-[11px] text-[#1863FD] truncate max-w-md">{p.url}</div>
                    </a>
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <span>{p.keywords}</span>
                      {p.kwDiff && <span className="text-[10px] text-[#36B37E] font-bold">▲{p.kwDiff}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <span>{p.traffic}</span>
                      {p.trafficDiff && <span className="text-[10px] text-[#36B37E] font-bold">▲{p.trafficDiff}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <span>{p.avgPos}</span>
                      {p.avgDiff && (
                        <span className={`text-[10px] font-bold ${p.avgDiff > 0 ? 'text-[#36B37E]' : 'text-[#F44336]'}`}>
                          {p.avgDiff > 0 ? `▲${p.avgDiff}` : `▼${Math.abs(p.avgDiff)}`}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. COMPETITORS SECTION */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-gray-900">Competitors</h3>
            <span className="text-[10px] text-gray-400 cursor-help">ⓘ</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-2.5 px-3">DOMAIN</th>
                <th className="py-2.5 px-3 text-right">SEARCH VISIBILITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {[
                { domain: 'www.microsoft.com', visibility: '32.6%', diff: '-18.2%', isWorse: true, width: '33%' },
                { domain: 'support.microsoft.com', visibility: '32.0%', diff: '-14.1%', isWorse: true, width: '32%' },
                { domain: 'learn.microsoft.com', visibility: '29.7%', diff: '+17.4%', isWorse: false, width: '30%' },
                { domain: 'www.reddit.com', visibility: '28.0%', diff: '+15.8%', isWorse: false, width: '28%' },
              ].map((c, i) => (
                <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-blue-50 rounded-full overflow-hidden">
                        <div className="bg-[#1863FD] h-full" style={{ width: c.width }} />
                      </div>
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${c.domain}`}
                        alt={c.domain}
                        className="w-4 h-4 rounded-xs"
                      />
                      <span className="font-semibold text-gray-900">{c.domain}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-bold text-gray-900">{c.visibility}</span>
                      <span className={`text-[10px] font-bold ${c.isWorse ? 'text-[#F44336]' : 'text-[#36B37E]'}`}>
                        {c.isWorse ? `▼ ${c.diff}` : `▲ ${c.diff}`}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
