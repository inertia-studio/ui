import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { cn } from '../../../shared/utils/cn';

interface DateRange {
    from: string | null;
    to: string | null;
}

interface DateRangePickerProps {
    value: DateRange | null;
    onChange: (value: DateRange | null) => void;
    placeholder?: string;
    disabled?: boolean;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

function toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatShort(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function compareDates(a: string, b: string): number {
    return a.localeCompare(b);
}

export function DateRangePicker({ value, onChange, placeholder = 'Select date range', disabled }: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const [selecting, setSelecting] = useState<'from' | 'to'>('from');
    const [tempFrom, setTempFrom] = useState<string | null>(value?.from ?? null);
    const [tempTo, setTempTo] = useState<string | null>(value?.to ?? null);
    const [hoverDate, setHoverDate] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    // Sync from prop
    useEffect(() => {
        setTempFrom(value?.from ?? null);
        setTempTo(value?.to ?? null);
    }, [value?.from, value?.to]);

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

    const handleOpen = useCallback(() => {
        if (disabled) return;
        setOpen(true);
        setSelecting('from');
        if (value?.from) {
            const d = new Date(value.from + 'T00:00:00');
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
        }
    }, [disabled, value?.from]);

    const handleDayClick = useCallback((dateStr: string) => {
        if (selecting === 'from') {
            setTempFrom(dateStr);
            setTempTo(null);
            setSelecting('to');
        } else {
            let from = tempFrom!;
            let to = dateStr;
            // Ensure from <= to
            if (compareDates(from, to) > 0) {
                [from, to] = [to, from];
            }
            setTempFrom(from);
            setTempTo(to);
            onChange({ from, to });
            setOpen(false);
            setSelecting('from');
        }
    }, [selecting, tempFrom, onChange]);

    const isInRange = useCallback((dateStr: string): boolean => {
        if (!tempFrom) return false;
        const end = selecting === 'to' ? (hoverDate ?? tempTo) : tempTo;
        if (!end) return false;
        let [a, b] = [tempFrom, end];
        if (compareDates(a, b) > 0) [a, b] = [b, a];
        return compareDates(dateStr, a) >= 0 && compareDates(dateStr, b) <= 0;
    }, [tempFrom, tempTo, hoverDate, selecting]);

    const isRangeStart = useCallback((dateStr: string): boolean => {
        if (!tempFrom) return false;
        const end = selecting === 'to' ? (hoverDate ?? tempTo) : tempTo;
        if (!end) return dateStr === tempFrom;
        let [a] = compareDates(tempFrom, end) <= 0 ? [tempFrom] : [end];
        return dateStr === a;
    }, [tempFrom, tempTo, hoverDate, selecting]);

    const isRangeEnd = useCallback((dateStr: string): boolean => {
        if (!tempFrom) return false;
        const end = selecting === 'to' ? (hoverDate ?? tempTo) : tempTo;
        if (!end) return false;
        let [, b] = compareDates(tempFrom, end) <= 0 ? [tempFrom, end] : [end, tempFrom];
        return dateStr === b;
    }, [tempFrom, tempTo, hoverDate, selecting]);

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

    const calendarDays = useMemo(() => {
        const days: Array<number | null> = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        return days;
    }, [daysInMonth, firstDay]);

    const handlePrev = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const handleNext = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const displayText = useMemo(() => {
        if (value?.from && value?.to) return `${formatShort(value.from)} — ${formatShort(value.to)}`;
        if (value?.from) return `${formatShort(value.from)} — ...`;
        return placeholder;
    }, [value, placeholder]);

    const isToday = (day: number) => day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={handleOpen}
                className={cn(
                    'flex w-full items-center gap-2 rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-left transition-colors',
                    'hover:border-s-border-strong focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    value?.from ? 'text-s-text' : 'text-s-text-faint',
                )}
            >
                <svg className="w-4 h-4 text-s-text-faint shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                <span className="flex-1 truncate">{displayText}</span>
                {value?.from && (
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
                <div className="absolute right-0 top-full z-50 mt-1 w-[300px] rounded-xl border border-s-border bg-s-surface p-3 shadow-lg">
                    {/* Picking indicator — 50:50 split */}
                    <div className="flex items-stretch gap-0 mb-3 rounded-lg border border-s-border overflow-hidden text-xs">
                        <button
                            type="button"
                            onClick={() => setSelecting('from')}
                            className={cn(
                                'flex-1 px-3 py-2 text-center transition-colors',
                                selecting === 'from' ? 'bg-s-accent/10 text-s-accent font-medium' : 'text-s-text-muted hover:bg-s-hover',
                            )}
                        >
                            {tempFrom ? formatShort(tempFrom) : 'Start date'}
                        </button>
                        <div className="w-px bg-s-border" />
                        <button
                            type="button"
                            onClick={() => setSelecting('to')}
                            className={cn(
                                'flex-1 px-3 py-2 text-center transition-colors',
                                selecting === 'to' ? 'bg-s-accent/10 text-s-accent font-medium' : 'text-s-text-muted hover:bg-s-hover',
                            )}
                        >
                            {tempTo ? formatShort(tempTo) : 'End date'}
                        </button>
                    </div>

                    {/* Month nav */}
                    <div className="flex items-center justify-between mb-3">
                        <button type="button" onClick={handlePrev} className="p-1 rounded-md text-s-text-muted hover:bg-s-hover hover:text-s-text transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <span className="text-sm font-medium text-s-text">{MONTHS_FULL[viewMonth]} {viewYear}</span>
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

                    {/* Days */}
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, i) => {
                            if (day === null) return <div key={i} />;
                            const dateStr = toDateStr(new Date(viewYear, viewMonth, day));
                            const inRange = isInRange(dateStr);
                            const rangeStart = isRangeStart(dateStr);
                            const rangeEnd = isRangeEnd(dateStr);

                            return (
                                <div key={i} className="flex items-center justify-center h-9 relative">
                                    {/* Range highlight bg */}
                                    {inRange && (
                                        <div className={cn(
                                            'absolute inset-y-1 inset-x-0 bg-s-accent/10',
                                            rangeStart && 'rounded-l-lg left-1',
                                            rangeEnd && 'rounded-r-lg right-1',
                                        )} />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleDayClick(dateStr)}
                                        onMouseEnter={() => selecting === 'to' && setHoverDate(dateStr)}
                                        onMouseLeave={() => setHoverDate(null)}
                                        className={cn(
                                            'relative z-10 w-8 h-8 rounded-lg text-sm transition-colors',
                                            (rangeStart || rangeEnd)
                                                ? 'bg-s-accent text-s-accent-fg font-medium'
                                                : isToday(day)
                                                    ? 'font-medium text-s-text'
                                                    : inRange
                                                        ? 'text-s-accent'
                                                        : 'text-s-text-secondary hover:bg-s-hover',
                                        )}
                                    >
                                        {day}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-s-border">
                        {[
                            { label: 'Today', fn: () => { const t = toDateStr(today); return { from: t, to: t }; } },
                            { label: '7d', fn: () => { const t = toDateStr(today); const f = toDateStr(new Date(today.getTime() - 6 * 86400000)); return { from: f, to: t }; } },
                            { label: '30d', fn: () => { const t = toDateStr(today); const f = toDateStr(new Date(today.getTime() - 29 * 86400000)); return { from: f, to: t }; } },
                            { label: 'Month', fn: () => { const f = toDateStr(new Date(today.getFullYear(), today.getMonth(), 1)); return { from: f, to: toDateStr(today) }; } },
                        ].map(preset => (
                            <button
                                key={preset.label}
                                type="button"
                                onClick={() => { onChange(preset.fn()); setOpen(false); }}
                                className="px-2 py-1 text-[11px] font-medium rounded-md text-s-text-muted hover:bg-s-hover hover:text-s-text transition-colors"
                            >
                                {preset.label}
                            </button>
                        ))}
                        <div className="flex-1" />
                        {value?.from && (
                            <button
                                type="button"
                                onClick={() => { onChange(null); setOpen(false); }}
                                className="px-2 py-1 text-[11px] font-medium rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
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
