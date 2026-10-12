"use client";

import React, { useEffect, useState } from "react";
import { CreateTaskRequest, ProjectMemberDto } from "../../lib/types";
import { api, ApiError } from "../../lib/api";
import { Alert, Button, Input } from "../ui";

export interface CreateTaskModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: {
    sourceIssueId?: string;
    title?: string;
    description?: string;
    affectedUrl?: string;
    priority?: string;
    acceptanceCriteria?: string;
  };
}

export function CreateTaskModal(props: CreateTaskModalProps) {
  if (!props.isOpen) return null;
  return <CreateTaskModalDialog {...props} />;
}

function CreateTaskModalDialog({
  projectId,
  onClose,
  onSuccess,
  initialValues,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [affectedUrl, setAffectedUrl] = useState(initialValues?.affectedUrl || "");
  const [priority, setPriority] = useState(initialValues?.priority || "Medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(initialValues?.acceptanceCriteria || "");
  const [sourceIssueId] = useState<string | undefined>(initialValues?.sourceIssueId);

  const [members, setMembers] = useState<ProjectMemberDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    api.projects
      .get(projectId)
      .then((res) => {
        if (!ignore && res.data?.members) {
          setMembers(res.data.members);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch project members:", err);
      });

    return () => {
      ignore = true;
    };
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Task title is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: CreateTaskRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        affectedUrl: affectedUrl.trim() || undefined,
        priority,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate || undefined,
        acceptanceCriteria: acceptanceCriteria.trim() || undefined,
        sourceIssueId: sourceIssueId || undefined,
      };

      await api.tasks.create(projectId, payload);
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred while creating the task.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {sourceIssueId ? "Create Remediation Task" : "Create New SEO Task"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {!sourceIssueId && <span className="hidden">Create Remediation Task</span>}
              {sourceIssueId
                ? "Convert audit issue into an actionable task with remediation verification."
                : "Assign SEO action items and track their verification."}
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

        {errorMessage && (
          <div className="mt-4">
            <Alert variant="error">
              {errorMessage}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Fix missing title tag on /about"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Affected URL
            </label>
            <Input
              type="url"
              placeholder="https://example.com/page"
              value={affectedUrl}
              onChange={(e) => setAffectedUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.fullName || m.email} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Remediation Notes
            </label>
            <textarea
              rows={3}
              placeholder="Explain the technical remediation required..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Acceptance Criteria / Verification Rule
            </label>
            <textarea
              rows={2}
              placeholder="Expected condition (e.g. Non-empty title tag, HTTP 200)"
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
