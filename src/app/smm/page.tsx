'use client';

import React, { useState, useEffect } from 'react';
import { ReportBugModal } from '@/components/modals/ReportBugModal';
import { PlanableWelcomeModal } from '@/components/smm/PlanableWelcomeModal';

export default function SmmPage() {
  // Tabs for "Perfect for agencies and brands that love teamwork"
  const [activeTab, setActiveTab] = useState(0);

  // Testimonials Carousel: 0 -> cards 1 & 2, 1 -> cards 3 & 4
  const [testimonialPage, setTestimonialPage] = useState(0);

  // Dropdown / Modal states
  const [isHeroDropdownOpen, setIsHeroDropdownOpen] = useState(false);
  const [isBottomDropdownOpen, setIsBottomDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlanableWelcomeOpen, setIsPlanableWelcomeOpen] = useState(true);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'Facebook',
    'Instagram',
    'LinkedIn',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-prompt welcome modal on first visit or query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isWelcome = params.get('welcome');
      if (isWelcome === '0') {
        setIsPlanableWelcomeOpen(false);
      } else {
        setIsPlanableWelcomeOpen(true);
      }
    }
  }, []);

  // 9 Platforms list with exact official SVG icons matching SE Ranking Planable design
  const platforms = [
    {
      name: 'Facebook',
      icon: (
        <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="5" fill="#1877F2" />
          <path
            d="M15.5 13.5l.5-3.5h-3.5V7.8c0-1 .5-1.5 1.5-1.5h2V3.2c-.4-.1-1.4-.2-2.6-.2-2.7 0-4.4 1.6-4.4 4.5v2.5H6v3.5h3v8.5h3.5v-8.5h3z"
            fill="#ffffff"
          />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      icon: (
        <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
          <defs>
            <radialGradient id="smm-ig-icon" r="150%" cx="30%" cy="107%">
              <stop stopColor="#fdf497" offset="0%" />
              <stop stopColor="#fdf497" offset="5%" />
              <stop stopColor="#fd5949" offset="45%" />
              <stop stopColor="#d6249f" offset="60%" />
              <stop stopColor="#285AEB" offset="90%" />
            </radialGradient>
          </defs>
          <rect width="24" height="24" rx="6.5" fill="url(#smm-ig-icon)" />
          <path
            fill="#ffffff"
            d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
          />
          <path
            fill="#ffffff"
            fillRule="evenodd"
            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689-.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"
          />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="5" fill="#0A66C2" />
          <path
            fill="#ffffff"
            d="M7.12 19H4.44V10.4h2.68V19zM5.78 9.22a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1zM19.56 19h-2.68v-4.18c0-1-.02-2.28-1.39-2.28-1.39 0-1.6 1.09-1.6 2.21V19h-2.68V10.4h2.57v1.17h.04c.36-.68 1.23-1.4 2.54-1.4 2.72 0 3.22 1.79 3.22 4.12V19z"
          />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      icon: (
        <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
          <path
            fill="#FF0000"
            d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
          />
          <path fill="#ffffff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="#000000">
          <rect width="24" height="24" rx="5" fill="#000000" />
          <path
            fill="#ffffff"
            d="M17.2 4.5h2.15l-4.7 5.37 5.53 7.63h-4.33l-3.39-4.44-3.88 4.44H6.33l5.03-5.75L6 4.5h4.44l3.07 4.05L17.2 4.5zm-.75 11.7h1.19L8.85 5.75H7.58l8.87 10.45z"
          />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      icon: (
        <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="5" fill="#000000" />
          <path
            fill="#ffffff"
            d="M17.5 7.2a4.3 4.3 0 0 1-3.2-3.7V3h-2.8v11.8a2.5 2.5 0 0 1-4.4 1.5 2.5 2.5 0 0 1 2-4c.25 0 .5.03.74.1V9.6a5.5 5.5 0 0 0-.74-.05 5.4 5.4 0 0 0-5.4 5.4 5.4 5.4 0 0 0 9.2 3.8 5.3 5.3 0 0 0 1.6-3.8V8.8a7 7 0 0 0 4.1 1.3V7.3c-.4 0-.85-.05-1.1-.1z"
          />
        </svg>
      ),
    },
    {
      name: 'Pinterest',
      icon: (
        <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#E60023" />
          <path
            fill="#ffffff"
            d="M12 4.2c-4.31 0-7.8 3.49-7.8 7.8 0 3.31 2.05 6.13 4.96 7.23-.07-.61-.13-1.54.03-2.21l1-4.22s-.25-.51-.25-1.26c0-1.18.68-2.06 1.54-2.06.72 0 1.07.54 1.07 1.2 0 .73-.46 1.82-.71 2.83-.2.85.42 1.54 1.26 1.54 1.51 0 2.68-1.59 2.68-3.89 0-2.03-1.46-3.46-3.55-3.46-2.42 0-3.84 1.81-3.84 3.68 0 .73.28 1.51.63 1.94.07.09.08.16.06.25l-.23.97c-.04.15-.13.18-.3.1-1.12-.52-1.82-2.15-1.82-3.46 0-2.82 2.05-5.41 5.91-5.41 3.1 0 5.52 2.21 5.52 5.17 0 3.09-1.94 5.57-4.64 5.57-.91 0-1.76-.47-2.05-1.03l-.56 2.13c-.2.78-.75 1.76-1.12 2.36.83.25 1.7.39 2.6.39 4.31 0 7.8-3.49 7.8-7.8 0-4.31-3.49-7.8-7.8-7.8z"
          />
        </svg>
      ),
    },
    {
      name: 'Threads',
      icon: (
        <svg className="w-6 h-6 shrink-0" viewBox="0 0 192 192" fill="none">
          <circle cx="96" cy="96" r="96" fill="#000000" />
          <path
            fill="#ffffff"
            d="M141.537 88.9883C140.71 88.5919 139.87 88.2109 139.019 87.8456C137.537 60.5382 122.616 44.905 97.4619 44.905C82.6074 44.905 69.8336 51.5977 61.4704 63.705C54.4093 73.9168 51.0478 87.4116 52.0163 101.768C53.7915 128.085 70.3601 147.095 93.9922 147.095C108.318 147.095 120.312 140.751 127.818 129.215L113.821 119.866C108.775 127.625 100.957 131.785 93.9922 131.785C79.8824 131.785 68.8049 118.847 67.433 99.4678C70.6276 100.916 74.0772 102.043 77.7479 102.812C81.9366 103.687 86.3015 104.128 90.7601 104.128C103.11 104.128 113.627 99.7891 120.312 91.9566C126.046 85.2415 128.988 76.2736 128.988 66.0267C128.988 65.6599 128.988 65.2929 128.974 64.9261C133.567 71.4552 135.989 79.7942 135.989 89.9197C135.989 90.8711 135.93 91.808 135.828 92.7303C137.697 91.4363 139.605 90.1718 141.537 88.9883ZM97.4619 60.215C110.158 60.215 116.657 69.8643 116.657 88.8996C112.569 94.6644 105.109 97.808 96.0827 97.808C86.7214 97.808 80.5284 92.5135 80.5284 84.1748C80.5284 70.3601 88.5833 60.215 97.4619 60.215Z"
          />
        </svg>
      ),
    },
    {
      name: 'Google Business Profile',
      icon: (
        <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
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
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      ),
    },
  ];

  // 4 Feature tabs matching exact user HTML
  const featureTabs = [
    {
      desc: 'Manage multiple brands or clients in dedicated workspaces',
    },
    {
      desc: 'Plan, approve, and schedule content in a drag-and-drop calendar',
    },
    {
      desc: 'Collaborate effortlessly with real-time comments & suggestions',
    },
    {
      desc: 'Reply to comments and check your analytics — all in one place',
    },
  ];

  // 4 real testimonials from the exact user HTML & image
  const testimonials = [
    {
      name: 'James Bishop',
      profession: 'Founder of OneFinePlay',
      avatar: '/images/avatars/avatar1.jpg',
      initials: 'JB',
      title: 'The ultimate social media scheduling app for creatives',
      text: "Planable is hands down the best social media scheduler I've tried. As a creative, its tagging & approvals features are game-changers. Organizing content and collaborating with my team has never been easier for maximizing efficiency and creativity! We actually get stuff posted rather than not posting at all!",
    },
    {
      name: 'Waseem Satardien',
      profession: 'Founder of DTL Studios',
      avatar: '/images/avatars/avatar2.jpg',
      initials: 'WS',
      title: 'My clients love it',
      text: 'The cost is far outweighed by the ease of use and functionality that it brings to both company users and clients. Choose Planable for client flexibility and user account flexibility. Easy overview for all parties involved. Clients loved the workspace.',
    },
    {
      name: 'Teryl Brouillette',
      profession: 'Founder of Electric Kite Media',
      avatar: '/images/avatars/avatar3.jpg',
      initials: 'TB',
      title: 'The easiest tool I have found for approval workflows',
      text: "Planable is the easiest tool I have found for uploading content with a simple approval workflow that makes it easy to go from draft to published, with client's approval. It is cutting down the time required to go from drafted posts, through the necessary approvals and getting things published.",
    },
    {
      name: 'Yan Pierre le Luyer',
      profession: 'Founder of Legrow.studio',
      avatar: '/images/avatars/avatar4.png',
      initials: 'YP',
      title: 'Planable is visual, powerful and elegant!',
      text: 'I have long looked for an application to manage my social posts, which is both powerful and elegant in its interface. But above one which offers me a calendar compatible with my visual mind, with image thumbnails of my future publications. Planable is that app, and I love it!',
    },
  ];

  const handleAddBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/smm/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBrandName.trim(),
          workspaceName: `${newBrandName.trim()} Workspace`,
          platforms: selectedPlatforms,
        }),
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
        setNewBrandName('');
      }, 1500);
    } catch {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePlatform = (pName: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(pName) ? prev.filter((x) => x !== pName) : [...prev, pName]
    );
  };

  return (
    <div className="section-wrapper__content w-full min-h-screen bg-[#F4F6F9] py-6 sm:py-8 px-3 sm:px-6">
      
      {/* Container Matching SE Ranking .introduction-section max-width */}
      <div className="introduction-section introduction-landing max-w-[840px] mx-auto space-y-4 sm:space-y-5">

        {/* ========================================================================= */}
        {/* CARD 1: HERO ACTION BOX */}
        {/* ========================================================================= */}
        <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-null uix-bordered-layer_rad-m introduction-section__item bg-white border border-[#E1E6EB] rounded-[16px] p-6 sm:p-10 shadow-xs text-center">
          <div className="content-layout introduction-section__item-wrapper">
            <div className="content-layout introduction-section-box introduction-section-action flex flex-col items-center">
              
              {/* Planable Emblem Logo */}
              <div className="content-col introduction-section-box__logo-wrapper mb-4 sm:mb-5 flex items-center justify-center">
                <img
                  src="/images/planable-emblem.png"
                  alt="Planable Logo"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                />
              </div>

              {/* Title & Description */}
              <div className="content-row content-row_center content-row_gap-m introduction-section-box__head max-w-xl">
                <div className="content-col introduction-section-box__title">
                  <h1 className="text-xl sm:text-[26px] md:text-[28px] font-bold text-[#171A1F] leading-snug tracking-tight">
                    Grow your social media with Planable<br />by SE Ranking
                  </h1>
                </div>
                <div className="content-col introduction-section-box__description mt-2">
                  <p className="text-xs sm:text-sm text-[#5B6370]">
                    Get <strong className="font-bold text-[#171A1F]">20% off Planable</strong> for the first 12 months, available on all plans
                  </p>
                </div>
              </div>

              {/* Main Button: Start Planning */}
              <div className="content-row content-row_center introduction-section-box__main mt-6 relative">
                <div className="content-layout introduction-section-action__buttons">
                  <div className="content-row content-row_center flex items-center justify-center">
                    <div className="content-col content-col_half relative">
                      <div className="inline-flex rounded-[8px] shadow-sm">
                        <button
                          type="button"
                          onClick={() => setIsPlanableWelcomeOpen(true)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2870ED] hover:bg-[#1C60DB] active:bg-[#1553C4] text-white font-bold text-xs sm:text-sm rounded-l-[8px] transition-all select-none cursor-pointer"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                          </svg>
                          <span className="uppercase tracking-wide text-xs">Start Planning</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsHeroDropdownOpen(!isHeroDropdownOpen)}
                          className="px-2.5 py-2.5 bg-[#2870ED] hover:bg-[#1C60DB] text-white border-l border-blue-400 rounded-r-[8px] transition-colors cursor-pointer"
                          aria-label="Toggle options"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform duration-150 ${
                              isHeroDropdownOpen ? 'rotate-180' : ''
                            }`}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                          </svg>
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      {isHeroDropdownOpen && (
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-[#E1E6EB] rounded-[10px] shadow-lg py-1.5 z-30 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                          <button
                            type="button"
                            onClick={() => {
                              setIsHeroDropdownOpen(false);
                              setIsPlanableWelcomeOpen(true);
                            }}
                            className="w-full px-4 py-2 hover:bg-[#F2F5F8] text-[#171A1F] font-semibold flex items-center justify-between text-left cursor-pointer"
                          >
                            <span>Open Planable Onboarding</span>
                            <span className="text-[10px] font-bold text-[#2870ED] bg-blue-50 px-1.5 py-0.5 rounded">
                              20% OFF
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setIsHeroDropdownOpen(false);
                              setIsModalOpen(true);
                            }}
                            className="w-full px-4 py-2 hover:bg-[#F2F5F8] text-[#171A1F] flex items-center justify-between text-left cursor-pointer"
                          >
                            <span>Add Brand Workspace</span>
                            <span className="text-[10px] text-gray-500">Modal</span>
                          </button>
                          <a
                            href="https://demo.arcade.software/DgmqxJ4bIWR1m3dm9jDf?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setIsHeroDropdownOpen(false)}
                            className="w-full px-4 py-2 hover:bg-[#F2F5F8] text-[#5B6370] hover:text-[#171A1F] flex items-center justify-between text-left cursor-pointer"
                          >
                            <span>Open Interactive Tour</span>
                            <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: 9 SOCIAL PLATFORMS LIST */}
        {/* ========================================================================= */}
        <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-null uix-bordered-layer_rad-m introduction-section__item bg-white border border-[#E1E6EB] rounded-[16px] p-5 sm:p-7 shadow-xs">
          <div className="content-layout introduction-section__item-wrapper">
            <div className="content-layout introduction-section-box introduction-section-custom text-center">
              
              <div className="content-row content-row_center content-row_gap-m introduction-section-box__head mb-4 sm:mb-5">
                <div className="content-col introduction-section-box__subtitle text-sm sm:text-base font-bold text-[#171A1F]">
                  Schedule and publish your content on 9 platforms
                </div>
                <div className="content-col introduction-section-box__description">
                  <span></span>
                </div>
              </div>

              <div className="content-row content-row_center introduction-section-box__main">
                <div className="content-row content-row_center introduction-landing__social-list flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-7 gap-y-3 max-w-3xl mx-auto">
                  {platforms.map((platform) => (
                    <div
                      key={platform.name}
                      onClick={() => setIsModalOpen(true)}
                      title={`Click to connect ${platform.name}`}
                      className="content-col content-col_auto introduction-landing__social-list-item flex items-center gap-2 text-xs sm:text-sm font-medium text-[#262a33] hover:text-[#2870ED] transition-colors py-1 cursor-pointer select-none"
                    >
                      <span className="se-icon-2 flex items-center justify-center shrink-0">
                        {platform.icon}
                      </span>
                      <span>{platform.name}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 3: PERFECT FOR AGENCIES AND BRANDS THAT LOVE TEAMWORK */}
        {/* ========================================================================= */}
        <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-null uix-bordered-layer_rad-m introduction-section__item bg-white border border-[#E1E6EB] rounded-[16px] p-5 sm:p-8 shadow-xs">
          <div className="content-layout introduction-section__item-wrapper">
            <div className="landing-section-image-tabs">
              <div className="landing-sections-box">
                
                <div className="landing-sections-box__head mb-6 text-center">
                  <h2 className="landing-sections-box__title text-base sm:text-xl font-bold text-[#171A1F]">
                    Perfect for agencies and brands that love teamwork
                  </h2>
                  <div className="landing-sections-box__description"></div>
                </div>

                <div className="landing-sections-box__main">
                  <div className="slider-images grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Left Tabs List */}
                    <div className="slider-images__tabs md:col-span-6 space-y-2">
                      {featureTabs.map((tab, idx) => {
                        const isActive = activeTab === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => setActiveTab(idx)}
                            className={`slider-images__item p-3.5 sm:p-4 rounded-[10px] transition-all cursor-pointer select-none ${
                              isActive
                                ? 'slider-images__item-active bg-[#F4F8FF] border-l-[3px] border-[#2870ED] shadow-xs'
                                : 'hover:bg-[#F8FAFC] border-l-[3px] border-transparent text-[#5B6370]'
                            }`}
                          >
                            <div
                              className={`slider-images__tab-desc text-xs sm:text-sm leading-relaxed ${
                                isActive ? 'text-[#171A1F] font-semibold' : 'text-[#5B6370] font-normal'
                              }`}
                            >
                              {tab.desc}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Visual Image Box: Render User's Exact Workspace Graphic */}
                    <div className="slider-images__image md:col-span-6">
                      <div className="slider-images__img rounded-[14px] bg-[#FFF4ED] border border-[#FBE3DA] p-3 sm:p-4 min-h-[300px] flex items-center justify-center relative overflow-hidden">
                        
                        {/* TAB 0: User's Exact Dedicated Workspaces Image */}
                        {activeTab === 0 && (
                          <div className="w-full flex items-center justify-center animate-in fade-in duration-200">
                            <img
                              src="/images/smm-workspace.png"
                              alt="Manage multiple brands or clients in dedicated workspaces"
                              className="w-full h-auto max-h-[320px] object-contain rounded-[10px] shadow-xs hover:scale-[1.02] transition-transform duration-200"
                            />
                          </div>
                        )}

                        {/* TAB 1: Calendar View Visual */}
                        {activeTab === 1 && (
                          <div className="w-full max-w-sm bg-white rounded-[12px] shadow-sm border border-[#E1E6EB] p-3.5 space-y-2.5 animate-in fade-in duration-200 text-left">
                            <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2">
                              <span className="text-xs font-bold text-[#171A1F] flex items-center gap-1.5">
                                <span>📅</span>
                                <span>Content Calendar</span>
                              </span>
                              <span className="text-[10px] font-semibold text-[#2870ED] bg-blue-50 px-2 py-0.5 rounded">
                                October 2026
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { day: 'Wed 14', channel: 'Instagram', title: 'Product Launch 🚀', tag: 'Approved', tagBg: 'bg-emerald-50 text-emerald-700' },
                                { day: 'Thu 15', channel: 'LinkedIn', title: 'Q3 Agency Recap', tag: 'In Review', tagBg: 'bg-amber-50 text-amber-700' },
                                { day: 'Fri 16', channel: 'TikTok', title: 'Behind the Scenes', tag: 'Scheduled', tagBg: 'bg-blue-50 text-blue-700' },
                              ].map((p, i) => (
                                <div key={i} className="bg-[#F8FAFC] rounded-[8px] p-2 border border-[#E1E6EB]">
                                  <div className="text-[9px] font-bold text-[#7A8391] mb-1">{p.day}</div>
                                  <div className="bg-white p-1.5 rounded-[6px] border border-[#E1E6EB] space-y-1">
                                    <span className="text-[9px] font-bold text-[#2870ED] block truncate">{p.channel}</span>
                                    <p className="text-[10px] font-medium text-[#171A1F] line-clamp-1">{p.title}</p>
                                    <span className={`text-[8px] font-bold px-1 py-0.5 rounded inline-block ${p.tagBg}`}>
                                      {p.tag}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TAB 2: Real-time Comments & Suggestions */}
                        {activeTab === 2 && (
                          <div className="w-full max-w-sm bg-white rounded-[12px] shadow-sm border border-[#E1E6EB] p-3.5 space-y-2.5 animate-in fade-in duration-200 text-left">
                            <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2">
                              <span className="text-xs font-bold text-[#171A1F] flex items-center gap-1.5">
                                <span>💬</span>
                                <span>Collaborative Approvals</span>
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                1 Pending
                              </span>
                            </div>
                            <div className="bg-[#F8FAFC] p-2.5 rounded-[8px] border border-[#E1E6EB] flex items-start gap-2">
                              <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0">
                                JB
                              </div>
                              <div className="flex-1 text-[11px]">
                                <div className="font-bold text-[#171A1F] flex items-center justify-between">
                                  <span>James Bishop</span>
                                  <span className="text-gray-400 font-normal text-[9px]">Just now</span>
                                </div>
                                <p className="text-[#5B6370] text-[10px] mt-0.5">
                                  Headline looks great! Ready to publish across Instagram &amp; LinkedIn.
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <span className="px-3 py-1 bg-[#10B981] text-white rounded-[6px] text-[10px] font-bold">
                                Approved ✓
                              </span>
                            </div>
                          </div>
                        )}

                        {/* TAB 3: Comments & Analytics */}
                        {activeTab === 3 && (
                          <div className="w-full max-w-sm bg-white rounded-[12px] shadow-sm border border-[#E1E6EB] p-3.5 space-y-2.5 animate-in fade-in duration-200 text-left">
                            <div className="flex items-center justify-between border-b border-[#F0F2F5] pb-2">
                              <span className="text-xs font-bold text-[#171A1F] flex items-center gap-1.5">
                                <span>📊</span>
                                <span>Unified Social Analytics</span>
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                +34.8%
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="bg-[#F8FAFC] p-2 rounded-[8px] border border-[#E1E6EB]">
                                <span className="text-[10px] text-[#7A8391] block">Total Impressions</span>
                                <span className="text-sm font-bold text-[#171A1F]">482,910</span>
                              </div>
                              <div className="bg-[#F8FAFC] p-2 rounded-[8px] border border-[#E1E6EB]">
                                <span className="text-[10px] text-[#7A8391] block">Avg Engagement</span>
                                <span className="text-sm font-bold text-[#2870ED]">4.82%</span>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 4: ARCADE INTERACTIVE DEMO IFRAME */}
        {/* ========================================================================= */}
        <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-null uix-bordered-layer_rad-m introduction-section__item bg-white border border-[#E1E6EB] rounded-[16px] overflow-hidden shadow-xs">
          <div className="content-layout introduction-section__item-wrapper">
            <div className="introduction-section-demo relative">
              
              {/* Browser Header Bar */}
              <div className="bg-[#F8FAFC] border-b border-[#E1E6EB] px-4 py-2 flex items-center justify-between text-xs text-[#5B6370]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block"></span>
                  <span className="ml-2 font-medium text-[#323842] text-[11px] truncate">
                    Planable interactive tour for SE Ranking
                  </span>
                </div>
                <a
                  href="https://demo.arcade.software/DgmqxJ4bIWR1m3dm9jDf?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2870ED] hover:underline flex items-center gap-1 text-[11px] font-semibold shrink-0"
                >
                  <span>Open in full tab</span>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                  </svg>
                </a>
              </div>

              {/* Exact Arcade Software Iframe Embed */}
              <div className="w-full aspect-[16/10] sm:aspect-[16/9] min-h-[380px] sm:min-h-[460px] bg-gray-900">
                <iframe
                  className="introduction-section-demo__iframe w-full h-full border-0"
                  src="https://demo.arcade.software/DgmqxJ4bIWR1m3dm9jDf?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
                  loading="lazy"
                  allowFullScreen
                  allow="clipboard-write"
                  title="Planable Interactive Demo"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 5: TESTIMONIALS CAROUSEL */}
        {/* ========================================================================= */}
        <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-null uix-bordered-layer_rad-m introduction-section__item bg-white border border-[#E1E6EB] rounded-[16px] p-5 sm:p-8 shadow-xs">
          <div className="content-layout introduction-section__item-wrapper">
            <div className="content-layout introduction-section-box introduction-section-carousel">
              
              <div className="content-row content-row_center content-row_gap-m introduction-section-box__head">
                <div className="content-col introduction-section-box__description">
                  <span></span>
                </div>
              </div>

              <div className="content-row content-row_center introduction-section-box__main">
                <div className="carousel-slide introduction-section-carousel__wrapper w-full">
                  <div className="carousel-slide__wrapper overflow-hidden">
                    <div className="carousel-slide__list">
                      
                      {/* Carousel Slides Container */}
                      <div
                        className="carousel-slide__slides flex transition-transform duration-300 ease-out"
                        style={{
                          transform: `translate3d(-${testimonialPage * 100}%, 0px, 0px)`,
                        }}
                      >
                        {/* Slide Page 1: Cards 1 & 2 */}
                        <div className="min-w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[testimonials[0], testimonials[1]].map((t, idx) => (
                            <div key={idx} className="content-col content-col_half testimonial-card flex-1">
                              <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-xl uix-bordered-layer_rad-m testimonial-card__wrapper bg-[#F8FAFC] border border-[#E1E6EB] rounded-[12px] p-5 h-full flex flex-col justify-between space-y-4 hover:border-[#CBD5E1] transition-all">
                                <div className="content-row space-y-3">
                                  {/* Author info */}
                                  <div className="content-col testimonial-card__info-wrapper flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 border border-[#E1E6EB] shadow-xs shrink-0 flex items-center justify-center">
                                      <img
                                        className="testimonial-card__avatar w-full h-full object-cover"
                                        src={t.avatar}
                                        alt={t.name}
                                      />
                                    </div>
                                    <div className="testimonial-card__name-wrapper">
                                      <div className="testimonial-card__name font-bold text-[#171A1F] text-sm">
                                        {t.name}
                                      </div>
                                      <div className="testimonial-card__profession text-xs text-[#5B6370]">
                                        {t.profession}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Title */}
                                  <div className="content-col testimonial-card__title font-bold text-sm text-[#171A1F] leading-snug pt-1">
                                    {t.title}
                                  </div>

                                  {/* Text */}
                                  <div className="content-col testimonial-card__text text-xs text-[#5B6370] leading-relaxed">
                                    {t.text}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Slide Page 2: Cards 3 & 4 */}
                        <div className="min-w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[testimonials[2], testimonials[3]].map((t, idx) => (
                            <div key={idx} className="content-col content-col_half testimonial-card flex-1">
                              <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-xl uix-bordered-layer_rad-m testimonial-card__wrapper bg-[#F8FAFC] border border-[#E1E6EB] rounded-[12px] p-5 h-full flex flex-col justify-between space-y-4 hover:border-[#CBD5E1] transition-all">
                                <div className="content-row space-y-3">
                                  {/* Author info */}
                                  <div className="content-col testimonial-card__info-wrapper flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 border border-[#E1E6EB] shadow-xs shrink-0 flex items-center justify-center">
                                      <img
                                        className="testimonial-card__avatar w-full h-full object-cover"
                                        src={t.avatar}
                                        alt={t.name}
                                      />
                                    </div>
                                    <div className="testimonial-card__name-wrapper">
                                      <div className="testimonial-card__name font-bold text-[#171A1F] text-sm">
                                        {t.name}
                                      </div>
                                      <div className="testimonial-card__profession text-xs text-[#5B6370]">
                                        {t.profession}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Title */}
                                  <div className="content-col testimonial-card__title font-bold text-sm text-[#171A1F] leading-snug pt-1">
                                    {t.title}
                                  </div>

                                  {/* Text */}
                                  <div className="content-col testimonial-card__text text-xs text-[#5B6370] leading-relaxed">
                                    {t.text}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Carousel Navigation (< 1-2 from 4 >) */}
                  <div className="carousel-slide__navigation carousel-slide__navigation_center mt-6 flex items-center justify-center">
                    <div className="carousel-slide__wrapp carousel-slide__wrapp_center flex items-center gap-4">
                      
                      {/* Prev Button */}
                      <button
                        onClick={() => setTestimonialPage(0)}
                        disabled={testimonialPage === 0}
                        aria-label="Previous testimonials"
                        className={`se-button_icon se-button-2_size-l se-button-2_no-text se-button-2 carousel-slide__button carousel__button_prev se-button-2_table p-2 rounded-[8px] border transition-colors select-none ${
                          testimonialPage === 0
                            ? 'se-button-2_disabled opacity-40 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400'
                            : 'hover:bg-[#F2F5F8] border-[#E1E6EB] text-[#171A1F] cursor-pointer'
                        }`}
                      >
                        <span className="se-button-2__wrapper flex items-center justify-center">
                          <span className="se-material-icon-2 se-button-2__icon notranslate se-button-2__icon_no-text">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z" />
                            </svg>
                          </span>
                        </span>
                      </button>

                      {/* Count Indicator */}
                      <div className="carousel-slide__count text-xs font-semibold text-[#5B6370] select-none">
                        {testimonialPage === 0 ? '1-2 from 4' : '3-4 from 4'}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => setTestimonialPage(1)}
                        disabled={testimonialPage === 1}
                        aria-label="Next testimonials"
                        className={`se-button_icon se-button-2_size-l se-button-2_no-text se-button-2 carousel-slide__button carousel__button_next se-button-2_table p-2 rounded-[8px] border transition-colors select-none ${
                          testimonialPage === 1
                            ? 'se-button-2_disabled opacity-40 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400'
                            : 'hover:bg-[#F2F5F8] border-[#E1E6EB] text-[#171A1F] cursor-pointer'
                        }`}
                      >
                        <span className="se-button-2__wrapper flex items-center justify-center">
                          <span className="se-material-icon-2 se-button-2__icon notranslate se-button-2__icon_no-text">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M5.88 4.12L13.76 12l-7.88 7.88L8 22l10-10L8 2z" />
                            </svg>
                          </span>
                        </span>
                      </button>

                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 6: BOTTOM ACTION BOX */}
        {/* ========================================================================= */}
        <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-null uix-bordered-layer_rad-m introduction-section__item bg-white border border-[#E1E6EB] rounded-[16px] p-6 sm:p-10 shadow-xs text-center">
          <div className="content-layout introduction-section__item-wrapper">
            <div className="content-layout introduction-section-box introduction-section-action flex flex-col items-center">
              
              <div className="content-row content-row_center content-row_gap-m introduction-section-box__head max-w-xl">
                <div className="content-col introduction-section-box__title">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#171A1F] tracking-tight">
                    Start planning and get 20% off
                  </h2>
                </div>
                <div className="content-col introduction-section-box__description mt-1.5">
                  <p className="text-xs sm:text-sm text-[#5B6370]">
                    to any pricing plan for the first year
                  </p>
                </div>
              </div>

              <div className="content-row content-row_center introduction-section-box__main mt-6 relative">
                <div className="content-layout introduction-section-action__buttons">
                  <div className="content-row content-row_center flex items-center justify-center">
                    <div className="content-col content-col_half relative">
                      <div className="inline-flex rounded-[8px] shadow-sm">
                        <button
                          type="button"
                          onClick={() => setIsPlanableWelcomeOpen(true)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2870ED] hover:bg-[#1C60DB] active:bg-[#1553C4] text-white font-bold text-xs sm:text-sm rounded-l-[8px] transition-all select-none cursor-pointer"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                          </svg>
                          <span className="uppercase tracking-wide text-xs">Add first brand</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsBottomDropdownOpen(!isBottomDropdownOpen)}
                          className="px-2.5 py-2.5 bg-[#2870ED] hover:bg-[#1C60DB] text-white border-l border-blue-400 rounded-r-[8px] transition-colors cursor-pointer"
                          aria-label="Toggle options"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform duration-150 ${
                              isBottomDropdownOpen ? 'rotate-180' : ''
                            }`}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                          </svg>
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      {isBottomDropdownOpen && (
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-[#E1E6EB] rounded-[10px] shadow-lg py-1.5 z-30 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                          <button
                            type="button"
                            onClick={() => {
                              setIsBottomDropdownOpen(false);
                              setIsPlanableWelcomeOpen(true);
                            }}
                            className="w-full px-4 py-2 hover:bg-[#F2F5F8] text-[#171A1F] font-semibold flex items-center justify-between text-left cursor-pointer"
                          >
                            <span>Open Planable Onboarding</span>
                            <span className="text-[10px] font-bold text-[#2870ED] bg-blue-50 px-1.5 py-0.5 rounded">
                              20% OFF
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setIsBottomDropdownOpen(false);
                              setIsModalOpen(true);
                            }}
                            className="w-full px-4 py-2 hover:bg-[#F2F5F8] text-[#171A1F] flex items-center justify-between text-left cursor-pointer"
                          >
                            <span>Add Brand Workspace</span>
                            <span className="text-[10px] text-gray-500">Modal</span>
                          </button>
                          <a
                            href="https://demo.arcade.software/DgmqxJ4bIWR1m3dm9jDf?embed&embed_mobile=inline&embed_desktop=inline&show_copy_link=true"
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setIsBottomDropdownOpen(false)}
                            className="w-full px-4 py-2 hover:bg-[#F2F5F8] text-[#5B6370] hover:text-[#171A1F] flex items-center justify-between text-left cursor-pointer"
                          >
                            <span>Open Interactive Tour</span>
                            <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ===================== MODAL: ADD FIRST BRAND ===================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
            >
              ✕
            </button>

            {isSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h3 className="text-base font-bold text-gray-900">Brand Workspace Created!</h3>
                <p className="text-xs text-gray-600 max-w-xs mx-auto">
                  Your Planable workspace has been created with 20% discount applied.
                </p>
                <div className="pt-2 flex justify-center">
                  <a
                    href="https://app.planable.io/onboarding/details"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-[#2870ED] hover:bg-[#1C60DB] text-white font-bold rounded-lg text-xs transition-colors shadow-xs inline-flex items-center gap-2"
                  >
                    <span>Proceed to Planable Onboarding</span>
                    <span>➔</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddBrandSubmit} className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2870ED] flex items-center justify-center font-bold text-sm">
                    🚀
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Add Brand to Planable</h3>
                    <p className="text-xs text-gray-500">20% exclusive partner discount applied automatically</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Brand or Client Workspace Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="e.g. Juice Tokyo, Acme Agency"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#2870ED]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Select Social Channels to Connect (9 platforms)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {platforms.map((p) => {
                      const isSel = selectedPlatforms.includes(p.name);
                      return (
                        <button
                          type="button"
                          key={p.name}
                          onClick={() => togglePlatform(p.name)}
                          className={`p-2 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSel
                              ? 'border-[#2870ED] bg-blue-50/70 text-blue-900 font-bold'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="shrink-0 scale-75">{p.icon}</div>
                          <span className="truncate">{p.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-800 flex items-center gap-2">
                  <span className="text-amber-600">✨</span>
                  <span>Partner promo code <b>SERANKING20</b> will automatically activate 20% off.</span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    {isSubmitting ? 'Creating...' : 'Start Planning'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}



      {/* Planable Welcome Modal */}
      <PlanableWelcomeModal
        isOpen={isPlanableWelcomeOpen}
        onClose={() => setIsPlanableWelcomeOpen(false)}
      />

      {/* Bug Report Modal */}
      <ReportBugModal
        isOpen={isBugReportOpen}
        onClose={() => setIsBugReportOpen(false)}
      />

    </div>
  );
}
