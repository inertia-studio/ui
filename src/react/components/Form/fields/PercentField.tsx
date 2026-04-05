import { cn } from '../../../../shared/utils/cn';
import type { PercentFieldSchema } from '../../../../shared/types/schema';

interface PercentFieldProps {
    schema: PercentFieldSchema;
    value: number | null;
    onChange: (value: number | null) => void;
    error?: string | null;
}

const inputClasses =
    'w-full rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30 disabled:opacity-50 disabled:cursor-not-allowed';

export function PercentField({ schema, value, onChange, error }: PercentFieldProps) {
    const step = schema.precision > 0 ? 1 / Math.pow(10, schema.precision) : 1;

    return (
        <div className="flex">
            <input
                id={schema.name}
                type="number"
                value={value ?? ''}
                onChange={(e) => {
                    const raw = e.target.value;
                    onChange(raw === '' ? null : Number(raw));
                }}
                placeholder={schema.placeholder ?? '0'}
                disabled={schema.disabled}
                min={0}
                max={100}
                step={step}
                className={cn(
                    inputClasses,
                    'rounded-r-none',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                )}
            />
            <span className="inline-flex items-center rounded-r-studio border border-l-0 border-s-border-strong bg-s-bg px-3 text-sm text-s-text-muted">
                %
            </span>
        </div>
    );
}
