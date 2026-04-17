<script setup lang="ts">
import { cn } from '../../../shared/utils/cn';
import SchemaIcon from '../Icon/SchemaIcon.vue';
import type { ListTabSchema } from '../../../shared/types/schema';

defineProps<{
    tabs: ListTabSchema[];
    activeTab: string;
}>();

defineEmits<{ 'tab-change': [slug: string] }>();
</script>

<template>
    <div class="border-b border-s-border">
        <nav class="-mb-px flex gap-4 overflow-x-auto" aria-label="Tabs">
            <button
                v-for="tab in tabs"
                :key="tab.slug"
                type="button"
                :class="cn(
                    'inline-flex shrink-0 items-center gap-1.5 border-b-2 px-1 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                    activeTab === tab.slug
                        ? 'border-s-accent text-s-accent'
                        : 'border-transparent text-s-text-muted hover:border-gray-300 dark:hover:border-gray-600 hover:text-s-text-secondary',
                )"
                :aria-current="activeTab === tab.slug ? 'page' : undefined"
                @click="$emit('tab-change', tab.slug)"
            >
                <SchemaIcon
                    v-if="tab.icon"
                    :schema="tab.icon"
                    size="sm"
                    :class="activeTab === tab.slug ? 'text-s-accent' : 'text-s-text-faint'"
                />
                {{ tab.label }}
                <span
                    v-if="tab.badge != null"
                    :class="cn(
                        'ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        activeTab === tab.slug ? 'bg-s-accent/10 text-s-accent' : 'bg-s-surface-alt text-s-text-muted',
                    )"
                >{{ tab.badge }}</span>
            </button>
        </nav>
    </div>
</template>
