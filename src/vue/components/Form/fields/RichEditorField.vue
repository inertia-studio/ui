<script setup lang="ts">
import type { RichEditorFieldSchema } from '../../../../shared/types/schema';

interface Props {
    schema: RichEditorFieldSchema;
    value: string | null;
    error?: string | null;
}

defineProps<Props>();
defineEmits<{ change: [value: string] }>();
</script>

<template>
    <div
        :id="schema.name"
        class="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-s-border-strong bg-s-bg px-4 py-8 text-center"
    >
        <div>
            <p class="text-sm font-medium text-s-text-muted">Rich Editor</p>
            <p class="mt-1 text-xs text-s-text-faint">Requires Tiptap integration</p>
        </div>
    </div>
</template>
