<script setup lang="ts">
import type { PlaceholderFieldSchema } from '../../../../shared/types/schema';

interface Props {
    schema: PlaceholderFieldSchema;
    value: unknown;
    error?: string | null;
}

defineProps<Props>();
defineEmits<{ change: [value: unknown] }>();
</script>

<template>
    <div class="rounded-lg bg-s-bg px-3 py-2 text-sm text-s-text-muted">{{ schema.content }}</div>
</template>
