'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, Eye, EyeOff, ChevronDown, Loader2, Check, AlertCircle } from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { validateRealEmail } from '@/lib/validation/email-validator';
import { GoogleAccountChooserModal } from '@/components/auth/GoogleAccountChooserModal';
import { useAuth } from '@/context/AuthContext';

const SIGNUP_LANGUAGES = [
  { code: 'en', flag: 'gb', short: 'EN', label: 'English' },
  { code: 'de', flag: 'de', short: 'DE', label: 'Deutsch' },
  { code: 'es', flag: 'es', short: 'ES', label: 'Español' },
  { code: 'fr', flag: 'fr', short: 'FR', label: 'Français' },
  { code: 'it', flag: 'it', short: 'IT', label: 'Italiano' },
  { code: 'nl', flag: 'nl', short: 'NL', label: 'Nederlands' },
  { code: 'pl', flag: 'pl', short: 'PL', label: 'Polski' },
  { code: 'pt', flag: 'pt', short: 'PT', label: 'Português' },
  { code: 'jp', flag: 'jp', short: 'JP', label: '日本語' },
];

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('seranking_lang');
      if (saved && SIGNUP_LANGUAGES.some((l) => l.code === saved)) {
        setSelectedLang(saved);
      }
    }
  }, []);

  const handleSelectLang = (code: string) => {
    setSelectedLang(code);
    setIsLangOpen(false);
    localStorage.setItem('seranking_lang', code);
  };

  const currentLang = SIGNUP_LANGUAGES.find((l) => l.code === selectedLang) || SIGNUP_LANGUAGES[0];


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent duplicate submissions
    setError(null);
    setSuccessMessage(null);

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanEmail = email.trim();

    if (!cleanFirst) {
      setError('Please enter your first name.');
      return;
    }

    if (!cleanLast) {
      setError('Please enter your last name.');
      return;
    }

    if (!cleanEmail) {
      setError('Please enter your work email.');
      return;
    }

    const emailCheck = validateRealEmail(cleanEmail);
    if (!emailCheck.valid) {
      setError(emailCheck.error || 'Please enter a valid personal or business email address.');
      return;
    }

    if (!password) {
      setError('Please create a password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${cleanFirst} ${cleanLast}`.trim();
      const data = await signup({
        firstName: cleanFirst,
        lastName: cleanLast,
        name: fullName,
        email: cleanEmail,
        password,
        confirmPassword,
      });

      if (data?.requiresApproval || data?.status === 'pending') {
        setSuccessMessage('Registration received! Your account is currently pending manual administrator review and approval. Once approved, you will be able to log in to access your assigned SEO tools.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Account created successfully! Welcome to your dashboard...');
      setTimeout(() => {
        window.location.href = data?.redirectTo || '/projects';
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setIsGoogleModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between font-sans select-none">
      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" aria-label="SE Ranking Home">
          <SeRankingLogo variant="purple" width={150} height={34} />
        </Link>

        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-[#7C3AED] px-3 py-1.5 rounded-lg border border-gray-200 hover:border-purple-300 bg-white shadow-2xs transition-colors cursor-pointer"
          >
            <CountryFlag code={currentLang.flag} size="xs" />
            <span className="text-gray-700 font-semibold">{currentLang.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-purple-100 rounded-lg shadow-xl py-1 z-50 text-xs">
              {SIGNUP_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLang(lang.code)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                    lang.code === selectedLang
                      ? 'bg-purple-50 text-[#7C3AED] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CountryFlag code={lang.flag} size="xs" />
                    <span>{lang.label}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{lang.short}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[560px] space-y-7">
          {/* Top Auth Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-gray-100/90 rounded-xl border border-gray-200/80 gap-1.5">
            <Link
              href="/login"
              className="py-2.5 text-center text-xs font-semibold rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white/60 transition-all flex items-center justify-center gap-1.5"
            >
              Sign In
            </Link>
            <div className="py-2.5 text-center text-xs font-bold rounded-lg bg-white text-[#7C3AED] shadow-xs border border-purple-200/60 transition-all flex items-center justify-center gap-1.5 cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
              Sign Up (14-Day Free Trial)
            </div>
          </div>

          {/* Headline */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-[40px] font-extrabold text-[#111827] tracking-tight leading-tight">
              Start a free trial with <span className="text-[#7C3AED]">your work</span> email
            </h1>

            <div className="flex items-center justify-center gap-2 text-sm text-[#111827] font-medium pt-1">
              <CreditCard className="w-4 h-4 text-[#7C3AED]" strokeWidth={2.2} />
              <span>No credit card required</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Row 1: First name & Last name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="signup-first-name" className="sr-only">First Name</label>
                <input
                  type="text"
                  id="signup-first-name"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (error) setError(null);
                  }}
                  autoComplete="given-name"
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="signup-last-name" className="sr-only">Last Name</label>
                <input
                  type="text"
                  id="signup-last-name"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (error) setError(null);
                  }}
                  autoComplete="family-name"
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-white"
                  required
                />
              </div>
            </div>

            {/* Row 2: Work email */}
            <div>
              <label htmlFor="signup-work-email" className="sr-only">Work Email Address</label>
              <input
                type="email"
                id="signup-work-email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                autoComplete="email"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-white"
                required
              />
            </div>

            {/* Row 3: Password with Show/Hide toggle */}
            <div>
              <label htmlFor="signup-password" className="sr-only">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signup-password"
                  placeholder="Create password (min 8 characters)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  autoComplete="new-password"
                  className="w-full h-12 px-4 pr-11 border border-gray-300 rounded-lg text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#7C3AED] cursor-pointer transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Row 4: Confirm Password with Show/Hide toggle */}
            <div>
              <label htmlFor="signup-confirm-password" className="sr-only">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="signup-confirm-password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  autoComplete="new-password"
                  className="w-full h-12 px-4 pr-11 border border-gray-300 rounded-lg text-sm text-[#111827] placeholder:text-gray-400 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-[#7C3AED] cursor-pointer transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Purple CTA Button */}
            <button
              type="submit"
              id="signup-submit-btn"
              disabled={isLoading}
              className="w-full h-12 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md hover:shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <span>Start 14-Day Free Trial</span>
              )}
            </button>

            {/* Disclaimer Text */}
            <p className="text-xs text-gray-500 text-center leading-relaxed pt-1">
              By clicking this button, you agree to SE Ranking&apos;s{' '}
              <a href="https://seranking.com/terms.html" target="_blank" rel="noopener noreferrer" className="text-[#7C3AED] hover:underline font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="https://seranking.com/privacy.html" target="_blank" rel="noopener noreferrer" className="text-[#7C3AED] hover:underline font-medium">
                Privacy Statement
              </a>
              .
            </p>

            {/* Footer row: Google on left, Login on right */}
            <div className="pt-5 flex items-center justify-between text-sm border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-gray-800 text-xs sm:text-sm">Sign up with Google work account</span>
                <button
                  type="button"
                  id="signup-google-btn"
                  onClick={handleGoogleSignUp}
                  className="w-8 h-8 rounded border border-gray-200 hover:border-purple-300 bg-white hover:bg-purple-50/50 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                  title="Sign up with Google"
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
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-gray-100 text-xs text-gray-700">
                <span>Already have an account?</span>
                <Link
                  href="/login"
                  className="text-[#7C3AED] hover:text-[#6D28D9] font-semibold hover:underline"
                >
                  Log in
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Subtle Bottom Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} SE Ranking. All rights reserved.
      </footer>

      {/* Google Account Modal */}
      <GoogleAccountChooserModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        serviceName="SE Ranking"
      />
    </div>
  );
}
