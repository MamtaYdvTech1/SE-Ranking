"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Shield,
  Clock,
  Laptop,
  FolderKanban,
  AlertTriangle,
  LogOut,
  Key,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Sparkles,
  Layers,
  Globe,
  Link2,
  Users2,
  FileText,
  Save,
  Check,
  X,
  ListOrdered,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { SkeletonLoader } from "@/components/admin/ui/SkeletonLoader";
import { ErrorState } from "@/components/admin/ui/ErrorState";
import { useToast } from "@/components/admin/ui/Toast";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  planTier?: string;
  toolPermissions?: Record<string, boolean> | null;
  usageLimits?: Record<string, number> | null;
  usageCurrent?: Record<string, number> | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  suspendedAt?: string | null;
  suspendedReason?: string | null;
  version: number;
  canCreateProject: boolean;
  canCreateClient: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  projects: Array<{
    id: string;
    name: string;
    domain: string;
    status: string;
    assignmentType: string;
  }>;
  activeSessions: Array<{
    id: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    expiresAt: string;
    isCurrent: boolean;
  }>;
  activityTimeline: Array<{
    id: string;
    action: string;
    entity: string;
    details: string | null;
    ipAddress: string;
    createdAt: string;
  }>;
}

const DEFAULT_TOOL_PERMISSIONS = {
  audits: true,
  rankings: true,
  keywords: true,
  backlinks: true,
  ai_visibility: true,
  competitor_research: true,
  reports: true,
};

const DEFAULT_QUOTAS = {
  maxProjects: 5,
  monthlyKeywords: 250,
  monthlyAuditPages: 500,
  monthlyBacklinkQueries: 100,
  monthlyAiQueries: 50,
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error, info } = useToast();
  const userId = params?.id as string;

  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Edit states
  const [selectedRole, setSelectedRole] = useState("SEO_USER");
  const [selectedPlan, setSelectedPlan] = useState("FREE_TRIAL");
  const [toolPerms, setToolPerms] = useState<Record<string, boolean>>(DEFAULT_TOOL_PERMISSIONS);
  const [quotaLimits, setQuotaLimits] = useState<Record<string, number>>(DEFAULT_QUOTAS);
  const [isUpdating, setIsUpdating] = useState(false);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant?: "danger" | "warning" | "primary";
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: async () => {},
  });

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load user details");
      }
      setUserDetail(data.data);
      setSelectedRole(data.data.role || "SEO_USER");
      setSelectedPlan(data.data.planTier || "FREE_TRIAL");
      setToolPerms(data.data.toolPermissions || DEFAULT_TOOL_PERMISSIONS);
      setQuotaLimits(data.data.usageLimits || DEFAULT_QUOTAS);
    } catch (err: any) {
      setFetchError(err?.message || "Failed to load user");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSaveGovernance = async () => {
    if (!userDetail) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          planTier: selectedPlan,
          toolPermissions: toolPerms,
          usageLimits: quotaLimits,
          version: userDetail.version,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save governance settings");

      success("User permissions and plan updated successfully!");
      fetchUser();
    } catch (err: any) {
      error(err?.message || "Failed to update governance settings.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApprove = async () => {
    if (!userDetail) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "active",
          version: userDetail.version,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");

      success(`User ${userDetail.email} has been approved.`);
      fetchUser();
    } catch (err: any) {
      error(err?.message || "Approval failed.");
    }
  };

  const handleRejectPrompt = () => {
    if (!userDetail) return;
    const reason = window.prompt("Enter rejection reason (visible to user):", "Registration does not meet platform requirements.");
    if (reason === null) return;

    setConfirmDialog({
      isOpen: true,
      title: `Reject registration for ${userDetail.email}?`,
      description: `This account will be marked as rejected with reason: "${reason}". The user cannot log in.`,
      variant: "danger",
      action: async () => {
        try {
          const res = await fetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "rejected",
              rejectionReason: reason,
              version: userDetail.version,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Rejection failed");

          success(`User registration rejected.`);
          fetchUser();
        } catch (err: any) {
          error(err?.message || "Rejection failed.");
        } finally {
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
        }
      },
    });
  };

  const handleSuspendPrompt = () => {
    if (!userDetail) return;
    const reason = window.prompt("Enter suspension reason:", "Policy violation or administrative hold.");
    if (reason === null) return;

    setConfirmDialog({
      isOpen: true,
      title: `Suspend ${userDetail.email}?`,
      description: `This will immediately terminate all active sessions and block tool access. Reason: "${reason}".`,
      variant: "warning",
      action: async () => {
        try {
          const res = await fetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "suspended",
              suspendedReason: reason,
              version: userDetail.version,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Suspension failed");

          success(`User suspended and sessions revoked.`);
          fetchUser();
        } catch (err: any) {
          error(err?.message || "Suspension failed.");
        } finally {
          setConfirmDialog((p) => ({ ...p, isOpen: false }));
        }
      },
    });
  };

  const handleForceLogout = async () => {
    if (!userDetail) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/sessions`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to terminate sessions");

      success(`All active sessions terminated.`);
      fetchUser();
    } catch (err: any) {
      error(err?.message || "Force logout failed.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="table" rows={4} />
      </div>
    );
  }

  if (fetchError || !userDetail) {
    return <ErrorState title="User not found" message={fetchError || "Could not retrieve user details."} onRetry={fetchUser} />;
  }

  const isPending = userDetail.status === "pending";
  const isSuspended = userDetail.status === "suspended";
  const isRejected = userDetail.status === "rejected";

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Users</span>
        </Link>
      </div>

      {/* Approval Status Alert Banner */}
      {isPending && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400">Account Pending Admin Approval</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                This user registered and is waiting for manual administrative authorization before accessing SEO tools.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleApprove}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve Account</span>
            </button>
            <button
              onClick={handleRejectPrompt}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {isSuspended && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <div>
              <div className="text-xs font-bold text-rose-500">Account Suspended</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                Reason: {userDetail.suspendedReason || "Administrative hold"}. Sessions are blocked.
              </div>
            </div>
          </div>
          <button
            onClick={handleApprove}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
          >
            Reactivate Account
          </button>
        </div>
      )}

      {isRejected && (
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-rose-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-rose-400" />
            <div>
              <div className="text-xs font-bold text-rose-400">Account Registration Rejected</div>
              <div className="text-[11px] text-slate-400">
                Reason: {userDetail.rejectionReason || "Did not meet requirements"}.
              </div>
            </div>
          </div>
          <button
            onClick={handleApprove}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
          >
            Reconsider & Approve
          </button>
        </div>
      )}

      {/* Profile Overview Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-violet-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-xl text-emerald-500">
            {userDetail.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{userDetail.name}</h1>
              <StatusBadge status={userDetail.status} />
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-500/10 text-violet-500 border border-violet-500/20">
                {userDetail.role}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                {userDetail.planTier || "FREE_TRIAL"}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">{userDetail.email}</div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Member since {new Date(userDetail.createdAt).toLocaleDateString()} • Version token #{userDetail.version}
              {userDetail.approvedAt && ` • Approved: ${new Date(userDetail.approvedAt).toLocaleDateString()}`}
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {!isSuspended && userDetail.status === "active" && (
            <button
              onClick={handleSuspendPrompt}
              className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs font-semibold transition cursor-pointer"
            >
              Suspend Account
            </button>
          )}

          <button
            onClick={handleForceLogout}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Force Logout ({userDetail.activeSessions.length})</span>
          </button>
        </div>
      </div>

      {/* Governance Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Role & Plan Configuration */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Role & Subscription Plan</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">System Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="SUPERADMIN">SUPERADMIN (Full platform ownership & root control)</option>
                <option value="ADMIN">ADMIN (Administrative access to all users & projects)</option>
                <option value="SEO_USER">SEO_USER (Standard practitioner restricted to assigned projects)</option>
                <option value="CLIENT">CLIENT (Client guest restricted to view-only reports)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Subscription Plan Tier</label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="FREE_TRIAL">Free Trial (1 project, 25 keywords, 50 crawl pages)</option>
                <option value="STARTER">Starter Plan (5 projects, 250 keywords, 500 crawl pages)</option>
                <option value="PRO">Pro Professional (20 projects, 1,000 keywords, 5,000 crawl pages)</option>
                <option value="AGENCY">Agency Pack (100 projects, 5,000 keywords, 25,000 crawl pages)</option>
                <option value="ENTERPRISE">Enterprise (Unlimited quotas & custom SLA)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSaveGovernance}
                disabled={isUpdating}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-violet-950/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isUpdating ? "Saving Changes..." : "Save Governance Settings"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: Per-User SEO Tool Permissions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span>Per-User SEO Tool Permissions</span>
            </div>
            <span className="text-[10px] text-slate-400">Granular Toggles</span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { id: 'audits', label: 'Site Audits & Crawler', icon: Globe },
              { id: 'rankings', label: 'Rankings & SERP Tracking', icon: ListOrdered },
              { id: 'keywords', label: 'Keyword Research & Explorer', icon: Layers },
              { id: 'backlinks', label: 'Backlinks Explorer & Monitor', icon: Link2 },
              { id: 'ai_visibility', label: 'AI Search & GEO Visibility', icon: Sparkles },
              { id: 'competitor_research', label: 'Competitor Intelligence', icon: Users2 },
              { id: 'reports', label: 'Custom Reports & White Label', icon: FileText },
            ].map((tool) => {
              const Icon = tool.icon;
              const isChecked = toolPerms[tool.id] !== false;
              return (
                <label
                  key={tool.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{tool.label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setToolPerms({ ...toolPerms, [tool.id]: e.target.checked })}
                    className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Column 3: Usage Limits & Current Consumption */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <FolderKanban className="w-4 h-4 text-blue-500" />
              <span>Usage Quotas & Limits</span>
            </div>
            <span className="text-[10px] text-slate-400">Monthly Period</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span>Monthly Keyword Checks</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {userDetail.usageCurrent?.keywordsUsed || 0} / {quotaLimits.monthlyKeywords || 250}
                </span>
              </div>
              <input
                type="number"
                value={quotaLimits.monthlyKeywords || 250}
                onChange={(e) => setQuotaLimits({ ...quotaLimits, monthlyKeywords: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span>Monthly Audit Crawl Pages</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {userDetail.usageCurrent?.auditPagesUsed || 0} / {quotaLimits.monthlyAuditPages || 500}
                </span>
              </div>
              <input
                type="number"
                value={quotaLimits.monthlyAuditPages || 500}
                onChange={(e) => setQuotaLimits({ ...quotaLimits, monthlyAuditPages: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span>Monthly Backlink Lookups</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {userDetail.usageCurrent?.backlinkQueriesUsed || 0} / {quotaLimits.monthlyBacklinkQueries || 100}
                </span>
              </div>
              <input
                type="number"
                value={quotaLimits.monthlyBacklinkQueries || 100}
                onChange={(e) => setQuotaLimits({ ...quotaLimits, monthlyBacklinkQueries: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span>Monthly AI Queries</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {userDetail.usageCurrent?.aiQueriesUsed || 0} / {quotaLimits.monthlyAiQueries || 50}
                </span>
              </div>
              <input
                type="number"
                value={quotaLimits.monthlyAiQueries || 50}
                onChange={(e) => setQuotaLimits({ ...quotaLimits, monthlyAiQueries: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.action}
        onClose={() => setConfirmDialog((p) => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
