import { useState, useRef, useEffect } from 'react';
import { router, usePage, usePoll } from '@inertiajs/react';
import { cn } from '../../../shared/utils/cn';
import { usePanel } from '../../hooks/usePanel';
import { toast } from '../Toast';

interface Notification {
    id?: string | null;
    title: string;
    body?: string | null;
    icon?: string | null;
    color?: string;
    url?: string | null;
    time?: string | null;
}

const dotColorMap: Record<string, string> = {
    info: 'bg-s-accent',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
};

function toastTypeFromColor(color?: string) {
    if (color === 'danger') return 'error' as const;
    if (color === 'warning') return 'warning' as const;
    if (color === 'success') return 'success' as const;
    return 'info' as const;
}

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const { panel } = usePanel();
    const { studio } = usePage<{ studio: { notifications: Notification[] } }>().props;
    const notifications = studio?.notifications ?? [];
    const count = notifications.length;
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Track seen notification IDs to detect truly new ones
    const seenIdsRef = useRef<Set<string>>(new Set());
    const initializedRef = useRef(false);

    // Panel config
    const pollingInterval = (panel as Record<string, unknown>)?.notificationPolling as number ?? 0;
    const showToasts = (panel as Record<string, unknown>)?.notificationToasts as boolean ?? true;

    // Poll for new notifications
    usePoll(pollingInterval * 1000, { only: ['studio'] }, {
        autoStart: pollingInterval > 0,
    });

    // Detect new notifications and toast them
    useEffect(() => {
        const currentIds = new Set(
            notifications
                .map((n) => n.id ?? n.title)
                .filter(Boolean),
        );

        if (!initializedRef.current) {
            // First render — seed the seen set, don't toast
            seenIdsRef.current = currentIds;
            initializedRef.current = true;
            return;
        }

        if (!showToasts) {
            seenIdsRef.current = currentIds;
            return;
        }

        // Find notifications we haven't seen before
        const newNotifications = notifications.filter((n) => {
            const key = n.id ?? n.title;
            return key && !seenIdsRef.current.has(key);
        });

        // Toast each new notification
        for (const n of newNotifications) {
            toast(n.title, toastTypeFromColor(n.color));
        }

        seenIdsRef.current = currentIds;
    }, [notifications, showToasts]);

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="relative p-1.5 rounded-lg text-s-text-muted hover:bg-s-hover transition-colors"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                        {count > 99 ? '99+' : count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-1.5 w-80 rounded-xl border border-s-border bg-s-surface shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-s-border">
                        <p className="text-sm font-medium text-s-text">Notifications</p>
                        {count > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    router.post(`${panel?.path ?? ''}/notifications/read-all`, {}, { preserveScroll: true });
                                    setOpen(false);
                                }}
                                className="text-[11px] text-s-accent hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {count === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 px-4">
                                <svg className="w-8 h-8 text-s-text-faint mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                </svg>
                                <p className="text-xs text-s-text-faint">No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notification, i) => (
                                <button
                                    key={notification.id ?? i}
                                    type="button"
                                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-s-hover transition-colors border-b border-s-border last:border-b-0"
                                    onClick={() => {
                                        setOpen(false);
                                        if (notification.id) {
                                            router.post(
                                                `${panel?.path ?? ''}/notifications/${notification.id}/read`,
                                                {},
                                                {
                                                    preserveScroll: true,
                                                    onSuccess: () => {
                                                        if (notification.url) router.visit(notification.url);
                                                    },
                                                },
                                            );
                                        } else if (notification.url) {
                                            router.visit(notification.url);
                                        }
                                    }}
                                >
                                    <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', dotColorMap[notification.color ?? 'info'] ?? dotColorMap.info)} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-s-text truncate">{notification.title}</p>
                                        {notification.body && (
                                            <p className="text-xs text-s-text-muted mt-0.5 line-clamp-2">{notification.body}</p>
                                        )}
                                        {notification.time && (
                                            <p className="text-[11px] text-s-text-faint mt-1">{notification.time}</p>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
