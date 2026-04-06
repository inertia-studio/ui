import React, { useState, useMemo, useCallback, useEffect, type ReactNode } from 'react';
import { router } from '@inertiajs/react';
import { cn } from '../../../shared/utils/cn';
import { useStudioHooks } from '../../hooks/useStudioHooks';
import { SchemaIcon } from '../Icon';

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], obj);
}
import { cellComponentMap } from './cells';
import { SearchBar } from './SearchBar';
import { Pagination } from './Pagination';
import { FilterPanel } from './filters/FilterPanel';
import { ColumnToggle } from './ColumnToggle';
import { BulkActionBar } from './BulkActionBar';
import type { TableSchema, PaginatedData, ColumnSchema, ActionSchema } from '../../../shared/types/schema';

interface DataTableProps {
    schema: TableSchema;
    data: PaginatedData;
    module: { slug: string };
    panelPath: string;
    onSimpleEdit?: (record: Record<string, unknown>) => void;
}

const alignmentClasses: Record<string, string> = {
    start: 'text-left',
    center: 'text-center',
    end: 'text-right',
};

const actionColorClasses: Record<string, string> = {
    primary: 'text-s-accent hover:text-s-accent/80',
    danger: 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',
    warning: 'text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300',
    success: 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300',
    info: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
    gray: 'text-s-text-muted hover:text-s-text-secondary',
};

function SortIndicator({ column, currentSort, currentDirection }: {
    column: string;
    currentSort: string | null;
    currentDirection: string | null;
}) {
    const isActive = currentSort === column;

    return (
        <span className="ml-1 inline-flex flex-col">
            <svg
                className={cn(
                    'h-3 w-3 -mb-0.5',
                    isActive && currentDirection === 'asc' ? 'text-s-text' : 'text-s-text-faint',
                )}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                aria-hidden="true"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
            <svg
                className={cn(
                    'h-3 w-3 -mt-0.5',
                    isActive && currentDirection === 'desc' ? 'text-s-text' : 'text-s-text-faint',
                )}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                aria-hidden="true"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
        </span>
    );
}

export function DataTable({ schema, data, module, panelPath, onSimpleEdit }: DataTableProps) {
    const { invoke, has } = useStudioHooks();
    const hasBulkActions = schema.bulkActions.length > 0;

    // Live polling
    useEffect(() => {
        if (!schema.poll || schema.poll <= 0) return;

        const interval = setInterval(() => {
            router.reload({ only: ["records"] });
        }, schema.poll * 1000);

        return () => clearInterval(interval);
    }, [schema.poll]);

    // Parse current URL params
    const currentUrl = typeof window !== 'undefined' ? new URL(window.location.href) : null;
    const currentSearch = currentUrl?.searchParams.get('search') ?? '';
    const currentSort = currentUrl?.searchParams.get('sort') ?? null;
    const currentDirection = currentUrl?.searchParams.get('direction') ?? null;

    // Parse active filters from URL (supports flat and nested: filter[name] and filter[name][subkey])
    const activeFilters = useMemo(() => {
        const filters: Record<string, unknown> = {};
        if (!currentUrl) {
            return filters;
        }
        currentUrl.searchParams.forEach((val, key) => {
            // Nested: filter[created_at][from]
            const nestedMatch = key.match(/^filter\[([^\]]+)]\[([^\]]+)]$/);
            if (nestedMatch) {
                const [, name, subKey] = nestedMatch;
                if (!filters[name] || typeof filters[name] !== 'object') {
                    filters[name] = {};
                }
                (filters[name] as Record<string, string>)[subKey] = val;
                return;
            }
            // Flat: filter[role]
            const flatMatch = key.match(/^filter\[([^\]]+)]$/);
            if (flatMatch) {
                filters[flatMatch[1]] = val;
            }
        });
        return filters;
    }, [currentUrl?.search]);

    // Column visibility
    const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => {
        const hidden = new Set<string>();
        schema.columns.forEach((col) => {
            if (col.isToggledHiddenByDefault || col.hidden) {
                hidden.add(col.name);
            }
        });
        return hidden;
    });

    const visibleColumns = useMemo(() => {
        return schema.columns.filter((col) => !hiddenColumns.has(col.name) && !col.hidden);
    }, [schema.columns, hiddenColumns]);

    const handleColumnToggle = useCallback((columnName: string) => {
        setHiddenColumns((prev) => {
            const next = new Set(prev);
            if (next.has(columnName)) {
                next.delete(columnName);
            } else {
                next.add(columnName);
            }
            return next;
        });
    }, []);

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);

    const allRecordIds = useMemo(() => {
        return data.data.map((record) => record.id as string | number);
    }, [data.data]);

    const isAllSelected = allRecordIds.length > 0 && selectedIds.length === allRecordIds.length;

    const handleSelectAll = useCallback(() => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds([...allRecordIds]);
        }
    }, [isAllSelected, allRecordIds]);

    const handleSelectRow = useCallback((id: string | number) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((selectedId) => selectedId !== id);
            }
            return [...prev, id];
        });
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedIds([]);
    }, []);

    // Sort handling
    function handleSort(column: ColumnSchema) {
        if (!column.sortable) {
            return;
        }

        const url = new URL(window.location.href);
        let newDirection: 'asc' | 'desc' = 'asc';

        if (currentSort === column.name) {
            newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
        }

        url.searchParams.set('sort', column.name);
        url.searchParams.set('direction', newDirection);

        router.visit(url.pathname + url.search, {
            preserveScroll: true,
        });
    }

    // Action handling
    function handleRowAction(action: ActionSchema, record: Record<string, unknown>) {
        if (action.url) {
            const resolvedUrl = action.url.replace(/\{(\w+)}/g, (_match, key) => {
                return String(record[key] ?? '');
            });
            router.visit(resolvedUrl);
            return;
        }

        // Default URL pattern based on action type
        const recordId = record.id as string | number;
        const moduleBase = `${panelPath}/${module.slug}`;
        switch (action.type) {
            case 'view':
                router.visit(`${moduleBase}/${recordId}`);
                break;
            case 'edit':
                if (onSimpleEdit) {
                    onSimpleEdit(record);
                } else {
                    router.visit(`${moduleBase}/${recordId}/edit`);
                }
                break;
            case 'delete':
                if (action.requiresConfirmation) {
                    if (!confirm(action.confirmationMessage ?? 'Are you sure you want to delete this record?')) {
                        return;
                    }
                }
                router.delete(`${moduleBase}/${recordId}`, {
                    preserveState: true,
                    preserveScroll: true,
                });
                break;
            default:
                router.post(
                    `${moduleBase}/actions/${action.name}`,
                    {},
                    {
                        preserveState: true,
                        preserveScroll: true,
                    },
                );
        }
    }

    // Render cell
    function renderCell(column: ColumnSchema, record: Record<string, unknown>): ReactNode {
        // Resolve dot-notation: "user.name" → record.user.name
        const value = column.name.includes('.')
            ? column.name.split('.').reduce<unknown>((obj, key) => (obj as Record<string, unknown>)?.[key], record)
            : record[column.name];

        // Check for custom cell hook
        if (has('table:cell')) {
            const customCell = invoke('table:cell', column, value, record);
            if (customCell != null) {
                return customCell as ReactNode;
            }
        }

        const CellComponent = cellComponentMap[column.type];
        if (!CellComponent) {
            return <span className="text-s-text-faint">{String(value ?? '—')}</span>;
        }

        const cellContent = (
            <CellComponent schema={column} value={value} record={record} />
        );

        // Wrap in link if column has URL
        if (column.url) {
            const resolvedUrl = column.url.replace(/\{(\w+)}/g, (_match, key) => {
                return String(record[key] ?? '');
            });
            return (
                <a href={resolvedUrl} className="text-s-accent hover:underline">
                    {cellContent}
                </a>
            );
        }

        return cellContent;
    }

    // Hook-based header actions
    const headerActions = has('table:header-actions')
        ? (invoke('table:header-actions') as ReactNode[] | null)
        : null;

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                {schema.searchable && (
                    <div className="w-full sm:w-72">
                        <SearchBar initialValue={currentSearch} />
                    </div>
                )}

                <div className="flex flex-1 items-center justify-end gap-2">
                    {schema.poll > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-s-text-faint" title={`Refreshing every ${schema.poll}s`}>
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            Live
                        </span>
                    )}
                    {schema.filters.length > 0 && (
                        <FilterPanel
                            filters={schema.filters}
                            activeFilters={activeFilters}
                            columns={schema.filterColumns ?? 2}
                            moduleSlug={module.slug}
                        />
                    )}

                    <ColumnToggle
                        columns={schema.columns}
                        hiddenColumns={hiddenColumns}
                        onToggle={handleColumnToggle}
                    />

                    {headerActions && headerActions.map((action, index) => (
                        <span key={index}>{action}</span>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-s-border bg-s-surface">
                <table className="w-full text-left text-sm text-s-text-secondary">
                    <thead className="border-b border-s-border bg-s-surface-alt sticky top-0 z-10">
                        <tr>
                            {/* Checkbox column */}
                            {hasBulkActions && (
                                <th className="w-12 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 rounded border-s-border-strong text-s-accent focus:ring-s-accent/30 bg-s-input"
                                        aria-label="Select all rows"
                                    />
                                </th>
                            )}

                            {/* Column headers */}
                            {visibleColumns.map((column) => (
                                <th
                                    key={column.name}
                                    className={cn(
                                        'px-4 py-3 text-xs font-medium uppercase tracking-wider text-s-text-muted',
                                        alignmentClasses[column.alignment] ?? 'text-left',
                                        column.sortable && 'cursor-pointer select-none hover:text-s-text',
                                    )}
                                    onClick={() => handleSort(column)}
                                >
                                    <span className="inline-flex items-center">
                                        {column.label}
                                        {column.sortable && (
                                            <SortIndicator
                                                column={column.name}
                                                currentSort={currentSort}
                                                currentDirection={currentDirection}
                                            />
                                        )}
                                    </span>
                                </th>
                            ))}

                            {/* Actions column */}
                            {schema.actions.length > 0 && (
                                <th className="w-20 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-s-text-muted">
                                    <span className="sr-only">Actions</span>
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-s-border">
                        {data.data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={visibleColumns.length + (hasBulkActions ? 1 : 0) + (schema.actions.length > 0 ? 1 : 0)}
                                    className="px-4 py-12 text-center"
                                >
                                    {has('table:empty-state')
                                        ? (invoke('table:empty-state') as ReactNode)
                                        : (
                                            <div className="flex flex-col items-center gap-2">
                                                <svg
                                                    className="h-10 w-10 text-s-text-faint"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1}
                                                    stroke="currentColor"
                                                    aria-hidden="true"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                                </svg>
                                                <p className="text-sm font-medium text-s-text-muted">No records found</p>
                                                <p className="text-xs text-s-text-faint">Try adjusting your search or filters.</p>
                                            </div>
                                        )
                                    }
                                </td>
                            </tr>
                        ) : (
                            data.data.map((record, rowIndex) => {
                                const recordId = record.id as string | number;
                                const isSelected = selectedIds.includes(recordId);

                                // Hook: row class
                                const rowClass = has('table:row-class')
                                    ? (invoke('table:row-class', record, rowIndex) as string | null)
                                    : null;

                                // Group header row
                                const groupByCol = schema.groupBy;
                                const totalColSpan = visibleColumns.length + (hasBulkActions ? 1 : 0) + (schema.actions.length > 0 ? 1 : 0);
                                let groupHeader: ReactNode = null;

                                if (groupByCol) {
                                    const groupVal = String(getNestedValue(record, groupByCol) ?? 'Ungrouped');
                                    const prevRecord = rowIndex > 0 ? data.data[rowIndex - 1] : null;
                                    const prevGroupVal = prevRecord ? String(getNestedValue(prevRecord, groupByCol) ?? 'Ungrouped') : null;

                                    if (rowIndex === 0 || groupVal !== prevGroupVal) {
                                        const groupCount = data.data.filter(
                                            (r) => String(getNestedValue(r, groupByCol) ?? 'Ungrouped') === groupVal,
                                        ).length;
                                        groupHeader = (
                                            <tr className="bg-s-surface-alt">
                                                <td colSpan={totalColSpan} className="px-4 py-2">
                                                    <span className="text-xs font-semibold text-s-text-muted uppercase tracking-wide">{groupVal}</span>
                                                    <span className="ml-2 text-[11px] text-s-text-faint">{groupCount}</span>
                                                </td>
                                            </tr>
                                        );
                                    }
                                }

                                return (
                                    <React.Fragment key={recordId ?? rowIndex}>
                                    {groupHeader}
                                    <tr
                                        className={cn(
                                            'transition-colors hover:bg-s-hover',
                                            isSelected && 'bg-s-accent/5',
                                            rowClass,
                                        )}
                                    >
                                        {/* Checkbox */}
                                        {hasBulkActions && (
                                            <td className="w-12 px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(recordId)}
                                                    className="h-4 w-4 rounded border-s-border-strong text-s-accent focus:ring-s-accent/30 bg-s-input"
                                                    aria-label={`Select row ${rowIndex + 1}`}
                                                />
                                            </td>
                                        )}

                                        {/* Data cells */}
                                        {visibleColumns.map((column) => (
                                            <td
                                                key={column.name}
                                                className={cn(
                                                    'px-4 py-3',
                                                    alignmentClasses[column.alignment] ?? 'text-left',
                                                    !column.wrap && 'whitespace-nowrap',
                                                )}
                                            >
                                                {renderCell(column, record)}
                                                {column.description && (
                                                    <p className="mt-0.5 text-xs text-s-text-faint">
                                                        {typeof record[column.description] === 'string'
                                                            ? (record[column.description] as string)
                                                            : column.description}
                                                    </p>
                                                )}
                                            </td>
                                        ))}

                                        {/* Row actions */}
                                        {schema.actions.length > 0 && (
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {schema.actions
                                                        .filter((action) => action.authorized)
                                                        .map((action) => (
                                                            <button
                                                                key={action.name}
                                                                type="button"
                                                                onClick={() => handleRowAction(action, record)}
                                                                className={cn(
                                                                    'inline-flex items-center rounded-md p-1.5 transition-colors',
                                                                    actionColorClasses[action.color ?? 'gray'] ?? actionColorClasses.gray,
                                                                )}
                                                                title={action.label}
                                                            >
                                                                {action.icon ? (
                                                                    <SchemaIcon schema={action.icon} size="sm" />
                                                                ) : (
                                                                    <span className="text-xs font-medium">{action.label}</span>
                                                                )}
                                                            </button>
                                                        ))}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {schema.paginated && <Pagination data={data} />}
            </div>

            {/* Bulk action bar */}
            {hasBulkActions && (
                <BulkActionBar
                    selectedIds={selectedIds}
                    actions={schema.bulkActions}
                    panelPath={panelPath}
                    module={module}
                    onClearSelection={handleClearSelection}
                />
            )}
        </div>
    );
}
