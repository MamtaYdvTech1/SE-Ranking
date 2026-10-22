"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Key,
  Trash2,
  Copy,
  ExternalLink,
  Lock,
  Check,
  X,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import { SkeletonLoader } from "@/components/admin/ui/SkeletonLoader";
import { ErrorState } from "@/components/admin/ui/ErrorState";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  version: number;
  canCreateProject: boolean;
  canCreateClient: boolean;
  assignedProjectsCount: number;
  activeSessionsCount: number;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<"users" | "permissions">("users");

  // Users data state
  const [users, setUsers] = useState<UserItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Dialogs
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "SEO_USER" | "CLIENT">("SEO_USER");
  const [inviteCanCreateProject, setInviteCanCreateProject] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<Array<{ id: string; name: string; domain: string }>>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);

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

  const [isPurging, setIsPurging] = useState(false);

  const handlePurgeTestUsers = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all synthetic test users and demo accounts from the database?")) {
      return;
    }
    setIsPurging(true);
    try {
      const res = await fetch("/api/admin/maintenance/purge-fake-data", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to purge fake users");
      }
      success(json.message || "All synthetic users and test accounts permanently purged.");
      fetchUsers();
    } catch (err: any) {
      error("Purge failed: " + err.message);
    } finally {
      setIsPurging(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const q = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        role: roleFilter,
        status: statusFilter,
        sortBy,
        sortDir,
      });

      const res = await fetch(`/api/admin/users?${q.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.data.items);
      setTotalCount(data.data.totalCount);
    } catch (err: any) {
      setFetchError(err?.message || "Failed to load users list.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, roleFilter, statusFilter, sortBy, sortDir]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Handle Role/Status Toggle
  const handleUpdateUserStatus = async (user: UserItem, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          version: user.version,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      success(`User status updated to ${newStatus}.`, () => {
        // Undo callback
        handleUpdateUserStatus(user, user.status);
      });
      fetchUsers();
    } catch (err: any) {
      error(err?.message || "Action failed.");
    }
  };

  const handleUpdateUserRole = async (user: UserItem, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: newRole,
          version: user.version,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      success(`User role updated to ${newRole}.`);
      fetchUsers();
    } catch (err: any) {
      error(err?.message || "Action failed.");
    }
  };

  const handleToggleExtraPermission = async (user: UserItem, field: "canCreateProject" | "canCreateClient") => {
    try {
      const newValue = !user[field];
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [field]: newValue,
          version: user.version,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update permission");
      }

      success(`Updated permission for ${user.email}.`);
      fetchUsers();
    } catch (err: any) {
      error(err?.message || "Permission update failed.");
    }
  };

  const handleSoftDelete = (user: UserItem) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete user ${user.email}?`,
      description:
        "This user will be soft-deleted and all their active sessions will be terminated immediately. Their historical audit logs will be preserved.",
      action: async () => {
        try {
          const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to delete user");

          success(`User ${user.email} soft-deleted.`);
          fetchUsers();
        } catch (err: any) {
          error(err?.message || "Deletion failed.");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const fetchAvailableProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/projects?pageSize=100");
      const data = await res.json();
      if (res.ok && data.data?.items) {
        setAvailableProjects(
          data.data.items.map((p: any) => ({
            id: p.id,
            name: p.name,
            domain: p.domain,
          }))
        );
      }
    } catch {
      // Non-fatal
    }
  }, []);

  useEffect(() => {
    fetchAvailableProjects();
  }, [fetchAvailableProjects]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setGeneratedInviteLink(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName || undefined,
          role: inviteRole,
          canCreateProject: inviteCanCreateProject,
          projectIds: selectedProjectIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      success(data.message || "Invitation created successfully!");
      if (data.data?.inviteLink) {
        setGeneratedInviteLink(data.data.inviteLink);
      } else {
        setIsInviteModalOpen(false);
        setInviteEmail("");
        setInviteName("");
        setSelectedProjectIds([]);
      }
      fetchUsers();
    } catch (err: any) {
      error(err?.message || "Invite failed");
    } finally {
      setIsInviting(false);
    }
  };

  // Columns definition
  const columns: Column<UserItem>[] = [
    {
      key: "name",
      header: "User & Email",
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center font-bold text-xs text-emerald-600 dark:text-emerald-400">
            {u.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <Link
              href={`/admin/users/${u.id}`}
              className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <span>{u.name}</span>
            </Link>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{u.email}</div>
          </div>
        </div>
      ),
      exportValue: (u) => `${u.name} (${u.email})`,
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${
              u.role === "ADMIN" || u.role === "OWNER" || u.role === "SUPERADMIN"
                ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                : u.role === "CLIENT"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            {u.role}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: "assignedProjectsCount",
      header: "Assigned Projects",
      render: (u) => (
        <span className="text-slate-800 dark:text-slate-200 font-semibold">
          {u.assignedProjectsCount} {u.assignedProjectsCount === 1 ? "project" : "projects"}
        </span>
      ),
    },
    {
      key: "lastLoginAt",
      header: "Last Login",
      sortable: true,
      render: (u) => (
        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created Date",
      sortable: true,
      render: (u) => (
        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (u) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/admin/users/${u.id}`}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700/80 transition-colors shadow-xs"
            title="View Details"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Quick Approval / Rejection / Suspension Controls */}
          {u.status === "pending" && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleUpdateUserStatus(u, "active")}
                className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Approve User Registration"
              >
                <Check className="w-3 h-3" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleUpdateUserStatus(u, "rejected")}
                className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Reject Registration"
              >
                <X className="w-3 h-3" />
                <span>Reject</span>
              </button>
            </div>
          )}

          {u.status === "active" && (
            <>
              <button
                onClick={() => handleUpdateUserStatus(u, "suspended")}
                className="p-1 rounded bg-slate-800/80 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                title="Suspend User & Revoke Sessions"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleUpdateUserStatus(u, "deactivated")}
                className="p-1 rounded bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Deactivate Account"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {(u.status === "suspended" || u.status === "rejected" || u.status === "deactivated") && (
            <button
              onClick={() => handleUpdateUserStatus(u, "active")}
              className="p-1 rounded bg-slate-800/80 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              title="Reactivate Account"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete User */}
          <button
            onClick={() => handleSoftDelete(u)}
            className="p-1 rounded bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="Delete User"
          >
            <Trash2 className="w-3.5 h-3.5" />
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
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Users & Access Governance
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage company administrators, SEO team members, pending registrations, and granular per-user permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all cursor-pointer shadow-xs"
            title="Refresh Users"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handlePurgeTestUsers}
            disabled={isPurging}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Purge Test Users"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>{isPurging ? "Purging..." : "Purge Test Users"}</span>
          </button>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-950/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite User</span>
          </button>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab("users");
            setStatusFilter("");
            setPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === "users" && !statusFilter
              ? "bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-500" />
          <span>All Users</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("users");
            setStatusFilter("pending");
            setPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === "users" && statusFilter === "pending"
              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs"
              : "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Pending Approval</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("users");
            setStatusFilter("active");
            setPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === "users" && statusFilter === "active"
              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-xs"
              : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Active</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("users");
            setStatusFilter("suspended");
            setPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === "users" && statusFilter === "suspended"
              ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 shadow-xs"
              : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span>Suspended</span>
        </button>

        <button
          onClick={() => setActiveTab("permissions")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === "permissions"
              ? "bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-violet-500" />
          <span>Permissions Matrix</span>
        </button>
      </div>

      {/* Tab 1: All Users */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {fetchError ? (
            <ErrorState title="Failed to load users" message={fetchError} onRetry={fetchUsers} />
          ) : (
            <DataTable
              columns={columns}
              data={users}
              totalCount={totalCount}
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
              selectable
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              exportFilename="se-ranking-users.csv"
              filterControls={
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search name or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">All Roles</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SEO_USER">SEO_USER</option>
                    <option value="CLIENT">CLIENT</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="invited">Invited</option>
                    <option value="pending">Pending Approval</option>
                    <option value="suspended">Suspended</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </div>
              }
              bulkActions={
                <button
                  onClick={() => {
                    info(`Bulk selected: ${selectedIds.length} users`);
                  }}
                  className="hover:underline font-semibold"
                >
                  Action on {selectedIds.length}
                </button>
              }
            />
          )}
        </div>
      )}

      {/* Tab 2: Permissions Matrix (PDF Section 3 Specification) */}
      {activeTab === "permissions" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                Official PDF Section 3 Roles & Access Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforced server-side across every route handler and database mutation. SEO Users are strictly quarantined to assigned projects.
            </p>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-950/80 text-slate-300 uppercase text-[11px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Platform Capability</th>
                    <th className="px-4 py-3 text-emerald-400">Admin Role</th>
                    <th className="px-4 py-3 text-amber-400">SEO User Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Manage users and roles</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold">Yes</td>
                    <td className="px-4 py-2.5 text-slate-500">No</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">View all clients / projects</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold">Yes</td>
                    <td className="px-4 py-2.5 text-slate-500">No; Assigned projects only</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Create client / project</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold">Yes</td>
                    <td className="px-4 py-2.5 text-amber-400">Only if explicitly granted</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Assign team members</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold">Yes</td>
                    <td className="px-4 py-2.5 text-slate-500">No by default</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Run audit / research on assigned project</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold">Yes</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold">Yes, within quotas</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Manage global API credentials</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold">Yes</td>
                    <td className="px-4 py-2.5 text-slate-500">No</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">View platform-wide spend / usage</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold">Yes</td>
                    <td className="px-4 py-2.5 text-slate-500">No</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Create project reports</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold">Yes</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold">Yes, assigned projects</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">Change global settings & schedules</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold">Yes</td>
                    <td className="px-4 py-2.5 text-slate-500">No</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium">View admin audit logs</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold">Yes</td>
                    <td className="px-4 py-2.5 text-slate-500">No by default</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Per-user Extra Permission Grant Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100">
              Per-User Special Permissions ("Can create client/project" overrides)
            </h3>
            <p className="text-xs text-slate-400">
              Grant exceptional creation rights to trusted SEO users without promoting them to full Admins.
            </p>

            <div className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.email} ({u.role})</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleExtraPermission(u, "canCreateProject")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        u.canCreateProject
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {u.canCreateProject ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Can Create Projects</span>
                    </button>

                    <button
                      onClick={() => handleToggleExtraPermission(u, "canCreateClient")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        u.canCreateClient
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {u.canCreateClient ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Can Create Clients</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              <span>Invite New User</span>
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Generates a secure, expiring one-time link. If SMTP/Resend is configured, an automated email will be sent.
            </p>

            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@agency.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Alex Morgan"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role Assignment *</label>
                <select
                  value={inviteRole}
                  onChange={(e: any) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="SEO_USER">SEO_USER (Assigned projects only)</option>
                  <option value="ADMIN">ADMIN (Full administrative access)</option>
                  <option value="CLIENT">CLIENT (View-only client portal)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="canCreateProject"
                  checked={inviteCanCreateProject}
                  onChange={(e) => setInviteCanCreateProject(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/40 bg-slate-950"
                />
                <label htmlFor="canCreateProject" className="text-xs text-slate-300 cursor-pointer">
                  Grant permission to create new projects
                </label>
              </div>

              {/* Project Assignments */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-slate-200">
                  Assign Projects (User will only access selected projects)
                </label>
                <p className="text-[11px] text-slate-400">
                  Per PDF access policy, SEO users can only view and manage assigned projects.
                </p>
                <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-2 space-y-1">
                  {availableProjects.length === 0 ? (
                    <div className="text-[11px] text-slate-500 py-1 px-2">
                      No projects available. You can assign projects later.
                    </div>
                  ) : (
                    availableProjects.map((proj) => {
                      const isChecked = selectedProjectIds.includes(proj.id);
                      return (
                        <label
                          key={proj.id}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                            isChecked
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "hover:bg-slate-900 text-slate-300"
                          }`}
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="font-medium truncate">{proj.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono truncate">{proj.domain}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProjectIds([...selectedProjectIds, proj.id]);
                              } else {
                                setSelectedProjectIds(selectedProjectIds.filter((id) => id !== proj.id));
                              }
                            }}
                            className="w-4 h-4 rounded text-emerald-600 border-slate-700 bg-slate-900 focus:ring-emerald-500 shrink-0"
                          />
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Generated Link Box if email not configured */}
              {generatedInviteLink && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="text-[11px] font-semibold text-emerald-400">
                    Invitation Created! Copy and send this one-time link:
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedInviteLink}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedInviteLink);
                        success("Invite link copied to clipboard!");
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsInviteModalOpen(false);
                    setGeneratedInviteLink(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Close
                </button>
                {!generatedInviteLink && (
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-950/30"
                  >
                    {isInviting ? "Creating..." : "Generate Invitation"}
                  </button>
                )}
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
