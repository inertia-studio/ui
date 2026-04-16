<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { cn } from '../../../shared/utils/cn';
import { useStudioContext, type ColorMode } from '../../context/StudioContext';
import { useStudioHooks } from '../../composables/useStudioHooks';

const props = defineProps<{
    user: { name: string; email: string; avatar: string | null };
    collapsed: boolean;
    panelPath: string;
}>();

const open = ref(false);
const menuRef = ref<HTMLElement | null>(null);
const { colorMode, setColorMode } = useStudioContext();
const { invoke } = useStudioHooks();

const initials = computed(() =>
    (props.user.name ?? 'U').split(' ').map((p) => p.charAt(0)).slice(0, 2).join('').toUpperCase(),
);

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

function logout() {
    open.value = false;
    router.post(props.panelPath + '/logout');
}

const modes: Array<{ value: ColorMode; label: string }> = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
];

const userMenuItems = computed(() => invoke('layout:user-menu-items') as object | null);
</script>

<template>
    <div ref="menuRef" class="relative border-t border-s-border p-3 shrink-0">
        <button
            type="button"
            :class="cn(
                'flex w-full items-center rounded-lg hover:bg-s-hover transition-colors',
                collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2',
            )"
            @click="open = !open"
        >
            <img v-if="user.avatar" :src="user.avatar" class="w-8 h-8 rounded-full shrink-0" alt="" />
            <div
                v-else
                class="w-8 h-8 rounded-full bg-s-accent flex items-center justify-center text-xs font-medium text-s-accent-fg shrink-0"
            >{{ initials }}</div>
            <template v-if="!collapsed">
                <div class="flex-1 min-w-0 text-left">
                    <p class="text-sm font-medium text-s-text truncate">{{ user.name }}</p>
                    <p class="text-[11px] text-s-text-muted truncate">{{ user.email }}</p>
                </div>
                <svg
                    :class="cn('w-4 h-4 text-s-text-faint shrink-0 transition-transform', open && 'rotate-180')"
                    fill="none"
                    viewBox="0 0 24 24"
                    :stroke-width="2"
                    stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
            </template>
        </button>

        <div
            v-if="open"
            :class="cn(
                'absolute z-50 rounded-xl border border-s-border bg-s-surface shadow-lg py-1',
                collapsed ? 'left-full bottom-0 ml-2 w-56' : 'left-3 right-3 bottom-full mb-1',
            )"
        >
            <div v-if="collapsed" class="border-b border-s-border px-4 py-3">
                <p class="text-sm font-medium text-s-text">{{ user.name }}</p>
                <p class="text-xs text-s-text-muted truncate">{{ user.email }}</p>
            </div>

            <div class="py-1">
                <a
                    :href="panelPath + '/profile'"
                    class="flex items-center gap-2.5 px-4 py-2 text-sm text-s-text-secondary hover:bg-s-hover transition-colors"
                    @click="open = false"
                >
                    <svg class="w-4 h-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" :stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    Profile
                </a>
            </div>

            <component v-if="userMenuItems" :is="userMenuItems" />

            <div class="border-t border-s-border px-4 py-2.5">
                <p class="text-[11px] font-medium text-s-text-faint uppercase tracking-wider mb-2">Theme</p>
                <div class="flex items-center rounded-lg border border-s-border bg-s-surface-alt p-0.5">
                    <button
                        v-for="mode in modes"
                        :key="mode.value"
                        type="button"
                        :class="cn(
                            'flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-xs font-medium transition-colors',
                            colorMode.value === mode.value
                                ? 'bg-s-surface text-s-text shadow-sm'
                                : 'text-s-text-muted hover:text-s-text',
                        )"
                        @click="setColorMode(mode.value)"
                    >{{ mode.label }}</button>
                </div>
            </div>

            <div class="border-t border-s-border py-1">
                <button
                    type="button"
                    class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-s-text-secondary hover:bg-s-hover transition-colors"
                    @click="logout"
                >
                    <svg class="w-4 h-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" :stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                    </svg>
                    Log out
                </button>
            </div>
        </div>
    </div>
</template>
