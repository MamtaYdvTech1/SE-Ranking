'use client';

import React from 'react';
import { AiCompetitorsView } from '@/components/ai-results-tracker/AiCompetitorsView';
import { useApp } from '@/components/providers/AppProviders';

export default function AiCompetitorsPage() {
  const { activeProject } = useApp();

  if (!activeProject) {
    return (
      <div className="flex-1 bg-[#F5F7FB] dark:bg-slate-900 min-h-screen p-6 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">No project selected</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please select an active project to track AI search competitors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F5F7FB] dark:bg-slate-900 min-h-screen p-6">
      <AiCompetitorsView projectId={activeProject.id} projectDomain={activeProject.domain} />
    </div>
  );
}
