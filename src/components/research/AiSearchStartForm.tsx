'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Globe, Tag, ChevronDown, Check, Loader2, AlertCircle } from 'lucide-react';
import { ScopeType, SearchType } from '@/lib/types';
import { SCOPE_OPTIONS, SUPPORTED_COUNTRIES } from '@/lib/constants';
import { useApp } from '../providers/AppProviders';
import { CountryFlag } from '@/components/ui/CountryFlag';

interface AiSearchStartFormProps {
  initialSearchType?: SearchType;
  onAnalysisSuccess?: (data: any) => void;
}

export function AiSearchStartForm({
  initialSearchType = 'ai-search',
  onAnalysisSuccess,
}: AiSearchStartFormProps) {
  const router = useRouter();
  const { activeProject, setCurrentAnalysis } = useApp();

  const [searchType, setSearchType] = useState<SearchType>(initialSearchType);
  const [domain, setDomain] = useState(activeProject?.domain || '');
  const [scope, setScope] = useState<ScopeType>('*.domain.com/*');
  const [isScopeOpen, setIsScopeOpen] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(
    SUPPORTED_COUNTRIES.find((c) => c.code === (activeProject?.countryCode || 'in')) || SUPPORTED_COUNTRIES[0]
  );
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const [brandName, setBrandName] = useState(activeProject?.brandName || '');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredCountries = SUPPORTED_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanDomain = domain.trim();
    if (!cleanDomain) {
      setErrorMessage('Enter a valid website domain or URL.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/ai-search/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: cleanDomain,
          scope,
          country: selectedCountry.name,
          countryCode: selectedCountry.code,
          brandName: brandName.trim() || undefined,
          searchType,
          projectId: activeProject?.id,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Unable to retrieve SEO data. Please try again.');
      }

      setCurrentAnalysis(result.data);
      if (onAnalysisSuccess) {
        onAnalysisSuccess(result.data);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to retrieve SEO data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[620px] mx-auto pt-6 pb-12 px-4 select-none">
      {/* Top Title: Start with */}
      <div className="text-center mb-5">
        <h2 className="text-xs font-semibold text-gray-700 tracking-wide mb-2.5">
          Start with
        </h2>

        {/* Toggle Pills: Google Search vs AI Search matching Screenshot 1 & 2 */}
        <div className="inline-flex p-1 bg-[#EEF2F6] border border-gray-200/80 rounded-lg shadow-2xs">
          <button
            type="button"
            onClick={() => {
              if (searchType !== 'google-search') {
                setSearchType('google-search');
                router.push('/research/competitive-research');
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
              searchType === 'google-search'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/70 font-semibold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {/* Google G logo */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google Search</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (searchType !== 'ai-search') {
                setSearchType('ai-search');
                router.push('/research/ai-search');
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
              searchType === 'ai-search'
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/70 font-semibold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>AI Search</span>
          </button>
        </div>

        {/* Subtitle text matching Screenshot 1 & 2 */}
        <p className="text-xs text-gray-500 max-w-[490px] mx-auto mt-3 leading-relaxed">
          {searchType === 'ai-search'
            ? 'Monitor domain citations and brand mentions in AI answers, and identify their sources. Use these insights to improve visibility and stay ahead of competitors.'
            : 'Analyze domain rankings, find top keywords, and discover competitor insights to grow organic traffic.'}
        </p>
      </div>

      {/* Main Analysis Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7 relative text-gray-900">
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAnalyze} className="space-y-4">
          {/* Website URL Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Website URL
            </label>

            <div className="flex rounded-lg border border-gray-300 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 bg-white transition-all overflow-hidden relative">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain or URL"
                className="flex-1 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden"
              />

              {/* Scope Dropdown */}
              <div className="relative border-l border-gray-200 bg-gray-50/60">
                <button
                  type="button"
                  onClick={() => setIsScopeOpen(!isScopeOpen)}
                  className="h-full px-3 flex items-center gap-1 text-xs text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-gray-500" />
                  <span>{scope}</span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>

                {isScopeOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 text-xs divide-y divide-gray-100">
                    {SCOPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setScope(opt.id);
                          setIsScopeOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start justify-between"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">{opt.label}</div>
                          <div className="text-[11px] text-gray-500">{opt.desc}</div>
                        </div>
                        {scope === opt.id && <Check className="w-3.5 h-3.5 text-[#7C3AED] shrink-0 mt-0.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Target Location Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Target location
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCountryOpen(!isCountryOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 hover:border-gray-400 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CountryFlag code={selectedCountry.code} size="sm" />
                  <span className="font-medium">{selectedCountry.name}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {isCountryOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden text-xs">
                  {/* Search inside country picker */}
                  <div className="p-2 border-b border-gray-100 bg-gray-50">
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Search country"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded focus:outline-hidden focus:border-[#7C3AED]"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 py-1">
                    {filteredCountries.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c);
                          setIsCountryOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#F5F3FF]/60 ${
                          selectedCountry.code === c.code ? 'bg-[#F5F3FF] font-semibold text-[#7C3AED]' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CountryFlag code={c.code} size="sm" />
                          <span>{c.name}</span>
                        </div>
                        {selectedCountry.code === c.code && <Check className="w-3.5 h-3.5 text-[#7C3AED]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Brand Name (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">Brand name</label>
              <span className="text-[11px] text-gray-400 font-normal">Optional</span>
            </div>

            <div className="relative">
              <Tag className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter or select brand"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
              />
            </div>
          </div>

          {/* Analyze Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-md font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] text-sm shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing AI Search...</span>
                </>
              ) : (
                <span>Analyze</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
