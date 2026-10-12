import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalendarYearDropdown, CALENDAR_YEARS } from "../CalendarYearDropdown";

describe("CalendarYearDropdown Component", () => {
  const defaultProps = {
    year: 2024,
    onSelectYear: vi.fn(),
    isOpen: false,
    onToggle: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders closed state with current year", () => {
    render(<CalendarYearDropdown {...defaultProps} />);
    const trigger = screen.getByRole("button", {
      name: "Select year, current year is 2024",
    });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("calls onToggle when trigger button is clicked", () => {
    render(<CalendarYearDropdown {...defaultProps} />);
    const trigger = screen.getByRole("button", {
      name: "Select year, current year is 2024",
    });
    fireEvent.click(trigger);
    expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
  });

  it("renders listbox with years when isOpen is true", () => {
    render(<CalendarYearDropdown {...defaultProps} isOpen={true} />);
    const listbox = screen.getByRole("listbox", { name: "Year selector" });
    expect(listbox).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(CALENDAR_YEARS.length);

    const selectedOption = screen.getByRole("option", { name: "2024" });
    expect(selectedOption).toHaveAttribute("aria-selected", "true");
  });

  it("calls onSelectYear and onClose when a year option is clicked", () => {
    render(<CalendarYearDropdown {...defaultProps} isOpen={true} />);
    const year2025Option = screen.getByRole("option", { name: "2025" });
    fireEvent.click(year2025Option);

    expect(defaultProps.onSelectYear).toHaveBeenCalledWith(2025);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    render(<CalendarYearDropdown {...defaultProps} isOpen={true} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking outside", () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <CalendarYearDropdown {...defaultProps} isOpen={true} />
      </div>
    );

    fireEvent.mouseDown(screen.getByTestId("outside-element"));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("uses custom ariaLabel when provided", () => {
    render(
      <CalendarYearDropdown
        {...defaultProps}
        ariaLabel="Custom Year Selector"
      />
    );
    expect(
      screen.getByRole("button", { name: "Custom Year Selector" })
    ).toBeInTheDocument();
  });
});
