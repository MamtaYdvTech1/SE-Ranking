"use client";

import React, { useRef, useEffect } from "react";

export const CALENDAR_YEARS = Array.from({ length: 15 }, (_, i) => 2016 + i); // 2016 through 2030

export interface CalendarYearDropdownProps {
  year: number;
  onSelectYear: (year: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  ariaLabel?: string;
}

export function CalendarYearDropdown({
  year,
  onSelectYear,
  isOpen,
  onToggle,
  onClose,
  ariaLabel,
}: CalendarYearDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeYearRef = useRef<HTMLButtonElement>(null);

  // Handle outside click and Escape key dismissal
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-expanded={isOpen}
        aria-label={ariaLabel || `Select year, current year is ${year}`}
        className={
          isOpen
            ? "bg-[#dce4ec] dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded px-1.5 py-0.5 inline-flex items-center gap-1 font-semibold text-xs cursor-pointer select-none transition"
            : "text-xs font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 px-1.5 py-0.5 rounded cursor-pointer transition select-none"
        }
      >
        <span>{year}</span>
        <span className="sr-only">{isOpen ? "▴▾" : "▾"}</span>
        <svg
          className="w-2.5 h-3 text-slate-600 dark:text-slate-300 select-none pointer-events-none"
          viewBox="0 0 10 14"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5 2L1.5 6h7L5 2z" />
          <path d="M5 12L1.5 8h7L5 12z" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Year selector"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-24 max-h-52 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-xl py-1 z-[60] text-xs font-medium text-slate-800 dark:text-slate-200"
        >
          {CALENDAR_YEARS.map((y) => {
            const isSelected = y === year;
            return (
              <button
                key={y}
                ref={isSelected ? activeYearRef : null}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectYear(y);
                  onClose();
                }}
                className={`w-full text-center py-1.5 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition select-none text-xs ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-800 dark:text-slate-200 font-medium"
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
