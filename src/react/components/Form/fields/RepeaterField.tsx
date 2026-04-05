import { useCallback } from 'react';
import { cn } from '../../../../shared/utils/cn';
import type { RepeaterFieldSchema, FormComponentSchema } from '../../../../shared/types/schema';

interface RepeaterFieldProps {
    schema: RepeaterFieldSchema;
    value: Array<Record<string, unknown>>;
    onChange: (value: Array<Record<string, unknown>>) => void;
    error?: string | null;
    renderComponents?: (
        components: FormComponentSchema[],
        data: Record<string, unknown>,
        onFieldChange: (name: string, val: unknown) => void,
        errors: Record<string, string>,
    ) => React.ReactNode;
}

export function RepeaterField({ schema, value, onChange, error, renderComponents }: RepeaterFieldProps) {
    const items = Array.isArray(value) ? value : [];
    const atMax = schema.maxItems !== null && items.length >= schema.maxItems;
    const atMin = schema.minItems !== null && items.length <= schema.minItems;

    const addItem = useCallback(() => {
        if (atMax) return;
        const empty: Record<string, unknown> = {};
        onChange([...items, empty]);
    }, [items, onChange, atMax]);

    const removeItem = useCallback(
        (index: number) => {
            if (atMin) return;
            onChange(items.filter((_, i) => i !== index));
        },
        [items, onChange, atMin],
    );

    const moveItem = useCallback(
        (from: number, to: number) => {
            if (to < 0 || to >= items.length) return;
            const next = [...items];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            onChange(next);
        },
        [items, onChange],
    );

    const updateItem = useCallback(
        (index: number, fieldName: string, fieldValue: unknown) => {
            const updated = items.map((item, i) =>
                i === index ? { ...item, [fieldName]: fieldValue } : item,
            );
            onChange(updated);
        },
        [items, onChange],
    );

    return (
        <div className={cn('space-y-3', error && 'ring-1 ring-red-500 rounded-lg p-2')}>
            {items.map((item, index) => (
                <div
                    key={index}
                    className="rounded-lg border border-s-border bg-s-surface"
                >
                    <div className="flex items-center justify-between border-b border-s-border px-3 py-2">
                        <span className="text-xs font-medium text-s-text-muted">#{index + 1}</span>
                        <div className="flex items-center gap-1">
                            {schema.reorderable && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => moveItem(index, index - 1)}
                                        disabled={schema.disabled || index === 0}
                                        className="rounded p-1 text-s-text-faint hover:text-s-text-muted disabled:opacity-30"
                                        aria-label="Move up"
                                    >
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveItem(index, index + 1)}
                                        disabled={schema.disabled || index === items.length - 1}
                                        className="rounded p-1 text-s-text-faint hover:text-s-text-muted disabled:opacity-30"
                                        aria-label="Move down"
                                    >
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </button>
                                </>
                            )}
                            {schema.deletable && (
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    disabled={schema.disabled || atMin}
                                    className="rounded p-1 text-s-text-faint hover:text-red-500 disabled:opacity-30"
                                    aria-label="Remove item"
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="p-3">
                        {renderComponents ? (
                            renderComponents(
                                schema.schema,
                                item,
                                (name, val) => updateItem(index, name, val),
                                {},
                            )
                        ) : (
                            <p className="text-xs text-s-text-faint">Nested fields render here</p>
                        )}
                    </div>
                </div>
            ))}

            {schema.addable && (
                <button
                    type="button"
                    onClick={addItem}
                    disabled={schema.disabled || atMax}
                    className="inline-flex items-center gap-1 text-sm text-s-accent transition-colors hover:text-s-accent/80 disabled:opacity-50"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add item
                </button>
            )}
        </div>
    );
}
