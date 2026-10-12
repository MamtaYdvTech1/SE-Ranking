'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';

interface DemoSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoSignUpModal({ isOpen, onClose }: DemoSignUpModalProps) {
  const router = useRouter();
  const { refreshProjects, setActiveProject } = useApp();

  const [firstName, setFirstName] = useState('Suraj');
  const [lastName, setLastName] = useState('Vishwakarma');
  const [email, setEmail] = useState('suraj.vishwakarma@gvilab.com');
  const [phone, setPhone] = useState('+91 ');
  const [password, setPassword] = useState('SecurePass2026#');
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes('@')) {
      setError('Please enter a valid business email.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      setSuccess(true);
      await refreshProjects();
      if (data.project) {
        setActiveProject(data.project);
      }

      setTimeout(() => {
        onClose();
        router.push('/project-overview');
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal matching exact SE Ranking HTML & CSS classes */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 z-10 animate-in fade-in zoom-in-95 duration-200 demo_sign_up">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-gray-900">Welcome to SE Ranking!</h3>
            <p className="text-xs text-gray-500">Your 14-day free trial is activated. Redirecting...</p>
          </div>
        ) : (
          <div className="sign_form">
            <div className="text-center mb-5">
              <h3 className="text-sm font-extrabold text-[#1E293B] tracking-wide uppercase">
                SIGN UP FOR A NEW ACCOUNT
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Get full access to all SEO and competitive research tools for 14 days.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">First name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-hidden focus:border-[#7C3AED]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Last name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-hidden focus:border-[#7C3AED]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-hidden focus:border-[#7C3AED]"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-700 font-semibold">Phone number</label>
                  <span className="text-[10px] text-gray-400 italic">optional</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-hidden focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-hidden focus:border-[#7C3AED]"
                  required
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  id="modal_marketing_consent"
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 rounded text-[#7C3AED] focus:ring-[#7C3AED]"
                />
                <label htmlFor="modal_marketing_consent" className="text-[11px] text-gray-600 leading-tight">
                  I agree to receive marketing communications and personal offers.
                </label>
              </div>

              <div className="text-[10px] text-gray-500 leading-relaxed pt-1">
                By clicking this button, you agree to SE Ranking&apos;s{' '}
                <a href="https://seranking.com/terms-of-services.html" target="_blank" rel="noreferrer" className="text-[#7C3AED] hover:underline">
                  Terms of Use
                </a>{' '}
                and{' '}
                <a href="https://seranking.com/privacy-policy.html" target="_blank" rel="noreferrer" className="text-[#7C3AED] hover:underline">
                  Privacy Policy
                </a>.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-lg text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Sign up</span>
                )}
              </button>

              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <span className="relative bg-white px-2 text-[10px] text-gray-400 font-bold uppercase">
                  OR
                </span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('suraj.vishwakarma@gvilab.com');
                    setFirstName('Suraj');
                    setLastName('Vishwakarma');
                  }}
                  className="w-full py-2 px-3 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign up with Google</span>
                </button>
              </div>

              <div className="text-center pt-2 text-[11px] text-gray-500">
                Already have an account?{' '}
                <Link href="/login" onClick={onClose} className="text-[#7C3AED] font-semibold hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
