import { cn } from '../../../../shared/utils/cn';
import type { StepperFieldSchema } from '../../../../shared/types/schema';

interface StepperFieldProps {
    schema: StepperFieldSchema;
    value: number | null;
    onChange: (value: number) => void;
    error?: string | null;
}

const inputClasses =
    'w-full border-y border-s-border-strong bg-s-input px-3 py-2 text-center text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30 disabled:opacity-50 disabled:cursor-not-allowed';

export function StepperField({ schema, value, onChange, error }: StepperFieldProps) {
    const current = value ?? 0;
    const step = schema.step;
    const atMin = schema.min !== null && current <= schema.min;
    const atMax = schema.max !== null && current >= schema.max;

    const decrement = () => {
        const next = current - step;
        if (schema.min !== null && next < schema.min) return;
        onChange(next);
    };

    const increment = () => {
        const next = current + step;
        if (schema.max !== null && next > schema.max) return;
        onChange(next);
    };

    return (
        <div className="inline-flex">
            <button
                type="button"
                onClick={decrement}
                disabled={schema.disabled || atMin}
                className={cn(
                    'inline-flex items-center rounded-l-studio border border-s-border-strong px-3 py-2 text-sm text-s-text-muted transition-colors hover:bg-s-hover',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
                aria-label="Decrease"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
            </button>
            <input
                id={schema.name}
                type="number"
                value={current}
                onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') return;
                    const num = Number(raw);
                    if (schema.min !== null && num < schema.min) return;
                    if (schema.max !== null && num > schema.max) return;
                    onChange(num);
                }}
                disabled={schema.disabled}
                min={schema.min ?? undefined}
                max={schema.max ?? undefined}
                step={step}
                className={cn(
                    inputClasses,
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                )}
            />
            <button
                type="button"
                onClick={increment}
                disabled={schema.disabled || atMax}
                className={cn(
                    'inline-flex items-center rounded-r-studio border border-s-border-strong px-3 py-2 text-sm text-s-text-muted transition-colors hover:bg-s-hover',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
                aria-label="Increase"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
        </div>
    );
}
