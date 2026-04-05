import { useCallback, useRef } from 'react';
import { cn } from '../../../../shared/utils/cn';
import type { TextareaFieldSchema } from '../../../../shared/types/schema';

interface TextareaFieldProps {
    schema: TextareaFieldSchema;
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
}

const inputClasses =
    'w-full rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30 disabled:opacity-50 disabled:cursor-not-allowed';

export function TextareaField({ schema, value, onChange, error }: TextareaFieldProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onChange(e.target.value);

            if (schema.autosize && textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
        },
        [onChange, schema.autosize],
    );

    return (
        <div className="relative">
            <textarea
                id={schema.name}
                ref={textareaRef}
                value={value ?? ''}
                onChange={handleChange}
                placeholder={schema.placeholder ?? undefined}
                disabled={schema.disabled}
                rows={schema.rows}
                maxLength={schema.maxLength ?? undefined}
                className={cn(
                    inputClasses,
                    schema.autosize && 'resize-none overflow-hidden',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                )}
            />
            {schema.maxLength !== null && (
                <span className="absolute bottom-2 right-2 text-xs text-s-text-faint">
                    {(value ?? '').length}/{schema.maxLength}
                </span>
            )}
        </div>
    );
}
