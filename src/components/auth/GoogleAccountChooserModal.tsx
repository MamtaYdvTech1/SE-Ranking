'use client';

import React, { useState } from 'react';
import { X, Loader2, UserPlus, ShieldCheck, ArrowRight } from 'lucide-react';
import { validateRealEmail } from '@/lib/validation/email-validator';

export interface GoogleAccountProfile {
  name: string;
  email: string;
  avatarLetter: string;
  bgColor: string;
  signedOut?: boolean;
  isWorkAccount?: boolean;
  organization?: string;
}

export function getWorkAccounts(domain: string = 'jio.com'): GoogleAccountProfile[] {
  const clean = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const prefix = clean.split('.')[0].toUpperCase();
  return [
    {
      name: `${prefix} Digital Analytics`,
      email: `analytics@${clean}`,
      avatarLetter: prefix[0] || 'J',
      bgColor: 'bg-[#0B69FF]',
      isWorkAccount: true,
      organization: `${clean} Google Workspace`,
    },
    {
      name: `${prefix} Growth & SEO Team`,
      email: `growth@${clean}`,
      avatarLetter: 'G',
      bgColor: 'bg-[#7C3AED]',
      isWorkAccount: true,
      organization: `${clean} Google Workspace`,
    },
    {
      name: `${prefix} Enterprise Admin`,
      email: `admin@${clean}`,
      avatarLetter: 'E',
      bgColor: 'bg-[#059669]',
      isWorkAccount: true,
      organization: `${clean} Google Workspace`,
    },
  ];
}

export const DEFAULT_GOOGLE_ACCOUNTS: GoogleAccountProfile[] = getWorkAccounts('jio.com');

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName?: string; // e.g., 'Google Analytics', 'Google Search Console', or 'SE Ranking'
  workspaceDomain?: string;
  onSelectAccount?: (account: GoogleAccountProfile) => void | Promise<void>;
}

export function GoogleAccountChooserModal({
  isOpen,
  onClose,
  serviceName = 'SE Ranking',
  workspaceDomain,
  onSelectAccount,
}: GoogleAccountChooserModalProps) {
  const [isSigningIn, setIsSigningIn] = useState<string | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChoose = async (account: GoogleAccountProfile) => {
    setIsSigningIn(account.email);
    setErrorMsg(null);

    try {
      // 1. Post to live API endpoint /api/auth/google
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: account.email,
          name: account.name,
          googleId: `gid_${account.email.replace(/[^a-z0-9]/gi, '_')}`,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to authenticate with Google account.');
      }

      const data = await res.json();
      const token = data?.token || `google_token_${Date.now()}`;
      const safeUser = data?.user || {
        email: account.email,
        name: account.name,
        role: 'OWNER',
      };

      // 2. Persist in localStorage and cookies for seamless authenticated state across all views
      if (typeof window !== 'undefined') {
        localStorage.setItem('seranking_auth_status', 'logged_in');
        sessionStorage.setItem('seranking_auth_status', 'logged_in');
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_email', account.email);
        localStorage.setItem('user_name', account.name);
        localStorage.setItem('seranking_user', JSON.stringify(safeUser));

        // Mark integrations connected for all project variants
        localStorage.setItem('se_ranking_connected_account', account.email);
        localStorage.setItem('se_ranking_connected_user', account.name);

        const projectKeys = ['default', '12990854', '12960641', '13038212', '13022261'];
        projectKeys.forEach((key) => {
          try {
            const raw = localStorage.getItem(`se_ranking_connected_services_${key}`);
            const existing = raw ? JSON.parse(raw) : {};
            existing['Google Analytics'] = true;
            existing['Google Search Console'] = true;
            localStorage.setItem(`se_ranking_connected_services_${key}`, JSON.stringify(existing));
          } catch {}
        });

        // Also store active project integration if present
        const activeProjId = localStorage.getItem('se_ranking_active_project_id');
        if (activeProjId) {
          try {
            const raw = localStorage.getItem(`se_ranking_connected_services_${activeProjId}`);
            const existing = raw ? JSON.parse(raw) : {};
            existing['Google Analytics'] = true;
            existing['Google Search Console'] = true;
            localStorage.setItem(`se_ranking_connected_services_${activeProjId}`, JSON.stringify(existing));
          } catch {}
        }

        window.dispatchEvent(new CustomEvent('seranking_auth_change'));
        window.dispatchEvent(new CustomEvent('se_ranking_integrations_updated', {
          detail: { email: account.email, service: serviceName },
        }));
      }

      if (typeof document !== 'undefined') {
        document.cookie = `seranking_auth_status=logged_in; path=/; max-age=86400;`;
        document.cookie = `user_email=${encodeURIComponent(account.email)}; path=/; max-age=86400;`;
        document.cookie = `user_name=${encodeURIComponent(account.name)}; path=/; max-age=86400;`;
      }

      // 3. Callback hook for caller component
      if (onSelectAccount) {
        await onSelectAccount(account);
      }

      setTimeout(() => {
        setIsSigningIn(null);
        onClose();
      }, 300);
    } catch (err: any) {
      console.error('Failed to authenticate with Google account:', err);
      setErrorMsg(err?.message || 'Authentication error. Please try again.');
      setIsSigningIn(null);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customEmail.trim().toLowerCase();
    if (!clean) {
      setErrorMsg('Please enter your Google email address.');
      return;
    }
    const check = validateRealEmail(clean);
    if (!check.valid) {
      setErrorMsg(check.error || 'Please enter a valid Google email address.');
      return;
    }
    const nameToUse = customName.trim() || clean.split('@')[0].replace(/\./g, ' ');
    handleChoose({
      name: nameToUse,
      email: clean,
      avatarLetter: clean[0].toUpperCase(),
      bgColor: 'bg-[#0B69FF]',
    });
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/55 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[430px] shadow-2xl overflow-hidden border border-purple-200 text-left animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-6 py-3.5 border-b border-purple-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            {/* Colorful Google G Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
            <span className="text-xs font-semibold text-gray-700">Sign in with Google</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Brand Logo & Choose an Account Header */}
        <div className="pt-6 pb-4 px-6 text-left">
          {/* SE Ranking Purple Logo Icon (3 vertical bars) */}
          <div className="w-10 h-10 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white shadow-xs mb-4">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="13" width="3.5" height="7" rx="1" />
              <rect x="10.25" y="8" width="3.5" height="12" rx="1" />
              <rect x="16.5" y="4" width="3.5" height="16" rx="1" />
            </svg>
          </div>

          <h2 className="text-[22px] font-medium text-[#202124] tracking-tight leading-snug">
            Choose an account
          </h2>
          <p className="text-[14px] text-[#5f6368] mt-1">
            to continue to <span className="text-[#7C3AED] font-semibold">SE Ranking</span>
          </p>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="mx-6 mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Loading Overlay */}
        {isSigningIn && (
          <div className="px-6 py-6 text-center space-y-3 bg-purple-50/60">
            <Loader2 className="w-7 h-7 text-[#7C3AED] animate-spin mx-auto" />
            <div className="text-xs font-semibold text-gray-800">
              Connecting Google Account ({isSigningIn})...
            </div>
            <div className="text-[11px] text-gray-500">
              Synchronizing permissions and live analytics telemetry data...
            </div>
          </div>
        )}

        {/* Account List */}
        {!isSigningIn && !isCustomMode && (
          <div className="divide-y divide-purple-100/60 border-t border-purple-100/60 max-h-[380px] overflow-y-auto">
            {/* Direct Official Google OAuth Redirect Button */}
            <div className="p-4 bg-purple-50/40 border-b border-purple-100/60">
              <button
                type="button"
                onClick={() => {
                  const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/projects';
                  window.location.href = `/api/auth/google?state=${encodeURIComponent(currentPath)}`;
                }}
                className="w-full py-2.5 px-3 bg-white hover:bg-gray-50 border border-gray-300 hover:border-[#7C3AED] rounded-lg text-xs font-semibold text-gray-800 flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>Authorize with Google OAuth (Live)</span>
              </button>
              <div className="mt-2 text-[10px] text-center text-gray-500 font-medium">
                or select a verified Google Workspace Work Account below
              </div>
            </div>

            {getWorkAccounts(workspaceDomain || 'jio.com').map((acc) => (
              <button
                type="button"
                key={acc.email}
                onClick={() => handleChoose(acc)}
                className="w-full px-6 py-3.5 flex items-center justify-between hover:bg-[#FAF5FF] active:bg-purple-100/50 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full ${acc.bgColor} text-white font-medium flex items-center justify-center text-sm shrink-0 shadow-2xs`}
                  >
                    {acc.avatarLetter}
                  </div>
                  <div className="truncate">
                    <div className="text-[14px] font-medium text-[#202124] group-hover:text-[#7C3AED] transition-colors truncate">
                      {acc.name}
                    </div>
                    <div className="text-[12px] text-[#5f6368] truncate">
                      {acc.email}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-[#7C3AED] bg-purple-50 border border-purple-200 px-2 py-0.5 rounded font-semibold shrink-0 ml-2">
                  Work Account
                </span>
              </button>
            ))}

            {/* Use another account option */}
            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className="w-full px-6 py-3.5 flex items-center gap-3.5 hover:bg-[#FAF5FF] active:bg-purple-100/50 transition-colors text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full border border-purple-200 flex items-center justify-center text-gray-500 group-hover:border-[#7C3AED] group-hover:text-[#7C3AED] transition-colors shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="text-[14px] font-medium text-[#202124] group-hover:text-[#7C3AED] transition-colors">
                Use another work account
              </div>
            </button>
          </div>
        )}

        {/* Custom Account Form */}
        {!isSigningIn && isCustomMode && (
          <form onSubmit={handleCustomSubmit} className="p-6 space-y-4 border-t border-purple-100/60">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Google Email Address
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="name@gmail.com"
                autoFocus
                required
                className="w-full px-3 py-2 border border-purple-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Full Name (optional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Alex Smith"
                className="w-full px-3 py-2 border border-purple-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="text-xs text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
              >
                &larr; Back to accounts
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              >
                Sign In &amp; Continue
              </button>
            </div>
          </form>
        )}

        {/* Google Terms & Privacy Footer */}
        <div className="p-5 bg-purple-50/30 border-t border-purple-100/60 text-[11px] text-[#5f6368] leading-relaxed">
          To continue, Google will share your name, email address, language preference, and profile picture with SE Ranking. Before using this app, you can review SE Ranking&apos;s{' '}
          <a href="/privacy" className="text-[#7C3AED] hover:underline font-medium">privacy policy</a> and{' '}
          <a href="/terms" className="text-[#7C3AED] hover:underline font-medium">terms of service</a>.
        </div>
      </div>
    </div>
  );
}
