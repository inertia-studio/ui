import { useState, type ReactNode } from 'react';
import { cn } from '../../../shared/utils/cn';
import type { SectionSchema } from '../../../shared/types/schema';

interface SectionProps {
    schema: SectionSchema;
    children: ReactNode;
}

export function Section({ schema, children }: SectionProps) {
    const [collapsed, setCollapsed] = useState(schema.collapsed);

    return (
        <div
            className={cn(
                'col-span-full',
                schema.aside && 'grid grid-cols-3 gap-6',
            )}
        >
            {(schema.heading || schema.description) && (
                <div className={cn(schema.aside && 'col-span-1')}>
                    <div className="flex items-center justify-between">
                        {schema.heading && (
                            <h3 className="text-base font-semibold text-s-text">
                                {schema.heading}
                            </h3>
                        )}
                        {schema.collapsible && (
                            <button
                                type="button"
                                onClick={() => setCollapsed((prev: boolean) => !prev)}
                                className="rounded p-1 text-s-text-faint transition-colors hover:text-s-text-muted"
                                aria-label={collapsed ? 'Expand section' : 'Collapse section'}
                            >
                                <svg
                                    className={cn(
                                        'h-4 w-4 transition-transform',
                                        collapsed && '-rotate-90',
                                    )}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                    {schema.description && (
                        <p className="mt-1 text-sm text-s-text-muted">
                            {schema.description}
                        </p>
                    )}
                </div>
            )}

            {!collapsed && (
                <div
                    className={cn(
                        'grid gap-4',
                        schema.aside && 'col-span-2',
                        schema.columns === 1 && 'grid-cols-1',
                        schema.columns === 2 && 'grid-cols-2',
                        schema.columns === 3 && 'grid-cols-3',
                        schema.columns === 4 && 'grid-cols-4',
                        schema.columns >= 5 && 'grid-cols-5',
                    )}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
