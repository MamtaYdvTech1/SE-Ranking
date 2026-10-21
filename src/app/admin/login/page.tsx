'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin/dashboard';
  const { user, refreshUser } = useAuth();

  React.useEffect(() => {
    if (user && ['ADMIN', 'SUPERADMIN', 'OWNER'].includes((user.role || '').toUpperCase())) {
      window.location.href = redirect;
    }
  }, [user, redirect]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed. Please verify credentials.');
      }

      setSuccess('Super Admin authenticated! Redirecting to Control Panel...');
      if (typeof refreshUser === 'function') {
        await refreshUser();
      }

      setTimeout(() => {
        window.location.href = redirect;
      }, 300);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to authenticate administrator.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background cyber radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-emerald-600/15 via-violet-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Privileged Infrastructure Gate</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20">
            SE
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            SE Ranking <span className="text-emerald-400 font-medium">ADMIN</span>
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 mt-2">
          Super Admin Portal
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Sign in with platform administrator credentials to manage clients, projects, users, and infrastructure.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        <div className="bg-[#0b0f19]/90 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-black/80 rounded-2xl p-6 sm:p-8 relative">
          {user && !['ADMIN', 'SUPERADMIN', 'OWNER'].includes((user.role || '').toUpperCase()) && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                You are currently signed in as <strong className="text-amber-200">{user.email}</strong> (Standard User). Standard users cannot access the Super Admin Panel.
                <div className="mt-2">
                  <Link href="/projects" className="underline font-semibold hover:text-white">
                    Return to User Dashboard &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex-1 font-medium">{success}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-login-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-100 text-xs transition placeholder:text-slate-600 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="admin-login-password" className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 transition"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3 h-3" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" /> Show
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-100 text-xs transition placeholder:text-slate-600 outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/20"
                />
                <span className="text-[11px] text-slate-400">Remember workstation</span>
              </label>
            </div>

            <button
              id="admin-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick links & Security notes */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Have an admin invite token?</span>
              <Link
                href="/admin/signup"
                className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 transition"
              >
                <KeyRound className="w-3 h-3" />
                <span>Accept Invitation</span>
              </Link>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Looking for client workspace?</span>
              <Link
                href="/login"
                className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 transition"
              >
                <span>Standard User Login</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Security watermark footer */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-[11px] text-slate-500">
            TLS 1.3 256-Bit Cryptographic Session • Immutable Audit Logging • Anti-Brute Force Protection
          </p>
          <p className="text-[10px] text-slate-600">
            SE Ranking Super Admin Console • Strictly Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070a12] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
