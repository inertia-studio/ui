import type { HiddenFieldSchema } from '../../../../shared/types/schema';

interface HiddenFieldProps {
    schema: HiddenFieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string | null;
}

export function HiddenField({ schema, value }: HiddenFieldProps) {
    return (
        <input
            id={schema.name}
            type="hidden"
            name={schema.name}
            value={String(value ?? '')}
        />
    );
}
