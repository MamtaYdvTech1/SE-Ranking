'use client';

import React from 'react';
import { GlobalDashboardWorkspace } from '@/components/dashboard/GlobalDashboardWorkspace';

export default function DashboardPage() {
  return (
    <div className="flex-1 bg-[#0b0f19] min-h-screen">
      <GlobalDashboardWorkspace />
    </div>
  );
}
