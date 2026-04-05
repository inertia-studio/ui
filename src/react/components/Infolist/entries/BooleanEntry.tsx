import type { BooleanDetailSchema } from '../../../../shared/types/schema';

interface EntryProps {
    schema: BooleanDetailSchema;
    value: unknown;
}

export function BooleanEntry({ schema: _schema, value }: EntryProps) {
    const isTruthy = Boolean(value);

    if (isTruthy) {
        return (
            <svg
                className="h-5 w-5 text-green-500"
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
            className="h-5 w-5 text-red-500"
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
