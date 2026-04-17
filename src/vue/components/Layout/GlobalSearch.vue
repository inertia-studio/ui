<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { cn } from '../../../shared/utils/cn';
import { usePanel } from '../../composables/usePanel';

interface SearchResultItem { title: string; url: string }
interface SearchResultGroup { module: string; label: string; results: SearchResultItem[] }

const { panel } = usePanel();
const query = ref('');
const results = ref<SearchResultGroup[]>([]);
const isOpen = ref(false);
const isLoading = ref(false);

const inputRef = ref<HTMLInputElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function handleGlobalKey(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.value?.focus();
        isOpen.value = true;
    }
}

function handleClickOutside(e: MouseEvent) {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
        isOpen.value = false;
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleGlobalKey);
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleGlobalKey);
    document.removeEventListener('mousedown', handleClickOutside);
    if (debounceTimer) clearTimeout(debounceTimer);
});

watch(isOpen, (open) => {
    if (open) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
});

function performSearch(q: string) {
    if (debounceTimer) clearTimeout(debounceTimer);

    if (!q.trim()) {
        results.value = [];
        isLoading.value = false;
        return;
    }
    isLoading.value = true;

    debounceTimer = setTimeout(async () => {
        try {
            const response = await fetch(
                `${panel.value.path}/search?q=${encodeURIComponent(q.trim())}`,
                { credentials: 'same-origin', headers: { Accept: 'application/json' } },
            );
            if (response.ok) {
                results.value = (await response.json()) as SearchResultGroup[];
            } else {
                results.value = [];
            }
        } catch {
            results.value = [];
        } finally {
            isLoading.value = false;
        }
    }, 300);
}

function handleInput(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    query.value = v;
    isOpen.value = true;
    performSearch(v);
}

function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        isOpen.value = false;
        inputRef.value?.blur();
    }
}

function handleResultClick(url: string) {
    isOpen.value = false;
    query.value = '';
    results.value = [];
    router.visit(url);
}

function shortcut(): string {
    if (typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent)) return '\u2318';
    return 'Ctrl+';
}
</script>

<template>
    <div ref="containerRef" class="relative">
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
                ref="inputRef"
                type="text"
                :value="query"
                placeholder="Search..."
                :class="cn(
                    'h-8 w-full rounded-lg border border-s-border bg-s-surface-alt pl-9 pr-12 text-sm text-s-text',
                    'placeholder:text-s-text-faint',
                    'transition-colors focus:border-s-accent focus:bg-s-surface focus:outline-none focus:ring-1 focus:ring-s-accent/30',
                )"
                @input="handleInput"
                @keydown="handleKeyDown"
                @focus="() => { if (query.trim()) isOpen = true; }"
            />

            <kbd class="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-s-border bg-s-surface px-1.5 py-0.5 text-[10px] font-medium text-s-text-faint sm:inline-block">
                {{ shortcut() }}K
            </kbd>
        </div>

        <div
            v-if="isOpen && query.trim().length > 0"
            class="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-s-border bg-s-surface shadow-lg"
        >
            <div v-if="isLoading" class="flex items-center justify-center px-4 py-6 text-sm text-s-text-muted">
                <svg class="mr-2 h-4 w-4 animate-spin text-s-text-faint" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Searching...
            </div>

            <div v-else-if="results.length === 0 && query.trim().length > 0" class="px-4 py-6 text-center text-sm text-s-text-muted">
                No results found.
            </div>

            <div v-else class="max-h-80 overflow-y-auto py-1">
                <div v-for="group in results" :key="group.module">
                    <div class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-s-text-faint">
                        {{ group.label }}
                    </div>
                    <button
                        v-for="(item, i) in group.results ?? []"
                        :key="i"
                        type="button"
                        class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-s-text-secondary transition-colors hover:bg-s-hover group"
                        @click="handleResultClick(item.url)"
                    >
                        <span>{{ item.title }}</span>
                        <svg class="w-3.5 h-3.5 text-s-text-faint opacity-0 group-hover:opacity-100 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
