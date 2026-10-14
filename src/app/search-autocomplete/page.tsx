'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Download,
  Copy,
  Check,
  FolderPlus,
  CreditCard,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { CountryFlag } from '@/components/ui/CountryFlag';

interface CountryItem {
  code: string;
  name: string;
  flag: string;
}

const COUNTRIES: CountryItem[] = [
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'AS', name: 'American Samoa', flag: '🇦🇸' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'AI', name: 'Anguilla', flag: '🇦🇮' },
  { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
  { code: 'AW', name: 'Aruba', flag: '🇦🇼' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯' },
  { code: 'BM', name: 'Bermuda', flag: '🇧🇲' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
];

interface AutocompleteItem {
  id: string;
  keyword: string;
  volume: number;
  cpc: number;
  difficulty: number;
  source: string;
}

export default function SearchAutocompletePage() {
  const { activeProject } = useApp();
  const [queryText, setQueryText] = useState('');
  const [engine, setEngine] = useState('Google');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(COUNTRIES.find((c) => c.code === 'US') || COUNTRIES[0]);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countryFilter, setCountryFilter] = useState('');

  const [depth, setDepth] = useState<number>(1);
  const [addAlpha, setAddAlpha] = useState(false);
  const [addDigits, setAddDigits] = useState(false);
  const [addQuestions, setAddQuestions] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [level1, setLevel1] = useState(true);
  const [level2, setLevel2] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<AutocompleteItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [copiedAll, setCopiedAll] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [filterText, setFilterText] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isCountryOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setCountryFilter('');
    }
  }, [isCountryOpen]);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countryFilter.toLowerCase())
  );

  const loadSampleQueries = () => {
    setQueryText('seo agency\ncontent marketing\nkeyword rank tracker\nlink building tool');
  };

  const calculateCombinations = () => {
    const rawQueries = queryText
      .split(/[\r\n]+/)
      .map((q) => q.trim())
      .filter(Boolean);
    if (rawQueries.length === 0) return 0;

    let multiplier = 1;
    if (addAlpha) multiplier += 26;
    if (addDigits) multiplier += 10;
    if (addQuestions) multiplier += 6;
    if (level2) multiplier *= 2;
    multiplier *= depth;

    return rawQueries.length * multiplier;
  };

  const combinationsCount = calculateCombinations();

  const handleStartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawQueries = queryText
      .split(/[\r\n]+/)
      .map((q) => q.trim())
      .filter(Boolean);

    if (rawQueries.length === 0) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch('/api/seo/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queries: rawQueries.slice(0, 10),
          engine,
          country: selectedCountry.code,
          depth,
          addQuestions,
          addAlpha,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setSearchError(json?.error || `Autocomplete lookup failed (HTTP ${res.status}).`);
        return;
      }
      // Autocomplete returns phrases only; volume/CPC/KD need a keyword metrics lookup
      const items: AutocompleteItem[] = (json.results as Array<{ keyword: string }>).map((r, idx) => ({
        id: `ac-${idx + 1}`,
        keyword: r.keyword,
        volume: 0,
        cpc: 0,
        difficulty: 0,
        source: engine,
      }));
      setResults(items);
      setSelectedItems(new Set(items.map((g) => g.id)));
    } catch {
      setSearchError('Network error while fetching autocomplete suggestions.');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === results.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(results.map((r) => r.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  const handleCopyKeywords = () => {
    const textToCopy = results
      .filter((r) => selectedItems.has(r.id))
      .map((r) => r.keyword)
      .join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportCsv = () => {
    const filteredResults = results.filter((r) => selectedItems.has(r.id));
    const headers = ['Keyword', 'Search Engine', 'Country', 'Search Volume', 'CPC (USD)', 'Difficulty %'];
    const rows = filteredResults.map((r) => [
      `"${r.keyword}"`,
      r.source,
      `"${selectedCountry.name}"`,
      r.volume,
      `$${r.cpc}`,
      r.difficulty,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `autocomplete_${engine.toLowerCase()}_${selectedCountry.code.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedResults = results.filter((r) =>
    r.keyword.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="flex-1 bg-white min-h-[calc(100vh-80px)] text-[#2C384A] select-none pb-24 relative">

      <div className="max-w-[1040px] mx-auto p-4 sm:p-8 space-y-6">
        {/* Title & Subtitle matching Screenshot 1 */}
        <div className="space-y-1">
          <h1 className="text-[26px] sm:text-[28px] font-semibold text-[#1E293B] tracking-tight leading-snug">
            Search Engine Autocomplete
          </h1>
          <p className="text-[13px] text-[#64748B] leading-relaxed">
            Find keyword ideas for your organic and paid search campaigns with the help of Search Engine Autocomplete
          </p>
        </div>

        {/* Main Interactive Form Card matching Screenshot 1 */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-7 shadow-2xs space-y-5">
          <form onSubmit={handleStartSearch} className="space-y-5">
            {/* Top Textarea matching Screenshot 1 */}
            <div>
              <div className="flex items-center justify-between mb-1 text-xs">
                <label className="text-[13px] font-medium text-[#475569]">
                  Enter keywords or search queries:
                </label>
                <button
                  type="button"
                  onClick={loadSampleQueries}
                  className="text-[12px] text-[#0B69FF] hover:underline font-medium cursor-pointer"
                >
                  + Load sample queries
                </button>
              </div>
              <textarea
                rows={5}
                required
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Enter root queries (e.g. social media, time tracking, marketing software) — one per line"
                className="w-full p-3 border border-[#CBD5E1] rounded-lg text-[13px] focus:outline-hidden focus:border-[#0B69FF] font-normal leading-relaxed text-gray-900 bg-white placeholder-gray-400"
              />
            </div>

            {/* Dropdowns row: Select search engine & Select a country (matches Screenshot 9) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1 items-start">
              {/* Left: Select a search engine matching Screenshot 9 */}
              <div>
                <label className="block text-[13px] font-medium text-[#475569] mb-1.5">
                  Select a search engine:
                </label>
                <div className="border border-[#CBD5E1] rounded-lg p-3 bg-white space-y-2.5">
                  {[
                    { id: 'Google', label: 'Google' },
                    { id: 'Yahoo', label: 'Yahoo' },
                    { id: 'Bing', label: 'Bing' },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-gray-900 select-none"
                    >
                      <input
                        type="radio"
                        name="search_engine_radio"
                        checked={engine === item.id}
                        onChange={() => setEngine(item.id)}
                        className="w-3.5 h-3.5 text-[#0B69FF] focus:ring-0 cursor-pointer"
                      />
                      <span className="font-medium">{item.label}</span>
                    </label>
                  ))}

                  {/* Numbered pagination 1 2 3 matching Screenshot 9 */}
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-100 text-xs">
                    {[1, 2, 3].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDepth(lvl)}
                        className={`w-6 h-6 rounded text-xs font-semibold transition-all cursor-pointer ${
                          depth === lvl
                            ? 'bg-[#0B69FF] text-white font-bold'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Select a country matching Screenshot 9 */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-[13px] font-medium text-[#475569] mb-1.5">
                  Select country:
                </label>

                {!isCountryOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsCountryOpen(true)}
                    className="w-full px-3.5 py-2.5 border border-[#CBD5E1] rounded-lg text-[13px] text-gray-800 bg-white hover:border-[#94A3B8] focus:border-[#0B69FF] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CountryFlag code={selectedCountry.code} size="sm" />
                      <span className="font-normal">{selectedCountry.name}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                ) : (
                  <div className="absolute left-0 right-0 top-0 z-30 bg-white border border-[#0B69FF] rounded-lg shadow-lg overflow-hidden animate-in fade-in duration-100">
                    <div className="px-3 py-2 flex items-center justify-between border-b border-[#E2E8F0] bg-white">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        placeholder="Search"
                        className="w-full text-[13px] text-gray-800 focus:outline-hidden placeholder-gray-400 font-normal"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCountryOpen(false)}
                        className="text-gray-500 hover:text-gray-700 p-0.5 cursor-pointer ml-2"
                        title="Close country menu"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 text-[13px]">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setIsCountryOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-blue-50/50 cursor-pointer transition-colors ${
                              selectedCountry.code === c.code ? 'bg-blue-50/80 font-semibold text-[#0B69FF]' : 'text-gray-700'
                            }`}
                          >
                            <CountryFlag code={c.code} size="sm" />
                            <span className="truncate">{c.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-gray-400">
                          No countries matching &quot;{countryFilter}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Add various prefixes and symbols matching Screenshot 9 */}
            <div className="pt-2 space-y-2">
              <label className="block text-[13px] font-medium text-[#475569]">
                Add various prefixes and symbols to a search query to gather additional suggestions
              </label>
              <div className="space-y-2 text-[13px] text-[#334155]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addAlpha}
                    onChange={(e) => setAddAlpha(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-0 cursor-pointer"
                  />
                  <span>*query [a-z]</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addQuestions}
                    onChange={(e) => setAddQuestions(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-0 cursor-pointer"
                  />
                  <span>[a-z] query</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addDigits}
                    onChange={(e) => setAddDigits(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-0 cursor-pointer"
                  />
                  <span>query [0-9]</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={level2}
                    onChange={(e) => setLevel2(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-0 cursor-pointer"
                  />
                  <span>*query [0-9]</span>
                </label>
              </div>
            </div>

            {/* Select search depth for suggestions with additional endings and symbols matching Screenshot 1 */}
            <div className="pt-2 space-y-1.5">
              <label className="block text-[13px] font-medium text-[#475569]">
                Select the search depth for gathering suggestions with additional endings and symbols:
              </label>
              <div className="space-y-1.5 text-[13px] text-[#334155]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={level1}
                    onChange={(e) => setLevel1(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-0 cursor-pointer"
                  />
                  <span>1st level</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={level2}
                    onChange={(e) => setLevel2(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-0 cursor-pointer"
                  />
                  <span>2nd level</span>
                </label>
              </div>
            </div>

            {/* Pricing per query and Top up balance matching Screenshot 1 */}
            <div className="pt-3 border-t border-[#F1F5F9] space-y-1">
              <div className="text-[13px] font-medium text-[#475569]">Pricing per query</div>
              <div className="text-[20px] font-semibold text-[#1E293B]">$0</div>
              <div className="text-[12px] text-[#64748B] flex items-center gap-1.5">
                <span>You have</span>
                <span className="text-rose-600 font-bold">$0</span>
                <span>in your balance.</span>
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(true)}
                  className="text-[#0B69FF] hover:underline font-medium cursor-pointer"
                >
                  Top up balance
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSearching}
                className={`px-8 py-2.5 rounded text-[13px] font-semibold text-white transition-all shadow-2xs cursor-pointer flex items-center gap-2 ${
                  isSearching
                    ? 'bg-[#8EA9DB] cursor-not-allowed'
                    : 'bg-[#0B69FF] hover:bg-[#005FE0]'
                }`}
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Harvesting autocomplete ideas...</span>
                  </>
                ) : (
                  <span>Start search</span>
                )}
              </button>
            </div>
          </form>
          {searchError && (
            <div className="mt-3 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs">{searchError}</div>
          )}
        </div>

        {/* Real Autocomplete Results Table */}
        {results.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-2xs animate-in fade-in duration-200 mt-6 space-y-0">
            {/* Header toolbar */}
            <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC]">
              <div>
                <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
                  <span>Gathered Autocomplete Suggestions</span>
                  <span className="text-[11px] bg-blue-100 text-[#0B69FF] px-2 py-0.5 rounded-full font-semibold">
                    {displayedResults.length} / {results.length} ideas
                  </span>
                </h3>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  Engine: <span className="font-semibold text-gray-700">{engine}</span> • Location:{' '}
                  <span className="inline-flex items-center gap-1 font-semibold text-gray-700"><CountryFlag code={selectedCountry.code} size="xs" /> {selectedCountry.name}</span>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search filter within results */}
                <div className="relative">
                  <input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Filter results..."
                    className="pl-8 pr-3 py-1.5 border border-[#CBD5E1] rounded text-xs bg-white text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-[#0B69FF] w-40"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2 pointer-events-none" />
                </div>

                {/* Copy button */}
                <button
                  type="button"
                  onClick={handleCopyKeywords}
                  disabled={selectedItems.size === 0}
                  className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:bg-gray-50 text-gray-700 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  title="Copy selected keywords to clipboard"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'Copied!' : `Copy (${selectedItems.size})`}</span>
                </button>

                {/* Add to Keyword Manager button */}
                <Link
                  href="/keyword-manager"
                  className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:bg-gray-50 text-gray-700 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Send to Keyword Manager"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-[#0B69FF]" />
                  <span>Keyword Manager</span>
                </Link>

                {/* Export CSV button */}
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={selectedItems.size === 0}
                  className="px-3.5 py-1.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-[#F8FAFC] text-[11px] uppercase tracking-wider text-gray-500 border-b border-[#E2E8F0] font-semibold">
                  <tr>
                    <th className="px-4 py-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === results.length && results.length > 0}
                        onChange={toggleSelectAll}
                        className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3">Suggested Autocomplete Keyword</th>
                    <th className="px-4 py-3 text-right">Search Volume</th>
                    <th className="px-4 py-3 text-right">CPC (USD)</th>
                    <th className="px-4 py-3 text-center">Difficulty</th>
                    <th className="px-4 py-3 text-center">Source</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {displayedResults.map((item) => {
                    const isChecked = selectedItems.has(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-blue-50/30 transition-colors ${
                          isChecked ? 'bg-blue-50/20' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectItem(item.id)}
                            className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#0B69FF] focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          <span className="hover:text-[#0B69FF] transition-colors">{item.keyword}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800">
                          {item.volume ? item.volume.toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-gray-600">
                          {item.cpc ? `$${item.cpc.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {!item.difficulty ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.difficulty < 30
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.difficulty < 50
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {item.difficulty}%
                          </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                            {item.source}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(item.keyword)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0B69FF] hover:underline font-medium text-[11px] inline-flex items-center gap-1"
                          >
                            <span>Inspect SERP</span>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Top Up Balance Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0B69FF]" />
                <h3 className="text-base font-bold text-gray-900">Top Up Account Balance</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTopUpModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Your SE Ranking account includes instant access to Search Engine Autocomplete harvesting. You can top up prepaid credit or upgrade your plan.
            </p>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {['$10', '$25', '$50'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    alert(`Selected ${amt} credit package. Redirecting to billing...`);
                    setShowTopUpModal(false);
                  }}
                  className="p-3 border border-[#E2E8F0] hover:border-[#0B69FF] hover:bg-blue-50/50 rounded-lg text-center cursor-pointer transition-all"
                >
                  <div className="text-base font-bold text-gray-900">{amt}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Prepaid credit</div>
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowTopUpModal(false)}
                className="px-3.5 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/pricing"
                className="px-4 py-1.5 bg-[#0B69FF] hover:bg-[#005FE0] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Subscription Plans</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
