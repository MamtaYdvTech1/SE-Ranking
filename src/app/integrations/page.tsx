'use client';

import React, { Suspense } from 'react';
import { GlobalSettingsView } from '@/components/settings/GlobalSettingsView';

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F6F9] p-8 text-xs text-gray-500">Loading integrations...</div>}>
      <GlobalSettingsView />
    </Suspense>
  );
}
