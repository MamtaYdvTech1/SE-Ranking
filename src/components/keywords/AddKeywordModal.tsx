"use client";

import React, { useState } from "react";
import { KeywordGroupDto } from "../../lib/types";
import { api, ApiError } from "../../lib/api";
import { Alert, Button, Input } from "../ui";

interface AddKeywordModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groups: KeywordGroupDto[];
}

export function AddKeywordModal({
  projectId,
  isOpen,
  onClose,
  onSuccess,
  groups,
}: AddKeywordModalProps) {
  const [tab, setTab] = useState<"single" | "bulk">("single");

  // Single form state
  const [keywordText, setKeywordText] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [searchIntent, setSearchIntent] = useState("");
  const [searchEngine, setSearchEngine] = useState("google");
  const [device, setDevice] = useState("desktop");
  const [countryCode, setCountryCode] = useState("US");
  const [locationName, setLocationName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // Bulk form state
  const [bulkText, setBulkText] = useState("");

  // Submission state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const tagList = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (tab === "single") {
        if (!keywordText.trim()) {
          setErrorMessage("Keyword text is required.");
          setIsLoading(false);
          return;
        }

        await api.keywords.create(projectId, {
          keywordText: keywordText.trim(),
          targetUrl: targetUrl.trim() || undefined,
          searchIntent: searchIntent || undefined,
          searchEngine,
          device,
          countryCode: countryCode.toUpperCase(),
          locationName: locationName.trim() || undefined,
          groupId: groupId || undefined,
          tags: tagList,
        });
      } else {
        const lines = bulkText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.length === 0) {
          setErrorMessage("Please enter at least one keyword line.");
          setIsLoading(false);
          return;
        }

        const selectedGroup = groups.find((g) => g.id === groupId);
        const rows = lines.map((kw) => ({
          keyword: kw,
          searchEngine,
          device,
          country: countryCode.toUpperCase(),
          location: locationName.trim() || undefined,
          intent: searchIntent || undefined,
          targetUrl: targetUrl.trim() || undefined,
          group: selectedGroup?.name,
          tags: tagsInput.trim() || undefined,
        }));

        await api.keywords.bulk(projectId, rows);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred while adding keywords.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add Tracked Keywords</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add keywords to monitor ranking performance and search visibility.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded p-1 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-4 pt-2 gap-2 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setTab("single")}
            className={`pb-2 px-2 text-xs font-semibold border-b-2 transition ${
              tab === "single"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Single Keyword
          </button>
          <button
            type="button"
            onClick={() => setTab("bulk")}
            className={`pb-2 px-2 text-xs font-semibold border-b-2 transition ${
              tab === "bulk"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Bulk Multi-Line
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {errorMessage && (
            <Alert variant="error" className="py-2 text-xs">
              {errorMessage}
            </Alert>
          )}

          {tab === "single" ? (
            <div className="space-y-1">
              <label htmlFor="modal-keyword" className="block text-slate-700 font-medium">
                Keyword Text <span className="text-red-500">*</span>
              </label>
              <Input
                id="modal-keyword"
                value={keywordText}
                onChange={(e) => setKeywordText(e.target.value)}
                placeholder="e.g. enterprise seo platform"
                required
                className="text-xs py-1.5"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <label htmlFor="modal-bulk-keywords" className="block text-slate-700 font-medium">
                Keywords (One per line) <span className="text-red-500">*</span>
              </label>
              <textarea
                id="modal-bulk-keywords"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="best seo tools&#10;organic search tracker&#10;enterprise rank checking"
                rows={5}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          )}

          {/* Grid Settings: Device, Search Engine, Country, Location */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="modal-device" className="block text-slate-700 font-medium mb-1">Device Target</label>
              <select
                id="modal-device"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>

            <div>
              <label htmlFor="modal-engine" className="block text-slate-700 font-medium mb-1">Search Engine</label>
              <select
                id="modal-engine"
                value={searchEngine}
                onChange={(e) => setSearchEngine(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="google">Google</option>
              </select>
            </div>

            <div>
              <label htmlFor="modal-country" className="block text-slate-700 font-medium mb-1">Country Code</label>
              <Input
                id="modal-country"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                placeholder="US, GB, IN"
                maxLength={2}
                className="text-xs py-1.5"
              />
            </div>

            <div>
              <label htmlFor="modal-location" className="block text-slate-700 font-medium mb-1">Location Name (Optional)</label>
              <Input
                id="modal-location"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Nationwide or New York, NY"
                className="text-xs py-1.5"
              />
            </div>
          </div>

          {/* Target URL & Search Intent */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="modal-target-url" className="block text-slate-700 font-medium mb-1">Target Landing Page URL</label>
              <Input
                id="modal-target-url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com/target-page"
                className="text-xs py-1.5"
              />
            </div>

            <div>
              <label htmlFor="modal-intent" className="block text-slate-700 font-medium mb-1">Search Intent</label>
              <select
                id="modal-intent"
                value={searchIntent}
                onChange={(e) => setSearchIntent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="">(None / Auto)</option>
                <option value="Informational">Informational</option>
                <option value="Navigational">Navigational</option>
                <option value="Commercial">Commercial</option>
                <option value="Transactional">Transactional</option>
              </select>
            </div>
          </div>

          {/* Group & Tags */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="modal-group" className="block text-slate-700 font-medium mb-1">Keyword Group</label>
              <select
                id="modal-group"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
              >
                <option value="">(No Group)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="modal-tags" className="block text-slate-700 font-medium mb-1">Tags (Comma-separated)</label>
              <Input
                id="modal-tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="brand, q3-focus, tier-1"
                className="text-xs py-1.5"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading}
              className="text-xs"
            >
              {isLoading ? "Saving..." : tab === "single" ? "Add Keyword" : "Add Keywords"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
