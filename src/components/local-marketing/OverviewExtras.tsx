'use client';

import React, { useState } from 'react';
import { 
  Star, 
  ArrowRight, 
  ChevronDown, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  Phone, 
  MapPin, 
  Type, 
  MessageSquare,
  X
} from 'lucide-react';

interface OverviewExtrasProps {
  onNavigateTab: (tab: any) => void;
}

interface SourceConfig {
  id: string;
  name: string;
  color: string;
  bgDot: string;
}

const ALL_SOURCES: SourceConfig[] = [
  { id: 'citysquares', name: 'City squares', color: '#8B5CF6', bgDot: 'bg-[#8B5CF6]' },
  { id: 'ezlocal', name: 'Ezlocal', color: '#10B981', bgDot: 'bg-[#10B981]' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', bgDot: 'bg-[#1877F2]' },
  { id: 'findopen', name: 'FindOpen', color: '#EC4899', bgDot: 'bg-[#EC4899]' },
  { id: 'google', name: 'Google', color: '#3B82F6', bgDot: 'bg-[#3B82F6]' },
  { id: 'judysbook', name: "Judy's Book", color: '#EF4444', bgDot: 'bg-[#EF4444]' },
  { id: 'n49', name: 'N49', color: '#64748B', bgDot: 'bg-[#64748B]' },
  { id: 'showmelocal', name: 'ShowMeLocal', color: '#6366F1', bgDot: 'bg-[#6366F1]' },
  { id: 'tripadvisor', name: 'Tripadvisor', color: '#00AA6C', bgDot: 'bg-[#00AA6C]' },
  { id: 'whereto', name: 'WhereTo', color: '#059669', bgDot: 'bg-[#059669]' },
];

interface ScatterPoint {
  id: string;
  sourceId: string;
  monthIndex: number; // 0 to 11 (Oct 2025 to Sep 2026)
  rowId: '5' | '4' | '3' | '2' | '1' | 'rec' | 'not_rec' | 'dash';
  xOffsetPercent?: number; // micro shift inside the month column
  tooltipText: string;
}

const SCATTER_POINTS: ScatterPoint[] = [
  // 5.0 ★
  { id: 'p1', sourceId: 'findopen', monthIndex: 3, rowId: '5', tooltipText: 'FindOpen - 5.0 ★ (Jan 2026)' },
  { id: 'p2', sourceId: 'findopen', monthIndex: 6, rowId: '5', tooltipText: 'FindOpen - 5.0 ★ (Apr 2026)' },
  { id: 'p3', sourceId: 'google', monthIndex: 7, rowId: '5', tooltipText: 'Google - 5.0 ★ (May 2026)' },

  // 4.0 ★
  { id: 'p4', sourceId: 'google', monthIndex: 2, rowId: '4', tooltipText: 'Google - 4.0 ★ (Dec 2025)' },
  { id: 'p5', sourceId: 'tripadvisor', monthIndex: 4, rowId: '4', xOffsetPercent: -6, tooltipText: 'Tripadvisor - 4.0 ★ (Feb 2026)' },
  { id: 'p6', sourceId: 'findopen', monthIndex: 4, rowId: '4', xOffsetPercent: 6, tooltipText: 'FindOpen - 4.0 ★ (Feb 2026)' },
  { id: 'p7', sourceId: 'google', monthIndex: 6, rowId: '4', tooltipText: 'Google - 4.0 ★ (Apr 2026)' },
  { id: 'p8', sourceId: 'tripadvisor', monthIndex: 7, rowId: '4', xOffsetPercent: -6, tooltipText: 'Tripadvisor - 4.0 ★ (May 2026)' },
  { id: 'p9', sourceId: 'findopen', monthIndex: 7, rowId: '4', xOffsetPercent: 6, tooltipText: 'FindOpen - 4.0 ★ (May 2026)' },

  // 3.0 ★
  { id: 'p10', sourceId: 'google', monthIndex: 6, rowId: '3', tooltipText: 'Google - 3.0 ★ (Apr 2026)' },

  // 2.0 ★
  { id: 'p11', sourceId: 'citysquares', monthIndex: 0, rowId: '2', tooltipText: 'City squares - 2.0 ★ (Oct 2025)' },
  { id: 'p12', sourceId: 'findopen', monthIndex: 1, rowId: '2', tooltipText: 'FindOpen - 2.0 ★ (Nov 2025)' },
  { id: 'p13', sourceId: 'google', monthIndex: 2, rowId: '2', tooltipText: 'Google - 2.0 ★ (Dec 2025)' },
  { id: 'p14', sourceId: 'findopen', monthIndex: 5, rowId: '2', tooltipText: 'FindOpen - 2.0 ★ (Mar 2026)' },

  // 1.0 ★
  { id: 'p15', sourceId: 'google', monthIndex: 5, rowId: '1', tooltipText: 'Google - 1.0 ★ (Mar 2026)' },
  { id: 'p16', sourceId: 'google', monthIndex: 6, rowId: '1', xOffsetPercent: -6, tooltipText: 'Google - 1.0 ★ (Apr 2026)' },
  { id: 'p17', sourceId: 'google', monthIndex: 6, rowId: '1', xOffsetPercent: 6, tooltipText: 'Google - 1.0 ★ (Apr 2026)' },

  // 👍 Recommended
  { id: 'p18', sourceId: 'tripadvisor', monthIndex: 0, rowId: 'rec', tooltipText: 'Tripadvisor - Recommended (Oct 2025)' },
  { id: 'p19', sourceId: 'tripadvisor', monthIndex: 4, rowId: 'rec', tooltipText: 'Tripadvisor - Recommended (Feb 2026)' },
  { id: 'p20', sourceId: 'tripadvisor', monthIndex: 5, rowId: 'rec', tooltipText: 'Tripadvisor - Recommended (Mar 2026)' },
  { id: 'p21', sourceId: 'tripadvisor', monthIndex: 6, rowId: 'rec', tooltipText: 'Tripadvisor - Recommended (Apr 2026)' },
  { id: 'p22', sourceId: 'tripadvisor', monthIndex: 7, rowId: 'rec', tooltipText: 'Tripadvisor - Recommended (May 2026)' },

  // 👎 Not recommended
  { id: 'p23', sourceId: 'tripadvisor', monthIndex: 8, rowId: 'not_rec', tooltipText: 'Tripadvisor - Not Recommended (Jun 2026)' },
  { id: 'p24', sourceId: 'tripadvisor', monthIndex: 9, rowId: 'not_rec', tooltipText: 'Tripadvisor - Not Recommended (Jul 2026)' },

  // - ★ Not rated
  { id: 'p25', sourceId: 'judysbook', monthIndex: 1, rowId: 'dash', tooltipText: "Judy's Book - Not Rated (Nov 2025)" },
  { id: 'p26', sourceId: 'ezlocal', monthIndex: 3, rowId: 'dash', tooltipText: 'Ezlocal - Not Rated (Jan 2026)' },
  { id: 'p27', sourceId: 'findopen', monthIndex: 4, rowId: 'dash', tooltipText: 'FindOpen - Not Rated (Feb 2026)' },
  { id: 'p28', sourceId: 'n49', monthIndex: 5, rowId: 'dash', xOffsetPercent: -6, tooltipText: 'N49 - Not Rated (Mar 2026)' },
  { id: 'p29', sourceId: 'findopen', monthIndex: 5, rowId: 'dash', xOffsetPercent: 6, tooltipText: 'FindOpen - Not Rated (Mar 2026)' },
  { id: 'p30', sourceId: 'google', monthIndex: 6, rowId: 'dash', tooltipText: 'Google - Not Rated (Apr 2026)' },
  { id: 'p31', sourceId: 'judysbook', monthIndex: 7, rowId: 'dash', tooltipText: "Judy's Book - Not Rated (May 2026)" },
  { id: 'p32', sourceId: 'findopen', monthIndex: 9, rowId: 'dash', tooltipText: 'FindOpen - Not Rated (Jul 2026)' },
  { id: 'p33', sourceId: 'ezlocal', monthIndex: 10, rowId: 'dash', tooltipText: 'Ezlocal - Not Rated (Aug 2026)' },
  { id: 'p34', sourceId: 'judysbook', monthIndex: 11, rowId: 'dash', tooltipText: "Judy's Book - Not Rated (Sep 2026)" },
];

const MONTHS = [
  'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026',
  'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026',
  'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026',
];

export function OverviewExtras({ onNavigateTab }: OverviewExtrasProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('ALL');
  const [selectedSources, setSelectedSources] = useState<string[]>(
    ALL_SOURCES.map((s) => s.id)
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<ScatterPoint | null>(null);

  const toggleSource = (sourceId: string) => {
    setSelectedSources((prev) =>
      prev.includes(sourceId)
        ? prev.filter((id) => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedSources.length === ALL_SOURCES.length) {
      setSelectedSources([]);
    } else {
      setSelectedSources(ALL_SOURCES.map((s) => s.id));
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* ========================================================================= */}
      {/* 1. BUSINESS LISTINGS CARD                                                 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-gray-200/90 p-6 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 mb-6">Business Listings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Left Column: MENTIONS FOUND */}
          <div className="space-y-4 pr-0 md:pr-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <span>MENTIONS FOUND</span>
              <span className="text-gray-400 cursor-pointer text-xs">ℹ</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[#0B69FF]">57</span>
              <span className="text-xl font-bold text-gray-400">/ 60</span>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('listings')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-2xs cursor-pointer"
              >
                <span>→ VIEW WHOLE LIST</span>
              </button>
              <span className="text-xs text-gray-600 font-medium">in 3 missing directories</span>
            </div>
          </div>

          {/* Right Column: NAP ERRORS */}
          <div className="space-y-4 pt-6 md:pt-0 md:pl-8">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <span>NAP ERRORS</span>
              <span className="text-gray-400 cursor-pointer text-xs">ℹ</span>
            </div>

            <div className="flex items-center gap-10">
              <span className="text-4xl font-extrabold text-[#0B69FF]">6</span>

              <div className="flex items-center gap-8">
                {/* NAME */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                    <Type className="w-3.5 h-3.5 text-gray-600" />
                    <span>NAME</span>
                  </div>
                  <span className="text-sm font-bold text-[#0B69FF] mt-0.5">2</span>
                </div>

                {/* ADDRESS */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-600" />
                    <span>ADDRESS</span>
                  </div>
                  <span className="text-sm font-bold text-[#0B69FF] mt-0.5">2</span>
                </div>

                {/* PHONE */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                    <Phone className="w-3.5 h-3.5 text-gray-600" />
                    <span>PHONE</span>
                  </div>
                  <span className="text-sm font-bold text-[#0B69FF] mt-0.5">2</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('listings')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-2xs cursor-pointer"
              >
                <span>→ VIEW ERRORS</span>
              </button>
              <span className="text-xs text-gray-600 font-medium">in 57 directories</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REVIEWS MAIN CARD                                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-gray-200/90 p-6 shadow-xs space-y-8">
        <h3 className="text-base font-bold text-gray-900">Reviews</h3>

        {/* Top Split: OVERVIEW + TOP SOURCES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* OVERVIEW (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <span>OVERVIEW</span>
              <span className="text-gray-400 cursor-pointer text-xs">ℹ</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Rating Number & Stars */}
              <div className="space-y-1.5 shrink-0">
                <div className="text-4xl font-extrabold text-[#0B69FF]">3.8</div>
                <div className="flex items-center gap-0.5 text-[#F59E0B]">
                  <Star className="w-4 h-4 fill-[#F59E0B] stroke-[#F59E0B]" />
                  <Star className="w-4 h-4 fill-[#F59E0B] stroke-[#F59E0B]" />
                  <Star className="w-4 h-4 fill-[#F59E0B] stroke-[#F59E0B]" />
                  <div className="relative w-4 h-4">
                    <Star className="w-4 h-4 text-gray-300 stroke-gray-300 absolute inset-0" />
                    <div className="overflow-hidden absolute inset-0 w-[80%]">
                      <Star className="w-4 h-4 fill-[#F59E0B] stroke-[#F59E0B]" />
                    </div>
                  </div>
                  <Star className="w-4 h-4 text-gray-300 stroke-gray-300" />
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pt-0.5">
                  NUMBER OF REVIEWS:
                  <div className="text-xs font-bold text-gray-900">60</div>
                </div>
              </div>

              {/* Real Horizontal Progress Bars */}
              <div className="flex-1 space-y-2 pt-1 w-full max-w-sm">
                {[
                  { label: 'POSITIVE', count: 25, color: '#10B981', pct: 55 },
                  { label: 'NEUTRAL', count: 4, color: '#64748B', pct: 9 },
                  { label: 'NEGATIVE', count: 10, color: '#EF4444', pct: 22 },
                  { label: 'NOT RATED', count: 11, color: '#94A3B8', pct: 24 },
                  { label: 'RECOMMENDED', count: 7, color: '#34D399', pct: 15 },
                  { label: 'NOT RECOMMENDED', count: 2, color: '#EF4444', pct: 5 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center text-xs">
                    <span className="w-32 text-[10px] font-bold text-gray-500 uppercase tracking-tight shrink-0">
                      {item.label}
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mx-3">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs font-bold text-gray-800">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('reviews')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-2xs cursor-pointer"
              >
                <span>→ VIEW ALL</span>
              </button>
            </div>
          </div>

          {/* TOP SOURCES (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <span>TOP SOURCES</span>
              <span className="text-gray-400 cursor-pointer text-xs">ℹ</span>
            </div>

            {/* 3 Real Social Platform Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Google */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Real Google 'G' SVG Logo */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <div className="flex items-center gap-1 font-bold text-xs text-gray-900">
                    <span className="text-[#F59E0B]">★</span>
                    <span>3.56</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                  <span>16</span>
                </div>
              </div>

              {/* Tripadvisor */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Real Tripadvisor Owl SVG Logo */}
                  <div className="w-5 h-5 rounded-full bg-[#00AA6C] flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-4 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm8 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm-4-6.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-xs text-gray-900">
                    <span className="text-[#F59E0B]">★</span>
                    <span>3.70</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                  <span>16</span>
                </div>
              </div>

              {/* Facebook */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Real Facebook 'f' SVG Logo */}
                  <div className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-xs text-gray-900">
                    <span className="text-[#F59E0B]">★</span>
                    <span>4.33</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                  <span>9</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigateTab('reviews')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-2xs cursor-pointer"
              >
                <span>→ VIEW ALL</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. INSIGHTS SUB-SECTION                                                  */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <span>INSIGHTS</span>
              <span className="text-gray-400 cursor-pointer text-xs">ℹ</span>
            </div>
            <h4 className="text-sm font-bold text-gray-900 mt-1">
              What customers say about your business
            </h4>
          </div>

          {/* 5 Rating Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* 5.0 ★ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-gray-100">
                <span className="font-bold text-[#0B69FF] flex items-center gap-1">
                  <span>5.0</span>
                  <span className="text-[#F59E0B]">★</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Frequency in reviews</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { text: 'italian', freq: 7 },
                  { text: 'servicio', freq: 3 },
                  { text: 'breakfast', freq: 2 },
                  { text: 'calidad', freq: 2 },
                  { text: 'este', freq: 1 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-2.5 py-1 bg-[#EDF7ED] text-[#2E7D32] rounded-full text-xs font-medium"
                  >
                    <span>{item.text}</span>
                    <span className="text-[11px] font-bold text-gray-600">{item.freq}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4.0 ★ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-gray-100">
                <span className="font-bold text-[#0B69FF] flex items-center gap-1">
                  <span>4.0</span>
                  <span className="text-[#F59E0B]">★</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Frequency in reviews</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { text: 'restaurant', freq: 6 },
                  { text: 'waiter', freq: 4 },
                  { text: 'waiters', freq: 4 },
                  { text: 'order', freq: 4 },
                  { text: 'experience', freq: 3 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-2.5 py-1 bg-[#F1F8E9] text-[#558B2F] rounded-full text-xs font-medium"
                  >
                    <span>{item.text}</span>
                    <span className="text-[11px] font-bold text-gray-600">{item.freq}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3.0 ★ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-gray-100">
                <span className="font-bold text-[#0B69FF] flex items-center gap-1">
                  <span>3.0</span>
                  <span className="text-[#F59E0B]">★</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Frequency in reviews</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { text: 'food', freq: 15 },
                  { text: 'pasta', freq: 9 },
                  { text: 'place', freq: 5 },
                  { text: 'service', freq: 5 },
                  { text: 'people', freq: 3 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-2.5 py-1 bg-[#FFF9C4] text-[#F57F17] rounded-full text-xs font-medium"
                  >
                    <span>{item.text}</span>
                    <span className="text-[11px] font-bold text-gray-600">{item.freq}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2.0 ★ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-gray-100">
                <span className="font-bold text-[#0B69FF] flex items-center gap-1">
                  <span>2.0</span>
                  <span className="text-[#F59E0B]">★</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Frequency in reviews</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { text: 'customer service', freq: 2 },
                  { text: 'recepcionista', freq: 1 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-2.5 py-1 bg-[#FFE0B2] text-[#E65100] rounded-full text-xs font-medium"
                  >
                    <span>{item.text}</span>
                    <span className="text-[11px] font-bold text-gray-600">{item.freq}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 1.0 ★ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-gray-100">
                <span className="font-bold text-[#0B69FF] flex items-center gap-1">
                  <span>1.0</span>
                  <span className="text-[#F59E0B]">★</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Frequency in reviews</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { text: 'more than an hour', freq: 1 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-2.5 py-1 bg-[#FFCDD2] text-[#C62828] rounded-full text-xs font-medium"
                  >
                    <span>{item.text}</span>
                    <span className="text-[11px] font-bold text-gray-600">{item.freq}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateTab('insights')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-2xs cursor-pointer"
            >
              <span>→ VIEW ALL</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. REVIEWS TIMELINE & SCATTER PLOT MATRIX                                 */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <span>REVIEWS</span>
            <span className="text-gray-400 cursor-pointer text-xs">ℹ</span>
          </div>

          {/* Controls Bar: Timeframe tabs + Group By + All Sources Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 relative">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Timeframe Filter Buttons */}
              <div className="flex items-center gap-3 text-xs font-bold">
                {['ALL', '7D', '1M', '3M', '6M', '1Y'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`cursor-pointer transition-colors ${
                      selectedTimeframe === tf
                        ? 'text-gray-900 border-b-2 border-gray-900 pb-0.5'
                        : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Group by selector */}
              <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold border-l border-gray-200 pl-4">
                <span>GROUP BY:</span>
                <span className="text-[#0B69FF] font-bold flex items-center gap-0.5 cursor-pointer">
                  MONTHS
                  <ChevronDown className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Real Interactive Dropdown: "10 ✕ All Sources Selected ˅" */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-800 shadow-2xs hover:border-gray-400 transition-colors cursor-pointer"
              >
                <span className="bg-gray-900 text-white rounded-sm px-1.5 py-0.2 text-[10px] font-bold flex items-center gap-1">
                  <span>{selectedSources.length}</span>
                  <X className="w-2.5 h-2.5" />
                </span>
                <span>
                  {selectedSources.length === ALL_SOURCES.length
                    ? 'All Sources Selected'
                    : `${selectedSources.length} Selected`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {/* Dropdown Menu popover */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-30 py-2 divide-y divide-gray-100">
                  <div className="px-3 py-1.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-600 text-[11px]">Filter Sources</span>
                    <button
                      onClick={toggleSelectAll}
                      className="text-[#0B69FF] hover:underline font-semibold text-[11px] cursor-pointer"
                    >
                      {selectedSources.length === ALL_SOURCES.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1">
                    {ALL_SOURCES.map((source) => {
                      const isSelected = selectedSources.includes(source.id);
                      return (
                        <div
                          key={source.id}
                          onClick={() => toggleSource(source.id)}
                          className={`flex items-center gap-2.5 px-3 py-1.5 text-xs cursor-pointer transition-colors ${
                            source.id === 'tripadvisor'
                              ? 'bg-[#E0E7FF]/70 text-gray-900 font-semibold'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-gray-900 border-gray-900 text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: source.color }}
                          />
                          <span className="flex-1 truncate">{source.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scatter Plot Matrix Chart */}
          <div className="w-full bg-[#FAFBFD] rounded-xl border border-gray-200 p-4 relative overflow-x-auto">
            <div className="min-w-[720px]">
              {/* Y-Axis rows */}
              <div className="space-y-4">
                {[
                  {
                    id: '5',
                    label: (
                      <span className="flex items-center gap-1 font-bold text-gray-700 text-xs">
                        <span>5.0</span>
                        <span className="text-[#F59E0B]">★</span>
                      </span>
                    ),
                  },
                  {
                    id: '4',
                    label: (
                      <span className="flex items-center gap-1 font-bold text-gray-700 text-xs">
                        <span>4.0</span>
                        <span className="text-[#F59E0B]">★</span>
                      </span>
                    ),
                  },
                  {
                    id: '3',
                    label: (
                      <span className="flex items-center gap-1 font-bold text-gray-700 text-xs">
                        <span>3.0</span>
                        <span className="text-[#F59E0B]">★</span>
                      </span>
                    ),
                  },
                  {
                    id: '2',
                    label: (
                      <span className="flex items-center gap-1 font-bold text-gray-700 text-xs">
                        <span>2.0</span>
                        <span className="text-[#F59E0B]">★</span>
                      </span>
                    ),
                  },
                  {
                    id: '1',
                    label: (
                      <span className="flex items-center gap-1 font-bold text-gray-700 text-xs">
                        <span>1.0</span>
                        <span className="text-[#F59E0B]">★</span>
                      </span>
                    ),
                  },
                  {
                    id: 'rec',
                    label: <ThumbsUp className="w-4 h-4 text-emerald-600 fill-emerald-600" />,
                  },
                  {
                    id: 'not_rec',
                    label: <ThumbsDown className="w-4 h-4 text-rose-500 fill-rose-500" />,
                  },
                  {
                    id: 'dash',
                    label: (
                      <span className="flex items-center gap-1 font-bold text-gray-400 text-xs">
                        <span>-</span>
                        <Star className="w-3.5 h-3.5 text-gray-400 stroke-gray-400" />
                      </span>
                    ),
                  },
                ].map((row) => (
                  <div key={row.id} className="flex items-center relative h-6">
                    {/* Y-axis indicator */}
                    <div className="w-14 shrink-0 flex items-center justify-start pr-2">
                      {row.label}
                    </div>

                    {/* Horizontal Guideline */}
                    <div className="flex-1 h-[1px] bg-gray-200/80 relative">
                      {/* 12 Month Column Centers */}
                      {MONTHS.map((_, mIdx) => {
                        const leftPercent = (mIdx + 0.5) * (100 / 12);
                        // Points on this row and month
                        const matchingPoints = SCATTER_POINTS.filter(
                          (p) =>
                            p.rowId === row.id &&
                            p.monthIndex === mIdx &&
                            selectedSources.includes(p.sourceId)
                        );

                        return (
                          <div
                            key={mIdx}
                            className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto"
                            style={{ left: `${leftPercent}%` }}
                          >
                            {matchingPoints.map((pt) => {
                              const src = ALL_SOURCES.find((s) => s.id === pt.sourceId);
                              const color = src?.color || '#3B82F6';
                              const shift = pt.xOffsetPercent || 0;

                              return (
                                <div
                                  key={pt.id}
                                  onMouseEnter={() => setHoveredPoint(pt)}
                                  onMouseLeave={() => setHoveredPoint(null)}
                                  className="w-3.5 h-3.5 rounded-full cursor-pointer transition-transform hover:scale-150 absolute z-10 shadow-2xs border border-white"
                                  style={{
                                    backgroundColor: color,
                                    left: `${shift}px`,
                                  }}
                                  title={pt.tooltipText}
                                />
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* X-Axis Months */}
              <div className="flex items-center pt-6 pl-14">
                <div className="flex-1 grid grid-cols-12 text-center text-[10px] text-gray-500 font-semibold font-mono">
                  {MONTHS.map((m, i) => (
                    <span key={i} className="truncate">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Hover Tooltip Indicator */}
            {hoveredPoint && (
              <div className="absolute top-2 right-4 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-md shadow-lg pointer-events-none z-20 flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      ALL_SOURCES.find((s) => s.id === hoveredPoint.sourceId)?.color || '#3B82F6',
                  }}
                />
                <span>{hoveredPoint.tooltipText}</span>
              </div>
            )}
          </div>

          {/* Bottom Checkbox Legend for all 10 sources */}
          <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            {ALL_SOURCES.map((source) => {
              const isChecked = selectedSources.includes(source.id);
              return (
                <label
                  key={source.id}
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => toggleSource(source.id)}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center transition-colors ${
                      isChecked ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-gray-700 font-medium">{source.name}</span>
                </label>
              );
            })}
          </div>

          {/* VIEW ALL (10) Button */}
          <div className="pt-2">
            <button
              onClick={() => onNavigateTab('reviews')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-2xs cursor-pointer"
            >
              <span>→ VIEW ALL (10)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
