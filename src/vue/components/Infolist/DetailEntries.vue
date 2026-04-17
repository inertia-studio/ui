<script setup lang="ts">
import type {
    DetailSchema,
    DetailEntrySchema,
    SectionSchema,
} from '../../../shared/types/schema';
import DetailEntry from './DetailEntry.vue';
import DetailSection from './DetailSection.vue';

defineOptions({ name: 'DetailEntries' });

defineProps<{
    entries: DetailSchema[];
    record: Record<string, unknown>;
}>();
</script>

<template>
    <template v-for="(entry, index) in entries" :key="(entry as DetailEntrySchema).name ?? index">
        <DetailSection
            v-if="entry.type === 'section'"
            :schema="entry as SectionSchema"
            :record="record"
        />
        <DetailEntry
            v-else
            :schema="entry as DetailEntrySchema"
            :record="record"
        />
    </template>
</template>
