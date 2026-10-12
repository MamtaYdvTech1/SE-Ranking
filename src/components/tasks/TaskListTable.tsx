"use client";

import React from "react";
import { Badge, Button } from "@internal-seo/ui";
import { TaskDto } from "../../lib/types";

export interface TaskListTableProps {
  tasks: TaskDto[];
  isLoading: boolean;
  onSelectTask: (task: TaskDto) => void;
  onQuickVerify?: (task: TaskDto) => void;
  isWriter?: boolean;
}

export function TaskListTable({
  tasks,
  isLoading,
  onSelectTask,
  onQuickVerify,
  isWriter = true,
}: TaskListTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return <Badge variant="success">Verified</Badge>;
      case "ReadyForVerification":
        return <Badge variant="info">Ready to Verify</Badge>;
      case "InProgress":
        return <Badge variant="warning">In Progress</Badge>;
      case "Assigned":
        return <Badge variant="default">Assigned</Badge>;
      case "Reopened":
        return <Badge variant="danger">Reopened</Badge>;
      case "Closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="default">Open</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical":
        return <Badge variant="danger">Critical</Badge>;
      case "High":
        return <Badge variant="warning">High</Badge>;
      case "Medium":
        return <Badge variant="info">Medium</Badge>;
      default:
        return <Badge variant="default">Low</Badge>;
    }
  };

  const getVerificationBadge = (verification?: TaskDto["latestVerification"]) => {
    if (!verification) return <span className="text-slate-400 text-xs">—</span>;
    switch (verification.status) {
      case "Passed":
        return <Badge variant="success">Passed</Badge>;
      case "Failed":
        return <Badge variant="danger">Failed</Badge>;
      case "Error":
        return <Badge variant="danger">Error</Badge>;
      case "Running":
        return <Badge variant="warning">Running</Badge>;
      default:
        return <Badge variant="outline">Queued</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600 mb-3" />
        <p className="text-sm">Loading SEO tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">No tasks found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No SEO tasks match your current filter criteria. Create a new task or convert audit issues to populate this workspace.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
            <th className="py-3 px-4">Task & Source Rule</th>
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Affected URL</th>
            <th className="py-3 px-4">Assignee</th>
            <th className="py-3 px-4">Latest Verification</th>
            <th className="py-3 px-4">Due Date</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <tr
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="hover:bg-slate-50/80 cursor-pointer transition"
            >
              <td className="py-3 px-4">
                <div className="font-semibold text-slate-900 text-sm">{task.title}</div>
                {task.sourceIssueRuleCode && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-[11px] text-slate-500">
                      {task.sourceIssueRuleCode}
                    </span>
                    {task.sourceIssueSeverity && (
                      <span className="text-[10px] text-slate-400">
                        • {task.sourceIssueSeverity}
                      </span>
                    )}
                  </div>
                )}
              </td>
              <td className="py-3 px-4">{getPriorityBadge(task.priority)}</td>
              <td className="py-3 px-4">{getStatusBadge(task.status)}</td>
              <td className="py-3 px-4 max-w-xs truncate font-mono text-[11px] text-slate-600" title={task.affectedUrl || ""}>
                {task.affectedUrl || "—"}
              </td>
              <td className="py-3 px-4 text-slate-700">
                {task.assigneeName || task.assigneeEmail || <span className="text-slate-400">Unassigned</span>}
              </td>
              <td className="py-3 px-4">{getVerificationBadge(task.latestVerification)}</td>
              <td className="py-3 px-4 text-slate-500">{task.dueDate || "—"}</td>
              <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1.5">
                  {isWriter && task.affectedUrl && task.status !== "Verified" && onQuickVerify && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onQuickVerify(task)}
                      title="Run automated single-URL verification"
                    >
                      Verify
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectTask(task)}
                  >
                    View
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TaskListTable;
