import { useState, useRef, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { cn } from '../../../shared/utils/cn';
import { usePanel } from '../../hooks/usePanel';
import { useStudioHooks } from '../../hooks/useStudioHooks';
import { useStudioContext } from '../../context/StudioContext';
import { SchemaIcon } from '../Icon';
import type { NavigationGroupSchema, NavigationItemSchema } from '../../../shared/types/schema';

const badgeColorClasses: Record<string, string> = {
    info: 'bg-s-accent/10 text-s-accent',
    success: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    danger: 'bg-red-500/10 text-red-600',
};

interface SidebarProps {
    collapsed: boolean;
    onToggleCollapse: () => void;
    mobileOpen: boolean;
    onCloseMobile: () => void;
}

function SidebarContent({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
    const { panel, layout, navigation, user } = usePanel();
    const { resolvedColorMode } = useStudioContext();
    const { invoke } = useStudioHooks();
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const isDashboardActive = pathname === panel?.path || pathname === panel?.path + '/';
    const navGroups = navigation ?? [];

    return (
        <div className="flex h-full flex-col bg-s-surface border-r border-s-border">
            {/* Brand */}
            <div className="flex items-center justify-between h-16 px-5 border-b border-s-border shrink-0">
                <Link href={panel?.path ?? '/'} className="flex items-center gap-3 overflow-hidden">
                    {panel?.brandLogo ? (
                        <img
                            src={
                                collapsed && panel.brandLogoCollapsed
                                    ? panel.brandLogoCollapsed
                                    : resolvedColorMode === 'dark' && (panel as Record<string, unknown>).brandLogoDark
                                        ? String((panel as Record<string, unknown>).brandLogoDark)
                                        : panel.brandLogo
                            }
                            alt={panel.brandName}
                            className={cn('h-8 shrink-0 object-contain', collapsed ? 'w-8' : 'max-w-[140px]')}
                        />
                    ) : (
                        <>
                            {(panel as Record<string, unknown>)?.brandIcon ? (
                                <img
                                    src={String((panel as Record<string, unknown>).brandIcon)}
                                    alt=""
                                    className="w-8 h-8 shrink-0 object-contain"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-s-accent flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-s-accent-fg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                                    </svg>
                                </div>
                            )}
                            {!collapsed && (
                                <div>
                                    <span className="text-sm font-semibold text-s-text">{panel?.brandName ?? 'Studio'}</span>
                                </div>
                            )}
                        </>
                    )}
                </Link>

                {layout?.sidebar?.collapsible && !collapsed && (
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="hidden lg:inline-flex p-1 rounded-md text-s-text-faint hover:text-s-text hover:bg-s-hover transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                        </svg>
                    </button>
                )}
                {layout?.sidebar?.collapsible && collapsed && (
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="hidden lg:inline-flex p-1 rounded-md text-s-text-faint hover:text-s-text hover:bg-s-hover transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                        </svg>
                    </button>
                )}
            </div>

            {invoke('layout:sidebar-header') as React.ReactNode}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-3">
                {/* Dashboard */}
                <div className="space-y-0.5">
                    <Link
                        href={panel?.path ?? '/'}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                            isDashboardActive
                                ? 'font-medium text-s-text bg-s-surface-alt'
                                : 'text-s-text-secondary hover:bg-s-hover hover:text-s-text',
                            collapsed && 'justify-center px-0',
                        )}
                    >
                        <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        {!collapsed && <span>Dashboard</span>}
                    </Link>
                </div>

                {/* Module nav groups */}
                {navGroups.map((group, i) => (
                    <NavGroup key={i} group={group} collapsed={collapsed} pathname={pathname} />
                ))}
            </nav>

            <div className="shrink-0">{invoke('layout:sidebar-footer') as React.ReactNode}</div>

            {/* User section */}
            {user && <SidebarUser user={user} collapsed={collapsed} panelPath={panel?.path ?? ''} />}
        </div>
    );
}

function SidebarUser({ user, collapsed, panelPath }: { user: { name: string; email: string; avatar: string | null }; collapsed: boolean; panelPath: string }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { colorMode, setColorMode } = useStudioContext();
    const { invoke } = useStudioHooks();

    useEffect(() => {
        if (!open) return;
        function handler(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const initials = (user.name ?? 'U').split(' ').map(p => p.charAt(0)).slice(0, 2).join('').toUpperCase();

    return (
        <div ref={menuRef} className="relative border-t border-s-border p-3 shrink-0">
            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className={cn('flex w-full items-center rounded-lg hover:bg-s-hover transition-colors', collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2')}
            >
                {user.avatar ? (
                    <img src={user.avatar} className="w-8 h-8 rounded-full shrink-0" alt="" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-s-accent flex items-center justify-center text-xs font-medium text-s-accent-fg shrink-0">
                        {initials}
                    </div>
                )}
                {!collapsed && (
                    <>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-s-text truncate">{user.name}</p>
                            <p className="text-[11px] text-s-text-muted truncate">{user.email}</p>
                        </div>
                        <svg className={cn('w-4 h-4 text-s-text-faint shrink-0 transition-transform', open && 'rotate-180')} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                        </svg>
                    </>
                )}
            </button>

            {open && (
                <div className={cn(
                    'absolute z-50 rounded-xl border border-s-border bg-s-surface shadow-lg py-1',
                    collapsed ? 'left-full bottom-0 ml-2 w-56' : 'left-3 right-3 bottom-full mb-1',
                )}>
                    {/* User info (collapsed mode) */}
                    {collapsed && (
                        <div className="border-b border-s-border px-4 py-3">
                            <p className="text-sm font-medium text-s-text">{user.name}</p>
                            <p className="text-xs text-s-text-muted truncate">{user.email}</p>
                        </div>
                    )}

                    {/* Menu items */}
                    <div className="py-1">
                        <a
                            href={panelPath + '/profile'}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-s-text-secondary hover:bg-s-hover transition-colors"
                        >
                            <svg className="w-4 h-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            Profile
                        </a>
                    </div>

                    {/* Custom menu items via hook */}
                    {invoke('layout:user-menu-items') as React.ReactNode}

                    {/* Theme */}
                    <div className="border-t border-s-border px-4 py-2.5">
                        <p className="text-[11px] font-medium text-s-text-faint uppercase tracking-wider mb-2">Theme</p>
                        <div className="flex items-center rounded-lg border border-s-border bg-s-surface-alt p-0.5">
                            {(['light', 'dark'] as const).map(mode => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setColorMode(mode)}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-xs font-medium transition-colors',
                                        colorMode === mode ? 'bg-s-surface text-s-text shadow-sm' : 'text-s-text-muted hover:text-s-text',
                                    )}
                                >
                                    {mode === 'light' ? (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>
                                    )}
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-s-border py-1">
                        <button
                            type="button"
                            onClick={() => { setOpen(false); router.post(panelPath + '/logout'); }}
                            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-s-text-secondary hover:bg-s-hover transition-colors"
                        >
                            <svg className="w-4 h-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
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

function NavGroup({ group, collapsed, pathname }: { group: NavigationGroupSchema; collapsed: boolean; pathname: string }) {
    const hasLabel = (group.label ?? '').length > 0;
    const [groupCollapsed, setGroupCollapsed] = useState(group.collapsed);

    return (
        <div className={hasLabel ? 'mt-5' : 'mt-1'}>
            {hasLabel && !collapsed && (
                <div className="flex items-center justify-between mb-1 px-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-s-text-faint">
                        {group.label}
                    </span>
                    {group.collapsible && (
                        <button
                            type="button"
                            onClick={() => setGroupCollapsed(prev => !prev)}
                            className="p-0.5 text-s-text-faint hover:text-s-text transition-colors"
                        >
                            <svg className={cn('w-3 h-3 transition-transform', groupCollapsed && '-rotate-90')} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                    )}
                </div>
            )}

            {!groupCollapsed && (
                <div className="space-y-0.5">
                    {(group.items ?? []).map((item, j) => (
                        <NavItem key={j} item={item} collapsed={collapsed} pathname={pathname} />
                    ))}
                </div>
            )}
        </div>
    );
}

function NavItem({ item, collapsed, pathname }: { item: NavigationItemSchema; collapsed: boolean; pathname: string }) {
    const isActive = item.isActive || pathname === item.url || pathname.startsWith(item.url + '/');

    return (
        <Link
            href={item.url}
            className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                    ? 'font-medium text-s-text bg-s-surface-alt'
                    : 'text-s-text-secondary hover:bg-s-hover hover:text-s-text',
                collapsed && 'justify-center px-0',
            )}
        >
            <SchemaIcon schema={item.icon} size="md" className="shrink-0 w-[18px] h-[18px]" />
            {!collapsed && (
                <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge != null && (
                        <span className={cn(
                            'text-[11px] px-1.5 py-0.5 rounded-full font-medium',
                            badgeColorClasses[(item as unknown as { badgeColor?: string }).badgeColor ?? 'info'],
                        )}>
                            {item.badge}
                        </span>
                    )}
                </>
            )}
        </Link>
    );
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SidebarProps) {
    return (
        <>
            {/* Desktop */}
            <aside
                className="hidden lg:block h-screen shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out"
                style={{ width: collapsed ? '64px' : '260px' }}
            >
                <SidebarContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={onCloseMobile} />
                    <aside className="fixed inset-y-0 left-0 z-50 w-[260px]">
                        <SidebarContent collapsed={false} onToggleCollapse={onToggleCollapse} />
                        <button
                            type="button"
                            onClick={onCloseMobile}
                            className="absolute right-3 top-5 p-1 rounded-lg text-s-text-faint hover:text-s-text transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </aside>
                </div>
            )}
        </>
    );
}
