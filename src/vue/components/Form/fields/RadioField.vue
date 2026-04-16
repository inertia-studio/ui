<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { RadioFieldSchema } from '../../../../shared/types/schema';

interface Props {
    schema: RadioFieldSchema;
    value: string;
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: string] }>();

const entries = computed<[string, string][]>(
    () => Object.entries(props.schema.options) as [string, string][],
);
</script>

<template>
    <div :class="cn('flex gap-3', schema.inline ? 'flex-row flex-wrap' : 'flex-col')">
        <label
            v-for="[optValue, label] in entries"
            :key="optValue"
            :class="cn(
                'inline-flex items-center gap-2',
                schema.disabled && 'opacity-50 cursor-not-allowed',
            )"
        >
            <input
                type="radio"
                :name="schema.name"
                :value="optValue"
                :checked="value === optValue"
                :disabled="schema.disabled"
                class="h-4 w-4 border-s-border-strong text-s-accent focus:ring-s-accent/30 bg-s-input"
                @change="emit('change', optValue)"
            />
            <span class="text-sm text-s-text-secondary">{{ label }}</span>
        </label>
    </div>
</template>
