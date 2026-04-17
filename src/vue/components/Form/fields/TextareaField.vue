<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { TextareaFieldSchema } from '../../../../shared/types/schema';
import { inputClasses } from './_shared';

interface Props {
    schema: TextareaFieldSchema;
    value: string | null;
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: string] }>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

function handleChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    emit('change', target.value);

    if (props.schema.autosize && textareaRef.value) {
        textareaRef.value.style.height = 'auto';
        textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
    }
}
</script>

<template>
    <div class="relative">
        <textarea
            :id="schema.name"
            ref="textareaRef"
            :value="value ?? ''"
            :placeholder="schema.placeholder ?? undefined"
            :disabled="schema.disabled"
            :rows="schema.rows"
            :maxlength="schema.maxLength ?? undefined"
            :class="cn(
                inputClasses,
                schema.autosize && 'resize-none overflow-hidden',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            )"
            @input="handleChange"
        />
        <span v-if="schema.maxLength !== null" class="absolute bottom-2 right-2 text-xs text-s-text-faint">{{ (value ?? '').length }}/{{ schema.maxLength }}</span>
    </div>
</template>
