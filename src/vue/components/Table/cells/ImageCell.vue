<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { ImageColumnSchema } from '../../../../shared/types/schema';

const props = defineProps<{
    schema: ImageColumnSchema;
    value: unknown;
}>();

const src = computed(() => {
    if (!props.value) return '';
    const raw = String(props.value);
    // If it's a relative path (not a URL), prepend /storage/
    return raw.startsWith('http') || raw.startsWith('/') ? raw : `/storage/${raw}`;
});

const width = computed(() => props.schema.width ?? '40px');
const height = computed(() => props.schema.height ?? '40px');
</script>

<template>
    <span v-if="!value" class="text-s-text-faint">—</span>
    <img
        v-else
        :src="src"
        alt=""
        :class="cn(
            'object-cover',
            schema.circular && 'rounded-full',
            schema.square && 'rounded-md',
            !schema.circular && !schema.square && 'rounded-md',
        )"
        :style="{ width, height }"
        loading="lazy"
    />
</template>
