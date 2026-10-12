'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Zap,
  ShieldCheck,
  Building,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Code2,
  Database,
  Layers,
  Sparkles,
  Bot,
  ExternalLink,
  Target,
  Key,
  Globe,
  Award,
  Users,
  Sliders,
  CheckCircle2,
  X,
  CreditCard,
  Briefcase,
  Terminal,
} from 'lucide-react';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { MarketingHeader } from '@/components/layout/MarketingHeader';

export default function PricingPage() {
  const [showHelloBar, setShowHelloBar] = useState(true);

  // Pricing Mode Switch: Platform vs API
  const [pricingMode, setPricingMode] = useState<'platform' | 'api'>('platform');

  // Billing Cycle: Monthly vs Annual (-20%)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // Dynamic Addon Selections for Platform
  const [agencyPackSelected, setAgencyPackSelected] = useState(true);
  const [contentMarketingSelected, setContentMarketingSelected] = useState(false);
  const [localLocations, setLocalLocations] = useState(3);

  // API Credit calculator
  const [apiCredits, setApiCredits] = useState(100000);
  const [selectedApiCodeTab, setSelectedApiCodeTab] = useState<'python' | 'node' | 'curl'>('python');

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const discountMultiplier = billingCycle === 'annual' ? 0.8 : 1.0;

  // Platform Tier Base Prices
  const essentialPrice = Math.round(65 * discountMultiplier);
  const proPrice = Math.round(119 * discountMultiplier);
  const businessPrice = Math.round(239 * discountMultiplier);

  const faqs = [
    {
      q: 'Which plan should I choose for my business?',
      a: 'The Essential plan is perfect for solo entrepreneurs and site owners managing 1-10 websites. The Pro plan is our most popular option for growing marketing teams and agencies needing historical data and automated client reporting. Large agencies with high-volume crawling requirements choose Business or Enterprise.',
    },
    {
      q: 'Can I change my plan or cancel at any time?',
      a: 'Yes, absolutely. You can upgrade, downgrade, or cancel your subscription whenever you wish from your account dashboard. Upgrades are prorated immediately, and cancellations stop renewals at the end of the billing period.',
    },
    {
      q: 'Is there a free trial, and is a credit card required?',
      a: 'We offer a full-featured 14-day free trial on the Pro plan with no credit card required. You can test rank tracking, audits, competitive analysis, and backlink checking risk-free.',
    },
    {
      q: 'How does the Annual discount work?',
      a: 'Choosing annual billing saves you 20% compared to month-to-month billing. You are billed annually upfront and retain full access to all features and support throughout the year.',
    },
    {
      q: 'What is included in the Agency Pack add-on?',
      a: 'The Agency Pack ($60/mo) includes full white-label reporting, custom domain name mapping (e.g. seo.youragency.com), unlimited client guest accounts, and 10 extra user team seats.',
    },
    {
      q: 'How does SE Ranking API pricing work?',
      a: 'API requests are billed based on credit usage per endpoint. Starter packages start at $99/month for 100,000 request units with access to all endpoints, high concurrency limits, and 99.9% uptime SLA.',
    },
    {
      q: 'Can I buy additional search volume or crawl limits without upgrading?',
      a: 'Yes. Within any paid tier, you can purchase separate add-on packs for extra crawled pages, additional keyword rank tracking units, or API credits as your requirements expand.',
    },
    {
      q: 'Do you offer non-profit or educational discounts?',
      a: 'Yes! We support accredited educational institutions, students, and registered 501(c)(3) non-profit organizations with custom discounts. Reach out to our billing team to apply.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Top Hello Bar */}
      {showHelloBar && (
        <div className="bg-[#00B074] text-white text-xs sm:text-sm font-semibold py-2 px-4 flex items-center justify-between text-center relative z-50">
          <div className="flex-1 flex items-center justify-center gap-2">
            <span>🚀 14-day free trial on all features — No credit card required!</span>
            <Link href="/signup" className="underline font-bold hover:text-white/90 transition-colors ml-1">
              Start free trial
            </Link>
          </div>
          <button
            onClick={() => setShowHelloBar(false)}
            aria-label="Close banner"
            className="text-white/80 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Official Marketing Header */}
      <MarketingHeader activeNav="pricing" />

      {/* 3. HERO & MAIN SWITCH: PLATFORM vs API */}
      <section className="pt-14 pb-8 bg-gradient-to-b from-blue-50/40 via-white to-white border-b border-gray-100 text-center px-4">
        <div className="max-w-4xl mx-auto">
          {/* Platform vs API Tab Pills matching user request */}
          <div className="inline-flex items-center p-1.5 bg-gray-100 rounded-2xl mb-8 border border-gray-200">
            <button
              onClick={() => setPricingMode('platform')}
              className={`px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                pricingMode === 'platform'
                  ? 'bg-white text-[#0B69FF] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Platform Plans
            </button>
            <button
              onClick={() => setPricingMode('api')}
              className={`px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                pricingMode === 'api'
                  ? 'bg-white text-[#0B69FF] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Code2 className="w-4 h-4 text-[#0B69FF]" />
              <span>Data API &amp; SDKs</span>
            </button>
          </div>

          {pricingMode === 'platform' ? (
            <>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0f172a] tracking-tight">
                Find a plan to power your growth
              </h1>
              <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Scale your SEO with our flexible platform. Every plan includes keyword tracking, site audits, and AI search visibility.
              </p>

              {/* Monthly vs Annual Toggle */}
              <div className="mt-8 inline-flex items-center gap-3 p-1.5 bg-gray-100 rounded-full border border-gray-200">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    billingCycle === 'annual' ? 'bg-[#0B69FF] text-white shadow-xs' : 'text-gray-600'
                  }`}
                >
                  <span>Annually</span>
                  <span className="bg-[#00B074] text-white text-[10px] px-1.5 py-0.2 rounded-full font-black uppercase">
                    Save 20%
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0f172a] tracking-tight">
                SEO and AI search data piped into your stack
              </h1>
              <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Integrate 3+ billion keywords, 3.2+ trillion backlinks, and live SERP rank data directly into your custom applications, AI agents, and internal dashboards.
              </p>
            </>
          )}
        </div>
      </section>

      {/* 4. PLATFORM PRICING TIERS (Screenshot 1) */}
      {pricingMode === 'platform' && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Essential */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Essential</h3>
                <p className="text-xs text-gray-500 mt-1">For freelancers &amp; single site owners</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-black text-gray-900">${essentialPrice}</span>
                  <span className="text-xs font-semibold text-gray-500">/ month</span>
                </div>
                <div className="mt-2 text-[11px] text-gray-400">
                  {billingCycle === 'annual' ? 'Billed annually ($624/yr)' : 'Billed monthly'}
                </div>

                <ul className="mt-8 space-y-3 text-xs text-gray-700">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span><strong>750</strong> Keywords tracked daily</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span><strong>10</strong> Websites monitored</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span><strong>40,000</strong> Pages audited / mo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Competitor analysis &amp; Backlinks</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup"
                className="mt-8 block text-center py-3.5 border-2 border-[#0B69FF] text-[#0B69FF] hover:bg-blue-50 font-bold rounded-xl text-xs transition-colors"
              >
                Start free trial
              </Link>
            </div>

            {/* Pro - Featured */}
            <div className="p-8 rounded-3xl bg-[#0f172a] text-white shadow-2xl border-2 border-[#0B69FF] relative flex flex-col justify-between">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0B69FF] text-white text-[11px] font-extrabold uppercase px-4 py-1 rounded-full shadow-md">
                Most Popular
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">Pro</h3>
                <p className="text-xs text-gray-400 mt-1">For growing marketing teams &amp; agencies</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">${proPrice}</span>
                  <span className="text-xs font-semibold text-gray-400">/ month</span>
                </div>
                <div className="mt-2 text-[11px] text-gray-400">
                  {billingCycle === 'annual' ? 'Billed annually ($1,142/yr)' : 'Billed monthly'}
                </div>

                <ul className="mt-8 space-y-3 text-xs text-gray-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0B69FF]" />
                    <span><strong>2,000</strong> Keywords tracked daily</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0B69FF]" />
                    <span><strong>Unlimited</strong> Websites</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0B69FF]" />
                    <span><strong>250,000</strong> Pages audited / mo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0B69FF]" />
                    <span>Historical SERP &amp; Traffic Data</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0B69FF]" />
                    <span>3 User seats included</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup"
                className="mt-8 block text-center py-3.5 bg-[#0B69FF] hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition-colors shadow-lg"
              >
                Start free trial
              </Link>
            </div>

            {/* Business */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Business</h3>
                <p className="text-xs text-gray-500 mt-1">For high-scale agencies &amp; enterprises</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-black text-gray-900">${businessPrice}</span>
                  <span className="text-xs font-semibold text-gray-500">/ month</span>
                </div>
                <div className="mt-2 text-[11px] text-gray-400">
                  {billingCycle === 'annual' ? 'Billed annually ($2,296/yr)' : 'Billed monthly'}
                </div>

                <ul className="mt-8 space-y-3 text-xs text-gray-700">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span><strong>5,000</strong> Keywords tracked daily</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span><strong>700,000</strong> Pages audited / mo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>API access &amp; Dedicated manager</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>10 User seats included</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup"
                className="mt-8 block text-center py-3.5 border-2 border-[#0B69FF] text-[#0B69FF] hover:bg-blue-50 font-bold rounded-xl text-xs transition-colors"
              >
                Start free trial
              </Link>
            </div>
          </div>

          {/* Add-ons Builder Section ("Create the stack that matches your process") */}
          <div className="mt-24 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
                Create the stack that matches your process
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Enhance your subscription with specialized modular add-ons.
              </p>
            </div>

            <div className="space-y-4">
              {/* Agency Pack Addon */}
              <div
                onClick={() => setAgencyPackSelected(!agencyPackSelected)}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  agencyPackSelected ? 'bg-blue-50/50 border-[#0B69FF]' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={agencyPackSelected}
                    onChange={() => {}}
                    className="w-5 h-5 rounded text-[#0B69FF] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Agency Pack</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      White-label reporting, custom agency domain name, unlimited client sharing, 10 team seats.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-gray-900">+$60</span>
                  <span className="text-xs text-gray-500"> / month</span>
                </div>
              </div>

              {/* Content Marketing Addon */}
              <div
                onClick={() => setContentMarketingSelected(!contentMarketingSelected)}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  contentMarketingSelected ? 'bg-blue-50/50 border-[#0B69FF]' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={contentMarketingSelected}
                    onChange={() => {}}
                    className="w-5 h-5 rounded text-[#0B69FF] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Content Marketing Module</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      AI writing assistant, topical keyword briefs, article editor, and plagiarism detection.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-gray-900">+$29</span>
                  <span className="text-xs text-gray-500"> / month</span>
                </div>
              </div>

              {/* Local Marketing Addon with location slider */}
              <div className="p-6 rounded-2xl border-2 bg-white border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Local Marketing Locations</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Sync GBP, automate Google reviews, monitor local map rankings for {localLocations} locations.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={localLocations}
                      onChange={(e) => setLocalLocations(Number(e.target.value))}
                      className="w-48 accent-[#0B69FF] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-[#0B69FF]">{localLocations} locations</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-gray-900">+${localLocations * 7}</span>
                  <span className="text-xs text-gray-500"> / month ($7/loc)</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. API PRICING TIERS (Screenshot 2) */}
      {pricingMode === 'api' && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Free Tier */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Free Tier</h3>
                <p className="text-xs text-gray-500 mt-1">For testing &amp; sandbox sandbox</p>
                <div className="mt-4 text-3xl font-black text-gray-900">$0</div>
                <ul className="mt-6 space-y-2.5 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>1,000 Requests / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>10 requests/sec limit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sandbox endpoints</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="mt-6 block text-center py-2.5 border border-gray-300 font-bold rounded-xl text-xs hover:bg-gray-50"
              >
                Get API key
              </Link>
            </div>

            {/* Starter $99 */}
            <div className="p-6 rounded-3xl bg-white border-2 border-[#0B69FF] shadow-md flex flex-col justify-between relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0B69FF] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Popular
              </span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Starter</h3>
                <p className="text-xs text-gray-500 mt-1">For apps &amp; growing tools</p>
                <div className="mt-4 text-3xl font-black text-gray-900">$99 <span className="text-xs font-normal text-gray-500">/ mo</span></div>
                <ul className="mt-6 space-y-2.5 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0B69FF]" />
                    <span>100,000 Request Units</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0B69FF]" />
                    <span>All endpoints unlocked</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0B69FF]" />
                    <span>50 requests/sec limit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0B69FF]" />
                    <span>99.9% Uptime SLA</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="mt-6 block text-center py-2.5 bg-[#0B69FF] text-white font-bold rounded-xl text-xs hover:bg-blue-600"
              >
                Subscribe
              </Link>
            </div>

            {/* Scale $499 */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Scale</h3>
                <p className="text-xs text-gray-500 mt-1">For high-traffic platforms</p>
                <div className="mt-4 text-3xl font-black text-gray-900">$499 <span className="text-xs font-normal text-gray-500">/ mo</span></div>
                <ul className="mt-6 space-y-2.5 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>750,000 Request Units</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Priority query queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dedicated Slack support</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="mt-6 block text-center py-2.5 border border-gray-300 font-bold rounded-xl text-xs hover:bg-gray-50"
              >
                Subscribe
              </Link>
            </div>

            {/* Custom Enterprise */}
            <div className="p-6 rounded-3xl bg-[#0f172a] text-white shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Custom</h3>
                <p className="text-xs text-gray-400 mt-1">Millions of requests / day</p>
                <div className="mt-4 text-3xl font-black text-white">Contact</div>
                <ul className="mt-6 space-y-2.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                    <span>Custom credit packages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                    <span>Private dedicated IP cluster</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                    <span>Bespoke contract &amp; invoicing</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/enterprise"
                className="mt-6 block text-center py-2.5 bg-white text-gray-900 font-bold rounded-xl text-xs hover:bg-gray-100"
              >
                Talk to team
              </Link>
            </div>
          </div>

          {/* Interactive Code Block Showcase */}
          <div className="mt-20 max-w-4xl mx-auto bg-[#080C15] text-white p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-gray-300">SE Ranking REST API &amp; SDK Quickstart</span>
              </div>
              <div className="flex gap-2">
                {(['python', 'node', 'curl'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedApiCodeTab(lang)}
                    className={`px-3 py-1 rounded text-xs font-mono uppercase cursor-pointer ${
                      selectedApiCodeTab === lang ? 'bg-[#0B69FF] text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <pre className="mt-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
              {selectedApiCodeTab === 'python' &&
`import requests

url = "https://api.seranking.com/v1/keywords/research"
headers = {"Authorization": "Bearer YOUR_API_TOKEN"}
params = {"query": "seo automation", "country_code": "US"}

response = requests.get(url, headers=headers, params=params)
print(response.json())`}
              {selectedApiCodeTab === 'node' &&
`const axios = require('axios');

const res = await axios.get('https://api.seranking.com/v1/keywords/research', {
  headers: { Authorization: 'Bearer YOUR_API_TOKEN' },
  params: { query: 'seo automation', country_code: 'US' }
});
console.log(res.data);`}
              {selectedApiCodeTab === 'curl' &&
`curl -X GET "https://api.seranking.com/v1/keywords/research?query=seo+automation&country_code=US" \\
  -H "Authorization: Bearer YOUR_API_TOKEN"`}
            </pre>
          </div>
        </section>
      )}

      {/* 6. FAQ ACCORDION SECTION */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Clear answers to common questions about SE Ranking pricing, billing, and API plans.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-gray-900 text-sm sm:text-base hover:text-[#0B69FF] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isOpen ? 'rotate-180 text-[#0B69FF]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. BLUE CTA BANNER */}
      <section className="py-16 bg-[#0B69FF] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Not sure which plan fits your workflow?
          </h2>
          <p className="mt-3 text-base text-blue-100 max-w-xl mx-auto">
            Talk to an SEO specialist who can customize a package tailored to your exact team size and goals.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-[#0B69FF] hover:bg-gray-100 font-extrabold text-base rounded-xl shadow-lg transition-all"
            >
              Start 14-day free trial
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-white border-t border-gray-200 text-gray-600 text-xs py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div>
            <div className="mb-4">
              <SeRankingLogo variant="dark" width={130} height={28} />
            </div>
            <p className="text-gray-500 leading-relaxed">
              All-in-one SEO and digital marketing platform built for agencies, enterprises, and growing businesses.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 text-sm">Tools</h5>
            <ul className="space-y-2">
              <li><Link href="/keyword-rank-tracker" className="hover:text-blue-600">Rank Tracker</Link></li>
              <li><Link href="/keyword-tool" className="hover:text-blue-600">Keyword Tool</Link></li>
              <li><Link href="/website-audit-tool" className="hover:text-blue-600">Website Audit</Link></li>
              <li><Link href="/on-page-seo-checker" className="hover:text-blue-600">On-Page SEO Checker</Link></li>
              <li><Link href="/competitor-analysis-tool" className="hover:text-blue-600">Competitor Analysis Tool</Link></li>
              <li><Link href="/backlink-checker" className="hover:text-blue-600">Backlink Checker</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 text-sm">Solutions</h5>
            <ul className="space-y-2">
              <li><Link href="/for-agencies" className="hover:text-blue-600">For Agencies</Link></li>
              <li><Link href="/enterprise" className="hover:text-blue-600">Enterprise</Link></li>
              <li><Link href="/growing-business" className="hover:text-blue-600">Growing Business</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 text-sm">Resources</h5>
            <ul className="space-y-2">
              <li><Link href="/pricing" className="text-[#0B69FF] font-bold">Pricing</Link></li>
              <li><Link href="/academy" className="hover:text-blue-600">SE Ranking Academy</Link></li>
              <li><Link href="/podcast" className="hover:text-blue-600">Dofollow Podcast</Link></li>
              <li><Link href="/help" className="hover:text-blue-600">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 text-sm">Legal &amp; Privacy</h5>
            <ul className="space-y-2">
              <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
            </ul>
            <p className="text-[11px] text-gray-400 mt-4">
              © {new Date().getFullYear()} SE Ranking. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
