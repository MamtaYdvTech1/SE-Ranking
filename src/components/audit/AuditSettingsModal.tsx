"use client";

import React, { useEffect, useState } from "react";
import { Button, Input, Alert } from "@internal-seo/ui";
import { api } from "../../lib/api";
import { UpdateCrawlSettingsRequest } from "../../lib/types";

interface AuditSettingsModalProps {
  projectId: string;
  isOpen: boolean;
  canEdit: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function AuditSettingsModal({
  projectId,
  isOpen,
  canEdit,
  onClose,
  onSaved,
}: AuditSettingsModalProps) {
  const [formData, setFormData] = useState<UpdateCrawlSettingsRequest>({
    crawlMaxPages: 100,
    crawlMaxDepth: 5,
    crawlConcurrency: 2,
    crawlRateLimitMs: 100,
    crawlRespectRobotsTxt: true,
    crawlUserAgent: "InternalSEOPlatformBot/1.0",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadSettings() {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await api.audit.getSettings(projectId);
        if (res.data) {
          setFormData({
            crawlMaxPages: res.data.crawlMaxPages,
            crawlMaxDepth: res.data.crawlMaxDepth,
            crawlConcurrency: res.data.crawlConcurrency,
            crawlRateLimitMs: res.data.crawlRateLimitMs,
            crawlRespectRobotsTxt: res.data.crawlRespectRobotsTxt,
            crawlUserAgent: res.data.crawlUserAgent,
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        setError("Unable to load crawl settings.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [projectId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.audit.updateSettings(projectId, formData);
      setSuccess("Crawl settings updated successfully.");
      setTimeout(() => {
        onSaved();
        onClose();
      }, 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update crawl settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Crawl Configuration</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure bounded crawling and resource limits for this project.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mt-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          {success && (
            <div className="mt-4">
              <Alert variant="success">{success}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Pages (1 – 10,000)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={10000}
                  disabled={!canEdit || isLoading}
                  value={formData.crawlMaxPages}
                  onChange={(e) =>
                    setFormData({ ...formData, crawlMaxPages: parseInt(e.target.value) || 1 })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Crawl Depth (1 – 20)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  disabled={!canEdit || isLoading}
                  value={formData.crawlMaxDepth}
                  onChange={(e) =>
                    setFormData({ ...formData, crawlMaxDepth: parseInt(e.target.value) || 1 })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rate Limit Delay (ms)
                </label>
                <Input
                  type="number"
                  min={50}
                  max={5000}
                  step={50}
                  disabled={!canEdit || isLoading}
                  value={formData.crawlRateLimitMs}
                  onChange={(e) =>
                    setFormData({ ...formData, crawlRateLimitMs: parseInt(e.target.value) || 100 })
                  }
                  required
                />
                <span className="text-[10px] text-slate-400">Delay between requests</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Concurrency (1 – 10)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  disabled={!canEdit || isLoading}
                  value={formData.crawlConcurrency}
                  onChange={(e) =>
                    setFormData({ ...formData, crawlConcurrency: parseInt(e.target.value) || 1 })
                  }
                  required
                />
                <span className="text-[10px] text-slate-400">Parallel HTTP connections</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom User-Agent
              </label>
              <Input
                type="text"
                disabled={!canEdit || isLoading}
                value={formData.crawlUserAgent}
                onChange={(e) =>
                  setFormData({ ...formData, crawlUserAgent: e.target.value })
                }
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="respectRobots"
                type="checkbox"
                disabled={!canEdit || isLoading}
                checked={formData.crawlRespectRobotsTxt}
                onChange={(e) =>
                  setFormData({ ...formData, crawlRespectRobotsTxt: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <label htmlFor="respectRobots" className="text-xs font-medium text-slate-700 select-none">
                Respect Robots.txt disallow rules and meta tags
              </label>
            </div>

            {!canEdit && (
              <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                You have read-only access to this project. Crawl settings can only be modified by project writers.
              </p>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              {canEdit && (
                <Button type="submit" variant="primary" size="sm" disabled={isSaving || isLoading}>
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}