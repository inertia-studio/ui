import { useState } from 'react';
import { cn } from '../../../../shared/utils/cn';
import { formatDate, formatDateTime, formatMoney } from '../../../../shared/utils/formatters';
import type { TextColumnSchema } from '../../../../shared/types/schema';

interface CellProps {
    schema: TextColumnSchema;
    value: unknown;
    record: Record<string, unknown>;
}

const weightClasses: Record<string, string> = {
    thin: 'font-thin',
    extralight: 'font-extralight',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
};

const sizeClasses: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
};

function formatValue(value: unknown, schema: TextColumnSchema): string {
    if (value == null) {
        return '';
    }

    const raw = String(value);

    if (schema.formatAs === 'dateTime') {
        return formatDateTime(raw, (schema.formatOptions as Intl.DateTimeFormatOptions) ?? undefined);
    }

    if (schema.formatAs === 'date') {
        return formatDate(raw, (schema.formatOptions as Intl.DateTimeFormatOptions) ?? undefined);
    }

    if (schema.formatAs === 'money') {
        const currency = (schema.formatOptions?.currency as string) ?? 'USD';
        const locale = (schema.formatOptions?.locale as string) ?? undefined;
        return formatMoney(Number(value), currency, locale);
    }

    return raw;
}

function truncateText(text: string, limit: number | null, words: number | null): string {
    if (words != null && words > 0) {
        const wordArray = text.split(/\s+/);
        if (wordArray.length > words) {
            return wordArray.slice(0, words).join(' ') + '...';
        }
        return text;
    }

    if (limit != null && limit > 0 && text.length > limit) {
        return text.slice(0, limit) + '...';
    }

    return text;
}

export function TextCell({ schema, value }: CellProps) {
    const [copied, setCopied] = useState(false);

    const formatted = formatValue(value, schema);
    const displayText = truncateText(formatted, schema.limit, schema.words);

    const handleCopy = async () => {
        if (!schema.copyable) {
            return;
        }
        try {
            await navigator.clipboard.writeText(formatted);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard API not available
        }
    };

    return (
        <span
            className={cn(
                schema.weight && weightClasses[schema.weight],
                schema.size && sizeClasses[schema.size],
                schema.color === 'danger' ? 'text-red-500' : schema.color === 'success' ? 'text-green-500' : schema.color === 'warning' ? 'text-amber-500' : '',
                !schema.wrap && 'whitespace-nowrap',
                schema.copyable && 'cursor-pointer',
            )}
            onClick={schema.copyable ? handleCopy : undefined}
            title={schema.copyable ? (copied ? 'Copied!' : 'Click to copy') : undefined}
        >
            {displayText || <span className="text-s-text-faint">—</span>}
            {schema.copyable && copied && (
                <svg
                    className="ml-1 inline-block h-3.5 w-3.5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
            )}
        </span>
    );
}
