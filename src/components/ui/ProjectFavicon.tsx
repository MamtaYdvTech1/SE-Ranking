'use client';

import React, { useState } from 'react';
import { getCleanDomain } from '@/lib/projectUtils';

interface ProjectFaviconProps {
  domain?: string | null;
  name?: string | null;
  logoUrl?: string | null;
  size?: number;
  className?: string;
  fallbackClassName?: string;
  alt?: string;
}

/**
 * Renders the authentic, real favicon/logo directly from the website.
 * No custom or fake drawn shapes — uses the website's exact live favicon via Google Favicon API.
 */
export function ProjectFavicon({
  domain,
  name,
  logoUrl,
  size = 18,
  className = 'w-4.5 h-4.5 rounded-full shrink-0 object-cover border border-gray-200/80 shadow-2xs bg-white',
  fallbackClassName,
  alt,
}: ProjectFaviconProps) {
  const [errorCount, setErrorCount] = useState(0);
  const cleanDomain = getCleanDomain(domain || name || '').toLowerCase();

  // 1. If explicit logoUrl is provided, use it first
  if (logoUrl && errorCount === 0) {
    return (
      <img
        src={logoUrl}
        alt={alt || cleanDomain}
        width={size}
        height={size}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setErrorCount(1)}
        className={className}
      />
    );
  }

  // 2. Real website live favicon from Google S2 Favicon API (high-res 64px)
  const src =
    errorCount === 0
      ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(cleanDomain)}&sz=64`
      : errorCount === 1
      ? `https://icons.duckduckgo.com/ip2/${encodeURIComponent(cleanDomain)}.ico`
      : `https://logo.clearbit.com/${encodeURIComponent(cleanDomain)}`;

  if (errorCount >= 3 || !cleanDomain) {
    const letter = (cleanDomain[0] || name?.[0] || 'W').toUpperCase();
    return (
      <div
        className={
          fallbackClassName ||
          `w-4.5 h-4.5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-bold text-[10px] shrink-0 select-none shadow-2xs`
        }
      >
        {letter}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || cleanDomain}
      width={size}
      height={size}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setErrorCount((c) => c + 1)}
      className={className}
    />
  );
}
