import { cn } from '../../../../shared/utils/cn';
import type { ToggleFieldSchema } from '../../../../shared/types/schema';

interface ToggleFieldProps {
    schema: ToggleFieldSchema;
    value: boolean;
    onChange: (value: boolean) => void;
    error?: string | null;
}

export function ToggleField({ schema, value, onChange }: ToggleFieldProps) {
    const checked = !!value;

    return (
        <button
            id={schema.name}
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => !schema.disabled && onChange(!checked)}
            disabled={schema.disabled}
            className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-s-accent/30 focus:ring-offset-2',
                checked ? 'bg-s-accent' : 'bg-s-border',
                schema.disabled && 'opacity-50 cursor-not-allowed',
            )}
        >
            <span
                className={cn(
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out',
                    checked ? 'translate-x-5' : 'translate-x-0',
                )}
            />
        </button>
    );
}
