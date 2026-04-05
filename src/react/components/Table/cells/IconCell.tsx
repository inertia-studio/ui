import { cn } from '../../../../shared/utils/cn';
import { SchemaIcon } from '../../Icon';
import type { IconColumnSchema, IconSchema } from '../../../../shared/types/schema';

interface CellProps {
    schema: IconColumnSchema;
    value: unknown;
    record: Record<string, unknown>;
}

const sizeMap: Record<string, 'xs' | 'sm' | 'md' | 'lg' | 'xl'> = {
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
};

export function IconCell({ schema, value }: CellProps) {
    if (!value) {
        return <span className="text-s-text-faint">—</span>;
    }

    const stringValue = String(value);
    const color = schema.colors[stringValue] ?? undefined;
    const iconSize = schema.size ? sizeMap[schema.size] ?? 'md' : 'md';

    const iconSchema: IconSchema = {
        name: stringValue,
        provider: 'heroicons',
        variant: null,
    };

    return (
        <SchemaIcon
            schema={iconSchema}
            size={iconSize}
            className={cn(color === 'danger' ? 'text-red-500' : color === 'success' ? 'text-green-500' : color === 'warning' ? 'text-amber-500' : color === 'primary' ? 'text-s-accent' : '')}
        />
    );
}
