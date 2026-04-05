import { cn } from '../../../../shared/utils/cn';
import type { TernaryFilterSchema } from '../../../../shared/types/schema';

interface FilterProps {
    schema: TernaryFilterSchema;
    value: unknown;
    onChange: (value: unknown) => void;
}

export function TernaryFilter({ schema, value, onChange }: FilterProps) {
    // Normalize: value from URL is a string, convert to boolean | null
    const currentValue = value === 'true' || value === true
        ? true
        : value === 'false' || value === false
            ? false
            : null;

    const buttons: Array<{ label: string; filterValue: boolean | null }> = [
        { label: 'All', filterValue: null },
        { label: schema.trueLabel || 'Yes', filterValue: true },
        { label: schema.falseLabel || 'No', filterValue: false },
    ];

    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-s-text-muted">{schema.label}</span>
            <div className="inline-flex rounded-lg border border-s-border bg-s-bg p-0.5">
                {buttons.map((btn) => {
                    const isActive = currentValue === btn.filterValue;

                    return (
                        <button
                            key={String(btn.filterValue)}
                            type="button"
                            onClick={() => onChange(btn.filterValue)}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                isActive
                                    ? 'bg-s-input text-s-text shadow-sm'
                                    : 'text-s-text-muted hover:text-s-text-secondary',
                            )}
                        >
                            {btn.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
