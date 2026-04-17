<script setup lang="ts">
import { computed } from 'vue';
import { formatMoney } from '../../../../shared/utils/formatters';
import type { MoneyDetailSchema } from '../../../../shared/types/schema';

const props = defineProps<{
    schema: MoneyDetailSchema;
    value: unknown;
}>();

const numericValue = computed(() => (props.value == null ? NaN : Number(props.value)));
const isInvalid = computed(() => props.value == null || isNaN(numericValue.value));
const formatted = computed(() => formatMoney(numericValue.value, props.schema.currency, props.schema.locale ?? undefined));
</script>

<template>
    <span v-if="isInvalid" class="text-sm text-s-text-faint">--</span>
    <span v-else class="text-sm tabular-nums text-s-text">
        {{ formatted }}
    </span>
</template>
