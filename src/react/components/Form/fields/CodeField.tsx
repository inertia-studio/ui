import { useCallback, useRef } from 'react';
import { cn } from '../../../../shared/utils/cn';
import type { FieldSchema } from '../../../../shared/types/schema';

interface CodeFieldProps {
    schema: FieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
}

export function CodeField({ schema, value, onChange }: CodeFieldProps) {
    const language = (schema as Record<string, unknown>).language as string ?? 'json';
    const minLines = (schema as Record<string, unknown>).minLines as number ?? 8;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Tab inserts 2 spaces instead of moving focus
        if (e.key === 'Tab') {
            e.preventDefault();
            const ta = e.currentTarget;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const newValue = String(value ?? '').substring(0, start) + '  ' + String(value ?? '').substring(end);
            onChange(newValue);
            requestAnimationFrame(() => {
                ta.selectionStart = ta.selectionEnd = start + 2;
            });
        }
    }, [value, onChange]);

    return (
        <div className="relative">
            <div className="absolute top-2 right-2 z-10">
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded text-s-text-faint bg-s-surface-alt">
                    {language}
                </span>
            </div>
            <textarea
                ref={textareaRef}
                value={String(value ?? '')}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={minLines}
                spellCheck={false}
                className={cn(
                    'block w-full rounded-lg border px-4 py-3 text-sm shadow-sm transition-colors font-mono leading-relaxed resize-y',
                    'bg-s-surface-alt text-s-text placeholder:text-s-text-faint',
                    'focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
                    'border-s-border-strong',
                )}
                placeholder={schema.placeholder || `Enter ${language}...`}
            />
        </div>
    );
}
