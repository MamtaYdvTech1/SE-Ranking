import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GscPageTable } from "../GscPageTable";
import { GscPageRowDto, PaginatedList } from "@/lib/types";

describe("GscPageTable Component", () => {
  const mockPages: PaginatedList<GscPageRowDto> = {
    items: [
      {
        pageUrl: "https://example.com/features/rank-tracking",
        clicks: 4200,
        impressions: 48000,
        ctr: 0.0875,
        averagePosition: 3.4,
        queryCount: 142,
      },
      {
        pageUrl: "https://example.com/pricing",
        clicks: 1850,
        impressions: 22000,
        ctr: 0.0841,
        averagePosition: 5.1,
        queryCount: 65,
      },
    ],
    pageNumber: 1,
    pageSize: 10,
    totalCount: 25,
    totalPages: 3,
    hasPreviousPage: false,
    hasNextPage: true,
  };

  const defaultProps = {
    pages: mockPages,
    isLoading: false,
    search: "",
    onSearchChange: vi.fn(),
    page: 1,
    onPageChange: vi.fn(),
    sortBy: "clicks",
    sortDescending: true,
    onSortChange: vi.fn(),
  };

  it("renders header, title, and search input", () => {
    render(<GscPageTable {...defaultProps} />);

    expect(screen.getByText("Top Landing Pages")).toBeInTheDocument();
    expect(screen.getByText("Pages driving the highest search visibility and traffic")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search pages...")).toBeInTheDocument();
  });

  it("renders table rows with formatted metrics", () => {
    render(<GscPageTable {...defaultProps} />);

    expect(screen.getByText("https://example.com/features/rank-tracking")).toBeInTheDocument();
    expect(screen.getByText("https://example.com/pricing")).toBeInTheDocument();

    expect(screen.getByText("8.8%")).toBeInTheDocument();
    expect(screen.getByText("8.4%")).toBeInTheDocument();

    expect(screen.getByText("3.4")).toBeInTheDocument();
    expect(screen.getByText("5.1")).toBeInTheDocument();

    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText("65")).toBeInTheDocument();
  });

  it("displays loading state message when isLoading is true", () => {
    render(<GscPageTable {...defaultProps} isLoading={true} />);

    expect(screen.getByText("Loading landing pages...")).toBeInTheDocument();
    expect(screen.queryByText("https://example.com/features/rank-tracking")).not.toBeInTheDocument();
  });

  it("displays empty state when pages items are empty or pages is null", () => {
    render(
      <GscPageTable
        {...defaultProps}
        pages={{
          items: [],
          pageNumber: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        }}
      />
    );

    expect(screen.getByText("No Search Console landing pages found.")).toBeInTheDocument();
  });

  it("calls onSearchChange when typing in search input", () => {
    const onSearchChange = vi.fn();
    render(<GscPageTable {...defaultProps} onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText("Search pages...");
    fireEvent.change(searchInput, { target: { value: "pricing" } });

    expect(onSearchChange).toHaveBeenCalledWith("pricing");
  });

  it("calls onSortChange and displays sort indicators", () => {
    const onSortChange = vi.fn();
    const { rerender } = render(
      <GscPageTable
        {...defaultProps}
        sortBy="clicks"
        sortDescending={true}
        onSortChange={onSortChange}
      />
    );

    // Clicks header should display down arrow
    expect(screen.getByText("▼")).toBeInTheDocument();

    // Click on Avg. Position column header
    const positionHeader = screen.getByText(/Avg\. Position/);
    fireEvent.click(positionHeader);
    expect(onSortChange).toHaveBeenCalledWith("position");

    // Rerender with position ascending
    rerender(
      <GscPageTable
        {...defaultProps}
        sortBy="position"
        sortDescending={false}
        onSortChange={onSortChange}
      />
    );

    expect(screen.getByText("▲")).toBeInTheDocument();
  });

  it("handles pagination navigation and disables boundary buttons", () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      <GscPageTable {...defaultProps} page={1} onPageChange={onPageChange} />
    );

    expect(screen.getByText("Showing 1 to 10 of 25 pages")).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    const prevButton = screen.getByRole("button", { name: "Previous" });
    const nextButton = screen.getByRole("button", { name: "Next" });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(2);

    // Rerender on last page
    rerender(
      <GscPageTable {...defaultProps} page={3} onPageChange={onPageChange} />
    );

    expect(screen.getByText("Showing 21 to 25 of 25 pages")).toBeInTheDocument();
    expect(prevButton).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    fireEvent.click(prevButton);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
