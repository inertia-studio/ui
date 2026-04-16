<script setup lang="ts">
import { computed } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { StudioProvider } from '../context/StudioContext';
import PanelLayout from '../components/Layout/PanelLayout.vue';
import type { PanelSchema, UserSchema } from '../../shared/types/schema';

interface Props {
    studio: {
        panel: PanelSchema;
        user: UserSchema | null;
        notifications: unknown[];
    };
    user: {
        id: number;
        name: string;
        email: string;
        avatar: string | null;
        created_at: string | null;
    };
}

const props = defineProps<Props>();

const panel = computed<PanelSchema>(() => ({
    ...props.studio.panel,
    user: props.studio.user ?? props.studio.panel.user,
}));

const panelPath = computed(() => (panel.value.path.startsWith('/') ? panel.value.path : `/${panel.value.path}`));

const profileForm = useForm({ name: props.user.name, email: props.user.email });
const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });

function handleProfileSubmit(e: Event) {
    e.preventDefault();
    profileForm.put(`${panelPath.value}/profile`);
}

function handlePasswordSubmit(e: Event) {
    e.preventDefault();
    passwordForm.put(`${panelPath.value}/profile/password`, {
        onSuccess: () => passwordForm.reset(),
    });
}
</script>

<template>
    <StudioProvider :panel="panel">
        <PanelLayout>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 class="text-xl font-semibold text-s-text">Profile</h1>
                    <p class="text-sm text-s-text-muted mt-0.5">Manage your account settings.</p>
                </div>
            </div>

            <div class="space-y-8">
                <div class="rounded-xl border border-s-border bg-s-surface">
                    <div class="border-b border-s-border px-6 py-4">
                        <h2 class="text-base font-semibold text-s-text">Profile Information</h2>
                        <p class="mt-0.5 text-sm text-s-text-muted">Update your name and email address.</p>
                    </div>
                    <form class="px-6 py-5" @submit="handleProfileSubmit">
                        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label for="name" class="mb-1.5 block text-sm font-medium text-s-text-secondary">Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    :value="profileForm.name"
                                    class="block w-full rounded-lg border border-s-border-strong bg-s-input text-s-text px-3 py-2 text-sm shadow-sm placeholder:text-s-text-faint focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30"
                                    @input="profileForm.name = ($event.target as HTMLInputElement).value"
                                />
                                <p v-if="profileForm.errors.name" class="mt-1 text-sm text-red-600">{{ profileForm.errors.name }}</p>
                            </div>
                            <div>
                                <label for="email" class="mb-1.5 block text-sm font-medium text-s-text-secondary">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    :value="profileForm.email"
                                    class="block w-full rounded-lg border border-s-border-strong bg-s-input text-s-text px-3 py-2 text-sm shadow-sm placeholder:text-s-text-faint focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30"
                                    @input="profileForm.email = ($event.target as HTMLInputElement).value"
                                />
                                <p v-if="profileForm.errors.email" class="mt-1 text-sm text-red-600">{{ profileForm.errors.email }}</p>
                            </div>
                        </div>
                        <div class="mt-5 flex justify-end">
                            <button
                                type="submit"
                                :disabled="profileForm.processing"
                                class="inline-flex items-center gap-2 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                            >{{ profileForm.processing ? 'Saving...' : 'Save' }}</button>
                        </div>
                    </form>
                </div>

                <div class="rounded-xl border border-s-border bg-s-surface">
                    <div class="border-b border-s-border px-6 py-4">
                        <h2 class="text-base font-semibold text-s-text">Change Password</h2>
                        <p class="mt-0.5 text-sm text-s-text-muted">Ensure your account uses a strong password.</p>
                    </div>
                    <form class="px-6 py-5" @submit="handlePasswordSubmit">
                        <div class="max-w-xl space-y-5">
                            <div>
                                <label for="current_password" class="mb-1.5 block text-sm font-medium text-s-text-secondary">Current Password</label>
                                <input
                                    id="current_password"
                                    type="password"
                                    :value="passwordForm.current_password"
                                    class="block w-full rounded-lg border border-s-border-strong bg-s-input text-s-text px-3 py-2 text-sm shadow-sm placeholder:text-s-text-faint focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30"
                                    @input="passwordForm.current_password = ($event.target as HTMLInputElement).value"
                                />
                                <p v-if="passwordForm.errors.current_password" class="mt-1 text-sm text-red-600">{{ passwordForm.errors.current_password }}</p>
                            </div>
                            <div>
                                <label for="password" class="mb-1.5 block text-sm font-medium text-s-text-secondary">New Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    :value="passwordForm.password"
                                    class="block w-full rounded-lg border border-s-border-strong bg-s-input text-s-text px-3 py-2 text-sm shadow-sm placeholder:text-s-text-faint focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30"
                                    @input="passwordForm.password = ($event.target as HTMLInputElement).value"
                                />
                                <p v-if="passwordForm.errors.password" class="mt-1 text-sm text-red-600">{{ passwordForm.errors.password }}</p>
                            </div>
                            <div>
                                <label for="password_confirmation" class="mb-1.5 block text-sm font-medium text-s-text-secondary">Confirm New Password</label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    :value="passwordForm.password_confirmation"
                                    class="block w-full rounded-lg border border-s-border-strong bg-s-input text-s-text px-3 py-2 text-sm shadow-sm placeholder:text-s-text-faint focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30"
                                    @input="passwordForm.password_confirmation = ($event.target as HTMLInputElement).value"
                                />
                            </div>
                        </div>
                        <div class="mt-5 flex justify-end">
                            <button
                                type="submit"
                                :disabled="passwordForm.processing"
                                class="inline-flex items-center gap-2 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                            >{{ passwordForm.processing ? 'Updating...' : 'Update Password' }}</button>
                        </div>
                    </form>
                </div>
            </div>
        </PanelLayout>
    </StudioProvider>
</template>
