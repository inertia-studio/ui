<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { cn } from '../../../shared/utils/cn';
import type { ToastMessage } from './Toast';

const props = defineProps<{ toast: ToastMessage }>();
const emit = defineEmits<{ dismiss: [id: string] }>();

const duration = props.toast.duration ?? 4000;
const exiting = ref(false);

const toastStyles: Record<string, { iconBg: string; iconColor: string; progress: string }> = {
    success: { iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500', progress: 'bg-emerald-500/40' },
    error: { iconBg: 'bg-red-500/10', iconColor: 'text-red-500', progress: 'bg-red-500/40' },
    warning: { iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500', progress: 'bg-amber-500/40' },
    info: { iconBg: 'bg-s-accent/10', iconColor: 'text-s-accent', progress: 'bg-s-accent/40' },
};
const style = toastStyles[props.toast.type] ?? toastStyles.info;

let timer: ReturnType<typeof setTimeout> | null = null;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;

function startExit() {
    exiting.value = true;
    dismissTimer = setTimeout(() => emit('dismiss', props.toast.id), 200);
}

onMounted(() => {
    timer = setTimeout(startExit, duration);
});

onBeforeUnmount(() => {
    if (timer) clearTimeout(timer);
    if (dismissTimer) clearTimeout(dismissTimer);
});
</script>

<template>
    <div
        :class="cn(
            'relative w-80 rounded-xl border border-s-border bg-s-surface shadow-lg overflow-hidden transition-all duration-200',
            exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0',
        )"
    >
        <div class="flex items-start gap-3 px-4 pt-3.5 pb-3">
            <div :class="cn('shrink-0 w-7 h-7 rounded-full flex items-center justify-center', style.iconBg, style.iconColor)">
                <svg v-if="toast.type === 'success'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" :stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                <svg v-else-if="toast.type === 'error'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" :stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                <svg v-else-if="toast.type === 'warning'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" :stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" /></svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" :stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
            </div>
            <div class="flex-1 min-w-0 pt-0.5">
                <p class="text-sm font-medium text-s-text">{{ toast.title }}</p>
                <p v-if="toast.body" class="mt-0.5 text-xs text-s-text-muted">{{ toast.body }}</p>
            </div>
            <button
                type="button"
                class="shrink-0 mt-0.5 p-0.5 rounded text-s-text-faint hover:text-s-text transition-colors"
                @click="startExit"
            >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div class="h-0.5 w-full">
            <div
                :class="cn('h-full rounded-full', style.progress)"
                :style="{ animation: `toast-shrink ${duration}ms linear forwards` }"
            />
        </div>
        <component is="style">@keyframes toast-shrink { from { width: 100%; } to { width: 0%; } }</component>
    </div>
</template>
