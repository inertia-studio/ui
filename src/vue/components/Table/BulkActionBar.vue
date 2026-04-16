<script setup lang="ts">
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { cn } from '../../../shared/utils/cn';
import SchemaIcon from '../Icon/SchemaIcon.vue';
import type { ActionSchema } from '../../../shared/types/schema';

interface Props {
    selectedIds: Array<string | number>;
    actions: ActionSchema[];
    panelPath: string;
    module: { slug: string };
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'clear-selection': [] }>();

const colorClasses: Record<string, string> = {
    primary: 'bg-s-accent text-white hover:opacity-90',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
    success: 'bg-green-600 text-white hover:bg-green-700',
    info: 'bg-blue-600 text-white hover:bg-blue-700',
    gray: 'bg-gray-600 text-white hover:bg-gray-700',
};

const confirmingAction = ref<ActionSchema | null>(null);
const processing = ref(false);

function executeAction(action: ActionSchema) {
    if (action.requiresConfirmation && !confirmingAction.value) {
        confirmingAction.value = action;
        return;
    }
    processing.value = true;
    confirmingAction.value = null;

    const url = action.url ?? `${props.panelPath}/${props.module.slug}/bulk-actions/${action.name}`;
    router.post(url, { ids: props.selectedIds } as never, {
        preserveState: true,
        preserveScroll: true,
        onFinish: () => {
            processing.value = false;
            emit('clear-selection');
        },
    });
}
</script>

<template>
    <template v-if="selectedIds.length > 0 && actions.length > 0">
        <div class="fixed inset-x-0 bottom-6 z-30 flex justify-center">
            <div class="flex items-center gap-3 rounded-xl border border-s-border bg-s-surface px-4 py-3 shadow-xl dark:shadow-gray-900/50">
                <span class="text-sm font-medium text-s-text-secondary">
                    {{ selectedIds.length }} selected
                </span>
                <div class="h-5 w-px bg-s-border" />
                <div class="flex items-center gap-2">
                    <button
                        v-for="action in actions"
                        :key="action.name"
                        type="button"
                        :disabled="processing"
                        :class="cn(
                            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50',
                            colorClasses[action.color ?? 'primary'] ?? colorClasses.primary,
                        )"
                        @click="executeAction(action)"
                    >
                        <SchemaIcon v-if="action.icon" :schema="action.icon" size="xs" />
                        {{ action.label }}
                    </button>
                </div>
                <div class="h-5 w-px bg-s-border" />
                <button
                    type="button"
                    class="text-sm text-s-text-muted transition-colors hover:text-s-text-secondary"
                    @click="emit('clear-selection')"
                >Cancel</button>
            </div>
        </div>

        <div v-if="confirmingAction" class="fixed inset-0 z-50 flex items-center justify-center">
            <div class="fixed inset-0 bg-black/50" aria-hidden="true" @click="confirmingAction = null" />
            <div class="relative z-10 w-full max-w-md rounded-xl bg-s-surface p-6 shadow-2xl dark:shadow-gray-900/50">
                <h3 class="text-lg font-semibold text-s-text">
                    {{ confirmingAction.confirmationHeading ?? 'Confirm Action' }}
                </h3>
                <p class="mt-2 text-sm text-s-text-muted">
                    {{
                        confirmingAction.confirmationMessage ??
                        `Are you sure you want to perform this action on ${selectedIds.length} record${selectedIds.length !== 1 ? 's' : ''}?`
                    }}
                </p>
                <div class="mt-4 flex justify-end gap-2">
                    <button
                        type="button"
                        class="rounded-lg border border-s-border-strong bg-s-input px-4 py-2 text-sm font-medium text-s-text-secondary transition-colors hover:bg-s-hover"
                        @click="confirmingAction = null"
                    >Cancel</button>
                    <button
                        type="button"
                        :disabled="processing"
                        :class="cn(
                            'rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
                            confirmingAction.color === 'danger'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-s-accent text-white hover:opacity-90',
                        )"
                        @click="executeAction(confirmingAction)"
                    >{{ processing ? 'Processing...' : 'Confirm' }}</button>
                </div>
            </div>
        </div>
    </template>
</template>
