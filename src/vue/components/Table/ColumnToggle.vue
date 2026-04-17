<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { cn } from '../../../shared/utils/cn';
import type { ColumnSchema } from '../../../shared/types/schema';

interface Props {
    columns: ColumnSchema[];
    hiddenColumns: Set<string>;
}

const props = defineProps<Props>();
const emit = defineEmits<{ toggle: [columnName: string] }>();

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const toggleableColumns = computed(() => props.columns.filter((col) => col.toggleable));

function handleClickOutside(e: MouseEvent) {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) isOpen.value = false;
}

onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside);
});
onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
    <div v-if="toggleableColumns.length > 0" ref="containerRef" class="relative">
        <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border border-s-border-strong bg-s-input px-3 py-2 text-sm font-medium text-s-text-secondary transition-colors hover:bg-s-hover"
            aria-label="Toggle columns"
            @click="isOpen = !isOpen"
        >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" :stroke-width="2" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Columns
        </button>

        <div v-if="isOpen" class="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-s-border bg-s-surface py-1 shadow-lg">
            <button
                v-for="column in toggleableColumns"
                :key="column.name"
                type="button"
                class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-s-text-secondary transition-colors hover:bg-s-hover"
                @click="emit('toggle', column.name)"
            >
                <span
                    :class="cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        !hiddenColumns.has(column.name)
                            ? 'border-s-accent bg-s-accent text-white'
                            : 'border-s-border-strong',
                    )"
                >
                    <svg
                        v-if="!hiddenColumns.has(column.name)"
                        class="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        :stroke-width="3"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                </span>
                <span class="truncate">{{ column.label }}</span>
            </button>
        </div>
    </div>
</template>
