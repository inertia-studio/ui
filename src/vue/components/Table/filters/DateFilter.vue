<script setup lang="ts">
import { computed } from 'vue';
import DateRangePicker from '../../DatePicker/DateRangePicker.vue';
import type { DateFilterSchema } from '../../../../shared/types/schema';

const props = defineProps<{
    schema: DateFilterSchema;
    value: unknown;
}>();

const emit = defineEmits<{ change: [value: unknown] }>();

const range = computed(() => (props.value as { from: string | null; to: string | null } | null) ?? null);

function handleUpdate(v: { from: string | null; to: string | null } | null) {
    emit('change', v);
}
</script>

<template>
    <div class="flex flex-col gap-1.5">
        <span class="text-xs font-medium text-s-text-muted">{{ schema.label }}</span>
        <DateRangePicker
            :model-value="range"
            @update:model-value="handleUpdate"
        />
    </div>
</template>
