<script setup lang="ts">
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import { cn } from '../../../shared/utils/cn';
import { usePanel } from '../../composables/usePanel';
import { useStudioHooks } from '../../composables/useStudioHooks';
import { useStudioContext } from '../../context/StudioContext';
import SidebarUser from './SidebarUser.vue';
import NavGroup from './NavGroup.vue';

defineProps<{ collapsed: boolean }>();
defineEmits<{ 'toggle-collapse': [] }>();

const { panel, layout, navigation, user } = usePanel();
const { resolvedColorMode } = useStudioContext();
const { invoke } = useStudioHooks();

const pathname = computed(() => (typeof window !== 'undefined' ? window.location.pathname : ''));
const isDashboardActive = computed(() => {
    const p = pathname.value;
    return p === panel.value?.path || p === panel.value?.path + '/';
});

function brandLogoSrc(collapsed: boolean): string {
    const p = panel.value as unknown as Record<string, unknown>;
    const brandLogoDark = typeof p.brandLogoDark === 'string' ? p.brandLogoDark : null;

    if (collapsed && panel.value.brandLogoCollapsed) return panel.value.brandLogoCollapsed;
    if (resolvedColorMode.value === 'dark' && brandLogoDark) return brandLogoDark;
    return panel.value.brandLogo ?? '';
}

function brandIconSrc(): string | null {
    const p = panel.value as unknown as Record<string, unknown>;
    return typeof p.brandIcon === 'string' ? p.brandIcon : null;
}

const sidebarHeader = computed(() => invoke('layout:sidebar-header') as object | null);
const sidebarFooter = computed(() => invoke('layout:sidebar-footer') as object | null);
</script>

<template>
    <div class="flex h-full flex-col bg-s-surface border-r border-s-border">
        <div class="flex items-center justify-between h-16 px-5 border-b border-s-border shrink-0">
            <Link :href="panel?.path ?? '/'" class="flex items-center gap-3 overflow-hidden">
                <img
                    v-if="panel?.brandLogo"
                    :src="brandLogoSrc(collapsed)"
                    :alt="panel.brandName"
                    :class="cn('h-8 shrink-0 object-contain', collapsed ? 'w-8' : 'max-w-[140px]')"
                />
                <template v-else>
                    <img v-if="brandIconSrc()" :src="brandIconSrc()!" alt="" class="w-8 h-8 shrink-0 object-contain" />
                    <div v-else class="w-8 h-8 rounded-lg bg-s-accent flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4 text-s-accent-fg" fill="none" viewBox="0 0 24 24" :stroke-width="2.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                        </svg>
                    </div>
                    <span v-if="!collapsed" class="text-sm font-semibold text-s-text">{{ panel?.brandName ?? 'Studio' }}</span>
                </template>
            </Link>

            <button
                v-if="layout?.sidebar?.collapsible && !collapsed"
                type="button"
                class="hidden lg:inline-flex p-1 rounded-md text-s-text-faint hover:text-s-text hover:bg-s-hover transition-colors"
                @click="$emit('toggle-collapse')"
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                </svg>
            </button>
            <button
                v-if="layout?.sidebar?.collapsible && collapsed"
                type="button"
                class="hidden lg:inline-flex p-1 rounded-md text-s-text-faint hover:text-s-text hover:bg-s-hover transition-colors"
                @click="$emit('toggle-collapse')"
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
            </button>
        </div>

        <component v-if="sidebarHeader" :is="sidebarHeader" />

        <nav class="flex-1 overflow-y-auto px-3 py-3">
            <div class="space-y-0.5">
                <Link
                    :href="panel?.path ?? '/'"
                    :class="cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        isDashboardActive
                            ? 'font-medium text-s-text bg-s-surface-alt'
                            : 'text-s-text-secondary hover:bg-s-hover hover:text-s-text',
                        collapsed && 'justify-center px-0',
                    )"
                >
                    <svg class="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" :stroke-width="1.75" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    <span v-if="!collapsed">Dashboard</span>
                </Link>
            </div>

            <NavGroup
                v-for="(group, i) in navigation"
                :key="i"
                :group="group"
                :collapsed="collapsed"
                :pathname="pathname"
            />
        </nav>

        <div class="shrink-0">
            <component v-if="sidebarFooter" :is="sidebarFooter" />
        </div>

        <SidebarUser v-if="user" :user="user" :collapsed="collapsed" :panel-path="panel?.path ?? ''" />
    </div>
</template>
