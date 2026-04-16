<script setup lang="ts">
import { computed, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { cn } from '../../../shared/utils/cn';
import SchemaIcon from '../Icon/SchemaIcon.vue';
import { useStudioHooks } from '../../composables/useStudioHooks';
import ConfirmationModal from './ConfirmationModal.vue';
import type { ActionSchema } from '../../../shared/types/schema';

interface Props {
    action: ActionSchema;
    record?: Record<string, unknown>;
    panelPath: string;
    moduleSlug: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ action: [] }>();

const colorClasses: Record<string, { button: string; compact: string }> = {
    primary: { button: 'bg-s-accent text-white hover:opacity-90', compact: 'text-s-accent hover:bg-s-accent/10' },
    danger: { button: 'bg-red-600 text-white hover:bg-red-700', compact: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950' },
    warning: { button: 'bg-yellow-500 text-white hover:bg-yellow-600', compact: 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950' },
    success: { button: 'bg-green-600 text-white hover:bg-green-700', compact: 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950' },
    info: { button: 'bg-blue-600 text-white hover:bg-blue-700', compact: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950' },
    gray: { button: 'bg-gray-600 text-white hover:bg-gray-700', compact: 'text-s-text-muted hover:bg-s-hover' },
};

function resolveColor(action: ActionSchema): string {
    if (action.color) return action.color;
    if (action.type === 'delete') return 'danger';
    return 'gray';
}

const color = computed(() => resolveColor(props.action));
const styles = computed(() => colorClasses[color.value] ?? colorClasses.gray);

const showConfirmation = ref(false);
const processing = ref(false);
const { invoke, has } = useStudioHooks();

const isDangerous = computed(() => props.action.type === 'delete' || color.value === 'danger');

const confirmationConfig = computed(() => {
    return has('action:confirmation') ? invoke('action:confirmation', props.action) : null;
});

function handleNavigate() {
    if (!props.record) return;
    const recordId = props.record.id ?? props.record.key;
    const baseUrl = `${props.panelPath}/${props.moduleSlug}/${recordId}`;
    if (props.action.type === 'view') {
        router.visit(props.action.url ?? baseUrl);
    } else if (props.action.type === 'edit') {
        router.visit(props.action.url ?? `${baseUrl}/edit`);
    }
}

function executeAction() {
    if (has('action:before')) {
        const shouldProceed = invoke('action:before', props.action, props.record ? [props.record] : []);
        if (shouldProceed === false) return;
    }
    processing.value = true;

    const onFinish = () => {
        processing.value = false;
        showConfirmation.value = false;
        if (has('action:after')) {
            invoke('action:after', props.action, { success: true, message: null, redirect: null });
        }
        emit('action');
    };

    if (props.action.type === 'delete') {
        const url = props.action.url ?? `${props.panelPath}/${props.moduleSlug}${props.record?.id ? `/${props.record.id}` : ''}`;
        router.delete(url, { preserveState: true, preserveScroll: true, onFinish });
    } else {
        const url = props.action.url ?? `${props.panelPath}/${props.moduleSlug}${props.record?.id ? `/${props.record.id}` : ''}/action/${props.action.name}`;
        router.post(url, { id: props.record?.id ?? props.record?.key ?? null } as never, {
            preserveState: true, preserveScroll: true, onFinish,
        });
    }
}

function handleClick() {
    if (props.action.type === 'view' || props.action.type === 'edit') {
        handleNavigate();
        return;
    }
    if (props.action.type === 'delete' || props.action.requiresConfirmation) {
        showConfirmation.value = true;
        return;
    }
    executeAction();
}
</script>

<template>
    <template v-if="action.authorized">
        <button
            type="button"
            :disabled="processing"
            :class="cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50',
                styles.button,
            )"
            :title="action.label"
            @click="handleClick"
        >
            <SchemaIcon v-if="action.icon" :schema="action.icon" size="xs" />
            {{ action.label }}
        </button>
        <ConfirmationModal
            :open="showConfirmation"
            :heading="confirmationConfig?.heading ?? action.confirmationHeading ?? (isDangerous ? 'Delete Record' : 'Confirm Action')"
            :message="confirmationConfig?.message ?? action.confirmationMessage ?? (isDangerous ? 'Are you sure you want to delete this record? This action cannot be undone.' : 'Are you sure you want to perform this action?')"
            :confirm-label="confirmationConfig?.confirmLabel ?? (isDangerous ? 'Delete' : 'Confirm')"
            :cancel-label="confirmationConfig?.cancelLabel ?? 'Cancel'"
            :is-dangerous="confirmationConfig?.isDangerous ?? isDangerous"
            :loading="processing"
            @close="showConfirmation = false"
            @confirm="executeAction"
        />
    </template>
</template>
