<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '../../../shared/utils/cn';
import type { DetailSchema, SectionSchema } from '../../../shared/types/schema';
import DetailEntries from './DetailEntries.vue';

const props = defineProps<{
    schema: SectionSchema;
    record: Record<string, unknown>;
}>();

const collapsed = ref(props.schema.collapsed);
</script>

<template>
    <div class="col-span-full">
        <div v-if="schema.heading || schema.description" class="flex items-center justify-between border-b border-s-border px-5 py-3.5">
            <div>
                <h3 v-if="schema.heading" class="text-sm font-semibold text-s-text">{{ schema.heading }}</h3>
                <p v-if="schema.description" class="mt-0.5 text-xs text-s-text-muted">{{ schema.description }}</p>
            </div>
            <button
                v-if="schema.collapsible"
                type="button"
                class="rounded p-1 text-s-text-faint hover:text-s-text-muted transition-colors"
                @click="collapsed = !collapsed"
            >
                <svg
                    :class="cn('h-4 w-4 transition-transform', collapsed && '-rotate-90')"
                    fill="none"
                    viewBox="0 0 24 24"
                    :stroke-width="2"
                    stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
        </div>
        <div
            v-if="!collapsed"
            :class="cn(
                'grid gap-x-0 divide-x divide-s-border',
                schema.columns === 1 && 'grid-cols-1 divide-x-0',
                schema.columns === 2 && 'grid-cols-2',
                schema.columns === 3 && 'grid-cols-3',
                schema.columns >= 4 && 'grid-cols-4',
            )"
        >
            <DetailEntries :entries="schema.schema as DetailSchema[]" :record="record" />
        </div>
    </div>
</template>
