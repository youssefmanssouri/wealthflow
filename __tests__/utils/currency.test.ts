import { formatCurrency, CURRENCY_SYMBOLS, SUPPORTED_CURRENCIES } from '../../src/utils/currency';

describe('src/utils/currency.ts', () => {
  it('formats standard USD amounts with 2 decimals', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('formats standard EUR amounts with € symbol and 2 decimals', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
  });

  it('formats MAD with DH symbol and intentional spacing', () => {
    expect(formatCurrency(1234.56, 'MAD')).toBe('DH 1,234.56');
  });

  it('suppresses decimal places for JPY (0-decimal currency)', () => {
    expect(formatCurrency(1500, 'JPY')).toBe('¥1,500');
    expect(formatCurrency(1500.85, 'JPY')).toBe('¥1,501');
  });

  it('handles negative numbers with leading minus sign', () => {
    expect(formatCurrency(-50, 'USD')).toBe('-$50.00');
    expect(formatCurrency(-1500, 'JPY')).toBe('-¥1,500');
    expect(formatCurrency(-250, 'MAD')).toBe('-DH 250.00');
  });

  it('handles showSign option for positive numbers', () => {
    expect(formatCurrency(50, 'USD', { showSign: true })).toBe('+$50.00');
    expect(formatCurrency(0, 'USD', { showSign: true })).toBe('$0.00'); // 0 does not get plus sign
    expect(formatCurrency(-50, 'USD', { showSign: true })).toBe('-$50.00');
  });

  it('formats compact values for thousands (k) and millions (M)', () => {
    expect(formatCurrency(1500, 'USD', { compact: true })).toBe('$1.5k');
    expect(formatCurrency(2400000, 'USD', { compact: true })).toBe('$2.4M');
    expect(formatCurrency(-1500, 'USD', { compact: true })).toBe('-$1.5k');
    expect(formatCurrency(999, 'USD', { compact: true })).toBe('$999.00'); // Under 1000 uses standard format
  });

  it('provides symbols for all supported currencies', () => {
    SUPPORTED_CURRENCIES.forEach((curr) => {
      expect(CURRENCY_SYMBOLS[curr]).toBeDefined();
      expect(typeof CURRENCY_SYMBOLS[curr]).toBe('string');
    });
  });
});
