"use client";

import React, { useState, useMemo } from "react";
import { Link2, ExternalLink, ArrowRight, Search, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@internal-seo/ui";

interface FoundLink {
  id: string;
  sourceUrl: string;
  anchorText: string;
  targetUrl: string;
  linkType: "Internal" | "External";
  statusCode: number;
  rel: "follow" | "nofollow";
}

const MOCK_FOUND_LINKS: FoundLink[] = [
  { id: "lnk-1", sourceUrl: "https://acme.example/", anchorText: "Platform Features", targetUrl: "https://acme.example/features", linkType: "Internal", statusCode: 200, rel: "follow" },
  { id: "lnk-2", sourceUrl: "https://acme.example/", anchorText: "Pricing Plans", targetUrl: "https://acme.example/pricing", linkType: "Internal", statusCode: 200, rel: "follow" },
  { id: "lnk-3", sourceUrl: "https://acme.example/blog", anchorText: "Google Search Central Guide", targetUrl: "https://developers.google.com/search/docs", linkType: "External", statusCode: 200, rel: "nofollow" },
  { id: "lnk-4", sourceUrl: "https://acme.example/features", anchorText: "Customer Case Studies", targetUrl: "https://acme.example/case-studies", linkType: "Internal", statusCode: 200, rel: "follow" },
  { id: "lnk-5", sourceUrl: "https://acme.example/pricing", anchorText: "Legacy 2023 Pricing FAQ", targetUrl: "https://acme.example/old-pricing-archived", linkType: "Internal", statusCode: 404, rel: "follow" },
  { id: "lnk-6", sourceUrl: "https://acme.example/about", anchorText: "Twitter / X Profile", targetUrl: "https://twitter.com/acmedigital", linkType: "External", statusCode: 200, rel: "nofollow" },
  { id: "lnk-7", sourceUrl: "https://acme.example/case-studies", anchorText: "View Migration Playbook", targetUrl: "https://acme.example/playbook", linkType: "Internal", statusCode: 301, rel: "follow" },
];

export function AuditFoundLinksTab() {
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filteredLinks = useMemo(() => {
    return MOCK_FOUND_LINKS.filter((lnk) => {
      if (filterType !== "all" && lnk.linkType !== filterType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          lnk.sourceUrl.toLowerCase().includes(q) ||
          lnk.targetUrl.toLowerCase().includes(q) ||
          lnk.anchorText.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [filterType, search]);

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Total Links</span>
            <Link2 className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">320</div>
          <div className="text-[11px] text-slate-400 mt-1">Discovered during crawl</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Internal Links</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">294</div>
          <div className="text-[11px] text-slate-400 mt-1">91.8% of link graph</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>External Links</span>
            <ExternalLink className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">26</div>
          <div className="text-[11px] text-slate-400 mt-1">8.2% external references</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-red-600 flex items-center justify-between">
            <span>Broken Links (4xx)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 mt-1">1</div>
          <div className="text-[11px] text-red-500/80 mt-1">Immediate fix required</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {["all", "Internal", "External"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterType(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                filterType === tab
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {tab === "all" ? "All Links" : `${tab} Links`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search anchor or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-4 py-3">Source Page</th>
                <th className="px-4 py-3">Anchor Text</th>
                <th className="px-4 py-3">Target Destination URL</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Rel Attribute</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLinks.map((lnk) => (
                <tr key={lnk.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 max-w-[200px] truncate font-mono text-[11px] text-slate-600 dark:text-slate-400" title={lnk.sourceUrl}>
                    {lnk.sourceUrl}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white max-w-[180px] truncate">
                    &ldquo;{lnk.anchorText}&rdquo;
                  </td>
                  <td className="px-4 py-3 max-w-[240px] truncate font-mono text-[11px] text-blue-600 dark:text-blue-400" title={lnk.targetUrl}>
                    {lnk.targetUrl}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-[11px] font-semibold ${lnk.linkType === "Internal" ? "text-slate-700 dark:text-slate-300" : "text-purple-600 dark:text-purple-400"}`}>
                      {lnk.linkType}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant={lnk.statusCode === 200 ? "success" : lnk.statusCode === 301 ? "warning" : "danger"}>
                      {lnk.statusCode}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {lnk.rel}
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