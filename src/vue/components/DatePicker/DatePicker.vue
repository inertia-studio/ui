<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { cn } from '../../../shared/utils/cn';

interface Props {
    modelValue: string | null;
    placeholder?: string;
    class?: string;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Pick a date',
    disabled: false,
});

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>();

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}
function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
function formatDisplay(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const open = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const today = new Date();
const selected = computed(() => (props.modelValue ? new Date(props.modelValue + 'T00:00:00') : null));

const viewYear = ref(selected.value?.getFullYear() ?? today.getFullYear());
const viewMonth = ref(selected.value?.getMonth() ?? today.getMonth());

const daysInMonth = computed(() => getDaysInMonth(viewYear.value, viewMonth.value));
const firstDay = computed(() => getFirstDayOfMonth(viewYear.value, viewMonth.value));

const calendarDays = computed(() => {
    const days: Array<{ day: number; current: boolean } | null> = [];
    for (let i = 0; i < firstDay.value; i++) days.push(null);
    for (let d = 1; d <= daysInMonth.value; d++) days.push({ day: d, current: true });
    return days;
});

function handlePrev() {
    if (viewMonth.value === 0) {
        viewMonth.value = 11;
        viewYear.value--;
    } else viewMonth.value--;
}
function handleNext() {
    if (viewMonth.value === 11) {
        viewMonth.value = 0;
        viewYear.value++;
    } else viewMonth.value++;
}
function handleSelect(day: number) {
    const d = new Date(viewYear.value, viewMonth.value, day);
    emit('update:modelValue', formatDate(d));
    open.value = false;
}

function isToday(day: number) {
    return day === today.getDate() && viewMonth.value === today.getMonth() && viewYear.value === today.getFullYear();
}
function isSelected(day: number) {
    const s = selected.value;
    if (!s) return false;
    return day === s.getDate() && viewMonth.value === s.getMonth() && viewYear.value === s.getFullYear();
}

function handleClickOutside(e: MouseEvent) {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) open.value = false;
}

watch(open, (o) => {
    if (o) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
});
onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
});

function clearDate(e: MouseEvent) {
    e.stopPropagation();
    emit('update:modelValue', null);
}

function pickToday() {
    emit('update:modelValue', formatDate(today));
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
                modelValue ? 'text-s-text' : 'text-s-text-faint',
                $props.class,
            )"
            @click="() => !disabled && (open = !open)"
        >
            <svg class="w-4 h-4 text-s-text-faint shrink-0" fill="none" viewBox="0 0 24 24" :stroke-width="1.75" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span class="flex-1 truncate">{{ modelValue ? formatDisplay(modelValue) : placeholder }}</span>
            <button
                v-if="modelValue"
                type="button"
                class="p-0.5 rounded text-s-text-faint hover:text-s-text transition-colors"
                @click="clearDate"
            >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </button>

        <div v-if="open" class="absolute left-0 top-full z-50 mt-1 w-[280px] rounded-xl border border-s-border bg-s-surface p-3 shadow-lg">
            <div class="flex items-center justify-between mb-3">
                <button type="button" class="p-1 rounded-md text-s-text-muted hover:bg-s-hover hover:text-s-text transition-colors" @click="handlePrev">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <span class="text-sm font-medium text-s-text">{{ MONTHS[viewMonth] }} {{ viewYear }}</span>
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
                <div v-for="(cell, i) in calendarDays" :key="i" class="aspect-square flex items-center justify-center">
                    <button
                        v-if="cell"
                        type="button"
                        :class="cn(
                            'w-8 h-8 rounded-lg text-sm transition-colors',
                            isSelected(cell.day)
                                ? 'bg-s-accent text-s-accent-fg font-medium'
                                : isToday(cell.day)
                                    ? 'bg-s-surface-alt text-s-text font-medium'
                                    : 'text-s-text-secondary hover:bg-s-hover',
                        )"
                        @click="handleSelect(cell.day)"
                    >{{ cell.day }}</button>
                </div>
            </div>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-s-border">
                <button type="button" class="text-xs font-medium text-s-accent hover:underline" @click="pickToday">Today</button>
                <button
                    v-if="modelValue"
                    type="button"
                    class="text-xs font-medium text-s-text-muted hover:text-s-text transition-colors"
                    @click="() => { emit('update:modelValue', null); open = false; }"
                >Clear</button>
            </div>
        </div>
    </div>
</template>
