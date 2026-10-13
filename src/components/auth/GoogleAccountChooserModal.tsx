'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';

export interface GoogleAccountProfile {
  name: string;
  email: string;
  avatarLetter: string;
  bgColor: string;
  signedOut?: boolean;
  isWorkAccount?: boolean;
  organization?: string;
  signedIn?: boolean;
}

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName?: string;
  workspaceDomain?: string;
  onSelectAccount?: (account: GoogleAccountProfile) => void | Promise<void>;
}

export function GoogleAccountChooserModal({
  isOpen,
  onClose,
  serviceName = 'SE Ranking',
  onSelectAccount,
}: GoogleAccountChooserModalProps) {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // Check if Google OAuth client ID is configured
    fetch('/api/auth/google?format=json')
      .then((res) => res.json())
      .then((data) => {
        setIsConfigured(Boolean(data.configured));
      })
      .catch(() => {
        setIsConfigured(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinueWithGoogle = () => {
    setIsLoading(true);
    const currentPath =
      typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : '/projects';
    window.location.href = `/api/auth/google?state=${encodeURIComponent(currentPath)}`;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl w-full max-w-[420px] shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-gray-200/90 overflow-hidden text-left flex flex-col my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="pt-7 pb-4 px-6 text-center border-b border-gray-100 bg-white">
          <div className="flex justify-center mb-3">
            <svg className="w-8 h-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
          </div>

          <h2 className="text-[20px] font-semibold text-[#202124] tracking-tight leading-snug">
            Sign in with Google
          </h2>
          <p className="text-[13px] text-[#5F6368] mt-1">
            to continue to <span className="font-semibold text-[#1A202C]">{serviceName}</span>
          </p>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {isConfigured === false ? (
            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">Google OAuth Not Configured</strong>
                  Google Sign-In requires configuring <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono text-[11px]">GOOGLE_CLIENT_ID</code> and <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono text-[11px]">GOOGLE_CLIENT_SECRET</code> in production environment variables.
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Please sign in with your email and password instead.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Use Email &amp; Password
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed text-center">
                Click below to authenticate securely through Google&apos;s official OAuth service:
              </p>

              <button
                type="button"
                id="google-direct-signin-btn"
                onClick={handleContinueWithGoogle}
                disabled={isLoading}
                className="w-full h-11 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#1A73E8]" />
                    <span>Connecting to Google...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8F9FA] border-t border-gray-100 text-[11px] text-[#5F6368] leading-relaxed text-center">
          By signing in, you agree to SE Ranking&apos;s{' '}
          <a href="/terms" className="text-[#1A73E8] hover:underline font-medium">terms of service</a> and{' '}
          <a href="/privacy" className="text-[#1A73E8] hover:underline font-medium">privacy policy</a>.
        </div>
      </div>
    </div>
  );
}
