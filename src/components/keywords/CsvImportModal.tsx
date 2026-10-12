"use client";

import React, { useState } from "react";
import { api, ApiError } from "../../lib/api";
import { ImportKeywordsResultDto } from "../../lib/types";
import { Alert, Badge, Button } from "../ui";

interface CsvImportModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PreviewRow {
  rowNum: number;
  keyword: string;
  engine: string;
  country: string;
  device: string;
  group?: string;
  intent?: string;
  targetUrl?: string;
  isValid: boolean;
  errorReason?: string;
}

export function CsvImportModal({
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportKeywordsResultDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMessage(null);
    setImportResult(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setErrorMessage("The selected file is empty.");
          setIsParsing(false);
          return;
        }

        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length <= 1) {
          setErrorMessage("The CSV must contain a header row and at least one data row.");
          setIsParsing(false);
          return;
        }

        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().toLowerCase().replace(/["'\s_]/g, ""));

        const keywordIdx = headers.findIndex((h) => h === "keyword" || h === "keywordtext");
        const engineIdx = headers.findIndex((h) => h === "searchengine" || h === "engine");
        const countryIdx = headers.findIndex((h) => h === "country" || h === "countrycode");
        const deviceIdx = headers.findIndex((h) => h === "device");
        const groupIdx = headers.findIndex((h) => h === "group" || h === "groupname");
        const intentIdx = headers.findIndex((h) => h === "intent" || h === "searchintent");
        const urlIdx = headers.findIndex((h) => h === "targeturl" || h === "url");

        if (keywordIdx === -1) {
          setErrorMessage("CSV header must contain a 'keyword' column.");
          setIsParsing(false);
          return;
        }

        const parsed: PreviewRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const rawLine = lines[i];
          // Basic comma split respecting quotes
          const cols = rawLine.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
          const kw = cols[keywordIdx] || "";
          const eng = engineIdx !== -1 && cols[engineIdx] ? cols[engineIdx] : "google";
          const cntry = countryIdx !== -1 && cols[countryIdx] ? cols[countryIdx].toUpperCase() : "US";
          const dev = deviceIdx !== -1 && cols[deviceIdx] ? cols[deviceIdx].toLowerCase() : "desktop";
          const grp = groupIdx !== -1 ? cols[groupIdx] : undefined;
          const intnt = intentIdx !== -1 ? cols[intentIdx] : undefined;
          const url = urlIdx !== -1 ? cols[urlIdx] : undefined;

          let isValid = true;
          let reason: string | undefined;

          if (!kw) {
            isValid = false;
            reason = "Keyword empty";
          } else if (kw.length > 300) {
            isValid = false;
            reason = "Keyword > 300 chars";
          }

          parsed.push({
            rowNum: i,
            keyword: kw,
            engine: eng,
            country: cntry,
            device: dev,
            group: grp,
            intent: intnt,
            targetUrl: url,
            isValid,
            errorReason: reason,
          });
        }

        setPreviewRows(parsed);
      } catch {
        setErrorMessage("Failed to parse CSV file. Ensure it is valid comma-separated format.");
      } finally {
        setIsParsing(false);
      }
    };

    reader.readAsText(selectedFile);
  };

  const handleCommitImport = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const res = await api.keywords.importCsv(projectId, file);
      if (res.data) {
        setImportResult(res.data);
        onSuccess();
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to upload and import CSV.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const validCount = previewRows.filter((r) => r.isValid).length;
  const invalidCount = previewRows.filter((r) => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Bulk Import Keywords (CSV)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a standard CSV file to import keywords, groups, tags, and target URLs.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded p-1 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {errorMessage && (
            <Alert variant="error" className="py-2 text-xs">
              {errorMessage}
            </Alert>
          )}

          {importResult ? (
            /* Success State */
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                ✓
              </div>
              <h3 className="text-sm font-bold text-emerald-900">Import Completed Successfully</h3>
              <div className="flex justify-center gap-4 text-xs text-slate-700">
                <span className="bg-white px-3 py-1.5 rounded border border-emerald-200">
                  Total Processed: <strong>{importResult.totalProcessed}</strong>
                </span>
                <span className="bg-white px-3 py-1.5 rounded border border-emerald-200 text-emerald-700">
                  Imported: <strong>{importResult.importedCount}</strong>
                </span>
                <span className="bg-white px-3 py-1.5 rounded border border-emerald-200 text-amber-700">
                  Duplicates Skipped: <strong>{importResult.skippedDuplicatesCount}</strong>
                </span>
              </div>
              {importResult.errors.length > 0 && (
                <div className="text-left bg-white p-3 rounded border border-amber-200 mt-2 max-h-32 overflow-y-auto">
                  <p className="font-semibold text-amber-900 mb-1">Warnings / Row Errors:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="pt-2">
                <Button variant="primary" size="sm" onClick={onClose}>
                  Done / View Catalogue
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* File Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-6 text-center bg-slate-50/60 transition cursor-pointer"
                onClick={() => document.getElementById("csv-file-input")?.click()}
              >
                <svg
                  className="w-8 h-8 text-slate-400 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-xs font-semibold text-slate-700">
                  {file ? file.name : "Click to browse or drag and drop your .csv file here"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports up to 2,000 keywords per batch
                </p>
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Format Reference Guide */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-700 mb-1">Expected CSV Column Headers:</p>
                <code className="text-[11px] text-blue-700 bg-white px-2 py-1 rounded border border-slate-200 block font-mono overflow-x-auto">
                  keyword,search_engine,country,device,location,search_intent,target_url,group,tags
                </code>
              </div>

              {/* Validation Preview Table */}
              {previewRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Import Preview ({previewRows.length} rows)
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Valid: {validCount}</Badge>
                      {invalidCount > 0 && <Badge variant="danger">Invalid: {invalidCount}</Badge>}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-48 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="bg-slate-100 text-slate-600 sticky top-0 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">Keyword</th>
                          <th className="p-2">Device</th>
                          <th className="p-2">Country</th>
                          <th className="p-2">Group</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-normal">
                        {previewRows.slice(0, 15).map((row) => (
                          <tr key={row.rowNum} className={row.isValid ? "hover:bg-slate-50" : "bg-red-50/50"}>
                            <td className="p-2 text-slate-400 font-mono">{row.rowNum}</td>
                            <td className="p-2 font-medium text-slate-900">{row.keyword || "—"}</td>
                            <td className="p-2 text-slate-600">{row.device}</td>
                            <td className="p-2 text-slate-600">{row.country}</td>
                            <td className="p-2 text-slate-600">{row.group || "—"}</td>
                            <td className="p-2">
                              {row.isValid ? (
                                <span className="text-emerald-600 font-semibold">Ready</span>
                              ) : (
                                <span className="text-red-600 font-semibold">{row.errorReason}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {previewRows.length > 15 && (
                    <p className="text-[11px] text-slate-400 text-center">
                      Showing first 15 of {previewRows.length} rows.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!importResult && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading || isParsing}
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isUploading || isParsing || validCount === 0}
              onClick={handleCommitImport}
              className="text-xs"
            >
              {isUploading ? "Importing..." : `Import ${validCount} Keywords`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
