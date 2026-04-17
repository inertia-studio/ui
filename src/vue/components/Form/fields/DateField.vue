<script setup lang="ts">
import type { DateFieldSchema } from '../../../../shared/types/schema';
import DatePicker from '../../DatePicker/DatePicker.vue';

interface Props {
    schema: DateFieldSchema;
    value: string;
    error?: string | null;
}

defineProps<Props>();
const emit = defineEmits<{ change: [value: string] }>();
</script>

<template>
    <input
        v-if="schema.withTime"
        :id="schema.name"
        type="datetime-local"
        :value="value ?? ''"
        :disabled="schema.disabled"
        :min="schema.minDate ?? undefined"
        :max="schema.maxDate ?? undefined"
        class="w-full rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
        @input="emit('change', ($event.target as HTMLInputElement).value)"
    />
    <DatePicker
        v-else
        :model-value="value || null"
        :disabled="schema.disabled"
        @update:model-value="emit('change', $event ?? '')"
    />
</template>
