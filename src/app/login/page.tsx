'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { validateRealEmail } from '@/lib/validation/email-validator';
import { safeRedirectPath } from '@/lib/safeRedirect';
import { GoogleAccountChooserModal } from '@/components/auth/GoogleAccountChooserModal';

const AUTH_LANGUAGES = [
  { code: 'en', flag: 'gb', label: 'English' },
  { code: 'de', flag: 'de', label: 'Deutsch' },
  { code: 'es', flag: 'es', label: 'Español' },
  { code: 'fr', flag: 'fr', label: 'Français' },
  { code: 'it', flag: 'it', label: 'Italiano' },
  { code: 'nl', flag: 'nl', label: 'Nederlands' },
  { code: 'pl', flag: 'pl', label: 'Polski' },
  { code: 'pt', flag: 'pt', label: 'Português' },
  { code: 'jp', flag: 'jp', label: '日本語' },
];

export default function LoginPage() {
  const router = useRouter();
  const { refreshProjects } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [registrationNotice, setRegistrationNotice] = useState(false);
  const [resetSuccessNotice, setResetSuccessNotice] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('registered') === 'true') {
        setRegistrationNotice(true);
      }
      if (params.get('reset') === 'success') {
        setResetSuccessNotice(true);
      }
      if (params.get('google') === 'direct') {
        setIsGoogleModalOpen(true);
      }
      if (params.get('pending') === 'true') {
        setError('Your account registration was received and is currently pending administrator review and approval. You will be able to sign in once approved.');
      }
      if (params.get('error') === 'google_not_configured') {
        setError('Google Sign-In is not configured. Please sign in with your email and password.');
      }
      const saved = localStorage.getItem('seranking_lang');
      if (saved && AUTH_LANGUAGES.some((l) => l.code === saved)) {
        setSelectedLang(saved);
      }
    }
  }, []);

  const handleSelectLang = (code: string) => {
    setSelectedLang(code);
    setIsLangOpen(false);
    localStorage.setItem('seranking_lang', code);
  };

  const currentLang = AUTH_LANGUAGES.find((l) => l.code === selectedLang) || AUTH_LANGUAGES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent duplicate submission
    setError(null);
    setRegistrationNotice(false);
    setResetSuccessNotice(false);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    const emailCheck = validateRealEmail(cleanEmail);
    if (!emailCheck.valid) {
      setError(emailCheck.error || 'Please enter a valid personal or business email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password.');
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('se_ranking_has_project');
        localStorage.removeItem('se_ranking_active_project_id');
        localStorage.removeItem('se_ranking_paused_projects');
        localStorage.removeItem('se_ranking_starred_projects');
        localStorage.removeItem('se_ranking_project_groups');
        localStorage.removeItem('seranking_tour_completed');

        localStorage.setItem('seranking_auth_status', 'logged_in');
        sessionStorage.setItem('seranking_auth_status', 'logged_in');
        localStorage.setItem('auth_token', data.token || 'auth-token');
        localStorage.setItem('user_email', cleanEmail);
        localStorage.setItem('user_name', data.user?.name || cleanEmail.split('@')[0]);
        window.dispatchEvent(new CustomEvent('seranking_auth_change'));
      }

      try {
        await refreshProjects();
      } catch {
        // ignore
      }

      window.location.href = safeRedirectPath(new URLSearchParams(window.location.search).get('redirect'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid pair username/password!';
      setError(msg);
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setError(null);
    if (provider === 'Google') {
      setIsGoogleModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between items-center py-10 px-4 font-sans select-none relative">
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      {/* Main Container */}
      <div className="w-full max-w-[440px] my-auto flex flex-col items-center relative z-10">
        {/* Top Centered SE Ranking Logo in Purple */}
        <div className="mb-8 flex justify-center items-center">
          <Link href="/" className="hover:opacity-95 transition-opacity" aria-label="SE Ranking Home">
            <SeRankingLogo variant="purple" width={160} height={36} />
          </Link>
        </div>

        {/* Floating White Card */}
        <div className="w-full bg-white rounded-xl border border-purple-100 shadow-[0_4px_24px_rgba(124,58,237,0.08)] overflow-hidden">
          {/* Top Auth Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-gray-50/80 border-b border-purple-100/60 gap-1.5">
            <div className="py-2.5 text-center text-xs font-bold rounded-lg bg-white text-[#7C3AED] shadow-xs border border-purple-200/60 transition-all flex items-center justify-center gap-1.5 cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
              Sign In
            </div>
            <Link
              href="/signup"
              className="py-2.5 text-center text-xs font-semibold rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white/60 transition-all flex items-center justify-center gap-1.5"
            >
              Sign Up
            </Link>
          </div>

          {/* Card Header with Purple Heading */}
          <div className="py-4 px-8 text-center border-b border-purple-50 bg-gradient-to-b from-purple-50/30 to-transparent">
            <h1 className="text-[14px] font-extrabold text-[#7C3AED] tracking-wide uppercase">
              SIGN IN TO YOUR ACCOUNT
            </h1>
          </div>

          {/* Card Body */}
          <div className="p-8 space-y-4">
            {registrationNotice && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>Account created successfully! Please sign in with your credentials.</span>
              </div>
            )}

            {resetSuccessNotice && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>Password updated successfully. Please sign in with your new password.</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email with floating label style */}
              <div className="relative">
                <label
                  htmlFor="email"
                  className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-gray-500 z-10"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your registered email"
                  autoComplete="email"
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-md text-sm text-[#1A202C] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-[#F8FAFC] focus:bg-white"
                  required
                />
              </div>

              {/* Password with floating label and Show/Hide toggle */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-gray-500 z-10"
                >
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full h-11 px-3.5 pr-10 border border-gray-300 rounded-md text-sm text-[#1A202C] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-[#F8FAFC] focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-[#7C3AED] cursor-pointer transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                id="login-submit-btn"
                disabled={isLoading}
                className="w-full h-11 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-md text-sm transition-all flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md hover:shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              {/* Stay Logged In & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#4B5563]">
                  <input
                    type="checkbox"
                    checked={stayLoggedIn}
                    onChange={(e) => setStayLoggedIn(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#7C3AED] focus:ring-0 cursor-pointer accent-[#7C3AED]"
                  />
                  <span className="text-[13px] text-[#4B5563]">Stay Logged In</span>
                </label>

                <Link
                  href="/forgot"
                  className="text-[13px] text-[#7C3AED] hover:text-[#6D28D9] hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-5">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-xs text-gray-400 font-normal lowercase absolute">
                or
              </span>
            </div>

            {/* Social Logins */}
            <div>
              {/* Google Button */}
              <button
                type="button"
                id="google-signin-btn"
                onClick={() => handleSocialLogin('Google')}
                className="w-full h-11 bg-white hover:bg-purple-50/40 border border-gray-300 hover:border-purple-300 text-[#1E293B] font-semibold rounded-md text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
              >
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
              </button>
            </div>

            {/* Don't have an account? Sign Up */}
            <div className="pt-4 text-center text-xs text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#7C3AED] hover:text-[#6D28D9] hover:underline font-semibold">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Language Selector */}
      <div className="relative z-10 pt-4 pb-2">
        <button
          type="button"
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <CountryFlag code={currentLang.flag} size="xs" />
          <span className="font-medium">{currentLang.label}</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>

        {isLangOpen && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-36 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 text-xs">
            {AUTH_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLang(lang.code)}
                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer ${
                  lang.code === selectedLang ? 'text-[#7C3AED] font-semibold bg-purple-50' : 'text-gray-700'
                }`}
              >
                <CountryFlag code={lang.flag} size="xs" />
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Google OAuth Modal */}
      <GoogleAccountChooserModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        serviceName="SE Ranking"
      />
    </div>
  );
}
