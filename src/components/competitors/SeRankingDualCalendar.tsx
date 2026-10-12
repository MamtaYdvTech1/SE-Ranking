'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, HelpCircle } from 'lucide-react';

export interface SeRankingDualCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (dateRangeStr: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

export function SeRankingDualCalendar({
  isOpen,
  onClose,
  onApply,
  initialStartDate = '8 Oct 2026',
  initialEndDate = '9 Oct 2026',
}: SeRankingDualCalendarProps) {
  // Calendar Months: Left is September 2026, Right is October 2026
  const [selectedDayStart, setSelectedDayStart] = useState<number>(8);
  const [selectedDayEnd, setSelectedDayEnd] = useState<number>(9);
  const [selectedMonth, setSelectedMonth] = useState<'oct'>('oct');

  if (!isOpen) return null;

  // Days in September 2026 (starts on Tuesday = index 1 in M-T-W-T-F-S-S)
  // September has 30 days
  const septDays = Array.from({ length: 30 }, (_, i) => i + 1);
  const septStartOffset = 1; // Tuesday

  // Days in October 2026 (starts on Thursday = index 3 in M-T-W-T-F-S-S)
  // October has 31 days
  const octDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const octStartOffset = 3; // Thursday

  const handleDayClick = (day: number) => {
    if (day === selectedDayStart) {
      // toggle
      setSelectedDayEnd(day);
    } else if (day > selectedDayStart) {
      setSelectedDayEnd(day);
    } else {
      setSelectedDayStart(day);
      setSelectedDayEnd(day);
    }
  };

  const handleApply = () => {
    onApply(`${selectedDayStart} Oct 2026; ${selectedDayEnd} Oct 2026`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E3E6EE] p-6 max-w-2xl w-full space-y-6 animate-in zoom-in-95 duration-150 select-none">
        {/* Month Navigation Headers */}
        <div className="grid grid-cols-2 gap-8 items-center border-b border-[#EEF0F5] pb-3 text-sm font-bold text-[#171B24]">
          {/* Left Month: September 2026 */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="p-1 hover:bg-[#F3F4F8] rounded text-[#8F97A8] hover:text-[#171B24] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#2F65F6]">
              <span>September 2026</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8F97A8]" />
            </div>
            <div className="w-4" />
          </div>

          {/* Right Month: October 2026 */}
          <div className="flex items-center justify-between">
            <div className="w-4" />
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#2F65F6]">
              <span>October 2026</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8F97A8]" />
            </div>
            <button
              type="button"
              className="p-1 hover:bg-[#F3F4F8] rounded text-[#8F97A8] hover:text-[#171B24] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dual Calendar Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* September 2026 Grid */}
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#8F97A8]">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {/* Empty leading cells */}
              {Array.from({ length: septStartOffset }).map((_, i) => (
                <div key={`sept-empty-${i}`} className="h-8" />
              ))}
              {septDays.map((d) => (
                <div
                  key={`sept-${d}`}
                  className="h-8 flex items-center justify-center text-[#525B6C] hover:bg-[#F3F4F8] rounded-md cursor-pointer"
                >
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* October 2026 Grid */}
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#8F97A8]">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {/* Empty leading cells */}
              {Array.from({ length: octStartOffset }).map((_, i) => (
                <div key={`oct-empty-${i}`} className="h-8" />
              ))}
              {octDays.map((d) => {
                const isStart = d === selectedDayStart;
                const isEnd = d === selectedDayEnd;
                const inRange = d >= selectedDayStart && d <= selectedDayEnd;

                let cellClass =
                  'h-8 flex flex-col items-center justify-center rounded-md cursor-pointer transition-colors text-[#171B24] hover:bg-[#F3F4F8]';
                if (inRange) {
                  cellClass =
                    'h-8 flex flex-col items-center justify-center bg-[#2563EB] text-white font-bold cursor-pointer';
                  if (isStart && isEnd) {
                    cellClass += ' rounded-md';
                  } else if (isStart) {
                    cellClass += ' rounded-l-md rounded-r-none';
                  } else if (isEnd) {
                    cellClass += ' rounded-r-md rounded-l-none';
                  } else {
                    cellClass += ' rounded-none bg-[#1D4ED8]';
                  }
                }

                return (
                  <div key={`oct-${d}`} onClick={() => handleDayClick(d)} className={cellClass}>
                    <span>{d}</span>
                    {isEnd && <span className="w-1 h-1 rounded-full bg-white -mt-0.5" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Help Text and Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#EEF0F5]">
          <div className="flex items-center gap-1.5 text-xs text-[#525B6C]">
            <span>Select two dates to measure changes between them.</span>
            <span
              className="w-3.5 h-3.5 rounded-full bg-[#E3E6EE] text-[#525B6C] flex items-center justify-center text-[10px] font-serif cursor-help"
              title="Compare performance across two selected crawling points"
            >
              i
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#525B6C] hover:text-[#171B24] transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              APPLY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
