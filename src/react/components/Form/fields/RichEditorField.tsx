import type { RichEditorFieldSchema } from '../../../../shared/types/schema';

interface RichEditorFieldProps {
    schema: RichEditorFieldSchema;
    value: string;
    onChange: (value: string) => void;
    error?: string | null;
}

export function RichEditorField({ schema }: RichEditorFieldProps) {
    return (
        <div
            id={schema.name}
            className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-s-border-strong bg-s-bg px-4 py-8 text-center"
        >
            <div>
                <p className="text-sm font-medium text-s-text-muted">Rich Editor</p>
                <p className="mt-1 text-xs text-s-text-faint">Requires Tiptap integration</p>
            </div>
        </div>
    );
}
