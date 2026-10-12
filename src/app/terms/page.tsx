'use client';

import React from 'react';
import Link from 'next/link';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <SeRankingLogo variant="brand" width={135} height={32} />
          </Link>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
              Privacy Statement
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
              Legal Documentation
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Terms of Service</h1>
            <p className="text-xs text-gray-500 mt-2">
              Last Updated: June 25, 2026 • Effective Date: June 25, 2026
            </p>
          </div>

          {/* Quick Summary Callout */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#1B66FF]">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>Summary of Key Terms</span>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              These Terms of Service govern your use of the SE Ranking platform, API, and associated tools.
              By creating an account, accessing our site, or subscribing to our services, you agree to comply with
              all applicable policies, fair usage limits, and intellectual property requirements.
            </p>
          </div>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-6 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">1. Acceptance of Terms</h2>
              <p>
                By registering for, accessing, or using the services provided by Seranking Ltd (&quot;SE Ranking&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), including our website (seranking.com), applications, APIs, and data feeds, you (&quot;User&quot;, &quot;Customer&quot;, or &quot;You&quot;) agree to be legally bound by these Terms of Service (&quot;Terms&quot;) and our Privacy Statement. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">2. Description of Services</h2>
              <p>
                SE Ranking provides search engine optimization (SEO), digital marketing, keyword tracking, competitive research, website audit, backlink analysis, AI search tracking (including ChatGPT, Perplexity, and Google AI Overviews), and report generation software as a cloud service. We may modify, enhance, or discontinue features of our platform from time to time to maintain performance and data accuracy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">3. Account Registration and Security</h2>
              <p>
                To access features of the platform, you must register for an account using a valid business email address. You agree to maintain the security and confidentiality of your credentials and notify us immediately of any unauthorized use or security incident. Each account is for individual or organization use according to purchased seat limits.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">4. Free Trial and Subscription Billing</h2>
              <p>
                We offer a 14-day free trial for eligible new business accounts. Following expiration of the trial period, continuous access requires selecting an active subscription tier (Essential, Pro, or Business). Subscriptions renew automatically on a monthly or annual billing cycle until cancelled in your billing portal. All fees are quoted in U.S. Dollars (USD) or Euros (EUR) and are non-refundable except where mandated by applicable law.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">5. Acceptable Use and Prohibited Activities</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
                <li>Reverse-engineer, decompile, or extract the source code of the SE Ranking platform;</li>
                <li>Exceed documented API rate limits or use automated scrapers to circumvent software boundaries;</li>
                <li>Resell, sublicense, or redistribute our proprietary SEO database without explicit written consent;</li>
                <li>Use our tools for unlawful, fraudulent, or harassing purposes.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">6. Intellectual Property &amp; Data Rights</h2>
              <p>
                SE Ranking retains all rights, title, and interest in and to our software, proprietary algorithms, database rankings, and documentation. You retain ownership of any proprietary data, customer domains, and content you import into your account. You grant SE Ranking a limited license to host and process such data solely to provide the services to you.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">7. Disclaimer of Warranties &amp; Limitation of Liability</h2>
              <p>
                THE SERVICES AND ALL DATA PROVIDED ARE ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. SE RANKING DOES NOT GUARANTEE THAT SEARCH ENGINE POSITIONS, AI CITATIONS, OR SEARCH VOLUMES WILL REMAIN CONSTANT, AS THIRD-PARTY SEARCH ENGINES FREQUENTLY UPDATE ALGORITHMS. IN NO EVENT SHALL SE RANKING BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">8. Contact Information</h2>
              <p className="text-xs text-gray-600">
                For questions regarding these Terms of Service, please contact our legal counsel:
                <br />
                <strong>Email:</strong> legal@seranking.com
                <br />
                <strong>Address:</strong> Seranking Ltd, 28th October Avenue, 313, Omrania Building, 3035 Limassol, Cyprus.
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
              href="/privacy"
              className="text-xs text-[#1B66FF] hover:underline font-semibold"
            >
              View Privacy Statement →
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
