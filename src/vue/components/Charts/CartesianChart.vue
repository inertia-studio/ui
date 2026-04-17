<script setup lang="ts">
import { computed, ref } from 'vue';
import { type DataPoint, DEFAULT_COLOR, formatValue } from './_chartTypes';

interface Props {
    type: 'line' | 'area' | 'bar';
    data: DataPoint[];
    color?: string;
    height: string;
}

const props = defineProps<Props>();

const containerRef = ref<HTMLElement | null>(null);
const activeIndex = ref<number | null>(null);

const padding = { top: 8, right: 8, bottom: 24, left: 40 };
const viewWidth = 400;
const viewHeight = 180;
const chartW = viewWidth - padding.left - padding.right;
const chartH = viewHeight - padding.top - padding.bottom;

const points = computed(() => {
    const values = props.data.map((d) => d.value);
    const max = Math.max(...values, 1);
    const min = 0;
    const range = max - min || 1;
    return props.data.map((d, i) => ({
        x: props.type === 'bar'
            ? padding.left + (i + 0.5) * (chartW / props.data.length)
            : padding.left + (props.data.length === 1 ? chartW / 2 : (i / (props.data.length - 1)) * chartW),
        y: padding.top + chartH - ((d.value - min) / range) * chartH,
        ...d,
    }));
});

const yTicks = computed(() => {
    const values = props.data.map((d) => d.value);
    const max = Math.max(...values, 1);
    const min = 0;
    const range = max - min || 1;
    const tickCount = 4;
    return Array.from({ length: tickCount + 1 }, (_, i) => {
        const val = min + (range / tickCount) * i;
        return { value: val, y: padding.top + chartH - ((val - min) / range) * chartH };
    });
});

const strokeColor = computed(() => props.color || DEFAULT_COLOR);
const linePath = computed(() => points.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' '));
const areaPath = computed(
    () => `${linePath.value} L${points.value[points.value.length - 1].x},${padding.top + chartH} L${points.value[0].x},${padding.top + chartH} Z`,
);
const barWidth = computed(() => Math.max(4, (chartW / props.data.length) * 0.6));
const barGap = computed(() => (chartW / props.data.length) * 0.4);

function handleMouseMove(e: MouseEvent) {
    const container = containerRef.value;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * viewWidth;
    let closest = 0;
    let closestDist = Infinity;
    for (let i = 0; i < points.value.length; i++) {
        const dist = Math.abs(points.value[i].x - mouseX);
        if (dist < closestDist) {
            closestDist = dist;
            closest = i;
        }
    }
    activeIndex.value = closest;
}

const activePoint = computed(() => (activeIndex.value !== null ? points.value[activeIndex.value] : null));
</script>

<template>
    <div
        ref="containerRef"
        class="relative"
        :style="{ height }"
        @mousemove="handleMouseMove"
        @mouseleave="activeIndex = null"
    >
        <svg :viewBox="`0 0 ${viewWidth} ${viewHeight}`" class="w-full h-full" preserveAspectRatio="none">
            <g v-for="(tick, i) in yTicks" :key="`t-${i}`">
                <line
                    :x1="padding.left"
                    :y1="tick.y"
                    :x2="viewWidth - padding.right"
                    :y2="tick.y"
                    stroke="rgb(var(--s-border))"
                    stroke-width="0.5"
                    stroke-dasharray="3,3"
                />
                <text
                    :x="padding.left - 4"
                    :y="tick.y + 3"
                    text-anchor="end"
                    font-size="8"
                    fill="rgb(var(--s-text-faint))"
                >{{ formatValue(tick.value) }}</text>
            </g>

            <template v-if="data.length <= 12">
                <text
                    v-for="(p, i) in points"
                    :key="`l-${i}`"
                    :x="p.x"
                    :y="viewHeight - 4"
                    text-anchor="middle"
                    font-size="7"
                    :fill="activeIndex === i ? 'rgb(var(--s-text))' : 'rgb(var(--s-text-faint))'"
                    :font-weight="activeIndex === i ? '600' : '400'"
                >{{ p.label }}</text>
            </template>

            <line
                v-if="activePoint"
                :x1="activePoint.x"
                :y1="padding.top"
                :x2="activePoint.x"
                :y2="padding.top + chartH"
                stroke="rgb(var(--s-text-faint))"
                stroke-width="0.5"
                stroke-dasharray="2,2"
                vector-effect="non-scaling-stroke"
            />

            <template v-if="type === 'bar'">
                <rect
                    v-for="(p, i) in points"
                    :key="`b-${i}`"
                    :x="padding.left + i * (chartW / data.length) + barGap / 2"
                    :y="p.y"
                    :width="barWidth"
                    :height="padding.top + chartH - p.y"
                    rx="2"
                    :fill="strokeColor"
                    :opacity="activeIndex === null || activeIndex === i ? 0.85 : 0.35"
                    class="transition-opacity duration-100"
                />
            </template>
            <template v-else>
                <path v-if="type === 'area'" :d="areaPath" :fill="strokeColor" opacity="0.08" />
                <path
                    :d="linePath"
                    fill="none"
                    :stroke="strokeColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    vector-effect="non-scaling-stroke"
                />
                <template v-if="points.length <= 20">
                    <circle
                        v-for="(p, i) in points"
                        :key="`c-${i}`"
                        :cx="p.x"
                        :cy="p.y"
                        :r="activeIndex === i ? 4 : 3"
                        :fill="activeIndex === i ? strokeColor : 'rgb(var(--s-surface))'"
                        :stroke="strokeColor"
                        stroke-width="2"
                        vector-effect="non-scaling-stroke"
                        class="transition-all duration-100"
                    />
                </template>
            </template>
        </svg>

        <div
            v-if="activePoint"
            class="absolute pointer-events-none z-10"
            :style="{
                left: `${(activePoint.x / viewWidth) * 100}%`,
                top: `${(activePoint.y / viewHeight) * 100}%`,
                transform: 'translate(-50%, -140%)',
            }"
        >
            <div
                class="rounded-lg px-2.5 py-1.5 text-center shadow-lg"
                :style="{ background: 'rgb(var(--s-text))', color: 'rgb(var(--s-bg))' }"
            >
                <p class="text-[11px] font-medium">{{ formatValue(activePoint.value) }}</p>
                <p class="text-[9px] opacity-70">{{ activePoint.label }}</p>
            </div>
        </div>
    </div>
</template>
