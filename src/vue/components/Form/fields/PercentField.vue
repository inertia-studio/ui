<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { PercentFieldSchema } from '../../../../shared/types/schema';
import { inputClasses } from './_shared';

interface Props {
    schema: PercentFieldSchema;
    value: number | null;
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: number | null] }>();

const step = computed(() => (props.schema.precision > 0 ? 1 / Math.pow(10, props.schema.precision) : 1));

function handleInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    emit('change', raw === '' ? null : Number(raw));
}
</script>

<template>
    <div class="flex">
        <input
            :id="schema.name"
            type="number"
            :value="value ?? ''"
            :placeholder="schema.placeholder ?? '0'"
            :disabled="schema.disabled"
            :min="0"
            :max="100"
            :step="step"
            :class="cn(
                inputClasses,
                'rounded-r-none',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            )"
            @input="handleInput"
        />
        <span class="inline-flex items-center rounded-r-lg border border-l-0 border-s-border-strong bg-s-bg px-3 text-sm text-s-text-muted">%</span>
    </div>
</template>
