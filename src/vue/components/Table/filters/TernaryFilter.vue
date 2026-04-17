<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { TernaryFilterSchema } from '../../../../shared/types/schema';

const props = defineProps<{
    schema: TernaryFilterSchema;
    value: unknown;
}>();

const emit = defineEmits<{ change: [value: unknown] }>();

// Normalize: value from URL is a string, convert to boolean | null
const currentValue = computed<boolean | null>(() =>
    props.value === 'true' || props.value === true
        ? true
        : props.value === 'false' || props.value === false
            ? false
            : null,
);

const buttons = computed<Array<{ label: string; filterValue: boolean | null }>>(() => [
    { label: 'All', filterValue: null },
    { label: props.schema.trueLabel || 'Yes', filterValue: true },
    { label: props.schema.falseLabel || 'No', filterValue: false },
]);
</script>

<template>
    <div class="flex flex-col gap-1">
        <span class="text-xs font-medium text-s-text-muted">{{ schema.label }}</span>
        <div class="inline-flex rounded-lg border border-s-border bg-s-bg p-0.5">
            <button
                v-for="btn in buttons"
                :key="String(btn.filterValue)"
                type="button"
                :class="cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    currentValue === btn.filterValue
                        ? 'bg-s-input text-s-text shadow-sm'
                        : 'text-s-text-muted hover:text-s-text-secondary',
                )"
                @click="emit('change', btn.filterValue)"
            >
                {{ btn.label }}
            </button>
        </div>
    </div>
</template>
