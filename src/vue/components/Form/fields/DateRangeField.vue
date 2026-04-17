<script setup lang="ts">
import { computed } from 'vue';
import type { DateRangeFieldSchema } from '../../../../shared/types/schema';
import DateRangePicker from '../../DatePicker/DateRangePicker.vue';

interface Props {
    schema: DateRangeFieldSchema;
    value: unknown;
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: unknown] }>();

const range = computed(() => props.value as { from: string | null; to: string | null } | null);
</script>

<template>
    <DateRangePicker
        :model-value="range"
        :disabled="schema.disabled"
        @update:model-value="emit('change', $event)"
    />
</template>
