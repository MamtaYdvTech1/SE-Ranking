import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddCompetitorModal } from "../AddCompetitorModal";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  api: {
    competitors: {
      add: vi.fn(),
    },
  },
}));

describe("AddCompetitorModal Component", () => {
  const defaultProps = {
    projectId: "proj-123",
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders null when isOpen is false", () => {
    const { container } = render(<AddCompetitorModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders modal form fields when isOpen is true", () => {
    render(<AddCompetitorModal {...defaultProps} />);
    expect(screen.getByText("Add Competitor Domain")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Acme Corp")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. competitor.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Key strengths, focus keywords...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Competitor" })).toBeInTheDocument();
  });

  it("submits form data and triggers onSuccess when API call succeeds", async () => {
    const mockCompetitor = {
      id: "comp-1",
      projectId: "proj-123",
      name: "Acme Corp",
      domain: "acme.com",
      notes: "Direct competitor",
    };

    (api.competitors.add as any).mockResolvedValueOnce({
      success: true,
      data: mockCompetitor,
    });

    render(<AddCompetitorModal {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. Acme Corp"), {
      target: { value: "Acme Corp" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. competitor.com"), {
      target: { value: "acme.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Key strengths, focus keywords..."), {
      target: { value: "Direct competitor" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Competitor" }));

    await waitFor(() => {
      expect(api.competitors.add).toHaveBeenCalledWith("proj-123", {
        name: "Acme Corp",
        domain: "acme.com",
        notes: "Direct competitor",
      });
      expect(defaultProps.onSuccess).toHaveBeenCalledWith(mockCompetitor);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it("displays error message when API returns failure", async () => {
    (api.competitors.add as any).mockResolvedValueOnce({
      success: false,
      message: "Competitor domain already exists.",
    });

    render(<AddCompetitorModal {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. Acme Corp"), {
      target: { value: "Acme Corp" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. competitor.com"), {
      target: { value: "acme.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Competitor" }));

    await waitFor(() => {
      expect(screen.getByText("Competitor domain already exists.")).toBeInTheDocument();
      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  it("calls onClose when cancel or close button is clicked", () => {
    render(<AddCompetitorModal {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText("Close"));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });
});
