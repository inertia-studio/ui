<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../shared/utils/cn';
import SchemaIcon from '../Icon/SchemaIcon.vue';
import { detailEntryMap } from './entries';
import type { DetailEntrySchema } from '../../../shared/types/schema';

const props = defineProps<{
    schema: DetailEntrySchema;
    record: Record<string, unknown>;
}>();

function spanClass(span: number | 'full'): string {
    if (span === 'full') return 'col-span-full';
    if (typeof span === 'number' && span >= 2) return `col-span-${span}`;
    return '';
}

const value = computed(() => props.record[props.schema.name]);
const EntryComponent = computed(() => detailEntryMap[props.schema.type]);
const classes = computed(() => cn(spanClass(props.schema.columnSpan), 'px-5 py-4'));
</script>

<template>
    <template v-if="!schema.hidden">
        <div v-if="!EntryComponent" :class="classes">
            <dt class="text-xs font-medium uppercase tracking-wider text-s-text-faint mb-1.5">{{ schema.label }}</dt>
            <dd class="text-sm text-s-text-muted italic">Unknown type: {{ schema.type }}</dd>
        </div>
        <div v-else :class="classes">
            <dt class="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-s-text-faint mb-1.5">
                <SchemaIcon v-if="schema.icon" :schema="schema.icon" size="xs" class="text-s-text-faint" />
                {{ schema.label }}
            </dt>
            <dd class="text-sm text-s-text">
                <a
                    v-if="schema.url"
                    :href="schema.url"
                    class="text-s-accent hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <component :is="EntryComponent" :schema="schema" :value="value" />
                </a>
                <component v-else :is="EntryComponent" :schema="schema" :value="value" />
            </dd>
        </div>
    </template>
</template>
