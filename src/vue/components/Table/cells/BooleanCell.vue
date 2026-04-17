<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import SchemaIcon from '../../Icon/SchemaIcon.vue';
import type { BooleanColumnSchema } from '../../../../shared/types/schema';

const props = defineProps<{
    schema: BooleanColumnSchema;
    value: unknown;
}>();

const isTruthy = computed(() => Boolean(props.value));
</script>

<template>
    <SchemaIcon
        v-if="isTruthy && schema.trueIcon"
        :schema="schema.trueIcon"
        size="sm"
        :class="cn('text-green-500')"
    />
    <SchemaIcon
        v-else-if="!isTruthy && schema.falseIcon"
        :schema="schema.falseIcon"
        size="sm"
        :class="cn('text-red-500')"
    />
    <svg
        v-else-if="isTruthy"
        :class="cn('h-5 w-5', 'text-green-500')"
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
        :class="cn('h-5 w-5', 'text-red-500')"
        fill="none"
        viewBox="0 0 24 24"
        :stroke-width="2"
        stroke="currentColor"
        aria-label="No"
    >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
</template>
