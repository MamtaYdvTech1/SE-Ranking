import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { EditCompetitorModal } from "../EditCompetitorModal";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: {
    competitors: {
      update: vi.fn(),
    },
  },
}));

describe("EditCompetitorModal Component", () => {
  const mockCompetitor = {
    id: "comp-1",
    name: "Hubstaff",
    domain: "hubstaff.com",
    notes: "Main tracking competitor",
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
      <EditCompetitorModal {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders null when competitor is null", () => {
    const { container } = render(
      <EditCompetitorModal {...defaultProps} competitor={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("pre-populates form inputs with competitor data", () => {
    render(<EditCompetitorModal {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: "Edit Competitor" })
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Hubstaff")).toBeInTheDocument();
    expect(screen.getByDisplayValue("hubstaff.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Main tracking competitor")).toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", () => {
    render(<EditCompetitorModal {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls api.competitors.update, onSuccess, and onClose upon submit", async () => {
    (api.competitors.update as any).mockResolvedValue({
      success: true,
      data: {
        ...mockCompetitor,
        name: "Hubstaff Inc",
      },
    });

    render(<EditCompetitorModal {...defaultProps} />);

    const nameInput = screen.getByDisplayValue("Hubstaff");
    fireEvent.change(nameInput, { target: { value: "Hubstaff Inc" } });

    const saveBtn = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.competitors.update).toHaveBeenCalledWith("proj-123", "comp-1", {
        name: "Hubstaff Inc",
        domain: "hubstaff.com",
        notes: "Main tracking competitor",
      });
    });

    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("displays error banner when update fails", async () => {
    (api.competitors.update as any).mockResolvedValue({
      success: false,
      message: "Server error updating competitor.",
    });

    render(<EditCompetitorModal {...defaultProps} />);

    const saveBtn = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Server error updating competitor.")
      ).toBeInTheDocument();
    });

    expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
});
