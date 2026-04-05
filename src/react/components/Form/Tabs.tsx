import { useState, type ReactNode } from 'react';
import { cn } from '../../../shared/utils/cn';
import type { FormComponentSchema, TabsSchema } from '../../../shared/types/schema';
import { SchemaIcon } from '../Icon';

interface TabsProps {
    schema: TabsSchema;
    children: (schema: FormComponentSchema[]) => ReactNode;
}

export function Tabs({ schema, children }: TabsProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeTab = schema.tabs[activeIndex];

    return (
        <div className="col-span-full">
            <div className="border-b border-s-border">
                <nav className="-mb-px flex gap-4" aria-label="Tabs">
                    {schema.tabs.map((tab: TabsSchema['tabs'][number], index: number) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                'inline-flex items-center gap-1.5 border-b-2 px-1 py-2 text-sm font-medium transition-colors',
                                activeIndex === index
                                    ? 'border-s-accent text-s-accent'
                                    : 'border-transparent text-s-text-muted hover:border-gray-300 dark:hover:border-gray-600 hover:text-s-text-secondary',
                            )}
                        >
                            {tab.icon && <SchemaIcon schema={tab.icon} size="sm" />}
                            {tab.label}
                            {tab.badge != null && (
                                <span className="ml-1 inline-flex items-center rounded-full bg-s-surface-alt px-2 py-0.5 text-xs font-medium text-s-text-muted">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="pt-4">
                {activeTab && (
                    <div className="grid grid-cols-1 gap-4">
                        {children(activeTab.schema)}
                    </div>
                )}
            </div>
        </div>
    );
}
