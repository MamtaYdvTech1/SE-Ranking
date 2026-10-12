'use client';

import React from 'react';
import { Gift, Zap, Sparkles, Award, ExternalLink, ArrowRight } from 'lucide-react';

export default function BonusOffersPage() {
  const offers = [
    {
      title: 'Free 1,000 AI Search Prompts',
      category: 'SE Ranking Exclusive',
      desc: 'Unlock extra query volume to track your rankings across ChatGPT, Gemini, and Perplexity AI models.',
      badge: 'Active for Trial',
      code: 'AISMARTER26',
    },
    {
      title: 'SurferSEO Integration Discount',
      category: 'Partner Perk',
      desc: 'Get 30% off SurferSEO for 3 months to complement your SE Ranking content editor workflow.',
      badge: 'Partner Deal',
      code: 'SERANK30SURF',
    },
    {
      title: 'Free Agency Pitch Deck & Audit Kit',
      category: 'Agency Resource',
      desc: 'Download 15 customizable White Label presentation templates to pitch high-ticket SEO retainers.',
      badge: 'Free Asset',
      downloadUrl: '#',
    },
    {
      title: '$100 Google Ads Credit',
      category: 'PPC Acceleration',
      desc: 'Get $100 in ad credits after spending your first $50 on Google Ads to kickstart SERP campaigns.',
      badge: 'Advertising',
      code: 'GOOG-SE-2026',
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2.5 text-[#1B66FF]">
          <Gift className="w-6 h-6" />
          <h1 className="text-2xl font-bold text-gray-900">Bonus Offers &amp; Partner Perks</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Exclusive discounts, complementary SEO tool integrations, and agency resources curated for SE Ranking customers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1B66FF] uppercase tracking-wider">
                  {offer.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  {offer.badge}
                </span>
              </div>
              <h2 className="text-base font-bold text-gray-900 mt-2">{offer.title}</h2>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">{offer.desc}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              {offer.code ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Promo Code:</span>
                  <code className="px-2.5 py-1 bg-gray-100 rounded text-xs font-mono font-bold text-gray-800">
                    {offer.code}
                  </code>
                </div>
              ) : (
                <span className="text-xs text-emerald-600 font-semibold">Instant Download Ready</span>
              )}
              <button className="px-3.5 py-1.5 bg-[#1B66FF] hover:bg-[#0B59EE] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5">
                <span>Claim Offer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
