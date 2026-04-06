import { useState } from 'react';
import { router } from '@inertiajs/react';
import { cn } from '../../../shared/utils/cn';
import { usePanel } from '../../hooks/usePanel';
import { useStudioContext, type ColorMode } from '../../context/StudioContext';
import { GlobalSearch } from './GlobalSearch';
import { NotificationBell } from './NotificationBell';

interface TopbarProps {
    onToggleMobile: () => void;
}

function buildBreadcrumbs(panelPath: string): Array<{ label: string; url?: string }> {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    if (!pathname || pathname === panelPath || pathname === panelPath + '/') {
        return [{ label: 'Dashboard' }];
    }
    const relative = pathname.startsWith(panelPath) ? pathname.slice(panelPath.length) : pathname;
    const segments = relative.split('/').filter(Boolean);
    const items: Array<{ label: string; url?: string }> = [{ label: 'Dashboard', url: panelPath }];
    let currentPath = panelPath;
    for (let i = 0; i < segments.length; i++) {
        currentPath += '/' + segments[i];
        const label = segments[i].replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        items.push(i === segments.length - 1 ? { label } : { label, url: currentPath });
    }
    return items;
}

function ThemeToggle() {
    const { colorMode, setColorMode } = useStudioContext();
    const modes: Array<{ value: ColorMode; icon: React.ReactNode }> = [
        {
            value: 'light',
            icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>,
        },
        {
            value: 'dark',
            icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>,
        },
    ];

    return (
        <div className="hidden sm:flex items-center rounded-lg border border-s-border bg-s-surface-alt p-0.5">
            {modes.map(m => (
                <button
                    key={m.value}
                    type="button"
                    onClick={() => setColorMode(m.value)}
                    className={cn(
                        'p-1 rounded-md transition-colors',
                        colorMode === m.value ? 'bg-s-surface text-s-text shadow-sm' : 'text-s-text-muted hover:text-s-text',
                    )}
                >
                    {m.icon}
                </button>
            ))}
        </div>
    );
}

function UserMenuTrigger() {
    const { panel, user } = usePanel();
    const [open, setOpen] = useState(false);
    const initials = (user?.name ?? 'U').split(' ').map(p => p.charAt(0)).slice(0, 2).join('').toUpperCase();

    return (
        <div className="relative">
            <button type="button" onClick={() => setOpen(prev => !prev)} className="flex items-center gap-2 p-1 rounded-lg hover:bg-s-hover transition-colors">
                {user?.avatar ? (
                    <img src={user.avatar} className="w-7 h-7 rounded-full" alt="" />
                ) : (
                    <div className="w-7 h-7 rounded-full bg-s-accent text-s-accent-fg flex items-center justify-center text-[10px] font-semibold">{initials}</div>
                )}
                <span className="hidden md:block text-sm font-medium text-s-text-secondary">{user?.name ?? 'User'}</span>
                <svg className={cn('hidden md:block w-3.5 h-3.5 text-s-text-faint transition-transform', open && 'rotate-180')} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-s-border bg-s-surface shadow-lg py-1">
                        <div className="border-b border-s-border px-4 py-3">
                            <p className="text-sm font-medium text-s-text">{user?.name}</p>
                            <p className="text-xs text-s-text-muted truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                            <a href={(panel?.path ?? '') + '/profile'} onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-s-text-secondary hover:bg-s-hover transition-colors">
                                <svg className="w-4 h-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                                Profile
                            </a>
                        </div>
                        <div className="border-t border-s-border py-1">
                            <button type="button" onClick={() => { setOpen(false); router.post((panel?.path ?? '') + '/logout'); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-s-text-secondary hover:bg-s-hover transition-colors">
                                <svg className="w-4 h-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
                                Log out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export function Topbar({ onToggleMobile }: TopbarProps) {
    const { panel } = usePanel();
    const breadcrumbs = buildBreadcrumbs(panel?.path ?? '/admin');

    return (
        <header className="flex items-center h-16 px-4 lg:px-6 border-b border-s-border bg-s-surface shrink-0">
            {/* Mobile hamburger */}
            <button type="button" onClick={onToggleMobile} className="lg:hidden p-1.5 rounded-lg text-s-text-muted hover:bg-s-hover mr-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-1.5 text-[13px] text-s-text-muted shrink-0">
                {breadcrumbs.map((item, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                        {i > 0 && (
                            <svg className="w-3 h-3 text-s-text-faint" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        )}
                        {i === breadcrumbs.length - 1 ? (
                            <span className="text-s-text font-medium">{item.label}</span>
                        ) : (
                            <a href={item.url} className="hover:text-s-text transition-colors">{item.label}</a>
                        )}
                    </span>
                ))}
            </div>

            {/* Search — right aligned */}
            <div className="flex-1 flex justify-end px-4">
                <div className="w-full max-w-md">
                    <GlobalSearch />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1 shrink-0">
                <ThemeToggle />
                <NotificationBell />
                <div className="pl-1.5 ml-1 border-l border-s-border">
                    <UserMenuTrigger />
                </div>
            </div>
        </header>
    );
}
