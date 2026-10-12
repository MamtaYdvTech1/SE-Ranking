'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Check, Globe } from 'lucide-react';
import { CountryFlag } from '@/components/ui/CountryFlag';

export interface CountryItem {
  code: string;
  name: string;
  isRegion?: boolean;
}

export const COUNTRIES_LIST: CountryItem[] = [
  { code: 'ww', name: 'Worldwide', isRegion: true },
  { code: 'cna', name: 'North America', isRegion: true },
  { code: 'csa', name: 'South America', isRegion: true },
  { code: 'ceu', name: 'Europe', isRegion: true },
  { code: 'cas', name: 'Asia', isRegion: true },
  { code: 'caf', name: 'Africa', isRegion: true },
  { code: 'coc', name: 'Oceania', isRegion: true },
  { code: 'in', name: 'India' },
  { code: 'us', name: 'United States of America' },
  { code: 'gb', name: 'United Kingdom of Great Britain and Northern Ireland' },
  { code: 'de', name: 'Germany' },
  { code: 'by', name: 'Belarus' },
  { code: 'ua', name: 'Ukraine' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'fr', name: 'France' },
  { code: 'it', name: 'Italy' },
  { code: 'ca', name: 'Canada' },
  { code: 'es', name: 'Spain' },
  { code: 'pt', name: 'Portugal' },
  { code: 'lv', name: 'Latvia' },
  { code: 'lt', name: 'Lithuania' },
  { code: 'au', name: 'Australia' },
  { code: 'dk', name: 'Denmark' },
  { code: 'be', name: 'Belgium' },
  { code: 'jp', name: 'Japan' },
  { code: 'fi', name: 'Finland' },
  { code: 'no', name: 'Norway' },
  { code: 'se', name: 'Sweden' },
  { code: 'ie', name: 'Ireland' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'sg', name: 'Singapore' },
  { code: 'at', name: 'Austria' },
  { code: 'pl', name: 'Poland' },
  { code: 'gr', name: 'Greece' },
  { code: 'il', name: 'Israel' },
  { code: 'hu', name: 'Hungary' },
  { code: 'bg', name: 'Bulgaria' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'br', name: 'Brazil' },
  { code: 'ru', name: 'Russian Federation' },
  { code: 'li', name: 'Liechtenstein' },
  { code: 'lu', name: 'Luxembourg' },
  { code: 'md', name: 'Republic of Moldova' },
  { code: 'ro', name: 'Romania' },
  { code: 'sk', name: 'Slovakia' },
  { code: 'cz', name: 'Czechia' },
  { code: 'is', name: 'Iceland' },
  { code: 'ee', name: 'Estonia' },
  { code: 'al', name: 'Albania' },
  { code: 'ad', name: 'Andorra' },
  { code: 'ba', name: 'Bosnia and Herzegovina' },
  { code: 'cy', name: 'Cyprus' },
  { code: 'mk', name: 'North Macedonia' },
  { code: 'mt', name: 'Malta' },
  { code: 'rs', name: 'Serbia' },
  { code: 'hr', name: 'Croatia' },
  { code: 'me', name: 'Montenegro' },
  { code: 'kz', name: 'Kazakhstan' },
  { code: 'mx', name: 'Mexico' },
  { code: 'si', name: 'Slovenia' },
  { code: 'sm', name: 'San Marino' },
  { code: 'my', name: 'Malaysia' },
  { code: 'za', name: 'South Africa' },
  { code: 'hk', name: 'China, Hong Kong Special Administrative Region' },
  { code: 'ae', name: 'United Arab Emirates' },
  { code: 'tr', name: 'Türkiye' },
  { code: 'co', name: 'Colombia' },
  { code: 'cl', name: 'Chile' },
  { code: 'th', name: 'Thailand' },
  { code: 'id', name: 'Indonesia' },
  { code: 'ph', name: 'Philippines' },
  { code: 'ar', name: 'Argentina' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'eg', name: 'Egypt' },
  { code: 'vn', name: 'Vietnam' },
  { code: 'tw', name: 'Taiwan' },
  { code: 'pe', name: 'Peru' },
  { code: 'pa', name: 'Panama' },
  { code: 'ec', name: 'Ecuador' },
  { code: 'uy', name: 'Uruguay' },
  { code: 'ke', name: 'Kenya' },
  { code: 'kh', name: 'Cambodia' },
  { code: 'np', name: 'Nepal' },
  { code: 'kw', name: 'Kuwait' },
  { code: 'jm', name: 'Jamaica' },
  { code: 'tt', name: 'Trinidad and Tobago' },
  { code: 'gh', name: 'Ghana' },
  { code: 'ng', name: 'Nigeria' },
  { code: 'pk', name: 'Pakistan' },
];

interface RegionSelectorPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountryCode: string;
  onSelectCountry: (country: CountryItem) => void;
  align?: 'left' | 'right';
}

export function RegionSelectorPopover({
  isOpen,
  onClose,
  selectedCountryCode,
  onSelectCountry,
  align = 'left',
}: RegionSelectorPopoverProps) {
  const [search, setSearch] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES_LIST;
    const q = search.toLowerCase();
    return COUNTRIES_LIST.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [search]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-1 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs font-sans select-none`}
    >
      {/* Search Input */}
      <div className="px-2.5 pb-1.5 pt-1 border-b border-gray-100">
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-md border border-gray-200 focus-within:border-[#7C3AED] focus-within:bg-white transition-colors">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country..."
            className="w-full text-xs text-gray-800 placeholder:text-gray-400 bg-transparent focus:outline-hidden"
            autoFocus
          />
        </div>
      </div>

      {/* Country List */}
      <div className="max-h-64 overflow-y-auto divide-y divide-gray-50/50 py-1">
        {filteredCountries.length === 0 ? (
          <div className="px-3 py-4 text-center text-gray-400 text-xs">
            No countries found
          </div>
        ) : (
          filteredCountries.map((c) => {
            const isSelected = selectedCountryCode.toLowerCase() === c.code.toLowerCase();
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onSelectCountry(c);
                  onClose();
                }}
                className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#F5F3FF] text-[#7C3AED] font-semibold' : 'text-gray-700 hover:bg-[#F0F2F6]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-4 h-3 shrink-0 flex items-center justify-center">
                    {c.isRegion ? (
                      <Globe className="w-3.5 h-3.5 text-gray-500" />
                    ) : (
                      <CountryFlag countryCode={c.code} countryName={c.name} size="sm" />
                    )}
                  </div>
                  <span className="truncate text-[12px]">{c.name}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#7C3AED] shrink-0 ml-2" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
