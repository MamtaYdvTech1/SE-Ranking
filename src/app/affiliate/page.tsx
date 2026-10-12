'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  Users,
  Layers,
  Clock,
  CheckCircle2,
  Copy,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

export default function AffiliatePage() {
  const [referralsCount, setReferralsCount] = useState(1);
  const [plan, setPlan] = useState<'Core' | 'Pro' | 'Business'>('Core');
  const [billingPeriod, setBillingPeriod] = useState<'Monthly' | 'Annually'>('Monthly');

  // Calculate approximate earnings: 30% commission
  const planPrices: Record<string, number> = {
    Core: 129,
    Pro: 279,
    Business: 599,
  };

  const basePrice = planPrices[plan];
  const monthlyPrice = billingPeriod === 'Annually' ? basePrice * 0.8 : basePrice;
  const approximateEarning = (referralsCount * monthlyPrice * 0.3).toFixed(2);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between font-sans select-none">
      {/* 1. Purple Announcement Banner */}
      <div className="bg-[#7C3AED] text-white py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2">
        <span>Start doing more with your AI Visibility Data</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>

      {/* 2. Top Header matching screenshot */}
      <header className="border-b border-gray-100 bg-white py-4 px-6 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="hover:opacity-90">
              <SeRankingLogo variant="brand" width={135} height={32} />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-gray-700">
              <button type="button" className="flex items-center gap-1 hover:text-blue-600">
                <span>Solutions</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              <button type="button" className="flex items-center gap-1 hover:text-blue-600">
                <span>Tools</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              <button type="button" className="flex items-center gap-1 hover:text-blue-600">
                <span>Resources</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              <Link href="/pricing" className="hover:text-blue-600">
                Pricing
              </Link>
              <Link href="/api-docs" className="hover:text-blue-600">
                API &amp; MCP
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-gray-500 font-medium mr-2">EN ⌄</span>
            <Link
              href="/projects"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 font-bold hover:bg-gray-50 transition-colors"
            >
              See product tour
            </Link>
            <Link
              href="/projects"
              className="px-5 py-2 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-lg font-bold shadow-xs transition-colors"
            >
              Projects
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Hero Section matching exact screenshot */}
      <section className="relative overflow-hidden py-16 px-6 text-center max-w-6xl mx-auto w-full">
        {/* Decorative elements */}
        <div className="flex flex-col items-center space-y-8 relative">
          <div className="relative inline-block">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-[#101423] tracking-tight leading-tight">
              Join Our<br />
              <span className="text-[#1B66FF]">Affiliate Program</span>
            </h1>

            {/* Left Photo Card with +$673 badge */}
            <div className="hidden md:block absolute -left-64 top-0 w-52 h-44 rounded-3xl bg-[#71C5FF]/30 p-2 transform -rotate-3 border border-blue-100 shadow-xl overflow-hidden">
              <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold relative">
                <span className="text-4xl">🤝</span>
                <div className="absolute top-3 left-3 bg-white text-[#1B66FF] font-extrabold text-xs px-2.5 py-1 rounded-md shadow-md border border-blue-200">
                  +$673
                </div>
              </div>
            </div>

            {/* Right Photo Card with +$1,245 badge */}
            <div className="hidden md:block absolute -right-64 top-0 w-52 h-44 rounded-3xl bg-[#FFD572]/40 p-2 transform rotate-3 border border-amber-100 shadow-xl overflow-hidden">
              <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-white text-xs font-bold relative">
                <span className="text-4xl">🚀</span>
                <div className="absolute bottom-3 right-3 bg-white text-[#1B66FF] font-extrabold text-xs px-2.5 py-1 rounded-md shadow-md border border-blue-200">
                  +$1,245
                </div>
              </div>
            </div>
          </div>

          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto font-normal">
            Spread the word about SE Ranking and get a commission for every referral!
          </p>

          {/* Nav Pills matching screenshot */}
          <div className="inline-flex rounded-full border border-gray-200 p-1 bg-white shadow-2xs text-xs font-semibold">
            <button type="button" className="px-5 py-2 text-gray-600 hover:text-gray-900 rounded-full">
              About Us
            </button>
            <button type="button" className="px-5 py-2 text-gray-600 hover:text-gray-900 rounded-full">
              Careers
            </button>
            <button type="button" className="px-5 py-2 text-gray-600 hover:text-gray-900 rounded-full">
              For Media
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-white text-[#1B66FF] border border-[#1B66FF] rounded-full shadow-2xs font-bold"
            >
              Affiliate
            </button>
          </div>
        </div>
      </section>

      {/* 4. Start earning more today section */}
      <section className="py-12 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Earn big with <span className="text-[#1B66FF]">SE Ranking’s affiliate program</span>
        </h2>
        <p className="text-sm text-gray-600 mt-3 max-w-xl mx-auto">
          Recommend our platform to your audience and get 30% commission on each subscription sale
        </p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => alert('Affiliate signup modal')}
            className="px-8 py-3 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-lg font-bold text-sm shadow-md transition-colors cursor-pointer"
          >
            Become an affiliate
          </button>
          <p className="text-[11px] text-gray-400 max-w-md mx-auto leading-relaxed">
            By clicking on this button, you acknowledge and agree to the rules and conditions of the SE Ranking Affiliate Program.
          </p>
        </div>
      </section>

      {/* 5. Calculate your earning potential Card matching screenshot */}
      <section className="bg-[#0B102B] text-white py-14 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center tracking-tight">
            Calculate your earning potential
          </h2>

          <div className="bg-white text-gray-900 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stepper: Number of referrals */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Enter the number of referrals</span>
                </div>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-11">
                  <button
                    type="button"
                    onClick={() => setReferralsCount(Math.max(1, referralsCount - 1))}
                    className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold text-lg"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center font-bold text-sm text-gray-900">
                    {referralsCount}
                  </div>
                  <button
                    type="button"
                    onClick={() => setReferralsCount(referralsCount + 1)}
                    className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Pricing plan select */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Choose each referral&apos;s pricing plan</span>
                </div>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as any)}
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 bg-white cursor-pointer"
                >
                  <option value="Core">Core</option>
                  <option value="Pro">Pro</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              {/* Subscription duration */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Select each referral&apos;s subscription duration</span>
                </div>
                <div className="flex items-center gap-5 h-11 px-2 text-xs font-semibold text-gray-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="billing"
                      checked={billingPeriod === 'Monthly'}
                      onChange={() => setBillingPeriod('Monthly')}
                      className="text-blue-600 focus:ring-0"
                    />
                    <span>Monthly</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="billing"
                      checked={billingPeriod === 'Annually'}
                      onChange={() => setBillingPeriod('Annually')}
                      className="text-blue-600 focus:ring-0"
                    />
                    <span>Annually</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Approximate earning result row */}
            <div className="border border-gray-200 rounded-xl p-4 text-center bg-gray-50/70 text-sm font-semibold text-gray-700">
              <span>Your approximate earning </span>
              <span className="text-[#1B66FF] font-extrabold text-lg ml-1">
                ${approximateEarning}
              </span>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => alert('Affiliate registration')}
                className="px-8 py-3 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-lg font-bold text-sm shadow-md transition-colors cursor-pointer"
              >
                Become an affiliate
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. How to join (4 Steps matching screenshot) */}
      <section className="py-20 px-6 max-w-5xl mx-auto w-full space-y-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 tracking-tight">
          How to join
        </h2>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900">Register with SE Ranking</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-11">
                Access the Affiliate Program through your account. You can participate even with a free account. No paid subscription is required.
              </p>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl w-64 text-xs space-y-1 text-gray-600">
              <div className="font-semibold text-gray-800">Your account</div>
              <div className="p-2 bg-blue-50/80 text-blue-700 font-bold rounded flex items-center justify-between">
                <span>$ Affiliate Program</span>
                <span>🖱</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900">Find the perfect spot for your link</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-11">
                Choose where to promote SE Ranking. This can be a new or existing page on your website, blog, forum, Facebook, Twitter, email, etc.
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl w-64 text-center font-bold text-xs shadow-md">
              <SeRankingLogo variant="white" width={110} height={24} />
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900">Add your affiliate links</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-11">
                Select from a variety of different banners in your personal affiliate area. Copy the link and paste it to the specified page.
              </p>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl w-64 text-xs space-y-2">
              <div className="text-[11px] text-gray-500 font-semibold">Your link to copy</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="seranking.com/ga=..."
                  className="bg-white border border-gray-300 rounded px-2 py-1 text-xs w-full font-mono text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => alert('Link copied')}
                  className="px-3 py-1 bg-blue-600 text-white font-bold rounded text-xs cursor-pointer"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <h3 className="text-lg font-bold text-gray-900">Get paid</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-11">
                Receive 30% commission payments to your preferred account every two weeks once your balance reaches $50.
              </p>
            </div>

            <div className="p-3 bg-white border border-emerald-300 rounded-xl w-64 text-xs space-y-1 shadow-xs">
              <div className="text-gray-500 text-[10px]">Commission payout</div>
              <div className="font-bold text-emerald-600 text-sm flex items-center justify-between">
                <span>SE Ranking Payout</span>
                <span>+$122.30</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8 px-6 text-center text-xs text-gray-400">
        © 2013 - 2026 SE Ranking. All rights reserved.
      </footer>
    </div>
  );
}
