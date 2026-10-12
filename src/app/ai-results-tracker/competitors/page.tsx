'use client';

import React from 'react';
import { AiCompetitorsView } from '@/components/ai-results-tracker/AiCompetitorsView';
import { useApp } from '@/components/providers/AppProviders';

export default function AiCompetitorsPage() {
  const { activeProject } = useApp();
  const projectId = activeProject?.id || '12960641';
  const projectDomain = activeProject?.domain || 'workcomposer.com';

  return (
    <div className="flex-1 bg-[#F5F7FB] dark:bg-slate-900 min-h-screen p-6">
      <AiCompetitorsView projectId={projectId} projectDomain={projectDomain} />
    </div>
  );
}
