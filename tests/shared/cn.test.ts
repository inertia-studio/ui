import { describe, it, expect } from 'vitest';
import { cn } from '../../src/shared/utils/cn';

describe('cn', () => {
    it('merges multiple class strings', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classes via clsx', () => {
        expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
        expect(cn('base', true && 'active')).toBe('base active');
    });

    it('handles undefined and null values', () => {
        expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
    });

    it('handles object syntax', () => {
        expect(cn({ hidden: false, visible: true })).toBe('visible');
    });

    it('handles array syntax', () => {
        expect(cn(['foo', 'bar'])).toBe('foo bar');
    });

    it('deduplicates Tailwind classes via tailwind-merge', () => {
        expect(cn('px-4', 'px-6')).toBe('px-6');
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('merges conflicting Tailwind utilities', () => {
        expect(cn('mt-2 mb-4', 'mt-8')).toBe('mb-4 mt-8');
    });

    it('returns empty string for no arguments', () => {
        expect(cn()).toBe('');
    });
});
