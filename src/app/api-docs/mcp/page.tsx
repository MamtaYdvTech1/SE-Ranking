'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ClientStatus {
  connected: boolean;
  connectedAt?: string;
}

export default function ApiMcpPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [clientStatuses, setClientStatuses] = useState<Record<string, ClientStatus>>({
    claude: { connected: false },
    claudeCode: { connected: false },
    cursor: { connected: false },
    gemini: { connected: false },
    codex: { connected: false },
  });
  const [loading, setLoading] = useState(false);

  const mcpEndpoint = 'https://api.seranking.com/mcp';
  const apiKey = '12856b00-b1c7-f25b-68b9-294c542738ac';

  // Load real status from backend
  useEffect(() => {
    fetch('/api/mcp')
      .then((res) => res.json())
      .then((data) => {
        if (data.clientStatuses) {
          setClientStatuses(data.clientStatuses);
        }
      })
      .catch((err) => console.error('Error fetching MCP status:', err));
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const copyCommandText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleToggleConnection = async (clientKey: string, action: 'connect' | 'disconnect') => {
    setLoading(true);
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: clientKey, action }),
      });
      const data = await res.json();
      if (data.success) {
        setClientStatuses((prev) => ({
          ...prev,
          [clientKey]: {
            connected: action === 'connect',
            connectedAt: action === 'connect' ? new Date().toISOString() : undefined,
          },
        }));
      }
    } catch (err) {
      console.error('Failed to toggle connection:', err);
    } finally {
      setLoading(false);
      setActiveModal(null);
    }
  };

  return (
    <div className="mcp-page-wrapper w-full min-h-screen bg-[#F4F6F9] py-5 px-4 sm:px-6 font-sans text-[#171A1F]">
      <div className="max-w-6xl mx-auto w-full space-y-5">

        {/* ===================== TOP BAR: BREADCRUMB & FEEDBACK ===================== */}
        <div className="flex items-center justify-between text-xs py-1">
          <Link
            href="/admin.api.html#/"
            className="flex items-center gap-1.5 text-[#5B6370] hover:text-[#171A1F] transition-colors font-medium cursor-pointer"
          >
            <span className="text-sm font-bold">‹</span>
            <span>API Dashboard</span>
          </Link>

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

        {/* ===================== MCP BANNER ===================== */}
        <section className="mcp-page__banner mcp-banner bg-[#EBF3FF] border border-[#BFDBFE] rounded-[16px] p-5 sm:p-6 shadow-xs flex items-start gap-4">
          <div className="shrink-0 pt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="2rem"
              height="2rem"
              viewBox="0 0 24 24"
              className="iconify iconify--mdi ui-icon mcp-banner__icon"
              style={{ color: 'rgb(25, 118, 210)' }}
            >
              <path
                fill="currentColor"
                d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
              />
            </svg>
          </div>

          <div className="mcp-banner__body space-y-2">
            <div className="mcp-banner__title text-base sm:text-[17px] font-bold text-[#1E3A8A]">
              Connect SE Ranking to your AI tools
            </div>
            <div className="mcp-banner__text text-xs sm:text-[13px] text-[#334155] leading-relaxed max-w-4xl">
              The SE Ranking MCP connects your AI tools to live SEO data in minutes. Analyze backlink profiles, research competitor domains, track AI search visibility, and more — all in natural language, without exporting CSVs, copying dashboards, or copy-pasting data into your AI chat.
            </div>
            <div className="pt-1">
              <a
                href="https://seranking.com/mcp"
                target="_blank"
                rel="noreferrer"
                className="ui-link mcp-banner__link inline-flex items-center gap-1.5 text-xs font-bold text-[#1D4ED8] hover:underline cursor-pointer"
              >
                <span>View documentation</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 1: DATA API KEY ===================== */}
        <section className="mcp-page__section mcp-keys space-y-2">
          <div className="mcp-page__section-header">
            <h2 className="mcp-page__section-title text-[15px] font-bold text-[#171A1F]">
              Data API key
            </h2>
            <p className="mcp-page__section-description text-xs text-[#7A8391] mt-0.5">
              The MCP Server uses your API keys to authenticate calls. Keys are managed on the API Dashboard.
            </p>
          </div>

          <div className="uix-background-layer uix-bordered-layer mcp-keys__card bg-white border border-[#E1E6EB] rounded-[16px] p-4 sm:p-5 shadow-xs">
            <div className="mcp-key-row mcp-key-row_active flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-key-active="true">
              <div className="flex items-center gap-3.5">
                {/* Green Key Icon Box matching SE Ranking */}
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center shrink-0 shadow-2xs">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="7.5" cy="15.5" r="4.5" />
                    <path d="m21 3-9.5 9.5" />
                    <path d="m15.5 7.5 2 2" />
                    <path d="m18 10 2 2" />
                  </svg>
                </div>

                <div className="mcp-key-row__info space-y-0.5">
                  <div className="mcp-key-row__title text-xs font-bold text-[#171A1F]">
                    API key
                  </div>
                  <div className="mcp-key-row__description text-xs text-[#7A8391]">
                    Research domains, analyze backlinks, track rankings, run audits, monitor AI Search
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mcp-key-row__active flex items-center gap-3 shrink-0 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active</span>
                </span>
                <span className="text-gray-300">|</span>
                <span className="mcp-key-row__tools text-[#5B6370] font-medium">
                  160+ tools available
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 2: SERVER ENDPOINT ===================== */}
        <section className="mcp-page__section mcp-server space-y-2">
          <div className="mcp-page__section-header">
            <h2 className="mcp-page__section-title text-[15px] font-bold text-[#171A1F]">
              Server endpoint
            </h2>
            <p className="mcp-page__section-description text-xs text-[#7A8391] mt-0.5">
              Copy this URL into any MCP-compatible client.
            </p>
          </div>

          <div className="uix-background-layer uix-bordered-layer mcp-server__card bg-white border border-[#E1E6EB] rounded-[16px] p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="mcp-server__input flex-1 space-y-1.5">
              <label className="mcp-server__label text-[11px] font-bold uppercase tracking-wider text-[#7A8391]">
                MCP URL
              </label>
              <input
                type="text"
                readOnly
                value={mcpEndpoint}
                className="mcp-server__field w-full py-2.5 px-3.5 bg-white border border-[#CBD5E1] rounded-[8px] text-xs font-semibold text-[#171A1F] select-all focus:outline-hidden focus:border-[#2870ED]"
              />
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(mcpEndpoint)}
              className="ui-button ui-button_s-l ui-button_a-secondary mcp-server__copy px-5 py-2.5 bg-white hover:bg-gray-50 border border-[#CBD5E1] rounded-[8px] text-xs font-bold text-[#171A1F] flex items-center justify-center gap-2 shrink-0 transition-colors shadow-2xs cursor-pointer select-none"
            >
              {copiedEndpoint ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500">
                    <path d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* ===================== SECTION 3: CONNECT A CLIENT ===================== */}
        <section className="mcp-page__section mcp-clients space-y-2">
          <div className="mcp-page__section-header">
            <h2 className="mcp-page__section-title text-[15px] font-bold text-[#171A1F]">
              Connect a client
            </h2>
            <p className="mcp-page__section-description text-xs text-[#7A8391] mt-0.5">
              One-click connectors for supported tools.
            </p>
          </div>

          <div className="uix-background-layer uix-bordered-layer mcp-clients__list bg-white border border-[#E1E6EB] rounded-[16px] shadow-xs divide-y divide-[#F0F2F5] overflow-hidden">
            
            {/* ROW 1: Claude */}
            <div className="mcp-clients__row p-4 sm:px-6 sm:py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFCFF] transition-colors">
              <div className="flex items-center gap-4">
                {/* Claude Logo Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#FFF5EB] border border-[#FED7AA] flex items-center justify-center shrink-0 shadow-2xs">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" fill="#D9531E" />
                  </svg>
                </div>

                <div className="mcp-clients__info space-y-1">
                  <div className="mcp-clients__name-row flex items-center gap-2">
                    <span className="mcp-clients__name text-xs sm:text-sm font-bold text-[#171A1F]">Claude</span>
                    <span className="mcp-clients__tag mcp-clients__tag_orange text-[10px] font-bold text-[#C2410C] bg-[#FFEDD5] px-2 py-0.5 rounded-full">
                      Most popular
                    </span>
                    <span className="mcp-clients__tag mcp-clients__tag_blue text-[10px] font-bold text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded-full">
                      OAuth
                    </span>
                  </div>
                  <div className="mcp-clients__description text-xs text-[#7A8391]">
                    Web &amp; Desktop · Turn Claude into your SEO analyst
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {clientStatuses.claude?.connected ? (
                  <button
                    onClick={() => handleToggleConnection('claude', 'disconnect')}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-[8px] text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    ✓ Connected
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveModal('claude')}
                    className="mcp-clients__button px-4 py-2 bg-white hover:bg-gray-50 border border-[#CBD5E1] text-[#171A1F] rounded-[8px] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span className="text-base font-bold leading-none">+</span>
                    <span>Connect</span>
                  </button>
                )}
              </div>
            </div>

            {/* ROW 2: Claude Code */}
            <div className="mcp-clients__row mcp-clients__row_with-divider p-4 sm:px-6 sm:py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFCFF] transition-colors">
              <div className="flex items-center gap-4">
                {/* Claude Code Terminal Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center shrink-0 shadow-2xs">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                </div>

                <div className="mcp-clients__info space-y-1">
                  <div className="mcp-clients__name-row flex items-center gap-2">
                    <span className="mcp-clients__name text-xs sm:text-sm font-bold text-[#171A1F]">Claude code</span>
                    <span className="mcp-clients__tag mcp-clients__tag_violet text-[10px] font-bold text-[#6D28D9] bg-[#EDE9FE] px-2 py-0.5 rounded-full">
                      Cli
                    </span>
                  </div>
                  <div className="mcp-clients__description text-xs text-[#7A8391]">
                    Build SEO tools from your terminal
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => setActiveModal('claudeCode')}
                  className="mcp-clients__button px-4 py-2 bg-white hover:bg-gray-50 border border-[#CBD5E1] text-[#171A1F] rounded-[8px] text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  Set up
                </button>
              </div>
            </div>

            {/* ROW 3: Cursor */}
            <div className="mcp-clients__row mcp-clients__row_with-divider p-4 sm:px-6 sm:py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFCFF] transition-colors">
              <div className="flex items-center gap-4">
                {/* Cursor 3D Cube Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0 shadow-2xs">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.12 6.4-6.05-3.5a2 2 0 0 0-2.14 0L6.88 6.4a2 2 0 0 0-1 1.73v7a2 2 0 0 0 1 1.73l6.05 3.5a2 2 0 0 0 2.14 0l6.05-3.5a2 2 0 0 0 1-1.73v-7a2 2 0 0 0-1-1.73z" />
                    <path d="M12 22V12" />
                    <path d="m3.27 6.96 8.73 5.04 8.73-5.04" />
                  </svg>
                </div>

                <div className="mcp-clients__info space-y-1">
                  <div className="mcp-clients__name-row flex items-center gap-2">
                    <span className="mcp-clients__name text-xs sm:text-sm font-bold text-[#171A1F]">Cursor</span>
                    <span className="mcp-clients__tag mcp-clients__tag_blue text-[10px] font-bold text-[#0369A1] bg-[#E0F2FE] px-2 py-0.5 rounded-full">
                      OAuth
                    </span>
                  </div>
                  <div className="mcp-clients__description text-xs text-[#7A8391]">
                    Reference SE Ranking data while you code
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {clientStatuses.cursor?.connected ? (
                  <button
                    onClick={() => handleToggleConnection('cursor', 'disconnect')}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-[8px] text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    ✓ Connected
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveModal('cursor')}
                    className="mcp-clients__button px-4 py-2 bg-white hover:bg-gray-50 border border-[#CBD5E1] text-[#171A1F] rounded-[8px] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span className="text-base font-bold leading-none">+</span>
                    <span>Connect</span>
                  </button>
                )}
              </div>
            </div>

            {/* ROW 4: Gemini */}
            <div className="mcp-clients__row mcp-clients__row_with-divider p-4 sm:px-6 sm:py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFCFF] transition-colors">
              <div className="flex items-center gap-4">
                {/* Gemini 4-Point Sparkle Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center shrink-0 shadow-2xs">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z"
                      fill="url(#gemini_grad)"
                    />
                    <defs>
                      <linearGradient id="gemini_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#1E88E5" />
                        <stop offset="0.5" stopColor="#9C27B0" />
                        <stop offset="1" stopColor="#E91E63" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="mcp-clients__info space-y-1">
                  <div className="mcp-clients__name-row flex items-center gap-2">
                    <span className="mcp-clients__name text-xs sm:text-sm font-bold text-[#171A1F]">Gemini</span>
                  </div>
                  <div className="mcp-clients__description text-xs text-[#7A8391]">
                    Connect SE Ranking to Gemini CLI
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => setActiveModal('gemini')}
                  className="mcp-clients__button px-4 py-2 bg-white hover:bg-gray-50 border border-[#CBD5E1] text-[#171A1F] rounded-[8px] text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  Set up
                </button>
              </div>
            </div>

            {/* ROW 5: Codex (CLI & IDE) */}
            <div className="mcp-clients__row mcp-clients__row_with-divider p-4 sm:px-6 sm:py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFCFF] transition-colors">
              <div className="flex items-center gap-4">
                {/* Codex Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center shrink-0 shadow-2xs">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="m9 8 4 4-4 4" />
                    <line x1="15" y1="16" x2="15" y2="16.01" />
                  </svg>
                </div>

                <div className="mcp-clients__info space-y-1">
                  <div className="mcp-clients__name-row flex items-center gap-2">
                    <span className="mcp-clients__name text-xs sm:text-sm font-bold text-[#171A1F]">Codex (CLI &amp; IDE)</span>
                    <span className="mcp-clients__tag mcp-clients__tag_violet text-[10px] font-bold text-[#6D28D9] bg-[#EDE9FE] px-2 py-0.5 rounded-full">
                      Cli
                    </span>
                  </div>
                  <div className="mcp-clients__description text-xs text-[#7A8391]">
                    OpenAI Codex with the rmcp client
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => setActiveModal('codex')}
                  className="mcp-clients__button px-4 py-2 bg-white hover:bg-gray-50 border border-[#CBD5E1] text-[#171A1F] rounded-[8px] text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  Set up
                </button>
              </div>
            </div>

            {/* ROW 6: Other MCP-compatible tools */}
            <div className="mcp-clients__row mcp-clients__row_with-divider p-4 sm:px-6 sm:py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFCFF] transition-colors">
              <div className="flex items-center gap-4">
                {/* Rainbow Extension Puzzle Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center shrink-0 shadow-2xs">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19.439 7.85c0-1.57.8-2.35 1.56-3.12a.5.5 0 0 0-.35-.85H17a1 1 0 0 1-1-1V1.5a.5.5 0 0 0-.85-.35c-.77.76-1.55 1.56-3.12 1.56s-2.35-.8-3.12-1.56A.5.5 0 0 0 8 1.5V3a1 1 0 0 1-1 1H4.35a.5.5 0 0 0-.35.85c.76.77 1.56 1.55 1.56 3.12s-.8 2.35-1.56 3.12a.5.5 0 0 0 .35.85H7a1 1 0 0 1 1 1v1.5a.5.5 0 0 0 .85.35c.77-.76 1.55-1.56 3.12-1.56s2.35.8 3.12 1.56a.5.5 0 0 0 .85-.35V16a1 1 0 0 1 1-1h2.65a.5.5 0 0 0 .35-.85c-.76-.77-1.56-1.55-1.56-3.12Z" />
                  </svg>
                </div>

                <div className="mcp-clients__info space-y-1">
                  <div className="mcp-clients__name-row flex items-center gap-2">
                    <span className="mcp-clients__name text-xs sm:text-sm font-bold text-[#171A1F]">Other MCP-compatible tools</span>
                  </div>
                  <div className="mcp-clients__description text-xs text-[#7A8391]">
                    VS Code, Gemini CLI, Windsurf, Zed, n8n, Make, and more
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => setActiveModal('other')}
                  className="ui-button ui-button_s-l ui-button_a-tertiary mcp-clients__button px-4 py-2 bg-transparent hover:bg-gray-100 text-[#2870ED] rounded-[8px] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="ui-button__text">Explore</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* ===================== MODAL: CLIENT SETUP / CONNECT ===================== */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            {activeModal === 'claude' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF5EB] border border-[#FED7AA] flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" fill="#D9531E" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#171A1F]">Connect to Claude</h3>
                    <p className="text-xs text-[#7A8391]">Authorize SE Ranking MCP server for Claude Web &amp; Desktop.</p>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 text-xs text-[#334155] space-y-2">
                  <div className="font-semibold text-[#171A1F]">Permissions granted:</div>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Query Domain Research &amp; Keyword Overview</li>
                    <li>Access live Backlink analytics &amp; Competitor audits</li>
                    <li>Perform real-time AI search tracking queries</li>
                  </ul>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleToggleConnection('claude', 'connect')}
                    disabled={loading}
                    className="px-5 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {loading ? 'Authorizing...' : 'Authorize & Connect'}
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'claudeCode' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="4 17 10 11 4 5" />
                      <line x1="12" y1="19" x2="20" y2="19" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#171A1F]">Set up Claude Code CLI</h3>
                    <p className="text-xs text-[#7A8391]">Run this command in your terminal to register the MCP tool:</p>
                  </div>
                </div>

                <div className="relative">
                  <pre className="p-3 bg-[#1E293B] text-[#38BDF8] text-[11px] rounded-lg overflow-x-auto font-mono leading-relaxed select-all">
                    claude mcp add seranking {mcpEndpoint} --header &quot;Authorization: Bearer {apiKey}&quot;
                  </pre>
                  <button
                    onClick={() => copyCommandText(`claude mcp add seranking ${mcpEndpoint} --header "Authorization: Bearer ${apiKey}"`)}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold cursor-pointer"
                  >
                    {copiedCommand ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="text-xs text-gray-500">
                  After running the command, Claude Code will automatically discover all 160+ SE Ranking SEO tools.
                </div>
              </div>
            )}

            {activeModal === 'cursor' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.12 6.4-6.05-3.5a2 2 0 0 0-2.14 0L6.88 6.4a2 2 0 0 0-1 1.73v7a2 2 0 0 0 1 1.73l6.05 3.5a2 2 0 0 0 2.14 0l6.05-3.5a2 2 0 0 0 1-1.73v-7a2 2 0 0 0-1-1.73z" />
                      <path d="M12 22V12" />
                      <path d="m3.27 6.96 8.73 5.04 8.73-5.04" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#171A1F]">Connect to Cursor</h3>
                    <p className="text-xs text-[#7A8391]">Add SE Ranking MCP to your Cursor IDE settings:</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600">
                  <p>1. Open Cursor Settings → <strong>Features</strong> → <strong>MCP Servers</strong>.</p>
                  <p>2. Click <strong>+ Add New MCP Server</strong>.</p>
                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[11px] space-y-1">
                    <div><strong>Name:</strong> seranking</div>
                    <div><strong>Type:</strong> sse</div>
                    <div><strong>Server URL:</strong> {mcpEndpoint}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleToggleConnection('cursor', 'connect')}
                    className="px-5 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Mark as Connected
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'gemini' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" fill="#1E88E5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#171A1F]">Connect Gemini CLI</h3>
                    <p className="text-xs text-[#7A8391]">Run this configuration command in your terminal:</p>
                  </div>
                </div>

                <div className="relative">
                  <pre className="p-3 bg-[#1E293B] text-[#34D399] text-[11px] rounded-lg overflow-x-auto font-mono leading-relaxed select-all">
                    gemini-cli mcp add {mcpEndpoint} --token {apiKey}
                  </pre>
                  <button
                    onClick={() => copyCommandText(`gemini-cli mcp add ${mcpEndpoint} --token ${apiKey}`)}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold cursor-pointer"
                  >
                    {copiedCommand ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'codex' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="m9 8 4 4-4 4" />
                      <line x1="15" y1="16" x2="15" y2="16.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#171A1F]">OpenAI Codex / rmcp client</h3>
                    <p className="text-xs text-[#7A8391]">Add SE Ranking MCP to your rmcp config:</p>
                  </div>
                </div>

                <div className="relative">
                  <pre className="p-3 bg-[#1E293B] text-[#A78BFA] text-[11px] rounded-lg overflow-x-auto font-mono leading-relaxed select-all">
                    rmcp add seranking {mcpEndpoint} --key {apiKey}
                  </pre>
                  <button
                    onClick={() => copyCommandText(`rmcp add seranking ${mcpEndpoint} --key ${apiKey}`)}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold cursor-pointer"
                  >
                    {copiedCommand ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'other' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#171A1F]">Other MCP Compatible Tools</h3>
                <p className="text-xs text-[#7A8391]">
                  SE Ranking supports the universal Model Context Protocol standard over HTTP/SSE.
                </p>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2 text-xs text-gray-700">
                  <div><strong>Compatible Tools:</strong> VS Code (Roo Code / Cline), Windsurf, Zed Editor, n8n, Make, Flowise, LangChain.</div>
                  <div><strong>Server Endpoint:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-gray-300 font-mono text-[11px]">{mcpEndpoint}</code></div>
                  <div><strong>Auth Header:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-gray-300 font-mono text-[11px]">Authorization: Bearer {apiKey}</code></div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
