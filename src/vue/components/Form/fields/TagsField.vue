<script setup lang="ts">
import { computed, ref } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { TagsFieldSchema } from '../../../../shared/types/schema';
import { inputClasses } from './_shared';

interface Props {
    schema: TagsFieldSchema;
    value: string[];
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: string[]] }>();

const input = ref('');

const tags = computed<string[]>(() => (Array.isArray(props.value) ? props.value : []));
const separator = computed(() => props.schema.separator || ',');

function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !tags.value.includes(trimmed)) {
        emit('change', [...tags.value, trimmed]);
    }
    input.value = '';
}

function removeTag(index: number) {
    emit('change', tags.value.filter((_, i) => i !== index));
}

function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === separator.value) {
        e.preventDefault();
        addTag(input.value);
    } else if (e.key === 'Backspace' && input.value === '' && tags.value.length > 0) {
        removeTag(tags.value.length - 1);
    }
}

function handleBlur() {
    if (input.value) addTag(input.value);
}
</script>

<template>
    <div
        :class="cn(
            inputClasses,
            'flex flex-wrap items-center gap-1.5',
            error && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500',
        )"
    >
        <span
            v-for="(tag, index) in tags"
            :key="`${tag}-${index}`"
            class="inline-flex items-center gap-1 rounded-full bg-s-accent/10 px-2.5 py-0.5 text-xs font-medium text-s-accent"
        >
            {{ tag }}
            <button
                v-if="!schema.disabled"
                type="button"
                class="text-s-accent/60 hover:text-s-accent"
                :aria-label="`Remove ${tag}`"
                @click="removeTag(index)"
            >
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </span>
        <input
            :id="schema.name"
            type="text"
            :value="input"
            :placeholder="tags.length === 0 ? (schema.placeholder ?? 'Add tag...') : ''"
            :disabled="schema.disabled"
            class="flex-1 border-0 bg-transparent p-0 text-sm text-s-text focus:outline-none focus:ring-0"
            @input="input = ($event.target as HTMLInputElement).value"
            @keydown="handleKeyDown"
            @blur="handleBlur"
        />
    </div>
</template>
