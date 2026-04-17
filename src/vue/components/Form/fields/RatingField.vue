<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FieldSchema } from '../../../../shared/types/schema';

interface Props {
    schema: FieldSchema;
    value: unknown;
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: unknown] }>();

const max = computed(() => ((props.schema as Record<string, unknown>).max as number) ?? 5);
const allowHalf = computed(() => ((props.schema as Record<string, unknown>).allowHalf as boolean) ?? false);
const activeColor = computed(() => ((props.schema as Record<string, unknown>).activeColor as string) ?? '#f59e0b');
const currentValue = computed(() => Number(props.value ?? 0));

const hoverValue = ref<number | null>(null);
const displayValue = computed(() => hoverValue.value ?? currentValue.value);

function handleClick(starIndex: number, isHalf: boolean) {
    const newValue = isHalf && allowHalf.value ? starIndex + 0.5 : starIndex + 1;
    emit('change', newValue === currentValue.value ? 0 : newValue);
}

function handleMouseMove(e: MouseEvent, i: number) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isLeftHalf = (e.clientX - rect.left) < rect.width / 2;
    hoverValue.value = isLeftHalf && allowHalf.value ? i + 0.5 : i + 1;
}

function handleStarClick(e: MouseEvent, i: number) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isLeftHalf = (e.clientX - rect.left) < rect.width / 2;
    handleClick(i, isLeftHalf);
}

function isFilled(i: number) {
    return displayValue.value >= i + 1;
}

function isHalfFilled(i: number) {
    return !isFilled(i) && allowHalf.value && displayValue.value >= i + 0.5;
}
</script>

<template>
    <div class="flex items-center gap-0.5" @mouseleave="hoverValue = null">
        <div
            v-for="(_, i) in max"
            :key="i"
            class="relative cursor-pointer"
            @mousemove="handleMouseMove($event, i)"
            @click="handleStarClick($event, i)"
        >
            <!-- Background star (empty) -->
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--s-border-strong))" :stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>

            <!-- Filled star (full or half) -->
            <svg
                v-if="isFilled(i) || isHalfFilled(i)"
                class="w-6 h-6 absolute inset-0"
                viewBox="0 0 24 24"
                :fill="activeColor"
                :style="isHalfFilled(i) ? { clipPath: 'inset(0 50% 0 0)' } : undefined"
            >
                <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
        </div>

        <!-- Value display -->
        <span class="ml-2 text-sm text-s-text-muted tabular-nums">{{ currentValue > 0 ? currentValue : '' }}</span>
    </div>
</template>
