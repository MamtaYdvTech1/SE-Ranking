'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/components/providers/AppProviders';
import { CompetitiveResearchDashboard } from '@/components/research/CompetitiveResearchDashboard';
import { AiSearchStartForm } from '@/components/research/AiSearchStartForm';

function cleanDomainString(domain: string): string {
  return domain
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '')
    .toLowerCase();
}

function CompetitiveResearchContent() {
  const searchParams = useSearchParams();
  const { activeProject } = useApp();

  const urlDomain = searchParams ? (searchParams.get('domain') || searchParams.get('url') || '') : '';
  const urlCountry = searchParams ? (searchParams.get('country') || 'United States of America') : 'United States of America';

  const defaultDomain = cleanDomainString(urlDomain || activeProject?.domain || '');
  const [domain, setDomain] = useState(defaultDomain);
  const [country, setCountry] = useState(urlCountry);
  const [viewState, setViewState] = useState<'dashboard' | 'start'>(defaultDomain ? 'dashboard' : 'start');

  useEffect(() => {
    if (urlDomain) {
      const cleaned = cleanDomainString(urlDomain);
      if (cleaned) {
        setDomain(cleaned);
        setViewState('dashboard');
      }
    }
  }, [urlDomain]);

  const handleStartSearch = (data: { domain?: string; country?: string }) => {
    const targetDomain = cleanDomainString(data.domain || '');
    if (!targetDomain) return;
    const targetCountry = data.country || 'United States of America';
    setDomain(targetDomain);
    setCountry(targetCountry);
    setViewState('dashboard');
  };

  const handleNewSearch = () => {
    setViewState('start');
  };

  if (viewState === 'dashboard' && domain) {
    return (
      <CompetitiveResearchDashboard
        domain={domain}
        country={country}
        onNewSearch={handleNewSearch}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#F7F9FC] to-white min-h-[calc(100vh-80px)] flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            Competitive Research
          </h1>
          <p className="text-sm text-gray-600">
            Analyze any website&apos;s organic search traffic, rankings, and competing domains using verified provider metrics.
          </p>
        </div>
        <AiSearchStartForm onAnalysisSuccess={handleStartSearch} />
      </div>
    </div>
  );
}

export default function CompetitiveResearchReportPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-gray-500">
          Loading competitive research...
        </div>
      }
    >
      <CompetitiveResearchContent />
    </Suspense>
  );
}
