<script setup lang="ts">
import { ref } from 'vue';
import { usePanel } from '../../composables/usePanel';
import Sidebar from './Sidebar.vue';
import Topbar from './Topbar.vue';
import ToastContainer from '../Toast/ToastContainer.vue';
import LoadingBar from '../LoadingBar/LoadingBar.vue';

const { layout } = usePanel();

function getStoredCollapsed(fallback: boolean): boolean {
    if (typeof localStorage === 'undefined') return fallback;
    const stored = localStorage.getItem('studio-sidebar-collapsed');
    if (stored === null) return fallback;
    return stored === 'true';
}

const sidebarCollapsed = ref(getStoredCollapsed(layout.value?.sidebar?.defaultCollapsed ?? false));
const mobileOpen = ref(false);

function handleToggleCollapse() {
    const next = !sidebarCollapsed.value;
    sidebarCollapsed.value = next;
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('studio-sidebar-collapsed', String(next));
    }
}
</script>

<template>
    <div class="flex h-screen overflow-hidden bg-s-bg relative">
        <LoadingBar />
        <Sidebar
            :collapsed="sidebarCollapsed"
            :mobile-open="mobileOpen"
            @toggle-collapse="handleToggleCollapse"
            @close-mobile="mobileOpen = false"
        />
        <div class="flex flex-1 flex-col overflow-hidden">
            <Topbar @toggle-mobile="mobileOpen = !mobileOpen" />
            <main class="flex-1 overflow-y-auto p-4 sm:p-6">
                <slot />
            </main>
            <ToastContainer />
        </div>
    </div>
</template>
