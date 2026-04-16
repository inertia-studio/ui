<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { cn } from '../../../shared/utils/cn';
import { usePanel } from '../../composables/usePanel';
import { useStudioHooks } from '../../composables/useStudioHooks';
import { useStudioContext, type ColorMode } from '../../context/StudioContext';
import type { UserSchema } from '../../../shared/types/schema';

interface Props {
    user: { name: string; email: string; avatar: string | null } | null;
}

const props = defineProps<Props>();

const open = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const { panel } = usePanel();
const { invoke, has } = useStudioHooks();
const { colorMode, setColorMode } = useStudioContext();

function getInitials(name: string): string {
    return name.split(' ').map((p) => p.charAt(0)).slice(0, 2).join('').toUpperCase();
}

function handleClickOutside(e: MouseEvent) {
    if (menuRef.value && !menuRef.value.contains(e.target as Node)) open.value = false;
}

watch(open, (o) => {
    if (o) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
});

function handleLogout() {
    router.post(`${panel.value.path}/logout`);
}

function goProfile() {
    open.value = false;
    router.visit(`${panel.value.path}/profile`);
}

const themeModes: Array<{ value: ColorMode; label: string }> = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' },
];

const hookOverride = computed(() => {
    if (!props.user) return null;
    if (!has('layout:user-menu')) return null;
    return invoke('layout:user-menu', props.user as UserSchema) as object | null;
});
</script>

<template>
    <template v-if="user">
        <template v-if="hookOverride">
            <component :is="hookOverride" />
        </template>
        <div v-else ref="menuRef" class="relative">
            <button
                type="button"
                class="flex items-center gap-2 rounded-lg p-1.5 text-sm transition-colors hover:bg-s-hover"
                :aria-expanded="open"
                aria-haspopup="true"
                @click="open = !open"
            >
                <img
                    v-if="user.avatar"
                    :src="user.avatar"
                    :alt="user.name"
                    class="h-8 w-8 rounded-full object-cover"
                />
                <span
                    v-else
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-s-accent text-xs font-medium text-s-accent-fg"
                >{{ getInitials(user.name) }}</span>

                <span class="hidden font-medium text-s-text-secondary md:block">{{ user.name }}</span>

                <svg
                    :class="cn('hidden h-4 w-4 text-s-text-faint transition-transform md:block', open && 'rotate-180')"
                    fill="none"
                    viewBox="0 0 24 24"
                    :stroke-width="2"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            <div v-if="open" class="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-s-border bg-s-surface py-1 shadow-lg">
                <div class="border-b border-s-border px-4 py-3">
                    <p class="text-sm font-medium text-s-text">{{ user.name }}</p>
                    <p class="mt-0.5 truncate text-xs text-s-text-muted">{{ user.email }}</p>
                </div>

                <div class="py-1">
                    <button
                        type="button"
                        class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-s-text-secondary transition-colors hover:bg-s-hover"
                        @click="goProfile"
                    >
                        <svg class="h-4 w-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" :stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        Profile
                    </button>
                </div>

                <div class="border-t border-s-border px-4 py-2">
                    <p class="mb-1.5 text-xs font-medium text-s-text-muted">Theme</p>
                    <div class="flex rounded-lg border border-s-border bg-s-surface-alt p-0.5">
                        <button
                            v-for="mode in themeModes"
                            :key="mode.value"
                            type="button"
                            :class="cn(
                                'flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                                colorMode.value === mode.value
                                    ? 'bg-s-surface text-s-text shadow-sm'
                                    : 'text-s-text-muted hover:text-s-text-secondary',
                            )"
                            :title="mode.label"
                            @click="setColorMode(mode.value)"
                        >
                            <span class="hidden sm:inline">{{ mode.label }}</span>
                        </button>
                    </div>
                </div>

                <div class="border-t border-s-border py-1">
                    <button
                        type="button"
                        class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-s-text-secondary transition-colors hover:bg-s-hover"
                        @click="handleLogout"
                    >
                        <svg class="h-4 w-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" :stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                        </svg>
                        Log out
                    </button>
                </div>
            </div>
        </div>
    </template>
</template>
