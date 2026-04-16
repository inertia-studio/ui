<script setup lang="ts">
import { computed, ref } from 'vue';
import { type Series, CHART_COLORS, formatValue } from './_chartTypes';

interface Props {
    type: 'line' | 'area' | 'bar';
    series: Series[];
    labels: string[];
    stacked?: boolean;
    colors?: string[];
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
const paletteColors = computed(() => props.colors || CHART_COLORS);

const maxVal = computed(() => {
    if (props.stacked) {
        return Math.max(
            ...props.labels.map((_, i) => props.series.reduce((sum, s) => sum + (s.data[i] ?? 0), 0)),
            1,
        );
    }
    return Math.max(...props.series.flatMap((s) => s.data), 1);
});

const yTicks = computed(() => {
    const tickCount = 4;
    return Array.from({ length: tickCount + 1 }, (_, i) => {
        const val = (maxVal.value / tickCount) * i;
        return { value: val, y: padding.top + chartH - (val / maxVal.value) * chartH };
    });
});

function handleMouseMove(e: MouseEvent) {
    const container = containerRef.value;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * viewWidth;
    const slotWidth = chartW / props.labels.length;
    const idx = Math.floor((mouseX - padding.left) / slotWidth);
    activeIndex.value = Math.max(0, Math.min(idx, props.labels.length - 1));
}

interface BarSegment { x: number; y: number; width: number; height: number; color: string; active: boolean }

const barSegments = computed<BarSegment[]>(() => {
    if (props.type !== 'bar') return [];
    const out: BarSegment[] = [];
    const slotWidth = chartW / props.labels.length;
    for (let li = 0; li < props.labels.length; li++) {
        const slotX = padding.left + li * slotWidth;
        if (props.stacked) {
            let yOffset = 0;
            for (let si = 0; si < props.series.length; si++) {
                const val = props.series[si].data[li] ?? 0;
                const barH = (val / maxVal.value) * chartH;
                yOffset += barH;
                out.push({
                    x: slotX + slotWidth * 0.15,
                    y: padding.top + chartH - yOffset,
                    width: slotWidth * 0.7,
                    height: barH,
                    color: props.series[si].color || paletteColors.value[si % paletteColors.value.length],
                    active: activeIndex.value === null || activeIndex.value === li,
                });
            }
        } else {
            const barW = (slotWidth * 0.7) / props.series.length;
            for (let si = 0; si < props.series.length; si++) {
                const val = props.series[si].data[li] ?? 0;
                const barH = (val / maxVal.value) * chartH;
                out.push({
                    x: slotX + slotWidth * 0.15 + si * barW,
                    y: padding.top + chartH - barH,
                    width: barW - 1,
                    height: barH,
                    color: props.series[si].color || paletteColors.value[si % paletteColors.value.length],
                    active: activeIndex.value === null || activeIndex.value === li,
                });
            }
        }
    }
    return out;
});

interface LineSeries {
    color: string;
    linePath: string;
    areaPath?: string;
    pts: { x: number; y: number }[];
}

const lineSeries = computed<LineSeries[]>(() => {
    if (props.type === 'bar') return [];
    const out: LineSeries[] = [];
    for (let si = 0; si < props.series.length; si++) {
        const s = props.series[si];
        const seriesColor = s.color || paletteColors.value[si % paletteColors.value.length];

        const getY = (li: number) => {
            if (props.stacked && props.type === 'area') {
                const stackedVal = props.series.slice(0, si + 1).reduce((sum, ss) => sum + (ss.data[li] ?? 0), 0);
                return padding.top + chartH - (stackedVal / maxVal.value) * chartH;
            }
            const val = s.data[li] ?? 0;
            return padding.top + chartH - (val / maxVal.value) * chartH;
        };
        const getBaseY = (li: number) => {
            if (props.stacked && props.type === 'area' && si > 0) {
                const baseVal = props.series.slice(0, si).reduce((sum, ss) => sum + (ss.data[li] ?? 0), 0);
                return padding.top + chartH - (baseVal / maxVal.value) * chartH;
            }
            return padding.top + chartH;
        };

        const pts = props.labels.map((_, li) => ({
            x: padding.left + (props.labels.length === 1 ? chartW / 2 : (li / (props.labels.length - 1)) * chartW),
            y: getY(li),
        }));

        const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

        let areaPath: string | undefined;
        if (props.type === 'area') {
            const reverse = props.labels.map((_, li) => {
                const x = padding.left + (props.labels.length === 1 ? chartW / 2 : (li / (props.labels.length - 1)) * chartW);
                return `L${x},${getBaseY(props.labels.length - 1 - li)}`;
            }).reverse().join(' ');
            areaPath = `${linePath} ${reverse} Z`;
        }

        out.push({ color: seriesColor, linePath, areaPath, pts });
    }
    return out;
});

function seriesColor(si: number): string {
    const s = props.series[si];
    return s.color || paletteColors.value[si % paletteColors.value.length];
}
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

            <template v-if="labels.length <= 12">
                <text
                    v-for="(lbl, i) in labels"
                    :key="`l-${i}`"
                    :x="padding.left + (i + 0.5) * (chartW / labels.length)"
                    :y="viewHeight - 4"
                    text-anchor="middle"
                    font-size="7"
                    :fill="activeIndex === i ? 'rgb(var(--s-text))' : 'rgb(var(--s-text-faint))'"
                    :font-weight="activeIndex === i ? '600' : '400'"
                >{{ lbl }}</text>
            </template>

            <line
                v-if="activeIndex !== null"
                :x1="padding.left + (activeIndex + 0.5) * (chartW / labels.length)"
                :y1="padding.top"
                :x2="padding.left + (activeIndex + 0.5) * (chartW / labels.length)"
                :y2="padding.top + chartH"
                stroke="rgb(var(--s-text-faint))"
                stroke-width="0.5"
                stroke-dasharray="2,2"
                vector-effect="non-scaling-stroke"
            />

            <template v-if="type === 'bar'">
                <rect
                    v-for="(seg, i) in barSegments"
                    :key="`bs-${i}`"
                    :x="seg.x"
                    :y="seg.y"
                    :width="seg.width"
                    :height="seg.height"
                    rx="1"
                    :fill="seg.color"
                    :opacity="seg.active ? 0.85 : 0.35"
                    class="transition-opacity duration-100"
                />
            </template>
            <template v-else>
                <g v-for="(ls, si) in lineSeries" :key="`ls-${si}`">
                    <path
                        v-if="type === 'area'"
                        :d="ls.areaPath ?? ''"
                        :fill="ls.color"
                        :opacity="stacked ? 0.6 : 0.08"
                    />
                    <path
                        :d="ls.linePath"
                        fill="none"
                        :stroke="ls.color"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        vector-effect="non-scaling-stroke"
                    />
                    <template v-if="ls.pts.length <= 20">
                        <circle
                            v-for="(p, i) in ls.pts"
                            :key="`ps-${si}-${i}`"
                            :cx="p.x"
                            :cy="p.y"
                            :r="activeIndex === i ? 4 : 2.5"
                            :fill="activeIndex === i ? ls.color : 'rgb(var(--s-surface))'"
                            :stroke="ls.color"
                            stroke-width="1.5"
                            vector-effect="non-scaling-stroke"
                            class="transition-all duration-100"
                        />
                    </template>
                </g>
            </template>
        </svg>

        <div
            v-if="activeIndex !== null"
            class="absolute pointer-events-none z-10"
            :style="{
                left: `${((padding.left + (activeIndex + 0.5) * (chartW / labels.length)) / viewWidth) * 100}%`,
                top: '8px',
                transform: 'translateX(-50%)',
            }"
        >
            <div
                class="rounded-lg px-2.5 py-1.5 shadow-lg text-center"
                :style="{ background: 'rgb(var(--s-text))', color: 'rgb(var(--s-bg))' }"
            >
                <p class="text-[10px] font-medium opacity-70 mb-0.5">{{ labels[activeIndex] }}</p>
                <div
                    v-for="(s, si) in series"
                    :key="`t-${si}`"
                    class="flex items-center gap-1.5 text-[11px]"
                >
                    <div class="w-1.5 h-1.5 rounded-full" :style="{ background: seriesColor(si) }" />
                    <span class="opacity-70">{{ s.name }}:</span>
                    <span class="font-medium">{{ formatValue(s.data[activeIndex] ?? 0) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
