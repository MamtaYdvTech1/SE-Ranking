'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, Globe } from 'lucide-react';
import { COUNTRIES_DATA } from '@/lib/countryUtils';

export function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27A7.18 7.18 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export interface SearchEngineOption {
  id: string;
  engine: string;
  name: string;
  countryName: string;
  countryCode: string;
  flagCode: string;
  language: string;
}

export const POPULAR_SEARCH_ENGINES: SearchEngineOption[] = [
  {
    id: 'google-in',
    engine: 'Google',
    name: 'Google India',
    countryName: 'India',
    countryCode: 'IN',
    flagCode: 'in',
    language: 'en',
  },
  {
    id: 'google-us',
    engine: 'Google',
    name: 'Google United States',
    countryName: 'United States',
    countryCode: 'US',
    flagCode: 'us',
    language: 'en',
  },
  {
    id: 'google-gb',
    engine: 'Google',
    name: 'Google United Kingdom',
    countryName: 'United Kingdom',
    countryCode: 'GB',
    flagCode: 'gb',
    language: 'en',
  },
  {
    id: 'google-ca',
    engine: 'Google',
    name: 'Google Canada',
    countryName: 'Canada',
    countryCode: 'CA',
    flagCode: 'ca',
    language: 'en',
  },
  {
    id: 'google-au',
    engine: 'Google',
    name: 'Google Australia',
    countryName: 'Australia',
    countryCode: 'AU',
    flagCode: 'au',
    language: 'en',
  },
  {
    id: 'google-de',
    engine: 'Google',
    name: 'Google Germany',
    countryName: 'Germany',
    countryCode: 'DE',
    flagCode: 'de',
    language: 'de',
  },
  {
    id: 'google-fr',
    engine: 'Google',
    name: 'Google France',
    countryName: 'France',
    countryCode: 'FR',
    flagCode: 'fr',
    language: 'fr',
  },
  {
    id: 'google-es',
    engine: 'Google',
    name: 'Google Spain',
    countryName: 'Spain',
    countryCode: 'ES',
    flagCode: 'es',
    language: 'es',
  },
  {
    id: 'google-it',
    engine: 'Google',
    name: 'Google Italy',
    countryName: 'Italy',
    countryCode: 'IT',
    flagCode: 'it',
    language: 'it',
  },
  {
    id: 'google-nl',
    engine: 'Google',
    name: 'Google Netherlands',
    countryName: 'Netherlands',
    countryCode: 'NL',
    flagCode: 'nl',
    language: 'nl',
  },
  {
    id: 'google-br',
    engine: 'Google',
    name: 'Google Brazil',
    countryName: 'Brazil',
    countryCode: 'BR',
    flagCode: 'br',
    language: 'pt',
  },
  {
    id: 'google-jp',
    engine: 'Google',
    name: 'Google Japan',
    countryName: 'Japan',
    countryCode: 'JP',
    flagCode: 'jp',
    language: 'ja',
  },
  {
    id: 'google-ae',
    engine: 'Google',
    name: 'Google United Arab Emirates',
    countryName: 'United Arab Emirates',
    countryCode: 'AE',
    flagCode: 'ae',
    language: 'ar/en',
  },
  {
    id: 'google-sg',
    engine: 'Google',
    name: 'Google Singapore',
    countryName: 'Singapore',
    countryCode: 'SG',
    flagCode: 'sg',
    language: 'en',
  },
  {
    id: 'google-sa',
    engine: 'Google',
    name: 'Google Saudi Arabia',
    countryName: 'Saudi Arabia',
    countryCode: 'SA',
    flagCode: 'sa',
    language: 'ar',
  },
  {
    id: 'google-mx',
    engine: 'Google',
    name: 'Google Mexico',
    countryName: 'Mexico',
    countryCode: 'MX',
    flagCode: 'mx',
    language: 'es',
  },
  {
    id: 'google-za',
    engine: 'Google',
    name: 'Google South Africa',
    countryName: 'South Africa',
    countryCode: 'ZA',
    flagCode: 'za',
    language: 'en',
  },
  {
    id: 'google-se',
    engine: 'Google',
    name: 'Google Sweden',
    countryName: 'Sweden',
    countryCode: 'SE',
    flagCode: 'se',
    language: 'sv',
  },
  {
    id: 'google-ch',
    engine: 'Google',
    name: 'Google Switzerland',
    countryName: 'Switzerland',
    countryCode: 'CH',
    flagCode: 'ch',
    language: 'de/fr',
  },
  {
    id: 'google-pl',
    engine: 'Google',
    name: 'Google Poland',
    countryName: 'Poland',
    countryCode: 'PL',
    flagCode: 'pl',
    language: 'pl',
  },
  {
    id: 'google-id',
    engine: 'Google',
    name: 'Google Indonesia',
    countryName: 'Indonesia',
    countryCode: 'ID',
    flagCode: 'id',
    language: 'id',
  },
  {
    id: 'google-my',
    engine: 'Google',
    name: 'Google Malaysia',
    countryName: 'Malaysia',
    countryCode: 'MY',
    flagCode: 'my',
    language: 'ms/en',
  },
];

// Expanded list covering all countries from COUNTRY_DATA
export const ALL_SEARCH_ENGINES: SearchEngineOption[] = [
  ...POPULAR_SEARCH_ENGINES,
  ...COUNTRIES_DATA.filter(
    (c) => !POPULAR_SEARCH_ENGINES.some((p) => p.countryCode === c.code)
  ).map((c) => ({
    id: `google-${c.code.toLowerCase()}`,
    engine: 'Google',
    name: `Google ${c.name}`,
    countryName: c.name,
    countryCode: c.code,
    flagCode: c.flagCode,
    language: 'en',
  })),
];

interface SearchEngineRegionSelectorProps {
  value?: string;
  onChange?: (selected: SearchEngineOption) => void;
  className?: string;
}

export function SearchEngineRegionSelector({
  value = 'Google India',
  onChange,
  className = '',
}: SearchEngineRegionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Find currently selected
  const selectedEngine = useMemo(() => {
    const query = value.toLowerCase();
    return (
      ALL_SEARCH_ENGINES.find(
        (e) =>
          e.name.toLowerCase() === query ||
          e.id === query ||
          e.countryName.toLowerCase() === query ||
          `${e.name} (${e.language})`.toLowerCase() === query ||
          e.countryCode.toLowerCase() === query
      ) || POPULAR_SEARCH_ENGINES[0]
    );
  }, [value]);

  // Filter engines
  const filteredEngines = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ALL_SEARCH_ENGINES;
    return ALL_SEARCH_ENGINES.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.countryName.toLowerCase().includes(q) ||
        e.countryCode.toLowerCase().includes(q) ||
        e.language.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (engine: SearchEngineOption) => {
    onChange?.(engine);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-xs border border-gray-300 rounded-lg p-2.5 text-gray-800 bg-white flex items-center justify-between cursor-pointer hover:border-gray-400 focus:outline-hidden focus:border-[#00B074] focus:ring-1 focus:ring-[#00B074] shadow-2xs transition-colors"
      >
        <div className="flex items-center gap-2.5 truncate">
          <img
            src={`/flags/4x3/${selectedEngine.flagCode}.svg`}
            alt={selectedEngine.countryName}
            className="w-5 h-3.5 object-cover rounded-[2px] border border-black/10 shadow-2xs shrink-0"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold text-gray-900 truncate">
            {selectedEngine.name} ({selectedEngine.language})
          </span>
          <span className="bg-gray-100 text-gray-600 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
            {selectedEngine.countryCode}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-gray-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Bar */}
          <div className="p-2 border-b border-gray-100 bg-[#FAFBFD]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or region (e.g. India, US)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-hidden focus:border-[#00B074] focus:ring-1 focus:ring-[#00B074] bg-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Engine List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 py-1">
            {filteredEngines.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">
                No matching regions found
              </div>
            ) : (
              filteredEngines.map((engine) => {
                const isSelected = engine.countryCode === selectedEngine.countryCode;
                return (
                  <button
                    key={engine.id}
                    type="button"
                    onClick={() => handleSelect(engine)}
                    className={`w-full px-3 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-emerald-50/80 text-emerald-950 font-semibold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={`/flags/4x3/${engine.flagCode}.svg`}
                        alt={engine.countryName}
                        className="w-5 h-3.5 object-cover rounded-[2px] border border-black/10 shadow-2xs shrink-0"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                      <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {engine.name} <span className="text-gray-400 font-normal">({engine.language})</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded uppercase">
                        {engine.countryCode}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
