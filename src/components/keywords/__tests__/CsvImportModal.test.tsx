import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CsvImportModal } from "../CsvImportModal";
import { api, ApiError } from "@/lib/api";

describe("CsvImportModal Component", () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when isOpen is false", () => {
    const { container } = render(
      <CsvImportModal
        projectId="proj-123"
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders modal header, dropzone, and column format guide when isOpen is true", () => {
    render(
      <CsvImportModal
        projectId="proj-123"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByRole("heading", { name: /Bulk Import Keywords \(CSV\)/i })).toBeInTheDocument();
    expect(screen.getByText(/Click to browse or drag and drop your \.csv file here/i)).toBeInTheDocument();
    expect(screen.getByText(/Expected CSV Column Headers:/i)).toBeInTheDocument();
    expect(screen.getByText(/keyword,search_engine,country,device,location,search_intent,target_url,group,tags/i)).toBeInTheDocument();
  });

  it("handles CSV file upload, parses preview rows and computes valid/invalid counts", async () => {
    render(
      <CsvImportModal
        projectId="proj-123"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const csvContent =
      "keyword,search_engine,country,device,group\n" +
      "work composer download,google,US,desktop,Core\n" +
      ",google,US,desktop,Core\n"; // 2nd row is empty keyword -> invalid

    const file = new File([csvContent], "keywords.csv", { type: "text/csv" });
    const input = document.getElementById("csv-file-input") as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText(/Import Preview \(2 rows\)/i)).toBeInTheDocument();
    expect(screen.getByText("Valid: 1")).toBeInTheDocument();
    expect(screen.getByText("Invalid: 1")).toBeInTheDocument();
    expect(screen.getByText("work composer download")).toBeInTheDocument();
    expect(screen.getByText("Keyword empty")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Import 1 Keywords/i })).toBeEnabled();
  });

  it("shows error when CSV does not contain a keyword column header", async () => {
    render(
      <CsvImportModal
        projectId="proj-123"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const csvContent = "searchengine,country\ngoogle,US\n";
    const file = new File([csvContent], "bad.csv", { type: "text/csv" });
    const input = document.getElementById("csv-file-input") as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(
      await screen.findByText(/CSV header must contain a 'keyword' column\./i)
    ).toBeInTheDocument();
  });

  it("successfully commits import via api.keywords.importCsv and displays results view", async () => {
    vi.spyOn(api.keywords, "importCsv").mockResolvedValueOnce({
      success: true,
      statusCode: 200,
      timestamp: "2026-09-30T00:00:00Z",
      data: {
        totalProcessed: 5,
        importedCount: 4,
        skippedDuplicatesCount: 1,
        failedCount: 0,
        errors: ["Row 5: duplicate keyword skipped"],
      },
    });

    render(
      <CsvImportModal
        projectId="proj-123"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const csvContent = "keyword\nkw1\nkw2\n";
    const file = new File([csvContent], "valid.csv", { type: "text/csv" });
    const input = document.getElementById("csv-file-input") as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    const importBtn = await screen.findByRole("button", { name: /Import 2 Keywords/i });
    fireEvent.click(importBtn);

    expect(await screen.findByText(/Import Completed Successfully/i)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText(/Row 5: duplicate keyword skipped/i)).toBeInTheDocument();

    expect(mockOnSuccess).toHaveBeenCalledTimes(1);

    const doneBtn = screen.getByRole("button", { name: /Done \/ View Catalogue/i });
    fireEvent.click(doneBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("displays error message when upload fails with ApiError", async () => {
    vi.spyOn(api.keywords, "importCsv").mockRejectedValueOnce(
      new ApiError("Server refused import format", 422)
    );

    render(
      <CsvImportModal
        projectId="proj-123"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const csvContent = "keyword\nkw1\n";
    const file = new File([csvContent], "valid.csv", { type: "text/csv" });
    const input = document.getElementById("csv-file-input") as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    const importBtn = await screen.findByRole("button", { name: /Import 1 Keywords/i });
    fireEvent.click(importBtn);

    expect(await screen.findByText(/Server refused import format/i)).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("calls onClose when Cancel button or ✕ icon is clicked", () => {
    render(
      <CsvImportModal
        projectId="proj-123"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    const closeIcon = screen.getByRole("button", { name: /✕/i });
    fireEvent.click(closeIcon);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
