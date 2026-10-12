'use client';

import React, { Suspense } from 'react';
import { CloudflareManagementHub } from '@/components/cloudflare/CloudflareManagementHub';
import { AppShell } from '@/components/layout/AppShell';

export default function CloudflareSettingsPage() {
  return (
    <AppShell>
      <div className="min-h-screen bg-[#F4F6F9] p-6 sm:p-10">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<div className="p-8 text-xs text-gray-500">Loading Cloudflare Suite...</div>}>
            <CloudflareManagementHub />
          </Suspense>
        </div>
      </div>
    </AppShell>
  );
}
