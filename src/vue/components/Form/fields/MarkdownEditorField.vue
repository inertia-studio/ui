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

type ToolbarButton =
    | { label: string; action: string; wrap: [string, string] }
    | { label: string; action: string; prefix: string }
    | { label: string; action: string; insert: string };

const toolbarButtons: ToolbarButton[] = [
    { label: 'B', action: 'bold', wrap: ['**', '**'] },
    { label: 'I', action: 'italic', wrap: ['_', '_'] },
    { label: '~~', action: 'strike', wrap: ['~~', '~~'] },
    { label: '`', action: 'code', wrap: ['`', '`'] },
    { label: 'H1', action: 'h1', prefix: '# ' },
    { label: 'H2', action: 'h2', prefix: '## ' },
    { label: 'H3', action: 'h3', prefix: '### ' },
    { label: '•', action: 'ul', prefix: '- ' },
    { label: '1.', action: 'ol', prefix: '1. ' },
    { label: '>', action: 'quote', prefix: '> ' },
    { label: '---', action: 'hr', insert: '\n---\n' },
    { label: '[]', action: 'link', insert: '[text](url)' },
];

const minLines = computed(() => ((props.schema as unknown as Record<string, unknown>).minLines as number) ?? 8);
const preview = ref(false);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const text = computed(() => String(props.value ?? ''));

function applyFormat(button: ToolbarButton) {
    const ta = textareaRef.value;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const t = text.value;
    const selected = t.substring(start, end);

    let newText: string;
    let cursorPos: number;

    if ('wrap' in button) {
        newText = t.substring(0, start) + button.wrap[0] + (selected || 'text') + button.wrap[1] + t.substring(end);
        cursorPos = start + button.wrap[0].length + (selected || 'text').length;
    } else if ('prefix' in button) {
        const lineStart = t.lastIndexOf('\n', start - 1) + 1;
        newText = t.substring(0, lineStart) + button.prefix + t.substring(lineStart);
        cursorPos = start + button.prefix.length;
    } else {
        newText = t.substring(0, start) + button.insert + t.substring(end);
        cursorPos = start + button.insert.length;
    }

    emit('change', newText);
    requestAnimationFrame(() => {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = cursorPos;
    });
}

function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const ta = e.currentTarget as HTMLTextAreaElement;
        const start = ta.selectionStart;
        const newValue = text.value.substring(0, start) + '  ' + text.value.substring(ta.selectionEnd);
        emit('change', newValue);
        requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = start + 2;
        });
    }
}

function renderPreview(md: string): string {
    return md
        .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-1">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        .replace(/`(.+?)`/g, '<code class="bg-s-surface-alt px-1 rounded text-sm font-mono">$1</code>')
        .replace(/^> (.+)$/gm, '<blockquote class="border-l-3 border-s-border pl-3 text-s-text-muted">$1</blockquote>')
        .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
        .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
        .replace(/^---$/gm, '<hr class="border-s-border my-3">')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-s-accent underline">$1</a>')
        .replace(/\n/g, '<br>');
}

const previewHtml = computed(() => renderPreview(text.value) || '<span class="text-s-text-faint">Nothing to preview</span>');
</script>

<template>
    <div class="rounded-lg border border-s-border-strong overflow-hidden">
        <div class="flex items-center gap-0.5 px-2 py-1.5 border-b border-s-border bg-s-surface-alt">
            <button
                v-for="btn in toolbarButtons"
                :key="btn.action"
                type="button"
                :disabled="preview"
                class="px-1.5 py-0.5 rounded text-xs font-mono text-s-text-muted hover:text-s-text hover:bg-s-hover transition-colors disabled:opacity-40"
                :title="btn.action"
                @click="() => { if (!preview) applyFormat(btn); }"
            >{{ btn.label }}</button>

            <div class="flex-1" />

            <button
                type="button"
                :class="cn(
                    'px-2 py-0.5 rounded text-xs transition-colors',
                    preview ? 'bg-s-accent/10 text-s-accent font-medium' : 'text-s-text-muted hover:text-s-text',
                )"
                @click="preview = !preview"
            >{{ preview ? 'Edit' : 'Preview' }}</button>
        </div>

        <div
            v-if="preview"
            class="px-4 py-3 text-sm text-s-text-secondary leading-relaxed min-h-[8rem] bg-s-input"
            v-html="previewHtml"
        />
        <textarea
            v-else
            ref="textareaRef"
            :value="text"
            :rows="minLines"
            :spellcheck="false"
            class="block w-full px-4 py-3 text-sm leading-relaxed resize-y bg-s-input text-s-text placeholder:text-s-text-faint focus:outline-none font-mono"
            :placeholder="schema.placeholder || 'Write markdown...'"
            @input="emit('change', ($event.target as HTMLTextAreaElement).value)"
            @keydown="handleKeyDown"
        />
    </div>
</template>
