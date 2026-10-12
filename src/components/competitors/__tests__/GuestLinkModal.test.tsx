import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GuestLinkModal, GUEST_MODULE_DEFINITIONS } from "../GuestLinkModal";

describe("GuestLinkModal Component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    projectId: "proj-123",
    projectDomain: "workcomposer.com",
    hideSearchVolume: false,
    setHideSearchVolume: vi.fn(),
    includeFilterSort: true,
    setIncludeFilterSort: vi.fn(),
    guestModules: {
      overview: true,
      rankings: true,
      analytics: false,
      competitors: true,
      aiResults: false,
      audit: false,
      marketing: false,
    },
    setGuestModules: vi.fn(),
    onCopied: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it("renders null when isOpen is false", () => {
    const { container } = render(
      <GuestLinkModal {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal dialog, generated url, and module checkboxes", () => {
    render(<GuestLinkModal {...defaultProps} />);

    expect(screen.getByText("Get access to guest links")).toBeInTheDocument();
    expect(screen.getByLabelText("Generated guest link URL")).toBeInTheDocument();

    GUEST_MODULE_DEFINITIONS.forEach((mod) => {
      expect(screen.getByText(mod.label)).toBeInTheDocument();
    });
  });

  it("copies link to clipboard when clicking Copy link button", () => {
    render(<GuestLinkModal {...defaultProps} />);

    const copyBtns = screen.getAllByRole("button", { name: /copy link/i });
    fireEvent.click(copyBtns[0]);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(defaultProps.onCopied).toHaveBeenCalled();
    expect(screen.getByText(/Link copied to clipboard successfully!/i)).toBeInTheDocument();
  });

  it("toggles hideSearchVolume when toggle checkbox is changed", () => {
    render(<GuestLinkModal {...defaultProps} />);

    const toggle = screen.getByTestId("guest-link-hide-sv-toggle");
    fireEvent.click(toggle);

    expect(defaultProps.setHideSearchVolume).toHaveBeenCalledWith(true);
  });

  it("toggles module accessibility when clicking module checkbox", () => {
    render(<GuestLinkModal {...defaultProps} />);

    const compModuleCheckbox = screen.getByTestId("guest-module-competitors");
    fireEvent.click(compModuleCheckbox);

    expect(defaultProps.setGuestModules).toHaveBeenCalled();
  });

  it("selects all modules when clicking 'Select all'", () => {
    render(<GuestLinkModal {...defaultProps} />);

    const selectAllBtn = screen.getByRole("button", { name: "Select all" });
    fireEvent.click(selectAllBtn);

    expect(defaultProps.setGuestModules).toHaveBeenCalled();
  });

  it("clears all modules when clicking 'Clear all'", () => {
    render(<GuestLinkModal {...defaultProps} />);

    const clearAllBtn = screen.getByRole("button", { name: "Clear all" });
    fireEvent.click(clearAllBtn);

    expect(defaultProps.setGuestModules).toHaveBeenCalled();
  });

  it("closes modal on Escape key press", () => {
    render(<GuestLinkModal {...defaultProps} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
