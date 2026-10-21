'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Folder,
  RefreshCw,
  Trash2,
  Copy,
  SlidersHorizontal,
  BarChart2,
  MoreVertical,
  Settings,
  Users,
  LogOut,
  CreditCard,
  Gift,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';

interface GlobalShadowGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalShadowGuide({ isOpen, onClose }: GlobalShadowGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const handleStart = () => {
      setCurrentStep(0);
    };
    window.addEventListener('seranking_start_tour', handleStart);
    return () => window.removeEventListener('seranking_start_tour', handleStart);
  }, []);

  if (!isOpen) return null;

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(0);
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-[#0B132B]/55 backdrop-blur-[1px] transition-opacity duration-200"
      />

      {/* STEP 1 OF 6: GRAPHS */}
      {currentStep === 0 && (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-4">
          <div className="relative z-10 w-[490px] max-w-[95vw] bg-[#27324B] rounded-xl shadow-2xl p-6 text-white border border-white/10 animate-in fade-in zoom-in-95 duration-150">
            {/* Arrow pointing UP towards Graphs */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[9px] border-b-[#27324B]" />

            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold tracking-tight text-white">Graphs</h3>
              <button
                type="button"
                onClick={handleClose}
                className="text-white/60 hover:text-white transition-colors cursor-pointer p-0.5"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[13px] text-gray-200 leading-relaxed font-normal mb-8">
              Graphs are available for all your projects. You can choose the time period and parameter to display.
            </p>

            <div className="flex items-center justify-between pt-2">
              <div />
              <span className="text-xs text-white/70 font-semibold tracking-wider">1 of 6</span>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white rounded font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 OF 6: ADDITIONAL FEATURES */}
      {currentStep === 1 && (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-4">
          {/* Tour Card */}
          <div className="relative z-20 w-[490px] max-w-[95vw] bg-[#27324B] rounded-xl shadow-2xl p-6 text-white border border-white/10 animate-in fade-in zoom-in-95 duration-150 mb-6">
            {/* Arrow pointing DOWN towards project row */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-[#27324B]" />

            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold tracking-tight text-white">Additional features</h3>
              <button
                type="button"
                onClick={handleClose}
                className="text-white/60 hover:text-white transition-colors cursor-pointer p-0.5"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[13px] text-gray-200 leading-relaxed font-normal mb-8">
              By hovering over a project, you can quickly access the Rankings tab, other main modules, and project settings.
            </p>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2 bg-white text-gray-800 hover:bg-gray-100 rounded font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              >
                BACK
              </button>
              <span className="text-xs text-white/70 font-semibold tracking-wider">2 of 6</span>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white rounded font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Spotlight Highlighted Project Row */}
          <div className="relative z-10 w-full max-w-[1280px] bg-white rounded-lg shadow-[0_0_0_3px_#7C3AED,0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="flex items-center text-xs divide-x divide-gray-100 py-2.5 px-3">
              <div className="flex items-center gap-2 pr-4 min-w-[280px]">
                <span className="text-pink-500 font-bold text-xs select-none">'</span>
                <input type="checkbox" readOnly className="w-3.5 h-3.5 rounded text-[#7C3AED]" />
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <div className="w-4 h-4 rounded bg-[#7C3AED] text-white flex items-center justify-center text-[10px] font-bold">
                  W
                </div>
                <span className="font-semibold text-gray-900">workcomposer.com</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                {/* Spotlight action buttons visible on hover */}
                <div className="flex items-center gap-1 ml-auto">
                  <div className="w-[22px] h-[22px] rounded-[3px] bg-[#7C3AED] text-white flex items-center justify-center shadow-xs">
                    <BarChart2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-[22px] h-[22px] rounded-[3px] bg-[#434F64] text-white flex items-center justify-center shadow-xs">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
              <div className="px-4 text-center text-[#7C3AED] font-bold flex-1">10</div>
              <div className="px-4 text-center font-bold text-gray-800 flex-1">32 <span className="text-emerald-500 text-[10px]">▲ 26</span></div>
              <div className="px-4 text-center font-medium text-gray-700 flex-1">3 / 5 / 6</div>
              <div className="px-4 text-center text-[#7C3AED] font-bold flex-1">20</div>
              <div className="px-4 text-center font-semibold text-gray-800 flex-1">283 <span className="text-emerald-500 text-[10px]">▲ 66</span></div>
              <div className="px-4 text-center font-semibold text-gray-800 flex-1">24.65 <span className="text-emerald-500 text-[10px]">▲ 9.34</span></div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 OF 6: BRIEF STATISTICS */}
      {currentStep === 2 && (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-4">
          {/* Tour Card */}
          <div className="relative z-20 w-[490px] max-w-[95vw] bg-[#27324B] rounded-xl shadow-2xl p-6 text-white border border-white/10 animate-in fade-in zoom-in-95 duration-150 mb-5">
            {/* Arrow pointing DOWN towards expanded statistics */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-[#27324B]" />

            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold tracking-tight text-white">Brief statistics</h3>
              <button
                type="button"
                onClick={handleClose}
                className="text-white/60 hover:text-white transition-colors cursor-pointer p-0.5"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[13px] text-gray-200 leading-relaxed font-normal mb-8">
              Click the project name to access summary stats on each added search engine.
            </p>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2 bg-white text-gray-800 hover:bg-gray-100 rounded font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              >
                BACK
              </button>
              <span className="text-xs text-white/70 font-semibold tracking-wider">3 of 6</span>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white rounded font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Spotlight Highlighted Expanded Project Row */}
          <div className="relative z-10 w-full max-w-[1280px] bg-white rounded-lg shadow-[0_0_0_3px_#7C3AED,0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden divide-y divide-gray-100 text-xs">
            {/* Main row */}
            <div className="flex items-center divide-x divide-gray-100 py-2.5 px-3 bg-white">
              <div className="flex items-center gap-2 pr-4 min-w-[280px]">
                <span className="text-pink-500 font-bold text-xs select-none">'</span>
                <input type="checkbox" readOnly className="w-3.5 h-3.5 rounded text-[#7C3AED]" />
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                <div className="w-4 h-4 rounded bg-[#7C3AED] text-white flex items-center justify-center text-[10px] font-bold">
                  W
                </div>
                <span className="font-semibold text-gray-900">workcomposer.com</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <div className="px-4 text-center text-[#7C3AED] font-bold flex-1">10</div>
              <div className="px-4 text-center font-bold text-gray-800 flex-1">32 <span className="text-emerald-500 text-[10px]">▲ 26</span></div>
              <div className="px-4 text-center font-medium text-gray-700 flex-1">3 / 5 / 6</div>
              <div className="px-4 text-center text-[#7C3AED] font-bold flex-1">20</div>
              <div className="px-4 text-center font-semibold text-gray-800 flex-1">283 <span className="text-emerald-500 text-[10px]">▲ 66</span></div>
              <div className="px-4 text-center font-semibold text-gray-800 flex-1">24.65 <span className="text-emerald-500 text-[10px]">▲ 9.34</span></div>
            </div>

            {/* Sub-row 1: Google India */}
            <div className="flex items-center divide-x divide-gray-100 py-2 px-3 bg-[#FAFBFD]/90 text-gray-700">
              <div className="flex items-center gap-2 pl-9 pr-4 min-w-[280px]">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-sm select-none">🇮🇳</span>
                <span className="font-medium text-gray-800">India</span>
              </div>
              <div className="px-4 text-center text-gray-400 font-medium flex-1">N/A</div>
              <div className="px-4 text-center font-bold text-gray-800 flex-1">32 <span className="text-emerald-500 text-[10px]">▲ 26</span></div>
              <div className="px-4 text-center font-medium text-gray-700 flex-1">3 / 5 / 6</div>
              <div className="px-4 text-center text-[#7C3AED] font-bold flex-1">20</div>
              <div className="px-4 text-center font-semibold text-gray-800 flex-1">283 <span className="text-emerald-500 text-[10px]">▲ 66</span></div>
              <div className="px-4 text-center font-semibold text-gray-800 flex-1">24.65 <span className="text-emerald-500 text-[10px]">▲ 9.34</span></div>
            </div>

            {/* Sub-row 2: AI Search India */}
            <div className="flex items-center divide-x divide-gray-100 py-2 px-3 bg-[#FAFBFD]/90 text-gray-700">
              <div className="flex items-center gap-2 pl-9 pr-4 min-w-[280px]">
                <div className="w-3.5 h-3.5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[8px] font-bold">
                  AI
                </div>
                <span className="text-sm select-none">🇮🇳</span>
                <span className="font-medium text-gray-800">India</span>
              </div>
              <div className="px-4 text-center text-[#7C3AED] font-bold flex-1">10</div>
              <div className="px-4 text-center text-gray-400 font-medium flex-1">N/A</div>
              <div className="px-4 text-center text-gray-400 font-medium flex-1">N/A</div>
              <div className="px-4 text-center text-gray-400 font-medium flex-1">N/A</div>
              <div className="px-4 text-center text-gray-400 font-medium flex-1">N/A</div>
              <div className="px-4 text-center text-gray-400 font-medium flex-1">N/A</div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4 OF 6: COLUMNS */}
      {currentStep === 3 && (
        <div className="fixed inset-0 flex items-center justify-end pr-12 lg:pr-24">
          <div className="flex items-center gap-4">
            {/* Tour Card */}
            <div className="relative z-20 w-[490px] max-w-[90vw] bg-[#27324B] rounded-xl shadow-2xl p-6 text-white border border-white/10 animate-in fade-in zoom-in-95 duration-150">
              {/* Arrow pointing RIGHT towards Columns button */}
              <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-l-[9px] border-l-[#27324B]" />

              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold tracking-tight text-white">Columns</h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-white/60 hover:text-white transition-colors cursor-pointer p-0.5"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-[13px] text-gray-200 leading-relaxed font-normal mb-8">
                <p>
                  Tick the columns that you want to add to the project table. Column order, just like website order, can be changed via drag-and-dropping.
                </p>
                <p>Sort data by clicking on a column header.</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2 bg-white text-gray-800 hover:bg-gray-100 rounded font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                  BACK
                </button>
                <span className="text-xs text-white/70 font-semibold tracking-wider">4 of 6</span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white rounded font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <span>NEXT</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Spotlight Highlighted Columns Buttons */}
            <div className="relative z-10 flex items-center gap-2 bg-white p-2.5 rounded-lg shadow-[0_0_0_4px_white,0_20px_45px_rgba(0,0,0,0.6)]">
              <button className="px-2.5 py-1.5 border border-gray-300 rounded text-gray-700 bg-white flex items-center gap-1.5 text-xs font-bold shadow-2xs">
                <Copy className="w-3.5 h-3.5 text-gray-600" />
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>
              <button className="px-3.5 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-800 flex items-center gap-2 shadow-2xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gray-700" />
                <span>COLUMNS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5 OF 6: MANAGING PROJECTS */}
      {currentStep === 4 && (
        <div className="fixed inset-0 flex items-center justify-start pl-12 lg:pl-28">
          <div className="flex items-center gap-4">
            {/* Spotlight Highlighted Batch Actions Bar */}
            <div className="relative z-10 flex items-center gap-3 bg-white p-3 rounded-lg shadow-[0_0_0_4px_white,0_20px_45px_rgba(0,0,0,0.6)]">
              <button className="px-2.5 py-1.5 border border-gray-300 rounded bg-[#4A5568] text-white flex items-center gap-1 shadow-2xs">
                <Folder className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] font-bold">+</span>
                <ChevronDown className="w-3 h-3 text-white" />
              </button>
              <button className="p-1.5 border border-gray-300 rounded bg-white text-[#7C3AED] shadow-2xs">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 border border-gray-300 rounded bg-white text-red-500 shadow-2xs">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
                1 project (20 keywords) selected.
              </span>
            </div>

            {/* Tour Card */}
            <div className="relative z-20 w-[490px] max-w-[90vw] bg-[#27324B] rounded-xl shadow-2xl p-6 text-white border border-white/10 animate-in fade-in zoom-in-95 duration-150">
              {/* Arrow pointing LEFT towards batch actions bar */}
              <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-r-[9px] border-r-[#27324B]" />

              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold tracking-tight text-white">Managing projects</h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-white/60 hover:text-white transition-colors cursor-pointer p-0.5"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[13px] text-gray-200 leading-relaxed font-normal mb-8 space-y-1.5">
                <p>Checkmark a project to do the following:</p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-gray-300">
                  <li>re-check its rankings</li>
                  <li>delete the project;</li>
                  <li>join into group</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2 bg-white text-gray-800 hover:bg-gray-100 rounded font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                  BACK
                </button>
                <span className="text-xs text-white/70 font-semibold tracking-wider">5 of 6</span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white rounded font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <span>NEXT</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6 OF 6: USERS */}
      {currentStep === 5 && (
        <div className="fixed inset-0 flex items-start justify-end pt-12 pr-6 lg:pr-14">
          <div className="flex items-start gap-4">
            {/* Tour Card */}
            <div className="relative z-20 w-[490px] max-w-[85vw] bg-[#27324B] rounded-xl shadow-2xl p-6 text-white border border-white/10 animate-in fade-in zoom-in-95 duration-150 mt-14">
              {/* Arrow pointing RIGHT towards Users in menu */}
              <div className="absolute -right-2.5 top-16 -translate-y-1/2 w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-l-[9px] border-l-[#27324B]" />

              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold tracking-tight text-white">Users</h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-white/60 hover:text-white transition-colors cursor-pointer p-0.5"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[13px] text-gray-200 leading-relaxed font-normal mb-8">
                Under the Users section, you can let other users view your project data by creating subaccounts for them
              </p>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2 bg-white text-gray-800 hover:bg-gray-100 rounded font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                  BACK
                </button>
                <span className="text-xs text-white/70 font-semibold tracking-wider">6 of 6</span>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white rounded font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                >
                  START WORK
                </button>
              </div>
            </div>

            {/* Spotlight Highlighted User Profile Dropdown */}
            <div className="relative z-10 w-64 bg-white rounded-lg shadow-[0_0_0_4px_white,0_25px_50px_rgba(0,0,0,0.5)] border border-gray-200 py-3 text-xs text-gray-800 select-none">
              <div className="px-4 pb-2.5 mb-1.5 border-b border-gray-100">
                <div className="font-semibold text-gray-900 text-sm">bitti ydv</div>
              </div>

              <div className="space-y-0.5 px-1.5">
                <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span>Settings</span>
                </div>

                {/* Highlighted Users item */}
                <div className="flex items-center gap-3 px-3 py-2 bg-[#F5F3FF] text-[#7C3AED] font-bold rounded-lg border-2 border-[#7C3AED] shadow-xs">
                  <Users className="w-4 h-4 text-[#7C3AED]" />
                  <span>Users</span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded">
                  <Layers className="w-4 h-4 text-gray-500" />
                  <span>White Label</span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span>Billing</span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded">
                  <Gift className="w-4 h-4 text-gray-500" />
                  <span>Bonus Offers</span>
                </div>

                <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span>Affiliate Program</span>
                </div>

                <div className="border-t border-gray-100 pt-1 mt-1">
                  <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded">
                    <LogOut className="w-4 h-4 text-gray-500" />
                    <span>Log Out</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
