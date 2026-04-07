import { useState, useCallback, useRef } from 'react';
import { cn } from '../../../../shared/utils/cn';
import type { FieldSchema } from '../../../../shared/types/schema';

interface MarkdownEditorFieldProps {
    schema: FieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
}

const toolbarButtons = [
    { label: 'B', action: 'bold', wrap: ['**', '**'] },
    { label: 'I', action: 'italic', wrap: ['_', '_'] },
    { label: '~~', action: 'strike', wrap: ['~~', '~~'] },
    { label: '`', action: 'code', wrap: ['`', '`'] },
    { label: 'H1', action: 'h1', prefix: '# ' },
    { label: 'H2', action: 'h2', prefix: '## ' },
    { label: 'H3', action: 'h3', prefix: '### ' },
    { label: '•', action: 'ul', prefix: '- ' },
    { label: '1.', action: 'ol', prefix: '1. ' },
    { label: '>', action: 'quote', prefix: '> ' },
    { label: '---', action: 'hr', insert: '\n---\n' },
    { label: '[]', action: 'link', insert: '[text](url)' },
] as const;

export function MarkdownEditorField({ schema, value, onChange }: MarkdownEditorFieldProps) {
    const minLines = (schema as Record<string, unknown>).minLines as number ?? 8;
    const [preview, setPreview] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const text = String(value ?? '');

    const applyFormat = useCallback((button: typeof toolbarButtons[number]) => {
        const ta = textareaRef.current;
        if (!ta) return;

        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = text.substring(start, end);

        let newText: string;
        let cursorPos: number;

        if ('wrap' in button) {
            newText = text.substring(0, start) + button.wrap[0] + (selected || 'text') + button.wrap[1] + text.substring(end);
            cursorPos = start + button.wrap[0].length + (selected || 'text').length;
        } else if ('prefix' in button) {
            const lineStart = text.lastIndexOf('\n', start - 1) + 1;
            newText = text.substring(0, lineStart) + button.prefix + text.substring(lineStart);
            cursorPos = start + button.prefix.length;
        } else {
            newText = text.substring(0, start) + button.insert + text.substring(end);
            cursorPos = start + button.insert.length;
        }

        onChange(newText);
        requestAnimationFrame(() => {
            ta.focus();
            ta.selectionStart = ta.selectionEnd = cursorPos;
        });
    }, [text, onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const ta = e.currentTarget;
            const start = ta.selectionStart;
            const newValue = text.substring(0, start) + '  ' + text.substring(ta.selectionEnd);
            onChange(newValue);
            requestAnimationFrame(() => {
                ta.selectionStart = ta.selectionEnd = start + 2;
            });
        }
    }, [text, onChange]);

    // Simple markdown to HTML for preview
    const renderPreview = useCallback((md: string) => {
        return md
            .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>')
            .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-1">$1</h2>')
            .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/_(.+?)_/g, '<em>$1</em>')
            .replace(/~~(.+?)~~/g, '<del>$1</del>')
            .replace(/`(.+?)`/g, '<code class="bg-s-surface-alt px-1 rounded text-sm font-mono">$1</code>')
            .replace(/^> (.+)$/gm, '<blockquote class="border-l-3 border-s-border pl-3 text-s-text-muted">$1</blockquote>')
            .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
            .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
            .replace(/^---$/gm, '<hr class="border-s-border my-3">')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-s-accent underline">$1</a>')
            .replace(/\n/g, '<br>');
    }, []);

    return (
        <div className="rounded-lg border border-s-border-strong overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-s-border bg-s-surface-alt">
                {toolbarButtons.map((btn) => (
                    <button
                        key={btn.action}
                        type="button"
                        onClick={() => { if (!preview) applyFormat(btn); }}
                        disabled={preview}
                        className="px-1.5 py-0.5 rounded text-xs font-mono text-s-text-muted hover:text-s-text hover:bg-s-hover transition-colors disabled:opacity-40"
                        title={btn.action}
                    >
                        {btn.label}
                    </button>
                ))}

                <div className="flex-1" />

                {/* Preview toggle */}
                <button
                    type="button"
                    onClick={() => setPreview((v) => !v)}
                    className={cn(
                        'px-2 py-0.5 rounded text-xs transition-colors',
                        preview ? 'bg-s-accent/10 text-s-accent font-medium' : 'text-s-text-muted hover:text-s-text',
                    )}
                >
                    {preview ? 'Edit' : 'Preview'}
                </button>
            </div>

            {/* Editor / Preview */}
            {preview ? (
                <div
                    className="px-4 py-3 text-sm text-s-text-secondary leading-relaxed min-h-[8rem] bg-s-input"
                    dangerouslySetInnerHTML={{ __html: renderPreview(text) || '<span class="text-s-text-faint">Nothing to preview</span>' }}
                />
            ) : (
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={minLines}
                    spellCheck={false}
                    className="block w-full px-4 py-3 text-sm leading-relaxed resize-y bg-s-input text-s-text placeholder:text-s-text-faint focus:outline-none font-mono"
                    placeholder={schema.placeholder || 'Write markdown...'}
                />
            )}
        </div>
    );
}
