<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { cn } from '../../../shared/utils/cn';
import { useStudioHooks } from '../../composables/useStudioHooks';
import SchemaIcon from '../Icon/SchemaIcon.vue';
import ConfirmationModal from '../Actions/ConfirmationModal.vue';
import { cellComponentMap } from './cells';
import SearchBar from './SearchBar.vue';
import Pagination from './Pagination.vue';
import FilterPanel from './filters/FilterPanel.vue';
import ColumnToggle from './ColumnToggle.vue';
import BulkActionBar from './BulkActionBar.vue';
import type { TableSchema, PaginatedData, ColumnSchema, ActionSchema } from '../../../shared/types/schema';

interface Props {
    schema: TableSchema;
    data: PaginatedData;
    module: { slug: string };
    panelPath: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'simple-edit': [record: Record<string, unknown>] }>();

const { invoke, has } = useStudioHooks();

const alignmentClasses: Record<string, string> = {
    start: 'text-left',
    center: 'text-center',
    end: 'text-right',
};
const actionColorClasses: Record<string, string> = {
    primary: 'text-s-accent hover:text-s-accent/80',
    danger: 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',
    warning: 'text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300',
    success: 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300',
    info: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
    gray: 'text-s-text-muted hover:text-s-text-secondary',
};

const hasBulkActions = computed(() => props.schema.bulkActions.length > 0);

let pollInterval: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
    if (props.schema.poll && props.schema.poll > 0) {
        pollInterval = setInterval(() => {
            router.reload({ only: ['records'] });
        }, props.schema.poll * 1000);
    }
});
onBeforeUnmount(() => {
    if (pollInterval) clearInterval(pollInterval);
});

const currentUrl = computed(() => (typeof window !== 'undefined' ? new URL(window.location.href) : null));
const currentSearch = computed(() => currentUrl.value?.searchParams.get('search') ?? '');
const currentSort = computed(() => currentUrl.value?.searchParams.get('sort') ?? null);
const currentDirection = computed(() => currentUrl.value?.searchParams.get('direction') ?? null);

const activeFilters = computed<Record<string, unknown>>(() => {
    const filters: Record<string, unknown> = {};
    const url = currentUrl.value;
    if (!url) return filters;
    url.searchParams.forEach((val, key) => {
        const nestedMatch = key.match(/^filter\[([^\]]+)]\[([^\]]+)]$/);
        if (nestedMatch) {
            const [, name, subKey] = nestedMatch;
            if (!filters[name] || typeof filters[name] !== 'object') filters[name] = {};
            (filters[name] as Record<string, string>)[subKey] = val;
            return;
        }
        const flatMatch = key.match(/^filter\[([^\]]+)]$/);
        if (flatMatch) filters[flatMatch[1]] = val;
    });
    return filters;
});

const hiddenColumns = ref<Set<string>>(
    (() => {
        const s = new Set<string>();
        props.schema.columns.forEach((col) => {
            if (col.isToggledHiddenByDefault || col.hidden) s.add(col.name);
        });
        return s;
    })(),
);

const visibleColumns = computed(() =>
    props.schema.columns.filter((col) => !hiddenColumns.value.has(col.name) && !col.hidden),
);

function handleColumnToggle(columnName: string) {
    const next = new Set(hiddenColumns.value);
    if (next.has(columnName)) next.delete(columnName);
    else next.add(columnName);
    hiddenColumns.value = next;
}

const selectedIds = ref<Array<string | number>>([]);
const confirmAction = ref<{ action: ActionSchema; record: Record<string, unknown> } | null>(null);

const allRecordIds = computed(() => props.data.data.map((r) => r.id as string | number));
const isAllSelected = computed(
    () => allRecordIds.value.length > 0 && selectedIds.value.length === allRecordIds.value.length,
);

function handleSelectAll() {
    selectedIds.value = isAllSelected.value ? [] : [...allRecordIds.value];
}
function handleSelectRow(id: string | number) {
    if (selectedIds.value.includes(id)) {
        selectedIds.value = selectedIds.value.filter((s) => s !== id);
    } else {
        selectedIds.value = [...selectedIds.value, id];
    }
}
function handleClearSelection() {
    selectedIds.value = [];
}

function handleSort(column: ColumnSchema) {
    if (!column.sortable) return;
    const url = new URL(window.location.href);
    let newDirection: 'asc' | 'desc' = 'asc';
    if (currentSort.value === column.name) {
        newDirection = currentDirection.value === 'asc' ? 'desc' : 'asc';
    }
    url.searchParams.set('sort', column.name);
    url.searchParams.set('direction', newDirection);
    router.visit(url.pathname + url.search, { preserveScroll: true });
}

function handleRowAction(action: ActionSchema, record: Record<string, unknown>) {
    if (action.url) {
        const resolvedUrl = action.url.replace(/\{(\w+)}/g, (_m, key) => String(record[key] ?? ''));
        router.visit(resolvedUrl);
        return;
    }
    const recordId = record.id as string | number;
    const base = `${props.panelPath}/${props.module.slug}`;
    switch (action.type) {
        case 'view':
            router.visit(`${base}/${recordId}`);
            break;
        case 'edit':
            emit('simple-edit', record);
            router.visit(`${base}/${recordId}/edit`);
            break;
        case 'delete':
            if (action.requiresConfirmation) {
                confirmAction.value = { action, record };
                return;
            }
            router.delete(`${base}/${recordId}`, { preserveState: true, preserveScroll: true });
            break;
        default:
            router.post(`${base}/actions/${action.name}`, {}, { preserveState: true, preserveScroll: true });
    }
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], obj);
}

function resolveValue(column: ColumnSchema, record: Record<string, unknown>): unknown {
    return column.name.includes('.') ? getNestedValue(record, column.name) : record[column.name];
}

function customCell(column: ColumnSchema, record: Record<string, unknown>) {
    if (!has('table:cell')) return null;
    const value = resolveValue(column, record);
    return invoke('table:cell', column, value, record);
}

function cellComponent(type: string) {
    return cellComponentMap[type];
}

function resolveUrlForColumn(column: ColumnSchema, record: Record<string, unknown>): string | null {
    if (!column.url) return null;
    return column.url.replace(/\{(\w+)}/g, (_m, key) => String(record[key] ?? ''));
}

function rowClass(record: Record<string, unknown>, index: number): string | null {
    return has('table:row-class') ? (invoke('table:row-class', record, index) as string | null) : null;
}

const totalColSpan = computed(
    () => visibleColumns.value.length + (hasBulkActions.value ? 1 : 0) + (props.schema.actions.length > 0 ? 1 : 0),
);

function isGroupHeader(record: Record<string, unknown>, rowIndex: number): { show: boolean; label: string; count: number } {
    const groupBy = props.schema.groupBy;
    if (!groupBy) return { show: false, label: '', count: 0 };
    const groupVal = String(getNestedValue(record, groupBy) ?? 'Ungrouped');
    const prev = rowIndex > 0 ? props.data.data[rowIndex - 1] : null;
    const prevVal = prev ? String(getNestedValue(prev, groupBy) ?? 'Ungrouped') : null;
    if (rowIndex === 0 || groupVal !== prevVal) {
        const count = props.data.data.filter(
            (r) => String(getNestedValue(r, groupBy) ?? 'Ungrouped') === groupVal,
        ).length;
        return { show: true, label: groupVal, count };
    }
    return { show: false, label: '', count: 0 };
}

function confirmDelete() {
    if (!confirmAction.value) return;
    const recordId = confirmAction.value.record.id as string | number;
    router.delete(`${props.panelPath}/${props.module.slug}/${recordId}`, {
        preserveState: true,
        preserveScroll: true,
    });
    confirmAction.value = null;
}

const headerActions = computed(() => (has('table:header-actions') ? (invoke('table:header-actions') as unknown[]) : null));
const emptyState = computed(() => (has('table:empty-state') ? invoke('table:empty-state') : null));
</script>

<template>
    <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
            <div v-if="schema.searchable" class="w-full sm:w-72">
                <SearchBar :initial-value="currentSearch" />
            </div>
            <div class="flex flex-1 items-center justify-end gap-2">
                <span
                    v-if="schema.poll > 0"
                    class="inline-flex items-center gap-1.5 text-xs text-s-text-faint"
                    :title="`Refreshing every ${schema.poll}s`"
                >
                    <span class="relative flex h-2 w-2">
                        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Live
                </span>
                <FilterPanel
                    v-if="schema.filters.length > 0"
                    :filters="schema.filters"
                    :active-filters="activeFilters"
                    :columns="schema.filterColumns ?? 2"
                    :module-slug="module.slug"
                />
                <ColumnToggle
                    :columns="schema.columns"
                    :hidden-columns="hiddenColumns"
                    @toggle="handleColumnToggle"
                />
                <span v-for="(a, i) in (headerActions ?? [])" :key="i">
                    <component :is="a" />
                </span>
            </div>
        </div>

        <div class="overflow-x-auto rounded-lg border border-s-border bg-s-surface">
            <table class="w-full text-left text-sm text-s-text-secondary">
                <thead class="border-b border-s-border bg-s-surface-alt sticky top-0 z-10">
                    <tr>
                        <th v-if="hasBulkActions" class="w-12 px-4 py-3">
                            <input
                                type="checkbox"
                                :checked="isAllSelected"
                                class="h-4 w-4 rounded border-s-border-strong text-s-accent focus:ring-s-accent/30 bg-s-input"
                                aria-label="Select all rows"
                                @change="handleSelectAll"
                            />
                        </th>
                        <th
                            v-for="column in visibleColumns"
                            :key="column.name"
                            :class="cn(
                                'px-4 py-3 text-xs font-medium uppercase tracking-wider text-s-text-muted',
                                alignmentClasses[column.alignment] ?? 'text-left',
                                column.sortable && 'cursor-pointer select-none hover:text-s-text',
                            )"
                            @click="handleSort(column)"
                        >
                            <span class="inline-flex items-center">
                                {{ column.label }}
                                <span v-if="column.sortable" class="ml-1 inline-flex flex-col">
                                    <svg
                                        :class="cn(
                                            'h-3 w-3 -mb-0.5',
                                            currentSort === column.name && currentDirection === 'asc' ? 'text-s-text' : 'text-s-text-faint',
                                        )"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        :stroke-width="2.5"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                    </svg>
                                    <svg
                                        :class="cn(
                                            'h-3 w-3 -mt-0.5',
                                            currentSort === column.name && currentDirection === 'desc' ? 'text-s-text' : 'text-s-text-faint',
                                        )"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        :stroke-width="2.5"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </span>
                            </span>
                        </th>
                        <th
                            v-if="schema.actions.length > 0"
                            class="w-20 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-s-text-muted"
                        >
                            <span class="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-s-border">
                    <tr v-if="data.data.length === 0">
                        <td :colspan="totalColSpan" class="px-4 py-12 text-center">
                            <component v-if="emptyState" :is="emptyState" />
                            <div v-else class="flex flex-col items-center gap-2">
                                <svg
                                    class="h-10 w-10 text-s-text-faint"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    :stroke-width="1"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                                <p class="text-sm font-medium text-s-text-muted">No records found</p>
                                <p class="text-xs text-s-text-faint">Try adjusting your search or filters.</p>
                            </div>
                        </td>
                    </tr>
                    <template v-for="(record, rowIndex) in data.data" v-else :key="(record.id as string | number) ?? rowIndex">
                        <tr v-if="isGroupHeader(record, rowIndex).show" class="bg-s-surface-alt">
                            <td :colspan="totalColSpan" class="px-4 py-2">
                                <span class="text-xs font-semibold text-s-text-muted uppercase tracking-wide">{{ isGroupHeader(record, rowIndex).label }}</span>
                                <span class="ml-2 text-[11px] text-s-text-faint">{{ isGroupHeader(record, rowIndex).count }}</span>
                            </td>
                        </tr>
                        <tr
                            :class="cn(
                                'transition-colors hover:bg-s-hover',
                                selectedIds.includes(record.id as string | number) && 'bg-s-accent/5',
                                rowClass(record, rowIndex),
                            )"
                        >
                            <td v-if="hasBulkActions" class="w-12 px-4 py-3">
                                <input
                                    type="checkbox"
                                    :checked="selectedIds.includes(record.id as string | number)"
                                    class="h-4 w-4 rounded border-s-border-strong text-s-accent focus:ring-s-accent/30 bg-s-input"
                                    :aria-label="`Select row ${rowIndex + 1}`"
                                    @change="handleSelectRow(record.id as string | number)"
                                />
                            </td>
                            <td
                                v-for="column in visibleColumns"
                                :key="column.name"
                                :class="cn(
                                    'px-4 py-3',
                                    alignmentClasses[column.alignment] ?? 'text-left',
                                    !column.wrap && 'whitespace-nowrap',
                                )"
                            >
                                <component v-if="customCell(column, record)" :is="customCell(column, record)" />
                                <template v-else>
                                    <a
                                        v-if="resolveUrlForColumn(column, record)"
                                        :href="resolveUrlForColumn(column, record)!"
                                        class="text-s-accent hover:underline"
                                    >
                                        <component
                                            v-if="cellComponent(column.type)"
                                            :is="cellComponent(column.type)"
                                            :schema="column"
                                            :value="resolveValue(column, record)"
                                            :record="record"
                                        />
                                        <span v-else class="text-s-text-faint">{{ String(resolveValue(column, record) ?? '—') }}</span>
                                    </a>
                                    <template v-else>
                                        <component
                                            v-if="cellComponent(column.type)"
                                            :is="cellComponent(column.type)"
                                            :schema="column"
                                            :value="resolveValue(column, record)"
                                            :record="record"
                                        />
                                        <span v-else class="text-s-text-faint">{{ String(resolveValue(column, record) ?? '—') }}</span>
                                    </template>
                                </template>
                                <p v-if="column.description" class="mt-0.5 text-xs text-s-text-faint">
                                    {{
                                        typeof record[column.description] === 'string'
                                            ? (record[column.description] as string)
                                            : column.description
                                    }}
                                </p>
                            </td>
                            <td v-if="schema.actions.length > 0" class="px-4 py-3 text-right">
                                <div class="flex items-center justify-end gap-1">
                                    <button
                                        v-for="action in schema.actions.filter((a) => a.authorized)"
                                        :key="action.name"
                                        type="button"
                                        :class="cn(
                                            'inline-flex items-center rounded-md p-1.5 transition-colors',
                                            actionColorClasses[action.color ?? 'gray'] ?? actionColorClasses.gray,
                                        )"
                                        :title="action.label"
                                        @click="handleRowAction(action, record)"
                                    >
                                        <SchemaIcon v-if="action.icon" :schema="action.icon" size="sm" />
                                        <span v-else class="text-xs font-medium">{{ action.label }}</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>

            <Pagination v-if="schema.paginated" :data="data" />
        </div>

        <BulkActionBar
            v-if="hasBulkActions"
            :selected-ids="selectedIds"
            :actions="schema.bulkActions"
            :panel-path="panelPath"
            :module="module"
            @clear-selection="handleClearSelection"
        />

        <ConfirmationModal
            :open="confirmAction !== null"
            heading="Delete Record"
            :message="String(confirmAction?.action.confirmationMessage ?? 'Are you sure you want to delete this record? This action cannot be undone.')"
            confirm-label="Delete"
            :is-dangerous="true"
            @close="confirmAction = null"
            @confirm="confirmDelete"
        />
    </div>
</template>
