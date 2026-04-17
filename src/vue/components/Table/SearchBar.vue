<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';

interface Props {
    initialValue?: string;
}

const props = withDefaults(defineProps<Props>(), { initialValue: '' });

const query = ref(props.initialValue);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(() => props.initialValue, (v) => { query.value = v; });

function handleChange(value: string) {
    query.value = value;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const url = new URL(window.location.href);
        if (value) url.searchParams.set('search', value);
        else url.searchParams.delete('search');
        url.searchParams.delete('page');
        router.visit(url.pathname + url.search, {
            preserveState: true,
            preserveScroll: true,
            only: ['records'],
        });
    }, 300);
}

onBeforeUnmount(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<template>
    <div class="relative">
        <svg
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-s-text-faint"
            fill="none"
            viewBox="0 0 24 24"
            :stroke-width="2"
            stroke="currentColor"
            aria-hidden="true"
        >
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
            type="text"
            :value="query"
            placeholder="Search..."
            class="w-full rounded-lg border border-s-border-strong bg-s-input py-2 pl-9 pr-3 text-sm text-s-text transition-colors placeholder:text-s-text-faint hover:border-s-border-strong focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30"
            @input="handleChange(($event.target as HTMLInputElement).value)"
        />
        <button
            v-if="query"
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-s-text-faint hover:text-s-text-muted"
            aria-label="Clear search"
            @click="handleChange('')"
        >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
</template>
