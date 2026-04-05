import { useCallback } from 'react';
import { cn } from '../../../../shared/utils/cn';
import type { KeyValueFieldSchema } from '../../../../shared/types/schema';

interface KeyValueFieldProps {
    schema: KeyValueFieldSchema;
    value: Array<{ key: string; value: string }>;
    onChange: (value: Array<{ key: string; value: string }>) => void;
    error?: string | null;
}

const inputClasses =
    'w-full rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30 disabled:opacity-50 disabled:cursor-not-allowed';

export function KeyValueField({ schema, value, onChange, error }: KeyValueFieldProps) {
    const rows = Array.isArray(value) ? value : [];

    const updateRow = useCallback(
        (index: number, field: 'key' | 'value', newVal: string) => {
            const updated = rows.map((row, i) =>
                i === index ? { ...row, [field]: newVal } : row,
            );
            onChange(updated);
        },
        [rows, onChange],
    );

    const addRow = useCallback(() => {
        onChange([...rows, { key: '', value: '' }]);
    }, [rows, onChange]);

    const removeRow = useCallback(
        (index: number) => {
            onChange(rows.filter((_, i) => i !== index));
        },
        [rows, onChange],
    );

    return (
        <div className="space-y-2">
            {rows.length > 0 && (
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-s-text-muted">
                    <span>{schema.keyLabel}</span>
                    <span>{schema.valueLabel}</span>
                    <span className="w-8" />
                </div>
            )}
            {rows.map((row, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input
                        type="text"
                        value={row.key}
                        onChange={(e) => updateRow(index, 'key', e.target.value)}
                        placeholder={schema.keyLabel}
                        disabled={schema.disabled}
                        className={cn(
                            inputClasses,
                            error && 'border-red-500',
                        )}
                    />
                    <input
                        type="text"
                        value={row.value}
                        onChange={(e) => updateRow(index, 'value', e.target.value)}
                        placeholder={schema.valueLabel}
                        disabled={schema.disabled}
                        className={cn(
                            inputClasses,
                            error && 'border-red-500',
                        )}
                    />
                    {schema.deletable && (
                        <button
                            type="button"
                            onClick={() => removeRow(index)}
                            disabled={schema.disabled}
                            className="inline-flex w-8 items-center justify-center text-s-text-faint transition-colors hover:text-red-500 disabled:opacity-50"
                            aria-label="Remove row"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            ))}
            {schema.addable && (
                <button
                    type="button"
                    onClick={addRow}
                    disabled={schema.disabled}
                    className="inline-flex items-center gap-1 text-sm text-s-accent transition-colors hover:text-s-accent/80 disabled:opacity-50"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add row
                </button>
            )}
        </div>
    );
}
