import { useState, useCallback } from 'react';
import type { FieldSchema } from '../../../../shared/types/schema';

interface RatingFieldProps {
    schema: FieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
}

export function RatingField({ schema, value, onChange }: RatingFieldProps) {
    const max = (schema as Record<string, unknown>).max as number ?? 5;
    const allowHalf = (schema as Record<string, unknown>).allowHalf as boolean ?? false;
    const activeColor = (schema as Record<string, unknown>).activeColor as string ?? '#f59e0b';
    const currentValue = Number(value ?? 0);
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const displayValue = hoverValue ?? currentValue;

    const handleClick = useCallback((starIndex: number, isHalf: boolean) => {
        const newValue = isHalf && allowHalf ? starIndex + 0.5 : starIndex + 1;
        onChange(newValue === currentValue ? 0 : newValue);
    }, [allowHalf, currentValue, onChange]);

    return (
        <div className="flex items-center gap-0.5" onMouseLeave={() => setHoverValue(null)}>
            {Array.from({ length: max }, (_, i) => {
                const filled = displayValue >= i + 1;
                const halfFilled = !filled && allowHalf && displayValue >= i + 0.5;

                return (
                    <div
                        key={i}
                        className="relative cursor-pointer"
                        onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const isLeftHalf = (e.clientX - rect.left) < rect.width / 2;
                            setHoverValue(isLeftHalf && allowHalf ? i + 0.5 : i + 1);
                        }}
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const isLeftHalf = (e.clientX - rect.left) < rect.width / 2;
                            handleClick(i, isLeftHalf);
                        }}
                    >
                        {/* Background star (empty) */}
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--s-border-strong))" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                        </svg>

                        {/* Filled star (full or half) */}
                        {(filled || halfFilled) && (
                            <svg
                                className="w-6 h-6 absolute inset-0"
                                viewBox="0 0 24 24"
                                fill={activeColor}
                                style={halfFilled ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
                            >
                                <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                            </svg>
                        )}
                    </div>
                );
            })}

            {/* Value display */}
            <span className="ml-2 text-sm text-s-text-muted tabular-nums">
                {currentValue > 0 ? currentValue : ''}
            </span>
        </div>
    );
}
