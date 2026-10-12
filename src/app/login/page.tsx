'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2, Eye, EyeOff, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { GoogleRecaptcha } from '@/components/auth/GoogleRecaptcha';
import { validateRealEmail } from '@/lib/validation/email-validator';
import { GoogleAccountChooserModal, GoogleAccountProfile } from '@/components/auth/GoogleAccountChooserModal';

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

  // Tab State: 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(true);

  // Sign Up state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Shared state
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [registrationNotice, setRegistrationNotice] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('/projects');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dest = params.get('redirect');
      if (dest) {
        setRedirectUrl(dest);
      }

      const tabParam = params.get('tab') || params.get('mode');
      if (tabParam === 'signup' || tabParam === 'register') {
        setActiveTab('signup');
      } else if (tabParam === 'signin' || tabParam === 'login') {
        setActiveTab('signin');
      } else {
        // If no explicit tab param, check if user has ever registered or logged in
        const hasAccount = Boolean(
          localStorage.getItem('user_email') ||
          localStorage.getItem('seranking_auth_status')
        );
        // Direct first-time visitors to Sign Up by default so they can start free trial!
        if (!hasAccount) {
          setActiveTab('signup');
        }
      }

      if (params.get('registered') === 'true') {
        setRegistrationNotice(true);
        setActiveTab('signin');
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

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRegistrationNotice(false);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!captchaToken && process.env.NODE_ENV !== 'test') {
      setError('Please complete the Google reCAPTCHA verification.');
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
          captchaToken: captchaToken || undefined,
          captchaProvider: 'google_recaptcha',
        }),
      });

      const data = await res.json();
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

      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err?.message || 'Invalid pair username/password!');
      setIsLoading(false);
      setCaptchaToken(null);
      if (typeof window !== 'undefined' && window.grecaptcha?.reset) {
        try {
          window.grecaptcha.reset();
        } catch {
          // ignore
        }
      }
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRegistrationNotice(false);
    setSuccessMessage(null);

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanEmail = signupEmail.trim();

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

    if (!signupPassword) {
      setError('Please create a strong password.');
      return;
    }

    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!captchaToken && process.env.NODE_ENV !== 'test') {
      setError('Please complete the Google reCAPTCHA verification.');
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${cleanFirst} ${cleanLast}`.trim();
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: cleanFirst,
          lastName: cleanLast,
          name: fullName,
          email: cleanEmail,
          password: signupPassword,
          confirmPassword: signupConfirmPassword,
          captchaToken: captchaToken || undefined,
          captchaProvider: 'google_recaptcha',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account.');
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
        localStorage.setItem('user_name', data.user?.name || fullName || cleanEmail.split('@')[0]);
        window.dispatchEvent(new CustomEvent('seranking_auth_change'));
      }

      try {
        await refreshProjects();
      } catch {
        // ignore
      }

      setSuccessMessage('Account created successfully! Welcome to your dashboard...');
      setTimeout(() => {
        window.location.href = data.redirectTo || redirectUrl;
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
      setCaptchaToken(null);
      if (typeof window !== 'undefined' && window.grecaptcha?.reset) {
        try {
          window.grecaptcha.reset();
        } catch {
          // ignore
        }
      }
    }
  };

  const handleSocialLogin = (provider: string) => {
    setError(null);
    if (provider === 'Google') {
      window.location.href = `/api/auth/google?state=${encodeURIComponent(redirectUrl)}`;
      return;
    }
    setError(`${provider} ${activeTab === 'signup' ? 'sign-up' : 'sign-in'} is currently unavailable. Please continue with your email or Google account.`);
  };

  const handleGoogleAccountSelected = async (account: GoogleAccountProfile) => {
    try {
      await refreshProjects();
    } catch {
      // ignore
    }
    window.location.href = redirectUrl;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between items-center py-8 px-4 font-sans select-none relative">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      {/* Main Container */}
      <div className="w-full max-w-[460px] my-auto flex flex-col items-center relative z-10">
        {/* Top Centered SE Ranking Logo in Purple */}
        <div className="mb-6 flex justify-center items-center">
          <Link href="/" className="hover:opacity-95 transition-opacity">
            <SeRankingLogo variant="purple" width={160} height={36} />
          </Link>
        </div>

        {/* Floating White Card with Dual Tabs */}
        <div className="w-full bg-white rounded-2xl border border-purple-100 shadow-[0_8px_30px_rgba(124,58,237,0.08)] overflow-hidden">
          {/* Top Dual Tabs Header: Sign In & Sign Up */}
          <div className="grid grid-cols-2 p-1.5 bg-[#F8FAFC] border-b border-gray-100">
            <button
              type="button"
              id="tab-btn-signin"
              onClick={() => {
                setActiveTab('signin');
                setError(null);
                setSuccessMessage(null);
                setCaptchaToken(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-white text-[#7C3AED] shadow-xs border border-purple-100 font-extrabold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              <span>Sign In</span>
            </button>

            <button
              type="button"
              id="tab-btn-signup"
              onClick={() => {
                setActiveTab('signup');
                setError(null);
                setSuccessMessage(null);
                setCaptchaToken(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-white text-[#7C3AED] shadow-xs border border-purple-100 font-extrabold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              <span>Sign Up</span>
              <span className="text-[10px] bg-purple-100 text-[#7C3AED] px-1.5 py-0.5 rounded-full font-bold">
                14 Days Free
              </span>
            </button>
          </div>

          {/* Card Subheader */}
          <div className="py-4 px-8 text-center border-b border-purple-50/60 bg-gradient-to-b from-purple-50/20 to-transparent">
            {activeTab === 'signin' ? (
              <div>
                <h1 className="text-[14px] font-extrabold text-[#7C3AED] tracking-wide uppercase">
                  SIGN IN TO YOUR ACCOUNT
                </h1>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Access your dashboards, SEO tools, and tracked websites
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-[14px] font-extrabold text-[#7C3AED] tracking-wide uppercase">
                  START 14-DAY FREE TRIAL
                </h1>
                <p className="text-[11px] text-gray-500 mt-0.5 flex items-center justify-center gap-1 font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>No credit card required • Instant access</span>
                </p>
              </div>
            )}
          </div>

          {/* Card Body */}
          <div className="p-7 space-y-4">
            {registrationNotice && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>Account created successfully! Please sign in with your credentials.</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* TAB CONTENT: SIGN IN */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {/* Email with floating label */}
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
                      setError(null);
                    }}
                    placeholder="Enter your registered email"
                    className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-sm text-[#1A202C] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-[#F8FAFC] focus:bg-white"
                    required
                  />
                </div>

                {/* Password with floating label */}
                <div className="relative">
                  <label
                    htmlFor="password"
                    className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-gray-500 z-10"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter your password"
                    className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-sm text-[#1A202C] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-[#F8FAFC] focus:bg-white"
                    required
                  />
                </div>

                {/* Google reCAPTCHA v2 Widget */}
                <div className="pt-1">
                  <GoogleRecaptcha
                    id="login-google-recaptcha"
                    onVerify={(token) => {
                      setCaptchaToken(token);
                      setError(null);
                    }}
                    onExpire={() => setCaptchaToken(null)}
                  />
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={isLoading || !email.trim() || !password || !captchaToken}
                  className="w-full h-11 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-lg text-sm transition-all flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md hover:shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
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
            )}

            {/* TAB CONTENT: SIGN UP */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label
                      htmlFor="signup-first-name"
                      className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-gray-500 z-10"
                    >
                      First Name
                    </label>
                    <input
                      id="signup-first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setError(null);
                      }}
                      placeholder="First name"
                      className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm text-[#1A202C] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-[#F8FAFC] focus:bg-white"
                      required
                    />
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="signup-last-name"
                      className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-gray-500 z-10"
                    >
                      Last Name
                    </label>
                    <input
                      id="signup-last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        setError(null);
                      }}
                      placeholder="Last name"
                      className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm text-[#1A202C] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-[#F8FAFC] focus:bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Work Email */}
                <div className="relative">
                  <label
                    htmlFor="signup-work-email"
                    className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-gray-500 z-10"
                  >
                    Work Email
                  </label>
                  <input
                    id="signup-work-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => {
                      setSignupEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="name@company.com"
                    className="w-full h-10 px-3.5 border border-gray-300 rounded-lg text-sm text-[#1A202C] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-[#F8FAFC] focus:bg-white"
                    required
                  />
                </div>

                {/* Password with eye toggle */}
                <div className="relative">
                  <label
                    htmlFor="signup-password"
                    className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-gray-500 z-10"
                  >
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="At least 8 characters"
                    className="w-full h-10 px-3.5 pr-10 border border-gray-300 rounded-lg text-sm text-[#1A202C] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-[#F8FAFC] focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-[#7C3AED] cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Confirm Password with eye toggle */}
                <div className="relative">
                  <label
                    htmlFor="signup-confirm-password"
                    className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-gray-500 z-10"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signupConfirmPassword}
                    onChange={(e) => {
                      setSignupConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Re-enter password"
                    className="w-full h-10 px-3.5 pr-10 border border-gray-300 rounded-lg text-sm text-[#1A202C] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all bg-[#F8FAFC] focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-[#7C3AED] cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Google reCAPTCHA v2 Widget */}
                <div className="pt-1">
                  <GoogleRecaptcha
                    id="signup-google-recaptcha"
                    onVerify={(token) => {
                      setCaptchaToken(token);
                      setError(null);
                    }}
                    onExpire={() => setCaptchaToken(null)}
                  />
                </div>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  id="signup-submit-btn"
                  disabled={isLoading || !signupEmail.trim() || !signupPassword || !signupConfirmPassword || !firstName.trim() || !lastName.trim() || !captchaToken}
                  className="w-full h-11 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-lg text-sm transition-all flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md hover:shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
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
              </form>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-xs text-gray-400 font-normal lowercase absolute">
                or
              </span>
            </div>

            {/* Social Logins */}
            <div className="space-y-2.5">
              {/* Facebook Button */}
              <button
                type="button"
                onClick={() => handleSocialLogin('Facebook')}
                className="w-full h-10 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>{activeTab === 'signup' ? 'Continue with Facebook' : 'Continue with Facebook'}</span>
              </button>

              {/* Google Button */}
              <button
                type="button"
                id={activeTab === 'signup' ? 'signup-google-btn' : 'google-signin-btn'}
                onClick={() => handleSocialLogin('Google')}
                className="w-full h-10 bg-white hover:bg-purple-50/30 border border-gray-300 hover:border-purple-300 text-[#1E293B] font-semibold rounded-lg text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
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
                <span>{activeTab === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
              </button>

              {/* LinkedIn Button */}
              <button
                type="button"
                onClick={() => handleSocialLogin('LinkedIn')}
                className="w-full h-10 bg-white hover:bg-gray-50 border border-gray-300 text-[#1E293B] font-semibold rounded-lg text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>{activeTab === 'signup' ? 'Sign up with LinkedIn' : 'Sign in with LinkedIn'}</span>
              </button>
            </div>

            {/* Toggle Link between Sign In and Sign Up */}
            <div className="pt-3 text-center text-xs text-gray-500">
              {activeTab === 'signin' ? (
                <div>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signup');
                      setError(null);
                      setSuccessMessage(null);
                      setCaptchaToken(null);
                    }}
                    className="text-[#7C3AED] hover:text-[#6D28D9] hover:underline font-bold cursor-pointer"
                  >
                    Start 14-day free trial
                  </button>
                </div>
              ) : (
                <div>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signin');
                      setError(null);
                      setSuccessMessage(null);
                      setCaptchaToken(null);
                    }}
                    className="text-[#7C3AED] hover:text-[#6D28D9] hover:underline font-bold cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Terms disclaimer */}
            <p className="text-[11px] text-gray-400 text-center leading-relaxed pt-2">
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-[#7C3AED] hover:underline">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="text-[#7C3AED] hover:underline">
                Terms of Service
              </a>{' '}
              apply.
            </p>
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

      {/* Real Google Account Chooser Modal */}
      <GoogleAccountChooserModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        serviceName="SE Ranking"
        onSelectAccount={handleGoogleAccountSelected}
      />
    </div>
  );
}
