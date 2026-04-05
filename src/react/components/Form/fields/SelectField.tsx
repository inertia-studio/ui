import { Select } from '../../Select';
import type { SelectFieldSchema } from '../../../../shared/types/schema';

interface SelectFieldProps {
    schema: SelectFieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string | null;
}

export function SelectField({ schema, value, onChange }: SelectFieldProps) {
    if (schema.native) {
        // Native HTML select
        const options = Array.isArray(schema.options)
            ? schema.options
            : Object.entries(schema.options).map(([v, l]) => ({ value: v, label: l }));

        return (
            <select
                id={schema.name}
                value={(value as string) ?? ''}
                onChange={(e) => onChange(e.target.value || null)}
                disabled={schema.disabled}
                className="w-full rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <option value="">{schema.placeholder ?? 'Select...'}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        );
    }

    return (
        <Select
            value={schema.multiple ? (value as string[] | null) : (value as string | null)}
            onChange={(v) => onChange(v)}
            options={schema.options}
            placeholder={schema.placeholder ?? 'Select...'}
            searchable={schema.searchable}
            multiple={schema.multiple}
            disabled={schema.disabled}
        />
    );
}
