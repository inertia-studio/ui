<script setup lang="ts">
import { computed, ref } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { CheckboxListFieldSchema } from '../../../../shared/types/schema';

interface Props {
    schema: CheckboxListFieldSchema;
    value: string[];
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: string[]] }>();

const search = ref('');

const selected = computed<string[]>(() => (Array.isArray(props.value) ? props.value : []));

const entries = computed<[string, string][]>(
    () => Object.entries(props.schema.options) as [string, string][],
);

const filtered = computed<[string, string][]>(() => {
    if (!props.schema.searchable || search.value === '') return entries.value;
    const lower = search.value.toLowerCase();
    return entries.value.filter(([, label]) => label.toLowerCase().includes(lower));
});

function toggle(optValue: string) {
    const next = selected.value.includes(optValue)
        ? selected.value.filter((v) => v !== optValue)
        : [...selected.value, optValue];
    emit('change', next);
}
</script>

<template>
    <div>
        <input
            v-if="schema.searchable"
            type="text"
            :value="search"
            placeholder="Search..."
            :class="cn(
                'mb-2 w-full rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-s-text focus:border-s-accent focus:ring-1 focus:ring-s-accent/30',
                error && 'border-red-500',
            )"
            @input="search = ($event.target as HTMLInputElement).value"
        />
        <div
            :class="cn(
                'grid gap-2',
                schema.columns === 1 && 'grid-cols-1',
                schema.columns === 2 && 'grid-cols-2',
                schema.columns === 3 && 'grid-cols-3',
                schema.columns >= 4 && 'grid-cols-4',
            )"
        >
            <label
                v-for="[optValue, label] in filtered"
                :key="optValue"
                :class="cn(
                    'inline-flex items-center gap-2',
                    schema.disabled && 'opacity-50 cursor-not-allowed',
                )"
            >
                <input
                    type="checkbox"
                    :checked="selected.includes(optValue)"
                    :disabled="schema.disabled"
                    class="h-4 w-4 rounded border-s-border-strong text-s-accent focus:ring-s-accent/30 bg-s-input"
                    @change="toggle(optValue)"
                />
                <span class="text-sm text-s-text-secondary">{{ label }}</span>
            </label>
        </div>
    </div>
</template>
