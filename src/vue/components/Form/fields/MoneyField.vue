<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { MoneyFieldSchema } from '../../../../shared/types/schema';
import { inputClasses } from './_shared';

interface Props {
    schema: MoneyFieldSchema;
    value: number | null;
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: number | null] }>();

const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '\u20AC',
    GBP: '\u00A3',
    JPY: '\u00A5',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '\u00A5',
    INR: '\u20B9',
    BRL: 'R$',
};

const symbol = computed(() => currencySymbols[props.schema.currency] ?? props.schema.currency);

function handleInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    emit('change', raw === '' ? null : Number(raw));
}
</script>

<template>
    <div class="flex">
        <span class="inline-flex items-center rounded-l-lg border border-r-0 border-s-border-strong bg-s-bg px-3 text-sm text-s-text-muted">{{ symbol }}</span>
        <input
            :id="schema.name"
            type="number"
            :value="value ?? ''"
            :placeholder="schema.placeholder ?? '0.00'"
            :disabled="schema.disabled"
            step="0.01"
            :class="cn(
                inputClasses,
                'rounded-l-none',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            )"
            @input="handleInput"
        />
    </div>
</template>
