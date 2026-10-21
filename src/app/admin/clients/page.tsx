"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Archive,
  RefreshCw,
  FolderKanban,
  Mail,
  Phone,
  CheckCircle2,
  ChevronRight,
  Globe,
  Layers,
  ArrowRight,
} from "lucide-react";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import { SkeletonLoader } from "@/components/admin/ui/SkeletonLoader";
import { ErrorState } from "@/components/admin/ui/ErrorState";

interface ClientItem {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  notes: string;
  projectsCount: number;
  projects?: Array<{
    id: string;
    name: string;
    domain: string;
    status: string;
  }>;
  createdAt: string;
}

export default function AdminClientsPage() {
  const { success, error } = useToast();

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Create/Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Array<{ id: string; name: string; domain: string }>>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm dialog
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

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const q = new URLSearchParams({ search, status: statusFilter });
      const res = await fetch(`/api/admin/clients?${q.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load clients");

      setClients(data.data || []);
    } catch (err: any) {
      setFetchError(err?.message || "Failed to fetch clients.");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchClients]);

  const loadProjectsForModal = async () => {
    setIsLoadingProjects(true);
    try {
      const res = await fetch("/api/admin/projects?pageSize=100");
      const data = await res.json();
      if (res.ok && data.data) {
        setAvailableProjects(data.data.map((p: any) => ({ id: p.id, name: p.name, domain: p.domain })));
      }
    } catch {
      // non-blocking
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setName("");
    setCompany("");
    setEmail("");
    setPhone("");
    setNotes("");
    setSelectedProjectIds([]);
    setIsModalOpen(true);
    loadProjectsForModal();
  };

  const openEditModal = (client: ClientItem) => {
    setEditingClient(client);
    setName(client.name);
    setCompany(client.company === "—" ? "" : client.company);
    setEmail(client.email === "—" ? "" : client.email);
    setPhone(client.phone === "—" ? "" : client.phone);
    setNotes(client.notes || "");
    setSelectedProjectIds(client.projects?.map((p) => p.id) || []);
    setIsModalOpen(true);
    loadProjectsForModal();
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingClient ? `/api/admin/clients/${editingClient.id}` : "/api/admin/clients";
      const method = editingClient ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          email,
          phone,
          notes,
          projectIds: selectedProjectIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save client");

      success(editingClient ? "Client updated successfully!" : "Client created successfully!");
      setIsModalOpen(false);
      fetchClients();
    } catch (err: any) {
      error(err?.message || "Action failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveToggle = (client: ClientItem) => {
    const isArchived = client.status === "archived";
    const nextStatus = isArchived ? "active" : "archived";

    setConfirmDialog({
      isOpen: true,
      title: `${isArchived ? "Restore" : "Archive"} client ${client.name}?`,
      description: isArchived
        ? "Restoring will make this client and its projects visible in standard workspaces."
        : "Archiving hides the client from the active list. No project or keyword data will be deleted.",
      action: async () => {
        try {
          const res = await fetch(`/api/admin/clients/${client.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to toggle archive status");

          success(`Client ${isArchived ? "restored" : "archived"}.`);
          fetchClients();
        } catch (err: any) {
          error(err?.message || "Failed to update status");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const columns: Column<ClientItem>[] = [
    {
      key: "name",
      header: "Client & Company",
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/clients/${c.id}`}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600/10 to-indigo-600/15 dark:bg-violet-950/40 border border-violet-500/20 flex items-center justify-center font-bold text-xs text-violet-700 dark:text-violet-300 flex-shrink-0 hover:scale-105 transition-transform"
          >
            {c.name.charAt(0).toUpperCase()}
          </Link>
          <div>
            <Link
              href={`/admin/clients/${c.id}`}
              className="font-bold text-slate-900 dark:text-slate-100 hover:text-violet-600 dark:hover:text-violet-400 hover:underline flex items-center gap-1.5 transition-colors"
            >
              <span>{c.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">{c.company}</div>
          </div>
        </div>
      ),
      exportValue: (c) => `${c.name} - ${c.company}`,
    },
    {
      key: "contact",
      header: "Contact Details",
      render: (c) => (
        <div className="space-y-0.5 text-[11px]">
          <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono">
            <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <a
              href={`mailto:${c.email}`}
              className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
              title={`Send email to ${c.email}`}
            >
              {c.email}
            </a>
          </div>
          {c.phone && c.phone !== "—" && (
            <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
              <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>{c.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "projectsCount",
      header: "Active Projects",
      render: (c) => {
        const hasProjects = c.projects && c.projects.length > 0;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <FolderKanban className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{c.projectsCount} Project{c.projectsCount !== 1 ? "s" : ""}</span>
            </div>
            {hasProjects && (
              <div className="flex flex-wrap items-center gap-1">
                {c.projects?.slice(0, 2).map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:underline"
                  >
                    {p.domain}
                  </Link>
                ))}
                {(c.projects?.length || 0) > 2 && (
                  <Link
                    href={`/admin/clients/${c.id}`}
                    className="text-[10px] text-slate-400 hover:text-violet-500 font-semibold"
                  >
                    +{c.projects!.length - 2} more
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "createdAt",
      header: "Added Date",
      render: (c) => (
        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
          {new Date(c.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/admin/clients/${c.id}`}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800/80 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 border border-slate-200 dark:border-slate-700/80 transition-colors shadow-2xs"
            title="Manage Client & Projects"
          >
            <FolderKanban className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => openEditModal(c)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700/80 transition-colors shadow-2xs cursor-pointer"
            title="Edit Client"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleArchiveToggle(c)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800/80 hover:bg-amber-500/10 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700/80 transition-colors shadow-2xs cursor-pointer"
            title={c.status === "archived" ? "Restore Client" : "Archive Client"}
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
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Clients & Workspaces</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              {clients.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal leading-relaxed">
            Enterprise multi-tenant client entities, agency customer profiles, and connected real projects.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Main Content */}
      {fetchError ? (
        <ErrorState title="Failed to load clients" message={fetchError} onRetry={fetchClients} />
      ) : (
        <DataTable
          columns={columns}
          data={clients}
          totalCount={clients.length}
          page={1}
          pageSize={50}
          onPageChange={() => {}}
          isLoading={isLoading}
          exportFilename="se-ranking-clients.csv"
          filterControls={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search clients..."
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
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          }
        />
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-violet-500" />
              <span>{editingClient ? "Edit Client" : "Create New Client"}</span>
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Client / Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Acme Growth Corp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Organization</label>
                <input
                  type="text"
                  placeholder="Acme Global Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="contact@acme.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Assign Projects to this Client */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Real Projects ({selectedProjectIds.length} Selected)
                </label>
                {isLoadingProjects ? (
                  <div className="py-3 text-center text-xs text-slate-400">Loading projects...</div>
                ) : (
                  <div className="max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    {availableProjects.length === 0 ? (
                      <div className="text-[11px] text-slate-400 p-2 text-center">No platform projects found</div>
                    ) : (
                      availableProjects.map((p) => {
                        const isSelected = selectedProjectIds.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => toggleProjectSelection(p.id)}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition ${
                              isSelected
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <div>
                              <div className="font-semibold">{p.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{p.domain}</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Client objectives, key account manager notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  {isSubmitting ? "Saving..." : editingClient ? "Update Client" : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Confirm"
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
