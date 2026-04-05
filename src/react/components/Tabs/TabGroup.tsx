import { cn } from '../../../shared/utils/cn';
import { SchemaIcon } from '../Icon';
import type { ListTabSchema } from '../../../shared/types/schema';

interface TabGroupProps {
    tabs: ListTabSchema[];
    activeTab: string;
    onTabChange: (slug: string) => void;
}

export function TabGroup({ tabs, activeTab, onTabChange }: TabGroupProps) {
    return (
        <div className="border-b border-s-border">
            <nav className="-mb-px flex gap-4 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.slug;

                    return (
                        <button
                            key={tab.slug}
                            type="button"
                            onClick={() => onTabChange(tab.slug)}
                            className={cn(
                                'inline-flex shrink-0 items-center gap-1.5 border-b-2 px-1 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                                isActive
                                    ? 'border-s-accent text-s-accent'
                                    : 'border-transparent text-s-text-muted hover:border-gray-300 dark:hover:border-gray-600 hover:text-s-text-secondary',
                            )}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {tab.icon && (
                                <SchemaIcon
                                    schema={tab.icon}
                                    size="sm"
                                    className={cn(
                                        isActive ? 'text-s-accent' : 'text-s-text-faint',
                                    )}
                                />
                            )}
                            {tab.label}
                            {tab.badge != null && (
                                <span
                                    className={cn(
                                        'ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                                        isActive
                                            ? 'bg-s-accent/10 text-s-accent'
                                            : 'bg-s-surface-alt text-s-text-muted',
                                    )}
                                >
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
