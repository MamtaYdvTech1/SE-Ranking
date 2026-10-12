"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Input } from "@internal-seo/ui";
import { api } from "../../lib/api";
import { PaginatedList, TaskDto } from "../../lib/types";
import { TaskListTable } from "./TaskListTable";
import { TaskDetailDrawer } from "./TaskDetailDrawer";
import { CreateTaskModal } from "./CreateTaskModal";
import { useAuth } from "../../context/AuthContext";

export interface TaskWorkspaceProps {
  projectId: string;
  initialSourceIssueId?: string;
  initialTaskId?: string;
}

export function TaskWorkspace({ projectId, initialSourceIssueId, initialTaskId }: TaskWorkspaceProps) {
  const { user } = useAuth();
  const isWriter = user?.role === "SuperAdmin" || user?.role === "SEOExecutive";

  const [tasksData, setTasksData] = useState<PaginatedList<TaskDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Modals & Drawers
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTaskId || null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialValues, setCreateInitialValues] = useState<{
    sourceIssueId?: string;
    title?: string;
    description?: string;
    affectedUrl?: string;
    priority?: string;
    acceptanceCriteria?: string;
  } | undefined>(
    initialSourceIssueId ? { sourceIssueId: initialSourceIssueId } : undefined
  );

  const fetchTasks = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let ignore = false;
    api.tasks
      .list(projectId, {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: searchQuery || undefined,
        page,
        pageSize: 50,
      })
      .then((res) => {
        if (!ignore && res.data) {
          setTasksData(res.data);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to fetch tasks:", err);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [projectId, statusFilter, priorityFilter, searchQuery, page, refreshTrigger]);

  const handleQuickVerify = async (task: TaskDto) => {
    try {
      await api.tasks.verify(projectId, task.id);
      fetchTasks();
      setSelectedTaskId(task.id);
    } catch (err) {
      console.error("Quick verify failed:", err);
    }
  };

  const tasks = tasksData?.items || [];
  const totalTasks = tasksData?.totalCount || 0;
  const verifiedCount = tasks.filter((t) => t.status === "Verified").length;
  const readyCount = tasks.filter((t) => t.status === "ReadyForVerification").length;
  const inProgressCount = tasks.filter((t) => t.status === "InProgress" || t.status === "Assigned" || t.status === "Open").length;

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SEO Tasks & Verification</h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign SEO remediation items, track team progress, and run automated single-URL verifications.
          </p>
        </div>
        {isWriter && (
          <Button
            variant="primary"
            onClick={() => {
              setCreateInitialValues(undefined);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Task
          </Button>
        )}
      </div>

      {/* KPI Metrics Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Tasks</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalTasks}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 block uppercase tracking-wider">Open / In Progress</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{inProgressCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 block uppercase tracking-wider">Ready to Verify</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{readyCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 block uppercase tracking-wider">Verified</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{verifiedCount}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="InProgress">In Progress</option>
            <option value="ReadyForVerification">Ready for Verification</option>
            <option value="Verified">Verified</option>
            <option value="Reopened">Reopened</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Search input */}
        <div className="w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Task List Table */}
      <TaskListTable
        tasks={tasks}
        isLoading={isLoading}
        onSelectTask={(task) => setSelectedTaskId(task.id)}
        onQuickVerify={handleQuickVerify}
        isWriter={isWriter}
      />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        projectId={projectId}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={fetchTasks}
        isWriter={isWriter}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        projectId={projectId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchTasks();
        }}
        initialValues={createInitialValues}
      />
    </div>
  );
}

export default TaskWorkspace;
