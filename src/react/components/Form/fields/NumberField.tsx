import { cn } from '../../../../shared/utils/cn';
import type { NumberFieldSchema } from '../../../../shared/types/schema';

interface NumberFieldProps {
    schema: NumberFieldSchema;
    value: number | null;
    onChange: (value: number | null) => void;
    error?: string | null;
}

const inputClasses =
    'w-full rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30 disabled:opacity-50 disabled:cursor-not-allowed';

export function NumberField({ schema, value, onChange, error }: NumberFieldProps) {
    return (
        <div className="flex">
            {schema.prefix && (
                <span className="inline-flex items-center rounded-l-studio border border-r-0 border-s-border-strong bg-s-bg px-3 text-sm text-s-text-muted">
                    {schema.prefix}
                </span>
            )}
            <input
                id={schema.name}
                type="number"
                value={value ?? ''}
                onChange={(e) => {
                    const raw = e.target.value;
                    onChange(raw === '' ? null : Number(raw));
                }}
                placeholder={schema.placeholder ?? undefined}
                disabled={schema.disabled}
                min={schema.min ?? undefined}
                max={schema.max ?? undefined}
                step={schema.step ?? undefined}
                className={cn(
                    inputClasses,
                    schema.prefix && 'rounded-l-none',
                    schema.suffix && 'rounded-r-none',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                )}
            />
            {schema.suffix && (
                <span className="inline-flex items-center rounded-r-studio border border-l-0 border-s-border-strong bg-s-bg px-3 text-sm text-s-text-muted">
                    {schema.suffix}
                </span>
            )}
        </div>
    );
}
