'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { ReportBugModal } from '@/components/modals/ReportBugModal';

interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className = '' }: AppFooterProps) {
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

  return (
    <>
      <footer
        className={`border-t border-gray-200 bg-white py-3.5 px-6 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto w-full select-none shrink-0 z-20 ${className}`}
      >
        <div className="flex items-center gap-2">
          <Link href="/admin.dashboard.html" className="hover:opacity-90 flex items-center">
            <SeRankingLogo variant="brand" width={110} height={25} />
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-xs text-gray-500">
          <button
            type="button"
            onClick={() => setIsBugModalOpen(true)}
            className="hover:text-[#7C3AED] transition-colors cursor-pointer text-gray-600 font-semibold"
          >
            Report a bug
          </button>
          <a
            href="https://seranking.com/affiliate.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#7C3AED] transition-colors text-gray-600 font-semibold"
          >
            Affiliates
          </a>
          <a
            href="https://seranking.com/api.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#7C3AED] transition-colors text-gray-600 font-semibold"
          >
            API
          </a>
          <a
            href="https://seranking.com/whats-new.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#7C3AED] transition-colors text-gray-600 font-semibold"
          >
            What&apos;s new
          </a>
          <a
            href="/help"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#7C3AED] transition-colors text-gray-600 font-semibold"
          >
            Help
          </a>
        </div>

        {/* Google reCAPTCHA Footer Protection */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <svg className="w-3.5 h-3.5 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
          <span>Protected by <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-[#7C3AED] underline">reCAPTCHA</a></span>
        </div>
      </footer>

      {/* Interactive Report a Bug Modal */}
      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />
    </>
  );
}
