<script setup lang="ts">
import { computed } from 'vue';
import { formatDate, formatDateTime } from '../../../../shared/utils/formatters';
import type { DateDetailSchema } from '../../../../shared/types/schema';

const props = defineProps<{
    schema: DateDetailSchema;
    value: unknown;
}>();

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) {
        return 'just now';
    }
    if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    if (diffWeeks < 5) {
        return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    }
    if (diffMonths < 12) {
        return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    }
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
}

const dateString = computed(() => (props.value ? String(props.value) : ''));
</script>

<template>
    <span v-if="!value" class="text-sm text-s-text-faint">--</span>
    <span v-else-if="schema.since" :title="formatDateTime(dateString)" class="text-sm text-s-text">
        {{ formatRelativeTime(dateString) }}
    </span>
    <span v-else-if="schema.format" class="text-sm text-s-text">
        {{ formatDateTime(dateString) }}
    </span>
    <span v-else class="text-sm text-s-text">
        {{ formatDate(dateString) }}
    </span>
</template>
