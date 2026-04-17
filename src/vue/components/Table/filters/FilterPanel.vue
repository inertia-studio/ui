<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { cn } from '../../../../shared/utils/cn';
import type { FilterSchema } from '../../../../shared/types/schema';
import { filterComponentMap } from './index';

const props = withDefaults(defineProps<{
    filters: FilterSchema[];
    activeFilters: Record<string, unknown>;
    columns?: number;
    moduleSlug?: string;
}>(), {
    columns: 2,
});

const gridColsClass: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
};

const panelWidthClass: Record<number, string> = {
    1: 'w-72',
    2: 'w-[28rem]',
    3: 'w-[40rem]',
    4: 'w-[52rem]',
    5: 'w-[64rem]',
    6: 'w-[76rem]',
};

const isOpen = ref(false);
const localFilters = ref<Record<string, unknown>>({ ...props.activeFilters });
const panelRef = ref<HTMLDivElement | null>(null);

function handler(e: MouseEvent) {
    if (panelRef.value && !panelRef.value.contains(e.target as Node)) {
        isOpen.value = false;
    }
}

watch(isOpen, (open) => {
    if (open) {
        document.addEventListener('mousedown', handler);
    } else {
        document.removeEventListener('mousedown', handler);
    }
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handler);
});

const activeCount = computed(() => {
    return Object.values(localFilters.value).filter((v) => v != null).length;
});

function handleFilterChange(name: string, value: unknown) {
    const updated = { ...localFilters.value, [name]: value };
    localFilters.value = updated;

    const url = new URL(window.location.href);
    // Reset to page 1 when filters change
    url.searchParams.delete('page');

    // Update filter params
    Object.entries(updated).forEach(([key, val]) => {
        if (val == null) {
            url.searchParams.delete(`filter[${key}]`);
        } else if (typeof val === 'object') {
            const obj = val as Record<string, unknown>;
            Object.entries(obj).forEach(([subKey, subVal]) => {
                if (subVal == null || subVal === '') {
                    url.searchParams.delete(`filter[${key}][${subKey}]`);
                } else {
                    url.searchParams.set(`filter[${key}][${subKey}]`, String(subVal));
                }
            });
        } else {
            url.searchParams.set(`filter[${key}]`, String(val));
        }
    });

    router.visit(url.pathname + url.search, {
        preserveState: true, preserveScroll: true, only: ['records'],
    });
}

function handleClearAll() {
    localFilters.value = {};

    const url = new URL(window.location.href);
    url.searchParams.delete('page');
    // Remove all filter params
    const keysToDelete: string[] = [];
    url.searchParams.forEach((_val, key) => {
        if (key.startsWith('filter[')) {
            keysToDelete.push(key);
        }
    });
    keysToDelete.forEach((key) => url.searchParams.delete(key));

    router.visit(url.pathname + url.search, {
        preserveState: true, preserveScroll: true, only: ['records'],
    });
}
</script>

<template>
    <div v-if="filters.length > 0" ref="panelRef" class="relative">
        <button
            type="button"
            :class="cn(
                'inline-flex items-center gap-1.5 rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm font-medium text-s-text-secondary transition-colors hover:bg-s-hover',
                activeCount > 0 && 'border-s-accent text-s-accent',
            )"
            @click="isOpen = !isOpen"
        >
            <svg
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                :stroke-width="2"
                stroke="currentColor"
                aria-hidden="true"
            >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
            </svg>
            Filters
            <span
                v-if="activeCount > 0"
                class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-s-accent text-xs text-white"
            >
                {{ activeCount }}
            </span>
        </button>

        <div
            v-if="isOpen"
            :class="cn('absolute right-0 z-20 mt-2 rounded-xl border border-s-border bg-s-surface p-4 shadow-lg', panelWidthClass[columns] ?? 'w-[28rem]')"
        >
            <div class="mb-3 flex items-center justify-between">
                <h3 class="text-sm font-semibold text-s-text">Filters</h3>
                <button
                    v-if="activeCount > 0"
                    type="button"
                    class="text-xs font-medium text-s-accent hover:underline"
                    @click="handleClearAll"
                >
                    Clear all
                </button>
            </div>

            <div :class="cn('grid gap-4', gridColsClass[columns] ?? 'grid-cols-2')">
                <template v-for="filter in filters" :key="filter.name">
                    <component
                        :is="filterComponentMap[filter.type]"
                        v-if="filterComponentMap[filter.type]"
                        :schema="filter"
                        :value="localFilters[filter.name] ?? null"
                        :module-slug="moduleSlug"
                        @change="(val: unknown) => handleFilterChange(filter.name, val)"
                    />
                </template>
            </div>
        </div>
    </div>
</template>
