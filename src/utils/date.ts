const YYYY_MM_DD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Returns a date formatted as YYYY-MM-DD using local calendar components.
 * Defaults to current date if not supplied.
 */
export const getLocalDateString = (date?: Date): string => {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns a date formatted as YYYY-MM using local calendar components.
 * Defaults to current date if not supplied.
 */
export const getLocalYearMonth = (date?: Date): string => {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Parses a date string safely into a local Date object.
 * For calendar date strings (YYYY-MM-DD), constructs a date in local calendar time
 * to prevent timezone shifting in negative or positive UTC offsets.
 */
export const parseLocalDate = (dateString: string): Date | null => {
  if (!dateString || typeof dateString !== 'string') return null;
  const trimmed = dateString.trim();

  if (YYYY_MM_DD_REGEX.test(trimmed)) {
    const [yearStr, monthStr, dayStr] = trimmed.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
      return d;
    }
    return null;
  }

  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = parseLocalDate(dateString);
  if (!date) return dateString;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatShortDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = parseLocalDate(dateString);
  if (!date) return dateString;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const formatRelativeDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = parseLocalDate(dateString);
  if (!date) return dateString;

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const getCurrentMonthYear = (): string => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

/**
 * Validates whether a given string is a strictly valid calendar date in YYYY-MM-DD format.
 * Validates calendar months, days per month, and leap years without timezone shifting.
 */
export const isValidDateString = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(trimmed)) return false;

  const [yearStr, monthStr, dayStr] = trimmed.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInMonth = [
    31, // Jan
    isLeapYear ? 29 : 28, // Feb
    31, // Mar
    30, // Apr
    31, // May
    30, // Jun
    31, // Jul
    31, // Aug
    30, // Sep
    31, // Oct
    30, // Nov
    31, // Dec
  ];

  const maxDays = daysInMonth[month - 1];
  if (day < 1 || day > maxDays) return false;

  return true;
};
