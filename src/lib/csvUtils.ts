/**
 * Client-safe CSV export utility functions with formula injection protection.
 */

/**
 * Sanitizes a cell for CSV export to strictly prevent CSV formula injection (DDE attacks).
 * If a cell begins with '=', '+', '-', '@', '\t', or '\r', it prepends a single quote.
 */
export function sanitizeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str.replace(/"/g, '""')}`;
  }
  return str.replace(/"/g, '""');
}
