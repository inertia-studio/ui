<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { ToggleButtonsFieldSchema } from '../../../../shared/types/schema';

interface Props {
    schema: ToggleButtonsFieldSchema;
    value: string | string[];
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: string | string[]] }>();

const entries = computed<[string, string][]>(
    () => Object.entries(props.schema.options) as [string, string][],
);

const selectedValues = computed<string[]>(() => {
    if (props.schema.multiple) {
        return Array.isArray(props.value) ? props.value : props.value ? [props.value as string] : [];
    }
    return [];
});

function handleClick(optValue: string) {
    if (props.schema.multiple) {
        const next = selectedValues.value.includes(optValue)
            ? selectedValues.value.filter((v) => v !== optValue)
            : [...selectedValues.value, optValue];
        emit('change', next);
    } else {
        emit('change', optValue);
    }
}

function isSelected(optValue: string): boolean {
    return props.schema.multiple ? selectedValues.value.includes(optValue) : props.value === optValue;
}
</script>

<template>
    <div
        :class="cn(
            'inline-flex',
            schema.grouped ? 'rounded-lg border border-s-border-strong divide-x divide-s-border' : 'gap-2',
            error && 'ring-1 ring-red-500',
        )"
    >
        <button
            v-for="([optValue, label], index) in entries"
            :key="optValue"
            type="button"
            :disabled="schema.disabled"
            :class="cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                schema.grouped
                    ? cn(
                          index === 0 && 'rounded-l-lg',
                          index === entries.length - 1 && 'rounded-r-lg',
                      )
                    : 'rounded-lg border border-s-border-strong',
                isSelected(optValue)
                    ? 'bg-s-accent text-white'
                    : 'bg-s-input text-s-text-secondary hover:bg-s-hover',
                schema.disabled && 'opacity-50 cursor-not-allowed',
            )"
            @click="handleClick(optValue)"
        >
            {{ label }}
        </button>
    </div>
</template>
