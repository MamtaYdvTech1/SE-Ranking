'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  X,
  Layers,
  ChevronDown,
  Tag,
  Search,
  Check,
  Sparkles,
  Calendar,
  DollarSign,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { SCOPE_OPTIONS, SUPPORTED_COUNTRIES } from '@/lib/constants';
import { useApp } from '@/components/providers/AppProviders';
import { CountryFlag } from '@/components/ui/CountryFlag';

function DatabaseExpansionContent() {
  const { activeProject } = useApp();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'competitive'; // 'competitive' (Screenshot 4) or 'keyword' (Screenshot 6)

  const [showAlert, setShowAlert] = useState(true);
  const [domain, setDomain] = useState(activeProject?.domain || '');
  const [keyword, setKeyword] = useState('');
  const [scope, setScope] = useState('*.domain.com/*');
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    SUPPORTED_COUNTRIES.find((c) => c.code === 'in') || SUPPORTED_COUNTRIES[0]
  );
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [brandName, setBrandName] = useState(activeProject?.brandName || '');
  const [currency, setCurrency] = useState('$ USD');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [datePeriod, setDatePeriod] = useState(mode === 'keyword' ? 'September 2026' : 'October 2026');
  const [isDateOpen, setIsDateOpen] = useState(false);

  // Upgrade Modal & Submit Queries Modal state
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSubmitQueriesOpen, setIsSubmitQueriesOpen] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const regionHierarchy = [
    { name: 'Worldwide', code: 'global' },
    { name: 'North America', code: 'na' },
    { name: 'South America', code: 'sa' },
    { name: 'Europe', code: 'eu' },
    { name: 'Asia', code: 'as' },
    { name: 'Africa', code: 'af' },
    { name: 'Oceania', code: 'oc' },
    { name: 'India', code: 'in' },
    { name: 'United States of America', code: 'us' },
    { name: 'United Kingdom of Great Britain and Northern Ireland', code: 'gb' },
  ];

  const filteredRegions = regionHierarchy.filter((r) =>
    r.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleSubmitQueries = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    setSubmittedMessage(
      `Successfully submitted ${
        queryInput.split('\n').filter(Boolean).length
      } search queries. Analysis will be added within 48 hours.`
    );
    setTimeout(() => {
      setIsSubmitQueriesOpen(false);
      setSubmittedMessage(null);
      setQueryInput('');
    }, 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-[calc(100vh-80px)] text-gray-900 select-none flex flex-col justify-between">
      <div className="p-4 sm:p-6 w-full space-y-3.5 max-w-[1400px] mx-auto">
        {/* Dismissible Notice Banner matching Screenshot 4 & 6 */}
        {showAlert && (
          <div className="p-3.5 sm:p-4 bg-[#F0F6FD] border border-[#D5E6F7] rounded-lg relative text-[12px] text-gray-700 leading-relaxed">
            <button
              onClick={() => setShowAlert(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              title="Close notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#0B69FF] text-white text-[9px] flex items-center justify-center font-bold">i</span>
              <span>How does it work?</span>
            </div>
            <p className="pr-6 mb-1.5">
              We aim to keep our databases squeaky clean and are constantly expanding them. But, of course, we still have a long way to go before we cover every single search request out there. That&apos;s where you come in! Help us help you by submitting additional search queries for analysis.
            </p>
            <p className="pr-6">
              Suppose you have a specific niche that the relevant database doesn&apos;t have any keyword data on. Don&apos;t panic! Just upload a list of all the relevant search queries, and in a month&apos;s time, you&apos;ll get all the information you need, including a complete overview of organic and paid traffic, search queries and competitors.{' '}
              <a
                href="https://help.seranking.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#0B69FF] font-medium hover:underline inline-flex items-center gap-0.5"
              >
                <span>Learn more</span>
              </a>
            </p>
          </div>
        )}

        {/* Breadcrumb matching Screenshot 4 or 6 */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="text-[13px] text-[#8C98A9] font-normal flex items-center gap-1.5">
            <Link
              href={mode === 'keyword' ? '/research/keyword-research' : '/research/competitive-research'}
              className="hover:text-[#0B69FF]"
            >
              {mode === 'keyword' ? 'Keyword Research' : 'Competitive Research'}
            </Link>
            <span>›</span>
            <span className="text-gray-800 font-semibold">Database Expansion</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <button
              onClick={() => alert('Support & Help: 24/7 technical assistance for database expansion requests.')}
              className="flex items-center gap-1 hover:text-[#0B69FF] transition-colors cursor-pointer"
            >
              <span>Have any questions?</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            <button
              onClick={() => alert('Feedback: Tell us what databases or search queries you need expanded!')}
              className="hover:text-[#0B69FF] transition-colors cursor-pointer"
            >
              Feedback
            </button>
          </div>
        </div>

        {/* Controls Row matching Screenshot 4 (Competitive) or Screenshot 6 (Keyword) */}
        {mode === 'keyword' ? (
          /* Screenshot 6 Keyword Controls: Enter a keyword, flag, Analyze, September 2026, $ USD, Bulk keyword Analysis */
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white max-w-sm flex-1 min-w-[260px] focus-within:border-[#0B69FF]">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter a keyword"
                className="px-3.5 py-2 text-xs flex-1 focus:outline-hidden text-gray-900"
              />
              <div className="relative border-l border-gray-200 px-2 flex items-center">
                <CountryFlag code={selectedCountry.code} size="sm" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              Analyze
            </button>

            {/* Date period selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDateOpen(!isDateOpen)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white hover:border-gray-400 flex items-center gap-1.5 cursor-pointer font-medium text-gray-700"
              >
                <span>{datePeriod}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {isDateOpen && (
                <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 text-xs">
                  {['September 2026', 'August 2026', 'July 2026', 'June 2026'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDatePeriod(d);
                        setIsDateOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-700"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white hover:border-gray-400 flex items-center gap-1.5 cursor-pointer font-medium text-gray-700"
              >
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {isCurrencyOpen && (
                <div className="absolute left-0 top-full mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 text-xs">
                  {['$ USD', '€ EUR', '£ GBP', '₹ INR'].map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => {
                        setCurrency(curr);
                        setIsCurrencyOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50"
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bulk keyword analysis link */}
            <Link
              href="/research/keyword-research"
              className="text-xs text-gray-600 hover:text-[#0B69FF] font-medium ml-2 cursor-pointer"
            >
              Bulk keyword Analysis
            </Link>
          </div>
        ) : (
          /* Screenshot 4 Competitive Controls: Date selector, Currency, Country dropdown, Domain input, Analyze */
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {/* Date period selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDateOpen(!isDateOpen)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white hover:border-gray-400 flex items-center gap-1.5 cursor-pointer font-medium text-gray-700"
              >
                <span>{datePeriod}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {isDateOpen && (
                <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 text-xs">
                  {['October 2026', 'September 2026', 'August 2026', 'July 2026'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDatePeriod(d);
                        setIsDateOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-700"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white hover:border-gray-400 flex items-center gap-1.5 cursor-pointer font-medium text-gray-700"
              >
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {isCurrencyOpen && (
                <div className="absolute left-0 top-full mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 text-xs">
                  {['$ USD', '€ EUR', '£ GBP', '₹ INR'].map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => {
                        setCurrency(curr);
                        setIsCurrencyOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50"
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Country Selector Dropdown with region tree matching Screenshot 4 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCountryOpen(!isCountryOpen)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white hover:border-gray-400 flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <CountryFlag code={selectedCountry.code} size="sm" />
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {isCountryOpen && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2 text-xs animate-in fade-in duration-100">
                  <div className="px-3 pb-2 border-b border-gray-100">
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Search"
                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-hidden focus:border-[#0B69FF]"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1 divide-y divide-gray-50">
                    {filteredRegions.map((r) => (
                      <button
                        key={r.name}
                        type="button"
                        onClick={() => {
                          const matched = SUPPORTED_COUNTRIES.find((c) => c.code === r.code) || selectedCountry;
                          setSelectedCountry(matched);
                          setIsCountryOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-blue-50/60 flex items-center gap-2 cursor-pointer text-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCountry.name === r.name || selectedCountry.code === r.code}
                          readOnly
                          className="w-3 h-3 text-[#0B69FF] rounded pointer-events-none"
                        />
                        <span className="truncate">{r.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Domain input with scope */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white max-w-sm flex-1 min-w-[260px] focus-within:border-[#0B69FF]">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain or URL"
                className="px-3 py-2 text-xs flex-1 focus:outline-hidden text-gray-900"
              />
              <div className="relative border-l border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setIsScopeOpen(!isScopeOpen)}
                  className="px-2.5 py-2 text-xs text-gray-600 flex items-center gap-1 hover:bg-gray-100 font-medium cursor-pointer"
                >
                  <Layers className="w-3 h-3 text-gray-500" />
                  <span>{scope}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {isScopeOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 text-xs">
                    {SCOPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setScope(opt.id);
                          setIsScopeOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-800">{opt.label}</span>
                        {scope === opt.id && <Check className="w-3.5 h-3.5 text-[#0B69FF]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              Analyze
            </button>
          </div>
        )}

        {/* Diagonal Striped Background Area matching Screenshot 4 & 6 */}
        <div
          className="relative rounded-lg border border-gray-200 overflow-hidden min-h-[500px] flex items-center justify-center p-6 text-center"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #F9FBFC 0, #F9FBFC 9px, #FFFFFF 9px, #FFFFFF 18px)',
          }}
        >
          {/* Faint watermark chart elements */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col justify-between p-8">
            <div className="flex items-center justify-between">
              <div className="w-48 h-6 bg-gray-300 rounded-sm" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-400" />
                <div className="w-6 h-6 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 h-4 bg-gray-300 rounded-xs" />
                  <div className="w-16 h-4 bg-gray-200 rounded-xs" />
                  <div className="w-24 h-4 bg-gray-200 rounded-xs" />
                  <div className="w-20 h-4 bg-gray-200 rounded-xs" />
                </div>
              ))}
            </div>
          </div>

          {/* Central Upgrade Card matching Screenshot 4 & 6 */}
          <div className="relative z-10 max-w-lg bg-white/95 backdrop-blur-xs p-8 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Want to submit your search queries for analysis?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              This feature is only available under the Pro and Business pricing plans. Upgrade your subscription plan to get a comprehensive SERP analysis of your search queries.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/pricing"
                className="px-6 py-2.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-bold rounded uppercase tracking-wider transition-colors shadow-xs"
              >
                UPGRADE SUBSCRIPTION
              </Link>
              <button
                type="button"
                onClick={() => setIsSubmitQueriesOpen(true)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded transition-colors cursor-pointer"
              >
                Submit Queries Directly
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Queries Modal */}
      {isSubmitQueriesOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-gray-200">
            <button
              onClick={() => setIsSubmitQueriesOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-gray-900">
              Submit Search Queries for Database Expansion
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Enter the queries you need expanded in our Google &amp; AI Search database. Our data crawler will verify and populate SERP metrics for your selected country.
            </p>

            <form onSubmit={handleSubmitQueries} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Search Queries (one per line):
                </label>
                <textarea
                  rows={6}
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="time tracking software&#10;remote work monitoring&#10;best employee productivity app"
                  className="w-full p-3 border border-gray-300 rounded-lg text-xs font-mono focus:outline-hidden focus:border-[#0B69FF]"
                />
              </div>

              {submittedMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
                  {submittedMessage}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitQueriesOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!queryInput.trim()}
                  className="px-5 py-2 bg-[#0B69FF] hover:bg-[#005FE0] text-white rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DatabaseExpansionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-gray-500">Loading Database Expansion...</div>}>
      <DatabaseExpansionContent />
    </Suspense>
  );
}
