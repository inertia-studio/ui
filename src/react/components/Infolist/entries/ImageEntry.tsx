import { cn } from '../../../../shared/utils/cn';
import type { ImageDetailSchema } from '../../../../shared/types/schema';

interface EntryProps {
    schema: ImageDetailSchema;
    value: unknown;
}

export function ImageEntry({ schema, value }: EntryProps) {
    if (!value) {
        return <span className="text-sm text-s-text-faint">--</span>;
    }

    const src = String(value);
    const width = schema.width ?? '80px';
    const height = schema.height ?? '80px';

    return (
        <img
            src={src}
            alt=""
            className={cn(
                'object-cover',
                schema.circular ? 'rounded-full' : 'rounded-lg',
            )}
            style={{ width, height }}
            loading="lazy"
        />
    );
}
