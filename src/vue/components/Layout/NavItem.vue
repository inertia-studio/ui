<script setup lang="ts">
import { computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import { cn } from '../../../shared/utils/cn';
import SchemaIcon from '../Icon/SchemaIcon.vue';
import type { NavigationItemSchema } from '../../../shared/types/schema';

const props = defineProps<{
    item: NavigationItemSchema;
    collapsed: boolean;
    pathname: string;
}>();

const badgeColorClasses: Record<string, string> = {
    info: 'bg-s-accent/10 text-s-accent',
    success: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    danger: 'bg-red-500/10 text-red-600',
};

const isActive = computed(
    () =>
        props.item.isActive ||
        props.pathname === props.item.url ||
        props.pathname.startsWith(props.item.url + '/'),
);

const badgeColor = computed(() => {
    const raw = (props.item as unknown as { badgeColor?: string }).badgeColor ?? 'info';
    return badgeColorClasses[raw] ?? badgeColorClasses.info;
});
</script>

<template>
    <Link
        :href="item.url"
        :class="cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
            isActive
                ? 'font-medium text-s-text bg-s-surface-alt'
                : 'text-s-text-secondary hover:bg-s-hover hover:text-s-text',
            collapsed && 'justify-center px-0',
        )"
    >
        <SchemaIcon :schema="item.icon" size="md" class="shrink-0 w-[18px] h-[18px]" />
        <template v-if="!collapsed">
            <span class="flex-1">{{ item.label }}</span>
            <span
                v-if="item.badge != null"
                :class="cn('text-[11px] px-1.5 py-0.5 rounded-full font-medium', badgeColor)"
            >{{ item.badge }}</span>
        </template>
    </Link>
</template>
