<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '../../../shared/utils/cn';
import type { FormComponentSchema, TabsSchema } from '../../../shared/types/schema';
import SchemaIcon from '../Icon/SchemaIcon.vue';

defineProps<{ schema: TabsSchema }>();

defineSlots<{
    default(props: { schema: FormComponentSchema[] }): unknown;
}>();

const activeIndex = ref(0);
</script>

<template>
    <div class="col-span-full">
        <div class="border-b border-s-border">
            <nav class="-mb-px flex gap-4" aria-label="Tabs">
                <button
                    v-for="(tab, index) in schema.tabs"
                    :key="index"
                    type="button"
                    :class="cn(
                        'inline-flex items-center gap-1.5 border-b-2 px-1 py-2 text-sm font-medium transition-colors',
                        activeIndex === index
                            ? 'border-s-accent text-s-accent'
                            : 'border-transparent text-s-text-muted hover:border-gray-300 dark:hover:border-gray-600 hover:text-s-text-secondary',
                    )"
                    @click="activeIndex = index"
                >
                    <SchemaIcon v-if="tab.icon" :schema="tab.icon" size="sm" />
                    {{ tab.label }}
                    <span
                        v-if="tab.badge != null"
                        class="ml-1 inline-flex items-center rounded-full bg-s-surface-alt px-2 py-0.5 text-xs font-medium text-s-text-muted"
                    >{{ tab.badge }}</span>
                </button>
            </nav>
        </div>
        <div class="pt-4">
            <div v-if="schema.tabs[activeIndex]" class="grid grid-cols-1 gap-4">
                <slot :schema="schema.tabs[activeIndex].schema" />
            </div>
        </div>
    </div>
</template>
