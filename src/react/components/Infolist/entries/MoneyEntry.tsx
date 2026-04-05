import { formatMoney } from '../../../../shared/utils/formatters';
import type { MoneyDetailSchema } from '../../../../shared/types/schema';

interface EntryProps {
    schema: MoneyDetailSchema;
    value: unknown;
}

export function MoneyEntry({ schema, value }: EntryProps) {
    if (value == null) {
        return <span className="text-sm text-s-text-faint">--</span>;
    }

    const numericValue = Number(value);
    if (isNaN(numericValue)) {
        return <span className="text-sm text-s-text-faint">--</span>;
    }

    const formatted = formatMoney(numericValue, schema.currency, schema.locale ?? undefined);

    return (
        <span className="text-sm tabular-nums text-s-text">
            {formatted}
        </span>
    );
}
