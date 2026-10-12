import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GscDeviceCountryBreakdown } from "../GscDeviceCountryBreakdown";
import { GscCountryStatDto, GscDeviceStatDto } from "@/lib/types";

describe("GscDeviceCountryBreakdown Component", () => {
  const mockDeviceStats: GscDeviceStatDto[] = [
    {
      device: "DESKTOP",
      clicks: 12450,
      impressions: 184000,
      ctr: 0.0676,
      averagePosition: 6.8,
      clickShare: 0.65,
    },
    {
      device: "MOBILE",
      clicks: 6200,
      impressions: 98500,
      ctr: 0.0629,
      averagePosition: 7.4,
      clickShare: 0.32,
    },
    {
      device: "TABLET",
      clicks: 580,
      impressions: 8900,
      ctr: 0.0651,
      averagePosition: 6.9,
      clickShare: 0.03,
    },
  ];

  const mockCountryStats: GscCountryStatDto[] = [
    {
      countryCode: "USA",
      countryName: "United States",
      clicks: 9800,
      impressions: 142000,
      ctr: 0.069,
      averagePosition: 5.8,
    },
    {
      countryCode: "GBR",
      countryName: "United Kingdom",
      clicks: 3400,
      impressions: 51200,
      ctr: 0.0664,
      averagePosition: 6.4,
    },
    {
      countryCode: "DEU",
      countryName: "Germany",
      clicks: 2150,
      impressions: 34100,
      ctr: 0.063,
      averagePosition: 7.1,
    },
    {
      countryCode: "IND",
      countryName: "India",
      clicks: 1850,
      impressions: 28400,
      ctr: 0.0651,
      averagePosition: 8.2,
    },
  ];

  it("renders device and country breakdown sections with headers", () => {
    render(
      <GscDeviceCountryBreakdown
        deviceStats={mockDeviceStats}
        countryStats={mockCountryStats}
      />
    );

    expect(screen.getByTestId("gsc-breakdown")).toBeInTheDocument();
    expect(screen.getByText("Device Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Search performance split by user device type")).toBeInTheDocument();
    expect(screen.getByText("Top Geographic Markets")).toBeInTheDocument();
    expect(screen.getByText("Search performance distributed across top countries")).toBeInTheDocument();
  });

  it("renders device breakdown cards with click shares, progress bars, and metrics", () => {
    render(
      <GscDeviceCountryBreakdown
        deviceStats={mockDeviceStats}
        countryStats={mockCountryStats}
      />
    );

    const deviceSection = screen.getByTestId("device-breakdown");

    // Device names capitalized
    expect(deviceSection).toHaveTextContent("desktop");
    expect(deviceSection).toHaveTextContent("mobile");
    expect(deviceSection).toHaveTextContent("tablet");

    // Click shares
    expect(deviceSection).toHaveTextContent("65.0% click share");
    expect(deviceSection).toHaveTextContent("32.0% click share");
    expect(deviceSection).toHaveTextContent("3.0% click share");

    // Metrics
    expect(deviceSection).toHaveTextContent("6.8");
    expect(deviceSection).toHaveTextContent("7.4");
    expect(deviceSection).toHaveTextContent("6.9");
  });

  it("renders country breakdown table with country badges and performance columns", () => {
    render(
      <GscDeviceCountryBreakdown
        deviceStats={mockDeviceStats}
        countryStats={mockCountryStats}
      />
    );

    const countrySection = screen.getByTestId("country-breakdown");

    // Headers
    expect(countrySection).toHaveTextContent("Country");
    expect(countrySection).toHaveTextContent("Clicks");
    expect(countrySection).toHaveTextContent("Impressions");
    expect(countrySection).toHaveTextContent("CTR");
    expect(countrySection).toHaveTextContent("Avg. Pos");

    // Country codes
    expect(countrySection).toHaveTextContent("USA");
    expect(countrySection).toHaveTextContent("GBR");
    expect(countrySection).toHaveTextContent("DEU");
    expect(countrySection).toHaveTextContent("IND");

    // Row positions
    expect(countrySection).toHaveTextContent("5.8");
    expect(countrySection).toHaveTextContent("6.4");
    expect(countrySection).toHaveTextContent("7.1");
    expect(countrySection).toHaveTextContent("8.2");
  });

  it("renders empty state messages when deviceStats and countryStats are empty", () => {
    render(<GscDeviceCountryBreakdown deviceStats={[]} countryStats={[]} />);

    expect(screen.getByText("No device breakdown data available.")).toBeInTheDocument();
    expect(screen.getByText("No country breakdown data available.")).toBeInTheDocument();
  });
});
