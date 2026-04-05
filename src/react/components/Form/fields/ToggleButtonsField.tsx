import { useCallback, useMemo } from 'react';
import { cn } from '../../../../shared/utils/cn';
import type { ToggleButtonsFieldSchema } from '../../../../shared/types/schema';

interface ToggleButtonsFieldProps {
    schema: ToggleButtonsFieldSchema;
    value: string | string[];
    onChange: (value: string | string[]) => void;
    error?: string | null;
}

export function ToggleButtonsField({ schema, value, onChange, error }: ToggleButtonsFieldProps) {
    const entries = useMemo(() => Object.entries(schema.options) as [string, string][], [schema.options]);
    const selectedValues = useMemo<string[]>(() => {
        if (schema.multiple) {
            return Array.isArray(value) ? value : value ? [value as string] : [];
        }
        return [];
    }, [value, schema.multiple]);

    const handleClick = useCallback(
        (optValue: string) => {
            if (schema.multiple) {
                const next = selectedValues.includes(optValue)
                    ? selectedValues.filter((v) => v !== optValue)
                    : [...selectedValues, optValue];
                onChange(next);
            } else {
                onChange(optValue);
            }
        },
        [schema.multiple, selectedValues, onChange],
    );

    return (
        <div
            className={cn(
                'inline-flex',
                schema.grouped ? 'rounded-lg border border-s-border-strong divide-x divide-s-border' : 'gap-2',
                error && 'ring-1 ring-red-500',
            )}
        >
            {entries.map(([optValue, label], index) => {
                const isSelected = schema.multiple
                    ? selectedValues.includes(optValue)
                    : value === optValue;

                return (
                    <button
                        key={optValue}
                        type="button"
                        onClick={() => handleClick(optValue)}
                        disabled={schema.disabled}
                        className={cn(
                            'px-3 py-2 text-sm font-medium transition-colors',
                            schema.grouped
                                ? cn(
                                      index === 0 && 'rounded-l-studio',
                                      index === entries.length - 1 && 'rounded-r-studio',
                                  )
                                : 'rounded-lg border border-s-border-strong',
                            isSelected
                                ? 'bg-s-accent text-white'
                                : 'bg-s-input text-s-text-secondary hover:bg-s-hover',
                            schema.disabled && 'opacity-50 cursor-not-allowed',
                        )}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
