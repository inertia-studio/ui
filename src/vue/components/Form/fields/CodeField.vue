<script setup lang="ts">
import { computed, ref } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { FieldSchema } from '../../../../shared/types/schema';

interface Props {
    schema: FieldSchema;
    value: unknown;
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: unknown] }>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const language = computed(() => ((props.schema as unknown as Record<string, unknown>).language as string) ?? 'json');
const minLines = computed(() => ((props.schema as unknown as Record<string, unknown>).minLines as number) ?? 8);

function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const ta = e.currentTarget as HTMLTextAreaElement;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const current = String(props.value ?? '');
        const next = current.substring(0, start) + '  ' + current.substring(end);
        emit('change', next);
        requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = start + 2;
        });
    }
}

function onInput(e: Event) {
    emit('change', (e.target as HTMLTextAreaElement).value);
}
</script>

<template>
    <div class="relative">
        <div class="absolute top-2 right-2 z-10">
            <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded text-s-text-faint bg-s-surface-alt">
                {{ language }}
            </span>
        </div>
        <textarea
            ref="textareaRef"
            :value="String(value ?? '')"
            :rows="minLines"
            :spellcheck="false"
            :class="cn(
                'block w-full rounded-lg border px-4 py-3 text-sm shadow-sm transition-colors font-mono leading-relaxed resize-y',
                'bg-s-surface-alt text-s-text placeholder:text-s-text-faint',
                'focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
                'border-s-border-strong',
            )"
            :placeholder="schema.placeholder || `Enter ${language}...`"
            @input="onInput"
            @keydown="handleKeyDown"
        />
    </div>
</template>
