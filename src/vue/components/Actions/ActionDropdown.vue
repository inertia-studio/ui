<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { cn } from '../../../shared/utils/cn';
import SchemaIcon from '../Icon/SchemaIcon.vue';
import { useStudioHooks } from '../../composables/useStudioHooks';
import ConfirmationModal from './ConfirmationModal.vue';
import type { ActionSchema } from '../../../shared/types/schema';

interface Props {
    actions: ActionSchema[];
    record: Record<string, unknown>;
    panelPath: string;
    moduleSlug: string;
}

const props = defineProps<Props>();

const itemColorClasses: Record<string, string> = {
    primary: 'text-s-text-secondary hover:bg-s-hover',
    danger: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950',
    warning: 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950',
    success: 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950',
    info: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950',
    gray: 'text-s-text-secondary hover:bg-s-hover',
};

function resolveColor(action: ActionSchema): string {
    if (action.color) return action.color;
    if (action.type === 'delete') return 'danger';
    return 'gray';
}

const isOpen = ref(false);
const confirmingAction = ref<ActionSchema | null>(null);
const processing = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const { invoke, has } = useStudioHooks();

const authorizedActions = computed(() => props.actions.filter((a) => a.authorized));

const isDangerous = computed(
    () => confirmingAction.value?.type === 'delete' || confirmingAction.value?.color === 'danger',
);

const confirmationConfig = computed(() => {
    return confirmingAction.value && has('action:confirmation')
        ? invoke('action:confirmation', confirmingAction.value)
        : null;
});

function handleClickOutside(e: MouseEvent) {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
        isOpen.value = false;
    }
}

function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') isOpen.value = false;
}

watch(isOpen, (open) => {
    if (open) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
    } else {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
    }
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('keydown', handleKeyDown);
});

function handleNavigate(action: ActionSchema) {
    const recordId = props.record.id ?? props.record.key;
    const baseUrl = `${props.panelPath}/${props.moduleSlug}/${recordId}`;
    if (action.type === 'view') router.visit(action.url ?? baseUrl);
    else if (action.type === 'edit') router.visit(action.url ?? `${baseUrl}/edit`);
    isOpen.value = false;
}

function executeAction(action: ActionSchema) {
    if (has('action:before')) {
        const shouldProceed = invoke('action:before', action, [props.record]);
        if (shouldProceed === false) return;
    }
    processing.value = true;

    const recordId = props.record.id ?? props.record.key;
    const onFinish = () => {
        processing.value = false;
        confirmingAction.value = null;
        isOpen.value = false;
        if (has('action:after')) {
            invoke('action:after', action, { success: true, message: null, redirect: null });
        }
    };

    if (action.type === 'delete') {
        const url = action.url ?? `${props.panelPath}/${props.moduleSlug}/${recordId}`;
        router.delete(url, { preserveState: true, preserveScroll: true, onFinish });
    } else {
        const url = action.url ?? `${props.panelPath}/${props.moduleSlug}/${recordId}/action/${action.name}`;
        router.post(url, { id: recordId } as never, { preserveState: true, preserveScroll: true, onFinish });
    }
}

function handleActionClick(action: ActionSchema) {
    if (action.type === 'view' || action.type === 'edit') {
        handleNavigate(action);
        return;
    }
    if (action.type === 'delete' || action.requiresConfirmation) {
        confirmingAction.value = action;
        isOpen.value = false;
        return;
    }
    executeAction(action);
}
</script>

<template>
    <template v-if="authorizedActions.length > 0">
        <div ref="dropdownRef" class="relative inline-block text-left">
            <button
                type="button"
                class="inline-flex items-center justify-center rounded-lg p-1.5 text-s-text-faint transition-colors hover:bg-s-hover hover:text-s-text-muted"
                aria-label="Actions"
                :aria-expanded="isOpen"
                aria-haspopup="true"
                @click="isOpen = !isOpen"
            >
                <svg
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    :stroke-width="2"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                    />
                </svg>
            </button>

            <div
                v-if="isOpen"
                class="absolute right-0 z-20 mt-1 w-48 origin-top-right rounded-lg border border-s-border bg-s-surface py-1 shadow-lg"
            >
                <button
                    v-for="action in authorizedActions"
                    :key="action.name"
                    type="button"
                    :disabled="processing"
                    :class="cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors disabled:opacity-50',
                        itemColorClasses[resolveColor(action)] ?? itemColorClasses.gray,
                    )"
                    @click="handleActionClick(action)"
                >
                    <SchemaIcon v-if="action.icon" :schema="action.icon" size="sm" />
                    {{ action.label }}
                </button>
            </div>
        </div>

        <ConfirmationModal
            v-if="confirmingAction"
            :open="true"
            :heading="confirmationConfig?.heading ?? confirmingAction.confirmationHeading ?? (isDangerous ? 'Delete Record' : 'Confirm Action')"
            :message="confirmationConfig?.message ?? confirmingAction.confirmationMessage ?? (isDangerous ? 'Are you sure you want to delete this record? This action cannot be undone.' : 'Are you sure you want to perform this action?')"
            :confirm-label="confirmationConfig?.confirmLabel ?? (isDangerous ? 'Delete' : 'Confirm')"
            :cancel-label="confirmationConfig?.cancelLabel ?? 'Cancel'"
            :is-dangerous="confirmationConfig?.isDangerous ?? isDangerous"
            :loading="processing"
            @close="confirmingAction = null"
            @confirm="executeAction(confirmingAction)"
        />
    </template>
</template>
