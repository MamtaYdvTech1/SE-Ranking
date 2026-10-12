'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';

interface CloudflareChallengeScreenProps {
  redirectUrl?: string;
  autoPass?: boolean;
  onPass?: () => void;
}

function CloudflareChallengeContent({
  redirectUrl = '/login',
  autoPass = true,
  onPass,
}: CloudflareChallengeScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const target = searchParams?.get('redirect') || searchParams?.get('target') || redirectUrl;

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success'>('idle');
  const [rayId, setRayId] = useState('8d9c6f79d492c780');

  useEffect(() => {
    const array = new Uint8Array(8);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
      const hex = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
      setRayId(`8d${hex}`);
    } else {
      setRayId(`8d${Date.now().toString(16)}`);
    }
  }, []);

  const handleStartVerification = () => {
    if (status !== 'idle') return;
    setStatus('verifying');

    setTimeout(() => {
      setStatus('success');

      // Set cf_clearance cookie valid for 24 hours
      if (typeof document !== 'undefined') {
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `cf_clearance=cf_${Date.now()}_verified; path=/; expires=${expires}; SameSite=Lax`;
      }

      setTimeout(() => {
        if (onPass) {
          onPass();
        } else {
          let dest =
            !target || target.startsWith('/security-check') || target.startsWith('/cdn-cgi')
              ? '/login'
              : target;
          try {
            const u = new URL(dest, 'http://localhost');
            u.searchParams.delete('challenge');
            dest = `${u.pathname}${u.search ? u.search : ''}${u.hash}` || '/login';
          } catch {
            dest = dest.replace(/([?&])challenge(=[^&]*)?(&|$)/, '$1').replace(/[?&]$/, '') || '/login';
          }
          router.push(dest);
        }
      }, 700);
    }, 1200);
  };

  useEffect(() => {
    // Set page title to Cloudflare's exact "Just a moment..."
    document.title = 'Just a moment...';

    // Auto-verify if autoPass is enabled after a realistic short delay
    let timer: NodeJS.Timeout;
    if (autoPass) {
      timer = setTimeout(() => {
        handleStartVerification();
      }, 1400);
    }

    return () => clearTimeout(timer);
  }, [autoPass]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#000000] text-white flex flex-col justify-between p-6 sm:p-12 md:p-16 font-sans select-none antialiased overflow-y-auto">
      {/* Main Content Area - Generous, Prominent & Authentic */}
      <div className="max-w-[560px] w-full mx-auto pt-10 sm:pt-20 space-y-6">
        {/* Domain with Bar Chart Icon Matching Screenshot Exactly */}
        <div className="flex items-center gap-3">
          <div className="flex items-end gap-[3px] h-[22px] w-[22px] text-[#9CA3AF]">
            <span className="w-[3.5px] h-[8px] bg-[#9CA3AF] rounded-[1px]" />
            <span className="w-[3.5px] h-[15px] bg-[#9CA3AF] rounded-[1px]" />
            <span className="w-[3.5px] h-[22px] bg-[#9CA3AF] rounded-[1px]" />
          </div>
          <h1 className="text-2xl sm:text-[25px] font-semibold tracking-tight text-white">
            online.seranking.com
          </h1>
        </div>

        {/* Verification Headline & Description */}
        <div className="space-y-2 pt-1">
          <h2 className="text-lg sm:text-[20px] font-medium text-white tracking-normal">
            {status === 'success'
              ? 'Verification complete'
              : 'Performing security verification'}
          </h2>
          <p className="text-xs sm:text-[13px] text-[#9CA3AF] leading-relaxed">
            This website uses a security service to protect against malicious bots. This page is
            displayed while the website verifies you are not a bot.
          </p>
        </div>

        {/* Cloudflare Turnstile Verification Box - Large, Authentic & Interactive */}
        <div className="pt-3">
          <div
            onClick={status === 'idle' ? handleStartVerification : undefined}
            role="button"
            tabIndex={0}
            aria-label="Cloudflare Turnstile verification"
            className="w-full max-w-[360px] h-[78px] bg-[#1C1F26] border border-[#2F3542] hover:border-[#434B5C] rounded-lg px-4.5 flex items-center justify-between shadow-2xl cursor-pointer transition-all duration-200 group"
          >
            {/* Left: Checkbox / Spinner / Checkmark */}
            <div className="flex items-center gap-3.5">
              {status === 'idle' && (
                <div className="w-6 h-6 rounded-[5px] border-2 border-gray-400 group-hover:border-white bg-white/5 transition-all flex items-center justify-center shadow-inner">
                  <div className="w-2.5 h-2.5 bg-transparent rounded-[2px]" />
                </div>
              )}

              {status === 'verifying' && (
                <div className="relative w-6 h-6 flex items-center justify-center">
                  {/* Authentic 8-dot Cloudflare Turnstile Spinner */}
                  <svg
                    className="w-6 h-6 animate-spin text-[#10B981]"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle cx="12" cy="3" r="1.8" fill="currentColor" opacity="1" />
                    <circle cx="18.36" cy="5.64" r="1.8" fill="currentColor" opacity="0.875" />
                    <circle cx="21" cy="12" r="1.8" fill="currentColor" opacity="0.75" />
                    <circle cx="18.36" cy="18.36" r="1.8" fill="currentColor" opacity="0.625" />
                    <circle cx="12" cy="21" r="1.8" fill="currentColor" opacity="0.5" />
                    <circle cx="5.64" cy="18.36" r="1.8" fill="currentColor" opacity="0.375" />
                    <circle cx="3" cy="12" r="1.8" fill="currentColor" opacity="0.25" />
                    <circle cx="5.64" cy="5.64" r="1.8" fill="currentColor" opacity="0.125" />
                  </svg>
                </div>
              )}

              {status === 'success' && (
                <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center text-white shadow-md animate-in zoom-in-75 duration-200">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              <span className="text-[13.5px] sm:text-[14px] text-[#F3F4F6] font-normal tracking-wide">
                {status === 'idle'
                  ? 'Verify you are human'
                  : status === 'verifying'
                  ? 'Verifying...'
                  : 'Success'}
              </span>
            </div>

            {/* Right: Cloudflare Logo & Policy Links */}
            <div className="flex flex-col items-end shrink-0 pl-3">
              <div className="flex items-center gap-1.5">
                {/* Cloudflare Orange Cloud SVG */}
                <svg
                  className="w-6 h-4"
                  viewBox="0 0 24 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.35 6.04C18.67 2.59 15.64 0 12 0C9.11 0 6.6 1.64 5.35 4.04C2.34 4.36 0 6.91 0 10C0 13.31 2.69 16 6 16H19C21.76 16 24 13.76 24 11C24 8.36 21.95 6.22 19.35 6.04Z"
                    fill="#F6821F"
                  />
                  <path
                    d="M19 15H6C3.24 15 1 12.76 1 10C1 7.42 2.95 5.33 5.48 5.03L6.37 4.93L6.78 4.14C7.79 2.19 9.77 1 12 1C14.99 1 17.51 3.09 18.17 6.02L18.42 7.15L19.57 7.23C21.52 7.37 23 9.02 23 11C23 13.21 21.21 15 19 15Z"
                    fill="#F6821F"
                  />
                </svg>
                <span className="text-[10px] font-bold text-gray-200 tracking-wider">
                  CLOUDFLARE
                </span>
              </div>
              <div className="text-[9px] text-gray-400 mt-0.5 space-x-1">
                <a
                  href="https://www.cloudflare.com/privacypolicy/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline hover:text-gray-200"
                >
                  Privacy
                </a>
                <span>•</span>
                <a
                  href="https://www.cloudflare.com/website-terms/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline hover:text-gray-200"
                >
                  Terms
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice Note */}
        <div className="pt-2">
          <p className="text-[11px] text-[#6B7280] leading-relaxed">
            Requests from your browser are automatically checked to maintain the platform&apos;s
            performance and protect user accounts from unauthorized traffic.
          </p>
        </div>
      </div>

      {/* Cloudflare Official Footer */}
      <div className="max-w-[560px] w-full mx-auto pb-4 space-y-1 text-center sm:text-left text-[11px] text-gray-500 font-mono">
        <p>Ray ID: {rayId}</p>
        <p className="text-[10px] text-gray-600">Performance &amp; security by Cloudflare</p>
      </div>
    </div>
  );
}

export function CloudflareChallengeScreen(props: CloudflareChallengeScreenProps) {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-[9999] bg-[#000000] text-white flex items-center justify-center font-sans">
          <div className="w-6 h-6 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CloudflareChallengeContent {...props} />
    </Suspense>
  );
}
