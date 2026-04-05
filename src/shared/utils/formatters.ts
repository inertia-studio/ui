export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions): string {
    const date = value instanceof Date ? value : new Date(value);

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
    });
}

export function formatDateTime(value: string | Date, options?: Intl.DateTimeFormatOptions): string {
    const date = value instanceof Date ? value : new Date(value);

    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options,
    });
}

export function formatMoney(
    value: number,
    currency: string = 'USD',
    locale?: string,
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    }).format(value);
}

export function formatNumber(value: number, locale?: string, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(locale, options).format(value);
}

export function formatPercent(value: number, precision: number = 0): string {
    return new Intl.NumberFormat(undefined, {
        style: 'percent',
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
    }).format(value / 100);
}
