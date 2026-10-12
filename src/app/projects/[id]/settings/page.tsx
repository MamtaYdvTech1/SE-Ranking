'use client';

import React, { Suspense } from 'react';
import { SEWizardView } from '@/components/settings/SEWizardView';

export default function ProjectSettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F6F9] p-8 text-xs text-gray-500">Loading project settings...</div>}>
      <SEWizardView />
    </Suspense>
  );
}
