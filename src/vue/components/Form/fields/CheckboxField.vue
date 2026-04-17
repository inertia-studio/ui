<script setup lang="ts">
import { cn } from '../../../../shared/utils/cn';
import type { CheckboxFieldSchema } from '../../../../shared/types/schema';

interface Props {
    schema: CheckboxFieldSchema;
    value: boolean;
    error?: string | null;
}

defineProps<Props>();
const emit = defineEmits<{ change: [value: boolean] }>();
</script>

<template>
    <label :class="cn('inline-flex items-center gap-2', schema.disabled && 'opacity-50 cursor-not-allowed')">
        <input
            :id="schema.name"
            type="checkbox"
            :checked="!!value"
            :disabled="schema.disabled"
            class="h-4 w-4 rounded border-s-border-strong text-s-accent focus:ring-s-accent/30 bg-s-input"
            @change="emit('change', ($event.target as HTMLInputElement).checked)"
        />
        <span v-if="schema.label" class="text-sm text-s-text-secondary">{{ schema.label }}</span>
    </label>
</template>
