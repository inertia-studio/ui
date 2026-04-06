import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../../shared/utils/cn';
import { router, usePage } from '@inertiajs/react';

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    body?: string;
    duration?: number;
}

const toastStyles: Record<string, { iconBg: string; iconColor: string; progress: string; icon: React.ReactNode }> = {
    success: {
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-500',
        progress: 'bg-emerald-500/40',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>,
    },
    error: {
        iconBg: 'bg-red-500/10',
        iconColor: 'text-red-500',
        progress: 'bg-red-500/40',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>,
    },
    warning: {
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-500',
        progress: 'bg-amber-500/40',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" /></svg>,
    },
    info: {
        iconBg: 'bg-s-accent/10',
        iconColor: 'text-s-accent',
        progress: 'bg-s-accent/40',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>,
    },
};

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
    const [exiting, setExiting] = useState(false);
    const duration = toast.duration ?? 4000;
    const style = toastStyles[toast.type] ?? toastStyles.info;

    useEffect(() => {
        const timer = setTimeout(() => {
            setExiting(true);
            setTimeout(() => onDismiss(toast.id), 200);
        }, duration);
        return () => clearTimeout(timer);
    }, [toast.id, duration, onDismiss]);

    return (
        <div
            className={cn(
                'relative w-80 rounded-xl border border-s-border bg-s-surface shadow-lg overflow-hidden transition-all duration-200',
                exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0',
            )}
        >
            <div className="flex items-start gap-3 px-4 pt-3.5 pb-3">
                <div className={cn('shrink-0 w-7 h-7 rounded-full flex items-center justify-center', style.iconBg, style.iconColor)}>
                    {style.icon}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-s-text">{toast.title}</p>
                    {toast.body && <p className="mt-0.5 text-xs text-s-text-muted">{toast.body}</p>}
                </div>
                <button
                    type="button"
                    onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 200); }}
                    className="shrink-0 mt-0.5 p-0.5 rounded text-s-text-faint hover:text-s-text transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            {/* Progress bar */}
            <div className="h-0.5 w-full">
                <div
                    className={cn('h-full rounded-full', style.progress)}
                    style={{ animation: `toast-shrink ${duration}ms linear forwards` }}
                />
            </div>
            <style>{`@keyframes toast-shrink { from { width: 100%; } to { width: 0%; } }`}</style>
        </div>
    );
}

let toastListeners: Array<(toast: ToastMessage) => void> = [];

/** Imperative toast API — call from anywhere */
export function toast(msg: Omit<ToastMessage, 'id'>) {
    const t: ToastMessage = { ...msg, id: Math.random().toString(36).slice(2) };
    toastListeners.forEach(fn => fn(t));
}

export function ToastContainer() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // Listen for imperative toasts
    useEffect(() => {
        const handler = (t: ToastMessage) => setToasts(prev => [...prev, t]);
        toastListeners.push(handler);
        return () => { toastListeners = toastListeners.filter(fn => fn !== handler); };
    }, []);

    // Listen for flash messages from Inertia page visits
    const shownFlashesRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const remove = router.on('success', (event) => {
            const pg = (event as unknown as { detail?: { page?: { props?: Record<string, unknown> } } }).detail?.page;
            if (!pg?.props) return;

            const flash = pg.props.flash as { success?: string | null; error?: string | null } | undefined;
            const url = (pg.props as Record<string, unknown>).url as string ?? '';

            if (flash?.success) {
                // Key by message + URL so the same action on the same page won't re-toast
                const key = `s:${flash.success}`;
                if (!shownFlashesRef.current.has(key)) {
                    shownFlashesRef.current.add(key);
                    toast({ type: 'success', title: flash.success });
                }
            }

            if (flash?.error) {
                const key = `e:${flash.error}`;
                if (!shownFlashesRef.current.has(key)) {
                    shownFlashesRef.current.add(key);
                    toast({ type: 'error', title: flash.error });
                }
            }

            // When flash is empty, clear the shown set so future flashes can fire
            if (!flash?.success && !flash?.error) {
                shownFlashesRef.current.clear();
            }
        });
        return () => remove();
    }, []);

    const handleDismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-100 flex flex-col-reverse gap-2">
            {toasts.map(t => (
                <ToastItem key={t.id} toast={t} onDismiss={handleDismiss} />
            ))}
        </div>
    );
}
