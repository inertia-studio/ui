import { cn } from '../../../../shared/utils/cn';
import type { TelFieldSchema } from '../../../../shared/types/schema';

interface TelFieldProps {
    schema: TelFieldSchema;
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
}

const inputClasses =
    'w-full rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30 disabled:opacity-50 disabled:cursor-not-allowed';

export function TelField({ schema, value, onChange, error }: TelFieldProps) {
    return (
        <div className="flex">
            {schema.prefix && (
                <span className="inline-flex items-center rounded-l-studio border border-r-0 border-s-border-strong bg-s-bg px-3 text-sm text-s-text-muted">
                    {schema.prefix}
                </span>
            )}
            <input
                id={schema.name}
                type="tel"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={schema.placeholder ?? undefined}
                disabled={schema.disabled}
                maxLength={schema.maxLength ?? undefined}
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
