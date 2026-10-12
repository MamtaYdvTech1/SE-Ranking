import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GscQueryTable } from "../GscQueryTable";
import { GscQueryRowDto, PaginatedList } from "@/lib/types";

describe("GscQueryTable Component", () => {
  const mockQueries: PaginatedList<GscQueryRowDto> = {
    items: [
      {
        queryText: "work composer download",
        clicks: 1240,
        impressions: 14500,
        ctr: 0.0855,
        position: 2.1,
      },
      {
        queryText: "employee monitoring software",
        clicks: 890,
        impressions: 18200,
        ctr: 0.0489,
        position: 4.8,
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
    queries: mockQueries,
    isLoading: false,
    search: "",
    onSearchChange: vi.fn(),
    page: 1,
    onPageChange: vi.fn(),
    sortBy: "clicks",
    sortDescending: true,
    onSortChange: vi.fn(),
    onSelectQuery: vi.fn(),
  };

  it("renders header, title, and search input", () => {
    render(<GscQueryTable {...defaultProps} />);

    expect(screen.getByText("Search Queries")).toBeInTheDocument();
    expect(
      screen.getByText("Queries bringing organic Google impressions to your site")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search queries...")).toBeInTheDocument();
  });

  it("renders table rows with formatted metrics", () => {
    render(<GscQueryTable {...defaultProps} />);

    expect(screen.getByText("work composer download")).toBeInTheDocument();
    expect(screen.getByText("employee monitoring software")).toBeInTheDocument();

    expect(screen.getByText("8.6%")).toBeInTheDocument();
    expect(screen.getByText("4.9%")).toBeInTheDocument();

    expect(screen.getByText("2.1")).toBeInTheDocument();
    expect(screen.getByText("4.8")).toBeInTheDocument();
  });

  it("calls onSelectQuery when clicking a query row", () => {
    const onSelectQuery = vi.fn();
    render(<GscQueryTable {...defaultProps} onSelectQuery={onSelectQuery} />);

    const row = screen.getByText("work composer download");
    fireEvent.click(row);

    expect(onSelectQuery).toHaveBeenCalledWith("work composer download");
  });

  it("displays loading state message when isLoading is true", () => {
    render(<GscQueryTable {...defaultProps} isLoading={true} />);

    expect(screen.getByText("Loading queries...")).toBeInTheDocument();
    expect(screen.queryByText("work composer download")).not.toBeInTheDocument();
  });

  it("displays empty state when queries items are empty", () => {
    render(
      <GscQueryTable
        {...defaultProps}
        queries={{
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

    expect(screen.getByText("No Search Console queries found.")).toBeInTheDocument();
  });

  it("calls onSearchChange when typing in search input", () => {
    const onSearchChange = vi.fn();
    render(<GscQueryTable {...defaultProps} onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText("Search queries...");
    fireEvent.change(searchInput, { target: { value: "monitoring" } });

    expect(onSearchChange).toHaveBeenCalledWith("monitoring");
  });

  it("calls onSortChange and displays sort indicators", () => {
    const onSortChange = vi.fn();
    const { rerender } = render(
      <GscQueryTable
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
      <GscQueryTable
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
      <GscQueryTable {...defaultProps} page={1} onPageChange={onPageChange} />
    );

    expect(screen.getByText("Showing 1 to 10 of 25 queries")).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    const prevButton = screen.getByRole("button", { name: "Previous" });
    const nextButton = screen.getByRole("button", { name: "Next" });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(2);

    // Rerender on last page
    rerender(
      <GscQueryTable {...defaultProps} page={3} onPageChange={onPageChange} />
    );

    expect(screen.getByText("Showing 21 to 25 of 25 queries")).toBeInTheDocument();
    expect(prevButton).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    fireEvent.click(prevButton);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
