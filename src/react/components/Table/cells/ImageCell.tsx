import { cn } from '../../../../shared/utils/cn';
import type { ImageColumnSchema } from '../../../../shared/types/schema';

interface CellProps {
    schema: ImageColumnSchema;
    value: unknown;
    record: Record<string, unknown>;
}

export function ImageCell({ schema, value }: CellProps) {
    if (!value) {
        return <span className="text-s-text-faint">—</span>;
    }

    const raw = String(value);
    // If it's a relative path (not a URL), prepend /storage/
    const src = raw.startsWith('http') || raw.startsWith('/') ? raw : `/storage/${raw}`;
    const width = schema.width ?? '40px';
    const height = schema.height ?? '40px';

    return (
        <img
            src={src}
            alt=""
            className={cn(
                'object-cover',
                schema.circular && 'rounded-full',
                schema.square && 'rounded-md',
                !schema.circular && !schema.square && 'rounded-md',
            )}
            style={{ width, height }}
            loading="lazy"
        />
    );
}
