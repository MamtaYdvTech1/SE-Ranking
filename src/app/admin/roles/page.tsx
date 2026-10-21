"use client";

import React, { useState, useEffect } from "react";
import {
  KeyRound,
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Lock,
  Layers,
  Info,
} from "lucide-react";
import { useToast } from "@/components/admin/ui/Toast";
import { SkeletonLoader } from "@/components/admin/ui/SkeletonLoader";
import { ErrorState } from "@/components/admin/ui/ErrorState";

interface RoleDef {
  name: string;
  label: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  description: string;
}

interface PermissionDef {
  key: string;
  label: string;
  category: string;
}

export default function AdminRolesPage() {
  const { error } = useToast();
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [permissions, setPermissions] = useState<PermissionDef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const fetchRoles = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/admin/roles");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load roles");
      }
      setRoles(json.data.roles);
      setPermissions(json.data.permissions);
    } catch (err: any) {
      setFetchError(err.message);
      error("Failed to load roles: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const totalUsers = roles.reduce((sum, r) => sum + r.userCount, 0);

  const filteredPermissions = permissions.filter(
    (p) =>
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.key.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="table" />
      </div>
    );
  }

  if (fetchError) {
    return <ErrorState message={fetchError} onRetry={fetchRoles} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <KeyRound className="w-6 h-6 text-indigo-500" />
            <span>Roles & Permissions Governance</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enterprise RBAC matrix. Enforces least-privilege server authorization across all platform resources.
          </p>
        </div>
        <button
          onClick={fetchRoles}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Matrix</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Defined Roles</span>
            <Shield className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{roles.length}</div>
          <div className="text-xs text-slate-400 mt-1">SUPER_ADMIN, ADMIN, SEO_MANAGER, SEO_USER, CLIENT</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Active Users</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{totalUsers}</div>
          <div className="text-xs text-slate-400 mt-1">Assigned across 5 enterprise roles</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Granular Verbs</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{permissions.length}</div>
          <div className="text-xs text-slate-400 mt-1">Enforced at API & DB boundary</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security Engine</span>
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-500 mt-2">Active</div>
          <div className="text-xs text-slate-400 mt-1">100% RLS + Server Enforcement</div>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {roles.map((role) => (
          <div
            key={role.name}
            onClick={() => setSelectedRole(selectedRole === role.name ? null : role.name)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedRole === role.name
                ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {role.label}
                </span>
                <span className="text-xs font-semibold text-slate-400">{role.userCount} users</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                {role.description}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span>{role.permissions.length} permissions</span>
              {role.isSystem && (
                <span className="text-[10px] uppercase font-bold text-amber-500">System</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Permission Matrix Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Canonical Permission Matrix</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strictly verified on every server API request. Frontend UI visibility alone does not grant access.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">Permission Scope</th>
                <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">Category</th>
                {roles.map((r) => (
                  <th key={r.name} className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredPermissions.map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{perm.label}</div>
                    <code className="text-[10px] text-slate-400 dark:text-slate-500">{perm.key}</code>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {perm.category}
                    </span>
                  </td>
                  {roles.map((r) => {
                    const hasPerm = r.permissions.includes(perm.key);
                    return (
                      <td key={r.name} className="py-3 px-4 text-center">
                        {hasPerm ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
