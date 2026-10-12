'use client';

import React from 'react';
import { getCountryInfo, normalizeCountryCode } from '@/lib/countryUtils';

export interface CountryFlagProps {
  code?: string | null;
  name?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showCode?: boolean;
}

const SIZE_STYLES: Record<string, { width: number; height: number }> = {
  xs: { width: 14, height: 10 },
  sm: { width: 18, height: 13 },
  md: { width: 22, height: 16 },
  lg: { width: 26, height: 19 },
};

export function CountryFlag({
  code,
  name,
  countryCode,
  countryName,
  className = '',
  size = 'sm',
  showCode = false,
}: CountryFlagProps) {
  const rawInput = code || countryCode || name || countryName || '';
  const info = getCountryInfo(rawInput);
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.sm;

  if (!info) {
    // Graceful fallback for unknown / invalid country
    return (
      <span
        className={`inline-flex items-center justify-center bg-gray-100 text-gray-400 rounded-[2px] border border-gray-200 shrink-0 font-mono text-[9px] ${className}`}
        style={{ width: `${sizeStyle.width}px`, height: `${sizeStyle.height}px` }}
        title={countryName || code || 'Unknown Region'}
        aria-label={countryName || code || 'Unknown Region'}
      >
        {rawInput ? String(rawInput).slice(0, 2).toUpperCase() : '🌐'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 align-middle shrink-0">
      <img
        src={`/flags/4x3/${info.flagCode}.svg`}
        alt={name || info.name}
        className={`rounded-[2px] shadow-xs object-cover border border-black/10 shrink-0 ${className}`}
        style={{
          width: `${sizeStyle.width}px`,
          height: `${sizeStyle.height}px`,
        }}
        loading="lazy"
      />
      {showCode && (
        <span className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
          {info.code}
        </span>
      )}
    </span>
  );
}

export default CountryFlag;
