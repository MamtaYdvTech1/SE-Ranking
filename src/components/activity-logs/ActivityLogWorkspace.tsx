"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ActivityLogDto, ProjectDto } from "../../lib/types";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/formatters";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge, Skeleton, Alert } from "@internal-seo/ui";
import { ActivityLogDetailModal } from "./ActivityLogDetailModal";

export function ActivityLogWorkspace() {
  const [logs, setLogs] = useState<ActivityLogDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  
  // Filters
  const [projectId, setProjectId] = useState("");
  const [actorId, setActorId] = useState("");
  const [entityType, setEntityType] = useState("");
  const [actionType, setActionType] = useState("");
  const [fromUtc, setFromUtc] = useState("");
  const [toUtc, setToUtc] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<ActivityLogDto | null>(null);

  // Load project options for the filter dropdown
  useEffect(() => {
    api.projects.list(undefined, undefined, 1, 100)
      .then((res) => {
        if (res.data?.items) setProjects(res.data.items);
      })
      .catch((err) => console.error("Failed to load projects for filter:", err));
  }, []);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.admin.activityLogs.list({
        projectId: projectId || undefined,
        actorId: actorId || undefined,
        entityType: entityType || undefined,
        actionType: actionType || undefined,
        fromUtc: fromUtc ? new Date(fromUtc).toISOString() : undefined,
        toUtc: toUtc ? new Date(toUtc).toISOString() : undefined,
        page,
        pageSize,
      });

      if (res.data) {
        setLogs(res.data.items);
        setTotalCount(res.data.totalCount);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load activity logs.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, actorId, entityType, actionType, fromUtc, toUtc, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const handleResetFilters = () => {
    setProjectId("");
    setActorId("");
    setEntityType("");
    setActionType("");
    setFromUtc("");
    setToUtc("");
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const getActionBadgeVariant = (action: string): "success" | "warning" | "danger" | "default" => {
    if (action.includes("Create") || action.includes("Add")) return "success";
    if (action.includes("Update") || action.includes("Patch")) return "warning";
    if (action.includes("Delete") || action.includes("Remove")) return "danger";
    return "default";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity Audit Trail</h1>
          <p className="text-sm text-slate-500">
            Immutable, append-only operational log tracking all system and project administrative actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Project</label>
              <select
                aria-label="Project"
                value={projectId}
                onChange={(e) => { setProjectId(e.target.value); setPage(1); }}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-900 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Entity Type</label>
              <select
                aria-label="Entity Type"
                value={entityType}
                onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-900 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="">All Entities</option>
                <option value="Project">Project</option>
                <option value="Keyword">Keyword</option>
                <option value="Task">Task</option>
                <option value="User">User</option>
                <option value="Crawl">Crawl</option>
                <option value="Settings">Settings</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Action Type</label>
              <Input
                placeholder="e.g. Project.Created"
                value={actionType}
                onChange={(e) => { setActionType(e.target.value); setPage(1); }}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Actor ID</label>
              <Input
                placeholder="Filter by User GUID"
                value={actorId}
                onChange={(e) => { setActorId(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-end pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">From Date</label>
              <Input
                type="datetime-local"
                value={fromUtc}
                onChange={(e) => { setFromUtc(e.target.value); setPage(1); }}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">To Date</label>
              <Input
                type="datetime-local"
                value={toUtc}
                onChange={(e) => { setToUtc(e.target.value); setPage(1); }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleResetFilters} className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      {/* Main Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-800">
            Audit Events ({totalCount})
          </CardTitle>
          <div className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-semibold text-slate-700 text-sm">No activity logs found</h3>
              <p className="text-xs text-slate-400 mt-1">
                No system mutations matched the selected filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Timestamp (UTC)</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3 text-right">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{log.actorEmail}</div>
                        <Badge variant="default" className="text-[10px] mt-0.5">
                          {log.actorRole}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getActionBadgeVariant(log.actionType)} className="font-mono text-[11px]">
                          {log.actionType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{log.entityType}</div>
                        <div className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                          {log.entityId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.projectName ? (
                          <span className="font-medium text-slate-900">{log.projectName}</span>
                        ) : (
                          <span className="text-slate-400 italic">— (Global)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                        {log.ipAddress || "—"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="text-slate-500">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} logs
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-slate-600 font-medium px-2">
                  {page} / {totalPages}
                </span>
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

      {/* Detail Modal */}
      <ActivityLogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
