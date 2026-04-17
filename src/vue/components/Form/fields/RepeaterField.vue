<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { RepeaterFieldSchema } from '../../../../shared/types/schema';
import FormComponents from '../FormComponents.vue';

interface Props {
    schema: RepeaterFieldSchema;
    value: Array<Record<string, unknown>> | null;
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: Array<Record<string, unknown>>] }>();

const items = computed<Array<Record<string, unknown>>>(() => (Array.isArray(props.value) ? props.value : []));
const atMax = computed(() => props.schema.maxItems !== null && items.value.length >= props.schema.maxItems);
const atMin = computed(() => props.schema.minItems !== null && items.value.length <= props.schema.minItems);

function addItem() {
    if (atMax.value) return;
    emit('change', [...items.value, {} as Record<string, unknown>]);
}
function removeItem(index: number) {
    if (atMin.value) return;
    emit('change', items.value.filter((_, i) => i !== index));
}
function moveItem(from: number, to: number) {
    if (to < 0 || to >= items.value.length) return;
    const next = [...items.value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    emit('change', next);
}
function updateItem(index: number, name: string, val: unknown) {
    const updated = items.value.map((item, i) => (i === index ? { ...item, [name]: val } : item));
    emit('change', updated);
}
</script>

<template>
    <div :class="cn('space-y-3', error && 'ring-1 ring-red-500 rounded-lg p-2')">
        <div
            v-for="(item, index) in items"
            :key="index"
            class="rounded-lg border border-s-border bg-s-surface"
        >
            <div class="flex items-center justify-between border-b border-s-border px-3 py-2">
                <span class="text-xs font-medium text-s-text-muted">#{{ index + 1 }}</span>
                <div class="flex items-center gap-1">
                    <template v-if="schema.reorderable">
                        <button
                            type="button"
                            :disabled="schema.disabled || index === 0"
                            class="rounded p-1 text-s-text-faint hover:text-s-text-muted disabled:opacity-30"
                            aria-label="Move up"
                            @click="moveItem(index, index - 1)"
                        >
                            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            :disabled="schema.disabled || index === items.length - 1"
                            class="rounded p-1 text-s-text-faint hover:text-s-text-muted disabled:opacity-30"
                            aria-label="Move down"
                            @click="moveItem(index, index + 1)"
                        >
                            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                    </template>
                    <button
                        v-if="schema.deletable"
                        type="button"
                        :disabled="schema.disabled || atMin"
                        class="rounded p-1 text-s-text-faint hover:text-red-500 disabled:opacity-30"
                        aria-label="Remove item"
                        @click="removeItem(index)"
                    >
                        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            <div class="p-3">
                <FormComponents
                    :components="schema.schema"
                    :data="item"
                    :errors="{}"
                    @field-change="(name: string, val: unknown) => updateItem(index, name, val)"
                />
            </div>
        </div>

        <button
            v-if="schema.addable"
            type="button"
            :disabled="schema.disabled || atMax"
            class="inline-flex items-center gap-1 text-sm text-s-accent transition-colors hover:text-s-accent/80 disabled:opacity-50"
            @click="addItem"
        >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add item
        </button>
    </div>
</template>
