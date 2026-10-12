'use client';

import React, { useState, useEffect } from 'react';

const AVATAR_LIST = [
  '/images/avatars/avatar1.jpg',
  '/images/avatars/avatar2.jpg',
  '/images/avatars/avatar3.jpg',
  '/images/avatars/avatar4.png',
  '/images/avatars/avatar5.png',
  '/images/avatars/avatar6.png',
  '/images/avatars/avatar7.png',
  '/images/avatars/avatar8.png',
];

// Duplicate for infinite seamless carousel
const EXTENDED_AVATARS = [...AVATAR_LIST, ...AVATAR_LIST, ...AVATAR_LIST];

export function HeroAvatarSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [withTransition, setWithTransition] = useState(true);

  // Each avatar is 42px wide with -12px overlap => shift step is 30px
  const STEP_PX = 30;

  useEffect(() => {
    const timer = setInterval(() => {
      setWithTransition(true);
      setCurrentIndex((prev) => prev + 1);
    }, 2200);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // When we've scrolled past the first full set, seamlessly snap back to 0 without transition
    if (currentIndex >= AVATAR_LIST.length) {
      const snapTimer = setTimeout(() => {
        setWithTransition(false);
        setCurrentIndex(0);
      }, 600); // after the 600ms transition finishes
      return () => clearTimeout(snapTimer);
    }
  }, [currentIndex]);

  return (
    <div className="inline-flex items-center justify-center gap-3.5 select-none">
      {/* 3 visible overlapping avatars container (width ~102px, height 44px) */}
      <div className="relative w-[102px] h-[46px] overflow-hidden flex items-center">
        <div
          className="flex -space-x-3 items-center"
          style={{
            transform: `translateX(-${currentIndex * STEP_PX}px)`,
            transition: withTransition ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        >
          {EXTENDED_AVATARS.map((src, idx) => (
            <div
              key={idx}
              className="relative shrink-0 w-10.5 h-10.5 rounded-full ring-2 ring-white shadow-xs overflow-hidden bg-gray-100"
              style={{ zIndex: EXTENDED_AVATARS.length - idx }}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          ))}
        </div>
      </div>

      <span className="text-[16px] text-[#374151]">
        Trusted by <strong className="font-bold text-[#111827]">40,000+</strong> agencies
      </span>
    </div>
  );
}
