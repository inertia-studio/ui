<script setup lang="ts">
import { computed, ref } from 'vue';
import { type DataPoint, CHART_COLORS } from './_chartTypes';

interface Props {
    data: DataPoint[];
    colors?: string[];
    height: string;
}

const props = defineProps<Props>();

const activeIndex = ref<number | null>(null);
const total = computed(() => props.data.reduce((sum, d) => sum + d.value, 0));
const paletteColors = computed(() => props.colors || CHART_COLORS);

interface Segment extends DataPoint {
    start: number;
    fraction: number;
    percentage: number;
    color: string;
}

const segments = computed<Segment[]>(() => {
    let cumulative = 0;
    return props.data.map((d, i) => {
        const start = cumulative;
        const fraction = total.value > 0 ? d.value / total.value : 0;
        cumulative += fraction;
        return {
            ...d,
            start,
            fraction,
            percentage: total.value > 0 ? Math.round((d.value / total.value) * 100) : 0,
            color: d.color || paletteColors.value[i % paletteColors.value.length],
        };
    });
});

const cx = 90;
const cy = 90;
const r = 70;
const strokeWidth = 24;

function arcPath(start: number, fraction: number): string {
    if (fraction >= 1) {
        return [
            `M ${cx} ${cy - r}`,
            `A ${r} ${r} 0 1 1 ${cx} ${cy + r}`,
            `A ${r} ${r} 0 1 1 ${cx} ${cy - r}`,
        ].join(' ');
    }
    const startAngle = start * 2 * Math.PI - Math.PI / 2;
    const endAngle = (start + fraction) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = fraction > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

const activeSeg = computed(() => (activeIndex.value !== null ? segments.value[activeIndex.value] : null));
const centerDisplay = computed(() => {
    if (activeSeg.value) return `${activeSeg.value.percentage}%`;
    return total.value >= 1000 ? `${(total.value / 1000).toFixed(1)}K` : String(total.value);
});
const centerLabel = computed(() => (activeSeg.value ? activeSeg.value.label : 'Total'));
</script>

<template>
    <div class="flex items-center gap-6" :style="{ height }">
        <svg viewBox="0 0 180 180" class="h-full aspect-square shrink-0">
            <path
                v-for="(seg, i) in segments"
                :key="`seg-${i}`"
                :d="arcPath(seg.start, seg.fraction)"
                fill="none"
                :stroke="seg.color"
                :stroke-width="activeIndex === i ? strokeWidth + 4 : strokeWidth"
                stroke-linecap="round"
                :opacity="activeIndex === null || activeIndex === i ? 1 : 0.4"
                class="transition-all duration-150 cursor-pointer"
                @mouseenter="activeIndex = i"
                @mouseleave="activeIndex = null"
            />
            <text :x="cx" :y="cy - 4" text-anchor="middle" font-size="20" font-weight="600" fill="rgb(var(--s-text))">
                {{ centerDisplay }}
            </text>
            <text :x="cx" :y="cy + 14" text-anchor="middle" font-size="9" fill="rgb(var(--s-text-muted))">
                {{ centerLabel }}
            </text>
        </svg>

        <div class="space-y-1.5 min-w-0">
            <div
                v-for="(seg, i) in segments"
                :key="`lg-${i}`"
                class="flex items-center gap-2 rounded px-1.5 py-1 -mx-1.5 cursor-pointer transition-colors"
                :style="{ background: activeIndex === i ? 'rgb(var(--s-hover))' : undefined }"
                @mouseenter="activeIndex = i"
                @mouseleave="activeIndex = null"
            >
                <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: seg.color }" />
                <span class="text-xs text-s-text-muted truncate">{{ seg.label }}</span>
                <span class="text-xs font-medium text-s-text ml-auto tabular-nums">{{ seg.value }}</span>
            </div>
        </div>
    </div>
</template>
