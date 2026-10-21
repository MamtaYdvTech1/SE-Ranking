"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Plus,
  Search,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { useToast } from "@/components/admin/ui/Toast";
import { SkeletonLoader } from "@/components/admin/ui/SkeletonLoader";
import { ErrorState } from "@/components/admin/ui/ErrorState";

interface DomainItem extends Record<string, any> {
  id: string;
  projectId: string;
  projectName: string;
  domain: string;
  protocol: string;
  isPrimary: boolean;
  status: string;
  country: string;
  countryCode: string;
  ownerEmail: string;
  clientName: string;
  keywordsCount: number;
  auditPagesCount: number;
  backlinksCount: number;
  createdAt: string;
}

export default function AdminDomainsPage() {
  const { success, error } = useToast();
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortBy, setSortBy] = useState("domain");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDomains = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/domains?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load domains");
      }
      setDomains(json.data);
    } catch (err: any) {
      setFetchError(err.message);
      error("Failed to load domains: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !domainInput) {
      error("Project ID and domain are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, domain: domainInput, isPrimary }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to add domain");
      }
      success(`Domain "${domainInput}" added successfully.`);
      setIsModalOpen(false);
      setDomainInput("");
      fetchDomains();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = domains.filter((d) => {
    if (statusFilter && d.status !== statusFilter) return false;
    return true;
  });

  const primaryCount = domains.filter((d) => d.isPrimary).length;
  const secondaryCount = domains.length - primaryCount;

  const columns: Column<DomainItem>[] = [
    {
      header: "Domain",
      key: "domain",
      sortable: true,
      render: (row: DomainItem) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-xs">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
              <span className="text-slate-400 font-normal">{row.protocol}</span>
              <span>{row.domain}</span>
              {row.isPrimary ? (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700">
                  Primary
                </span>
              ) : (
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                  Alias
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{row.country} ({row.countryCode.toUpperCase()})</div>
          </div>
        </div>
      ),
    },
    {
      header: "Project & Client",
      key: "projectName",
      sortable: true,
      render: (row: DomainItem) => (
        <div>
          <Link
            href={`/projects/${row.domain}/overview`}
            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-500 flex items-center gap-1"
          >
            <span>{row.projectName}</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            <Building2 className="w-3 h-3" />
            <span>{row.clientName}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      sortable: true,
      render: (row: DomainItem) => <StatusBadge status={row.status} />,
    },
    {
      header: "SEO Scope",
      key: "keywordsCount",
      render: (row: DomainItem) => (
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
          <div><strong className="text-slate-900 dark:text-slate-100">{row.keywordsCount}</strong> keywords tracked</div>
          <div className="text-[11px] text-slate-400">{row.auditPagesCount} audited pages · {row.backlinksCount} backlinks</div>
        </div>
      ),
    },
    {
      header: "Owner",
      key: "ownerEmail",
      sortable: true,
      render: (row: DomainItem) => <span className="text-xs text-slate-500 font-mono">{row.ownerEmail}</span>,
    },
  ];

  if (isLoading && domains.length === 0) {
    return <SkeletonLoader type="table" />;
  }

  if (fetchError && domains.length === 0) {
    return <ErrorState message={fetchError} onRetry={fetchDomains} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-indigo-500" />
            <span>Consolidated Domain Portfolio</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global index of primary website domains, brand aliases, and multi-region project properties.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDomains}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Secondary Domain</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Domains</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{domains.length}</div>
          <div className="text-xs text-slate-400 mt-1">Across all client accounts</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Domains</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{primaryCount}</div>
          <div className="text-xs text-slate-400 mt-1">Main project root hosts</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Secondary Aliases</span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{secondaryCount}</div>
          <div className="text-xs text-slate-400 mt-1">Subdomains & international ccTLDs</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SSL / HTTPS Enforced</span>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">100%</div>
          <div className="text-xs text-slate-400 mt-1">All live crawled properties</div>
        </div>
      </div>

      {/* Table & Filters */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by domain, project or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          totalCount={filtered.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={(col, dir) => {
            setSortBy(col);
            setSortDir(dir);
          }}
          isLoading={isLoading}
          exportFilename="domains-portfolio.csv"
        />
      </div>

      {/* Add Secondary Domain Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                <span>Add Secondary Project Domain</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Parent Project
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  required
                >
                  <option value="">Select a project...</option>
                  {domains.filter((d) => d.isPrimary).map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.projectName} ({p.domain})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Secondary Domain / Host
                </label>
                <input
                  type="text"
                  placeholder="e.g. blog.example.com or example.de"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPrimaryCheck"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isPrimaryCheck" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  Set as primary root domain for this project
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add Domain"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
