import { Select } from '../../Select';
import { usePanel } from '../../../hooks/usePanel';
import type { SelectFilterSchema } from '../../../../shared/types/schema';

interface ExtendedSelectFilterSchema extends SelectFilterSchema {
    serverSearch?: boolean;
    relationship?: string;
    preload?: boolean;
}

interface FilterProps {
    schema: ExtendedSelectFilterSchema;
    value: unknown;
    onChange: (value: unknown) => void;
    moduleSlug?: string;
}

export function SelectFilter({ schema, value, onChange, moduleSlug }: FilterProps) {
    const { panel } = usePanel();
    const panelPath = panel?.path ?? '/admin';

    const searchUrl = schema.serverSearch && schema.relationship && moduleSlug
        ? `${panelPath}/${moduleSlug}/filter-options/${schema.name}`
        : undefined;

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-s-text-muted">{schema.label}</span>
            <Select
                value={schema.multiple ? (value as string[] | null) : (value as string | null)}
                onChange={(v) => onChange(v)}
                options={schema.options}
                searchable={schema.searchable}
                multiple={schema.multiple}
                placeholder="All"
                searchUrl={searchUrl}
                preload={schema.preload}
            />
        </div>
    );
}
