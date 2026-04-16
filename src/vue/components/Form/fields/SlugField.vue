<script setup lang="ts">
import { cn } from '../../../../shared/utils/cn';
import type { SlugFieldSchema } from '../../../../shared/types/schema';
import { inputClasses } from './_shared';

interface Props {
    schema: SlugFieldSchema;
    value: string | null;
    error?: string | null;
}

defineProps<Props>();
const emit = defineEmits<{ change: [value: string] }>();
</script>

<template>
    <div>
        <div class="flex">
            <span v-if="schema.prefix" class="inline-flex items-center rounded-l-lg border border-r-0 border-s-border-strong bg-s-bg px-3 text-sm text-s-text-muted">{{ schema.prefix }}</span>
            <input
                :id="schema.name"
                type="text"
                :value="value ?? ''"
                :placeholder="schema.placeholder ?? undefined"
                :disabled="schema.disabled"
                :class="cn(
                    inputClasses,
                    schema.prefix && 'rounded-l-none',
                    schema.suffix && 'rounded-r-none',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                )"
                @input="emit('change', ($event.target as HTMLInputElement).value)"
            />
            <span v-if="schema.suffix" class="inline-flex items-center rounded-r-lg border border-l-0 border-s-border-strong bg-s-bg px-3 text-sm text-s-text-muted">{{ schema.suffix }}</span>
        </div>
        <p class="mt-1 text-xs text-s-text-faint">
            Auto-generated from <span class="font-medium">{{ schema.from }}</span>
        </p>
    </div>
</template>
