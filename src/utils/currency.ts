import { Currency } from '../types/financial';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: 'US Dollar ($)',
  EUR: 'Euro (€)',
  GBP: 'British Pound (£)',
  JPY: 'Japanese Yen (¥)',
  CAD: 'Canadian Dollar (CA$)',
  AUD: 'Australian Dollar (A$)',
};

/**
 * Centralized Currency Formatter
 * Standardized across all screens, cards, charts, and details.
 */
export const formatCurrency = (
  amount: number,
  currency: Currency = 'USD',
  options?: {
    showSign?: boolean;
    compact?: boolean;
    decimals?: number;
  }
): string => {
  const { showSign = false, compact = false, decimals } = options || {};
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  const absAmount = Math.abs(amount);
  const signPrefix = amount < 0 ? '-' : showSign && amount > 0 ? '+' : '';

  if (compact && absAmount >= 1000) {
    if (absAmount >= 1000000) {
      return `${signPrefix}${symbol}${(absAmount / 1000000).toFixed(1)}M`;
    }
    return `${signPrefix}${symbol}${(absAmount / 1000).toFixed(1)}k`;
  }

  // Handle currencies with 0 decimal places like JPY
  const numDecimals = decimals !== undefined ? decimals : currency === 'JPY' ? 0 : 2;

  const formattedValue = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: numDecimals,
    maximumFractionDigits: numDecimals,
  });

  return `${signPrefix}${symbol}${formattedValue}`;
};
