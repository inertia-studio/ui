import { useState, useMemo } from 'react';
import { cn } from '../../../shared/utils/cn';
import type { ColumnSchema, TableSchema, PaginatedData } from '../../../shared/types/schema';
import { cellComponentMap } from './cells';

interface InlineTableProps {
    schema: TableSchema;
    data: PaginatedData | Record<string, unknown>[];
    label?: string;
}

function resolveValue(record: Record<string, unknown>, name: string): unknown {
    if (name.includes('.')) {
        return name.split('.').reduce<unknown>((obj, key) => (obj as Record<string, unknown>)?.[key], record);
    }
    return record[name];
}

export function InlineTable({ schema, data, label }: InlineTableProps) {
    const [search, setSearch] = useState('');
    const [sortCol, setSortCol] = useState<string | null>(schema.defaultSort?.column ?? null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>(schema.defaultSort?.direction ?? 'asc');
    const [page, setPage] = useState(1);
    const perPage = 10;

    // Normalize data to flat array
    const allRows = useMemo(() => {
        if (Array.isArray(data)) return data;
        return (data as PaginatedData).data ?? [];
    }, [data]);

    // Client-side search
    const searchableCols = useMemo(() =>
        schema.columns.filter(c => c.searchable).map(c => c.name),
    [schema.columns]);

    const filtered = useMemo(() => {
        if (!search || searchableCols.length === 0) return allRows;
        const q = search.toLowerCase();
        return allRows.filter(row =>
            searchableCols.some(col => {
                const val = resolveValue(row, col);
                return val != null && String(val).toLowerCase().includes(q);
            })
        );
    }, [allRows, search, searchableCols]);

    // Client-side sort
    const sorted = useMemo(() => {
        if (!sortCol) return filtered;
        return [...filtered].sort((a, b) => {
            const aVal = resolveValue(a, sortCol);
            const bVal = resolveValue(b, sortCol);
            const aStr = aVal != null ? String(aVal) : '';
            const bStr = bVal != null ? String(bVal) : '';
            const cmp = aStr.localeCompare(bStr, undefined, { numeric: true });
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [filtered, sortCol, sortDir]);

    // Client-side pagination
    const totalPages = schema.paginated ? Math.max(1, Math.ceil(sorted.length / perPage)) : 1;
    const pageRows = schema.paginated ? sorted.slice((page - 1) * perPage, page * perPage) : sorted;

    const handleSort = (col: ColumnSchema) => {
        if (!col.sortable) return;
        if (sortCol === col.name) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortCol(col.name);
            setSortDir('asc');
        }
        setPage(1);
    };

    return (
        <div>
            {/* Header: label + search */}
            {(label || schema.searchable) && (
                <div className="flex items-center justify-between mb-3">
                    {label && <h3 className="text-sm font-semibold text-s-text">{label}</h3>}
                    {schema.searchable && (
                        <div className="relative">
                            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search..."
                                className="h-8 w-48 pl-8 pr-3 text-sm rounded-lg border border-s-border bg-s-input text-s-text placeholder:text-s-text-faint focus:outline-none focus:border-s-accent focus:ring-1 focus:ring-s-accent/30"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-s-border bg-s-surface">
                <table className="w-full text-sm text-s-text-secondary">
                    <thead className="sticky top-0 z-10 bg-s-surface">
                        <tr className="border-b border-s-border">
                            {schema.columns.map(col => (
                                <th
                                    key={col.name}
                                    className={cn(
                                        'text-left px-4 py-2.5 text-xs font-medium text-s-text-muted uppercase tracking-wider',
                                        col.sortable && 'cursor-pointer select-none hover:text-s-text',
                                    )}
                                    onClick={() => handleSort(col)}
                                >
                                    <span className="inline-flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && sortCol === col.name && (
                                            <svg className={cn('w-3 h-3', sortDir === 'desc' && 'rotate-180')} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                            </svg>
                                        )}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-s-border">
                        {pageRows.length === 0 ? (
                            <tr>
                                <td colSpan={schema.columns.length} className="px-4 py-8 text-center text-sm text-s-text-muted">
                                    No records found.
                                </td>
                            </tr>
                        ) : pageRows.map((row, ri) => (
                            <tr key={ri} className="hover:bg-s-hover transition-colors">
                                {schema.columns.map(col => {
                                    const value = resolveValue(row, col.name);
                                    const CellComponent = cellComponentMap[col.type];
                                    return (
                                        <td key={col.name} className="px-4 py-2.5">
                                            {CellComponent
                                                ? <CellComponent schema={col} value={value} record={row} />
                                                : <span>{value != null ? String(value) : '—'}</span>
                                            }
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {schema.paginated && totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-s-border text-xs text-s-text-muted">
                        <span>Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, sorted.length)} of {sorted.length}</span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-2 py-1 rounded-md border border-s-border text-s-text-secondary hover:bg-s-hover disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Prev
                            </button>
                            <span className="px-2">{page} / {totalPages}</span>
                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-2 py-1 rounded-md border border-s-border text-s-text-secondary hover:bg-s-hover disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
