'use client';

import React, { Suspense } from 'react';
import { SeRankingWebsiteAuditSuite } from '@/components/audit/SeRankingWebsiteAuditSuite';

export default function WebsiteAuditPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-gray-500">Loading Website Audit...</div>}>
      <SeRankingWebsiteAuditSuite />
    </Suspense>
  );
}
