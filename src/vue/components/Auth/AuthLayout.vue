<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { PanelSchema } from '../../../shared/types/schema';

interface Props {
    panel: PanelSchema;
}

const props = defineProps<Props>();
const darkMode = ref(false);

onMounted(() => {
    const stored = localStorage.getItem('studio-color-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored === 'dark' || (stored !== 'light' && prefersDark);

    darkMode.value = isDark;
    const el = document.querySelector('[data-studio-panel]');
    if (el) el.classList.toggle('dark', isDark);
});

function toggleDark() {
    const next = !darkMode.value;
    darkMode.value = next;
    localStorage.setItem('studio-color-mode', next ? 'dark' : 'light');
    const el = document.querySelector('[data-studio-panel]');
    if (el) el.classList.toggle('dark', next);
}

function brandLogoDark(): string | null {
    const v = (props.panel as unknown as Record<string, unknown>).brandLogoDark;
    return typeof v === 'string' ? v : null;
}

function brandIcon(): string | null {
    const v = (props.panel as unknown as Record<string, unknown>).brandIcon;
    return typeof v === 'string' ? v : null;
}
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-s-bg px-4">
        <div class="w-full max-w-md">
            <div class="mb-8 flex flex-col items-center gap-3">
                <img
                    v-if="panel.brandLogo"
                    :src="darkMode && brandLogoDark() ? brandLogoDark()! : panel.brandLogo"
                    :alt="panel.brandName"
                    class="h-10 w-auto"
                />
                <template v-else>
                    <img v-if="brandIcon()" :src="brandIcon()!" alt="" class="h-10 w-auto" />
                    <h1 class="text-2xl font-bold text-s-text tracking-tight">{{ panel.brandName }}</h1>
                </template>
            </div>

            <slot />

            <div class="flex items-center justify-center mt-6">
                <button
                    type="button"
                    class="relative w-10 h-[22px] rounded-full transition-colors"
                    :style="{ background: darkMode ? 'rgb(var(--s-accent))' : 'rgb(var(--s-border-strong))' }"
                    :aria-label="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
                    @click="toggleDark"
                >
                    <div
                        class="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform flex items-center justify-center"
                        :style="{ transform: darkMode ? 'translateX(22px)' : 'translateX(3px)' }"
                    >
                        <svg v-if="darkMode" class="w-2.5 h-2.5" :style="{ color: 'rgb(var(--s-accent))' }" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                        </svg>
                        <svg v-else class="w-2.5 h-2.5 text-amber-500" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                        </svg>
                    </div>
                </button>
            </div>
        </div>
    </div>
</template>
