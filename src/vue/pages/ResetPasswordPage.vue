<script setup lang="ts">
import { computed } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { StudioProvider } from '../context/StudioContext';
import AuthLayout from '../components/Auth/AuthLayout.vue';
import { cn } from '../../shared/utils/cn';
import type { PanelSchema } from '../../shared/types/schema';

interface Props {
    studio: { panel: PanelSchema };
    token: string;
    email: string;
}

const props = defineProps<Props>();
const panel = computed<PanelSchema>(() => ({ ...props.studio.panel }));
const panelPath = computed(() => (panel.value.path.startsWith('/') ? panel.value.path : `/${panel.value.path}`));

const form = useForm({ token: props.token, email: props.email, password: '', password_confirmation: '' });

function handleSubmit(e: Event) {
    e.preventDefault();
    form.post(`${panelPath.value}/reset-password`, { preserveScroll: true });
}

function inputClass(field: string) {
    return cn(
        'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors bg-s-input',
        'placeholder:text-s-text-faint text-s-text',
        'focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
        (form.errors as Record<string, string>)[field] ? 'border-red-300' : 'border-s-border-strong',
    );
}
</script>

<template>
    <StudioProvider :panel="panel">
        <AuthLayout :panel="panel">
            <div class="rounded-xl border border-s-border bg-s-surface p-8 shadow-sm">
                <h2 class="mb-6 text-center text-xl font-semibold text-s-text">Reset your password</h2>
                <form class="space-y-4" @submit="handleSubmit">
                    <div>
                        <label for="email" class="mb-1.5 block text-sm font-medium text-s-text-secondary">Email address</label>
                        <input
                            id="email"
                            type="email"
                            required
                            readonly
                            :value="form.email"
                            :class="cn(inputClass('email'), 'bg-s-surface-alt cursor-not-allowed')"
                        />
                        <p v-if="form.errors.email" class="mt-1 text-xs text-red-600">{{ form.errors.email }}</p>
                    </div>
                    <div>
                        <label for="password" class="mb-1.5 block text-sm font-medium text-s-text-secondary">New password</label>
                        <input
                            id="password"
                            type="password"
                            autocomplete="new-password"
                            required
                            autofocus
                            :value="form.password"
                            :class="inputClass('password')"
                            placeholder="Enter new password"
                            @input="form.password = ($event.target as HTMLInputElement).value"
                        />
                        <p v-if="form.errors.password" class="mt-1 text-xs text-red-600">{{ form.errors.password }}</p>
                    </div>
                    <div>
                        <label for="password_confirmation" class="mb-1.5 block text-sm font-medium text-s-text-secondary">Confirm password</label>
                        <input
                            id="password_confirmation"
                            type="password"
                            autocomplete="new-password"
                            required
                            :value="form.password_confirmation"
                            :class="inputClass('password_confirmation')"
                            placeholder="Confirm new password"
                            @input="form.password_confirmation = ($event.target as HTMLInputElement).value"
                        />
                    </div>

                    <button
                        type="submit"
                        :disabled="form.processing"
                        class="flex w-full items-center justify-center gap-2 rounded-lg bg-s-accent px-4 py-2.5 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                    >{{ form.processing ? 'Resetting...' : 'Reset password' }}</button>
                </form>
            </div>
        </AuthLayout>
    </StudioProvider>
</template>
