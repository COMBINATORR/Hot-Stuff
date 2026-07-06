import { describe, it, expect } from 'vitest';
import { formatPrice } from './utils';

describe('formatPrice', () => {
  it('formats a standard number correctly', () => {
    // The locale ru-RU uses non-breaking space for thousands separator and "KZT" since it's the currency.
    // It might differ slightly by environment, we will use a more robust check or replace NBSP.
    const result = formatPrice(1000);
    // Replace non-breaking spaces with standard spaces for easier assertion
    const normalizedResult = result.replace(/\u00A0/g, ' ');
    expect(normalizedResult).toBe('1 000 KZT');
  });

  it('formats zero correctly', () => {
    const result = formatPrice(0);
    const normalizedResult = result.replace(/\u00A0/g, ' ');
    expect(normalizedResult).toBe('0 KZT');
  });

  it('formats negative numbers correctly', () => {
    const result = formatPrice(-500);
    const normalizedResult = result.replace(/\u00A0/g, ' ');
    // May contain minus sign or other specific formats depending on Node version Intl
    // Let's just check if it contains 500 and KZT and a minus sign
    expect(normalizedResult).toContain('500');
    expect(normalizedResult).toContain('KZT');
    expect(normalizedResult).toContain('-');
  });

  it('formats string numbers correctly', () => {
    const result = formatPrice('1500');
    const normalizedResult = result.replace(/\u00A0/g, ' ');
    expect(normalizedResult).toBe('1 500 KZT');
  });

  it('handles extremely large numbers correctly', () => {
    const result = formatPrice(1000000000);
    const normalizedResult = result.replace(/\u00A0/g, ' ');
    expect(normalizedResult).toBe('1 000 000 000 KZT');
  });

  it('rounds decimal numbers according to maximumFractionDigits: 0', () => {
    const result1 = formatPrice(1000.4);
    const result2 = formatPrice(1000.5);

    expect(result1.replace(/\u00A0/g, ' ')).toBe('1 000 KZT');
    // Note: JS Intl rounds halves to even in some implementations or up in others.
    // Given standard ru-RU format, 1000.5 might round to 1001
    expect(result2.replace(/\u00A0/g, ' ')).toBe('1 001 KZT');
  });

  it('returns empty string when price is null', () => {
    expect(formatPrice(null)).toBe('');
  });

  it('returns empty string when price is undefined', () => {
    expect(formatPrice(undefined)).toBe('');
  });
});
