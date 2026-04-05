import { formatDate, formatDateTime } from '../../../../shared/utils/formatters';
import type { DateColumnSchema } from '../../../../shared/types/schema';

interface CellProps {
    schema: DateColumnSchema;
    value: unknown;
    record: Record<string, unknown>;
}

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) {
        return 'just now';
    }
    if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    if (diffWeeks < 5) {
        return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    }
    if (diffMonths < 12) {
        return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    }
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
}

export function DateCell({ schema, value }: CellProps) {
    if (!value) {
        return <span className="text-s-text-faint">—</span>;
    }

    const dateString = String(value);

    if (schema.since) {
        const relative = formatRelativeTime(dateString);
        return (
            <span title={formatDateTime(dateString)} className="whitespace-nowrap">
                {relative}
            </span>
        );
    }

    const formatOptions: Intl.DateTimeFormatOptions = {};
    if (schema.timezone) {
        formatOptions.timeZone = schema.timezone;
    }

    if (schema.format) {
        return <span className="whitespace-nowrap">{formatDateTime(dateString, formatOptions)}</span>;
    }

    return <span className="whitespace-nowrap">{formatDate(dateString, formatOptions)}</span>;
}
