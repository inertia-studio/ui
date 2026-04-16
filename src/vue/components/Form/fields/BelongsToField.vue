<script setup lang="ts">
import Select from '../../Select/Select.vue';
import type { BelongsToFieldSchema } from '../../../../shared/types/schema';

interface Props {
    schema: BelongsToFieldSchema;
    value: unknown;
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: unknown] }>();

function getSearchUrl(fieldName: string): string | undefined {
    if (typeof window === 'undefined') return undefined;
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    const createIdx = parts.indexOf('create');
    const editIdx = parts.indexOf('edit');

    let moduleSegments: string[];
    if (createIdx > 0) moduleSegments = parts.slice(0, createIdx);
    else if (editIdx > 0) moduleSegments = parts.slice(0, editIdx - 1);
    else moduleSegments = parts.slice(0, -1);

    return '/' + moduleSegments.join('/') + '/relation-options/' + fieldName;
}

const searchUrl = getSearchUrl(props.schema.name);
</script>

<template>
    <Select
        :model-value="schema.multiple ? (value as string[] | null) : (value as string | null)"
        :placeholder="schema.placeholder ?? 'Select...'"
        :searchable="schema.searchable"
        :multiple="schema.multiple"
        :disabled="schema.disabled"
        :search-url="searchUrl"
        :preload="schema.preload"
        @update:model-value="emit('change', $event)"
    />
</template>
