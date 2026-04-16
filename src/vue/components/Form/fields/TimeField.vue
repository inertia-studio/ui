<script setup lang="ts">
import { cn } from '../../../../shared/utils/cn';
import type { TimeFieldSchema } from '../../../../shared/types/schema';
import { inputClasses } from './_shared';

interface Props {
    schema: TimeFieldSchema;
    value: string;
    error?: string | null;
}

defineProps<Props>();
const emit = defineEmits<{ change: [value: string] }>();
</script>

<template>
    <input
        :id="schema.name"
        type="time"
        :value="value ?? ''"
        :disabled="schema.disabled"
        :step="schema.seconds ? 1 : undefined"
        :class="cn(
            inputClasses,
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
        )"
        @input="emit('change', ($event.target as HTMLInputElement).value)"
    />
</template>
