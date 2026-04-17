<script setup lang="ts">
import type { IconSchema } from '../../../shared/types/schema';
import Icon from './Icon.vue';

interface Props {
    schema: IconSchema | null;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    class?: string;
}

defineProps<Props>();
</script>

<template>
    <Icon
        v-if="schema"
        :name="schema.name"
        :provider="schema.provider ?? undefined"
        :variant="schema.variant ?? undefined"
        :size="size"
        :class="$props.class"
    />
</template>
