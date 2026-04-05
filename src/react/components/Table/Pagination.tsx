import { router } from '@inertiajs/react';
import { cn } from '../../../shared/utils/cn';
import type { PaginatedData } from '../../../shared/types/schema';

interface PaginationProps {
    data: PaginatedData;
}

function navigateToPage(page: number) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(page));

    router.visit(url.pathname + url.search, {
        preserveState: true,
        preserveScroll: true,
        only: ['records'],
    });
}

function getPageNumbers(currentPage: number, lastPage: number): Array<number | '...'> {
    if (lastPage <= 7) {
        return Array.from({ length: lastPage }, (_, i) => i + 1);
    }

    const pages: Array<number | '...'> = [];

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
        pages.push('...');
    }

    // Show pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(lastPage - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (currentPage < lastPage - 2) {
        pages.push('...');
    }

    // Always show last page
    if (lastPage > 1) {
        pages.push(lastPage);
    }

    return pages;
}

export function Pagination({ data }: PaginationProps) {
    const { current_page: currentPage, last_page: lastPage, from, to, total } = data;

    if (lastPage <= 1) {
        return null;
    }

    const pages = getPageNumbers(currentPage, lastPage);
    const hasPrevious = currentPage > 1;
    const hasNext = currentPage < lastPage;

    return (
        <div className="flex items-center justify-between border-t border-s-border px-2 py-3">
            <div className="text-sm text-s-text-muted">
                {from != null && to != null ? (
                    <span>
                        Showing <span className="font-medium">{from}</span> to{' '}
                        <span className="font-medium">{to}</span> of{' '}
                        <span className="font-medium">{total}</span> results
                    </span>
                ) : (
                    <span>
                        <span className="font-medium">{total}</span> results
                    </span>
                )}
            </div>

            <nav className="flex items-center gap-1" aria-label="Pagination">
                {/* Previous */}
                <button
                    type="button"
                    onClick={() => hasPrevious && navigateToPage(currentPage - 1)}
                    disabled={!hasPrevious}
                    className={cn(
                        'inline-flex items-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors',
                        hasPrevious
                            ? 'text-s-text-secondary hover:bg-s-hover'
                            : 'cursor-not-allowed text-s-text-faint',
                    )}
                    aria-label="Previous page"
                >
                    <svg
                        className="mr-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    Previous
                </button>

                {/* Page numbers */}
                <div className="hidden items-center gap-0.5 sm:flex">
                    {pages.map((page, index) => {
                        if (page === '...') {
                            return (
                                <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm text-s-text-faint">
                                    ...
                                </span>
                            );
                        }

                        const isCurrentPage = page === currentPage;

                        return (
                            <button
                                key={page}
                                type="button"
                                onClick={() => !isCurrentPage && navigateToPage(page)}
                                className={cn(
                                    'inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                                    isCurrentPage
                                        ? 'bg-s-accent text-white'
                                        : 'text-s-text-secondary hover:bg-s-hover',
                                )}
                                aria-current={isCurrentPage ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                {/* Next */}
                <button
                    type="button"
                    onClick={() => hasNext && navigateToPage(currentPage + 1)}
                    disabled={!hasNext}
                    className={cn(
                        'inline-flex items-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors',
                        hasNext
                            ? 'text-s-text-secondary hover:bg-s-hover'
                            : 'cursor-not-allowed text-s-text-faint',
                    )}
                    aria-label="Next page"
                >
                    Next
                    <svg
                        className="ml-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </nav>
        </div>
    );
}
