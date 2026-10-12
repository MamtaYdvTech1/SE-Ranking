"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AdminUserDto, CreateAdminUserRequest } from "../../lib/types";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge, Skeleton, Alert } from "@internal-seo/ui";
import { CreateUserModal } from "./CreateUserModal";
import { UserAssignmentsModal } from "./UserAssignmentsModal";

export function UserManagementWorkspace() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assignmentsUserId, setAssignmentsUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const isActiveParam = statusFilter === "" ? undefined : statusFilter === "active";
      const res = await api.admin.users.list({
        search: search || undefined,
        role: roleFilter || undefined,
        isActive: isActiveParam,
        page,
        pageSize,
      });
      if (res.data) {
        setUsers(res.data.items);
        setTotalCount(res.data.totalCount);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users list.");
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleCreateUser = async (data: CreateAdminUserRequest) => {
    await api.admin.users.create(data);
    setSuccessMessage(`User "${data.email}" created successfully.`);
    await fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.admin.users.updateRole(userId, newRole);
      setSuccessMessage("User role updated successfully.");
      await fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update user role.");
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await api.admin.users.updateStatus(userId, !currentStatus);
      setSuccessMessage(`User ${!currentStatus ? "activated" : "deactivated"} successfully.`);
      await fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to change user status.");
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">
            System-wide user administration, role assignment, status toggles, and project associations.
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add New User
        </Button>
      </div>

      {/* Feedback alerts */}
      {error && (
        <Alert variant="error">
          <div className="flex items-center justify-between">
            <span className="text-xs">{error}</span>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 text-xs font-bold">×</button>
          </div>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success">
          <div className="flex items-center justify-between">
            <span className="text-xs">{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700 text-xs font-bold">×</button>
          </div>
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-full sm:flex-1">
          <Input
            placeholder="Search by name or email address..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="SuperAdmin">SuperAdmin</option>
            <option value="SEOExecutive">SEOExecutive</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        <div className="w-full sm:w-40">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-semibold text-slate-800">
            Registered Users ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="text-sm font-medium">No users found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">System Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Projects</th>
                    <th className="px-5 py-3">Created</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isSelf = currentUser?.id === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <span>{u.fullName || "Unnamed User"}</span>
                            {isSelf && (
                              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                        </td>

                        <td className="px-5 py-3.5">
                          <select
                            value={u.role}
                            disabled={isSelf}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="text-xs rounded border border-slate-200 bg-white px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                          >
                            <option value="SuperAdmin">SuperAdmin</option>
                            <option value="SEOExecutive">SEOExecutive</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        </td>

                        <td className="px-5 py-3.5">
                          <Badge variant={u.isActive ? "success" : "default"}>
                            {u.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>

                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            onClick={() => setAssignmentsUserId(u.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                            title="Manage Project Assignments"
                          >
                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>{u.projectCount} {u.projectCount === 1 ? "project" : "projects"}</span>
                          </button>
                        </td>

                        <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-3.5 text-right space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAssignmentsUserId(u.id)}
                            className="text-xs"
                          >
                            Assign
                          </Button>
                          <Button
                            type="button"
                            variant={u.isActive ? "ghost" : "outline"}
                            size="sm"
                            disabled={isSelf}
                            onClick={() => handleStatusToggle(u.id, u.isActive)}
                            className={`text-xs ${u.isActive ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-500">
                Page {page} of {totalPages} ({totalCount} total)
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      <UserAssignmentsModal
        isOpen={!!assignmentsUserId}
        userId={assignmentsUserId}
        onClose={() => setAssignmentsUserId(null)}
        onUpdated={fetchUsers}
      />
    </div>
  );
}
