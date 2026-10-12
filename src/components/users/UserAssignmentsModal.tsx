"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AdminUserDetailDto, ProjectDto } from "../../lib/types";
import { api } from "../../lib/api";
import { Button, Badge, Alert, Skeleton } from "@internal-seo/ui";

interface UserAssignmentsModalProps {
  isOpen: boolean;
  userId: string | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function UserAssignmentsModal(props: UserAssignmentsModalProps) {
  if (!props.isOpen || !props.userId) return null;
  return <UserAssignmentsModalDialog key={props.userId} {...props} userId={props.userId} />;
}

function UserAssignmentsModalDialog({
  userId,
  onClose,
  onUpdated,
}: UserAssignmentsModalProps & { userId: string }) {
  const [userDetail, setUserDetail] = useState<AdminUserDetailDto | null>(null);
  const [availableProjects, setAvailableProjects] = useState<ProjectDto[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<number>(2); // 2 = Member
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [userRes, projectsRes] = await Promise.all([
        api.admin.users.get(userId),
        api.projects.list(),
      ]);
      setUserDetail(userRes.data || null);
      if (projectsRes.data) {
        setAvailableProjects(projectsRes.data.items);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load user assignments.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      api.admin.users.get(userId),
      api.projects.list(),
    ]).then(([userRes, projectsRes]) => {
      if (!ignore) {
        setUserDetail(userRes.data || null);
        if (projectsRes.data) {
          setAvailableProjects(projectsRes.data.items);
        }
      }
    }).catch((err: unknown) => {
      if (!ignore) {
        setError(err instanceof Error ? err.message : "Failed to load user assignments.");
      }
    }).finally(() => {
      if (!ignore) {
        setIsLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [userId]);

  const handleAssignProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedProjectId) return;

    setIsAssigning(true);
    setError(null);
    try {
      await api.admin.users.assignProject(userId, {
        projectId: selectedProjectId,
        accessLevel: Number(selectedAccessLevel),
      });
      setSelectedProjectId("");
      await loadData();
      onUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to assign project.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignProject = async (projectId: string) => {
    if (!userId) return;
    try {
      await api.admin.users.unassignProject(userId, projectId);
      await loadData();
      onUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove assignment.");
    }
  };

  // Filter out projects already assigned
  const assignedProjectIds = new Set(userDetail?.projectMemberships.map((p) => p.projectId) || []);
  const unassignedProjects = availableProjects.filter((p) => !assignedProjectIds.has(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {userDetail ? `Project Assignments: ${userDetail.fullName}` : "Project Assignments"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage which digital properties {userDetail?.email || "this user"} has permission to access.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 pt-4">
          {error && (
            <Alert variant="error">
              <span className="text-xs">{error}</span>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              {/* Current Project Memberships */}
              <div>
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                  Assigned Projects ({userDetail?.projectMemberships.length || 0})
                </h4>
                {userDetail?.projectMemberships.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    No projects currently assigned to this user.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {userDetail?.projectMemberships.map((membership) => (
                      <div
                        key={membership.projectId}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{membership.projectName}</div>
                          <div className="text-[11px] font-mono text-slate-500">{membership.primaryDomain}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {membership.accessLevel === 1 ? "Owner" : membership.accessLevel === 2 ? "Member" : "ReadOnly"}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnassignProject(membership.projectId)}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 h-auto text-xs"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign to New Project */}
              {unassignedProjects.length > 0 && (
                <form onSubmit={handleAssignProject} className="pt-3 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                    Assign to New Project
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        required
                        className="w-full text-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a project...</option>
                        {unassignedProjects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.primaryDomain})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select
                        value={selectedAccessLevel}
                        onChange={(e) => setSelectedAccessLevel(Number(e.target.value))}
                        className="w-full text-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={2}>Member (Read/Write)</option>
                        <option value={3}>ReadOnly (Viewer)</option>
                        <option value={1}>Owner (Full)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={!selectedProjectId || isAssigning}>
                      {isAssigning ? "Assigning..." : "Assign Project"}
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
