import { cn } from '../../../shared/utils/cn';

export interface BreadcrumbItem {
    label: string;
    url?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <span key={index} className="flex items-center gap-1.5">
                        {index > 0 && (
                            <svg
                                className="h-3.5 w-3.5 shrink-0 text-s-text-faint"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        )}

                        {isLast || !item.url ? (
                            <span
                                className={cn(
                                    'truncate',
                                    isLast
                                        ? 'font-medium text-s-text'
                                        : 'text-s-text-muted',
                                )}
                                aria-current={isLast ? 'page' : undefined}
                            >
                                {item.label}
                            </span>
                        ) : (
                            <a
                                href={item.url}
                                className="truncate text-s-text-muted transition-colors hover:text-s-text-secondary"
                            >
                                {item.label}
                            </a>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
