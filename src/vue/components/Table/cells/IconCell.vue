<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import SchemaIcon from '../../Icon/SchemaIcon.vue';
import type { IconColumnSchema, IconSchema } from '../../../../shared/types/schema';

const props = defineProps<{
    schema: IconColumnSchema;
    value: unknown;
}>();

const sizeMap: Record<string, 'xs' | 'sm' | 'md' | 'lg' | 'xl'> = {
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
};

const stringValue = computed(() => (props.value ? String(props.value) : ''));
const color = computed(() => props.schema.colors[stringValue.value] ?? undefined);
const iconSize = computed<'xs' | 'sm' | 'md' | 'lg' | 'xl'>(() => (props.schema.size ? sizeMap[props.schema.size] ?? 'md' : 'md'));
const iconSchema = computed<IconSchema>(() => ({
    name: stringValue.value,
    provider: 'heroicons',
    variant: null,
}));
</script>

<template>
    <span v-if="!value" class="text-s-text-faint">—</span>
    <SchemaIcon
        v-else
        :schema="iconSchema"
        :size="iconSize"
        :class="cn(color === 'danger' ? 'text-red-500' : color === 'success' ? 'text-green-500' : color === 'warning' ? 'text-amber-500' : color === 'primary' ? 'text-s-accent' : '')"
    />
</template>
