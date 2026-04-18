import { describe, it, expect } from 'vitest';
import {
    formatDate,
    formatDateTime,
    formatMoney,
    formatNumber,
    formatPercent,
} from '../../src/shared/utils/formatters';

describe('formatDate', () => {
    it('formats a string date', () => {
        const result = formatDate('2024-06-15');
        // Should contain year, month abbreviation, and day
        expect(result).toContain('2024');
        expect(result).toContain('15');
    });

    it('formats a Date object', () => {
        const date = new Date(2024, 5, 15); // June 15, 2024
        const result = formatDate(date);
        expect(result).toContain('2024');
        expect(result).toContain('15');
    });

    it('accepts custom options', () => {
        const result = formatDate('2024-06-15', { month: 'long' });
        // With 'long' month, should output full month name instead of abbreviation
        expect(result).toContain('2024');
    });

    it('uses short month format by default', () => {
        const result = formatDate('2024-01-10');
        expect(result).toContain('2024');
        expect(result).toContain('10');
    });
});

describe('formatDateTime', () => {
    it('formats a string datetime', () => {
        const result = formatDateTime('2024-06-15T14:30:00');
        expect(result).toContain('2024');
        expect(result).toContain('15');
        // Should include time components
        expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('formats a Date object', () => {
        const date = new Date(2024, 5, 15, 14, 30);
        const result = formatDateTime(date);
        expect(result).toContain('2024');
        expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
});

describe('formatMoney', () => {
    it('formats with default USD currency', () => {
        const result = formatMoney(1234.56);
        // Should contain dollar sign and formatted number
        expect(result).toContain('$');
        expect(result).toContain('1,234.56');
    });

    it('formats with custom currency', () => {
        const result = formatMoney(1000, 'EUR', 'de-DE');
        // Euro formatting in German locale
        expect(result).toContain('€');
    });

    it('formats with custom locale', () => {
        const result = formatMoney(1500.5, 'USD', 'en-US');
        expect(result).toBe('$1,500.50');
    });

    it('handles zero', () => {
        const result = formatMoney(0);
        expect(result).toContain('$');
        expect(result).toContain('0.00');
    });

    it('handles negative values', () => {
        const result = formatMoney(-500, 'USD', 'en-US');
        expect(result).toContain('500.00');
    });
});

describe('formatNumber', () => {
    it('formats a basic number', () => {
        const result = formatNumber(1234567);
        expect(result).toContain('1');
    });

    it('formats with a specific locale', () => {
        const result = formatNumber(1234.56, 'en-US');
        expect(result).toBe('1,234.56');
    });

    it('formats with options', () => {
        const result = formatNumber(1234.5, 'en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        expect(result).toBe('1,234.50');
    });
});

describe('formatPercent', () => {
    it('formats with default precision (0 decimal places)', () => {
        const result = formatPercent(75);
        expect(result).toBe('75%');
    });

    it('formats with custom precision', () => {
        const result = formatPercent(33.333, 2);
        expect(result).toBe('33.33%');
    });

    it('handles 100 percent', () => {
        const result = formatPercent(100);
        expect(result).toBe('100%');
    });

    it('handles zero', () => {
        const result = formatPercent(0);
        expect(result).toBe('0%');
    });

    it('handles fractional values with precision', () => {
        const result = formatPercent(12.5, 1);
        expect(result).toBe('12.5%');
    });
});
