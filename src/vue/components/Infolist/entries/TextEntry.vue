<script setup lang="ts">
import { computed, ref } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import { formatDate, formatDateTime, formatMoney } from '../../../../shared/utils/formatters';
import type { TextDetailSchema } from '../../../../shared/types/schema';

const props = defineProps<{
    schema: TextDetailSchema;
    value: unknown;
}>();

const weightClasses: Record<string, string> = {
    thin: 'font-thin',
    extralight: 'font-extralight',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
};

function formatValue(value: unknown, schema: TextDetailSchema): string {
    if (value == null) {
        return '';
    }

    const raw = String(value);

    if (schema.formatAs === 'dateTime') {
        return formatDateTime(raw, (schema.formatOptions as Intl.DateTimeFormatOptions) ?? undefined);
    }

    if (schema.formatAs === 'date') {
        return formatDate(raw, (schema.formatOptions as Intl.DateTimeFormatOptions) ?? undefined);
    }

    if (schema.formatAs === 'money') {
        const currency = (schema.formatOptions?.currency as string) ?? 'USD';
        const locale = (schema.formatOptions?.locale as string) ?? undefined;
        return formatMoney(Number(value), currency, locale);
    }

    return raw;
}

function truncateText(text: string, limit: number | null): string {
    if (limit != null && limit > 0 && text.length > limit) {
        return text.slice(0, limit) + '...';
    }

    return text;
}

const copied = ref(false);

const formatted = computed(() => formatValue(props.value, props.schema));
const displayText = computed(() => truncateText(formatted.value, props.schema.limit));

async function handleCopy() {
    if (!props.schema.copyable) {
        return;
    }
    try {
        await navigator.clipboard.writeText(formatted.value);
        copied.value = true;
        setTimeout(() => {
            copied.value = false;
        }, 2000);
    } catch {
        // Clipboard API not available
    }
}
</script>

<template>
    <span v-if="!displayText" class="text-sm text-s-text-faint">--</span>
    <div v-else class="flex items-center gap-2">
        <span
            :class="cn(
                'text-sm text-s-text',
                schema.weight && weightClasses[schema.weight],
            )"
        >
            {{ displayText }}
        </span>
        <button
            v-if="schema.copyable"
            type="button"
            class="inline-flex shrink-0 items-center rounded p-0.5 text-s-text-faint transition-colors hover:text-s-text-muted"
            :title="copied ? 'Copied!' : 'Copy to clipboard'"
            @click="handleCopy"
        >
            <svg
                v-if="copied"
                class="h-4 w-4 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                :stroke-width="2"
                stroke="currentColor"
                aria-hidden="true"
            >
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <svg
                v-else
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                :stroke-width="2"
                stroke="currentColor"
                aria-hidden="true"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                />
            </svg>
        </button>
    </div>
</template>
