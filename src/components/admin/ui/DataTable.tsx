"use client";

import React, { useState, useMemo } from "react";
import { Download, ChevronUp, ChevronDown, Eye, CheckSquare, Square } from "lucide-react";
import { sanitizeCsvValue } from "@/lib/csvUtils";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  exportValue?: (row: T) => string | number | null | undefined;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onSortChange?: (columnKey: string, direction: "asc" | "desc") => void;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  isLoading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selected: string[]) => void;
  idGetter?: (row: T) => string;
  exportFilename?: string;
  bulkActions?: React.ReactNode;
  filterControls?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onSortChange,
  sortBy,
  sortDir = "desc",
  isLoading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  idGetter = (row) => row.id || row.key,
  exportFilename = "export.csv",
  bulkActions,
  filterControls,
}: DataTableProps<T>) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map((c) => c.key));
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Toggle single row selection
  const toggleSelectRow = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  // Toggle select all on current page
  const allCurrentPageSelected = useMemo(() => {
    if (data.length === 0) return false;
    return data.every((row) => selectedIds.includes(idGetter(row)));
  }, [data, selectedIds, idGetter]);

  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allCurrentPageSelected) {
      const pageIds = data.map(idGetter);
      onSelectionChange(selectedIds.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = data.map(idGetter);
      const combined = Array.from(new Set([...selectedIds, ...pageIds]));
      onSelectionChange(combined);
    }
  };

  // Safe CSV export with formula injection protection
  const handleExportCsv = () => {
    const activeCols = columns.filter((c) => visibleColumns.includes(c.key));
    const headerRow = activeCols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");

    const rows = data.map((row) => {
      return activeCols
        .map((c) => {
          const rawVal = c.exportValue ? c.exportValue(row) : row[c.key];
          // Prepend single quote if dangerous formula prefix
          const val = rawVal === null || rawVal === undefined ? "" : String(rawVal).trim();
          if (/^[=+\-@\t\r]/.test(val)) {
            return `"'${val.replace(/"/g, '""')}"`;
          }
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headerRow, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Filters + Bulk Actions + Column Toggle + CSV Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {filterControls}
          {selectable && selectedIds.length > 0 && bulkActions && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-emerald-400 text-xs font-medium">
              <span>{selectedIds.length} selected</span>
              <div className="h-3 w-px bg-emerald-500/30 mx-1" />
              {bulkActions}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Column Toggle Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer focus:ring-2 focus:ring-emerald-500/40"
              aria-label="Toggle visible columns"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Columns</span>
            </button>

            {isColumnDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 rounded-xl shadow-xl py-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Show Columns
                </div>
                {columns.map((c) => {
                  const isChecked = visibleColumns.includes(c.key);
                  return (
                    <label
                      key={c.key}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            if (visibleColumns.length > 1) {
                              setVisibleColumns(visibleColumns.filter((k) => k !== c.key));
                            }
                          } else {
                            setVisibleColumns([...visibleColumns, c.key]);
                          }
                        }}
                        className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500/40 bg-white dark:bg-slate-950"
                      />
                      <span className="font-medium">{c.header}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCsv}
            disabled={data.length === 0}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 disabled:opacity-40 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer focus:ring-2 focus:ring-emerald-500/40"
            aria-label="Export table as CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="relative rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-xs dark:shadow-none transition-colors">
        <div className="overflow-x-auto min-h-[220px]">
          <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200 border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800/80">
              <tr>
                {selectable && (
                  <th className="w-10 px-4 py-3 text-center">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      aria-label="Select all on this page"
                    >
                      {allCurrentPageSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                {columns
                  .filter((c) => visibleColumns.includes(c.key))
                  .map((c) => {
                    const isSorted = sortBy === c.key;
                    return (
                      <th
                        key={c.key}
                        className={`px-4 py-3 select-none ${
                          c.sortable ? "cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors" : ""
                        }`}
                        onClick={() => {
                          if (c.sortable && onSortChange) {
                            const newDir = isSorted && sortDir === "asc" ? "desc" : "asc";
                            onSortChange(c.key, newDir);
                          }
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{c.header}</span>
                          {c.sortable && (
                            <span className="text-slate-400 dark:text-slate-500">
                              {isSorted ? (
                                sortDir === "asc" ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                )
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 opacity-30" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                Array.from({ length: Math.min(5, pageSize) }).map((_, i) => (
                  <tr key={`skel-${i}`} className="animate-pulse">
                    {selectable && <td className="px-4 py-3.5 bg-slate-50 dark:bg-slate-900/30" />}
                    {columns
                      .filter((c) => visibleColumns.includes(c.key))
                      .map((c) => (
                        <td key={c.key} className="px-4 py-3.5">
                          <div className="h-4 bg-slate-200 dark:bg-slate-800/70 rounded w-3/4" />
                        </td>
                      ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.filter((c) => visibleColumns.includes(c.key)).length + (selectable ? 1 : 0)}
                    className="px-4 py-12 text-center text-slate-500 dark:text-slate-400 font-medium"
                  >
                    No matching records found.
                  </td>
                </tr>
              ) : (
                data.map((row) => {
                  const rowId = idGetter(row);
                  const isSelected = selectedIds.includes(rowId);
                  return (
                    <tr
                      key={rowId}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? "bg-emerald-500/[0.06] dark:bg-emerald-500/[0.04]" : ""
                      }`}
                    >
                      {selectable && (
                        <td className="w-10 px-4 py-3.5 text-center">
                          <button
                            onClick={() => toggleSelectRow(rowId)}
                            className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            aria-label={`Select row ${rowId}`}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                      {columns
                        .filter((c) => visibleColumns.includes(c.key))
                        .map((c) => (
                          <td key={c.key} className="px-4 py-3.5 whitespace-nowrap">
                            {c.render ? c.render(row) : row[c.key] ?? "—"}
                          </td>
                        ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-slate-50/90 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/80 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div>
            Showing{" "}
            <span className="font-bold text-slate-900 dark:text-slate-200">
              {data.length === 0 ? 0 : (page - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-900 dark:text-slate-200">
              {Math.min(totalCount, page * pageSize)}
            </span>{" "}
            of <span className="font-bold text-slate-900 dark:text-slate-200">{totalCount}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900/80 font-medium transition-colors shadow-xs cursor-pointer"
            >
              Previous
            </button>
            <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900/80 font-medium transition-colors shadow-xs cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
