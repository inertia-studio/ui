export interface DataPoint {
    label: string;
    value: number;
    color?: string;
}

export interface Series {
    name: string;
    data: number[];
    color?: string;
}

export const DEFAULT_COLOR = 'rgb(var(--s-accent))';
export const CHART_COLORS = [
    '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

export function formatValue(val: number): string {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val % 1 === 0 ? String(val) : val.toFixed(1);
}
