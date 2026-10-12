'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { KeywordResearchDashboard } from '@/components/research/KeywordResearchDashboard';

function KeywordSuggestionsContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || searchParams.get('q') || 'employee monitoring';
  const country = searchParams.get('country') || 'in';

  return (
    <KeywordResearchDashboard
      keyword={keyword}
      countryCode={country}
      onNewSearch={() => {
        window.history.back();
      }}
    />
  );
}

export default function KeywordSuggestionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading keyword suggestions...</div>}>
      <KeywordSuggestionsContent />
    </Suspense>
  );
}
