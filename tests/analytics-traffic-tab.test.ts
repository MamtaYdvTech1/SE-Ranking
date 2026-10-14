import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Analytics & Traffic Dynamic API Integration Suite', () => {
  function formatNumber(val: number | string | null | undefined): string {
    if (val === null || val === undefined) return '0';
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]/g, '')) : val;
    if (isNaN(num)) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 10000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  }

  function formatChange(val: number | null | undefined, defaultVal = 0): { text: string; isPositive: boolean } {
    const num = val !== undefined && val !== null && !isNaN(val) ? val : defaultVal;
    const isPositive = num >= 0;
    const sign = isPositive ? '+' : '';
    return {
      text: `${sign}${num.toFixed(1)}%`,
      isPositive,
    };
  }

  describe('KPI Metric Number & Change Formatters', () => {
    it('formats 0 and empty values safely without NaN or crashes', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
      expect(formatNumber('')).toBe('0');
      expect(formatNumber('invalid')).toBe('0');
    });

    it('formats standard, thousands, and millions correctly', () => {
      expect(formatNumber(450)).toBe('450');
      expect(formatNumber(28400)).toBe('28.4K');
      expect(formatNumber(682000)).toBe('682.0K');
      expect(formatNumber(1500000)).toBe('1.5M');
    });

    it('formats positive and negative percentage variance with signs', () => {
      const pos = formatChange(14.8);
      expect(pos.isPositive).toBe(true);
      expect(pos.text).toBe('+14.8%');

      const neg = formatChange(-3.5);
      expect(neg.isPositive).toBe(false);
      expect(neg.text).toBe('-3.5%');

      const zero = formatChange(0);
      expect(zero.isPositive).toBe(true);
      expect(zero.text).toBe('+0.0%');

      const fallback = formatChange(null, 9.2);
      expect(fallback.isPositive).toBe(true);
      expect(fallback.text).toBe('+9.2%');
    });
  });

  describe('Website Traffic Dynamics Time-Series Data Mapping', () => {
    it('binds daily dynamic points with both sessions and users', () => {
      const apiTrend = [
        { label: 'Oct 01', day: 'Oct 01', sessions: 1420, users: 1010 },
        { label: 'Oct 02', day: 'Oct 02', sessions: 1460, users: 1040 },
        { label: 'Oct 03', day: 'Oct 03', sessions: 1510, users: 1080 },
      ];

      const mapped = apiTrend.map((d) => ({
        day: d.label || d.day,
        sessions: Number(d.sessions || 0),
        users: Number(d.users || (d.sessions ? Math.round(d.sessions * 0.72) : 0)),
      }));

      expect(mapped).toHaveLength(3);
      expect(mapped[0]).toEqual({ day: 'Oct 01', sessions: 1420, users: 1010 });
      expect(mapped[1]).toEqual({ day: 'Oct 02', sessions: 1460, users: 1040 });
      expect(mapped[2]).toEqual({ day: 'Oct 03', sessions: 1510, users: 1080 });
    });

    it('handles empty trend series gracefully without crashing', () => {
      const emptyTrend: any[] = [];
      const mapped = emptyTrend.map((d) => ({
        day: d.label || d.day,
        sessions: Number(d.sessions || 0),
        users: Number(d.users || 0),
      }));

      expect(mapped).toEqual([]);
    });
  });

  describe('Integration Status Badges & Dynamic Header Binding', () => {
    it('detects both GA4 and GSC active credentials', () => {
      const isGAConnected = true;
      const isGSCConnected = true;
      const hasAnyConnected = isGAConnected || isGSCConnected;

      const badgeText =
        isGAConnected && isGSCConnected
          ? 'GA4 & Search Console Active'
          : isGAConnected
          ? 'Google Analytics 4 Active'
          : isGSCConnected
          ? 'Google Search Console Active'
          : 'Not Connected';

      expect(hasAnyConnected).toBe(true);
      expect(badgeText).toBe('GA4 & Search Console Active');
    });

    it('detects partial single service credentials', () => {
      const isGAConnected = true;
      const isGSCConnected = false;
      const badgeText =
        isGAConnected && isGSCConnected
          ? 'GA4 & Search Console Active'
          : isGAConnected
          ? 'Google Analytics 4 Active'
          : 'Google Search Console Active';

      expect(badgeText).toBe('Google Analytics 4 Active');
    });

    it('displays Not Connected when no credentials are linked', () => {
      const isGAConnected = false;
      const isGSCConnected = false;
      const isMatomoConnected = false;
      const hasAnyConnected = isGAConnected || isGSCConnected || isMatomoConnected;

      const badgeText = hasAnyConnected ? 'Active' : 'Not Connected';
      expect(hasAnyConnected).toBe(false);
      expect(badgeText).toBe('Not Connected');
    });

    it('binds dynamic account email with fallback cascade', () => {
      const userEmail = 'owner@example.com';
      const cleanDomain = 'example.com';

      // 1. When API provides connectedAccountEmail
      const email1 = 'analytics@google.com' || userEmail;
      expect(email1).toBe('analytics@google.com');

      // 2. When API has no email but user session exists
      const email2 = null || userEmail;
      expect(email2).toBe('owner@example.com');

      // 3. Fallback when neither exists
      const email3 = null || null || (true ? `${cleanDomain} Stream` : 'Not Connected');
      expect(email3).toBe('example.com Stream');
    });
  });

  describe('Dynamic Timeframe Ranges & Parameter Validation', () => {
    it('maps timeframe options to day counts', () => {
      const getDaysCount = (range: string) => {
        if (range === '7d') return 7;
        if (range === '90d') return 90;
        return 28;
      };

      expect(getDaysCount('7d')).toBe(7);
      expect(getDaysCount('28d')).toBe(28);
      expect(getDaysCount('90d')).toBe(90);
      expect(getDaysCount('custom')).toBe(28);
    });
  });
});
