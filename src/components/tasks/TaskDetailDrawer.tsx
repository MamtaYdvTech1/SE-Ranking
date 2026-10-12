"use client";

import React, { useEffect, useState } from "react";
import { Badge, Button, Skeleton } from "@internal-seo/ui";
import { api, ApiError } from "../../lib/api";
import { TaskDetailDto } from "../../lib/types";
import { formatDate } from "../../lib/formatters";

export interface TaskDetailDrawerProps {
  projectId: string;
  taskId: string | null;
  onClose: () => void;
  onTaskUpdated?: () => void;
  isWriter?: boolean;
}

export function TaskDetailDrawer(props: TaskDetailDrawerProps) {
  if (!props.taskId) return null;
  return <TaskDetailDrawerContent key={props.taskId} {...props} taskId={props.taskId} />;
}

function TaskDetailDrawerContent({
  projectId,
  taskId,
  onClose,
  onTaskUpdated,
  isWriter = true,
}: TaskDetailDrawerProps & { taskId: string }) {
  const [task, setTask] = useState<TaskDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const fetchTaskDetail = async (id: string) => {
    try {
      const res = await api.tasks.get(projectId, id);
      if (res.data) {
        setTask(res.data);
      }
    } catch (err) {
      console.error("Failed to load task detail:", err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim()) return;

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      await api.tasks.addComment(projectId, task.id, newComment.trim());
      setNewComment("");
      await fetchTaskDetail(task.id);
      onTaskUpdated?.();
    } catch (err) {
      if (err instanceof ApiError) {
        setCommentError(err.message);
      } else {
        setCommentError("Failed to add comment.");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    api.tasks
      .get(projectId, taskId)
      .then((res) => {
        if (!ignore && res.data) {
          setTask(res.data);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load task detail:", err);
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
  }, [projectId, taskId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.tasks.patchStatus(projectId, task.id, newStatus);
      setActionSuccess(`Status updated to ${newStatus}`);
      await fetchTaskDetail(task.id);
      onTaskUpdated?.();
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError("Failed to update status.");
      }
    }
  };

  const handleTriggerVerification = async () => {
    if (!task) return;
    setIsVerifying(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.tasks.verify(projectId, task.id);
      setActionSuccess("Verification enqueued! Background crawler is testing the remediation...");
      await fetchTaskDetail(task.id);
      onTaskUpdated?.();
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError("Failed to enqueue verification.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return <Badge variant="success">Verified</Badge>;
      case "ReadyForVerification":
        return <Badge variant="info">Ready for Verification</Badge>;
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

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {task && getPriorityBadge(task.priority)}
                {task && getStatusBadge(task.status)}
                {task?.sourceIssueRuleCode && (
                  <span className="font-mono text-xs font-semibold text-slate-500">
                    {task.sourceIssueRuleCode}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 leading-snug">
                {task?.title || "Loading Task..."}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Feedback alerts */}
          {actionError && (
            <div className="px-6 pt-4">
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
                {actionError}
              </div>
            </div>
          )}
          {actionSuccess && (
            <div className="px-6 pt-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
                {actionSuccess}
              </div>
            </div>
          )}

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : task ? (
              <>
                {/* Actions bar for SEO Workflow */}
                {isWriter && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Workflow & Verification Actions
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {task.status !== "InProgress" && task.status !== "Verified" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange("InProgress")}
                        >
                          Mark In Progress
                        </Button>
                      )}

                      {task.status !== "ReadyForVerification" && task.status !== "Verified" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange("ReadyForVerification")}
                        >
                          Mark Ready for Verification
                        </Button>
                      )}

                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isVerifying || !task.affectedUrl}
                        onClick={handleTriggerVerification}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {isVerifying ? "Enqueuing..." : "Verify Remediation"}
                      </Button>

                      {task.status !== "Closed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange("Closed")}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          Close Task
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Task Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-white border border-slate-200 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Assignee</span>
                    <span className="font-medium text-slate-800">
                      {task.assigneeName || task.assigneeEmail || "Unassigned"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Due Date</span>
                    <span className="font-medium text-slate-800">
                      {task.dueDate || "No due date"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Created At</span>
                    <span className="font-medium text-slate-800">
                      {formatDate(task.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Last Updated</span>
                    <span className="font-medium text-slate-800">
                      {formatDate(task.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Affected URL */}
                {task.affectedUrl && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Affected Page URL
                    </h4>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-slate-800 break-all select-all">
                        {task.affectedUrl}
                      </span>
                      <a
                        href={task.affectedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex-shrink-0 p-1 hover:bg-blue-50 rounded"
                        title="Open URL in new tab"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}

                {/* Description */}
                {task.description && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Remediation Instructions
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </div>
                )}

                {/* Acceptance Criteria */}
                {task.acceptanceCriteria && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Acceptance Criteria
                    </h4>
                    <div className="text-sm text-slate-800 leading-relaxed bg-emerald-50/50 border border-emerald-200 rounded-lg p-3.5">
                      {task.acceptanceCriteria}
                    </div>
                  </div>
                )}

                {/* Source Issue Recommendations & Evidence */}
                {task.sourceIssueRuleTitle && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Source Audit Issue: {task.sourceIssueRuleTitle}
                    </h4>
                    {task.sourceIssueRecommendation && (
                      <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block mb-1">Audit Recommendation:</strong>
                        {task.sourceIssueRecommendation}
                      </div>
                    )}
                    {task.evidence && task.evidence.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-semibold text-slate-600">Initial Issue Evidence:</span>
                        {task.evidence.map((ev) => (
                          <pre
                            key={ev.id}
                            className="p-2.5 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg overflow-x-auto whitespace-pre-wrap break-all border border-slate-800"
                          >
                            {ev.evidencePayload}
                          </pre>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Verification History Log */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>Verification History ({task.verifications?.length || 0})</span>
                  </h4>
                  {task.verifications && task.verifications.length > 0 ? (
                    <div className="space-y-2.5">
                      {task.verifications.map((v) => (
                        <div
                          key={v.id}
                          className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getVerificationStatusBadge(v.status)}
                              <span className="text-xs font-medium text-slate-600">
                                Attempt #{v.id}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {formatDate(v.completedAt || v.attemptedAt)}
                            </span>
                          </div>
                          {v.details && (
                            <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono break-all">
                              {v.details}
                            </p>
                          )}
                          {v.verifiedByUserName && (
                            <div className="text-[11px] text-slate-400">
                              Triggered by: {v.verifiedByUserName}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl">
                      No verifications have been performed yet for this task.
                    </div>
                  )}
                </div>

                {/* Activity & Comment Thread */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>Comments & Activity ({task.comments?.length || 0})</span>
                  </h4>

                  {commentError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                      {commentError}
                    </div>
                  )}

                  {/* Comment List */}
                  {task.comments && task.comments.length > 0 ? (
                    <div className="space-y-3">
                      {task.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-800">
                                {comment.authorName || "Unknown"}
                              </span>
                              {comment.authorEmail && (
                                <span className="text-[11px] text-slate-400">
                                  ({comment.authorEmail})
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {comment.commentText}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl">
                      No comments yet. Start the conversation below.
                    </div>
                  )}

                  {/* Comment Form for Writers */}
                  {isWriter ? (
                    <form onSubmit={handleAddComment} className="space-y-2 pt-2">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment or evidence note..."
                        rows={3}
                        maxLength={4000}
                        className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                        disabled={isSubmittingComment}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {newComment.length}/4000 characters
                        </span>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isSubmittingComment || !newComment.trim()}
                        >
                          {isSubmittingComment ? "Posting..." : "Post Comment"}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-xs text-slate-400 italic pt-1">
                      Read-only access: Commenting requires Project Writer or Admin role.
                    </p>
                  )}
                </div>
              </>
            ) : null}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailDrawer;
