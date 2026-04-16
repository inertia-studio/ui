<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { ImageDetailSchema } from '../../../../shared/types/schema';

const props = defineProps<{
    schema: ImageDetailSchema;
    value: unknown;
}>();

const src = computed(() => (props.value ? String(props.value) : ''));
const width = computed(() => props.schema.width ?? '80px');
const height = computed(() => props.schema.height ?? '80px');
</script>

<template>
    <span v-if="!value" class="text-sm text-s-text-faint">--</span>
    <img
        v-else
        :src="src"
        alt=""
        :class="cn(
            'object-cover',
            schema.circular ? 'rounded-full' : 'rounded-lg',
        )"
        :style="{ width, height }"
        loading="lazy"
    />
</template>
