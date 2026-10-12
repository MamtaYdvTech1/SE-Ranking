'use client';

import React from 'react';
import { ActivityLogWorkspace } from '@/components/admin/activity-logs/ActivityLogWorkspace';

export default function AdminActivityLogsPage() {
  return (
    <div className="flex-1 bg-[#F5F7FB] dark:bg-slate-900 min-h-screen p-6">
      <ActivityLogWorkspace />
    </div>
  );
}
