import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

interface SearchBarProps {
    initialValue?: string;
}

export function SearchBar({ initialValue = '' }: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setQuery(initialValue);
    }, [initialValue]);

    function handleChange(value: string) {
        setQuery(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            const url = new URL(window.location.href);
            if (value) {
                url.searchParams.set('search', value);
            } else {
                url.searchParams.delete('search');
            }
            url.searchParams.delete('page');

            router.visit(url.pathname + url.search, {
                preserveState: true,
                preserveScroll: true,
                only: ['records'],
            });
        }, 300);
    }

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div className="relative">
            <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-s-text-faint"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
                type="text"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-s-border-strong bg-s-input py-2 pl-9 pr-3 text-sm text-s-text transition-colors placeholder:text-s-text-faint hover:border-s-border-strong focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30"
            />
            {query && (
                <button
                    type="button"
                    onClick={() => handleChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-s-text-faint hover:text-s-text-muted"
                    aria-label="Clear search"
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}
