"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Search,
  ExternalLink,
  Plus,
  RefreshCw,
  Edit,
  Archive,
  Globe,
  Users,
  Building2,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle,
} from "lucide-react";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import { SkeletonLoader } from "@/components/admin/ui/SkeletonLoader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { normalizeDomain } from "@/lib/projectUtils";

interface ProjectItem {
  id: string;
  name: string;
  domain: string;
  status: string;
  country: string;
  languageCode: string;
  defaultSearchEngine: string;
  rankingFrequency: string;
  createdAt: string;
  client?: {
    id: string;
    name: string;
    company: string | null;
  } | null;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  } | null;
  members: Array<{
    id: string;
    role: string;
    user: { id: string; name: string | null; email: string };
  }>;
  _count: {
    keywords: number;
    auditPages: number;
    auditIssues: number;
    backlinks: number;
  };
}

export default function AdminProjectsPage() {
  const { success, error, info } = useToast();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Available clients & users for wizard & filters
  const [availableClients, setAvailableClients] = useState<Array<{ id: string; name: string }>>([]);
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);

  // Setup Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardDraft, setWizardDraft] = useState({
    clientId: "",
    domain: "",
    name: "",
    country: "United States",
    countryCode: "us",
    languageCode: "en",
    defaultSearchEngine: "google",
    defaultDevice: "desktop",
    userId: "",
    competitors: [] as string[],
    newCompetitorInput: "",
    rankingFrequency: "Daily",
  });
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [wizardError, setWizardError] = useState<string | null>(null);

  // Archive confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: async () => {},
  });

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const q = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        status: statusFilter,
        clientId: clientFilter,
      });

      const res = await fetch(`/api/admin/projects?${q.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load projects");

      setProjects(data.data.items || []);
      setTotalCount(data.data.totalCount || 0);
    } catch (err: any) {
      setFetchError(err?.message || "Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter, clientFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Load clients & users for dropdowns
  useEffect(() => {
    async function loadAux() {
      try {
        const [cRes, uRes] = await Promise.all([
          fetch("/api/admin/clients"),
          fetch("/api/admin/users?pageSize=100"),
        ]);
        const [cData, uData] = await Promise.all([cRes.json(), uRes.json()]);

        if (cData.data) {
          setAvailableClients(cData.data.map((c: any) => ({ id: c.id, name: c.name })));
        }
        if (uData.data?.items) {
          setAvailableUsers(
            uData.data.items.map((u: any) => ({ id: u.id, name: u.name, email: u.email }))
          );
        }
      } catch {}
    }
    loadAux();
  }, []);

  // Wizard localStorage draft restore
  useEffect(() => {
    try {
      const saved = localStorage.getItem("se_admin_project_wizard_draft");
      if (saved) {
        setWizardDraft((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {}
  }, []);

  const updateDraft = (updates: Partial<typeof wizardDraft>) => {
    setWizardDraft((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem("se_admin_project_wizard_draft", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleArchiveToggle = (project: ProjectItem) => {
    const isArchived = project.status === "Archived";
    setConfirmDialog({
      isOpen: true,
      title: `${isArchived ? "Restore" : "Archive"} project ${project.name}?`,
      description: isArchived
        ? "Restoring will make this project active and tracked again."
        : "Archiving stops background crawls and hides it from standard workspace views. No historical data is deleted.",
      action: async () => {
        try {
          const res = await fetch(`/api/admin/projects/${project.id}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to toggle archive state");

          success(data.message || "Project status updated.");
          fetchProjects();
        } catch (err: any) {
          error(err?.message || "Action failed");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Step Validation
  const validateCurrentStep = (): boolean => {
    setWizardError(null);
    if (wizardStep === 2) {
      if (!wizardDraft.domain.trim()) {
        setWizardError("Primary domain is required.");
        return false;
      }
      const clean = normalizeDomain(wizardDraft.domain);
      if (!clean || clean.length < 3) {
        setWizardError("Please enter a valid domain (e.g. example.com).");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setWizardStep((s) => Math.min(7, s + 1));
    }
  };

  const handleAddCompetitor = () => {
    if (!wizardDraft.newCompetitorInput.trim()) return;
    const clean = normalizeDomain(wizardDraft.newCompetitorInput);
    if (clean && !wizardDraft.competitors.includes(clean)) {
      updateDraft({
        competitors: [...wizardDraft.competitors, clean],
        newCompetitorInput: "",
      });
    }
  };

  const handleRemoveCompetitor = (comp: string) => {
    updateDraft({
      competitors: wizardDraft.competitors.filter((c) => c !== comp),
    });
  };

  const handleWizardSubmit = async () => {
    setIsCreatingProject(true);
    setWizardError(null);
    try {
      const cleanDomain = normalizeDomain(wizardDraft.domain);
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: wizardDraft.name || cleanDomain,
          domain: cleanDomain,
          clientId: wizardDraft.clientId || undefined,
          country: wizardDraft.country,
          countryCode: wizardDraft.countryCode,
          languageCode: wizardDraft.languageCode,
          defaultSearchEngine: wizardDraft.defaultSearchEngine,
          defaultDevice: wizardDraft.defaultDevice,
          userId: wizardDraft.userId || undefined,
          competitors: wizardDraft.competitors,
          rankingFrequency: wizardDraft.rankingFrequency,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create project");
      }

      success(`Project "${data.data.name}" created successfully!`);
      localStorage.removeItem("se_admin_project_wizard_draft");
      setIsWizardOpen(false);
      setWizardStep(1);
      fetchProjects();
    } catch (err: any) {
      setWizardError(err?.message || "Failed to create project");
      error(err?.message || "Creation failed");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const columns: Column<ProjectItem>[] = [
    {
      key: "name",
      header: "Project & Domain",
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <Link
              href={`/admin/projects/${p.id}`}
              className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <span>{p.name}</span>
            </Link>
            <div className="mt-0.5">
              <a
                href={p.domain?.startsWith("http") ? p.domain : `https://${p.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-mono hover:underline group/domain"
                title={`Open & preview ${p.domain} in a new tab`}
              >
                <span>{p.domain}</span>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover/domain:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </div>
      ),
      exportValue: (p) => `${p.name} (${p.domain})`,
    },
    {
      key: "client",
      header: "Client Entity",
      render: (p) => (
        <div className="text-xs">
          {p.client ? (
            <div className="font-semibold text-slate-800 dark:text-slate-200">{p.client.name}</div>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 italic">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: "owner",
      header: "SEO Owner",
      render: (p) => (
        <div className="text-xs">
          {p.user ? (
            <div className="text-slate-700 dark:text-slate-300 font-medium">{p.user.name || p.user.email}</div>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 italic">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: "metrics",
      header: "Tracked Entities",
      render: (p) => (
        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>
            <strong className="text-slate-900 dark:text-slate-200 font-bold">{p._count.keywords}</strong> kw
          </span>
          <span>
            <strong className="text-slate-900 dark:text-slate-200 font-bold">{p._count.auditPages}</strong> pages
          </span>
          <span>
            <strong className="text-slate-900 dark:text-slate-200 font-bold">{p._count.backlinks}</strong> bl
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/admin/projects/${p.id}`}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700/80 transition-colors shadow-xs"
            title="View Project Control Center"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => handleArchiveToggle(p)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-500/20 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700/80 transition-colors shadow-xs cursor-pointer"
            title={p.status === "Archived" ? "Restore Project" : "Archive Project"}
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Projects & Domains
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal leading-relaxed">
            Global search properties, domain normalization, multi-tenant client links, and team ownership.
          </p>
        </div>

        <button
          onClick={() => {
            setWizardStep(1);
            setIsWizardOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-lg shadow-emerald-950/30"
        >
          <Plus className="w-4 h-4" />
          <span>Project Setup Wizard</span>
        </button>
      </div>

      {/* Main Table */}
      {fetchError ? (
        <ErrorState title="Failed to load projects" message={fetchError} onRetry={fetchProjects} />
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          isLoading={isLoading}
          exportFilename="se-ranking-projects.csv"
          filterControls={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search project or domain..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Archived">Archived</option>
              </select>

              {availableClients.length > 0 && (
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                >
                  <option value="">All Clients</option>
                  {availableClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          }
        />
      )}

      {/* Multi-Step Project Setup Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
            {/* Top Wizard Steps Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-emerald-400" />
                  <span>Project Setup Wizard</span>
                </h3>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Step {wizardStep} of 7:{" "}
                  {
                    [
                      "Client Entity",
                      "Domain & Name",
                      "Country & Language",
                      "Search Engine & Device",
                      "SEO Owner Assignment",
                      "Competitors",
                      "Audit & Ranking Schedule",
                    ][wizardStep - 1]
                  }
                </div>
              </div>

              <button
                onClick={() => setIsWizardOpen(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full my-4 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(wizardStep / 7) * 100}%` }}
              />
            </div>

            {/* Error Message */}
            {wizardError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{wizardError}</span>
              </div>
            )}

            {/* Step Body */}
            <div className="min-h-[220px] py-2">
              {/* Step 1: Client Selection */}
              {wizardStep === 1 && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-200">
                    Assign to Client / Workspace (Optional)
                  </label>
                  <p className="text-xs text-slate-400">
                    Select which enterprise client owns this project, or keep unassigned for agency-wide access.
                  </p>
                  <select
                    value={wizardDraft.clientId}
                    onChange={(e) => updateDraft({ clientId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">No Client (Internal Agency Project)</option>
                    {availableClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Step 2: Domain Input & Normalization */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Website Domain *
                    </label>
                    <p className="text-xs text-slate-400 mb-2">
                      Enter any URL format (e.g. <code>https://www.example.com/</code>). The system automatically normalizes protocol, www, and trailing slashes.
                    </p>
                    <input
                      type="text"
                      placeholder="https://www.workcomposer.com/"
                      value={wizardDraft.domain}
                      onChange={(e) => updateDraft({ domain: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                    {wizardDraft.domain && (
                      <div className="mt-2 text-[11px] text-emerald-400 font-mono">
                        Normalized Domain: <strong>{normalizeDomain(wizardDraft.domain)}</strong>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Project Display Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Leave blank to use normalized domain"
                      value={wizardDraft.name}
                      onChange={(e) => updateDraft({ name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Country & Language */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">Target Country</label>
                    <select
                      value={wizardDraft.country}
                      onChange={(e) => {
                        const val = e.target.value;
                        const codeMap: Record<string, string> = {
                          "United States": "us",
                          India: "in",
                          "United Kingdom": "gb",
                          Germany: "de",
                          France: "fr",
                          Canada: "ca",
                          Australia: "au",
                        };
                        updateDraft({ country: val, countryCode: codeMap[val] || "us" });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="United States">United States (us)</option>
                      <option value="India">India (in)</option>
                      <option value="United Kingdom">United Kingdom (gb)</option>
                      <option value="Germany">Germany (de)</option>
                      <option value="Canada">Canada (ca)</option>
                      <option value="Australia">Australia (au)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">Language</label>
                    <select
                      value={wizardDraft.languageCode}
                      onChange={(e) => updateDraft({ languageCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="en">English (en)</option>
                      <option value="hi">Hindi (hi)</option>
                      <option value="de">German (de)</option>
                      <option value="fr">French (fr)</option>
                      <option value="es">Spanish (es)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 4: Search Engine & Device */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">Default Search Engine</label>
                    <select
                      value={wizardDraft.defaultSearchEngine}
                      onChange={(e) => updateDraft({ defaultSearchEngine: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="google">Google Search</option>
                      <option value="google-ai">Google AI Overview / SGE</option>
                      <option value="bing">Bing Search</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">Default Device Type</label>
                    <select
                      value={wizardDraft.defaultDevice}
                      onChange={(e) => updateDraft({ defaultDevice: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="desktop">Desktop</option>
                      <option value="mobile">Mobile (Smartphone)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 5: SEO Owner */}
              {wizardStep === 5 && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-200">
                    Lead SEO Owner Assignment
                  </label>
                  <p className="text-xs text-slate-400">
                    Per PDF Section 3 rules, standard SEO users can only access projects explicitly assigned to them.
                  </p>
                  <select
                    value={wizardDraft.userId}
                    onChange={(e) => updateDraft({ userId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Current Administrator</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Step 6: Competitors */}
              {wizardStep === 6 && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-200">
                    Competitor Tracking (Optional)
                  </label>
                  <p className="text-xs text-slate-400">
                    Add top rival domains to reverse-engineer their keywords, share of voice, and backlinks.
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="competitor.com"
                      value={wizardDraft.newCompetitorInput}
                      onChange={(e) => updateDraft({ newCompetitorInput: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCompetitor();
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddCompetitor}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-semibold transition"
                    >
                      Add
                    </button>
                  </div>

                  {wizardDraft.competitors.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {wizardDraft.competitors.map((comp) => (
                        <span
                          key={comp}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400"
                        >
                          <span>{comp}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCompetitor(comp)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 7: Audit & Rank Schedule */}
              {wizardStep === 7 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1">
                      Ranking Frequency Check
                    </label>
                    <select
                      value={wizardDraft.rankingFrequency}
                      onChange={(e) => updateDraft({ rankingFrequency: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Daily">Daily Automated Check (02:00 UTC)</option>
                      <option value="Weekly">Weekly (Every Monday)</option>
                      <option value="Manual">Manual on demand only</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
                    <div className="font-semibold text-slate-200">Summary:</div>
                    <div className="text-slate-400">
                      Domain: <strong className="text-emerald-400">{normalizeDomain(wizardDraft.domain)}</strong>
                    </div>
                    <div className="text-slate-400">
                      Target: {wizardDraft.country} ({wizardDraft.languageCode}) • {wizardDraft.defaultSearchEngine}
                    </div>
                    <div className="text-slate-400">
                      Competitors: {wizardDraft.competitors.length} tracked
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setWizardStep((s) => Math.max(1, s - 1))}
                disabled={wizardStep === 1 || isCreatingProject}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 disabled:opacity-30 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {wizardStep < 7 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleWizardSubmit}
                    disabled={isCreatingProject}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-lg shadow-emerald-950/30"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isCreatingProject ? "Creating Project..." : "Launch Project"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.action}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
