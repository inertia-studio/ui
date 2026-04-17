<script setup lang="ts">
import { computed } from 'vue';
import { type DataPoint, type Series, CHART_COLORS } from './_chartTypes';
import CartesianChart from './CartesianChart.vue';
import MultiSeriesChart from './MultiSeriesChart.vue';
import DonutChart from './DonutChart.vue';

interface Props {
    type: 'line' | 'area' | 'bar' | 'donut';
    data: DataPoint[];
    label?: string;
    description?: string;
    color?: string;
    colors?: string[];
    height?: string;
    series?: Series[];
    labels?: string[];
    stacked?: boolean;
}

const props = withDefaults(defineProps<Props>(), { height: '200px' });

const hasMultiSeries = computed(
    () => !!(props.series && props.series.length > 0 && props.labels && props.labels.length > 0),
);
const hasData = computed(() => hasMultiSeries.value || (props.data && props.data.length > 0));
</script>

<template>
    <div class="rounded-xl border border-s-border bg-s-surface p-5">
        <template v-if="!hasData">
            <p v-if="label" class="text-sm font-medium text-s-text mb-2">{{ label }}</p>
            <div class="flex items-center justify-center text-sm text-s-text-faint" :style="{ height }">No data</div>
        </template>
        <template v-else>
            <div v-if="label || description" class="mb-4">
                <p v-if="label" class="text-sm font-medium text-s-text">{{ label }}</p>
                <p v-if="description" class="text-xs text-s-text-muted mt-0.5">{{ description }}</p>
            </div>
            <DonutChart v-if="type === 'donut'" :data="data" :colors="colors" :height="height" />
            <MultiSeriesChart
                v-else-if="hasMultiSeries"
                :type="type as 'line' | 'area' | 'bar'"
                :series="series!"
                :labels="labels!"
                :stacked="stacked"
                :colors="colors"
                :height="height"
            />
            <CartesianChart
                v-else
                :type="type as 'line' | 'area' | 'bar'"
                :data="data"
                :color="color"
                :height="height"
            />
            <div v-if="hasMultiSeries" class="flex items-center gap-4 mt-3 pt-3 border-t border-s-border">
                <div v-for="(s, i) in series!" :key="s.name" class="flex items-center gap-1.5">
                    <div
                        class="w-2.5 h-2.5 rounded-full"
                        :style="{ background: s.color || CHART_COLORS[i % CHART_COLORS.length] }"
                    />
                    <span class="text-xs text-s-text-muted">{{ s.name }}</span>
                </div>
            </div>
        </template>
    </div>
</template>
