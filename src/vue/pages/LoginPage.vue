<script setup lang="ts">
import { computed } from 'vue';
import { Link, useForm, usePage } from '@inertiajs/vue3';
import { StudioProvider } from '../context/StudioContext';
import AuthLayout from '../components/Auth/AuthLayout.vue';
import { cn } from '../../shared/utils/cn';
import type { PanelSchema } from '../../shared/types/schema';

interface Props {
    studio: { panel: PanelSchema };
}

const props = defineProps<Props>();
const page = usePage<{ flash: { success?: string } }>();

const panel = computed<PanelSchema>(() => ({ ...props.studio.panel }));
const panelPath = computed(() => (panel.value.path.startsWith('/') ? panel.value.path : `/${panel.value.path}`));
const authConfig = computed(
    () => (panel.value as unknown as Record<string, unknown>).auth as { registration?: boolean; passwordReset?: boolean } | undefined,
);
const flash = computed(() => (page.props.flash as { success?: string } | undefined) ?? {});

const form = useForm({ email: '', password: '', remember: false });

function handleSubmit(e: Event) {
    e.preventDefault();
    form.post(`${panelPath.value}/login`, { preserveScroll: true });
}
</script>

<template>
    <StudioProvider :panel="panel">
        <AuthLayout :panel="panel">
            <div class="rounded-xl border border-s-border bg-s-surface p-8 shadow-sm">
                <h2 class="mb-6 text-center text-xl font-semibold text-s-text">Sign in to your account</h2>

                <div
                    v-if="flash?.success"
                    class="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400"
                >{{ flash.success }}</div>

                <form class="space-y-5" @submit="handleSubmit">
                    <div>
                        <label for="email" class="mb-1.5 block text-sm font-medium text-s-text-secondary">Email address</label>
                        <input
                            id="email"
                            type="email"
                            autocomplete="email"
                            required
                            :value="form.email"
                            :class="cn(
                                'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors bg-s-input',
                                'placeholder:text-s-text-faint',
                                'focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
                                form.errors.email ? 'border-red-300 text-red-900' : 'border-s-border-strong text-s-text',
                            )"
                            placeholder="you@example.com"
                            @input="form.email = ($event.target as HTMLInputElement).value"
                        />
                        <p v-if="form.errors.email" class="mt-1 text-xs text-red-600">{{ form.errors.email }}</p>
                    </div>

                    <div>
                        <label for="password" class="mb-1.5 block text-sm font-medium text-s-text-secondary">Password</label>
                        <input
                            id="password"
                            type="password"
                            autocomplete="current-password"
                            required
                            :value="form.password"
                            :class="cn(
                                'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors bg-s-input',
                                'placeholder:text-s-text-faint',
                                'focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
                                form.errors.password ? 'border-red-300 text-red-900' : 'border-s-border-strong text-s-text',
                            )"
                            placeholder="Enter your password"
                            @input="form.password = ($event.target as HTMLInputElement).value"
                        />
                        <p v-if="form.errors.password" class="mt-1 text-xs text-red-600">{{ form.errors.password }}</p>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                :checked="form.remember"
                                class="h-4 w-4 rounded border-s-border-strong text-s-accent focus:ring-s-accent/30"
                                @change="form.remember = ($event.target as HTMLInputElement).checked"
                            />
                            <label for="remember" class="ml-2 text-sm text-s-text-muted">Remember me</label>
                        </div>
                        <Link
                            v-if="authConfig?.passwordReset !== false"
                            :href="`${panelPath}/forgot-password`"
                            class="text-sm font-medium text-s-accent hover:underline"
                        >Forgot password?</Link>
                    </div>

                    <button
                        type="submit"
                        :disabled="form.processing"
                        class="flex w-full items-center justify-center gap-2 rounded-lg bg-s-accent px-4 py-2.5 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                    >{{ form.processing ? 'Signing in...' : 'Sign in' }}</button>
                </form>

                <p v-if="authConfig?.registration" class="mt-5 text-center text-sm text-s-text-muted">
                    Don't have an account?
                    <Link :href="`${panelPath}/register`" class="font-medium text-s-accent hover:underline">Sign up</Link>
                </p>
            </div>
        </AuthLayout>
    </StudioProvider>
</template>
