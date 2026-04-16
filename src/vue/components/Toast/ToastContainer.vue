<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { subscribeToasts, toast, type ToastMessage } from './Toast';
import ToastItem from './ToastItem.vue';

const toasts = ref<ToastMessage[]>([]);
const shownFlashes = new Set<string>();

let unsubscribe: (() => void) | null = null;
let removeInertiaListener: (() => void) | null = null;

onMounted(() => {
    unsubscribe = subscribeToasts((t) => {
        toasts.value = [...toasts.value, t];
    });

    removeInertiaListener = router.on('success', (event: unknown) => {
        const pg = (event as { detail?: { page?: { props?: Record<string, unknown> } } }).detail?.page;
        if (!pg?.props) return;

        const flash = pg.props.flash as { success?: string | null; error?: string | null } | undefined;

        if (flash?.success) {
            const key = `s:${flash.success}`;
            if (!shownFlashes.has(key)) {
                shownFlashes.add(key);
                toast({ type: 'success', title: flash.success });
            }
        }
        if (flash?.error) {
            const key = `e:${flash.error}`;
            if (!shownFlashes.has(key)) {
                shownFlashes.add(key);
                toast({ type: 'error', title: flash.error });
            }
        }
        if (!flash?.success && !flash?.error) {
            shownFlashes.clear();
        }
    });
});

onBeforeUnmount(() => {
    unsubscribe?.();
    removeInertiaListener?.();
});

function handleDismiss(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
}
</script>

<template>
    <div v-if="toasts.length > 0" class="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2">
        <ToastItem v-for="t in toasts" :key="t.id" :toast="t" @dismiss="handleDismiss" />
    </div>
</template>
