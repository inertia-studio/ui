<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { router, usePage, usePoll } from '@inertiajs/vue3';
import { cn } from '../../../shared/utils/cn';
import { usePanel } from '../../composables/usePanel';
import { toast } from '../Toast';

interface Notification {
    id?: string | null;
    title: string;
    body?: string | null;
    icon?: string | null;
    color?: string;
    url?: string | null;
    time?: string | null;
}

const dotColorMap: Record<string, string> = {
    info: 'bg-s-accent',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
};

function toastTypeFromColor(color?: string): 'success' | 'error' | 'warning' | 'info' {
    if (color === 'danger') return 'error';
    if (color === 'warning') return 'warning';
    if (color === 'success') return 'success';
    return 'info';
}

const open = ref(false);
const { panel } = usePanel();
const page = usePage<{ studio: { notifications: Notification[] } }>();

const notifications = computed<Notification[]>(() => {
    return (page.props.studio as { notifications?: Notification[] } | undefined)?.notifications ?? [];
});
const count = computed(() => notifications.value.length);
const dropdownRef = ref<HTMLElement | null>(null);

const pollingInterval = computed(() => {
    const v = (panel.value as unknown as Record<string, unknown>).notificationPolling;
    return typeof v === 'number' ? v : 0;
});
const showToasts = computed(() => {
    const v = (panel.value as unknown as Record<string, unknown>).notificationToasts;
    return typeof v === 'boolean' ? v : true;
});

if (pollingInterval.value > 0) {
    usePoll(pollingInterval.value * 1000, { only: ['studio'] }, { autoStart: true });
}

const seenIds = new Set<string>();
let initialized = false;

watch(notifications, (list) => {
    const current = new Set<string>();
    for (const n of list) {
        const key = n.id ?? n.title;
        if (key) current.add(key);
    }

    if (!initialized) {
        current.forEach((k) => seenIds.add(k));
        initialized = true;
        return;
    }

    if (!showToasts.value) {
        seenIds.clear();
        current.forEach((k) => seenIds.add(k));
        return;
    }

    for (const n of list) {
        const key = n.id ?? n.title;
        if (key && !seenIds.has(key)) {
            toast({ type: toastTypeFromColor(n.color), title: n.title });
        }
    }
    seenIds.clear();
    current.forEach((k) => seenIds.add(k));
}, { deep: true });

function handleClickOutside(e: MouseEvent) {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) open.value = false;
}

watch(open, (v) => {
    if (v) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
});

function markAllRead() {
    router.post(`${panel.value?.path ?? ''}/notifications/read-all`, {}, { preserveScroll: true });
    open.value = false;
}

function handleNotificationClick(notification: Notification) {
    open.value = false;
    if (notification.id) {
        router.post(
            `${panel.value?.path ?? ''}/notifications/${notification.id}/read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (notification.url) router.visit(notification.url);
                },
            },
        );
    } else if (notification.url) {
        router.visit(notification.url);
    }
}
</script>

<template>
    <div ref="dropdownRef" class="relative">
        <button
            type="button"
            class="relative p-1.5 rounded-lg text-s-text-muted hover:bg-s-hover transition-colors"
            @click="open = !open"
        >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" :stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            <span v-if="count > 0" class="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {{ count > 99 ? '99+' : count }}
            </span>
        </button>

        <div
            v-if="open"
            class="absolute right-0 top-full z-50 mt-1.5 w-80 rounded-xl border border-s-border bg-s-surface shadow-lg overflow-hidden"
        >
            <div class="flex items-center justify-between px-4 py-3 border-b border-s-border">
                <p class="text-sm font-medium text-s-text">Notifications</p>
                <button
                    v-if="count > 0"
                    type="button"
                    class="text-[11px] text-s-accent hover:underline"
                    @click="markAllRead"
                >Mark all read</button>
            </div>

            <div class="max-h-80 overflow-y-auto">
                <div v-if="count === 0" class="flex flex-col items-center justify-center py-10 px-4">
                    <svg class="w-8 h-8 text-s-text-faint mb-2" fill="none" viewBox="0 0 24 24" :stroke-width="1" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                    </svg>
                    <p class="text-xs text-s-text-faint">No notifications</p>
                </div>
                <button
                    v-for="(n, i) in notifications"
                    v-else
                    :key="n.id ?? i"
                    type="button"
                    class="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-s-hover transition-colors border-b border-s-border last:border-b-0"
                    @click="handleNotificationClick(n)"
                >
                    <div :class="cn('w-2 h-2 rounded-full mt-1.5 shrink-0', dotColorMap[n.color ?? 'info'] ?? dotColorMap.info)" />
                    <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-s-text truncate">{{ n.title }}</p>
                        <p v-if="n.body" class="text-xs text-s-text-muted mt-0.5 line-clamp-2">{{ n.body }}</p>
                        <p v-if="n.time" class="text-[11px] text-s-text-faint mt-1">{{ n.time }}</p>
                    </div>
                </button>
            </div>
        </div>
    </div>
</template>
