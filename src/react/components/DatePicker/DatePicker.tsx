import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { cn } from '../../../shared/utils/cn';

interface DatePickerProps {
    value: string | null;
    onChange: (value: string | null) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatDisplay(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function DatePicker({ value, onChange, placeholder = 'Pick a date', className, disabled }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    const selected = value ? new Date(value + 'T00:00:00') : null;

    const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());
    const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handler(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

    const calendarDays = useMemo(() => {
        const days: Array<{ day: number; current: boolean } | null> = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push({ day: d, current: true });
        return days;
    }, [daysInMonth, firstDay]);

    const handlePrev = useCallback(() => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    }, [viewMonth]);

    const handleNext = useCallback(() => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    }, [viewMonth]);

    const handleSelect = useCallback((day: number) => {
        const d = new Date(viewYear, viewMonth, day);
        onChange(formatDate(d));
        setOpen(false);
    }, [viewYear, viewMonth, onChange]);

    const isToday = (day: number) => {
        return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
    };

    const isSelected = (day: number) => {
        if (!selected) return false;
        return day === selected.getDate() && viewMonth === selected.getMonth() && viewYear === selected.getFullYear();
    };

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
                    value ? 'text-s-text' : 'text-s-text-faint',
                    className,
                )}
            >
                <svg className="w-4 h-4 text-s-text-faint shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                <span className="flex-1 truncate">{value ? formatDisplay(value) : placeholder}</span>
                {value && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onChange(null); }}
                        className="p-0.5 rounded text-s-text-faint hover:text-s-text transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </button>

            {/* Calendar dropdown */}
            {open && (
                <div className="absolute left-0 top-full z-50 mt-1 w-[280px] rounded-xl border border-s-border bg-s-surface p-3 shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <button type="button" onClick={handlePrev} className="p-1 rounded-md text-s-text-muted hover:bg-s-hover hover:text-s-text transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <span className="text-sm font-medium text-s-text">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button type="button" onClick={handleNext} className="p-1 rounded-md text-s-text-muted hover:bg-s-hover hover:text-s-text transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {DAYS.map(d => (
                            <div key={d} className="text-center text-[11px] font-medium text-s-text-faint py-1">{d}</div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7">
                        {calendarDays.map((cell, i) => (
                            <div key={i} className="aspect-square flex items-center justify-center">
                                {cell ? (
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(cell.day)}
                                        className={cn(
                                            'w-8 h-8 rounded-lg text-sm transition-colors',
                                            isSelected(cell.day)
                                                ? 'bg-s-accent text-s-accent-fg font-medium'
                                                : isToday(cell.day)
                                                    ? 'bg-s-surface-alt text-s-text font-medium'
                                                    : 'text-s-text-secondary hover:bg-s-hover',
                                        )}
                                    >
                                        {cell.day}
                                    </button>
                                ) : null}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-s-border">
                        <button
                            type="button"
                            onClick={() => { onChange(formatDate(today)); setOpen(false); }}
                            className="text-xs font-medium text-s-accent hover:underline"
                        >
                            Today
                        </button>
                        {value && (
                            <button
                                type="button"
                                onClick={() => { onChange(null); setOpen(false); }}
                                className="text-xs font-medium text-s-text-muted hover:text-s-text transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
