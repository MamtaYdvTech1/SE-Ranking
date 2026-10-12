import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddKeywordModal } from "../AddKeywordModal";
import { api, ApiError } from "@/lib/api";
import { KeywordGroupDto } from "@/lib/types";

describe("AddKeywordModal Component", () => {
  const mockGroups: KeywordGroupDto[] = [
    {
      id: "grp-1",
      projectId: "proj-123",
      name: "Core Brand",
      colorHex: "#3b82f6",
      keywordCount: 5,
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "grp-2",
      projectId: "proj-123",
      name: "Competitors",
      colorHex: "#ef4444",
      keywordCount: 8,
      createdAt: "2026-01-01T00:00:00Z",
    },
  ];

  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when isOpen is false", () => {
    const { container } = render(
      <AddKeywordModal
        projectId="proj-123"
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        groups={mockGroups}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders modal header, tab switcher, and default single form fields when isOpen is true", () => {
    render(
      <AddKeywordModal
        projectId="proj-123"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        groups={mockGroups}
      />
    );

    expect(screen.getByRole("heading", { name: /Add Tracked Keywords/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Single Keyword/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Bulk Multi-Line/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Keyword Text/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Device Target/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Search Engine/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Keyword Group/i)).toBeInTheDocument();
  });

  it("switches to Bulk Multi-Line tab and shows multi-line textarea", () => {
    render(
      <AddKeywordModal
        projectId="proj-123"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        groups={mockGroups}
      />
    );

    const bulkTabBtn = screen.getByRole("button", { name: /Bulk Multi-Line/i });
    fireEvent.click(bulkTabBtn);

    expect(screen.getByLabelText(/Keywords \(One per line\)/i)).toBeInTheDocument();
  });

  it("displays validation error when single keyword input is empty on submit", async () => {
    render(
      <AddKeywordModal
        projectId="proj-123"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        groups={mockGroups}
      />
    );

    const form = screen.getByRole("button", { name: /Add Keyword/i }).closest("form")!;
    fireEvent.submit(form);

    expect(await screen.findByText(/Keyword text is required\./i)).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("successfully creates a single keyword with tags and group", async () => {
    vi.spyOn(api.keywords, "create").mockResolvedValueOnce({
      success: true,
      statusCode: 201,
      timestamp: "2026-09-30T00:00:00Z",
      data: {
        id: "kw-1",
        projectId: "proj-123",
        keywordText: "enterprise rank tracking",
        searchEngine: "google",
        countryCode: "US",
        languageCode: "en",
        device: "desktop",
        isActive: true,
        createdAt: "2026-09-30T00:00:00Z",
        tags: ["tier-1", "core"],
      },
    });

    render(
      <AddKeywordModal
        projectId="proj-123"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        groups={mockGroups}
      />
    );

    fireEvent.change(screen.getByLabelText(/Keyword Text/i), {
      target: { value: "enterprise rank tracking" },
    });
    fireEvent.change(screen.getByLabelText(/Target Landing Page URL/i), {
      target: { value: "https://workcomposer.com/enterprise" },
    });
    fireEvent.change(screen.getByLabelText(/Keyword Group/i), {
      target: { value: "grp-1" },
    });
    fireEvent.change(screen.getByLabelText(/Tags \(Comma-separated\)/i), {
      target: { value: "tier-1, core" },
    });

    const submitBtn = screen.getByRole("button", { name: /Add Keyword/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.keywords.create).toHaveBeenCalledWith("proj-123", {
        keywordText: "enterprise rank tracking",
        targetUrl: "https://workcomposer.com/enterprise",
        searchIntent: undefined,
        searchEngine: "google",
        device: "desktop",
        countryCode: "US",
        locationName: undefined,
        groupId: "grp-1",
        tags: ["tier-1", "core"],
      });
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("successfully imports bulk multi-line keywords", async () => {
    vi.spyOn(api.keywords, "bulk").mockResolvedValueOnce({
      success: true,
      statusCode: 200,
      timestamp: "2026-09-30T00:00:00Z",
      data: {
        totalProcessed: 2,
        importedCount: 2,
        skippedDuplicatesCount: 0,
        failedCount: 0,
        errors: [],
      },
    });

    render(
      <AddKeywordModal
        projectId="proj-123"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        groups={mockGroups}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Bulk Multi-Line/i }));

    const textarea = screen.getByLabelText(/Keywords \(One per line\)/i);
    fireEvent.change(textarea, {
      target: { value: "keyword alpha\nkeyword beta" },
    });

    const submitBtn = screen.getByRole("button", { name: /Add Keywords/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.keywords.bulk).toHaveBeenCalledWith(
        "proj-123",
        expect.arrayContaining([
          expect.objectContaining({ keyword: "keyword alpha" }),
          expect.objectContaining({ keyword: "keyword beta" }),
        ])
      );
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("handles ApiError properly and displays error message", async () => {
    vi.spyOn(api.keywords, "create").mockRejectedValueOnce(
      new ApiError("Duplicate keyword for this search engine and device", 400)
    );

    render(
      <AddKeywordModal
        projectId="proj-123"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        groups={mockGroups}
      />
    );

    fireEvent.change(screen.getByLabelText(/Keyword Text/i), {
      target: { value: "existing keyword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Keyword/i }));

    expect(
      await screen.findByText(/Duplicate keyword for this search engine and device/i)
    ).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("calls onClose when Cancel button or ✕ close icon is clicked", () => {
    render(
      <AddKeywordModal
        projectId="proj-123"
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        groups={mockGroups}
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
