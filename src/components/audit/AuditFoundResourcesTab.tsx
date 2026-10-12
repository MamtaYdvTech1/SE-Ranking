"use client";

import React, { useState, useMemo } from "react";
import { Image, FileCode, FileText, File, Search, Filter } from "lucide-react";
import { Badge } from "@internal-seo/ui";

interface FoundResource {
  id: string;
  url: string;
  type: "Image" | "JavaScript" | "CSS" | "Font" | "PDF";
  statusCode: number;
  sizeBytes: number;
  loadTimeMs: number;
  isIndexable: boolean;
}

const MOCK_FOUND_RESOURCES: FoundResource[] = [
  { id: "res-1", url: "https://acme.example/assets/hero-banner.webp", type: "Image", statusCode: 200, sizeBytes: 142800, loadTimeMs: 48, isIndexable: true },
  { id: "res-2", url: "https://acme.example/assets/logo.svg", type: "Image", statusCode: 200, sizeBytes: 12400, loadTimeMs: 14, isIndexable: true },
  { id: "res-3", url: "https://acme.example/js/app-bundle.min.js", type: "JavaScript", statusCode: 200, sizeBytes: 284500, loadTimeMs: 82, isIndexable: false },
  { id: "res-4", url: "https://acme.example/js/analytics-tracker.js", type: "JavaScript", statusCode: 200, sizeBytes: 42100, loadTimeMs: 25, isIndexable: false },
  { id: "res-5", url: "https://acme.example/css/global-styles.css", type: "CSS", statusCode: 200, sizeBytes: 68900, loadTimeMs: 31, isIndexable: false },
  { id: "res-6", url: "https://acme.example/fonts/inter-variable.woff2", type: "Font", statusCode: 200, sizeBytes: 98000, loadTimeMs: 40, isIndexable: false },
  { id: "res-7", url: "https://acme.example/downloads/product-whitepaper.pdf", type: "PDF", statusCode: 200, sizeBytes: 1450000, loadTimeMs: 210, isIndexable: true },
  { id: "res-8", url: "https://acme.example/assets/broken-infographic.png", type: "Image", statusCode: 404, sizeBytes: 0, loadTimeMs: 110, isIndexable: false },
];

export function AuditFoundResourcesTab() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filteredResources = useMemo(() => {
    return MOCK_FOUND_RESOURCES.filter((res) => {
      if (selectedType !== "all" && res.type !== selectedType) return false;
      if (search.trim() && !res.url.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [selectedType, search]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 KB";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Category Pills Header */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { type: "all", label: "All Resources", count: 8, icon: Filter },
          { type: "Image", label: "Images", count: 3, icon: Image },
          { type: "JavaScript", label: "JavaScript", count: 2, icon: FileCode },
          { type: "CSS", label: "CSS", count: 1, icon: FileText },
          { type: "PDF", label: "Documents", count: 1, icon: File },
        ].map((item) => {
          const isSelected = selectedType === item.type;
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => setSelectedType(item.type)}
              className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                isSelected
                  ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 shadow-2xs font-semibold"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                <span className="text-xs">{item.label}</span>
              </div>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search resource URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredResources.length}</span> of 8 resources
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-4 py-3">Resource URL</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Load Time</th>
                <th className="px-4 py-3">Indexability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredResources.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 max-w-md truncate font-mono text-[11px] text-slate-800 dark:text-slate-200" title={res.url}>
                    {res.url}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-600 dark:text-slate-300">{res.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={res.statusCode === 200 ? "success" : "danger"}>
                      {res.statusCode}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                    {formatSize(res.sizeBytes)}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                    {res.loadTimeMs} ms
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold ${res.isIndexable ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                      {res.isIndexable ? "Indexable" : "Noindex / Asset"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}