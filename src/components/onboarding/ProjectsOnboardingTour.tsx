'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';

export interface ProjectsOnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
}

export function ProjectsOnboardingTour({
  isOpen,
  onClose,
  onStepChange,
  onComplete,
}: ProjectsOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  useEffect(() => {
    if (isOpen) {
      if (onStepChange) onStepChange(currentStep);
    }
  }, [currentStep, isOpen, onStepChange]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (onStepChange) onStepChange(next);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      if (onStepChange) onStepChange(prev);
    }
  };

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('seranking_tour_completed', 'true');
    }
    if (onComplete) onComplete();
    onClose();
  };

  // Position & content for each step , 4, 5, 6
  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none font-sans">
      {/* Dark Dim Backdrop with transparency allowing underlying interactive elements */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] pointer-events-auto" />

      {/* Step Specific Tooltip Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto">
        {/* Step 1: Create Project */}
        {currentStep === 1 && (
          <div className="w-[360px] bg-[#1E2538] border border-[#334155] rounded-xl p-5 text-white shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200 fixed top-28 left-64 md:left-72">
            <div className="flex items-center justify-between border-b border-[#334155]/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold tracking-tight text-white">Create project</h3>
              </div>
              <button
                type="button"
                onClick={handleFinish}
                className="text-gray-400 hover:text-white cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Start by adding your website or clients to track search engine keyword rankings, technical audit health, and competitor visibility automatically.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-[#334155]/60">
              <span className="text-xs text-gray-400 font-medium">1 of 6</span>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1.5 bg-[#1D64F2] hover:bg-[#1557C0] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Rankings Overview Chart */}
        {currentStep === 2 && (
          <div className="w-[380px] bg-[#1E2538] border border-[#334155] rounded-xl p-5 text-white shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200 fixed top-64 right-1/4">
            <div className="flex items-center justify-between border-b border-[#334155]/60 pb-2.5">
              <h3 className="text-sm font-bold tracking-tight text-white">Rankings &amp; traffic metrics</h3>
              <button
                type="button"
                onClick={handleFinish}
                className="text-gray-400 hover:text-white cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Switch between Average Position, Traffic Forecast, Search Visibility, and Top 10 metrics across weekly, monthly, and quarterly intervals.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-[#334155]/60">
              <button
                type="button"
                onClick={handleBack}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-200 rounded text-xs font-medium cursor-pointer transition-colors"
              >
                BACK
              </button>
              <span className="text-xs text-gray-400 font-medium">2 of 6</span>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1.5 bg-[#1D64F2] hover:bg-[#1557C0] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Brief statistics */}
        {currentStep === 3 && (
          <div className="w-[360px] bg-[#1E2538] border border-[#334155] rounded-xl p-5 text-white shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200 fixed top-80 right-1/3">
            <div className="flex items-center justify-between border-b border-[#334155]/60 pb-2.5">
              <h3 className="text-sm font-bold tracking-tight text-white">Brief statistics</h3>
              <button
                type="button"
                onClick={handleFinish}
                className="text-gray-400 hover:text-white cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Click the project name to access summary stats on each added search engine.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-[#334155]/60">
              <button
                type="button"
                onClick={handleBack}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-200 rounded text-xs font-medium cursor-pointer transition-colors"
              >
                BACK
              </button>
              <span className="text-xs text-gray-400 font-medium">3 of 6</span>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1.5 bg-[#1D64F2] hover:bg-[#1557C0] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Columns */}
        {currentStep === 4 && (
          <div className="w-[390px] bg-[#1E2538] border border-[#334155] rounded-xl p-5 text-white shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200 fixed top-80 right-1/4">
            <div className="flex items-center justify-between border-b border-[#334155]/60 pb-2.5">
              <h3 className="text-sm font-bold tracking-tight text-white">Columns</h3>
              <button
                type="button"
                onClick={handleFinish}
                className="text-gray-400 hover:text-white cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-300 leading-relaxed space-y-2">
              <p>
                Tick the columns that you want to add to the project table. Column order, just like website order, can be changed via drag-and-dropping.
              </p>
              <p className="text-gray-400 text-[11.5px]">
                Sort data by clicking on a column header.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#334155]/60">
              <button
                type="button"
                onClick={handleBack}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-200 rounded text-xs font-medium cursor-pointer transition-colors"
              >
                BACK
              </button>
              <span className="text-xs text-gray-400 font-medium">4 of 6</span>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1.5 bg-[#1D64F2] hover:bg-[#1557C0] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Managing projects */}
        {currentStep === 5 && (
          <div className="w-[370px] bg-[#1E2538] border border-[#334155] rounded-xl p-5 text-white shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200 fixed top-72 right-1/4">
            <div className="flex items-center justify-between border-b border-[#334155]/60 pb-2.5">
              <h3 className="text-sm font-bold tracking-tight text-white">Managing projects</h3>
              <button
                type="button"
                onClick={handleFinish}
                className="text-gray-400 hover:text-white cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-300 leading-relaxed space-y-1.5">
              <p>Checkmark a project to do the following:</p>
              <ul className="space-y-1 pl-1 text-[11.5px] text-gray-300">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span>re-check its rankings</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span>delete the project</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  <span>join into group</span>
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#334155]/60">
              <button
                type="button"
                onClick={handleBack}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-200 rounded text-xs font-medium cursor-pointer transition-colors"
              >
                BACK
              </button>
              <span className="text-xs text-gray-400 font-medium">5 of 6</span>
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-1.5 bg-[#1D64F2] hover:bg-[#1557C0] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Users */}
        {currentStep === 6 && (
          <div className="w-[370px] bg-[#1E2538] border border-[#334155] rounded-xl p-5 text-white shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200 fixed top-24 right-48">
            <div className="flex items-center justify-between border-b border-[#334155]/60 pb-2.5">
              <h3 className="text-sm font-bold tracking-tight text-white">Users</h3>
              <button
                type="button"
                onClick={handleFinish}
                className="text-gray-400 hover:text-white cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Under the Users section, you can let other users view your project data by creating subaccounts for them.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-[#334155]/60">
              <button
                type="button"
                onClick={handleBack}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-200 rounded text-xs font-medium cursor-pointer transition-colors"
              >
                BACK
              </button>
              <span className="text-xs text-gray-400 font-medium">6 of 6</span>
              <button
                type="button"
                onClick={handleFinish}
                className="px-4 py-1.5 bg-[#1D64F2] hover:bg-[#1557C0] text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-md uppercase tracking-wider"
              >
                <span>START WORK</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
