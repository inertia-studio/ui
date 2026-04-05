import { useCallback, useState, type KeyboardEvent } from 'react';
import { cn } from '../../../../shared/utils/cn';
import type { TagsFieldSchema } from '../../../../shared/types/schema';

interface TagsFieldProps {
    schema: TagsFieldSchema;
    value: string[];
    onChange: (value: string[]) => void;
    error?: string | null;
}

const inputClasses =
    'w-full rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30 disabled:opacity-50 disabled:cursor-not-allowed';

export function TagsField({ schema, value, onChange, error }: TagsFieldProps) {
    const [input, setInput] = useState('');
    const tags = Array.isArray(value) ? value : [];
    const separator = schema.separator || ',';

    const addTag = useCallback(
        (tag: string) => {
            const trimmed = tag.trim();
            if (trimmed && !tags.includes(trimmed)) {
                onChange([...tags, trimmed]);
            }
            setInput('');
        },
        [tags, onChange],
    );

    const removeTag = useCallback(
        (index: number) => {
            onChange(tags.filter((_, i) => i !== index));
        },
        [tags, onChange],
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' || e.key === separator) {
                e.preventDefault();
                addTag(input);
            } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
                removeTag(tags.length - 1);
            }
        },
        [input, tags, addTag, removeTag, separator],
    );

    return (
        <div
            className={cn(
                inputClasses,
                'flex flex-wrap items-center gap-1.5',
                error && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500',
            )}
        >
            {tags.map((tag, index) => (
                <span
                    key={`${tag}-${index}`}
                    className="inline-flex items-center gap-1 rounded-full bg-s-accent/10 px-2.5 py-0.5 text-xs font-medium text-s-accent"
                >
                    {tag}
                    {!schema.disabled && (
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="text-s-accent/60 hover:text-s-accent"
                            aria-label={`Remove ${tag}`}
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </span>
            ))}
            <input
                id={schema.name}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => input && addTag(input)}
                placeholder={tags.length === 0 ? (schema.placeholder ?? 'Add tag...') : ''}
                disabled={schema.disabled}
                className="flex-1 border-0 bg-transparent p-0 text-sm text-s-text focus:outline-none focus:ring-0"
            />
        </div>
    );
}
