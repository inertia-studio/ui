<script setup lang="ts">
import { computed } from 'vue';
import { formatMoney } from '../../../../shared/utils/formatters';
import type { MoneyColumnSchema } from '../../../../shared/types/schema';

const props = defineProps<{
    schema: MoneyColumnSchema;
    value: unknown;
}>();

const numericValue = computed(() => (props.value == null ? NaN : Number(props.value)));
const isInvalid = computed(() => props.value == null || isNaN(numericValue.value));
const formatted = computed(() => formatMoney(numericValue.value, props.schema.currency, props.schema.locale ?? undefined));
</script>

<template>
    <span v-if="isInvalid" class="text-s-text-faint">—</span>
    <span v-else class="whitespace-nowrap tabular-nums">{{ formatted }}</span>
</template>
