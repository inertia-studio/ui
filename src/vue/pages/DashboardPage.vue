<script setup lang="ts">
import { computed } from 'vue';
import { StudioProvider } from '../context/StudioContext';
import PanelLayout from '../components/Layout/PanelLayout.vue';
import DashboardSchemaRenderer from './DashboardSchemaRenderer.vue';
import type { PanelSchema, UserSchema } from '../../shared/types/schema';

interface DashboardSchema {
    title: string;
    description: string | null;
    schema: Array<Record<string, unknown>>;
}

interface Props {
    studio: {
        panel: PanelSchema;
        user: UserSchema | null;
        notifications: unknown[];
    };
    dashboardPage?: DashboardSchema;
}

const props = defineProps<Props>();

const panel = computed<PanelSchema>(() => ({
    ...props.studio.panel,
    user: props.studio.user ?? props.studio.panel.user,
}));

const user = computed(() => props.studio.user ?? props.studio.panel.user);
const hasCustom = computed(() => !!(props.dashboardPage && props.dashboardPage.schema.length > 0));
</script>

<template>
    <StudioProvider :panel="panel">
        <PanelLayout>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-xl font-semibold text-s-text">
                        {{ hasCustom ? dashboardPage!.title : 'Dashboard' }}
                    </h1>
                    <p
                        v-if="(hasCustom ? dashboardPage!.description : panel.brandName)"
                        class="text-sm text-s-text-muted mt-0.5"
                    >
                        {{ hasCustom ? dashboardPage!.description : panel.brandName }}
                    </p>
                </div>
            </div>

            <div v-if="hasCustom" class="space-y-6">
                <DashboardSchemaRenderer :items="dashboardPage!.schema" />
            </div>
            <template v-else>
                <div class="rounded-xl border border-s-border bg-s-surface p-8">
                    <div class="flex items-start gap-4">
                        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-s-accent/10">
                            <svg class="h-6 w-6 text-s-accent" fill="none" viewBox="0 0 24 24" :stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-lg font-semibold text-s-text">
                                {{ user ? `Welcome back, ${user.name}` : 'Welcome to your dashboard' }}
                            </h2>
                            <p class="mt-1 text-sm text-s-text-muted">
                                Get started by navigating to a module from the sidebar, or define a custom dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div
                        v-for="i in [1, 2, 3]"
                        :key="i"
                        class="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-s-border bg-s-surface-alt/50"
                    >
                        <p class="text-sm text-s-text-faint">Widget placeholder</p>
                    </div>
                </div>
            </template>
        </PanelLayout>
    </StudioProvider>
</template>
