<script setup lang="ts">
import { computed } from 'vue';
import { router } from '@inertiajs/vue3';
import { cn } from '../../../shared/utils/cn';
import type { PaginatedData } from '../../../shared/types/schema';

const props = defineProps<{ data: PaginatedData }>();

function navigateToPage(page: number) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(page));
    router.visit(url.pathname + url.search, {
        preserveState: true,
        preserveScroll: true,
        only: ['records'],
    });
}

function getPageNumbers(currentPage: number, lastPage: number): Array<number | '...'> {
    if (lastPage <= 7) return Array.from({ length: lastPage }, (_, i) => i + 1);
    const pages: Array<number | '...'> = [1];
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(lastPage - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < lastPage - 2) pages.push('...');
    if (lastPage > 1) pages.push(lastPage);
    return pages;
}

const pages = computed(() => getPageNumbers(props.data.current_page, props.data.last_page));
const hasPrevious = computed(() => props.data.current_page > 1);
const hasNext = computed(() => props.data.current_page < props.data.last_page);
</script>

<template>
    <div v-if="data.last_page > 1" class="flex items-center justify-between border-t border-s-border px-2 py-3">
        <div class="text-sm text-s-text-muted">
            <span v-if="data.from != null && data.to != null">
                Showing <span class="font-medium">{{ data.from }}</span> to
                <span class="font-medium">{{ data.to }}</span> of
                <span class="font-medium">{{ data.total }}</span> results
            </span>
            <span v-else>
                <span class="font-medium">{{ data.total }}</span> results
            </span>
        </div>

        <nav class="flex items-center gap-1" aria-label="Pagination">
            <button
                type="button"
                :disabled="!hasPrevious"
                :class="cn(
                    'inline-flex items-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors',
                    hasPrevious ? 'text-s-text-secondary hover:bg-s-hover' : 'cursor-not-allowed text-s-text-faint',
                )"
                aria-label="Previous page"
                @click="() => hasPrevious && navigateToPage(data.current_page - 1)"
            >
                <svg class="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                Previous
            </button>

            <div class="hidden items-center gap-0.5 sm:flex">
                <template v-for="(page, index) in pages" :key="`p-${index}`">
                    <span v-if="page === '...'" class="px-2 py-1 text-sm text-s-text-faint">...</span>
                    <button
                        v-else
                        type="button"
                        :class="cn(
                            'inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                            page === data.current_page
                                ? 'bg-s-accent text-white'
                                : 'text-s-text-secondary hover:bg-s-hover',
                        )"
                        :aria-current="page === data.current_page ? 'page' : undefined"
                        @click="() => page !== data.current_page && navigateToPage(page as number)"
                    >{{ page }}</button>
                </template>
            </div>

            <button
                type="button"
                :disabled="!hasNext"
                :class="cn(
                    'inline-flex items-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors',
                    hasNext ? 'text-s-text-secondary hover:bg-s-hover' : 'cursor-not-allowed text-s-text-faint',
                )"
                aria-label="Next page"
                @click="() => hasNext && navigateToPage(data.current_page + 1)"
            >
                Next
                <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </nav>
    </div>
</template>
