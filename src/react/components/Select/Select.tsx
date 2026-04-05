import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { cn } from '../../../shared/utils/cn';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string | string[] | null;
    onChange: (value: string | string[] | null) => void;
    options?: SelectOption[] | Record<string, string>;
    placeholder?: string;
    searchable?: boolean;
    multiple?: boolean;
    disabled?: boolean;
    className?: string;
    /** Server-side search URL — fetches options via GET {searchUrl}?search={query} */
    searchUrl?: string;
    /** Preload options on mount (for server-side search) */
    preload?: boolean;
}

function normalizeOptions(options: SelectOption[] | Record<string, string>): SelectOption[] {
    if (Array.isArray(options)) return options;
    return Object.entries(options).map(([value, label]) => ({ value, label }));
}

export function Select({
    value,
    onChange,
    options: rawOptions,
    placeholder = 'Select...',
    searchable = false,
    multiple = false,
    disabled = false,
    className,
    searchUrl,
    preload = false,
}: SelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [serverOptions, setServerOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isServerSearch = !!searchUrl;

    const options = useMemo(() => {
        if (isServerSearch) return serverOptions;
        return normalizeOptions(rawOptions ?? {});
    }, [rawOptions, serverOptions, isServerSearch]);

    // Server-side search
    useEffect(() => {
        if (!isServerSearch) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!search && !preload && !open) {
            setServerOptions([]);
            return;
        }

        setLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const url = `${searchUrl}?search=${encodeURIComponent(search)}`;
                const res = await fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
                if (res.ok) {
                    const data = await res.json();
                    setServerOptions(Array.isArray(data) ? data : []);
                }
            } catch {
                setServerOptions([]);
            } finally {
                setLoading(false);
            }
        }, search ? 300 : 0);

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search, searchUrl, isServerSearch, preload, open]);

    // Preload on open for server search
    useEffect(() => {
        if (isServerSearch && open && serverOptions.length === 0) {
            setSearch('');
        }
    }, [open, isServerSearch]);

    const filtered = useMemo(() => {
        if (isServerSearch) return options; // server already filtered
        if (!search) return options;
        const q = search.toLowerCase();
        return options.filter(o => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q));
    }, [options, search, isServerSearch]);

    const selectedValues = useMemo(() => {
        if (value === null || value === undefined) return [];
        return Array.isArray(value) ? value : [value];
    }, [value]);

    const selectedLabels = useMemo(() => {
        return selectedValues
            .map(v => options.find(o => o.value === v)?.label ?? v)
            .join(', ');
    }, [selectedValues, options]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handler(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Focus search on open
    useEffect(() => {
        if (open && searchable) {
            setTimeout(() => searchRef.current?.focus(), 0);
        }
    }, [open, searchable]);

    const handleSelect = useCallback((optionValue: string) => {
        if (multiple) {
            const current = Array.isArray(value) ? value : [];
            if (current.includes(optionValue)) {
                const next = current.filter(v => v !== optionValue);
                onChange(next.length > 0 ? next : null);
            } else {
                onChange([...current, optionValue]);
            }
        } else {
            onChange(optionValue);
            setOpen(false);
            setSearch('');
        }
    }, [value, multiple, onChange]);

    const handleClear = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setSearch('');
    }, [onChange]);

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen(prev => !prev)}
                className={cn(
                    'flex w-full items-center gap-2 rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-left transition-colors',
                    'hover:border-s-border-strong focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    selectedValues.length > 0 ? 'text-s-text' : 'text-s-text-faint',
                    className,
                )}
            >
                <span className="flex-1 truncate">
                    {selectedValues.length > 0 ? selectedLabels : placeholder}
                </span>
                {selectedValues.length > 0 && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-0.5 rounded text-s-text-faint hover:text-s-text transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
                <svg className={cn('w-4 h-4 text-s-text-faint shrink-0 transition-transform', open && 'rotate-180')} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-s-border bg-s-surface shadow-lg overflow-hidden">
                    {/* Search */}
                    {searchable && (
                        <div className="p-2 border-b border-s-border">
                            <div className="relative">
                                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full h-8 pl-8 pr-3 text-sm rounded-lg border border-s-border bg-s-input text-s-text placeholder:text-s-text-faint focus:outline-none focus:border-s-accent focus:ring-1 focus:ring-s-accent/30"
                                />
                            </div>
                        </div>
                    )}

                    {/* Options */}
                    <div className="max-h-56 overflow-y-auto py-1">
                        {loading ? (
                            <div className="flex items-center justify-center px-3 py-4 text-sm text-s-text-muted">
                                <svg className="mr-2 h-4 w-4 animate-spin text-s-text-faint" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                Searching...
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="px-3 py-4 text-center text-sm text-s-text-muted">No options found</div>
                        ) : (
                            filtered.map(option => {
                                const isActive = selectedValues.includes(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={cn(
                                            'flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                                            isActive
                                                ? 'bg-s-accent/10 text-s-accent font-medium'
                                                : 'text-s-text-secondary hover:bg-s-hover hover:text-s-text',
                                        )}
                                    >
                                        {multiple && (
                                            <div className={cn(
                                                'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                                                isActive ? 'bg-s-accent border-s-accent' : 'border-s-border-strong',
                                            )}>
                                                {isActive && (
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                    </svg>
                                                )}
                                            </div>
                                        )}
                                        <span className="flex-1">{option.label}</span>
                                        {!multiple && isActive && (
                                            <svg className="w-4 h-4 text-s-accent shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
