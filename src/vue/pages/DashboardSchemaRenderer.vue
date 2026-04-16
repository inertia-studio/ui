<script setup lang="ts">
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { cn } from '../../shared/utils/cn';
import Icon from '../components/Icon/Icon.vue';
import InlineTable from '../components/Table/InlineTable.vue';
import InlineForm from '../components/Form/InlineForm.vue';
import ConfirmationModal from '../components/Actions/ConfirmationModal.vue';
import Chart from '../components/Charts/Chart.vue';
import Sparkline from '../components/Charts/Sparkline.vue';

defineOptions({ name: 'DashboardSchemaRenderer' });
defineProps<{ items: Array<Record<string, unknown>> }>();

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

const alertStyles: Record<string, string> = {
    info: 'bg-s-accent/5 border-s-accent/20 text-s-accent',
    success: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600',
    warning: 'bg-amber-500/5 border-amber-500/20 text-amber-600',
    danger: 'bg-red-500/5 border-red-500/20 text-red-600',
};
const badgeStyles: Record<string, string> = {
    info: 'bg-s-accent/10 text-s-accent',
    success: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    danger: 'bg-red-500/10 text-red-600',
};
const barColor: Record<string, string> = {
    accent: 'bg-s-accent', success: 'bg-emerald-500', warning: 'bg-amber-500', danger: 'bg-red-500',
};
const dotColor: Record<string, string> = {
    accent: 'bg-s-accent', success: 'bg-emerald-500', warning: 'bg-amber-500', danger: 'bg-red-500',
    info: 'bg-s-accent',
};

const confirmingItems = ref<Set<number>>(new Set());
const tabsActive = ref<Record<number, number>>({});

function itemType(item: Record<string, unknown>): string {
    return (item.type as string) ?? 'unknown';
}

function statColor(item: Record<string, unknown>) {
    return colorMap[item.color as string] ?? '';
}

function changeColor(change: unknown) {
    const s = String(change);
    if (s.startsWith('+') || s.startsWith('↑')) return 'text-emerald-500';
    if (s.startsWith('-')) return 'text-red-400';
    return 'text-s-text-muted';
}

function handleActionClick(item: Record<string, unknown>, idx: number) {
    if (item.requiresConfirmation) {
        confirmingItems.value = new Set([...confirmingItems.value, idx]);
        return;
    }
    if (item.url) router.visit(String(item.url));
}
function handleActionConfirm(item: Record<string, unknown>, idx: number) {
    const next = new Set(confirmingItems.value);
    next.delete(idx);
    confirmingItems.value = next;
    if (item.url) router.visit(String(item.url));
}
function handleActionCancel(idx: number) {
    const next = new Set(confirmingItems.value);
    next.delete(idx);
    confirmingItems.value = next;
}
function isConfirming(idx: number) {
    return confirmingItems.value.has(idx);
}
function setActiveTab(idx: number, ti: number) {
    tabsActive.value = { ...tabsActive.value, [idx]: ti };
}
function activeTab(idx: number) {
    return tabsActive.value[idx] ?? 0;
}

function actionBtnClasses(item: Record<string, unknown>): string {
    const btnColor = (item.color as string) ?? 'primary';
    if (btnColor === 'danger') return 'bg-red-600 text-white hover:bg-red-700';
    if (btnColor === 'info') return 'bg-s-accent/10 text-s-accent hover:bg-s-accent/20';
    return 'bg-s-accent text-s-accent-fg hover:opacity-90';
}

function isDangerAction(item: Record<string, unknown>): boolean {
    return (item.color as string) === 'danger';
}

function progressPct(item: Record<string, unknown>): number {
    const val = (item.value ?? 0) as number;
    const max = (item.max ?? 100) as number;
    return Math.min(100, Math.max(0, (val / max) * 100));
}
</script>

<template>
    <template v-for="(item, i) in items" :key="i">
        <div v-if="itemType(item) === 'grid'" :class="cn('grid gap-4', gridColMap[(item.columns ?? 2) as number] ?? 'grid-cols-2')">
            <DashboardSchemaRenderer :items="(item.schema ?? []) as Array<Record<string, unknown>>" />
        </div>

        <div
            v-else-if="itemType(item) === 'stats' || itemType(item) === 'stat-group'"
            :class="cn('grid gap-4', gridColMap[(item.columns ?? (item.stats ?? item.schema ?? []).length) as number] ?? 'grid-cols-2')"
        >
            <div
                v-for="(stat, j) in ((item.stats ?? item.schema ?? []) as Array<Record<string, unknown>>)"
                :key="j"
                class="rounded-xl border border-s-border bg-s-surface p-5"
            >
                <div class="flex items-center justify-between">
                    <p class="text-sm text-s-text-muted">{{ String(stat.label ?? '') }}</p>
                    <div
                        v-if="stat.icon"
                        :class="cn('w-8 h-8 rounded-lg bg-s-surface-alt flex items-center justify-center', statColor(stat) || 'text-s-text-faint')"
                    >
                        <Icon :name="(stat.icon as { name: string }).name" size="sm" />
                    </div>
                </div>
                <p :class="cn('text-2xl font-semibold mt-2', statColor(stat) || 'text-s-text')">{{ String(stat.value ?? '—') }}</p>
                <p v-if="stat.description" class="text-xs text-s-text-faint mt-1.5">{{ String(stat.description) }}</p>
                <p v-if="stat.change" :class="cn('text-xs mt-1.5', changeColor(stat.change))">{{ String(stat.change) }}</p>
            </div>
        </div>

        <div v-else-if="itemType(item) === 'stat'" class="rounded-xl border border-s-border bg-s-surface p-5">
            <div class="flex items-center justify-between">
                <p class="text-sm text-s-text-muted">{{ String(item.label ?? '') }}</p>
                <div
                    v-if="item.icon"
                    :class="cn('w-8 h-8 rounded-lg bg-s-surface-alt flex items-center justify-center', statColor(item) || 'text-s-text-faint')"
                >
                    <Icon :name="(item.icon as { name: string }).name" size="sm" />
                </div>
            </div>
            <p :class="cn('text-2xl font-semibold mt-2', statColor(item) || 'text-s-text')">{{ String(item.value ?? '—') }}</p>
            <p v-if="item.description" class="text-xs text-s-text-faint mt-1.5">{{ String(item.description) }}</p>
            <p v-if="item.change" :class="cn('text-xs mt-1.5', changeColor(item.change))">{{ String(item.change) }}</p>
        </div>

        <div
            v-else-if="itemType(item) === 'section' || itemType(item) === 'card'"
            class="rounded-xl border border-s-border bg-s-surface overflow-hidden"
        >
            <div v-if="item.heading ?? item.label" class="border-b border-s-border px-5 py-3.5">
                <h3 class="text-sm font-semibold text-s-text">{{ String(item.heading ?? item.label ?? '') }}</h3>
                <p v-if="item.description" class="text-xs text-s-text-muted mt-0.5">{{ String(item.description) }}</p>
            </div>
            <div class="p-5">
                <p v-if="item.content" class="text-sm text-s-text-secondary">{{ String(item.content) }}</p>
                <div v-if="item.schema" class="space-y-4">
                    <DashboardSchemaRenderer :items="item.schema as Array<Record<string, unknown>>" />
                </div>
            </div>
        </div>

        <InlineTable
            v-else-if="itemType(item) === 'table'"
            :schema="{
                type: 'table',
                columns: (item.columns ?? []) as any,
                filters: (item.filters ?? []) as any,
                actions: (item.actions ?? []) as any,
                bulkActions: [],
                searchable: (item.searchable ?? false) as boolean,
                paginated: (item.paginated ?? false) as boolean,
                defaultSort: (item.defaultSort ?? null) as any,
                filterColumns: 2,
                poll: 0,
            }"
            :data="(item.data ?? []) as Record<string, unknown>[]"
            :label="item.label as string | undefined"
        />

        <InlineForm
            v-else-if="itemType(item) === 'form'"
            :schema="(item.schema ?? []) as any"
            :label="item.label as string | undefined"
            :action-url="item.actionUrl as string | null | undefined"
            :method="(item.method as string | undefined) ?? 'POST'"
        />

        <template v-else-if="itemType(item) === 'action'">
            <button
                type="button"
                :class="cn('inline-flex items-center justify-center gap-2 rounded-xl border border-s-border px-4 py-4 text-sm font-medium transition-colors w-full', actionBtnClasses(item))"
                @click="handleActionClick(item, i)"
            >
                <Icon v-if="item.icon" :name="(item.icon as Record<string, string>).name" size="sm" />
                {{ String(item.label) }}
            </button>
            <ConfirmationModal
                :open="isConfirming(i)"
                :heading="String(item.label)"
                :message="String(item.confirmationMessage ?? 'Are you sure?')"
                confirm-label="Confirm"
                :is-dangerous="isDangerAction(item)"
                @close="handleActionCancel(i)"
                @confirm="handleActionConfirm(item, i)"
            />
        </template>

        <div
            v-else-if="itemType(item) === 'tabs'"
            class="rounded-xl border border-s-border bg-s-surface overflow-hidden"
        >
            <div class="flex border-b border-s-border">
                <button
                    v-for="(tab, ti) in ((item.schema ?? []) as Array<Record<string, unknown>>)"
                    :key="ti"
                    type="button"
                    :class="cn(
                        'px-4 py-2.5 text-sm font-medium transition-colors',
                        activeTab(i) === ti ? 'text-s-accent border-b-2 border-s-accent' : 'text-s-text-muted hover:text-s-text',
                    )"
                    @click="setActiveTab(i, ti)"
                >{{ String(tab.label ?? `Tab ${ti + 1}`) }}</button>
            </div>
            <div class="p-5">
                <div v-if="((item.schema ?? []) as Array<Record<string, unknown>>)[activeTab(i)]?.schema" class="space-y-4">
                    <DashboardSchemaRenderer
                        :items="(((item.schema ?? []) as Array<Record<string, unknown>>)[activeTab(i)].schema as Array<Record<string, unknown>>) ?? []"
                    />
                </div>
            </div>
        </div>

        <div
            v-else-if="itemType(item) === 'filters'"
            class="flex flex-wrap gap-3 rounded-xl border border-s-border bg-s-surface p-4"
        >
            <p class="text-xs font-medium text-s-text-faint w-full">Filters</p>
            <div
                v-for="(filter, fi) in ((item.schema ?? []) as Array<Record<string, unknown>>)"
                :key="fi"
                class="text-sm text-s-text-muted"
            >{{ String(filter.label ?? filter.name ?? '') }}</div>
        </div>

        <div
            v-else-if="itemType(item) === 'split'"
            class="grid gap-4"
            :style="{ gridTemplateColumns: `${(item.left ?? 2)}fr ${(item.right ?? 1)}fr` }"
        >
            <DashboardSchemaRenderer :items="(item.schema ?? []) as Array<Record<string, unknown>>" />
        </div>

        <div v-else-if="itemType(item) === 'stack'" class="space-y-4">
            <DashboardSchemaRenderer :items="(item.schema ?? []) as Array<Record<string, unknown>>" />
        </div>

        <hr v-else-if="itemType(item) === 'divider'" class="border-s-border" />
        <div v-else-if="itemType(item) === 'spacer'" class="h-6" />

        <div
            v-else-if="itemType(item) === 'alert'"
            :class="cn('flex items-start gap-3 rounded-xl border px-4 py-3', alertStyles[(item.variant ?? 'info') as string] ?? alertStyles.info)"
        >
            <Icon v-if="item.icon" :name="(item.icon as Record<string, string>).name" size="sm" class="mt-0.5 shrink-0" />
            <div>
                <p class="text-sm font-medium">{{ String(item.label ?? '') }}</p>
                <p v-if="item.description" class="text-xs mt-0.5 opacity-80">{{ String(item.description) }}</p>
            </div>
        </div>

        <span
            v-else-if="itemType(item) === 'badge'"
            :class="cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', badgeStyles[(item.variant ?? 'info') as string] ?? badgeStyles.info)"
        >{{ String(item.label ?? '') }}</span>

        <div v-else-if="itemType(item) === 'progress'">
            <div v-if="item.label" class="flex items-center justify-between mb-1.5">
                <span class="text-sm text-s-text-secondary">{{ String(item.label) }}</span>
                <span class="text-sm font-medium text-s-text">{{ Math.round(progressPct(item)) }}%</span>
            </div>
            <div class="h-2 rounded-full bg-s-border overflow-hidden">
                <div
                    :class="cn('h-full rounded-full transition-all', barColor[(item.color ?? 'accent') as string] ?? barColor.accent)"
                    :style="{ width: `${progressPct(item)}%` }"
                />
            </div>
        </div>

        <div v-else-if="itemType(item) === 'metric'" class="text-center py-4">
            <p class="text-3xl font-bold text-s-text">{{ String(item.value ?? '—') }}</p>
            <p class="text-sm text-s-text-muted mt-1">{{ String(item.label ?? '') }}</p>
            <p v-if="item.description" class="text-xs text-s-text-faint mt-0.5">{{ String(item.description) }}</p>
        </div>

        <div
            v-else-if="itemType(item) === 'empty'"
            class="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-s-border"
        >
            <svg class="w-10 h-10 text-s-text-faint mb-3" fill="none" viewBox="0 0 24 24" :stroke-width="1" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p class="text-sm text-s-text-muted">{{ String(item.message ?? 'No data available.') }}</p>
        </div>

        <img
            v-else-if="itemType(item) === 'image'"
            :src="String(item.src ?? '')"
            :alt="String(item.alt ?? '')"
            :class="cn('max-w-full', item.rounded ? 'rounded-xl' : '', item.width ? '' : 'w-full')"
            :style="{
                width: item.width ? String(item.width) : undefined,
                height: item.height ? String(item.height) : undefined,
            }"
        />

        <div
            v-else-if="itemType(item) === 'list'"
            class="rounded-xl border border-s-border bg-s-surface overflow-hidden divide-y divide-s-border"
        >
            <div
                v-for="[k, v] in Object.entries((item.items ?? {}) as Record<string, unknown>)"
                :key="k"
                class="flex items-center justify-between px-5 py-3"
            >
                <span class="text-sm text-s-text-muted">{{ k }}</span>
                <span class="text-sm font-medium text-s-text">{{ String(v ?? '—') }}</span>
            </div>
        </div>

        <div v-else-if="itemType(item) === 'timeline'" class="space-y-0">
            <div
                v-for="(entry, ei) in ((item.entries ?? []) as Array<Record<string, unknown>>)"
                :key="ei"
                class="flex gap-4"
            >
                <div class="flex flex-col items-center">
                    <div
                        :class="cn('w-2.5 h-2.5 rounded-full mt-1.5 shrink-0', dotColor[(entry.color ?? 'accent') as string] ?? dotColor.accent)"
                    />
                    <div v-if="ei < ((item.entries ?? []) as Array<Record<string, unknown>>).length - 1" class="w-px flex-1 bg-s-border" />
                </div>
                <div class="pb-6">
                    <p class="text-sm font-medium text-s-text">{{ String(entry.title ?? '') }}</p>
                    <p v-if="entry.description" class="text-xs text-s-text-muted mt-0.5">{{ String(entry.description) }}</p>
                    <p v-if="entry.time" class="text-xs text-s-text-faint mt-0.5">{{ String(entry.time) }}</p>
                </div>
            </div>
        </div>

        <div v-else-if="itemType(item) === 'actions'" class="flex flex-wrap items-center gap-2">
            <DashboardSchemaRenderer :items="(item.schema ?? []) as Array<Record<string, unknown>>" />
        </div>

        <div v-else-if="itemType(item) === 'markdown'" class="prose prose-sm max-w-none text-s-text-secondary">
            <pre class="whitespace-pre-wrap font-sans text-sm">{{ String(item.content ?? '') }}</pre>
        </div>

        <div
            v-else-if="itemType(item) === 'html'"
            class="text-sm text-s-text-secondary"
            v-html="String(item.content ?? '')"
        />

        <Chart
            v-else-if="itemType(item) === 'chart'"
            :type="(item.chartType ?? 'line') as 'line' | 'area' | 'bar' | 'donut'"
            :data="(item.data ?? []) as any"
            :label="item.label as string | undefined"
            :description="item.description as string | undefined"
            :color="item.color as string | undefined"
            :colors="item.colors as string[] | undefined"
            :height="(item.height as string | undefined) ?? '200px'"
            :series="item.series as any"
            :labels="item.labels as string[] | undefined"
            :stacked="item.stacked as boolean | undefined"
        />

        <Sparkline
            v-else-if="itemType(item) === 'sparkline'"
            :data="(item.data ?? []) as any"
            :color="item.color as string | undefined"
            :height="(item.height as string | undefined) ?? '32px'"
        />

        <div
            v-else-if="itemType(item) === 'activity'"
            class="rounded-xl border border-s-border bg-s-surface overflow-hidden"
        >
            <div v-if="item.label" class="border-b border-s-border px-5 py-3.5">
                <h3 class="text-sm font-semibold text-s-text">{{ String(item.label) }}</h3>
            </div>
            <div class="px-5 py-4 space-y-0">
                <template v-if="((item.entries ?? []) as Array<Record<string, unknown>>).length > 0">
                    <div
                        v-for="(entry, ei) in ((item.entries ?? []) as Array<Record<string, unknown>>)"
                        :key="ei"
                        class="flex gap-3"
                    >
                        <div class="flex flex-col items-center">
                            <div
                                :class="cn('w-2 h-2 rounded-full mt-2 shrink-0', dotColor[(entry.color ?? 'info') as string] ?? dotColor.info)"
                            />
                            <div v-if="ei < ((item.entries ?? []) as Array<Record<string, unknown>>).length - 1" class="w-px flex-1 bg-s-border" />
                        </div>
                        <div class="pb-4 min-w-0 flex-1">
                            <div class="flex items-center gap-2">
                                <p class="text-sm font-medium text-s-text">{{ String(entry.title ?? '') }}</p>
                                <span v-if="entry.user" class="text-xs text-s-accent font-medium">{{ String(entry.user) }}</span>
                            </div>
                            <p v-if="entry.description" class="text-xs text-s-text-muted mt-0.5">{{ String(entry.description) }}</p>
                            <p v-if="entry.time" class="text-[11px] text-s-text-faint mt-1">{{ String(entry.time) }}</p>
                        </div>
                    </div>
                </template>
                <p v-else class="text-sm text-s-text-faint text-center py-6">No activity yet</p>
            </div>
        </div>

        <div v-else class="rounded-xl border border-dashed border-s-border bg-s-surface-alt p-5">
            <p class="text-xs text-s-text-faint">Widget: {{ itemType(item) }}</p>
        </div>
    </template>
</template>
