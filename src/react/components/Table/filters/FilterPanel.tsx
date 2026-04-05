import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { cn } from '../../../../shared/utils/cn';
import type { FilterSchema } from '../../../../shared/types/schema';
import { filterComponentMap } from './index';

interface FilterPanelProps {
    filters: FilterSchema[];
    activeFilters: Record<string, unknown>;
    columns?: number;
    moduleSlug?: string;
}

const gridColsClass: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
};

const panelWidthClass: Record<number, string> = {
    1: 'w-72',
    2: 'w-[28rem]',
    3: 'w-[40rem]',
    4: 'w-[52rem]',
    5: 'w-[64rem]',
    6: 'w-[76rem]',
};

export function FilterPanel({ filters, activeFilters, columns = 2, moduleSlug }: FilterPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState<Record<string, unknown>>(activeFilters);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        function handler(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    const activeCount = useMemo(() => {
        return Object.values(localFilters).filter((v) => v != null).length;
    }, [localFilters]);

    const handleFilterChange = useCallback((name: string, value: unknown) => {
        const updated = { ...localFilters, [name]: value };
        setLocalFilters(updated);

        const url = new URL(window.location.href);
        // Reset to page 1 when filters change
        url.searchParams.delete('page');

        // Update filter params
        Object.entries(updated).forEach(([key, val]) => {
            if (val == null) {
                url.searchParams.delete(`filter[${key}]`);
            } else if (typeof val === 'object') {
                const obj = val as Record<string, unknown>;
                Object.entries(obj).forEach(([subKey, subVal]) => {
                    if (subVal == null || subVal === '') {
                        url.searchParams.delete(`filter[${key}][${subKey}]`);
                    } else {
                        url.searchParams.set(`filter[${key}][${subKey}]`, String(subVal));
                    }
                });
            } else {
                url.searchParams.set(`filter[${key}]`, String(val));
            }
        });

        router.visit(url.pathname + url.search, {
            preserveState: true, preserveScroll: true, only: ["records"],
        });
    }, [localFilters]);

    const handleClearAll = useCallback(() => {
        setLocalFilters({});

        const url = new URL(window.location.href);
        url.searchParams.delete('page');
        // Remove all filter params
        const keysToDelete: string[] = [];
        url.searchParams.forEach((_val, key) => {
            if (key.startsWith('filter[')) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach((key) => url.searchParams.delete(key));

        router.visit(url.pathname + url.search, {
            preserveState: true, preserveScroll: true, only: ["records"],
        });
    }, []);

    if (filters.length === 0) {
        return null;
    }

    return (
        <div ref={panelRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm font-medium text-s-text-secondary transition-colors hover:bg-s-hover',
                    activeCount > 0 && 'border-s-accent text-s-accent',
                )}
            >
                <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                </svg>
                Filters
                {activeCount > 0 && (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-s-accent text-xs text-white">
                        {activeCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={cn('absolute right-0 z-20 mt-2 rounded-xl border border-s-border bg-s-surface p-4 shadow-lg', panelWidthClass[columns] ?? 'w-[28rem]')}>
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-s-text">Filters</h3>
                        {activeCount > 0 && (
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="text-xs font-medium text-s-accent hover:underline"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className={cn('grid gap-4', gridColsClass[columns] ?? 'grid-cols-2')}>
                        {filters.map((filter) => {
                            const FilterComponent = filterComponentMap[filter.type];
                            if (!FilterComponent) {
                                return null;
                            }

                            return (
                                <FilterComponent
                                    key={filter.name}
                                    schema={filter}
                                    value={localFilters[filter.name] ?? null}
                                    onChange={(val: unknown) => handleFilterChange(filter.name, val)}
                                    moduleSlug={moduleSlug}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
