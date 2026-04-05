import { DatePicker } from '../../DatePicker';
import type { DateFieldSchema } from '../../../../shared/types/schema';

interface DateFieldProps {
    schema: DateFieldSchema;
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
}

export function DateField({ schema, value, onChange, error }: DateFieldProps) {
    if (schema.withTime) {
        // Datetime still uses native input — custom time picker is a future improvement
        return (
            <input
                id={schema.name}
                type="datetime-local"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={schema.disabled}
                min={schema.minDate ?? undefined}
                max={schema.maxDate ?? undefined}
                className="w-full rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
            />
        );
    }

    return (
        <DatePicker
            value={value || null}
            onChange={(v) => onChange(v ?? '')}
            disabled={schema.disabled}
        />
    );
}
