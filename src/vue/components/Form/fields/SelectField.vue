<script setup lang="ts">
import { computed } from 'vue';
import type { SelectFieldSchema } from '../../../../shared/types/schema';
import Select from '../../Select/Select.vue';

interface Props {
    schema: SelectFieldSchema;
    value: unknown;
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: unknown] }>();

const nativeOptions = computed(() =>
    Array.isArray(props.schema.options)
        ? props.schema.options
        : Object.entries(props.schema.options).map(([v, l]) => ({ value: v, label: l as string })),
);
</script>

<template>
    <select
        v-if="schema.native"
        :id="schema.name"
        :value="(value as string) ?? ''"
        :disabled="schema.disabled"
        class="w-full rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
        @change="emit('change', ($event.target as HTMLSelectElement).value || null)"
    >
        <option value="">{{ schema.placeholder ?? 'Select...' }}</option>
        <option v-for="opt in nativeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <Select
        v-else
        :model-value="schema.multiple ? (value as string[] | null) : (value as string | null)"
        :options="schema.options"
        :placeholder="schema.placeholder ?? 'Select...'"
        :searchable="schema.searchable"
        :multiple="schema.multiple"
        :disabled="schema.disabled"
        @update:model-value="emit('change', $event)"
    />
</template>
