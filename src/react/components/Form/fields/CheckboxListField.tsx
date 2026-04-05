import { useCallback, useMemo, useState } from 'react';
import { cn } from '../../../../shared/utils/cn';
import type { CheckboxListFieldSchema } from '../../../../shared/types/schema';

interface CheckboxListFieldProps {
    schema: CheckboxListFieldSchema;
    value: string[];
    onChange: (value: string[]) => void;
    error?: string | null;
}

export function CheckboxListField({ schema, value, onChange, error }: CheckboxListFieldProps) {
    const [search, setSearch] = useState('');
    const selected = Array.isArray(value) ? value : [];

    const entries = useMemo(() => Object.entries(schema.options) as [string, string][], [schema.options]);

    const filtered = useMemo<[string, string][]>(() => {
        if (!schema.searchable || search === '') return entries;
        const lower = search.toLowerCase();
        return entries.filter(([, label]: [string, string]) => label.toLowerCase().includes(lower));
    }, [entries, search, schema.searchable]);

    const toggle = useCallback(
        (optValue: string) => {
            const next = selected.includes(optValue)
                ? selected.filter((v) => v !== optValue)
                : [...selected, optValue];
            onChange(next);
        },
        [selected, onChange],
    );

    return (
        <div>
            {schema.searchable && (
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className={cn(
                        'mb-2 w-full rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30',
                        error && 'border-red-500',
                    )}
                />
            )}
            <div
                className={cn(
                    'grid gap-2',
                    schema.columns === 1 && 'grid-cols-1',
                    schema.columns === 2 && 'grid-cols-2',
                    schema.columns === 3 && 'grid-cols-3',
                    schema.columns >= 4 && 'grid-cols-4',
                )}
            >
                {filtered.map(([optValue, label]) => (
                    <label
                        key={optValue}
                        className={cn(
                            'inline-flex items-center gap-2',
                            schema.disabled && 'opacity-50 cursor-not-allowed',
                        )}
                    >
                        <input
                            type="checkbox"
                            checked={selected.includes(optValue)}
                            onChange={() => toggle(optValue)}
                            disabled={schema.disabled}
                            className="h-4 w-4 rounded border-s-border-strong text-s-accent focus:ring-s-accent/30 bg-s-input"
                        />
                        <span className="text-sm text-s-text-secondary">{label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
