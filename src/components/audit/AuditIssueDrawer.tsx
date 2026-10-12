"use client";

import React, { useEffect, useState } from "react";
import { Badge, Button, Skeleton } from "@internal-seo/ui";
import { api } from "../../lib/api";
import { AuditIssueDetailDto, AuditIssueDto } from "../../lib/types";
import { formatDate } from "../../lib/formatters";
import { CreateTaskModal } from "../tasks/CreateTaskModal";

interface AuditIssueDrawerProps {
  projectId: string;
  issue: AuditIssueDto | null;
  onClose: () => void;
}

export function AuditIssueDrawer({ projectId, issue, onClose }: AuditIssueDrawerProps) {
  const [detail, setDetail] = useState<AuditIssueDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!issue) return;

    let ignore = false;
    api.audit
      .getIssueDetail(projectId, issue.id)
      .then((res) => {
        if (!ignore && res.data) {
          setDetail(res.data);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load issue detail:", err);
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
  }, [projectId, issue]);

  if (!issue) return null;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Error":
        return <Badge variant="danger">Error</Badge>;
      case "Warning":
        return <Badge variant="warning">Warning</Badge>;
      case "Notice":
        return <Badge variant="info">Notice</Badge>;
      default:
        return <Badge variant="default">{severity}</Badge>;
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
        <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/50">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {getSeverityBadge(issue.severity)}
                <span className="font-mono text-xs font-semibold text-slate-500">
                  {issue.ruleCode}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-600">
                  {issue.ruleCategory}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {issue.ruleTitle}
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

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Affected URL */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Affected Page URL
              </h4>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-slate-800 break-all select-all">
                  {issue.affectedUrl}
                </span>
                <a
                  href={issue.affectedUrl}
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

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : detail ? (
              <>
                {/* Description */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Audit Finding Explanation
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200">
                    {detail.description}
                  </p>
                </div>

                {/* Recommendation */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recommended Action
                  </h4>
                  <div className="text-sm text-slate-800 leading-relaxed bg-emerald-50/50 border border-emerald-200 rounded-lg p-3.5">
                    {detail.recommendation}
                  </div>
                </div>

                {/* Diagnostic Evidence */}
                {detail.evidence && detail.evidence.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span>Diagnostic Evidence ({detail.evidence.length})</span>
                      <span className="font-mono text-[10px] text-slate-400 font-normal">Raw Payload</span>
                    </h4>
                    {detail.evidence.map((item) => (
                      <div key={item.id} className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {item.evidenceType}
                          </Badge>
                          <span>Captured {formatDate(item.createdAt)}</span>
                        </div>
                        <pre className="p-3 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg overflow-x-auto whitespace-pre-wrap break-all border border-slate-800">
                          {item.evidencePayload}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}

                {/* Timestamps */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>First detected: {formatDate(detail.firstSeenAt)}</span>
                  <span>Last observed: {formatDate(detail.lastSeenAt)}</span>
                </div>
              </>
            ) : null}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Convert to Task
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      <CreateTaskModal
        projectId={projectId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          onClose();
        }}
        initialValues={{
          sourceIssueId: issue.id,
          title: `Fix: ${issue.ruleTitle}`,
          description: detail?.description,
          affectedUrl: issue.affectedUrl,
          priority: issue.severity === "Error" ? "High" : issue.severity === "Warning" ? "Medium" : "Low",
          acceptanceCriteria: detail?.recommendation,
        }}
      />
    </div>
  );
}