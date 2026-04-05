import type { ColorColumnSchema } from '../../../../shared/types/schema';

interface CellProps {
    schema: ColorColumnSchema;
    value: unknown;
    record: Record<string, unknown>;
}

export function ColorCell({ value }: CellProps) {
    if (!value) {
        return <span className="text-s-text-faint">—</span>;
    }

    const color = String(value);

    return (
        <div className="flex items-center gap-2">
            <span
                className="inline-block h-5 w-5 shrink-0 rounded-full border border-s-border"
                style={{ backgroundColor: color }}
                aria-label={color}
            />
            <span className="text-xs text-s-text-muted">{color}</span>
        </div>
    );
}
