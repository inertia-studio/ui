<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { router } from '@inertiajs/vue3';

const loading = ref(false);
const progress = ref(0);

let interval: ReturnType<typeof setInterval> | null = null;
let removeStart: (() => void) | null = null;
let removeFinish: (() => void) | null = null;

onMounted(() => {
    removeStart = router.on('start', () => {
        loading.value = true;
        progress.value = 10;
        if (interval) clearInterval(interval);
        interval = setInterval(() => {
            if (progress.value >= 90) return;
            progress.value = progress.value + (90 - progress.value) * 0.1;
        }, 100);
    });

    removeFinish = router.on('finish', () => {
        progress.value = 100;
        if (interval) clearInterval(interval);
        setTimeout(() => {
            loading.value = false;
            progress.value = 0;
        }, 200);
    });
});

onBeforeUnmount(() => {
    removeStart?.();
    removeFinish?.();
    if (interval) clearInterval(interval);
});
</script>

<template>
    <div v-if="loading || progress !== 0" class="fixed top-0 left-0 right-0 z-[200] h-0.5">
        <div
            class="h-full bg-s-accent transition-all duration-200 ease-out"
            :style="{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }"
        />
    </div>
</template>
