<script setup lang="ts">
import { computed, ref } from 'vue';
import { cn } from '../../../shared/utils/cn';
import NavItem from './NavItem.vue';
import type { NavigationGroupSchema } from '../../../shared/types/schema';

const props = defineProps<{
    group: NavigationGroupSchema;
    collapsed: boolean;
    pathname: string;
}>();

const hasLabel = computed(() => (props.group.label ?? '').length > 0);
const groupCollapsed = ref(props.group.collapsed);
</script>

<template>
    <div :class="hasLabel ? 'mt-5' : 'mt-1'">
        <div v-if="hasLabel && !collapsed" class="flex items-center justify-between mb-1 px-3">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-s-text-faint">{{ group.label }}</span>
            <button
                v-if="group.collapsible"
                type="button"
                class="p-0.5 text-s-text-faint hover:text-s-text transition-colors"
                @click="groupCollapsed = !groupCollapsed"
            >
                <svg
                    :class="cn('w-3 h-3 transition-transform', groupCollapsed && '-rotate-90')"
                    fill="none"
                    viewBox="0 0 24 24"
                    :stroke-width="2.5"
                    stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
        </div>

        <div v-if="!groupCollapsed" class="space-y-0.5">
            <NavItem
                v-for="(item, j) in group.items ?? []"
                :key="j"
                :item="item"
                :collapsed="collapsed"
                :pathname="pathname"
            />
        </div>
    </div>
</template>
