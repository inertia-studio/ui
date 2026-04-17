<script setup lang="ts">
import { computed } from 'vue';
import { router } from '@inertiajs/vue3';
import { StudioProvider } from '../context/StudioContext';
import PanelLayout from '../components/Layout/PanelLayout.vue';
import FormRenderer from '../components/Form/FormRenderer.vue';
import ActionButton from '../components/Actions/ActionButton.vue';
import type {
    PanelSchema,
    UserSchema,
    ModuleMetaSchema,
    FormSchema,
} from '../../shared/types/schema';

interface Props {
    studio: {
        panel: PanelSchema;
        user: UserSchema | null;
        notifications: unknown[];
    };
    module: ModuleMetaSchema;
    formSchema: FormSchema;
    record: Record<string, unknown>;
}

const props = defineProps<Props>();

const panel = computed<PanelSchema>(() => ({
    ...props.studio.panel,
    user: props.studio.user ?? props.studio.panel.user,
}));

const panelPath = computed(() =>
    panel.value.path.startsWith('/') ? panel.value.path : `/${panel.value.path}`,
);

const recordTitle = computed(() =>
    props.record[props.module.recordTitleAttribute]
        ? String(props.record[props.module.recordTitleAttribute])
        : `#${props.record.id ?? ''}`,
);

function handleBack() {
    router.visit(`${panelPath.value}/${props.module.slug}`);
}

const deleteAction = computed(() => ({
    type: 'delete' as const,
    name: 'delete',
    label: 'Delete',
    icon: null,
    color: 'danger',
    requiresConfirmation: true,
    confirmationHeading: 'Delete Record',
    confirmationMessage: `Are you sure you want to delete "${recordTitle.value}"? This action cannot be undone.`,
    url: null,
    authorized: true,
    form: null,
}));

function afterDelete() {
    router.visit(`${panelPath.value}/${props.module.slug}`);
}
</script>

<template>
    <StudioProvider :panel="panel">
        <PanelLayout>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div class="flex items-center gap-4">
                    <button
                        type="button"
                        class="inline-flex items-center gap-1.5 rounded-lg border border-s-border bg-s-surface px-3 py-1.5 text-sm text-s-text-secondary hover:bg-s-hover transition-colors"
                        @click="handleBack"
                    >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Back
                    </button>
                    <h1 class="text-xl font-semibold text-s-text">{{ recordTitle }}</h1>
                </div>
                <ActionButton
                    :action="deleteAction"
                    :record="record"
                    :panel-path="panelPath"
                    :module-slug="module.slug"
                    @action="afterDelete"
                />
            </div>
            <div class="rounded-xl border border-s-border bg-s-surface p-5 sm:p-6">
                <FormRenderer
                    :schema="formSchema"
                    :record="record"
                    :module="{ slug: module.slug }"
                    :panel-path="panelPath"
                />
            </div>
        </PanelLayout>
    </StudioProvider>
</template>
