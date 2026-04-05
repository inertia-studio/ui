import { cn } from '../../../../shared/utils/cn';
import type { BooleanFilterSchema } from '../../../../shared/types/schema';

interface FilterProps {
    schema: BooleanFilterSchema;
    value: unknown;
    onChange: (value: unknown) => void;
}

export function BooleanFilter({ schema, value, onChange }: FilterProps) {
    const isChecked = Boolean(value);

    function handleToggle() {
        onChange(isChecked ? null : true);
    }

    return (
        <label className="flex cursor-pointer items-center gap-2.5">
            <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                onClick={handleToggle}
                className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-s-accent/30 focus:ring-offset-2',
                    isChecked ? 'bg-s-accent' : 'bg-s-border',
                )}
            >
                <span
                    className={cn(
                        'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                        isChecked ? 'translate-x-4' : 'translate-x-0',
                    )}
                />
            </button>
            <span className="text-sm text-s-text-secondary">{schema.label}</span>
        </label>
    );
}
