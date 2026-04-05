import type { PlaceholderFieldSchema } from '../../../../shared/types/schema';

interface PlaceholderFieldProps {
    schema: PlaceholderFieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string | null;
}

export function PlaceholderField({ schema }: PlaceholderFieldProps) {
    return (
        <div className="rounded-lg bg-s-bg px-3 py-2 text-sm text-s-text-muted">
            {schema.content}
        </div>
    );
}
