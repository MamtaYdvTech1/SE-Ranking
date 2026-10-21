'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
}

export default function ApiDashboardPage() {
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [isStandaloneModalOpen, setIsStandaloneModalOpen] = useState(false);

  // Dynamic API Keys list & backed by API
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: 'key-1',
      name: 'Data API Key',
      key: '12856b00-b1c7-f25b-68b9-294c542738ac',
      created: 'Sep 25, 2026',
      lastUsed: 'Oct 02, 2026',
    },
  ]);

  useEffect(() => {
    // Fetch real keys from backend API
    fetch('/api/api-keys')
      .then((res) => res.json())
      .then((data) => {
        if (data.keys && data.keys.length > 0) {
          setApiKeys(data.keys);
        }
      })
      .catch(() => {
        // Fallback to default state
      });
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const handleCreateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setApiKeys((prev) => [data.key, ...prev]);
        setFeedbackToast(`API key "${data.key.name}" created successfully!`);
        setTimeout(() => setFeedbackToast(null), 3500);
        setIsCreateKeyModalOpen(false);
        setNewKeyName('');
      }
    } catch (e) {
      console.error('Failed to create key:', e);
    }
  };

  return (
    <div className="api-dashboard w-full min-h-screen bg-[#F4F6F9] py-5 px-4 sm:px-6 font-sans text-[#171A1F]">
      <div className="max-w-6xl mx-auto w-full space-y-4">

        {/* ===================== TOP ROW: FEEDBACK & CREDITS ===================== */}
        <div className="flex items-center justify-between text-xs py-1">
          <div className="flex items-center gap-1.5 text-[#5B6370] font-medium">
            <span>API Management</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Feedback submitted! Thank you.')}
              className="text-[#2870ED] hover:underline font-semibold text-xs cursor-pointer"
            >
              Feedback
            </button>
            <div className="flex items-center gap-1.5 bg-[#FEF3C7] text-[#92400E] px-3 py-1 rounded-full text-xs font-bold border border-[#FDE68A] shadow-2xs select-none">
              <span>🪙</span>
              <span>Credits 100K / 100K ▾</span>
            </div>
          </div>
        </div>

        {/* Toast Alert */}
        {feedbackToast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between animate-in fade-in duration-200">
            <span>✓ {feedbackToast}</span>
            <button onClick={() => setFeedbackToast(null)} className="font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* ===================== API HEADER ===================== */}
        <div className="api-header space-y-1.5 pb-1">
          <div className="api-header__top flex items-center justify-between">
            <div className="api-header__title-wrapper flex items-center gap-2">
              <h1 className="api-header__title text-2xl font-bold text-[#171A1F] tracking-tight">
                API Dashboard
              </h1>
              <div
                className="se-hint-title-2 w-4 h-4 rounded-full bg-[#E5E7EB] text-[#4B5563] text-[11px] font-bold flex items-center justify-center cursor-help"
                title="Manage your API keys, monitor requests and credit limits."
              >
                i
              </div>
            </div>

            <div className="api-header__button-wrapper">
              <button
                onClick={() => setIsCreateKeyModalOpen(true)}
                className="se-button-2 se-button-2_primary flex items-center gap-1.5 px-4 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white text-xs font-bold rounded-[6px] shadow-xs transition-colors cursor-pointer"
              >
                <span className="text-base font-bold leading-none">+</span>
                <span className="uppercase tracking-wider">Create api key</span>
                <span className="text-[10px]">▼</span>
              </button>
            </div>
          </div>

          <div className="api-header__bottom flex items-center gap-4 text-xs text-[#7A8391]">
            <div className="api-header__info font-medium">{apiKeys.length} / 10 API keys</div>
            <span>•</span>
            <div className="api-header__info font-medium">Last used Oct 03, 2026</div>
          </div>
        </div>

        {/* ===================== TRIAL BANNER ===================== */}
        <div className="bg-[#FFF9EC] border border-[#FFE7B3] rounded-[14px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="space-y-0.5">
            <div className="font-bold text-[#92400E]">Trial ends in 4 days</div>
            <div className="text-[#B45309]">
              Access to the Data API only. To get access to other tools, upgrade your subscription.
            </div>
          </div>
          <Link
            href="/pricing"
            className="px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-[6px] shrink-0 text-center transition-colors cursor-pointer"
          >
            Upgrade Now
          </Link>
        </div>

        {/* ===================== ROW 1: CREDITS USAGE & GET FULL API ACCESS ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Card 1: Credits usage (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="pb-3 border-b border-[#F0F2F5]">
                <h2 className="text-base font-bold text-[#171A1F]">
                  Credits usage
                </h2>
              </div>

              <div className="pt-4 space-y-3">
                <div className="text-xs font-semibold text-[#171A1F]">
                  100,000 credits left from 100,000
                </div>

                {/* Progress Bar 100% */}
                <div className="w-full bg-[#E4E5EA] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2870ED] rounded-full transition-all duration-300"
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Expiration & Upgrade */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#5B6370]">
                    Credit expire Oct 07, 2026
                  </span>
                  <Link
                    href="/pricing"
                    className="font-bold text-[#2870ED] hover:underline cursor-pointer"
                  >
                    Upgrade plan
                  </Link>
                </div>

                {/* Wallet Balance Box */}
                <div className="bg-[#FFFFFF] border border-[#E1E6EB] rounded-[10px] p-3 flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#5B6370]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="14" x="2" y="5" rx="2"/>
                        <line x1="2" x2="22" y1="10" y2="10"/>
                      </svg>
                    </span>
                    <span className="text-[#5B6370] font-normal">Wallet balance</span>
                    <span className="font-bold text-[#171A1F] ml-1">0</span>
                  </div>
                  <button
                    onClick={() => setIsTopUpModalOpen(true)}
                    className="text-xs font-bold text-[#2870ED] hover:underline cursor-pointer"
                  >
                    Top up
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0F2F5] text-xs text-[#5B6370] text-center">
              View{' '}
              <a
                href="https://seranking.com/api/data/getting-started/#unit-costs"
                target="_blank"
                rel="noreferrer"
                className="text-[#2870ED] hover:underline font-semibold"
              >
                credit costs
              </a>{' '}
              per endpoint
            </div>
          </div>

          {/* Card 2: Get full API access (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="pb-3 border-b border-[#F0F2F5]">
                <h2 className="text-base font-bold text-[#171A1F]">
                  Get full API access
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                
                {/* Cell 1: API Add-on */}
                <div className="flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-[#171A1F]">
                      API Add-on
                    </h3>
                    <p className="text-xs text-[#5B6370] leading-relaxed">
                      Get a SE Ranking subscription with Data API credits included, plus extra credits on top.
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => setIsAddonModalOpen(true)}
                      className="w-full py-2 px-4 bg-[#171A1F] hover:bg-black text-white font-bold text-xs rounded-[6px] tracking-wider transition-colors cursor-pointer shadow-xs uppercase"
                    >
                      GET API ADD-ON
                    </button>
                  </div>
                </div>

                {/* Cell 2: API Standalone */}
                <div className="flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-[#171A1F]">
                      API Standalone
                    </h3>
                    <p className="text-xs text-[#5B6370] leading-relaxed">
                      API-only access to SE Ranking datasets. No web app, no subscription required.
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => setIsStandaloneModalOpen(true)}
                      className="w-full py-2 px-4 bg-white border border-[#D1D5DB] hover:bg-gray-50 text-[#171A1F] font-bold text-xs rounded-[6px] tracking-wider transition-colors cursor-pointer shadow-xs uppercase"
                    >
                      GET API STANDALONE
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <div className="pt-3 border-t border-[#F0F2F5] text-xs text-[#5B6370]">
              Custom plans are available{' '}
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="text-[#2870ED] hover:underline font-semibold cursor-pointer"
              >
                Contact Us
              </button>
            </div>
          </div>

        </div>

        {/* ===================== ROW 2: API KEYS ===================== */}
        <div className="bg-white border border-[#E1E6EB] rounded-[16px] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#F0F2F5]">
            <h2 className="text-base font-bold text-[#171A1F]">
              API Keys
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E1E6EB] text-[#5B6370] font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-6 font-semibold" style={{ width: '25%' }}>NAME</th>
                  <th className="py-3 px-6 font-semibold" style={{ width: '45%' }}>KEY</th>
                  <th className="py-3 px-6 font-semibold" style={{ width: '15%' }}>CREATED</th>
                  <th className="py-3 px-6 font-semibold" style={{ width: '15%' }}>LAST USED</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((k) => (
                  <tr
                    key={k.id}
                    className="border-b border-[#F0F2F5] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-4 px-6 font-bold text-[#171A1F]">
                      {k.name}
                    </td>

                    <td className="py-4 px-6 text-[#171A1F]">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span>{k.key}</span>
                        <button
                          onClick={() => copyToClipboard(k.key, k.id)}
                          className="text-[#5B6370] hover:text-[#171A1F] transition-colors p-1 rounded hover:bg-gray-100 cursor-pointer relative"
                          title="Copy API key"
                          aria-label="Copy key"
                        >
                          {copiedKeyId === k.id ? (
                            <span className="text-[10px] text-emerald-600 font-bold font-sans">Copied!</span>
                          ) : (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-[#5B6370]">
                      {k.created}
                    </td>

                    <td className="py-4 px-6 text-[#171A1F] font-medium">
                      {k.lastUsed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================== ROW 3: QUICK LINKS ===================== */}
        <div className="bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs">
          <h2 className="text-base font-bold text-[#171A1F] mb-4">
            Quick Links
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. Data API Documentation */}
            <a
              href="https://seranking.com/api/"
              target="_blank"
              rel="noreferrer"
              className="group bg-white border border-[#E1E6EB] hover:border-[#2870ED] rounded-[12px] p-4 transition-all hover:shadow-xs flex flex-col justify-between space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="text-[#171A1F] group-hover:text-[#2870ED] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                  </svg>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#2870ED] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7"/>
                  <path d="M7 7h10v10"/>
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#171A1F] group-hover:text-[#2870ED] transition-colors">
                  Data API Documentation
                </h3>
                <p className="text-xs text-[#5B6370] leading-relaxed">
                  Quickstarts, endpoints &amp; examples for the Data API.
                </p>
              </div>
            </a>

            {/* 2. Project API Documentation */}
            <a
              href="https://seranking.com/api/project/"
              target="_blank"
              rel="noreferrer"
              className="group bg-white border border-[#E1E6EB] hover:border-[#2870ED] rounded-[12px] p-4 transition-all hover:shadow-xs flex flex-col justify-between space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="text-[#171A1F] group-hover:text-[#2870ED] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" x2="8" y1="13" y2="13"/>
                    <line x1="16" x2="8" y1="17" y2="17"/>
                    <line x1="10" x2="8" y1="9" y2="9"/>
                  </svg>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#2870ED] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7"/>
                  <path d="M7 7h10v10"/>
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#171A1F] group-hover:text-[#2870ED] transition-colors">
                  Project API Documentation
                </h3>
                <p className="text-xs text-[#5B6370] leading-relaxed">
                  Endpoints to manage projects data.
                </p>
              </div>
            </a>

            {/* 3. Postman Workspace */}
            <a
              href="https://www.postman.com/seranking"
              target="_blank"
              rel="noreferrer"
              className="group bg-white border border-[#E1E6EB] hover:border-[#2870ED] rounded-[12px] p-4 transition-all hover:shadow-xs flex flex-col justify-between space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="text-[#171A1F] group-hover:text-[#2870ED] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                    <circle cx="12" cy="6" r="1"/>
                    <circle cx="18" cy="12" r="1"/>
                    <circle cx="6" cy="12" r="1"/>
                  </svg>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#2870ED] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7"/>
                  <path d="M7 7h10v10"/>
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#171A1F] group-hover:text-[#2870ED] transition-colors">
                  Postman Workspace
                </h3>
                <p className="text-xs text-[#5B6370] leading-relaxed">
                  Run requests and explore examples without coding.
                </p>
              </div>
            </a>

            {/* 4. Integrations */}
            <a
              href="https://seranking.com/integrations.html"
              target="_blank"
              rel="noreferrer"
              className="group bg-white border border-[#E1E6EB] hover:border-[#2870ED] rounded-[12px] p-4 transition-all hover:shadow-xs flex flex-col justify-between space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="text-[#171A1F] group-hover:text-[#2870ED] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="8" height="8" x="3" y="3" rx="2"/>
                    <path d="M7 11v4a2 2 0 0 0 2 2h4"/>
                    <rect width="8" height="8" x="13" y="13" rx="2"/>
                  </svg>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#2870ED] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7"/>
                  <path d="M7 7h10v10"/>
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#171A1F] group-hover:text-[#2870ED] transition-colors">
                  Integrations
                </h3>
                <p className="text-xs text-[#5B6370] leading-relaxed">
                  Connect SE Ranking with BI tools and services.
                </p>
              </div>
            </a>

            {/* 5. Rate Limits */}
            <a
              href="https://seranking.com/api-pricing.html"
              target="_blank"
              rel="noreferrer"
              className="group bg-white border border-[#E1E6EB] hover:border-[#2870ED] rounded-[12px] p-4 transition-all hover:shadow-xs flex flex-col justify-between space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="text-[#171A1F] group-hover:text-[#2870ED] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 14 4-4"/>
                    <path d="M3.34 19a10 10 0 1 1 17.32 0"/>
                  </svg>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#2870ED] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7"/>
                  <path d="M7 7h10v10"/>
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#171A1F] group-hover:text-[#2870ED] transition-colors">
                  Rate Limits
                </h3>
                <p className="text-xs text-[#5B6370] leading-relaxed">
                  Know your credit cost per call and scale safely without 429 surprises.
                </p>
              </div>
            </a>

            {/* 6. API Help Center */}
            <a
              href="https://help.seranking.com/hc/en-us/"
              target="_blank"
              rel="noreferrer"
              className="group bg-white border border-[#E1E6EB] hover:border-[#2870ED] rounded-[12px] p-4 transition-all hover:shadow-xs flex flex-col justify-between space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="text-[#171A1F] group-hover:text-[#2870ED] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                    <path d="M2 12h20"/>
                  </svg>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#2870ED] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7"/>
                  <path d="M7 7h10v10"/>
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#171A1F] group-hover:text-[#2870ED] transition-colors">
                  API Help Center
                </h3>
                <p className="text-xs text-[#5B6370] leading-relaxed">
                  FAQs, troubleshooting, and support articles.
                </p>
              </div>
            </a>

          </div>
        </div>

      </div>

      {/* Top up Modal */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="text-base font-bold text-gray-900">Top Up Wallet</h3>
            <p className="text-xs text-gray-600">Add funds to your SE Ranking wallet for pay-as-you-go API calls.</p>
            <div className="flex justify-center gap-2">
              {[10, 50, 100, 250].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    alert(`$${amt} top-up initiated!`);
                    setIsTopUpModalOpen(false);
                  }}
                  className="px-3 py-1.5 border border-gray-200 hover:border-[#2870ED] hover:bg-blue-50 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  ${amt}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsTopUpModalOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer pt-2 block mx-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add-on Modal */}
      {isAddonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Get API Add-on</h3>
            <p className="text-xs text-gray-600">
              Attach Data API access directly to your existing SE Ranking subscription with discounted bulk credits.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
              ✓ Includes 100,000 monthly Data API credits<br/>
              ✓ Priority rate limits up to 20 requests/sec<br/>
              ✓ Dedicated webhook triggers
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddonModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/pricing"
                className="px-4 py-2 bg-[#171A1F] hover:bg-black text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Modal */}
      {isStandaloneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Get API Standalone</h3>
            <p className="text-xs text-gray-600">
              Developer-only direct programmatic access. No UI seats or web subscription required.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-800">
              ✓ Pay only for the API credits you consume<br/>
              ✓ Access to SERP, Keyword, and Backlink endpoints<br/>
              ✓ Multi-key team provisioning
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsStandaloneModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/pricing"
                className="px-4 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Subscribe Standalone
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Custom Enterprise API Plans</h3>
            <p className="text-xs text-gray-600">
              Need custom volume, custom concurrency, or bespoke SLAs? Our developer solutions team is ready to help.
            </p>
            <div className="space-y-2 text-xs">
              <label className="block text-gray-700 font-semibold">Your Work Email</label>
              <input
                type="email"
                defaultValue="admin@seranking.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Inquiry sent! Our solutions engineer will contact you shortly.');
                  setIsContactModalOpen(false);
                }}
                className="px-4 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== CREATE API KEY MODAL ===================== */}
      {isCreateKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsCreateKeyModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              ✕
            </button>

            <form onSubmit={handleCreateKeySubmit} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#171A1F]">Create API Key</h3>
                <p className="text-xs text-[#7A8391]">Enter a descriptive name for your new API key.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Key Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Data Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#2870ED]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateKeyModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Create Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
