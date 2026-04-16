<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { KeyValueFieldSchema } from '../../../../shared/types/schema';
import { inputClasses } from './_shared';

interface Row { key: string; value: string }

interface Props {
    schema: KeyValueFieldSchema;
    value: Row[] | null;
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: Row[]] }>();

const rows = computed<Row[]>(() => (Array.isArray(props.value) ? props.value : []));

function updateRow(index: number, field: 'key' | 'value', newVal: string) {
    const updated = rows.value.map((row, i) => (i === index ? { ...row, [field]: newVal } : row));
    emit('change', updated);
}
function addRow() {
    emit('change', [...rows.value, { key: '', value: '' }]);
}
function removeRow(index: number) {
    emit('change', rows.value.filter((_, i) => i !== index));
}
</script>

<template>
    <div class="space-y-2">
        <div
            v-if="rows.length > 0"
            class="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-s-text-muted"
        >
            <span>{{ schema.keyLabel }}</span>
            <span>{{ schema.valueLabel }}</span>
            <span class="w-8" />
        </div>
        <div v-for="(row, index) in rows" :key="index" class="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input
                type="text"
                :value="row.key"
                :placeholder="schema.keyLabel"
                :disabled="schema.disabled"
                :class="cn(inputClasses, error && 'border-red-500')"
                @input="updateRow(index, 'key', ($event.target as HTMLInputElement).value)"
            />
            <input
                type="text"
                :value="row.value"
                :placeholder="schema.valueLabel"
                :disabled="schema.disabled"
                :class="cn(inputClasses, error && 'border-red-500')"
                @input="updateRow(index, 'value', ($event.target as HTMLInputElement).value)"
            />
            <button
                v-if="schema.deletable"
                type="button"
                :disabled="schema.disabled"
                class="inline-flex w-8 items-center justify-center text-s-text-faint transition-colors hover:text-red-500 disabled:opacity-50"
                aria-label="Remove row"
                @click="removeRow(index)"
            >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <button
            v-if="schema.addable"
            type="button"
            :disabled="schema.disabled"
            class="inline-flex items-center gap-1 text-sm text-s-accent transition-colors hover:text-s-accent/80 disabled:opacity-50"
            @click="addRow"
        >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add row
        </button>
    </div>
</template>
