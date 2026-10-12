'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, Check, ShieldCheck, Zap, Download, Calendar, ArrowRight } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription &amp; Billing</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your subscription tier, billing cycles, payment methods, and invoices.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            14-Day Free Trial Active
          </span>
          <button className="px-4 py-2 bg-[#1B66FF] hover:bg-[#0B59EE] text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Current Plan Overview Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="text-xs uppercase font-bold text-gray-400 tracking-wider">Current Plan</div>
          <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>SE Ranking PRO</span>
            <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">Trial</span>
          </div>
          <p className="text-xs text-gray-500">
            Access to AI Search Tracker, Rank Tracking, Competitive Research, and Website Audits.
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase font-bold text-gray-400 tracking-wider">Renewal / Expiry</div>
          <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span>October 11, 2026</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium">
            14 days remaining in free trial. No card charged yet.
          </p>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase font-bold text-gray-400 tracking-wider">Payment Method</div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <span>•••• •••• •••• 4242 (Visa)</span>
          </div>
          <button className="text-xs text-[#1B66FF] hover:underline font-medium cursor-pointer">
            Update Payment Method
          </button>
        </div>
      </div>

      {/* Plan Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Essential */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between shadow-xs hover:border-gray-300 transition-colors">
          <div>
            <div className="text-sm font-bold text-gray-900">Essential</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">$55</span>
              <span className="text-xs text-gray-500">/ month</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              For freelancers and small site owners starting with SEO.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>10 Projects</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>750 Keywords Tracked</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>AI Search Tracker (Basic)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Website Audit: 40,000 pages</span>
              </li>
            </ul>
          </div>
          <button className="mt-6 w-full py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer">
            Select Essential
          </button>
        </div>

        {/* Pro - Recommended */}
        <div className="bg-white border-2 border-[#1B66FF] rounded-xl p-6 flex flex-col justify-between shadow-md relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B66FF] text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
            Most Popular
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">Pro</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">$109</span>
              <span className="text-xs text-gray-500">/ month</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              For fast-growing agencies and in-house marketing teams.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#1B66FF] shrink-0" />
                <span className="font-semibold text-gray-800">Unlimited Projects</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#1B66FF] shrink-0" />
                <span>2,000 Keywords Tracked</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#1B66FF] shrink-0" />
                <span>AI Search &amp; ChatGPT Visibility</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#1B66FF] shrink-0" />
                <span>White Label Reporting</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#1B66FF] shrink-0" />
                <span>3 Team Seats Included</span>
              </li>
            </ul>
          </div>
          <button className="mt-6 w-full py-2 bg-[#1B66FF] hover:bg-[#0B59EE] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer">
            Current Plan
          </button>
        </div>

        {/* Business */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between shadow-xs hover:border-gray-300 transition-colors">
          <div>
            <div className="text-sm font-bold text-gray-900">Business</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">$239</span>
              <span className="text-xs text-gray-500">/ month</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              For established agencies needing custom limits and full API access.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Unlimited Projects</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>5,000+ Keywords Tracked</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Full API &amp; Data Studio Export</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>10 Team Seats + Dedicated Manager</span>
              </li>
            </ul>
          </div>
          <button className="mt-6 w-full py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer">
            Upgrade to Business
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 mb-4">Invoices &amp; Receipts</h2>
        <div className="divide-y divide-gray-100">
          <div className="py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-gray-800">INV-2026-0927-TRIAL</div>
                <div className="text-gray-400">September 27, 2026 • 14-Day Trial Activation</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-900">$0.00</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">Paid</span>
              <button className="text-[#1B66FF] hover:underline font-medium cursor-pointer">Download PDF</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
