import { cn } from '../../../../shared/utils/cn';
import type { TimeFieldSchema } from '../../../../shared/types/schema';

interface TimeFieldProps {
    schema: TimeFieldSchema;
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
}

const inputClasses =
    'w-full rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30 disabled:opacity-50 disabled:cursor-not-allowed';

export function TimeField({ schema, value, onChange, error }: TimeFieldProps) {
    return (
        <input
            id={schema.name}
            type="time"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={schema.disabled}
            step={schema.seconds ? 1 : undefined}
            className={cn(
                inputClasses,
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            )}
        />
    );
}
