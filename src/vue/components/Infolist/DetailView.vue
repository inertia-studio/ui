<script setup lang="ts">
import type { DetailSchema } from '../../../shared/types/schema';
import DetailEntries from './DetailEntries.vue';

defineProps<{
    schema: DetailSchema[];
    record: Record<string, unknown>;
}>();
</script>

<template>
    <div class="rounded-xl border border-s-border bg-s-surface overflow-hidden">
        <DetailEntries :entries="schema" :record="record" />
    </div>
</template>
