<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '../../../shared/utils/cn';
import type { SectionSchema } from '../../../shared/types/schema';

const props = defineProps<{ schema: SectionSchema }>();
const collapsed = ref(props.schema.collapsed);
</script>

<template>
    <div :class="cn('col-span-full', schema.aside && 'grid grid-cols-3 gap-6')">
        <div v-if="schema.heading || schema.description" :class="cn(schema.aside && 'col-span-1')">
            <div class="flex items-center justify-between">
                <h3 v-if="schema.heading" class="text-base font-semibold text-s-text">{{ schema.heading }}</h3>
                <button
                    v-if="schema.collapsible"
                    type="button"
                    class="rounded p-1 text-s-text-faint transition-colors hover:text-s-text-muted"
                    :aria-label="collapsed ? 'Expand section' : 'Collapse section'"
                    @click="collapsed = !collapsed"
                >
                    <svg
                        :class="cn('h-4 w-4 transition-transform', collapsed && '-rotate-90')"
                        fill="none"
                        viewBox="0 0 24 24"
                        :stroke-width="2"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
            </div>
            <p v-if="schema.description" class="mt-1 text-sm text-s-text-muted">{{ schema.description }}</p>
        </div>

        <div
            v-if="!collapsed"
            :class="cn(
                'grid gap-4',
                schema.aside && 'col-span-2',
                schema.columns === 1 && 'grid-cols-1',
                schema.columns === 2 && 'grid-cols-2',
                schema.columns === 3 && 'grid-cols-3',
                schema.columns === 4 && 'grid-cols-4',
                schema.columns >= 5 && 'grid-cols-5',
            )"
        >
            <slot />
        </div>
    </div>
</template>
