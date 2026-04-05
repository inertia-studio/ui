import { cn } from '../../../../shared/utils/cn';
import type { CheckboxFieldSchema } from '../../../../shared/types/schema';

interface CheckboxFieldProps {
    schema: CheckboxFieldSchema;
    value: boolean;
    onChange: (value: boolean) => void;
    error?: string | null;
}

export function CheckboxField({ schema, value, onChange }: CheckboxFieldProps) {
    return (
        <label className={cn('inline-flex items-center gap-2', schema.disabled && 'opacity-50 cursor-not-allowed')}>
            <input
                id={schema.name}
                type="checkbox"
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                disabled={schema.disabled}
                className="h-4 w-4 rounded border-s-border-strong text-s-accent focus:ring-s-accent/30 bg-s-input"
            />
            {schema.label && (
                <span className="text-sm text-s-text-secondary">{schema.label}</span>
            )}
        </label>
    );
}
