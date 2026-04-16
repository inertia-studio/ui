<script setup lang="ts">
import { cn } from '../../../../shared/utils/cn';
import type { NumberFieldSchema } from '../../../../shared/types/schema';
import { inputClasses } from './_shared';

interface Props {
    schema: NumberFieldSchema;
    value: number | null;
    error?: string | null;
}

defineProps<Props>();
const emit = defineEmits<{ change: [value: number | null] }>();

function handleInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    emit('change', raw === '' ? null : Number(raw));
}
</script>

<template>
    <div class="flex">
        <span v-if="schema.prefix" class="inline-flex items-center rounded-l-lg border border-r-0 border-s-border-strong bg-s-bg px-3 text-sm text-s-text-muted">{{ schema.prefix }}</span>
        <input
            :id="schema.name"
            type="number"
            :value="value ?? ''"
            :placeholder="schema.placeholder ?? undefined"
            :disabled="schema.disabled"
            :min="schema.min ?? undefined"
            :max="schema.max ?? undefined"
            :step="schema.step ?? undefined"
            :class="cn(
                inputClasses,
                schema.prefix && 'rounded-l-none',
                schema.suffix && 'rounded-r-none',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            )"
            @input="handleInput"
        />
        <span v-if="schema.suffix" class="inline-flex items-center rounded-r-lg border border-l-0 border-s-border-strong bg-s-bg px-3 text-sm text-s-text-muted">{{ schema.suffix }}</span>
    </div>
</template>
