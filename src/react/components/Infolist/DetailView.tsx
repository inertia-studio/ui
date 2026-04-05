import { useState, type ReactNode } from 'react';
import { cn } from '../../../shared/utils/cn';
import { SchemaIcon } from '../Icon';
import { detailEntryMap } from './entries';
import type {
    DetailSchema,
    DetailEntrySchema,
    SectionSchema,
} from '../../../shared/types/schema';

interface DetailViewProps {
    schema: DetailSchema[];
    record: Record<string, unknown>;
}

function EntryWrapper({ schema, record }: { schema: DetailEntrySchema; record: Record<string, unknown> }) {
    if (schema.hidden) return null;

    const value = record[schema.name];
    const EntryComponent = detailEntryMap[schema.type];

    if (!EntryComponent) {
        return (
            <div className={cn(spanClass(schema.columnSpan), 'px-5 py-4')}>
                <dt className="text-xs font-medium uppercase tracking-wider text-s-text-faint mb-1.5">{schema.label}</dt>
                <dd className="text-sm text-s-text-muted italic">Unknown type: {schema.type}</dd>
            </div>
        );
    }

    const content = <EntryComponent schema={schema} value={value} />;
    const wrappedContent = schema.url ? (
        <a href={schema.url} className="text-s-accent hover:underline" target="_blank" rel="noopener noreferrer">{content}</a>
    ) : content;

    return (
        <div className={cn(spanClass(schema.columnSpan), 'px-5 py-4')}>
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-s-text-faint mb-1.5">
                {schema.icon && <SchemaIcon schema={schema.icon} size="xs" className="text-s-text-faint" />}
                {schema.label}
            </dt>
            <dd className="text-sm text-s-text">{wrappedContent}</dd>
        </div>
    );
}

function spanClass(span: number | 'full'): string {
    if (span === 'full') return 'col-span-full';
    if (typeof span === 'number' && span >= 2) return `col-span-${span}`;
    return '';
}

function DetailSection({ schema, record }: { schema: SectionSchema; record: Record<string, unknown> }) {
    const [collapsed, setCollapsed] = useState(schema.collapsed);

    return (
        <div className="col-span-full">
            {/* Section header */}
            {(schema.heading || schema.description) && (
                <div className="flex items-center justify-between border-b border-s-border px-5 py-3.5">
                    <div>
                        {schema.heading && (
                            <h3 className="text-sm font-semibold text-s-text">{schema.heading}</h3>
                        )}
                        {schema.description && (
                            <p className="mt-0.5 text-xs text-s-text-muted">{schema.description}</p>
                        )}
                    </div>
                    {schema.collapsible && (
                        <button
                            type="button"
                            onClick={() => setCollapsed(prev => !prev)}
                            className="rounded p-1 text-s-text-faint hover:text-s-text-muted transition-colors"
                        >
                            <svg className={cn('h-4 w-4 transition-transform', collapsed && '-rotate-90')} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                    )}
                </div>
            )}

            {/* Section entries */}
            {!collapsed && (
                <div className={cn(
                    'grid gap-x-0 divide-x divide-s-border',
                    schema.columns === 1 && 'grid-cols-1 divide-x-0',
                    schema.columns === 2 && 'grid-cols-2',
                    schema.columns === 3 && 'grid-cols-3',
                    schema.columns >= 4 && 'grid-cols-4',
                )}>
                    {renderSchemaEntries(schema.schema as DetailSchema[], record)}
                </div>
            )}
        </div>
    );
}

function renderSchemaEntries(entries: DetailSchema[], record: Record<string, unknown>): ReactNode {
    return entries.map((entry, index) => {
        if (entry.type === 'section') {
            return <DetailSection key={index} schema={entry as SectionSchema} record={record} />;
        }
        return <EntryWrapper key={(entry as DetailEntrySchema).name ?? index} schema={entry as DetailEntrySchema} record={record} />;
    });
}

export function DetailView({ schema, record }: DetailViewProps) {
    return (
        <div className="rounded-xl border border-s-border bg-s-surface overflow-hidden">
            {renderSchemaEntries(schema, record)}
        </div>
    );
}
