'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { validateRealEmail } from '@/lib/validation/email-validator';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

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

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send recovery instructions.');
      }

      setIsSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'A network error occurred. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF5FF] text-gray-900 flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* 3D Geometric Faceted Polygon Background in Purple Hue */}
      <svg
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-70"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="none"
      >
        <polygon points="0,0 450,220 0,650" fill="#faf5ff" stroke="#ede9fe" strokeWidth="0.75" />
        <polygon points="450,220 820,0 1220,180" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="0.75" />
        <polygon points="450,220 720,440 0,650" fill="#ffffff" stroke="#ede9fe" strokeWidth="0.75" />
        <polygon points="720,440 1160,390 450,220" fill="#faf5ff" stroke="#ede9fe" strokeWidth="0.75" />
        <polygon points="820,0 1440,0 1220,180" fill="#ffffff" stroke="#ede9fe" strokeWidth="0.75" />
        <polygon points="1220,180 1440,0 1440,580" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="0.75" />
        <polygon points="1220,180 1160,390 1440,580" fill="#ffffff" stroke="#ede9fe" strokeWidth="0.75" />
        <polygon points="720,440 1160,390 960,780" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="0.75" />
        <polygon points="0,650 720,440 480,900" fill="#faf5ff" stroke="#ede9fe" strokeWidth="0.75" />
        <polygon points="0,650 480,900 0,900" fill="#f3e8ff" stroke="#ede9fe" strokeWidth="0.75" />
        <polygon points="720,440 960,780 480,900" fill="#ffffff" stroke="#ede9fe" strokeWidth="0.75" />
        <polygon points="1160,390 1440,580 1440,900" fill="#faf5ff" stroke="#ede9fe" strokeWidth="0.75" />
        <polygon points="1160,390 1440,900 960,780" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="0.75" />
        <polygon points="480,900 960,780 1440,900" fill="#ffffff" stroke="#ede9fe" strokeWidth="0.75" />
      </svg>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity" aria-label="SE Ranking Home">
          <SeRankingLogo variant="brand" width={140} height={34} />
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white/80 backdrop-blur-xs border border-purple-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
          <span className="w-5 h-5 rounded bg-purple-100/80 border border-purple-200 flex items-center justify-center text-[10px] font-bold text-[#6D28D9]">
            EN
          </span>
          <span>English</span>
        </div>
      </header>

      {/* Main Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px] bg-white border border-[#C4B5FD] rounded-2xl shadow-[0_12px_40px_rgba(124,58,237,0.12)] p-8">
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-[11px] font-bold text-[#6D28D9] tracking-wider uppercase mb-2">
              Account Assistance
            </span>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              Password Recovery
            </h1>
          </div>

          {isSubmitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-[#7C3AED] mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Instructions Sent</h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                If an account exists with <strong className="text-purple-900">{email}</strong>, we have sent instructions to reset your password. Please check your inbox and spam folder.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full inline-block py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-lg text-sm transition-all shadow-md shadow-purple-500/20 text-center cursor-pointer"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <p className="text-xs text-gray-500 leading-relaxed text-center">
                Enter your registered work email address below and we will send you a secure link to reset your password.
              </p>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email Address
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
                  className="w-full px-3.5 py-2.5 border border-purple-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 hover:border-purple-300 transition-all bg-white"
                  required
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="flex-1">{error}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Link
                  href="/login"
                  className="flex-1 py-2.5 border border-purple-200 hover:border-[#7C3AED] hover:bg-purple-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-purple-500/20 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Link</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-md mx-auto py-6 text-center text-xs text-gray-400 flex flex-col items-center gap-1.5">
        <div>&copy; {new Date().getFullYear()} SE Ranking. All rights reserved.</div>
      </footer>
    </div>
  );
}
