import { formatMoney } from '../../../../shared/utils/formatters';
import type { MoneyColumnSchema } from '../../../../shared/types/schema';

interface CellProps {
    schema: MoneyColumnSchema;
    value: unknown;
    record: Record<string, unknown>;
}

export function MoneyCell({ schema, value }: CellProps) {
    if (value == null) {
        return <span className="text-s-text-faint">—</span>;
    }

    const numericValue = Number(value);
    if (isNaN(numericValue)) {
        return <span className="text-s-text-faint">—</span>;
    }

    const formatted = formatMoney(numericValue, schema.currency, schema.locale ?? undefined);

    return <span className="whitespace-nowrap tabular-nums">{formatted}</span>;
}
