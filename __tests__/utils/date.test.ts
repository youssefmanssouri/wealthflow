import {
  parseLocalDate,
  formatDate,
  formatShortDate,
  formatRelativeDate,
  isValidDateString,
  getGreeting,
  getCurrentMonthYear,
} from '../../src/utils/date';

describe('src/utils/date.ts', () => {
  describe('isValidDateString', () => {
    it('accepts valid normal calendar dates', () => {
      expect(isValidDateString('2026-09-15')).toBe(true);
      expect(isValidDateString('2025-01-01')).toBe(true);
      expect(isValidDateString('2025-12-31')).toBe(true);
    });

    it('rejects invalid formats and non-string/empty inputs', () => {
      expect(isValidDateString('')).toBe(false);
      expect(isValidDateString('   ')).toBe(false);
      expect(isValidDateString('15-09-2026')).toBe(false);
      expect(isValidDateString('2026/09/15')).toBe(false);
      expect(isValidDateString('not-a-date')).toBe(false);
      expect(isValidDateString(null as any)).toBe(false);
      expect(isValidDateString(undefined as any)).toBe(false);
    });

    it('rejects invalid months', () => {
      expect(isValidDateString('2026-00-15')).toBe(false);
      expect(isValidDateString('2026-13-15')).toBe(false);
    });

    it('rejects invalid days for given months (e.g. April 31)', () => {
      expect(isValidDateString('2026-04-31')).toBe(false); // April has 30 days
      expect(isValidDateString('2026-06-31')).toBe(false); // June has 30 days
      expect(isValidDateString('2026-09-31')).toBe(false); // Sept has 30 days
      expect(isValidDateString('2026-11-31')).toBe(false); // Nov has 30 days
      expect(isValidDateString('2026-01-00')).toBe(false);
      expect(isValidDateString('2026-01-32')).toBe(false);
    });

    it('validates leap year February 29 correctly', () => {
      expect(isValidDateString('2024-02-29')).toBe(true); // 2024 is a leap year
      expect(isValidDateString('2023-02-29')).toBe(false); // 2023 is not a leap year
      expect(isValidDateString('2000-02-29')).toBe(true); // 2000 is a leap year (divisible by 400)
      expect(isValidDateString('1900-02-29')).toBe(false); // 1900 is not a leap year (divisible by 100 but not 400)
    });

    it('validates boundary years according to implementation (1900 - 2100)', () => {
      expect(isValidDateString('1900-01-01')).toBe(true);
      expect(isValidDateString('1899-12-31')).toBe(false);
      expect(isValidDateString('2100-12-31')).toBe(true);
      expect(isValidDateString('2101-01-01')).toBe(false);
    });
  });

  describe('parseLocalDate', () => {
    it('interprets YYYY-MM-DD as a local calendar date without UTC offset shifting', () => {
      const parsed = parseLocalDate('2026-09-15');
      expect(parsed).not.toBeNull();
      expect(parsed?.getFullYear()).toBe(2026);
      expect(parsed?.getMonth()).toBe(8); // September is month index 8
      expect(parsed?.getDate()).toBe(15);
    });

    it('returns null for empty, invalid or non-date strings', () => {
      expect(parseLocalDate('')).toBeNull();
      expect(parseLocalDate('invalid')).toBeNull();
      expect(parseLocalDate(null as any)).toBeNull();
    });

    it('handles ISO timestamp strings as fallback', () => {
      const isoString = '2026-09-15T12:00:00.000Z';
      const parsed = parseLocalDate(isoString);
      expect(parsed).not.toBeNull();
      expect(parsed?.toISOString()).toBe(isoString);
    });
  });

  describe('formatDate, formatShortDate, formatRelativeDate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      // Set system date to September 15, 2026, 12:00:00 local time
      jest.setSystemTime(new Date(2026, 8, 15, 12, 0, 0));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('formatDate formats date into readable month day, year string', () => {
      const result = formatDate('2026-09-15');
      expect(result).toContain('Sep');
      expect(result).toContain('15');
      expect(result).toContain('2026');
      expect(formatDate('')).toBe('');
    });

    it('formatShortDate formats date without year', () => {
      const result = formatShortDate('2026-09-15');
      expect(result).toContain('Sep');
      expect(result).toContain('15');
      expect(result).not.toContain('2026');
      expect(formatShortDate('')).toBe('');
    });

    it('formatRelativeDate returns "Today" for current date', () => {
      expect(formatRelativeDate('2026-09-15')).toBe('Today');
    });

    it('formatRelativeDate returns "Yesterday" for previous day', () => {
      expect(formatRelativeDate('2026-09-14')).toBe('Yesterday');
    });

    it('formatRelativeDate returns formatted date for older dates', () => {
      const result = formatRelativeDate('2026-09-10');
      expect(result).toContain('Sep');
      expect(result).toContain('10');
    });
  });

  describe('getGreeting', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns appropriate greeting based on hour', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 8, 15, 8, 0, 0));
      expect(getGreeting()).toBe('Good morning');

      jest.setSystemTime(new Date(2026, 8, 15, 14, 0, 0));
      expect(getGreeting()).toBe('Good afternoon');

      jest.setSystemTime(new Date(2026, 8, 15, 20, 0, 0));
      expect(getGreeting()).toBe('Good evening');
    });
  });
});
