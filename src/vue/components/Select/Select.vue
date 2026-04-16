<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { cn } from '../../../shared/utils/cn';
import type { SelectOption } from './types';

interface Props {
    modelValue: string | string[] | null;
    options?: SelectOption[] | Record<string, string>;
    placeholder?: string;
    searchable?: boolean;
    multiple?: boolean;
    disabled?: boolean;
    class?: string;
    searchUrl?: string;
    preload?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Select...',
    searchable: false,
    multiple: false,
    disabled: false,
    preload: false,
});

const emit = defineEmits<{ 'update:modelValue': [value: string | string[] | null] }>();

function normalizeOptions(options: SelectOption[] | Record<string, string> | undefined): SelectOption[] {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    return Object.entries(options).map(([value, label]) => ({ value, label }));
}

const open = ref(false);
const search = ref('');
const serverOptions = ref<SelectOption[]>([]);
const loading = ref(false);

const containerRef = ref<HTMLElement | null>(null);
const searchRef = ref<HTMLInputElement | null>(null);

const isServerSearch = computed(() => !!props.searchUrl);

const options = computed<SelectOption[]>(() => {
    if (isServerSearch.value) return serverOptions.value;
    return normalizeOptions(props.options);
});

const filtered = computed<SelectOption[]>(() => {
    if (isServerSearch.value) return options.value;
    if (!search.value) return options.value;
    const q = search.value.toLowerCase();
    return options.value.filter(
        (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
});

const selectedValues = computed<string[]>(() => {
    const v = props.modelValue;
    if (v === null || v === undefined) return [];
    return Array.isArray(v) ? v : [v];
});

const selectedLabels = computed(() =>
    selectedValues.value
        .map((v) => options.value.find((o) => o.value === v)?.label ?? v)
        .join(', '),
);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch([search, open, () => props.searchUrl, () => props.preload], () => {
    if (!isServerSearch.value) return;
    if (debounceTimer) clearTimeout(debounceTimer);

    if (!search.value && !props.preload && !open.value) {
        serverOptions.value = [];
        return;
    }

    loading.value = true;
    debounceTimer = setTimeout(async () => {
        try {
            const url = `${props.searchUrl}?search=${encodeURIComponent(search.value)}`;
            const res = await fetch(url, {
                credentials: 'same-origin',
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                serverOptions.value = Array.isArray(data) ? data : [];
            }
        } catch {
            serverOptions.value = [];
        } finally {
            loading.value = false;
        }
    }, search.value ? 300 : 0);
});

function handleClickOutside(e: MouseEvent) {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
        open.value = false;
        search.value = '';
    }
}

watch(open, (o) => {
    if (o) {
        document.addEventListener('mousedown', handleClickOutside);
        if (props.searchable) {
            nextTick(() => searchRef.value?.focus());
        }
    } else {
        document.removeEventListener('mousedown', handleClickOutside);
    }
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
    if (debounceTimer) clearTimeout(debounceTimer);
});

function handleSelect(optionValue: string) {
    if (props.multiple) {
        const current = Array.isArray(props.modelValue) ? props.modelValue : [];
        if (current.includes(optionValue)) {
            const next = current.filter((v) => v !== optionValue);
            emit('update:modelValue', next.length > 0 ? next : null);
        } else {
            emit('update:modelValue', [...current, optionValue]);
        }
    } else {
        emit('update:modelValue', optionValue);
        open.value = false;
        search.value = '';
    }
}

function handleClear(e: MouseEvent) {
    e.stopPropagation();
    emit('update:modelValue', null);
    search.value = '';
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
                selectedValues.length > 0 ? 'text-s-text' : 'text-s-text-faint',
                $props.class,
            )"
            @click="() => !disabled && (open = !open)"
        >
            <span class="flex-1 truncate">
                {{ selectedValues.length > 0 ? selectedLabels : placeholder }}
            </span>
            <button
                v-if="selectedValues.length > 0"
                type="button"
                class="p-0.5 rounded text-s-text-faint hover:text-s-text transition-colors"
                @click="handleClear"
            >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
            <svg
                :class="cn('w-4 h-4 text-s-text-faint shrink-0 transition-transform', open && 'rotate-180')"
                fill="none"
                viewBox="0 0 24 24"
                :stroke-width="2"
                stroke="currentColor"
            >
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
        </button>

        <div v-if="open" class="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-s-border bg-s-surface shadow-lg overflow-hidden">
            <div v-if="searchable" class="p-2 border-b border-s-border">
                <div class="relative">
                    <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-s-text-faint" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                        ref="searchRef"
                        type="text"
                        :value="search"
                        placeholder="Search..."
                        class="w-full h-8 pl-8 pr-3 text-sm rounded-lg border border-s-border bg-s-input text-s-text placeholder:text-s-text-faint focus:outline-none focus:border-s-accent focus:ring-1 focus:ring-s-accent/30"
                        @input="(e: Event) => (search = (e.target as HTMLInputElement).value)"
                    />
                </div>
            </div>

            <div class="max-h-56 overflow-y-auto py-1">
                <div v-if="loading" class="flex items-center justify-center px-3 py-4 text-sm text-s-text-muted">
                    <svg class="mr-2 h-4 w-4 animate-spin text-s-text-faint" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Searching...
                </div>
                <div v-else-if="filtered.length === 0" class="px-3 py-4 text-center text-sm text-s-text-muted">
                    No options found
                </div>
                <button
                    v-for="option in filtered"
                    v-else
                    :key="option.value"
                    type="button"
                    :class="cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                        selectedValues.includes(option.value)
                            ? 'bg-s-accent/10 text-s-accent font-medium'
                            : 'text-s-text-secondary hover:bg-s-hover hover:text-s-text',
                    )"
                    @click="handleSelect(option.value)"
                >
                    <div
                        v-if="multiple"
                        :class="cn(
                            'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                            selectedValues.includes(option.value) ? 'bg-s-accent border-s-accent' : 'border-s-border-strong',
                        )"
                    >
                        <svg v-if="selectedValues.includes(option.value)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" :stroke-width="3" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    </div>
                    <span class="flex-1">{{ option.label }}</span>
                    <svg
                        v-if="!multiple && selectedValues.includes(option.value)"
                        class="w-4 h-4 text-s-accent shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        :stroke-width="2"
                        stroke="currentColor"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>
