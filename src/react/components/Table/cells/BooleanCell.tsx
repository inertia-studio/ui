import { cn } from '../../../../shared/utils/cn';
import { SchemaIcon } from '../../Icon';
import type { BooleanColumnSchema } from '../../../../shared/types/schema';

interface CellProps {
    schema: BooleanColumnSchema;
    value: unknown;
    record: Record<string, unknown>;
}

export function BooleanCell({ schema, value }: CellProps) {
    const isTruthy = Boolean(value);

    if (isTruthy && schema.trueIcon) {
        return (
            <SchemaIcon
                schema={schema.trueIcon}
                size="sm"
                className={cn(
                    'text-green-500',
                )}
            />
        );
    }

    if (!isTruthy && schema.falseIcon) {
        return (
            <SchemaIcon
                schema={schema.falseIcon}
                size="sm"
                className={cn(
                    'text-red-500',
                )}
            />
        );
    }

    if (isTruthy) {
        return (
            <svg
                className={cn(
                    'h-5 w-5',
                    'text-green-500',
                )}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-label="Yes"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
        );
    }

    return (
        <svg
            className={cn(
                'h-5 w-5',
                'text-red-500',
            )}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-label="No"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
    );
}
