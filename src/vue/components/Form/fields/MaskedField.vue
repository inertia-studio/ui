<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { FieldSchema } from '../../../../shared/types/schema';

interface Props {
    schema: FieldSchema;
    value: unknown;
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: unknown] }>();

const PRESETS: Record<string, string> = {
    phone: '(999) 999-9999',
    creditCard: '9999 9999 9999 9999',
    ssn: '999-99-9999',
    zip: '99999',
    date: '99/99/9999',
    time: '99:99',
};

// 9 = digit, a = letter, * = any char
function applyMask(raw: string, mask: string): string {
    let result = '';
    let rawIdx = 0;

    for (let i = 0; i < mask.length && rawIdx < raw.length; i++) {
        const m = mask[i];
        if (m === '9') {
            while (rawIdx < raw.length && !/\d/.test(raw[rawIdx])) rawIdx++;
            if (rawIdx < raw.length) { result += raw[rawIdx]; rawIdx++; }
        } else if (m === 'a') {
            while (rawIdx < raw.length && !/[a-zA-Z]/.test(raw[rawIdx])) rawIdx++;
            if (rawIdx < raw.length) { result += raw[rawIdx]; rawIdx++; }
        } else if (m === '*') {
            result += raw[rawIdx];
            rawIdx++;
        } else {
            result += m;
        }
    }

    return result;
}

const mask = computed(() => {
    const preset = (props.schema as Record<string, unknown>).preset as string | null;
    const customMask = (props.schema as Record<string, unknown>).mask as string | null;
    return customMask || (preset ? PRESETS[preset] : null) || '';
});

const displayValue = computed(() => {
    if (!mask.value) return String(props.value ?? '');
    return applyMask(String(props.value ?? ''), mask.value);
});

function handleChange(e: Event) {
    const input = (e.target as HTMLInputElement).value;
    if (!mask.value) {
        emit('change', input);
        return;
    }
    const raw = input.replace(/[^a-zA-Z0-9]/g, '');
    emit('change', raw);
}
</script>

<template>
    <input
        type="text"
        :value="displayValue"
        :placeholder="mask || schema.placeholder || ''"
        :class="cn(
            'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors font-mono',
            'bg-s-input text-s-text placeholder:text-s-text-faint',
            'focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
            'border-s-border-strong',
        )"
        @input="handleChange"
    />
</template>
