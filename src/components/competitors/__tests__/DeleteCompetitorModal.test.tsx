import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { DeleteCompetitorModal } from "../DeleteCompetitorModal";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: {
    competitors: {
      delete: vi.fn(),
    },
  },
}));

describe("DeleteCompetitorModal Component", () => {
  const mockCompetitor = {
    id: "comp-1",
    name: "Hubstaff",
    domain: "hubstaff.com",
  };

  const defaultProps = {
    projectId: "proj-123",
    competitor: mockCompetitor,
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders null when isOpen is false", () => {
    const { container } = render(
      <DeleteCompetitorModal {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders null when competitor is null", () => {
    const { container } = render(
      <DeleteCompetitorModal {...defaultProps} competitor={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders confirmation modal with competitor name and domain", () => {
    render(<DeleteCompetitorModal {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: "Delete Competitor" })
    ).toBeInTheDocument();
    expect(screen.getByText("Hubstaff")).toBeInTheDocument();
    expect(screen.getByText(/hubstaff\.com/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete Competitor" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", () => {
    render(<DeleteCompetitorModal {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls api.competitors.delete, onSuccess, and onClose upon deletion", async () => {
    (api.competitors.delete as any).mockResolvedValue({
      success: true,
      data: { success: true },
    });

    render(<DeleteCompetitorModal {...defaultProps} />);

    const deleteBtn = screen.getByRole("button", { name: "Delete Competitor" });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(api.competitors.delete).toHaveBeenCalledWith("proj-123", "comp-1");
    });

    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalledWith("comp-1");
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("displays error banner when deletion fails", async () => {
    (api.competitors.delete as any).mockResolvedValue({
      success: false,
      message: "Server error deleting competitor.",
    });

    render(<DeleteCompetitorModal {...defaultProps} />);

    const deleteBtn = screen.getByRole("button", { name: "Delete Competitor" });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Server error deleting competitor.")
      ).toBeInTheDocument();
    });

    expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
});
