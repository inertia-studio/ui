<script setup lang="ts">
import { computed } from 'vue';
import { type DataPoint, DEFAULT_COLOR } from './_chartTypes';

interface Props {
    data: DataPoint[];
    color?: string;
    height?: string;
}

const props = withDefaults(defineProps<Props>(), { height: '32px' });

const strokeColor = computed(() => props.color || DEFAULT_COLOR);

const w = 100;
const h = 24;

const path = computed(() => {
    if (!props.data || props.data.length < 2) return '';
    const values = props.data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const pts = values.map((v, i) => ({
        x: (i / (values.length - 1)) * w,
        y: h - ((v - min) / range) * h,
    }));
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
});
</script>

<template>
    <svg
        v-if="data && data.length >= 2"
        :viewBox="`0 0 ${w} ${h}`"
        class="w-full"
        :style="{ height }"
        preserveAspectRatio="none"
    >
        <path
            :d="path"
            fill="none"
            :stroke="strokeColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            vector-effect="non-scaling-stroke"
        />
    </svg>
</template>
