import { DateRangePicker } from '../../DatePicker';
import type { DateFilterSchema } from '../../../../shared/types/schema';

interface FilterProps {
    schema: DateFilterSchema;
    value: unknown;
    onChange: (value: unknown) => void;
}

export function DateFilter({ schema, value, onChange }: FilterProps) {
    const range = value as { from: string | null; to: string | null } | null;

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-s-text-muted">{schema.label}</span>
            <DateRangePicker
                value={range}
                onChange={onChange}
            />
        </div>
    );
}
