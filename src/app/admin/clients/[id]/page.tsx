"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  FolderKanban,
  Mail,
  Phone,
  Calendar,
  FileText,
  Plus,
  Trash2,
  Archive,
  RefreshCw,
  ExternalLink,
  Edit2,
  CheckCircle2,
  XCircle,
  Globe,
  KeyRound,
  ShieldCheck,
  Search,
  Check,
  X,
  Layers,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { SkeletonLoader } from "@/components/admin/ui/SkeletonLoader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { useToast } from "@/components/admin/ui/Toast";

interface ClientDetail {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  projects: Array<{
    id: string;
    name: string;
    domain: string;
    status: string;
    keywordsCount: number;
    membersCount: number;
    issuesCount: number;
    createdAt: string;
  }>;
}

interface PlatformProject {
  id: string;
  name: string;
  domain: string;
  status: string;
  client?: { id: string; name: string } | null;
}

export default function AdminClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;
  const { success, error, info } = useToast();

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Project Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [platformProjects, setPlatformProjects] = useState<PlatformProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Confirm Dialog
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

  const fetchClient = useCallback(async () => {
    if (!clientId) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load client details");

      setClient(data.data);
      setEditName(data.data.name || "");
      setEditCompany(data.data.company || "");
      setEditEmail(data.data.email || "");
      setEditPhone(data.data.phone || "");
      setEditNotes(data.data.notes || "");
    } catch (err: any) {
      setFetchError(err?.message || "Failed to load client profile.");
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const fetchPlatformProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const res = await fetch("/api/admin/projects?pageSize=100");
      const data = await res.json();
      if (res.ok && data.data) {
        setPlatformProjects(data.data);
      }
    } catch {
      // non-blocking
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const openAssignModal = () => {
    setSelectedProjectId("");
    fetchPlatformProjects();
    setIsAssignModalOpen(true);
  };

  const handleAssignProject = async () => {
    if (!selectedProjectId || !client) return;
    setIsAssigning(true);
    try {
      const currentProjectIds = client.projects.map((p) => p.id);
      if (currentProjectIds.includes(selectedProjectId)) {
        info("This project is already connected to this client.");
        setIsAssignModalOpen(false);
        return;
      }

      const nextProjectIds = [...currentProjectIds, selectedProjectId];

      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds: nextProjectIds }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to link project to client");

      success("Project linked successfully!");
      setIsAssignModalOpen(false);
      fetchClient();
    } catch (err: any) {
      error(err?.message || "Failed to assign project.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnlinkProject = (projectId: string, projectName: string) => {
    if (!client) return;
    setConfirmDialog({
      isOpen: true,
      title: `Unlink ${projectName}?`,
      description: `This will detach the project from ${client.name}. The project and its keyword rankings will remain fully intact.`,
      action: async () => {
        try {
          const nextProjectIds = client.projects.filter((p) => p.id !== projectId).map((p) => p.id);
          const res = await fetch(`/api/admin/clients/${client.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectIds: nextProjectIds }),
          });

          if (!res.ok) throw new Error("Failed to unlink project");
          success(`Project ${projectName} unlinked.`);
          fetchClient();
        } catch (err: any) {
          error(err?.message || "Failed to unlink project");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    setIsSavingProfile(true);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          company: editCompany || null,
          email: editEmail || null,
          phone: editPhone || null,
          notes: editNotes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update client profile");

      success("Client profile updated successfully!");
      setIsEditModalOpen(false);
      fetchClient();
    } catch (err: any) {
      error(err?.message || "Failed to save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleArchiveToggle = () => {
    if (!client) return;
    const isArchived = client.status === "archived";
    const nextStatus = isArchived ? "active" : "archived";

    setConfirmDialog({
      isOpen: true,
      title: `${isArchived ? "Restore" : "Archive"} client ${client.name}?`,
      description: isArchived
        ? "Restoring this client will re-activate its status and make it visible in standard views."
        : "Archiving will hide the client from active lists. All project data and search histories will remain safe.",
      action: async () => {
        try {
          const res = await fetch(`/api/admin/clients/${client.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus }),
          });
          if (!res.ok) throw new Error("Failed to update status");

          success(`Client ${isArchived ? "restored" : "archived"} successfully.`);
          fetchClient();
        } catch (err: any) {
          error(err?.message || "Action failed");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDeleteClient = () => {
    if (!client) return;
    setConfirmDialog({
      isOpen: true,
      title: `Permanently delete ${client.name}?`,
      description:
        "This will permanently remove the client entity. Any connected projects will be detached and remain safe in the platform.",
      action: async () => {
        try {
          const res = await fetch(`/api/admin/clients/${client.id}?permanent=true`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to delete client");

          success(`Client ${client.name} permanently deleted.`);
          router.push("/admin/clients");
        } catch (err: any) {
          error(err?.message || "Failed to delete client");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  if (fetchError || !client) {
    return (
      <ErrorState
        title="Failed to load client details"
        message={fetchError || "Client record could not be found."}
        onRetry={fetchClient}
      />
    );
  }

  const totalKeywords = client.projects.reduce((acc, p) => acc + (p.keywordsCount || 0), 0);
  const totalAuditIssues = client.projects.reduce((acc, p) => acc + (p.issuesCount || 0), 0);
  const totalMembers = client.projects.reduce((acc, p) => acc + (p.membersCount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/clients"
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Client Management</div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>{client.name}</span>
              <StatusBadge status={client.status} />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-violet-500" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={handleArchiveToggle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5 text-amber-500" />
            <span>{client.status === "archived" ? "Restore" : "Archive"}</span>
          </button>
          <button
            onClick={handleDeleteClient}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 text-xs font-semibold text-rose-600 dark:text-rose-400 shadow-2xs transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Quick-Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Connected Projects</span>
            <FolderKanban className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{client.projects.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Enterprise tracked domains</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Keywords</span>
            <KeyRound className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalKeywords}</div>
          <div className="text-[11px] text-slate-400 mt-1">Live ranking positions</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Technical Audit Issues</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalAuditIssues}</div>
          <div className="text-[11px] text-slate-400 mt-1">Crawl health defects</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Assigned Team</span>
            <Globe className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalMembers}</div>
          <div className="text-[11px] text-slate-400 mt-1">Authorized specialists</div>
        </div>
      </div>

      {/* Client Profile Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building2 className="w-4 h-4 text-violet-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Identity & Contact
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="text-slate-400 text-[11px]">Company / Organization</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {client.company || "—"}
              </div>
            </div>

            <div>
              <div className="text-slate-400 text-[11px]">Primary Email</div>
              {client.email ? (
                <a
                  href={`mailto:${client.email}`}
                  className="font-medium text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{client.email}</span>
                </a>
              ) : (
                <span className="text-slate-500 font-normal">—</span>
              )}
            </div>

            <div>
              <div className="text-slate-400 text-[11px]">Phone</div>
              {client.phone ? (
                <a
                  href={`tel:${client.phone}`}
                  className="font-medium text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{client.phone}</span>
                </a>
              ) : (
                <span className="text-slate-500 font-normal">—</span>
              )}
            </div>

            <div>
              <div className="text-slate-400 text-[11px]">Created Date</div>
              <div className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(client.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Strategic Context */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Internal Account Notes
              </h3>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline font-semibold cursor-pointer"
            >
              Update notes
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed min-h-[90px]">
            {client.notes ? client.notes : <span className="text-slate-400 italic">No notes provided for this client. Click &quot;Update notes&quot; to add strategic goals, contract terms, or primary contact details.</span>}
          </div>
        </div>
      </div>

      {/* Connected Real Projects Section */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <FolderKanban className="w-4.5 h-4.5 text-emerald-500" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Connected Real Projects</h2>
              <p className="text-[11px] text-slate-500">
                SEO websites and tracking campaigns scoped under {client.name}.
              </p>
            </div>
          </div>

          <button
            onClick={openAssignModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Link Project</span>
          </button>
        </div>

        {client.projects.length === 0 ? (
          <div className="p-12 text-center space-y-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">No Projects Connected</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active SEO projects are assigned to this client yet. Link existing platform projects to begin tracking client performance.
              </p>
            </div>
            <button
              onClick={openAssignModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link First Project</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Project & Domain</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-center">Keywords</th>
                  <th className="py-2.5 px-4 text-center">Audit Defects</th>
                  <th className="py-2.5 px-4 text-center">Team Members</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {client.projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 uppercase text-xs">
                          {project.domain.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{project.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">{project.domain}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={project.status} />
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      {project.keywordsCount}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        project.issuesCount > 0 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {project.issuesCount} issues
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {project.membersCount}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 transition shadow-2xs"
                          title="Open Project Workspace"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleUnlinkProject(project.id, project.name)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700/80 transition shadow-2xs cursor-pointer"
                          title="Unlink Project"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-violet-500" />
              <span>Edit Client Profile</span>
            </h3>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Brand / Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Internal Notes</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Project Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-emerald-500" />
              <span>Link Platform Project</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select an existing real project from the enterprise platform to assign to {client.name}.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Project
                </label>
                {isLoadingProjects ? (
                  <div className="py-4 text-center text-xs text-slate-400">Loading platform projects...</div>
                ) : (
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">-- Choose a Project --</option>
                    {platformProjects
                      .filter((p) => !client.projects.some((cp) => cp.id === p.id))
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.domain}) {p.client ? `— Current: ${p.client.name}` : "— Unassigned"}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedProjectId || isAssigning}
                  onClick={handleAssignProject}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  {isAssigning ? "Linking..." : "Link to Client"}
                </button>
              </div>
            </div>
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
