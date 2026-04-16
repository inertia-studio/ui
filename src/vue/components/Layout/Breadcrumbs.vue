<script setup lang="ts">
import { cn } from '../../../shared/utils/cn';
import type { BreadcrumbItem } from './types';

defineProps<{ items: BreadcrumbItem[] }>();
</script>

<template>
    <nav v-if="items.length > 0" aria-label="Breadcrumb" class="flex items-center gap-1.5 text-sm">
        <span v-for="(item, index) in items" :key="index" class="flex items-center gap-1.5">
            <svg
                v-if="index > 0"
                class="h-3.5 w-3.5 shrink-0 text-s-text-faint"
                fill="none"
                viewBox="0 0 24 24"
                :stroke-width="2"
                stroke="currentColor"
                aria-hidden="true"
            >
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <span
                v-if="index === items.length - 1 || !item.url"
                :class="cn('truncate', index === items.length - 1 ? 'font-medium text-s-text' : 'text-s-text-muted')"
                :aria-current="index === items.length - 1 ? 'page' : undefined"
            >{{ item.label }}</span>
            <a
                v-else
                :href="item.url"
                class="truncate text-s-text-muted transition-colors hover:text-s-text-secondary"
            >{{ item.label }}</a>
        </span>
    </nav>
</template>
