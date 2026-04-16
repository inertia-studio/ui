<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';
import { cn } from '../../../shared/utils/cn';

interface Props {
    open: boolean;
    heading?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDangerous?: boolean;
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    heading: 'Confirm Action',
    message: 'Are you sure you want to continue?',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    isDangerous: false,
    loading: false,
});

const emit = defineEmits<{ close: []; confirm: [] }>();

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
        <div
            class="fixed inset-0 bg-black/50 transition-opacity"
            aria-hidden="true"
            @click="emit('close')"
        />
        <div class="relative z-10 w-full max-w-md rounded-xl bg-s-surface p-6 shadow-2xl dark:shadow-gray-900/50">
            <div class="flex items-start gap-4">
                <div v-if="isDangerous" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                    <svg
                        class="h-5 w-5 text-red-600 dark:text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        :stroke-width="2"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                        />
                    </svg>
                </div>
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-s-text">{{ heading }}</h3>
                    <p class="mt-2 text-sm text-s-text-muted">{{ message }}</p>
                </div>
            </div>

            <div class="mt-6 flex justify-end gap-2">
                <button
                    type="button"
                    :disabled="loading"
                    class="rounded-lg border border-s-border-strong bg-s-input px-4 py-2 text-sm font-medium text-s-text-secondary transition-colors hover:bg-s-hover disabled:opacity-50"
                    @click="emit('close')"
                >{{ cancelLabel }}</button>
                <button
                    type="button"
                    :disabled="loading"
                    :class="cn(
                        'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
                        isDangerous ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-s-accent text-white hover:opacity-90',
                    )"
                    @click="emit('confirm')"
                >
                    <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {{ loading ? 'Processing...' : confirmLabel }}
                </button>
            </div>
        </div>
    </div>
</template>
