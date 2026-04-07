import { useMemo, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { StudioProvider } from '../context/StudioContext';
import { PanelLayout } from '../components/Layout';
import { InlineTable } from '../components/Table/InlineTable';
import { InlineForm } from '../components/Form/InlineForm';
import { ConfirmationModal } from '../components/Actions/ConfirmationModal';
import { Chart, Sparkline } from '../components/Charts';
import { Icon } from '../components/Icon';
import { cn } from '../../shared/utils/cn';
import type {
    PanelSchema,
    UserSchema,
} from '../../shared/types/schema';

interface DashboardSchema {
    title: string;
    description: string | null;
    schema: Array<Record<string, unknown>>;
}

interface DashboardPageProps {
    studio: {
        panel: PanelSchema;
        user: UserSchema | null;
        notifications: unknown[];
    };
    dashboardPage?: DashboardSchema;
}

const colorMap: Record<string, string> = {
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    danger: 'text-red-500',
    info: 'text-s-accent',
};

const gridColMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-2 lg:grid-cols-6',
};

function StatCard({ data }: { data: Record<string, unknown> }) {
    const icon = data.icon as { name: string } | null | undefined;
    const statColor = colorMap[data.color as string] ?? '';

    return (
        <div className="rounded-xl border border-s-border bg-s-surface p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-s-text-muted">{String(data.label ?? '')}</p>
                {icon && (
                    <div className={cn('w-8 h-8 rounded-lg bg-s-surface-alt flex items-center justify-center', statColor || 'text-s-text-faint')}>
                        <Icon name={icon.name} size="sm" />
                    </div>
                )}
            </div>
            <p className={cn('text-2xl font-semibold mt-2', statColor || 'text-s-text')}>{String(data.value ?? '—')}</p>
            {data.description && (
                <p className="text-xs text-s-text-faint mt-1.5">{String(data.description)}</p>
            )}
            {data.change && (
                <p className={cn('text-xs mt-1.5', String(data.change).startsWith('+') || String(data.change).startsWith('↑') ? 'text-emerald-500' : String(data.change).startsWith('-') ? 'text-red-400' : 'text-s-text-muted')}>
                    {String(data.change) as string}
                </p>
            )}
        </div>
    );
}

function SchemaActionButton({ item }: { item: Record<string, unknown> }) {
    const [confirming, setConfirming] = useState(false);
    const btnColor = item.color as string ?? 'primary';
    const btnClasses = btnColor === 'danger'
        ? 'bg-red-600 text-white hover:bg-red-700'
        : btnColor === 'info'
            ? 'bg-s-accent/10 text-s-accent hover:bg-s-accent/20'
            : 'bg-s-accent text-s-accent-fg hover:opacity-90';

    const handleClick = useCallback(() => {
        if (item.requiresConfirmation) {
            setConfirming(true);
            return;
        }
        if (item.url) router.visit(String(item.url));
    }, [item]);

    const handleConfirm = useCallback(() => {
        setConfirming(false);
        if (item.url) router.visit(String(item.url));
    }, [item]);

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                className={cn('inline-flex items-center justify-center gap-2 rounded-xl border border-s-border px-4 py-4 text-sm font-medium transition-colors w-full', btnClasses)}
            >
                {item.icon && <Icon name={(item.icon as Record<string, string>).name} size="sm" />}
                {String(item.label)}
            </button>
            <ConfirmationModal
                open={confirming}
                onClose={() => setConfirming(false)}
                onConfirm={handleConfirm}
                heading={String(item.label)}
                message={String(item.confirmationMessage ?? 'Are you sure?')}
                confirmLabel="Confirm"
                isDangerous={btnColor === 'danger'}
            />
        </>
    );
}

function SchemaRenderer({ items }: { items: Array<Record<string, unknown>> }) {
    return (
        <>
            {items.map((item, i) => {
                const type = item.type as string;

                // Grid layout
                if (type === 'grid') {
                    const cols = (item.columns ?? 2) as number;
                    const children = (item.schema ?? []) as Array<Record<string, unknown>>;
                    return (
                        <div key={i} className={cn('grid gap-4', gridColMap[cols] ?? 'grid-cols-2')}>
                            <SchemaRenderer items={children} />
                        </div>
                    );
                }

                // Stat group / row
                if (type === 'stats' || type === 'stat-group') {
                    const stats = (item.stats ?? item.schema ?? []) as Array<Record<string, unknown>>;
                    const cols = (item.columns ?? stats.length) as number;
                    return (
                        <div key={i} className={cn('grid gap-4', gridColMap[cols] ?? 'grid-cols-2')}>
                            {stats.map((stat, j) => <StatCard key={j} data={stat} />)}
                        </div>
                    );
                }

                // Single stat
                if (type === 'stat') {
                    return <StatCard key={i} data={item} />;
                }

                // Section card
                if (type === 'section' || type === 'card') {
                    const heading = (item.heading ?? item.label ?? '') as string;
                    return (
                        <div key={i} className="rounded-xl border border-s-border bg-s-surface overflow-hidden">
                            {heading && (
                                <div className="border-b border-s-border px-5 py-3.5">
                                    <h3 className="text-sm font-semibold text-s-text">{heading}</h3>
                                    {item.description && <p className="text-xs text-s-text-muted mt-0.5">{String(item.description)}</p>}
                                </div>
                            )}
                            <div className="p-5">
                                {item.content && <p className="text-sm text-s-text-secondary">{String(item.content)}</p>}
                                {item.schema && (
                                    <div className="space-y-4">
                                        <SchemaRenderer items={item.schema as Array<Record<string, unknown>>} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }

                // Inline table — self-contained, no URL dependency
                if (type === 'table') {
                    return (
                        <InlineTable
                            key={i}
                            schema={{
                                type: 'table',
                                columns: (item.columns ?? []) as import('../../shared/types/schema').ColumnSchema[],
                                filters: (item.filters ?? []) as import('../../shared/types/schema').FilterSchema[],
                                actions: (item.actions ?? []) as import('../../shared/types/schema').ActionSchema[],
                                bulkActions: [],
                                searchable: (item.searchable ?? false) as boolean,
                                paginated: (item.paginated ?? false) as boolean,
                                defaultSort: (item.defaultSort ?? null) as { column: string; direction: 'asc' | 'desc' } | null,
                                filterColumns: 2,
                                poll: 0,
                            }}
                            data={(item.data ?? []) as Record<string, unknown>[]}
                            label={item.label as string | undefined}
                        />
                    );
                }

                // Inline form
                if (type === 'form') {
                    return (
                        <InlineForm
                            key={i}
                            schema={(item.schema ?? []) as import('../../../shared/types/schema').FormComponentSchema[]}
                            label={item.label as string | undefined}
                            actionUrl={item.actionUrl as string | null | undefined}
                            method={item.method as string | undefined}
                        />
                    );
                }

                // Action button
                if (type === 'action') {
                    return <SchemaActionButton key={i} item={item} />;
                }

                // Tabs
                if (type === 'tabs') {
                    return <TabsRenderer key={i} tabs={(item.schema ?? []) as Array<Record<string, unknown>>} />;
                }

                // Filters
                if (type === 'filters') {
                    return (
                        <div key={i} className="flex flex-wrap gap-3 rounded-xl border border-s-border bg-s-surface p-4">
                            <p className="text-xs font-medium text-s-text-faint w-full">Filters</p>
                            {((item.schema ?? []) as Array<Record<string, unknown>>).map((filter, fi) => (
                                <div key={fi} className="text-sm text-s-text-muted">{String(filter.label ?? filter.name ?? '')}</div>
                            ))}
                        </div>
                    );
                }

                // Split layout (asymmetric)
                if (type === 'split') {
                    const left = (item.left ?? 2) as number;
                    const right = (item.right ?? 1) as number;
                    const kids = (item.schema ?? []) as Array<Record<string, unknown>>;
                    return (
                        <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `${left}fr ${right}fr` }}>
                            <SchemaRenderer items={kids} />
                        </div>
                    );
                }

                // Stack (vertical)
                if (type === 'stack') {
                    return (
                        <div key={i} className="space-y-4">
                            <SchemaRenderer items={(item.schema ?? []) as Array<Record<string, unknown>>} />
                        </div>
                    );
                }

                // Divider
                if (type === 'divider') {
                    return <hr key={i} className="border-s-border" />;
                }

                // Spacer
                if (type === 'spacer') {
                    return <div key={i} className="h-6" />;
                }

                // Alert
                if (type === 'alert') {
                    const variant = (item.variant ?? 'info') as string;
                    const alertStyles: Record<string, string> = {
                        info: 'bg-s-accent/5 border-s-accent/20 text-s-accent',
                        success: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600',
                        warning: 'bg-amber-500/5 border-amber-500/20 text-amber-600',
                        danger: 'bg-red-500/5 border-red-500/20 text-red-600',
                    };
                    return (
                        <div key={i} className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', alertStyles[variant] ?? alertStyles.info)}>
                            {item.icon && <Icon name={(item.icon as Record<string, string>).name} size="sm" className="mt-0.5 shrink-0" />}
                            <div>
                                <p className="text-sm font-medium">{String(item.label ?? '')}</p>
                                {item.description && <p className="text-xs mt-0.5 opacity-80">{String(item.description)}</p>}
                            </div>
                        </div>
                    );
                }

                // Badge
                if (type === 'badge') {
                    const variant = (item.variant ?? 'info') as string;
                    const badgeStyles: Record<string, string> = {
                        info: 'bg-s-accent/10 text-s-accent',
                        success: 'bg-emerald-500/10 text-emerald-600',
                        warning: 'bg-amber-500/10 text-amber-600',
                        danger: 'bg-red-500/10 text-red-600',
                    };
                    return (
                        <span key={i} className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', badgeStyles[variant] ?? badgeStyles.info)}>
                            {String(item.label ?? '')}
                        </span>
                    );
                }

                // Progress
                if (type === 'progress') {
                    const val = (item.value ?? 0) as number;
                    const max = (item.max ?? 100) as number;
                    const pct = Math.min(100, Math.max(0, (val / max) * 100));
                    const color = (item.color ?? 'accent') as string;
                    const barColor: Record<string, string> = {
                        accent: 'bg-s-accent',
                        success: 'bg-emerald-500',
                        warning: 'bg-amber-500',
                        danger: 'bg-red-500',
                    };
                    return (
                        <div key={i}>
                            {item.label && (
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm text-s-text-secondary">{String(item.label)}</span>
                                    <span className="text-sm font-medium text-s-text">{Math.round(pct)}%</span>
                                </div>
                            )}
                            <div className="h-2 rounded-full bg-s-border overflow-hidden">
                                <div className={cn('h-full rounded-full transition-all', barColor[color] ?? barColor.accent)} style={{ width: `${pct}%` }} />
                            </div>
                        </div>
                    );
                }

                // Metric (large number)
                if (type === 'metric') {
                    return (
                        <div key={i} className="text-center py-4">
                            <p className="text-3xl font-bold text-s-text">{String(item.value ?? '—')}</p>
                            <p className="text-sm text-s-text-muted mt-1">{String(item.label ?? '')}</p>
                            {item.description && <p className="text-xs text-s-text-faint mt-0.5">{String(item.description)}</p>}
                        </div>
                    );
                }

                // Empty state
                if (type === 'empty') {
                    return (
                        <div key={i} className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-s-border">
                            <svg className="w-10 h-10 text-s-text-faint mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                            <p className="text-sm text-s-text-muted">{String(item.message ?? 'No data available.')}</p>
                        </div>
                    );
                }

                // Image
                if (type === 'image') {
                    return (
                        <img
                            key={i}
                            src={String(item.src ?? '')}
                            alt={String(item.alt ?? '')}
                            className={cn('max-w-full', item.rounded ? 'rounded-xl' : '', item.width ? '' : 'w-full')}
                            style={{
                                width: item.width ? String(item.width) : undefined,
                                height: item.height ? String(item.height) : undefined,
                            }}
                        />
                    );
                }

                // Key-value list
                if (type === 'list') {
                    const items_list = (item.items ?? {}) as Record<string, unknown>;
                    return (
                        <div key={i} className="rounded-xl border border-s-border bg-s-surface overflow-hidden divide-y divide-s-border">
                            {Object.entries(items_list).map(([k, v]) => (
                                <div key={k} className="flex items-center justify-between px-5 py-3">
                                    <span className="text-sm text-s-text-muted">{k}</span>
                                    <span className="text-sm font-medium text-s-text">{String(v ?? '—')}</span>
                                </div>
                            ))}
                        </div>
                    );
                }

                // Timeline
                if (type === 'timeline') {
                    const entries = (item.entries ?? []) as Array<Record<string, unknown>>;
                    return (
                        <div key={i} className="space-y-0">
                            {entries.map((entry, ei) => {
                                const color = (entry.color ?? 'accent') as string;
                                const dotColor: Record<string, string> = {
                                    accent: 'bg-s-accent', success: 'bg-emerald-500', warning: 'bg-amber-500', danger: 'bg-red-500',
                                };
                                return (
                                    <div key={ei} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={cn('w-2.5 h-2.5 rounded-full mt-1.5 shrink-0', dotColor[color] ?? dotColor.accent)} />
                                            {ei < entries.length - 1 && <div className="w-px flex-1 bg-s-border" />}
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-sm font-medium text-s-text">{String(entry.title ?? '')}</p>
                                            {entry.description && <p className="text-xs text-s-text-muted mt-0.5">{String(entry.description)}</p>}
                                            {entry.time && <p className="text-xs text-s-text-faint mt-0.5">{String(entry.time)}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                }

                // Actions (button group)
                if (type === 'actions') {
                    return (
                        <div key={i} className="flex flex-wrap items-center gap-2">
                            <SchemaRenderer items={(item.schema ?? []) as Array<Record<string, unknown>>} />
                        </div>
                    );
                }

                // Markdown
                if (type === 'markdown') {
                    // Simple markdown: just render as preformatted text for now
                    return (
                        <div key={i} className="prose prose-sm max-w-none text-s-text-secondary">
                            <pre className="whitespace-pre-wrap font-sans text-sm">{String(item.content ?? '')}</pre>
                        </div>
                    );
                }

                // Raw HTML
                if (type === 'html') {
                    return (
                        <div key={i} className="text-sm text-s-text-secondary" dangerouslySetInnerHTML={{ __html: String(item.content ?? '') }} />
                    );
                }

                // Chart (line, area, bar, donut)
                if (type === 'chart') {
                    return (
                        <Chart
                            key={i}
                            type={(item.chartType ?? 'line') as 'line' | 'area' | 'bar' | 'donut'}
                            data={(item.data ?? []) as { label: string; value: number; color?: string }[]}
                            label={item.label as string | undefined}
                            description={item.description as string | undefined}
                            color={item.color as string | undefined}
                            colors={item.colors as string[] | undefined}
                            height={item.height as string | undefined}
                            series={item.series as { name: string; data: number[]; color?: string }[] | undefined}
                            labels={item.labels as string[] | undefined}
                            stacked={item.stacked as boolean | undefined}
                        />
                    );
                }

                // Sparkline
                if (type === 'sparkline') {
                    return (
                        <Sparkline
                            key={i}
                            data={(item.data ?? []) as { label: string; value: number }[]}
                            color={item.color as string | undefined}
                            height={item.height as string | undefined}
                        />
                    );
                }

                // Activity log
                if (type === 'activity') {
                    const entries = (item.entries ?? []) as Array<Record<string, unknown>>;
                    const dotColor: Record<string, string> = { success: 'bg-emerald-500', warning: 'bg-amber-500', danger: 'bg-red-500', info: 'bg-s-accent' };
                    return (
                        <div key={i} className="rounded-xl border border-s-border bg-s-surface overflow-hidden">
                            {item.label && (
                                <div className="border-b border-s-border px-5 py-3.5">
                                    <h3 className="text-sm font-semibold text-s-text">{String(item.label)}</h3>
                                </div>
                            )}
                            <div className="px-5 py-4 space-y-0">
                                {entries.map((entry, ei) => (
                                    <div key={ei} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={cn('w-2 h-2 rounded-full mt-2 shrink-0', dotColor[entry.color as string] ?? dotColor.info)} />
                                            {ei < entries.length - 1 && <div className="w-px flex-1 bg-s-border" />}
                                        </div>
                                        <div className="pb-4 min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-s-text">{String(entry.title ?? '')}</p>
                                                {entry.user && <span className="text-xs text-s-accent font-medium">{String(entry.user)}</span>}
                                            </div>
                                            {entry.description && <p className="text-xs text-s-text-muted mt-0.5">{String(entry.description)}</p>}
                                            {entry.time && <p className="text-[11px] text-s-text-faint mt-1">{String(entry.time)}</p>}
                                        </div>
                                    </div>
                                ))}
                                {entries.length === 0 && (
                                    <p className="text-sm text-s-text-faint text-center py-6">No activity yet</p>
                                )}
                            </div>
                        </div>
                    );
                }

                // Unknown
                return (
                    <div key={i} className="rounded-xl border border-dashed border-s-border bg-s-surface-alt p-5">
                        <p className="text-xs text-s-text-faint">Widget: {type ?? 'unknown'}</p>
                    </div>
                );
            })}
        </>
    );
}

function TabsRenderer({ tabs }: { tabs: Array<Record<string, unknown>> }) {
    const [active, setActive] = useState(0);
    return (
        <div className="rounded-xl border border-s-border bg-s-surface overflow-hidden">
            <div className="flex border-b border-s-border">
                {tabs.map((tab, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setActive(i)}
                        className={cn(
                            'px-4 py-2.5 text-sm font-medium transition-colors',
                            active === i ? 'text-s-accent border-b-2 border-s-accent' : 'text-s-text-muted hover:text-s-text',
                        )}
                    >
                        {String(tab.label ?? `Tab ${i + 1}`)}
                    </button>
                ))}
            </div>
            <div className="p-5">
                {tabs[active]?.schema && (
                    <div className="space-y-4">
                        <SchemaRenderer items={(tabs[active].schema as Array<Record<string, unknown>>) ?? []} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DashboardPage({ studio, dashboardPage }: DashboardPageProps) {
    const panel = useMemo<PanelSchema>(
        () => ({ ...studio.panel, user: studio.user ?? studio.panel.user }),
        [studio.panel, studio.user],
    );

    const user = studio.user ?? studio.panel.user;
    const hasCustomDashboard = dashboardPage && dashboardPage.schema.length > 0;

    return (
        <StudioProvider panel={panel}>
            <PanelLayout>
                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-xl font-semibold text-s-text">
                            {hasCustomDashboard ? dashboardPage.title : 'Dashboard'}
                        </h1>
                        {(hasCustomDashboard ? dashboardPage.description : panel.brandName) && (
                            <p className="text-sm text-s-text-muted mt-0.5">
                                {hasCustomDashboard ? dashboardPage.description : panel.brandName}
                            </p>
                        )}
                    </div>
                </div>

                {hasCustomDashboard ? (
                    /* Custom dashboard from PHP */
                    <div className="space-y-6">
                        <SchemaRenderer items={dashboardPage.schema} />
                    </div>
                ) : (
                    /* Default welcome dashboard */
                    <>
                        <div className="rounded-xl border border-s-border bg-s-surface p-8">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-s-accent/10">
                                    <svg className="h-6 w-6 text-s-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-s-text">
                                        {user ? `Welcome back, ${user.name}` : 'Welcome to your dashboard'}
                                    </h2>
                                    <p className="mt-1 text-sm text-s-text-muted">
                                        Get started by navigating to a module from the sidebar, or define a custom dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-s-border bg-s-surface-alt/50">
                                    <p className="text-sm text-s-text-faint">Widget placeholder</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </PanelLayout>
        </StudioProvider>
    );
}
