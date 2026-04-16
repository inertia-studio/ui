<script setup lang="ts">
import { computed, ref } from 'vue';
import { cn } from '../../../shared/utils/cn';
import type { ColumnSchema, TableSchema, PaginatedData } from '../../../shared/types/schema';
import { cellComponentMap } from './cells';

interface Props {
    schema: TableSchema;
    data: PaginatedData | Record<string, unknown>[];
    label?: string;
}

const props = defineProps<Props>();

function resolveValue(record: Record<string, unknown>, name: string): unknown {
    if (name.includes('.')) {
        return name.split('.').reduce<unknown>((obj, key) => (obj as Record<string, unknown>)?.[key], record);
    }
    return record[name];
}

const search = ref('');
const sortCol = ref<string | null>(props.schema.defaultSort?.column ?? null);
const sortDir = ref<'asc' | 'desc'>(props.schema.defaultSort?.direction ?? 'asc');
const page = ref(1);
const perPage = 10;

const allRows = computed<Record<string, unknown>[]>(() => {
    if (Array.isArray(props.data)) return props.data;
    return (props.data as PaginatedData).data ?? [];
});

const searchableCols = computed(() =>
    props.schema.columns.filter((c) => c.searchable).map((c) => c.name),
);

const filtered = computed(() => {
    if (!search.value || searchableCols.value.length === 0) return allRows.value;
    const q = search.value.toLowerCase();
    return allRows.value.filter((row) =>
        searchableCols.value.some((col) => {
            const val = resolveValue(row, col);
            return val != null && String(val).toLowerCase().includes(q);
        }),
    );
});

const sorted = computed(() => {
    if (!sortCol.value) return filtered.value;
    return [...filtered.value].sort((a, b) => {
        const aVal = resolveValue(a, sortCol.value!);
        const bVal = resolveValue(b, sortCol.value!);
        const aStr = aVal != null ? String(aVal) : '';
        const bStr = bVal != null ? String(bVal) : '';
        const cmp = aStr.localeCompare(bStr, undefined, { numeric: true });
        return sortDir.value === 'asc' ? cmp : -cmp;
    });
});

const totalPages = computed(() =>
    props.schema.paginated ? Math.max(1, Math.ceil(sorted.value.length / perPage)) : 1,
);
const pageRows = computed(() =>
    props.schema.paginated ? sorted.value.slice((page.value - 1) * perPage, page.value * perPage) : sorted.value,
);

function handleSort(col: ColumnSchema) {
    if (!col.sortable) return;
    if (sortCol.value === col.name) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortCol.value = col.name;
        sortDir.value = 'asc';
    }
    page.value = 1;
}

function cellComponent(type: string) {
    return cellComponentMap[type];
}

function handleSearchInput(e: Event) {
    search.value = (e.target as HTMLInputElement).value;
    page.value = 1;
}
</script>

<template>
    <div>
        <div v-if="label || schema.searchable" class="flex items-center justify-between mb-3">
            <h3 v-if="label" class="text-sm font-semibold text-s-text">{{ label }}</h3>
            <div v-if="schema.searchable" class="relative">
                <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                    type="text"
                    :value="search"
                    placeholder="Search..."
                    class="h-8 w-48 pl-8 pr-3 text-sm rounded-lg border border-s-border bg-s-input text-s-text placeholder:text-s-text-faint focus:outline-none focus:border-s-accent focus:ring-1 focus:ring-s-accent/30"
                    @input="handleSearchInput"
                />
            </div>
        </div>

        <div class="overflow-x-auto rounded-xl border border-s-border bg-s-surface">
            <table class="w-full text-sm text-s-text-secondary">
                <thead class="sticky top-0 z-10 bg-s-surface">
                    <tr class="border-b border-s-border">
                        <th
                            v-for="col in schema.columns"
                            :key="col.name"
                            :class="cn(
                                'text-left px-4 py-2.5 text-xs font-medium text-s-text-muted uppercase tracking-wider',
                                col.sortable && 'cursor-pointer select-none hover:text-s-text',
                            )"
                            @click="handleSort(col)"
                        >
                            <span class="inline-flex items-center gap-1">
                                {{ col.label }}
                                <svg
                                    v-if="col.sortable && sortCol === col.name"
                                    :class="cn('w-3 h-3', sortDir === 'desc' && 'rotate-180')"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    :stroke-width="2.5"
                                    stroke="currentColor"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                </svg>
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-s-border">
                    <tr v-if="pageRows.length === 0">
                        <td :colspan="schema.columns.length" class="px-4 py-8 text-center text-sm text-s-text-muted">
                            No records found.
                        </td>
                    </tr>
                    <tr
                        v-for="(row, ri) in pageRows"
                        v-else
                        :key="ri"
                        class="hover:bg-s-hover transition-colors"
                    >
                        <td v-for="col in schema.columns" :key="col.name" class="px-4 py-2.5">
                            <component
                                v-if="cellComponent(col.type)"
                                :is="cellComponent(col.type)"
                                :schema="col"
                                :value="resolveValue(row, col.name)"
                                :record="row"
                            />
                            <span v-else>{{ resolveValue(row, col.name) != null ? String(resolveValue(row, col.name)) : '—' }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div
                v-if="schema.paginated && totalPages > 1"
                class="flex items-center justify-between px-4 py-2.5 border-t border-s-border text-xs text-s-text-muted"
            >
                <span>
                    Showing {{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, sorted.length) }} of {{ sorted.length }}
                </span>
                <div class="flex items-center gap-1">
                    <button
                        type="button"
                        :disabled="page <= 1"
                        class="px-2 py-1 rounded-md border border-s-border text-s-text-secondary hover:bg-s-hover disabled:opacity-40 disabled:cursor-not-allowed"
                        @click="page -= 1"
                    >Prev</button>
                    <span class="px-2">{{ page }} / {{ totalPages }}</span>
                    <button
                        type="button"
                        :disabled="page >= totalPages"
                        class="px-2 py-1 rounded-md border border-s-border text-s-text-secondary hover:bg-s-hover disabled:opacity-40 disabled:cursor-not-allowed"
                        @click="page += 1"
                    >Next</button>
                </div>
            </div>
        </div>
    </div>
</template>
