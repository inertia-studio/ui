<script setup lang="ts">
import { computed } from 'vue';
import type { ColorColumnSchema } from '../../../../shared/types/schema';

const props = defineProps<{
    schema: ColorColumnSchema;
    value: unknown;
}>();

const color = computed(() => (props.value ? String(props.value) : ''));
</script>

<template>
    <span v-if="!value" class="text-s-text-faint">—</span>
    <div v-else class="flex items-center gap-2">
        <span
            class="inline-block h-5 w-5 shrink-0 rounded-full border border-s-border"
            :style="{ backgroundColor: color }"
            :aria-label="color"
        />
        <span class="text-xs text-s-text-muted">{{ color }}</span>
    </div>
</template>
