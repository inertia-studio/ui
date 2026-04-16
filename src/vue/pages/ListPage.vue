<script setup lang="ts">
import { computed, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { StudioProvider } from '../context/StudioContext';
import PanelLayout from '../components/Layout/PanelLayout.vue';
import DataTable from '../components/Table/DataTable.vue';
import SimpleFormModal from '../components/Form/SimpleFormModal.vue';
import TabGroup from '../components/Tabs/TabGroup.vue';
import type {
    PanelSchema,
    UserSchema,
    ModuleMetaSchema,
    TableSchema,
    FormSchema,
    PaginatedData,
    ListTabSchema,
} from '../../shared/types/schema';

interface Props {
    studio: {
        panel: PanelSchema;
        user: UserSchema | null;
        notifications: unknown[];
    };
    module: ModuleMetaSchema;
    tableSchema: TableSchema;
    records: PaginatedData;
    tabs?: ListTabSchema[];
    simpleFormSchema?: FormSchema;
}

const props = defineProps<Props>();

const panel = computed<PanelSchema>(() => ({
    ...props.studio.panel,
    user: props.studio.user ?? props.studio.panel.user,
}));

const panelPath = computed(() =>
    panel.value.path.startsWith('/') ? panel.value.path : `/${panel.value.path}`,
);

const simpleModalOpen = ref(false);
const simpleEditRecord = ref<Record<string, unknown> | undefined>(undefined);

function resolveActiveTab(): string {
    if (!props.tabs || props.tabs.length === 0) return '';
    if (typeof window === 'undefined') return props.tabs[0]?.slug ?? '';
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get('tab');
    if (tabParam && props.tabs.some((t) => t.slug === tabParam)) return tabParam;
    return props.tabs[0]?.slug ?? '';
}

function handleTabChange(slug: string) {
    router.visit(window.location.pathname, {
        data: { tab: slug },
        preserveState: true,
        preserveScroll: true,
        only: ['records', 'tabs'],
    });
}

function handleCreate() {
    if (props.module.simple && props.simpleFormSchema) {
        simpleEditRecord.value = undefined;
        simpleModalOpen.value = true;
    } else {
        router.visit(`${panelPath.value}/${props.module.slug}/create`);
    }
}

function handleSimpleEdit(record: Record<string, unknown>) {
    simpleEditRecord.value = record;
    simpleModalOpen.value = true;
}

function handleSimpleModalClose() {
    simpleModalOpen.value = false;
    simpleEditRecord.value = undefined;
}

const simpleEditSchema = computed<FormSchema | undefined>(() => {
    if (!props.simpleFormSchema || !simpleEditRecord.value) return undefined;
    return { ...props.simpleFormSchema, operation: 'edit' };
});

const activeTab = computed(() => resolveActiveTab());
</script>

<template>
    <StudioProvider :panel="panel">
        <PanelLayout>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-xl font-semibold text-s-text">{{ module.pluralLabel }}</h1>
                    <p class="text-sm text-s-text-muted mt-0.5">
                        Manage your {{ module.pluralLabel.toLowerCase() }}.
                    </p>
                </div>
                <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity"
                    @click="handleCreate"
                >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create {{ module.label }}
                </button>
            </div>

            <div v-if="tabs && tabs.length > 0" class="mb-4">
                <TabGroup :tabs="tabs" :active-tab="activeTab" @tab-change="handleTabChange" />
            </div>

            <DataTable
                :schema="tableSchema"
                :data="records"
                :module="{ slug: module.slug }"
                :panel-path="panelPath"
                @simple-edit="(record: Record<string, unknown>) => module.simple && handleSimpleEdit(record)"
            />

            <SimpleFormModal
                v-if="module.simple && simpleFormSchema"
                :open="simpleModalOpen"
                :schema="simpleEditRecord ? (simpleEditSchema as FormSchema) : simpleFormSchema"
                :record="simpleEditRecord"
                :panel-path="panelPath"
                :module-slug="module.slug"
                @close="handleSimpleModalClose"
            />
        </PanelLayout>
    </StudioProvider>
</template>
