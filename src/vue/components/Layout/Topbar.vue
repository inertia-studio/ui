<script setup lang="ts">
import { computed, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { cn } from '../../../shared/utils/cn';
import { usePanel } from '../../composables/usePanel';
import { useStudioContext, type ColorMode } from '../../context/StudioContext';
import GlobalSearch from './GlobalSearch.vue';
import NotificationBell from './NotificationBell.vue';

defineEmits<{ 'toggle-mobile': [] }>();

const { panel, user } = usePanel();
const { colorMode, setColorMode } = useStudioContext();

const userMenuOpen = ref(false);

const breadcrumbs = computed<Array<{ label: string; url?: string }>>(() => {
    const panelPath = panel.value?.path ?? '/admin';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    if (!pathname || pathname === panelPath || pathname === panelPath + '/') {
        return [{ label: 'Dashboard' }];
    }
    const relative = pathname.startsWith(panelPath) ? pathname.slice(panelPath.length) : pathname;
    const segments = relative.split('/').filter(Boolean);
    const items: Array<{ label: string; url?: string }> = [{ label: 'Dashboard', url: panelPath }];
    let currentPath = panelPath;
    for (let i = 0; i < segments.length; i++) {
        currentPath += '/' + segments[i];
        const label = segments[i].replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        items.push(i === segments.length - 1 ? { label } : { label, url: currentPath });
    }
    return items;
});

const initials = computed(() =>
    (user.value?.name ?? 'U').split(' ').map((p) => p.charAt(0)).slice(0, 2).join('').toUpperCase(),
);

const themeModes: ColorMode[] = ['light', 'dark'];

function logout() {
    userMenuOpen.value = false;
    router.post((panel.value?.path ?? '') + '/logout');
}
</script>

<template>
    <header class="flex items-center h-16 px-4 lg:px-6 border-b border-s-border bg-s-surface shrink-0">
        <button
            type="button"
            class="lg:hidden p-1.5 rounded-lg text-s-text-muted hover:bg-s-hover mr-2"
            @click="$emit('toggle-mobile')"
        >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" :stroke-width="1.75" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
        </button>

        <div class="hidden sm:flex items-center gap-1.5 text-[13px] text-s-text-muted shrink-0">
            <span v-for="(item, i) in breadcrumbs" :key="i" class="flex items-center gap-1.5">
                <svg
                    v-if="i > 0"
                    class="w-3 h-3 text-s-text-faint"
                    fill="none"
                    viewBox="0 0 24 24"
                    :stroke-width="2.5"
                    stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
                <span v-if="i === breadcrumbs.length - 1" class="text-s-text font-medium">{{ item.label }}</span>
                <a v-else :href="item.url" class="hover:text-s-text transition-colors">{{ item.label }}</a>
            </span>
        </div>

        <div class="flex-1 flex justify-end px-4">
            <div class="w-full max-w-md">
                <GlobalSearch />
            </div>
        </div>

        <div class="flex items-center gap-1 shrink-0">
            <div class="hidden sm:flex items-center rounded-lg border border-s-border bg-s-surface-alt p-0.5">
                <button
                    v-for="m in themeModes"
                    :key="m"
                    type="button"
                    :class="cn(
                        'p-1 rounded-md transition-colors',
                        colorMode.value === m ? 'bg-s-surface text-s-text shadow-sm' : 'text-s-text-muted hover:text-s-text',
                    )"
                    @click="setColorMode(m)"
                >
                    <svg v-if="m === 'light'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                    <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>
                </button>
            </div>
            <NotificationBell />
            <div class="pl-1.5 ml-1 border-l border-s-border">
                <div class="relative">
                    <button
                        type="button"
                        class="flex items-center gap-2 p-1 rounded-lg hover:bg-s-hover transition-colors"
                        @click="userMenuOpen = !userMenuOpen"
                    >
                        <img v-if="user?.avatar" :src="user.avatar" class="w-7 h-7 rounded-full" alt="" />
                        <div
                            v-else
                            class="w-7 h-7 rounded-full bg-s-accent text-s-accent-fg flex items-center justify-center text-[10px] font-semibold"
                        >{{ initials }}</div>
                        <span class="hidden md:block text-sm font-medium text-s-text-secondary">{{ user?.name ?? 'User' }}</span>
                        <svg
                            :class="cn('hidden md:block w-3.5 h-3.5 text-s-text-faint transition-transform', userMenuOpen && 'rotate-180')"
                            fill="none"
                            viewBox="0 0 24 24"
                            :stroke-width="2"
                            stroke="currentColor"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>

                    <template v-if="userMenuOpen">
                        <div class="fixed inset-0 z-40" @click="userMenuOpen = false" />
                        <div class="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-s-border bg-s-surface shadow-lg py-1">
                            <div class="border-b border-s-border px-4 py-3">
                                <p class="text-sm font-medium text-s-text">{{ user?.name }}</p>
                                <p class="text-xs text-s-text-muted truncate">{{ user?.email }}</p>
                            </div>
                            <div class="py-1">
                                <a
                                    :href="(panel?.path ?? '') + '/profile'"
                                    class="flex items-center gap-2 px-4 py-2 text-sm text-s-text-secondary hover:bg-s-hover transition-colors"
                                    @click="userMenuOpen = false"
                                >
                                    <svg class="w-4 h-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" :stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>
                                    Profile
                                </a>
                            </div>
                            <div class="border-t border-s-border py-1">
                                <button
                                    type="button"
                                    class="flex w-full items-center gap-2 px-4 py-2 text-sm text-s-text-secondary hover:bg-s-hover transition-colors"
                                    @click="logout"
                                >
                                    <svg class="w-4 h-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" :stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                    </svg>
                                    Log out
                                </button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </header>
</template>
