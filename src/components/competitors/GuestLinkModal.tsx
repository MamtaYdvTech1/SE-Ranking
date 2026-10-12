"use client";

import React, { useState, useEffect, useMemo } from "react";

export interface GuestLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectDomain?: string;
  hideSearchVolume?: boolean;
  setHideSearchVolume?: React.Dispatch<React.SetStateAction<boolean>>;
  includeFilterSort?: boolean;
  setIncludeFilterSort?: React.Dispatch<React.SetStateAction<boolean>>;
  guestModules?: Record<string, boolean>;
  setGuestModules?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onCopied?: (url: string) => void;
}

export const GUEST_MODULE_DEFINITIONS: { key: string; label: string; icon: string; description: string }[] = [
  { key: "overview", label: "Overview", icon: "📊", description: "Summary metrics and project visibility" },
  { key: "rankings", label: "Rankings", icon: "📈", description: "Detailed keyword positions and search engine ranks" },
  { key: "analytics", label: "Analytics", icon: "📉", description: "Traffic share and search trends" },
  { key: "competitors", label: "Competitors", icon: "⚔️", description: "Added competitors and SERP competitor overlap" },
  { key: "aiResults", label: "AI Results", icon: "🤖", description: "AI Overview rankings and citations" },
  { key: "audit", label: "Website Audit", icon: "🔍", description: "Technical health and crawl issue reports" },
  { key: "marketing", label: "Marketing Plan", icon: "🎯", description: "SEO task checklists and roadmaps" },
];

export function GuestLinkModal({
  isOpen,
  onClose,
  projectId,
  projectDomain = "workcomposer.com",
  hideSearchVolume = false,
  setHideSearchVolume,
  includeFilterSort = true,
  setIncludeFilterSort,
  guestModules = {
    overview: false,
    rankings: false,
    analytics: false,
    competitors: true,
    aiResults: false,
    audit: false,
    marketing: false,
  },
  setGuestModules,
  onCopied,
}: GuestLinkModalProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Construct dynamic guest link
  const guestUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://app.internalseoplatform.com";
    const activeMods = Object.entries(guestModules)
      .filter(([, active]) => active)
      .map(([key]) => key);

    const params = new URLSearchParams();
    params.set("guest", "true");
    if (activeMods.length > 0) {
      params.set("modules", activeMods.join(","));
    }
    if (hideSearchVolume) {
      params.set("hideSV", "1");
    }
    if (includeFilterSort) {
      params.set("filterSort", "1");
    }
    // Stable demo share token
    params.set("token", `gst_${projectId.replace(/[^a-zA-Z0-9]/g, "")}_${projectDomain.replace(/[^a-zA-Z0-9]/g, "")}`);

    return `${origin}/guest/projects/${projectId}?${params.toString()}`;
  }, [projectId, projectDomain, guestModules, hideSearchVolume, includeFilterSort]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(guestUrl);
    }
    setCopied(true);
    if (onCopied) {
      onCopied(guestUrl);
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleModule = (modKey: string) => {
    if (setGuestModules) {
      setGuestModules((prev) => ({
        ...prev,
        [modKey]: !prev[modKey],
      }));
    }
  };

  const handleSelectAllModules = () => {
    if (setGuestModules) {
      setGuestModules((prev) => {
        const updated: Record<string, boolean> = {};
        Object.keys(prev).forEach((k) => {
          updated[k] = true;
        });
        return updated;
      });
    }
  };

  const handleDeselectAllModules = () => {
    if (setGuestModules) {
      setGuestModules((prev) => {
        const updated: Record<string, boolean> = {};
        Object.keys(prev).forEach((k) => {
          updated[k] = false;
        });
        return updated;
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-link-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </div>
            <div>
              <h2 id="guest-link-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                Get access to guest links
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share read-only real-time rankings and competitor data without requiring user accounts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Guest Link URL bar */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Generated Guest Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={guestUrl}
                aria-label="Generated guest link URL"
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 select-all focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition shrink-0 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {copied ? (
                    <path d="M20 6L9 17l-5-5"></path>
                  ) : (
                    <>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </>
                  )}
                </svg>
                <span>{copied ? "Copied!" : "Copy link"}</span>
              </button>
            </div>
            {copied && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Link copied to clipboard successfully!
              </p>
            )}
          </div>

          {/* Privacy & Filter Toggles */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Display & Filter Settings
            </h3>

            {/* Toggle 1: Hide search volume */}
            <label className="flex items-start justify-between gap-3 cursor-pointer select-none">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Hide search volume
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Conceal search volume numbers from guests for confidential keyword targets.
                </p>
              </div>
              <input
                type="checkbox"
                checked={hideSearchVolume}
                onChange={(e) => setHideSearchVolume && setHideSearchVolume(e.target.checked)}
                data-testid="guest-link-hide-sv-toggle"
                className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            {/* Toggle 2: Include filters and sorting */}
            <label className="flex items-start justify-between gap-3 cursor-pointer select-none pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Include filters and sorting
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Preserve currently applied position tiers, tags, search queries, and date ranges.
                </p>
              </div>
              <input
                type="checkbox"
                checked={includeFilterSort}
                onChange={(e) => setIncludeFilterSort && setIncludeFilterSort(e.target.checked)}
                data-testid="guest-link-include-filters-toggle"
                className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Module Access Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Sections Accessible to Guests
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select which workspace modules can be accessed using this link:
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectAllModules}
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                >
                  Select all
                </button>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllModules}
                  className="text-slate-500 hover:underline cursor-pointer font-medium"
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GUEST_MODULE_DEFINITIONS.map((mod) => {
                const isSelected = !!guestModules[mod.key];
                return (
                  <label
                    key={mod.key}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer select-none ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-slate-900 dark:text-slate-100 shadow-xs"
                        : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleModule(mod.key)}
                      data-testid={`guest-module-${mod.key}`}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{mod.icon}</span>
                        <span className="text-xs font-semibold">{mod.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {mod.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 rounded-b-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Link access: <strong>Read-only</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
            >
              Done
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
            >
              <span>{copied ? "Copied!" : "Copy link"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestLinkModal;
