'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AiSearchStartForm } from '@/components/research/AiSearchStartForm';
import { AiSearchDashboard } from '@/components/research/AiSearchDashboard';
import { AnalysisOverview } from '@/lib/types';
import { useApp } from '@/components/providers/AppProviders';
import { ChevronDown } from 'lucide-react';

export default function AiSearchPage() {
  const { currentAnalysis, setCurrentAnalysis } = useApp();
  const [viewState, setViewState] = useState<'start' | 'dashboard'>(
    currentAnalysis ? 'dashboard' : 'start'
  );

  const handleAnalysisSuccess = (data: AnalysisOverview) => {
    setCurrentAnalysis(data);
    setViewState('dashboard');
  };

  const handleNewSearch = () => {
    setViewState('start');
  };

  if (viewState === 'dashboard' && currentAnalysis) {
    return (
      <AiSearchDashboard
        analysis={currentAnalysis}
        onNewSearch={handleNewSearch}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#F7F9FC] to-white min-h-[calc(100vh-80px)] flex flex-col justify-between select-none">
      {/* Top Header links matching Screenshot 2: Have any questions? and Feedback */}
      <div className="w-full flex items-center justify-end px-6 py-2.5 gap-4 text-xs text-gray-500 border-b border-gray-100 bg-white/50">
        <Link
          href="/help"
          className="flex items-center gap-1 hover:text-[#7C3AED] transition-colors cursor-pointer"
        >
          <span>Have any questions?</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </Link>
        <Link
          href="/help"
          className="hover:text-[#7C3AED] transition-colors cursor-pointer"
        >
          Feedback
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center py-6">
        <AiSearchStartForm
          initialSearchType="ai-search"
          onAnalysisSuccess={handleAnalysisSuccess}
        />
      </div>
    </div>
  );
}
