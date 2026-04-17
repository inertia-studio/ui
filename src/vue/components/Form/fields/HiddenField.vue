<script setup lang="ts">
import type { HiddenFieldSchema } from '../../../../shared/types/schema';

interface Props {
    schema: HiddenFieldSchema;
    value: unknown;
    error?: string | null;
}

defineProps<Props>();
defineEmits<{ change: [value: unknown] }>();
</script>

<template>
    <input type="hidden" :name="schema.name" :value="String(value ?? '')" />
</template>
