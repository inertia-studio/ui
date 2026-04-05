import { DateRangePicker } from '../../DatePicker';
import type { DateRangeFieldSchema } from '../../../../shared/types/schema';

interface DateRangeFieldProps {
    schema: DateRangeFieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string | null;
}

export function DateRangeField({ schema, value, onChange }: DateRangeFieldProps) {
    const range = value as { from: string | null; to: string | null } | null;

    return (
        <DateRangePicker
            value={range}
            onChange={onChange}
            disabled={schema.disabled}
        />
    );
}
