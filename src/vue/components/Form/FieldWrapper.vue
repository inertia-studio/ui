<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../shared/utils/cn';
import type { FieldSchema } from '../../../shared/types/schema';
import { useStudioHooks } from '../../composables/useStudioHooks';

interface Props {
    schema: FieldSchema;
    error?: string | null;
}

const props = defineProps<Props>();
const { invoke, has } = useStudioHooks();

const colSpanClass = computed(() => {
    if (props.schema.columnSpan === 'full') return 'col-span-full';
    if (typeof props.schema.columnSpan === 'number' && props.schema.columnSpan > 1) {
        return `col-span-${props.schema.columnSpan}`;
    }
    return undefined;
});

// For hook, we pass a sentinel since Vue slots can't easily be serialized
const hookResult = computed(() => (has('form:field-wrapper') ? invoke('form:field-wrapper', props.schema, null) : null));
</script>

<template>
    <template v-if="!schema.hidden">
        <component v-if="hookResult" :is="hookResult" />
        <div v-else :class="cn('space-y-1', colSpanClass)">
            <label
                v-if="schema.label"
                :for="schema.name"
                class="block text-sm font-medium text-s-text-secondary"
            >
                {{ schema.label }}
                <span v-if="schema.required" class="ml-0.5 text-red-500">*</span>
            </label>
            <p v-if="schema.hint" class="text-xs text-s-text-muted">{{ schema.hint }}</p>

            <slot />

            <p v-if="schema.helperText" class="text-xs text-s-text-muted">{{ schema.helperText }}</p>
            <p v-if="error" class="text-sm text-red-500 mt-1">{{ error }}</p>
        </div>
    </template>
</template>
