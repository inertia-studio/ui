import { useMemo } from 'react';
import { cn } from '../../../../shared/utils/cn';
import type { RadioFieldSchema } from '../../../../shared/types/schema';

interface RadioFieldProps {
    schema: RadioFieldSchema;
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
}

export function RadioField({ schema, value, onChange }: RadioFieldProps) {
    const entries = useMemo(() => Object.entries(schema.options) as [string, string][], [schema.options]);

    return (
        <div className={cn('flex gap-3', schema.inline ? 'flex-row flex-wrap' : 'flex-col')}>
            {entries.map(([optValue, label]) => (
                <label
                    key={optValue}
                    className={cn(
                        'inline-flex items-center gap-2',
                        schema.disabled && 'opacity-50 cursor-not-allowed',
                    )}
                >
                    <input
                        type="radio"
                        name={schema.name}
                        value={optValue}
                        checked={value === optValue}
                        onChange={() => onChange(optValue)}
                        disabled={schema.disabled}
                        className="h-4 w-4 border-s-border-strong text-s-accent focus:ring-s-accent/30 bg-s-input"
                    />
                    <span className="text-sm text-s-text-secondary">{label}</span>
                </label>
            ))}
        </div>
    );
}
