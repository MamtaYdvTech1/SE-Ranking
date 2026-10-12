"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { CompetitorDto } from "@/lib/types";

export interface DeleteCompetitorModalProps {
  projectId: string;
  competitor: CompetitorDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (competitorId: string) => void;
}

export function DeleteCompetitorModal({
  projectId,
  competitor,
  isOpen,
  onClose,
  onSuccess,
}: DeleteCompetitorModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !competitor) return null;

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      const res = await api.competitors.delete(projectId, competitor.id);
      if (res.success) {
        onSuccess(competitor.id);
        onClose();
      } else {
        setError(res.message || "Failed to delete competitor.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-rose-600 dark:text-rose-400">
            Delete Competitor
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded">
            {error}
          </div>
        )}

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Are you sure you want to remove competitor <strong>{competitor.name}</strong> ({competitor.domain})?
          All historical rank observation records for this competitor will be permanently deleted.
        </p>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-md cursor-pointer"
          >
            {isDeleting ? "Deleting..." : "Delete Competitor"}
          </button>
        </div>
      </div>
    </div>
  );
}
