<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { StepperFieldSchema } from '../../../../shared/types/schema';

interface Props {
    schema: StepperFieldSchema;
    value: number | null;
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: number] }>();

const inputClasses =
    'w-full border-y border-s-border-strong bg-s-input px-3 py-2 text-center text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30 disabled:opacity-50 disabled:cursor-not-allowed';

const current = computed(() => props.value ?? 0);
const atMin = computed(() => props.schema.min !== null && current.value <= (props.schema.min as number));
const atMax = computed(() => props.schema.max !== null && current.value >= (props.schema.max as number));

function decrement() {
    const next = current.value - props.schema.step;
    if (props.schema.min !== null && next < props.schema.min) return;
    emit('change', next);
}

function increment() {
    const next = current.value + props.schema.step;
    if (props.schema.max !== null && next > props.schema.max) return;
    emit('change', next);
}

function handleInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    if (raw === '') return;
    const num = Number(raw);
    if (props.schema.min !== null && num < props.schema.min) return;
    if (props.schema.max !== null && num > props.schema.max) return;
    emit('change', num);
}
</script>

<template>
    <div class="inline-flex">
        <button
            type="button"
            :disabled="schema.disabled || atMin"
            :class="cn(
                'inline-flex items-center rounded-l-lg border border-s-border-strong px-3 py-2 text-sm text-s-text-muted transition-colors hover:bg-s-hover',
                'disabled:opacity-50 disabled:cursor-not-allowed',
            )"
            aria-label="Decrease"
            @click="decrement"
        >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
            </svg>
        </button>
        <input
            :id="schema.name"
            type="number"
            :value="current"
            :disabled="schema.disabled"
            :min="schema.min ?? undefined"
            :max="schema.max ?? undefined"
            :step="schema.step"
            :class="cn(
                inputClasses,
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            )"
            @input="handleInput"
        />
        <button
            type="button"
            :disabled="schema.disabled || atMax"
            :class="cn(
                'inline-flex items-center rounded-r-lg border border-s-border-strong px-3 py-2 text-sm text-s-text-muted transition-colors hover:bg-s-hover',
                'disabled:opacity-50 disabled:cursor-not-allowed',
            )"
            aria-label="Increase"
            @click="increment"
        >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
    </div>
</template>
