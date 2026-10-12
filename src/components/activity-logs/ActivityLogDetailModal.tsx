"use client";

import React, { useMemo } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@internal-seo/ui";
import { ActivityLogDto } from "../../lib/types";
import { formatDate } from "../../lib/formatters";

interface ActivityLogDetailModalProps {
  log: ActivityLogDto | null;
  onClose: () => void;
}

export function ActivityLogDetailModal({ log, onClose }: ActivityLogDetailModalProps) {
  if (!log) return null;
  return <ActivityLogDetailModalContent log={log} onClose={onClose} />;
}

function ActivityLogDetailModalContent({ log, onClose }: { log: ActivityLogDto; onClose: () => void }) {
  const payloadJson = log.payloadJson;

  // Safely parse JSON without risking code execution or dangerouslySetInnerHTML
  const parsedPayload = useMemo(() => {
    if (!payloadJson) return null;
    try {
      const parsed = JSON.parse(payloadJson);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return null;
    }
  }, [payloadJson]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Activity Audit Detail
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Log ID: #{log.id} • {formatDate(log.createdAt)} (UTC)
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </CardHeader>

          <CardContent className="space-y-4 pt-4 text-xs">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="font-semibold text-slate-500 block uppercase text-[10px]">Action</span>
                <span className="font-bold text-slate-900">{log.actionType}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block uppercase text-[10px]">Entity</span>
                <span className="font-medium text-slate-900">{log.entityType} ({log.entityId})</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block uppercase text-[10px]">Project</span>
                <span className="font-medium text-slate-900">{log.projectName || "— (Global)"}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block uppercase text-[10px]">Actor Email</span>
                <span className="font-medium text-slate-900">{log.actorEmail}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block uppercase text-[10px]">Actor Role</span>
                <span className="font-medium text-slate-900">{log.actorRole}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block uppercase text-[10px]">IP Address</span>
                <span className="font-mono text-slate-900">{log.ipAddress || "—"}</span>
              </div>
            </div>

            {/* Payload JSON / Diff */}
            <div>
              <span className="font-semibold text-slate-700 block mb-1 text-xs">
                Payload / Changed State:
              </span>
              {log.payloadJson ? (
                parsedPayload ? (
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto max-h-72 whitespace-pre">
                    {parsedPayload}
                  </pre>
                ) : (
                  <pre className="p-3 bg-slate-100 text-slate-800 rounded-lg font-mono text-[11px] overflow-x-auto max-h-72 whitespace-pre">
                    {log.payloadJson}
                  </pre>
                )
              ) : (
                <div className="p-4 bg-slate-50 text-slate-400 rounded-lg italic text-center">
                  No payload recorded for this action.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
