<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { cn } from '../../../shared/utils/cn';
import type { DateRange } from './types';

interface Props {
    modelValue: DateRange | null;
    placeholder?: string;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Select date range',
    disabled: false,
});

const emit = defineEmits<{ 'update:modelValue': [value: DateRange | null] }>();

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }
function toDateStr(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function formatShort(dateStr: string) { const d = new Date(dateStr + 'T00:00:00'); return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; }
function compareDates(a: string, b: string) { return a.localeCompare(b); }

const open = ref(false);
const selecting = ref<'from' | 'to'>('from');
const tempFrom = ref<string | null>(props.modelValue?.from ?? null);
const tempTo = ref<string | null>(props.modelValue?.to ?? null);
const hoverDate = ref<string | null>(null);
const containerRef = ref<HTMLElement | null>(null);

const today = new Date();
const viewYear = ref(today.getFullYear());
const viewMonth = ref(today.getMonth());

watch(() => [props.modelValue?.from, props.modelValue?.to], () => {
    tempFrom.value = props.modelValue?.from ?? null;
    tempTo.value = props.modelValue?.to ?? null;
});

function handleClickOutside(e: MouseEvent) {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) open.value = false;
}

watch(open, (o) => {
    if (o) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
});
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside));

function handleOpen() {
    if (props.disabled) return;
    open.value = true;
    selecting.value = 'from';
    if (props.modelValue?.from) {
        const d = new Date(props.modelValue.from + 'T00:00:00');
        viewYear.value = d.getFullYear();
        viewMonth.value = d.getMonth();
    }
}

function handleDayClick(dateStr: string) {
    if (selecting.value === 'from') {
        tempFrom.value = dateStr;
        tempTo.value = null;
        selecting.value = 'to';
    } else {
        let from = tempFrom.value!;
        let to = dateStr;
        if (compareDates(from, to) > 0) [from, to] = [to, from];
        tempFrom.value = from;
        tempTo.value = to;
        emit('update:modelValue', { from, to });
        open.value = false;
        selecting.value = 'from';
    }
}

function isInRange(dateStr: string): boolean {
    if (!tempFrom.value) return false;
    const end = selecting.value === 'to' ? (hoverDate.value ?? tempTo.value) : tempTo.value;
    if (!end) return false;
    let a = tempFrom.value;
    let b = end;
    if (compareDates(a, b) > 0) [a, b] = [b, a];
    return compareDates(dateStr, a) >= 0 && compareDates(dateStr, b) <= 0;
}
function isRangeStart(dateStr: string): boolean {
    if (!tempFrom.value) return false;
    const end = selecting.value === 'to' ? (hoverDate.value ?? tempTo.value) : tempTo.value;
    if (!end) return dateStr === tempFrom.value;
    const a = compareDates(tempFrom.value, end) <= 0 ? tempFrom.value : end;
    return dateStr === a;
}
function isRangeEnd(dateStr: string): boolean {
    if (!tempFrom.value) return false;
    const end = selecting.value === 'to' ? (hoverDate.value ?? tempTo.value) : tempTo.value;
    if (!end) return false;
    const b = compareDates(tempFrom.value, end) <= 0 ? end : tempFrom.value;
    return dateStr === b;
}

const daysInMonth = computed(() => getDaysInMonth(viewYear.value, viewMonth.value));
const firstDay = computed(() => getFirstDayOfMonth(viewYear.value, viewMonth.value));
const calendarDays = computed<(number | null)[]>(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay.value; i++) days.push(null);
    for (let d = 1; d <= daysInMonth.value; d++) days.push(d);
    return days;
});

function handlePrev() {
    if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value--; }
    else viewMonth.value--;
}
function handleNext() {
    if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++; }
    else viewMonth.value++;
}

const displayText = computed(() => {
    const v = props.modelValue;
    if (v?.from && v?.to) return `${formatShort(v.from)} — ${formatShort(v.to)}`;
    if (v?.from) return `${formatShort(v.from)} — ...`;
    return props.placeholder;
});

function isToday(day: number) {
    return day === today.getDate() && viewMonth.value === today.getMonth() && viewYear.value === today.getFullYear();
}

function dateStrFor(day: number): string {
    return toDateStr(new Date(viewYear.value, viewMonth.value, day));
}

const presets = [
    { label: 'Today', fn: () => { const t = toDateStr(today); return { from: t, to: t }; } },
    { label: '7d', fn: () => ({ from: toDateStr(new Date(today.getTime() - 6 * 86400000)), to: toDateStr(today) }) },
    { label: '30d', fn: () => ({ from: toDateStr(new Date(today.getTime() - 29 * 86400000)), to: toDateStr(today) }) },
    { label: 'Month', fn: () => ({ from: toDateStr(new Date(today.getFullYear(), today.getMonth(), 1)), to: toDateStr(today) }) },
];

function applyPreset(fn: () => DateRange) {
    emit('update:modelValue', fn());
    open.value = false;
}
</script>

<template>
    <div ref="containerRef" class="relative">
        <button
            type="button"
            :disabled="disabled"
            :class="cn(
                'flex w-full items-center gap-2 rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm text-left transition-colors',
                'hover:border-s-border-strong focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                modelValue?.from ? 'text-s-text' : 'text-s-text-faint',
            )"
            @click="handleOpen"
        >
            <svg class="w-4 h-4 text-s-text-faint shrink-0" fill="none" viewBox="0 0 24 24" :stroke-width="1.75" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span class="flex-1 truncate">{{ displayText }}</span>
            <button
                v-if="modelValue?.from"
                type="button"
                class="p-0.5 rounded text-s-text-faint hover:text-s-text transition-colors"
                @click.stop="emit('update:modelValue', null)"
            >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </button>

        <div v-if="open" class="absolute right-0 top-full z-50 mt-1 w-[300px] rounded-xl border border-s-border bg-s-surface p-3 shadow-lg">
            <div class="flex items-stretch gap-0 mb-3 rounded-lg border border-s-border overflow-hidden text-xs">
                <button
                    type="button"
                    :class="cn(
                        'flex-1 px-3 py-2 text-center transition-colors',
                        selecting === 'from' ? 'bg-s-accent/10 text-s-accent font-medium' : 'text-s-text-muted hover:bg-s-hover',
                    )"
                    @click="selecting = 'from'"
                >{{ tempFrom ? formatShort(tempFrom) : 'Start date' }}</button>
                <div class="w-px bg-s-border" />
                <button
                    type="button"
                    :class="cn(
                        'flex-1 px-3 py-2 text-center transition-colors',
                        selecting === 'to' ? 'bg-s-accent/10 text-s-accent font-medium' : 'text-s-text-muted hover:bg-s-hover',
                    )"
                    @click="selecting = 'to'"
                >{{ tempTo ? formatShort(tempTo) : 'End date' }}</button>
            </div>

            <div class="flex items-center justify-between mb-3">
                <button type="button" class="p-1 rounded-md text-s-text-muted hover:bg-s-hover hover:text-s-text transition-colors" @click="handlePrev">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <span class="text-sm font-medium text-s-text">{{ MONTHS_FULL[viewMonth] }} {{ viewYear }}</span>
                <button type="button" class="p-1 rounded-md text-s-text-muted hover:bg-s-hover hover:text-s-text transition-colors" @click="handleNext">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>

            <div class="grid grid-cols-7 mb-1">
                <div v-for="d in DAYS" :key="d" class="text-center text-[11px] font-medium text-s-text-faint py-1">{{ d }}</div>
            </div>

            <div class="grid grid-cols-7">
                <template v-for="(day, i) in calendarDays" :key="i">
                    <div v-if="day === null" />
                    <div v-else class="flex items-center justify-center h-9 relative">
                        <div
                            v-if="isInRange(dateStrFor(day))"
                            :class="cn(
                                'absolute inset-y-1 inset-x-0 bg-s-accent/10',
                                isRangeStart(dateStrFor(day)) && 'rounded-l-lg left-1',
                                isRangeEnd(dateStrFor(day)) && 'rounded-r-lg right-1',
                            )"
                        />
                        <button
                            type="button"
                            :class="cn(
                                'relative z-10 w-8 h-8 rounded-lg text-sm transition-colors',
                                (isRangeStart(dateStrFor(day)) || isRangeEnd(dateStrFor(day)))
                                    ? 'bg-s-accent text-s-accent-fg font-medium'
                                    : isToday(day)
                                        ? 'font-medium text-s-text'
                                        : isInRange(dateStrFor(day))
                                            ? 'text-s-accent'
                                            : 'text-s-text-secondary hover:bg-s-hover',
                            )"
                            @click="handleDayClick(dateStrFor(day))"
                            @mouseenter="() => { if (selecting === 'to') hoverDate = dateStrFor(day); }"
                            @mouseleave="hoverDate = null"
                        >{{ day }}</button>
                    </div>
                </template>
            </div>

            <div class="flex items-center gap-1 mt-3 pt-3 border-t border-s-border">
                <button
                    v-for="preset in presets"
                    :key="preset.label"
                    type="button"
                    class="px-2 py-1 text-[11px] font-medium rounded-md text-s-text-muted hover:bg-s-hover hover:text-s-text transition-colors"
                    @click="applyPreset(preset.fn)"
                >{{ preset.label }}</button>
                <div class="flex-1" />
                <button
                    v-if="modelValue?.from"
                    type="button"
                    class="px-2 py-1 text-[11px] font-medium rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
                    @click="() => { emit('update:modelValue', null); open = false; }"
                >Clear</button>
            </div>
        </div>
    </div>
</template>
