'use client';

import React from 'react';
import Link from 'next/link';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { ArrowLeft, Shield, Lock, Eye, Globe } from 'lucide-react';

export default function PrivacyStatementPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <SeRankingLogo variant="brand" width={135} height={32} />
          </Link>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/terms" className="text-gray-600 hover:text-gray-900">
              Terms of Service
            </Link>
            <Link
              href="/signup"
              className="px-3.5 py-1.5 bg-[#1B66FF] hover:bg-[#0B59EE] text-white rounded-md font-semibold transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-12 space-y-8">
          <div className="border-b border-gray-200 pb-6">
            <span className="text-xs uppercase font-bold text-[#1B66FF] tracking-wider">
              Privacy &amp; Data Protection
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Privacy Statement</h1>
            <p className="text-xs text-gray-500 mt-2">
              Last Updated: June 25, 2026 • Effective Date: June 25, 2026
            </p>
          </div>

          {/* Privacy Callout */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#1B66FF]">
              <Lock className="w-5 h-5 shrink-0" />
              <span>Commitment to Your Privacy</span>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              We respect your privacy and are committed to protecting it through our compliance with this document.
              This Privacy Statement describes the types of data we collect from you or that you provide to us when you
              are using our services and/or products as well as when you interact with us in any way.
            </p>
          </div>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-6 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Who Controls My Personal Data?</h2>
              <p>
                <strong>Seranking Ltd</strong> and <strong>SER Acquisition Inc.</strong> are joint controllers for your personal data.
                Any requests concerning your personal data and how we process it should be directed at Seranking Ltd or SER Acquisition Inc.
                Please read the Contact Information section below for details on how to get in touch with our Data Protection Officer (DPO).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">What Personal Data Do We Collect?</h2>
              <p>We may collect several types of information from and about users of our Services, including:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
                <li><strong>Account Information:</strong> Name, work email address, telephone number, job title, and organization name when registering for a trial or paid account;</li>
                <li><strong>Billing Information:</strong> Payment card details (processed securely via PCI-DSS compliant providers), billing addresses, and invoice histories;</li>
                <li><strong>Project &amp; Analytics Data:</strong> Tracked domains, targeted keywords, search engine preferences, competitor lists, and Google Search Console integrations authorized by you;</li>
                <li><strong>Usage &amp; Telemetry Data:</strong> IP addresses, browser types, operating systems, referring URLs, and user activity timestamps collected via session cookies.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Legal Bases for Processing (GDPR)</h2>
              <p>
                We process your personal data in accordance with the General Data Protection Regulation (GDPR) and UK GDPR under the following legal bases:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
                <li><strong>Performance of Contract:</strong> To provide platform functionality, generate rankings reports, and manage your account;</li>
                <li><strong>Legitimate Interests:</strong> To prevent fraud, ensure network security, improve our AI algorithms, and provide product updates;</li>
                <li><strong>Legal Compliance:</strong> To comply with financial accounting laws and regulatory obligations;</li>
                <li><strong>Consent:</strong> For marketing newsletters and non-essential analytics cookies, which you can withdraw at any time.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Data Sharing &amp; International Transfers</h2>
              <p>
                We do not sell, rent, or trade your personal information. We only share data with vetted service providers (such as cloud hosting infrastructure, payment processors, and customer support tooling) under strict data processing agreements. Cross-border transfers comply with standard contractual clauses (SCCs) and the EU-U.S. Data Privacy Framework (DPF).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Your Privacy Rights (GDPR &amp; CCPA/CPRA)</h2>
              <p>
                Depending on your location, you have rights to access, rectify, or erase your personal data, restrict or object to processing, request data portability, and not be subjected to discriminatory treatment for exercising privacy rights.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Contact Information &amp; DPO</h2>
              <p className="text-xs text-gray-600">
                To exercise any of your rights or ask questions about this Privacy Statement:
                <br />
                <strong>Email:</strong> privacy@seranking.com / dpo@seranking.com
                <br />
                <strong>Postal Address:</strong> Seranking Ltd, 28th October Avenue, 313, Omrania Building, 3035 Limassol, Cyprus.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/terms"
              className="text-xs text-[#1B66FF] hover:underline font-semibold"
            >
              View Terms of Service →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 text-center text-xs text-gray-400">
        © 2026 SE Ranking. All rights reserved.
      </footer>
    </div>
  );
}
