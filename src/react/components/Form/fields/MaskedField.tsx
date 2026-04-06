import { useCallback, useMemo } from 'react';
import { cn } from '../../../../shared/utils/cn';
import type { FieldSchema } from '../../../../shared/types/schema';

interface MaskedFieldProps {
    schema: FieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
}

const PRESETS: Record<string, string> = {
    phone: '(999) 999-9999',
    creditCard: '9999 9999 9999 9999',
    ssn: '999-99-9999',
    zip: '99999',
    date: '99/99/9999',
    time: '99:99',
};

// 9 = digit, a = letter, * = any char
function applyMask(raw: string, mask: string): string {
    let result = '';
    let rawIdx = 0;

    for (let i = 0; i < mask.length && rawIdx < raw.length; i++) {
        const m = mask[i];
        if (m === '9') {
            // Expect digit
            while (rawIdx < raw.length && !/\d/.test(raw[rawIdx])) rawIdx++;
            if (rawIdx < raw.length) { result += raw[rawIdx]; rawIdx++; }
        } else if (m === 'a') {
            // Expect letter
            while (rawIdx < raw.length && !/[a-zA-Z]/.test(raw[rawIdx])) rawIdx++;
            if (rawIdx < raw.length) { result += raw[rawIdx]; rawIdx++; }
        } else if (m === '*') {
            result += raw[rawIdx];
            rawIdx++;
        } else {
            // Literal char from mask
            result += m;
        }
    }

    return result;
}

function stripMask(val: string, mask: string): string {
    let result = '';
    for (let i = 0; i < val.length && i < mask.length; i++) {
        const m = mask[i];
        if (m === '9' || m === 'a' || m === '*') {
            result += val[i];
        }
    }
    return result;
}

export function MaskedField({ schema, value, onChange }: MaskedFieldProps) {
    const preset = (schema as Record<string, unknown>).preset as string | null;
    const customMask = (schema as Record<string, unknown>).mask as string | null;
    const mask = customMask || (preset ? PRESETS[preset] : null) || '';

    const displayValue = useMemo(() => {
        if (!mask) return String(value ?? '');
        return applyMask(String(value ?? ''), mask);
    }, [value, mask]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        if (!mask) {
            onChange(input);
            return;
        }

        // Strip non-mask chars and store raw value
        const raw = input.replace(/[^a-zA-Z0-9]/g, '');
        onChange(raw);
    }, [mask, onChange]);

    return (
        <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            placeholder={mask || schema.placeholder || ''}
            className={cn(
                'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors font-mono',
                'bg-s-input text-s-text placeholder:text-s-text-faint',
                'focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
                'border-s-border-strong',
            )}
        />
    );
}
