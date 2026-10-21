"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  Building2,
  Mail,
  Shield,
  Clock,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/admin/ui/Toast";
import { SkeletonLoader } from "@/components/admin/ui/SkeletonLoader";
import { ErrorState } from "@/components/admin/ui/ErrorState";

interface SystemSettings {
  platformName: string;
  whiteLabelBrand: string;
  supportEmail: string;
  defaultCountry: string;
  defaultCountryCode: string;
  defaultLanguage: string;
  defaultLanguageCode: string;
  sessionTtlHours: number;
  rateLimitPerMinute: number;
  allowPublicRegistration: boolean;
  requireAdminApproval: boolean;
  weeklyAuditAutoDispatch: boolean;
}

export default function AdminSettingsPage() {
  const { success, error } = useToast();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load platform settings");
      }
      setSettings(json.data);
    } catch (err: any) {
      setFetchError(err.message);
      error("Failed to load settings: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save settings");
      }
      success("Platform settings updated and persisted in PostgreSQL.");
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !settings) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="table" />
      </div>
    );
  }

  if (fetchError && !settings) {
    return <ErrorState message={fetchError} onRetry={fetchSettings} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-indigo-500" />
            <span>Enterprise Platform Settings</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global system configurations, white-label branding, security session TTL, and rate limiting thresholds.
          </p>
        </div>
        <button
          onClick={fetchSettings}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding & Identification */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span>Branding & White-Label Details</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Applied to reports, system headers, and outbound email templates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Platform Name
              </label>
              <input
                type="text"
                value={settings?.platformName || ""}
                onChange={(e) => setSettings({ ...settings!, platformName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                White-Label Brand (Client View)
              </label>
              <input
                type="text"
                value={settings?.whiteLabelBrand || ""}
                onChange={(e) => setSettings({ ...settings!, whiteLabelBrand: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Support & Contact Email
              </label>
              <input
                type="email"
                value={settings?.supportEmail || ""}
                onChange={(e) => setSettings({ ...settings!, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Country
                </label>
                <input
                  type="text"
                  value={settings?.defaultCountry || ""}
                  onChange={(e) => setSettings({ ...settings!, defaultCountry: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Country Code
                </label>
                <input
                  type="text"
                  value={settings?.defaultCountryCode || ""}
                  onChange={(e) => setSettings({ ...settings!, defaultCountryCode: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access Policies */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Authentication & Security Policies</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Session durations, rate limits, and registration workflows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Session Expiration (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={720}
                value={settings?.sessionTtlHours || 168}
                onChange={(e) => setSettings({ ...settings!, sessionTtlHours: parseInt(e.target.value, 10) || 168 })}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: 168 hours (7 days)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rate Limit Threshold (Requests / Minute)
              </label>
              <input
                type="number"
                min={10}
                max={1000}
                value={settings?.rateLimitPerMinute || 120}
                onChange={(e) => setSettings({ ...settings!, rateLimitPerMinute: parseInt(e.target.value, 10) || 120 })}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Prevents automated scraping and API abuse</span>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Require Administrator Approval</div>
                <div className="text-[11px] text-slate-400">New signups enter pending state until approved by an admin.</div>
              </div>
              <input
                type="checkbox"
                checked={settings?.requireAdminApproval ?? true}
                onChange={(e) => setSettings({ ...settings!, requireAdminApproval: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Automated Weekly Technical Audits</div>
                <div className="text-[11px] text-slate-400">Automatically trigger weekly crawler runs for all active domains.</div>
              </div>
              <input
                type="checkbox"
                checked={settings?.weeklyAuditAutoDispatch ?? true}
                onChange={(e) => setSettings({ ...settings!, weeklyAuditAutoDispatch: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving Settings..." : "Save Platform Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
