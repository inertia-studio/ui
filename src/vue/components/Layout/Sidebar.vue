<script setup lang="ts">
import SidebarContent from './SidebarContent.vue';

interface Props {
    collapsed: boolean;
    mobileOpen: boolean;
}

defineProps<Props>();
defineEmits<{ 'toggle-collapse': []; 'close-mobile': [] }>();
</script>

<template>
    <aside
        class="hidden lg:block h-screen shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out"
        :style="{ width: collapsed ? '64px' : '260px' }"
    >
        <SidebarContent :collapsed="collapsed" @toggle-collapse="$emit('toggle-collapse')" />
    </aside>

    <div v-if="mobileOpen" class="fixed inset-0 z-40 lg:hidden">
        <div class="fixed inset-0 bg-black/50" @click="$emit('close-mobile')" />
        <aside class="fixed inset-y-0 left-0 z-50 w-[260px]">
            <SidebarContent :collapsed="false" @toggle-collapse="$emit('toggle-collapse')" />
            <button
                type="button"
                class="absolute right-3 top-5 p-1 rounded-lg text-s-text-faint hover:text-s-text transition-colors"
                @click="$emit('close-mobile')"
            >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </aside>
    </div>
</template>
