"use client";

import React, { useState } from "react";
import { KeywordGroupDto } from "../../lib/types";
import { Button } from "../ui";

interface BulkActionBarProps {
  selectedCount: number;
  groups: KeywordGroupDto[];
  onUpdateStatus: (isActive: boolean) => Promise<void>;
  onAssignGroup: (groupId: string | null) => Promise<void>;
  onDelete: () => Promise<void>;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export function BulkActionBar({
  selectedCount,
  groups,
  onUpdateStatus,
  onAssignGroup,
  onDelete,
  onClearSelection,
  isLoading = false,
}: BulkActionBarProps) {
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-2 pr-3 border-r border-slate-700 font-medium">
        <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-[11px]">
          {selectedCount}
        </span>
        <span>Selected</span>
      </div>

      {/* Set Active */}
      <Button
        variant="ghost"
        size="sm"
        disabled={isLoading}
        onClick={() => onUpdateStatus(true)}
        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 h-8 px-2.5 text-xs font-medium"
      >
        Set Active
      </Button>

      {/* Set Paused */}
      <Button
        variant="ghost"
        size="sm"
        disabled={isLoading}
        onClick={() => onUpdateStatus(false)}
        className="text-slate-300 hover:text-white hover:bg-slate-800 h-8 px-2.5 text-xs font-medium"
      >
        Pause
      </Button>

      {/* Assign Group dropdown */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => setIsGroupMenuOpen(!isGroupMenuOpen)}
          className="border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 h-8 px-2.5 text-xs"
        >
          Assign Group ▾
        </Button>

        {isGroupMenuOpen && (
          <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1 z-50 text-slate-200 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                onAssignGroup(null);
                setIsGroupMenuOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition text-xs"
            >
              (No Group)
            </button>
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  onAssignGroup(g.id);
                  setIsGroupMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-200 transition text-xs flex items-center gap-2"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: g.colorHex || "#3B82F6" }}
                />
                <span className="truncate">{g.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delete */}
      <Button
        variant="ghost"
        size="sm"
        disabled={isLoading}
        onClick={async () => {
          if (confirm(`Are you sure you want to delete ${selectedCount} keywords?`)) {
            await onDelete();
          }
        }}
        className="text-red-400 hover:text-red-300 hover:bg-red-950/40 h-8 px-2.5 text-xs font-medium"
      >
        Delete
      </Button>

      {/* Clear selection */}
      <button
        type="button"
        onClick={onClearSelection}
        className="text-slate-400 hover:text-white pl-2 ml-1 border-l border-slate-700 text-xs transition"
      >
        Clear
      </button>
    </div>
  );
}
