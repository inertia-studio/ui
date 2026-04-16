<script setup lang="ts">
import { computed } from 'vue';
import type { BooleanDetailSchema } from '../../../../shared/types/schema';

const props = defineProps<{
    schema: BooleanDetailSchema;
    value: unknown;
}>();

const isTruthy = computed(() => Boolean(props.value));
</script>

<template>
    <svg
        v-if="isTruthy"
        class="h-5 w-5 text-green-500"
        fill="none"
        viewBox="0 0 24 24"
        :stroke-width="2"
        stroke="currentColor"
        aria-label="Yes"
    >
        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
    <svg
        v-else
        class="h-5 w-5 text-red-500"
        fill="none"
        viewBox="0 0 24 24"
        :stroke-width="2"
        stroke="currentColor"
        aria-label="No"
    >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
</template>
