"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FolderKanban,
  Globe,
  Users,
  Shield,
  Activity,
  Layers,
  Search,
  ExternalLink,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { SkeletonLoader } from "@/components/admin/ui/SkeletonLoader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { useToast } from "@/components/admin/ui/Toast";

interface ProjectDetail {
  id: string;
  name: string;
  domain: string;
  websiteUrl: string;
  country: string;
  countryCode: string;
  languageCode: string;
  defaultSearchEngine: string;
  defaultDevice: string;
  rankingFrequency: string;
  status: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string; company: string | null } | null;
  owner?: { id: string; name: string | null; email: string; role: string } | null;
  domains: Array<{ id: string; domain: string; isPrimary: boolean; createdAt: string }>;
  members: Array<{
    id: string;
    userId: string;
    role: string;
    canEdit: boolean;
    user: { id: string; name: string | null; email: string; role: string };
    createdAt: string;
  }>;
  competitors: Array<{ id: string; domain: string; name: string; createdAt: string }>;
  searchEngines: Array<{
    id: string;
    engine: string;
    country: string;
    device: string;
  }>;
  moduleCards: Array<{
    module: string;
    status: string;
    detail: string;
    lastUpdated: string | null;
  }>;
}

export default function AdminProjectDetailPage() {
  const params = useParams();
  const { success, error, info } = useToast();
  const projectId = params?.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Aux state for adding member
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("MEMBER");
  const [isAssigning, setIsAssigning] = useState(false);

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

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load project");

      setProject(data.data);
    } catch (err: any) {
      setFetchError(err?.message || "Failed to fetch project control center.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Load available users for member assignment
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/admin/users?pageSize=100");
        const data = await res.json();
        if (data.data?.items) {
          setAvailableUsers(data.data.items);
        }
      } catch {}
    }
    loadUsers();
  }, []);

  const handleAssignMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setIsAssigning(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          role: selectedRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign member");

      success(data.message || "Member assigned successfully!");
      setIsAddMemberOpen(false);
      setSelectedUserId("");
      fetchProject();
    } catch (err: any) {
      error(err?.message || "Assignment failed");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignMember = (memberUserId: string, userEmail: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `Revoke project access for ${userEmail}?`,
      description:
        "Access to this project and its SEO tools will be cut off immediately for this user.",
      action: async () => {
        try {
          const res = await fetch(`/api/admin/projects/${projectId}/members?userId=${memberUserId}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to unassign member");

          success("Member removed. Project access revoked immediately.");
          fetchProject();
        } catch (err: any) {
          error(err?.message || "Action failed");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="card" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
        </div>
      </div>
    );
  }

  if (fetchError || !project) {
    return (
      <ErrorState
        title="Project Not Found"
        message={fetchError || "Could not retrieve project."}
        onRetry={fetchProject}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Top Project Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-xl text-emerald-400">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-100">{project.name}</h1>
              <StatusBadge status={project.status} />
              {project.client && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  {project.client.name}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
              <span>{project.domain}</span>
              <a
                href={`https://${project.domain}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-emerald-400 transition"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Target: {project.country} ({project.languageCode}) • Engine: {project.defaultSearchEngine} (
              {project.defaultDevice}) • Schedule: {project.rankingFrequency}
            </div>
          </div>
        </div>

        {/* Right Info */}
        <div className="text-right">
          <div className="text-xs text-slate-400">Primary SEO Owner</div>
          <div className="text-xs font-semibold text-slate-200 mt-0.5">
            {project.owner?.name || project.owner?.email || "Unassigned"}
          </div>
        </div>
      </div>

      {/* 6 Module Status Cards (Real Data or 'Not connected') */}
      <div>
        <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>SEO Suite Modules Control Status</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {project.moduleCards.map((m) => {
            const isConnected =
              m.status === "Active" || m.status === "Active (Serper)" || m.status === "Configured";

            return (
              <div
                key={m.module}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-200">{m.module}</div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      isConnected
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{m.detail}</p>

                <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1 border-t border-slate-800/60">
                  <Clock className="w-3 h-3 text-slate-600" />
                  <span>
                    Last checked:{" "}
                    {m.lastUpdated ? new Date(m.lastUpdated).toLocaleString() : "Never / Not available"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column: Team Members & Competitors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assigned Team Members */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Users className="w-4 h-4 text-violet-400" />
              <span>Project Members & Permissions</span>
            </div>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-600/30 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Member</span>
            </button>
          </div>

          <div className="space-y-2">
            {project.members.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">No assigned members.</div>
            ) : (
              project.members.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{m.user.name || m.user.email}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{m.user.email}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {m.role}
                    </span>
                    <button
                      onClick={() => handleUnassignMember(m.userId, m.user.email)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                      title="Revoke access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tracked Competitors */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Tracked Competitor Domains ({project.competitors.length})</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {project.competitors.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">No competitors configured yet.</div>
            ) : (
              project.competitors.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300"
                >
                  <span>{c.domain}</span>
                  <span className="text-[10px] text-slate-500">
                    Added {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Assign User to Project</span>
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Select an existing user from the platform to grant access to this project.
            </p>

            <form onSubmit={handleAssignMember} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select User *</label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">-- Choose User --</option>
                  {availableUsers
                    .filter((u) => !project.members.some((m) => m.userId === u.id))
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Role *</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="MEMBER">MEMBER (Can view and run audits)</option>
                  <option value="ADMIN">ADMIN (Can manage project settings)</option>
                  <option value="VIEWER">VIEWER (Read-only access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning || !selectedUserId}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-950/30 disabled:opacity-40"
                >
                  {isAssigning ? "Assigning..." : "Assign Member"}
                </button>
              </div>
            </form>
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
