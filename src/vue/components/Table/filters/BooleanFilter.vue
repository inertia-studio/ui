<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../../shared/utils/cn';
import type { BooleanFilterSchema } from '../../../../shared/types/schema';

const props = defineProps<{
    schema: BooleanFilterSchema;
    value: unknown;
}>();

const emit = defineEmits<{ change: [value: unknown] }>();

const isChecked = computed(() => Boolean(props.value));

function handleToggle() {
    emit('change', isChecked.value ? null : true);
}
</script>

<template>
    <label class="flex cursor-pointer items-center gap-2.5">
        <button
            type="button"
            role="switch"
            :aria-checked="isChecked"
            :class="cn(
                'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-s-accent/30 focus:ring-offset-2',
                isChecked ? 'bg-s-accent' : 'bg-s-border',
            )"
            @click="handleToggle"
        >
            <span
                :class="cn(
                    'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                    isChecked ? 'translate-x-4' : 'translate-x-0',
                )"
            />
        </button>
        <span class="text-sm text-s-text-secondary">{{ schema.label }}</span>
    </label>
</template>
