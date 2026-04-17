<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue';
import FormRenderer from './FormRenderer.vue';
import type { FormSchema } from '../../../shared/types/schema';

interface Props {
    open: boolean;
    schema: FormSchema;
    record?: Record<string, unknown>;
    panelPath: string;
    moduleSlug: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();

const heading = computed(() => (props.record ? 'Edit Record' : 'Create Record'));

function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') emit('close');
}

watch(
    () => props.open,
    (o) => {
        if (o) document.addEventListener('keydown', handleKeydown);
        else document.removeEventListener('keydown', handleKeydown);
    },
    { immediate: true },
);

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/50 transition-opacity" aria-hidden="true" @click="emit('close')" />
        <div class="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-s-surface p-6 shadow-2xl dark:shadow-gray-900/50">
            <div class="mb-4 flex items-center justify-between">
                <h3 class="text-lg font-semibold text-s-text">{{ heading }}</h3>
                <button
                    type="button"
                    class="rounded-lg p-1.5 text-s-text-faint transition-colors hover:bg-s-hover hover:text-s-text-muted"
                    @click="emit('close')"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <FormRenderer
                :schema="schema"
                :record="record"
                :module="{ slug: moduleSlug }"
                :panel-path="panelPath"
                @success="emit('close')"
            />
        </div>
    </div>
</template>
