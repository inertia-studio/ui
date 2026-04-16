<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { BadgeColumnSchema } from '../../../../shared/types/schema';

const props = defineProps<{
    schema: BadgeColumnSchema;
    value: unknown;
}>();

const colorClasses: Record<string, string> = {
    primary: 'bg-s-accent/10 text-s-accent ring-s-accent/20',
    danger: 'bg-red-50 text-red-700 ring-red-600/20',
    warning: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    success: 'bg-green-50 text-green-700 ring-green-600/20',
    info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    gray: 'bg-s-surface-alt text-s-text-secondary ring-gray-600/20',
};

const stringValue = computed(() => (props.value == null ? '' : String(props.value)));
const classes = computed(() => {
    const color = props.schema.colors[stringValue.value] ?? 'gray';
    return colorClasses[color] ?? colorClasses.gray;
});
</script>

<template>
    <span v-if="value == null" class="text-s-text-faint">—</span>
    <span
        v-else
        :class="cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
            classes,
        )"
    >
        {{ stringValue }}
    </span>
</template>
