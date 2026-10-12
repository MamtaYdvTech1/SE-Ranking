import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WebsiteSearch } from "../WebsiteSearch";

describe("WebsiteSearch Component", () => {
  it("renders search input with placeholder and value", () => {
    const onQueryChange = vi.fn();
    render(<WebsiteSearch query="example" onQueryChange={onQueryChange} placeholder="Search domains" />);

    const input = screen.getByPlaceholderText("Search domains") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("example");
  });

  it("calls onQueryChange when typing in search input", () => {
    const onQueryChange = vi.fn();
    render(<WebsiteSearch query="" onQueryChange={onQueryChange} />);

    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "test" } });
    expect(onQueryChange).toHaveBeenCalledWith("test");
  });

  it("clears search query when clicking clear button", () => {
    const onQueryChange = vi.fn();
    render(<WebsiteSearch query="zenith" onQueryChange={onQueryChange} />);

    const clearBtn = screen.getByLabelText("Clear search query");
    fireEvent.click(clearBtn);
    expect(onQueryChange).toHaveBeenCalledWith("");
  });
});
