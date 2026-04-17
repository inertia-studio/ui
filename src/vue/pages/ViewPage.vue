<script setup lang="ts">
import { computed } from 'vue';
import { router } from '@inertiajs/vue3';
import { StudioProvider } from '../context/StudioContext';
import PanelLayout from '../components/Layout/PanelLayout.vue';
import DetailView from '../components/Infolist/DetailView.vue';
import FormRenderer from '../components/Form/FormRenderer.vue';
import ActionButton from '../components/Actions/ActionButton.vue';
import type {
    PanelSchema,
    UserSchema,
    ModuleMetaSchema,
    DetailSchema,
    FormSchema,
} from '../../shared/types/schema';

interface Props {
    studio: {
        panel: PanelSchema;
        user: UserSchema | null;
        notifications: unknown[];
    };
    module: ModuleMetaSchema;
    record: Record<string, unknown>;
    detailSchema?: DetailSchema[];
    formSchema?: FormSchema & { readonly?: boolean };
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
function goEdit() {
    router.visit(`${panelPath.value}/${props.module.slug}/${props.record.id}/edit`);
}
function afterDelete() {
    router.visit(`${panelPath.value}/${props.module.slug}`);
}

const hasDetailSchema = computed(() => props.detailSchema && props.detailSchema.length > 0);
const hasReadonlyForm = computed(() => !!props.formSchema?.readonly);

const deleteAction = computed(() => ({
    type: 'delete' as const,
    name: 'delete',
    label: 'Delete',
    icon: null,
    color: 'danger',
    requiresConfirmation: true,
    confirmationHeading: 'Delete Record',
    confirmationMessage: `Are you sure you want to delete "${recordTitle.value}"?`,
    url: null,
    authorized: true,
    form: null,
}));
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
                <div class="flex items-center gap-2">
                    <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity"
                        @click="goEdit"
                    >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        Edit
                    </button>
                    <ActionButton
                        :action="deleteAction"
                        :record="record"
                        :panel-path="panelPath"
                        :module-slug="module.slug"
                        @action="afterDelete"
                    />
                </div>
            </div>

            <DetailView v-if="hasDetailSchema" :schema="detailSchema!" :record="record" />
            <div
                v-else-if="hasReadonlyForm"
                class="rounded-xl border border-s-border bg-s-surface overflow-hidden p-5 sm:p-6"
            >
                <div class="[&_button[type=submit]]:hidden [&_.border-t]:hidden [&_input]:bg-s-surface-alt [&_input]:cursor-default [&_textarea]:bg-s-surface-alt [&_textarea]:cursor-default [&_select]:bg-s-surface-alt [&_select]:cursor-default [&_input]:pointer-events-none [&_textarea]:pointer-events-none [&_select]:pointer-events-none">
                    <FormRenderer
                        :schema="formSchema!"
                        :record="record"
                        :module="{ slug: module.slug }"
                        :panel-path="panelPath"
                    />
                </div>
            </div>
            <div v-else class="rounded-xl border border-s-border bg-s-surface p-8 text-center text-s-text-muted">
                No detail view defined for this module.
            </div>
        </PanelLayout>
    </StudioProvider>
</template>
