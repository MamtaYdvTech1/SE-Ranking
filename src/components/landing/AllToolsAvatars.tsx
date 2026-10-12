'use client';

import React from 'react';

// 20 high-quality avatar photos for the SE Ranking customer ticker
const avatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&auto=format&fit=crop&q=80',
];

export function AllToolsAvatars() {
  return (
    <div className="all-tools__avatars-block flex flex-col items-center justify-center gap-3 pt-6 overflow-hidden max-w-full">
      {/* Sliding Avatars Marquee */}
      <div className="all-tools__avatars-wrapper relative w-full max-w-xl overflow-hidden py-1">
        {/* Left & Right gradient fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex items-center gap-2">
          {/* First set of 20 avatars */}
          {avatars.map((url, i) => (
            <div
              key={`a1-${i}`}
              className="all-tools__avatar-wrapper w-9 h-9 shrink-0 rounded-full border-2 border-white shadow-xs overflow-hidden hover:scale-110 transition-transform cursor-pointer"
            >
              <img
                src={url}
                alt={`Agency User ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}

          {/* Duplicate set for seamless continuous loop */}
          {avatars.map((url, i) => (
            <div
              key={`a2-${i}`}
              className="all-tools__avatar-wrapper w-9 h-9 shrink-0 rounded-full border-2 border-white shadow-xs overflow-hidden hover:scale-110 transition-transform cursor-pointer"
            >
              <img
                src={url}
                alt={`Agency User ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <p className="se-text_hero text-xs font-medium text-gray-500 flex items-center gap-1.5">
        <span>Trusted by</span>
        <span className="font-bold text-gray-900">40,000+</span>
        <span>agencies</span>
      </p>
    </div>
  );
}
