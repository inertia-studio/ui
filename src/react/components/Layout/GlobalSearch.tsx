import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { cn } from '../../../shared/utils/cn';
import { usePanel } from '../../hooks/usePanel';

interface SearchResultItem {
    title: string;
    url: string;
}

interface SearchResultGroup {
    module: string;
    label: string;
    results: SearchResultItem[];
}

export function GlobalSearch() {
    const { panel } = usePanel();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResultGroup[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Keyboard shortcut: Cmd+K / Ctrl+K to focus
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Debounced search
    const performSearch = useCallback(
        (searchQuery: string) => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            if (!searchQuery.trim()) {
                setResults([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            debounceRef.current = setTimeout(async () => {
                try {
                    const response = await fetch(
                        `${panel.path}/search?q=${encodeURIComponent(searchQuery.trim())}`,
                        { credentials: 'same-origin', headers: { 'Accept': 'application/json' } },
                    );

                    if (response.ok) {
                        const data = (await response.json()) as SearchResultGroup[];
                        setResults(data);
                    } else {
                        setResults([]);
                    }
                } catch {
                    setResults([]);
                } finally {
                    setIsLoading(false);
                }
            }, 300);
        },
        [panel.path],
    );

    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setQuery(value);
            setIsOpen(true);
            performSearch(value);
        },
        [performSearch],
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        },
        [],
    );

    const handleResultClick = useCallback(
        (url: string) => {
            setIsOpen(false);
            setQuery('');
            setResults([]);
            router.visit(url);
        },
        [],
    );

    const hasResults = results.length > 0;
    const showDropdown = isOpen && (query.trim().length > 0);

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                {/* Magnifying glass icon */}
                <svg
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-s-text-faint"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                </svg>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (query.trim()) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder="Search..."
                    className={cn(
                        'h-8 w-full rounded-lg border border-s-border bg-s-surface-alt pl-9 pr-12 text-sm text-s-text',
                        'placeholder:text-s-text-faint',
                        'transition-colors focus:border-s-accent focus:bg-s-surface focus:outline-none focus:ring-1 focus:ring-s-accent/30',
                    )}
                />

                {/* Keyboard shortcut hint */}
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-s-border bg-s-surface px-1.5 py-0.5 text-[10px] font-medium text-s-text-faint sm:inline-block">
                    {typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent) ? '\u2318' : 'Ctrl+'}K
                </kbd>
            </div>

            {showDropdown && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-s-border bg-s-surface shadow-lg">
                    {isLoading && (
                        <div className="flex items-center justify-center px-4 py-6 text-sm text-s-text-muted">
                            <svg
                                className="mr-2 h-4 w-4 animate-spin text-s-text-faint"
                                fill="none"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                            Searching...
                        </div>
                    )}

                    {!isLoading && !hasResults && query.trim().length > 0 && (
                        <div className="px-4 py-6 text-center text-sm text-s-text-muted">
                            No results found.
                        </div>
                    )}

                    {!isLoading && hasResults && (
                        <div className="max-h-80 overflow-y-auto py-1">
                            {results.map((group) => (
                                <div key={group.module}>
                                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-s-text-faint">
                                        {group.label}
                                    </div>
                                    {(group.results ?? []).map((item, itemIndex) => (
                                        <button
                                            key={itemIndex}
                                            type="button"
                                            onClick={() => handleResultClick(item.url)}
                                            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-s-text-secondary transition-colors hover:bg-s-hover group"
                                        >
                                            <span>{item.title}</span>
                                            <svg className="w-3.5 h-3.5 text-s-text-faint opacity-0 group-hover:opacity-100 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
