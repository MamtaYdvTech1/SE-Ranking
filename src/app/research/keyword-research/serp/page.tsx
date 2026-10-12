'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { KeywordResearchDashboard } from '@/components/research/KeywordResearchDashboard';

function SerpOverviewContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || searchParams.get('q') || 'seo tools';
  const country = searchParams.get('country') || 'in';

  return (
    <KeywordResearchDashboard
      keyword={keyword}
      countryCode={country}
      initialTab="serp"
      onNewSearch={() => {
        window.history.back();
      }}
    />
  );
}

export default function SerpOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-gray-500">
          Loading SERP Overview...
        </div>
      }
    >
      <SerpOverviewContent />
    </Suspense>
  );
}
