'use client';

import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Plus,
  RefreshCw,
  Upload,
  Download,
  X,
  PhoneCall,
  Navigation,
  Globe,
  MessageSquare,
} from 'lucide-react';

interface GbpInsightsViewProps {
  onAddLocation: () => void;
}

export function GbpInsightsView({ onAddLocation }: GbpInsightsViewProps) {
  const [selectedViewsFilter, setSelectedViewsFilter] = useState<'ALL' | '7D' | '1M' | '3M' | '6M' | '1Y'>('ALL');
  const [selectedKwPeriod, setSelectedKwPeriod] = useState<'3M' | '6M' | '1Y'>('3M');
  const [isConnectBannerDismissed, setIsConnectBannerDismissed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleUpdate = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleExport = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Metric,Value,Period\nTotal Views,18450,Last 30 Days\nSearches,14200,Last 30 Days\nDirect Actions,4250,Last 30 Days\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'gbp-insights-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Google Business Profile Insights</h1>
          <p className="text-xs text-gray-500">
            Real performance tracking of customer views, discovery searches, and direct engagements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddLocation}
            className="px-3.5 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD LOCATION</span>
          </button>
          <button
            onClick={handleUpdate}
            className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isRefreshing ? 'SYNCING...' : 'UPDATE'}</span>
          </button>
          <button
            onClick={handleExport}
            className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* Views by Platform and Device matching Screenshot 11 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wider">
            VIEWS BY PLATFORM AND DEVICE ⓘ
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Donut (5 Cols) */}
          <div className="md:col-span-6 flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                {/* Mobile Search: 38.9% */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22C55E" strokeWidth="4" strokeDasharray="38.9 61.1" strokeDashoffset="0" />
                {/* Mobile Maps: 27.1% */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0B69FF" strokeWidth="4" strokeDasharray="27.1 72.9" strokeDashoffset="-38.9" />
                {/* Desktop Search: 29.8% */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#A855F7" strokeWidth="4" strokeDasharray="29.8 70.2" strokeDashoffset="-66" />
                {/* Desktop Maps: 4.2% */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="4.2 95.8" strokeDashoffset="-95.8" />
              </svg>
              <div className="absolute text-center">
                <div className="text-xl font-black text-gray-900 leading-none">214,538</div>
                <div className="text-[9px] text-gray-400 uppercase font-bold mt-0.5">Total Views</div>
              </div>
            </div>

            {/* Breakdown Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-gray-700">Mobile Search Views</span>
                </div>
                <div className="font-mono">
                  <span className="font-bold text-gray-900">83,381</span>
                  <span className="text-gray-400 ml-2">38.9%</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-gray-700">Mobile Maps Views</span>
                </div>
                <div className="font-mono">
                  <span className="font-bold text-gray-900">58,190</span>
                  <span className="text-gray-400 ml-2">27.1%</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-gray-700">Desktop Search Views</span>
                </div>
                <div className="font-mono">
                  <span className="font-bold text-gray-900">63,912</span>
                  <span className="text-gray-400 ml-2">29.8%</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-gray-700">Desktop Maps Views</span>
                </div>
                <div className="font-mono">
                  <span className="font-bold text-gray-900">9,055</span>
                  <span className="text-gray-400 ml-2">4.2%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Circle Gauges (6 Cols) */}
          <div className="md:col-span-6 grid grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 flex flex-col items-center text-center space-y-2">
              <div className="text-[11px] font-bold text-gray-500 uppercase">
                MOBILE MAPS VS SEARCH VIEWS ⓘ
              </div>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22C55E" strokeWidth="3" strokeDasharray="59 41" strokeDashoffset="0" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0B69FF" strokeWidth="3" strokeDasharray="41 59" strokeDashoffset="-59" />
                </svg>
                <div className="absolute text-sm font-black text-gray-900">121,571</div>
              </div>
            </div>

            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 flex flex-col items-center text-center space-y-2">
              <div className="text-[11px] font-bold text-gray-500 uppercase">
                DESKTOP MAPS VS SEARCH VIEWS ⓘ
              </div>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#A855F7" strokeWidth="3" strokeDasharray="87 13" strokeDashoffset="0" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray="13 87" strokeDashoffset="-87" />
                </svg>
                <div className="absolute text-sm font-black text-gray-900">92,967</div>
              </div>
            </div>
          </div>
        </div>

        {/* Views Timeline Chart matching Screenshot 11 */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 font-bold uppercase">VIEWS</div>
              <div className="text-xl font-black text-gray-900">214,538</div>
            </div>
            <div className="flex border border-gray-200 rounded text-xs font-semibold bg-gray-50 p-0.5">
              {(['ALL', '7D', '1M', '3M', '6M', '1Y'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedViewsFilter(p)}
                  className={`px-2 py-1 rounded cursor-pointer ${
                    selectedViewsFilter === p ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 120">
              <path
                d="M 10 90 Q 150 40 300 70 T 550 50 T 790 30"
                fill="none"
                stroke="#22C55E"
                strokeWidth="2"
              />
              <path
                d="M 10 95 Q 150 60 300 80 T 550 65 T 790 45"
                fill="none"
                stroke="#0B69FF"
                strokeWidth="2"
              />
              <path
                d="M 10 100 Q 150 70 300 85 T 550 75 T 790 60"
                fill="none"
                stroke="#A855F7"
                strokeWidth="2"
              />
              <path
                d="M 10 110 Q 150 95 300 100 T 550 95 T 790 85"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 font-mono border-t border-gray-100 pt-2">
            <span>Oct 01 2025</span>
            <span>Dec 01 2025</span>
            <span>Feb 01 2026</span>
            <span>Apr 01 2026</span>
            <span>Jun 01 2026</span>
            <span>Aug 01 2026</span>
            <span>Sep 01 2026</span>
          </div>
        </div>
      </div>

      {/* Connect a real location banner */}
      {!isConnectBannerDismissed && (
        <div className="bg-white border-2 border-dashed border-[#CCE0F8] rounded-xl p-5 shadow-xs relative">
          <button
            onClick={() => setIsConnectBannerDismissed(true)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <h3 className="font-bold text-sm text-gray-900 mb-1">Connect a real location</h3>
          <p className="text-xs text-gray-600 max-w-3xl leading-relaxed mb-3">
            Connect your verified Google Business Profile to view real-time local search analytics, customer actions, and direct search queries.
          </p>
          <button
            onClick={onAddLocation}
            className="px-4 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD LOCATION</span>
          </button>
        </div>
      )}

      {/* Searches by keywords & 4 Activity Seismographs matching Screenshot 11 & 12 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Searches by keywords (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-gray-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase">Searches by keywords</div>
              <div className="text-xl font-black text-gray-900">163,761</div>
            </div>
            <button
              onClick={() => alert('Exporting keywords list...')}
              className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Download className="w-3 h-3 text-gray-400" />
              <span>EXPORT</span>
            </button>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {[
              { rank: 1, kw: 'food', count: 12501 },
              { rank: 2, kw: 'pasta', count: 11619 },
              { rank: 3, kw: 'italian', count: 5655 },
              { rank: 4, kw: 'restaurant', count: 6615 },
              { rank: 5, kw: 'place', count: 7349 },
            ].map((item) => (
              <div key={item.rank} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-mono w-4">{item.rank}.</span>
                  <span className="font-semibold text-gray-900">{item.kw}</span>
                </div>
                <span className="font-mono font-medium text-gray-700">{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => alert('Viewing full 150 keywords list')}
            className="w-full py-1.5 text-center text-xs font-bold text-[#0B69FF] hover:bg-blue-50/50 rounded transition-colors cursor-pointer"
          >
            VIEW ALL KEYWORDS →
          </button>
        </div>

        {/* Right: Searches Line Graph (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-gray-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase">Searches</div>
              <div className="text-xl font-black text-gray-900">163,761</div>
            </div>
            <div className="flex border border-gray-200 rounded text-xs font-semibold bg-gray-50 p-0.5">
              {(['3M', '6M', '1Y'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedKwPeriod(p)}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    selectedKwPeriod === p ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="h-40 w-full flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 90">
              <polyline
                fill="none"
                stroke="#0D9488"
                strokeWidth="2.5"
                strokeLinecap="round"
                points="10,50 40,40 70,25 100,45 130,50 160,40 190,55 220,42 250,38 280,40"
              />
              {[
                { cx: 10, cy: 50 },
                { cx: 40, cy: 40 },
                { cx: 70, cy: 25 },
                { cx: 100, cy: 45 },
                { cx: 130, cy: 50 },
                { cx: 160, cy: 40 },
                { cx: 190, cy: 55 },
                { cx: 220, cy: 42 },
                { cx: 250, cy: 38 },
                { cx: 280, cy: 40 },
              ].map((pt, i) => (
                <circle key={i} cx={pt.cx} cy={pt.cy} r="3" fill="#0D9488" />
              ))}
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 font-mono border-t border-gray-100 pt-2">
            <span>Oct 01 2025</span>
            <span>Jan 01 2026</span>
            <span>Apr 01 2026</span>
            <span>Jul 01 2026</span>
          </div>
        </div>
      </div>

      {/* 4 Activity Seismographs matching Screenshot 12 */}
      <div className="space-y-4">
        {[
          { title: 'Website visits', count: '5,571', color: '#84CC16', icon: Globe },
          { title: 'Direction requests', count: '1,148', color: '#EC4899', icon: Navigation },
          { title: 'Phone calls', count: '746', color: '#334155', icon: PhoneCall },
          { title: 'Messages', count: '1,352', color: '#F97316', icon: MessageSquare },
        ].map((act, i) => {
          const Icon = act.icon;
          return (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs font-bold text-gray-600">{act.title}</div>
                    <div className="text-lg font-black text-gray-900">{act.count}</div>
                  </div>
                </div>
                <div className="flex border border-gray-200 rounded text-[11px] font-semibold bg-gray-50 p-0.5">
                  {['ALL', '7D', '1M', '3M', '6M', '1Y'].map((t) => (
                    <button key={t} className="px-2 py-0.5 rounded text-gray-500 hover:text-gray-900">
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-16 w-full flex items-end">
                <svg className="w-full h-full" viewBox="0 0 500 50" preserveAspectRatio="none">
                  <path
                    d="M0,35 Q20,10 40,32 T80,30 T120,40 T160,15 T200,32 T240,30 T280,35 T320,28 T360,33 T400,20 T440,35 T480,25 L500,30"
                    fill="none"
                    stroke={act.color}
                    strokeWidth="1.8"
                  />
                </svg>
              </div>

              <div className="flex justify-between text-[9px] text-gray-400 font-mono border-t border-gray-100 pt-1">
                <span>Oct 01 2025</span>
                <span>Dec 01 2025</span>
                <span>Feb 01 2026</span>
                <span>Apr 01 2026</span>
                <span>Jun 01 2026</span>
                <span>Aug 01 2026</span>
                <span>Sep 01 2026</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
