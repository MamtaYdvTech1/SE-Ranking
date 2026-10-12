import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BulkActionBar } from "../BulkActionBar";
import { KeywordGroupDto } from "@/lib/types";

describe("BulkActionBar Component", () => {
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
      name: "High Intent",
      colorHex: "#10b981",
      keywordCount: 12,
      createdAt: "2026-01-01T00:00:00Z",
    },
  ];

  const mockOnUpdateStatus = vi.fn().mockResolvedValue(undefined);
  const mockOnAssignGroup = vi.fn().mockResolvedValue(undefined);
  const mockOnDelete = vi.fn().mockResolvedValue(undefined);
  const mockOnClearSelection = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when selectedCount is 0", () => {
    const { container } = render(
      <BulkActionBar
        selectedCount={0}
        groups={mockGroups}
        onUpdateStatus={mockOnUpdateStatus}
        onAssignGroup={mockOnAssignGroup}
        onDelete={mockOnDelete}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders selected badge and all bulk action controls when selectedCount > 0", () => {
    render(
      <BulkActionBar
        selectedCount={5}
        groups={mockGroups}
        onUpdateStatus={mockOnUpdateStatus}
        onAssignGroup={mockOnAssignGroup}
        onDelete={mockOnDelete}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Set Active/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pause/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Assign Group/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delete/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Clear/i })).toBeInTheDocument();
  });

  it("triggers onUpdateStatus with true when Set Active is clicked", async () => {
    render(
      <BulkActionBar
        selectedCount={3}
        groups={mockGroups}
        onUpdateStatus={mockOnUpdateStatus}
        onAssignGroup={mockOnAssignGroup}
        onDelete={mockOnDelete}
        onClearSelection={mockOnClearSelection}
      />
    );

    const setActiveBtn = screen.getByRole("button", { name: /Set Active/i });
    fireEvent.click(setActiveBtn);

    await waitFor(() => {
      expect(mockOnUpdateStatus).toHaveBeenCalledWith(true);
    });
  });

  it("triggers onUpdateStatus with false when Pause is clicked", async () => {
    render(
      <BulkActionBar
        selectedCount={3}
        groups={mockGroups}
        onUpdateStatus={mockOnUpdateStatus}
        onAssignGroup={mockOnAssignGroup}
        onDelete={mockOnDelete}
        onClearSelection={mockOnClearSelection}
      />
    );

    const pauseBtn = screen.getByRole("button", { name: /Pause/i });
    fireEvent.click(pauseBtn);

    await waitFor(() => {
      expect(mockOnUpdateStatus).toHaveBeenCalledWith(false);
    });
  });

  it("opens group dropdown and assigns selected group or clears group", async () => {
    render(
      <BulkActionBar
        selectedCount={4}
        groups={mockGroups}
        onUpdateStatus={mockOnUpdateStatus}
        onAssignGroup={mockOnAssignGroup}
        onDelete={mockOnDelete}
        onClearSelection={mockOnClearSelection}
      />
    );

    const groupDropdownBtn = screen.getByRole("button", { name: /Assign Group/i });
    fireEvent.click(groupDropdownBtn);

    expect(screen.getByRole("button", { name: /Core Brand/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /High Intent/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\(No Group\)/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /High Intent/i }));

    await waitFor(() => {
      expect(mockOnAssignGroup).toHaveBeenCalledWith("grp-2");
    });
  });

  it("assigns null when (No Group) is selected from group dropdown", async () => {
    render(
      <BulkActionBar
        selectedCount={2}
        groups={mockGroups}
        onUpdateStatus={mockOnUpdateStatus}
        onAssignGroup={mockOnAssignGroup}
        onDelete={mockOnDelete}
        onClearSelection={mockOnClearSelection}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Assign Group/i }));
    fireEvent.click(screen.getByRole("button", { name: /\(No Group\)/i }));

    await waitFor(() => {
      expect(mockOnAssignGroup).toHaveBeenCalledWith(null);
    });
  });

  it("prompts confirmation on delete and calls onDelete when confirmed", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <BulkActionBar
        selectedCount={7}
        groups={mockGroups}
        onUpdateStatus={mockOnUpdateStatus}
        onAssignGroup={mockOnAssignGroup}
        onDelete={mockOnDelete}
        onClearSelection={mockOnClearSelection}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: /Delete/i });
    fireEvent.click(deleteBtn);

    expect(confirmSpy).toHaveBeenCalledWith("Are you sure you want to delete 7 keywords?");
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    confirmSpy.mockRestore();
  });

  it("does not call onDelete when confirmation is cancelled", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(
      <BulkActionBar
        selectedCount={7}
        groups={mockGroups}
        onUpdateStatus={mockOnUpdateStatus}
        onAssignGroup={mockOnAssignGroup}
        onDelete={mockOnDelete}
        onClearSelection={mockOnClearSelection}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: /Delete/i });
    fireEvent.click(deleteBtn);

    expect(mockOnDelete).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it("calls onClearSelection when Clear button is clicked", () => {
    render(
      <BulkActionBar
        selectedCount={3}
        groups={mockGroups}
        onUpdateStatus={mockOnUpdateStatus}
        onAssignGroup={mockOnAssignGroup}
        onDelete={mockOnDelete}
        onClearSelection={mockOnClearSelection}
      />
    );

    const clearBtn = screen.getByRole("button", { name: /Clear/i });
    fireEvent.click(clearBtn);

    expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
  });

  it("disables action buttons when isLoading is true", () => {
    render(
      <BulkActionBar
        selectedCount={3}
        groups={mockGroups}
        onUpdateStatus={mockOnUpdateStatus}
        onAssignGroup={mockOnAssignGroup}
        onDelete={mockOnDelete}
        onClearSelection={mockOnClearSelection}
        isLoading={true}
      />
    );

    expect(screen.getByRole("button", { name: /Set Active/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Pause/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Assign Group/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Delete/i })).toBeDisabled();
  });
});
