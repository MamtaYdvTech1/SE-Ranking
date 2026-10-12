'use client';

import React from 'react';

const LOGOS = [
  {
    id: 'soapbox',
    element: (
      <div className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <path d="M16 2L3 26H29L16 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M16 9L8 23H24L16 9Z" fill="currentColor" opacity="0.3" />
        </svg>
        <span className="font-black text-base sm:text-lg tracking-tight lowercase">soapbox</span>
      </div>
    ),
  },
  {
    id: 'nexbrand',
    element: (
      <div className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
        <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-current" />
        </div>
        <div className="text-left leading-none">
          <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase block">Nex Brand</span>
          <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest block">Marketing</span>
        </div>
      </div>
    ),
  },
  {
    id: 'tailor',
    element: (
      <div className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" />
          <path d="M2 17L12 22L22 17" />
          <path d="M2 12L12 17L22 12" />
        </svg>
        <div className="text-left leading-none">
          <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase block">Tailor</span>
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Brands</span>
        </div>
      </div>
    ),
  },
  {
    id: 'wiserit',
    element: (
      <div className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A8 8 0 0 1 4.07 10H5a1 1 0 0 1 0 2 6 6 0 0 0 6 6 1 1 0 0 1 2 0 6 6 0 0 0 6-6 1 1 0 0 1 2 0 8 8 0 0 1-6.93 6.93z" />
        </svg>
        <div className="text-left leading-none">
          <span className="font-black text-xs sm:text-sm tracking-wider uppercase block">Wiser IT</span>
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">SEO Company</span>
        </div>
      </div>
    ),
  },
  {
    id: 'kaida',
    element: (
      <div className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
        <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
          <div className="w-2 h-2 rounded-full border border-current" />
        </div>
        <span className="font-black text-sm sm:text-base tracking-widest uppercase">Kaida</span>
      </div>
    ),
  },
  {
    id: 'nearyhayes',
    element: (
      <div className="text-left leading-none text-gray-700 hover:text-gray-900 transition-colors">
        <span className="font-serif italic font-bold text-sm sm:text-base block">neary</span>
        <span className="font-serif italic font-bold text-sm sm:text-base block pl-2">hayes</span>
      </div>
    ),
  },
];

export function PartnerLogos() {
  return (
    <div className="se-partner-logos py-6 sm:py-8 w-full max-w-6xl mx-auto overflow-hidden relative select-none">
      {/* Left and Right soft fade gradient overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Infinite scrolling track - slide hote rahe */}
      <div className="partner-track flex items-center gap-12 sm:gap-16 w-max hover:[animation-play-state:paused]">
        {/* Set 1 */}
        {LOGOS.map((item) => (
          <div key={`logo-1-${item.id}`} className="shrink-0 opacity-80 hover:opacity-100 transition-opacity">
            {item.element}
          </div>
        ))}
        {/* Set 2 (seamless repeat) */}
        {LOGOS.map((item) => (
          <div key={`logo-2-${item.id}`} className="shrink-0 opacity-80 hover:opacity-100 transition-opacity">
            {item.element}
          </div>
        ))}
        {/* Set 3 (ensures widescreen coverage) */}
        {LOGOS.map((item) => (
          <div key={`logo-3-${item.id}`} className="shrink-0 opacity-80 hover:opacity-100 transition-opacity">
            {item.element}
          </div>
        ))}
        {/* Set 4 */}
        {LOGOS.map((item) => (
          <div key={`logo-4-${item.id}`} className="shrink-0 opacity-80 hover:opacity-100 transition-opacity">
            {item.element}
          </div>
        ))}
      </div>

      <style jsx>{`
        .partner-track {
          animation: logoMarquee 26s linear infinite;
        }

        @keyframes logoMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
