import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { cn } from '../../../shared/utils/cn';
import type { UserSchema } from '../../../shared/types/schema';
import { usePanel } from '../../hooks/usePanel';
import { useStudioHooks } from '../../hooks/useStudioHooks';
import { useStudioContext, type ColorMode } from '../../context/StudioContext';

interface UserMenuProps {
    user: { name: string; email: string; avatar: string | null } | null;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

const themeModes: Array<{ value: ColorMode; label: string; icon: React.ReactNode }> = [
    {
        value: 'light', label: 'Light',
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>,
    },
    {
        value: 'dark', label: 'Dark',
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>,
    },
    {
        value: 'auto', label: 'Auto',
        icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" /></svg>,
    },
];

function ThemeToggle() {
    const { colorMode, setColorMode } = useStudioContext();

    return (
        <div className="border-t border-s-border px-4 py-2">
            <p className="mb-1.5 text-xs font-medium text-s-text-muted">Theme</p>
            <div className="flex rounded-lg border border-s-border bg-s-surface-alt p-0.5">
                {themeModes.map((mode) => (
                    <button
                        key={mode.value}
                        type="button"
                        onClick={() => setColorMode(mode.value)}
                        className={cn(
                            'flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                            colorMode === mode.value
                                ? 'bg-s-surface text-s-text shadow-sm'
                                : 'text-s-text-muted hover:text-s-text-secondary',
                        )}
                        title={mode.label}
                    >
                        {mode.icon}
                        <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export function UserMenu({ user }: UserMenuProps) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { panel } = usePanel();
    const { invoke, has } = useStudioHooks();

    const handleLogout = useCallback(() => {
        router.post(`${panel.path}/logout`);
    }, [panel.path]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    if (!user) {
        return null;
    }

    // Allow hook to completely override user menu rendering
    if (has('layout:user-menu')) {
        const hookContent = invoke('layout:user-menu', user as UserSchema);
        if (hookContent) {
            return <>{hookContent}</>;
        }
    }

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg p-1.5 text-sm transition-colors hover:bg-s-hover"
                aria-expanded={open}
                aria-haspopup="true"
            >
                {user.avatar ? (
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                    />
                ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-s-accent text-xs font-medium text-s-accent-fg">
                        {getInitials(user.name)}
                    </span>
                )}

                <span className="hidden font-medium text-s-text-secondary md:block">
                    {user.name}
                </span>

                <svg
                    className={cn(
                        'hidden h-4 w-4 text-s-text-faint transition-transform md:block',
                        open && 'rotate-180',
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-s-border bg-s-surface py-1 shadow-lg">
                    <div className="border-b border-s-border px-4 py-3">
                        <p className="text-sm font-medium text-s-text">{user.name}</p>
                        <p className="mt-0.5 truncate text-xs text-s-text-muted">{user.email}</p>
                    </div>

                    {/* Profile */}
                    <div className="py-1">
                        <button
                            type="button"
                            onClick={() => { setOpen(false); router.visit(`${panel.path}/profile`); }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-s-text-secondary transition-colors hover:bg-s-hover"
                        >
                            <svg className="h-4 w-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            Profile
                        </button>
                    </div>

                    {/* Theme toggle */}
                    <ThemeToggle />

                    {/* Logout */}
                    <div className="border-t border-s-border py-1">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-s-text-secondary transition-colors hover:bg-s-hover"
                        >
                            <svg className="h-4 w-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                            </svg>
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
