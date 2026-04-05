import { Select } from '../../Select';
import type { BelongsToFieldSchema } from '../../../../shared/types/schema';

interface BelongsToFieldProps {
    schema: BelongsToFieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string | null;
}

function getSearchUrl(fieldName: string): string | undefined {
    if (typeof window === 'undefined') return undefined;

    // URL is /{panelPath}/{module}/create or /{panelPath}/{module}/{id}/edit
    // We need /{panelPath}/{module}/relation-options/{field}
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);

    // Find the module slug — it's the segment before "create" or the one before the record ID
    // e.g. /admin/posts/create → module = "posts"
    // e.g. /admin/posts/5/edit → module = "posts"
    const createIdx = parts.indexOf('create');
    const editIdx = parts.indexOf('edit');

    let moduleSegments: string[];
    if (createIdx > 0) {
        moduleSegments = parts.slice(0, createIdx);
    } else if (editIdx > 0) {
        moduleSegments = parts.slice(0, editIdx - 1);
    } else {
        moduleSegments = parts.slice(0, -1);
    }

    return '/' + moduleSegments.join('/') + '/relation-options/' + fieldName;
}

export function BelongsToField({ schema, value, onChange }: BelongsToFieldProps) {
    const searchUrl = getSearchUrl(schema.name);

    return (
        <Select
            value={schema.multiple ? (value as string[] | null) : (value as string | null)}
            onChange={(v) => onChange(v)}
            placeholder={schema.placeholder ?? 'Select...'}
            searchable={schema.searchable}
            multiple={schema.multiple}
            disabled={schema.disabled}
            searchUrl={searchUrl}
            preload={schema.preload}
        />
    );
}
