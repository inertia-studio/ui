<script setup lang="ts">
import { computed } from 'vue';
import Select from '../../Select/Select.vue';
import type { SelectFilterSchema } from '../../../../shared/types/schema';

interface ExtendedSelectFilterSchema extends SelectFilterSchema {
    serverSearch?: boolean;
    relationship?: string;
    preload?: boolean;
}

const props = defineProps<{
    schema: ExtendedSelectFilterSchema;
    value: unknown;
    moduleSlug?: string;
    panelPath?: string;
}>();

const emit = defineEmits<{ change: [value: unknown] }>();

const panelPath = computed(() => props.panelPath ?? '/admin');

const searchUrl = computed(() =>
    props.schema.serverSearch && props.schema.relationship && props.moduleSlug
        ? `${panelPath.value}/${props.moduleSlug}/filter-options/${props.schema.name}`
        : undefined,
);

const currentValue = computed<string | string[] | null>(() => {
    if (props.schema.multiple) {
        return (props.value as string[] | null) ?? null;
    }
    return (props.value as string | null) ?? null;
});

function handleUpdate(v: string | string[] | null) {
    emit('change', v);
}
</script>

<template>
    <div class="flex flex-col gap-1.5">
        <span class="text-xs font-medium text-s-text-muted">{{ schema.label }}</span>
        <Select
            :model-value="currentValue"
            :options="schema.options"
            :searchable="schema.searchable"
            :multiple="schema.multiple"
            placeholder="All"
            :search-url="searchUrl"
            :preload="schema.preload"
            @update:model-value="handleUpdate"
        />
    </div>
</template>
