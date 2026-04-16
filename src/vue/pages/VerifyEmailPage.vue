<script setup lang="ts">
import { computed } from 'vue';
import { router, usePage } from '@inertiajs/vue3';
import { StudioProvider } from '../context/StudioContext';
import AuthLayout from '../components/Auth/AuthLayout.vue';
import type { PanelSchema } from '../../shared/types/schema';

interface Props {
    studio: {
        panel: PanelSchema;
        user: { name: string; email: string } | null;
    };
}

const props = defineProps<Props>();
const page = usePage<{ flash: { success?: string } }>();
const panel = computed<PanelSchema>(() => ({ ...props.studio.panel }));
const panelPath = computed(() => (panel.value.path.startsWith('/') ? panel.value.path : `/${panel.value.path}`));
const flash = computed(() => (page.props.flash as { success?: string } | undefined) ?? {});

function resend() {
    router.post(`${panelPath.value}/verify-email/resend`);
}
function logout() {
    router.post(`${panelPath.value}/logout`);
}
</script>

<template>
    <StudioProvider :panel="panel">
        <AuthLayout :panel="panel">
            <div class="rounded-xl border border-s-border bg-s-surface p-8 shadow-sm text-center">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-s-accent/10">
                    <svg class="h-7 w-7 text-s-accent" fill="none" viewBox="0 0 24 24" :stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                </div>

                <h2 class="text-xl font-semibold text-s-text mb-2">Verify your email</h2>
                <p class="text-sm text-s-text-muted mb-6">
                    We've sent a verification link to your email address. Check your inbox and click the link to continue.
                </p>

                <div
                    v-if="flash?.success"
                    class="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400"
                >{{ flash.success }}</div>

                <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-lg bg-s-accent px-4 py-2.5 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity"
                    @click="resend"
                >Resend verification email</button>

                <div class="mt-4">
                    <button
                        type="button"
                        class="text-sm text-s-text-muted hover:text-s-text transition-colors"
                        @click="logout"
                    >Sign out</button>
                </div>
            </div>
        </AuthLayout>
    </StudioProvider>
</template>
