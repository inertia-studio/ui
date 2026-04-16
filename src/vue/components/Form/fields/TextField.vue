<script setup lang="ts">
import { cn } from '../../../../shared/utils/cn';
import type { TextFieldSchema } from '../../../../shared/types/schema';
import { inputClasses } from './_shared';

interface Props {
    schema: TextFieldSchema;
    value: string | null;
    error?: string | null;
}

defineProps<Props>();
const emit = defineEmits<{ change: [value: string] }>();
</script>

<template>
    <div class="relative">
        <div class="flex">
            <span
                v-if="schema.prefix"
                class="inline-flex items-center rounded-l-lg border border-r-0 border-s-border-strong bg-s-bg px-3 text-sm text-s-text-muted"
            >{{ schema.prefix }}</span>
            <input
                :id="schema.name"
                type="text"
                :value="value ?? ''"
                :placeholder="schema.placeholder ?? undefined"
                :disabled="schema.disabled"
                :maxlength="schema.maxLength ?? undefined"
                :minlength="schema.minLength ?? undefined"
                :class="cn(
                    inputClasses,
                    schema.prefix && 'rounded-l-none',
                    schema.suffix && 'rounded-r-none',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                )"
                @input="emit('change', ($event.target as HTMLInputElement).value)"
            />
            <span
                v-if="schema.suffix"
                class="inline-flex items-center rounded-r-lg border border-l-0 border-s-border-strong bg-s-bg px-3 text-sm text-s-text-muted"
            >{{ schema.suffix }}</span>
        </div>
        <span
            v-if="schema.maxLength !== null"
            class="absolute bottom-1 right-2 text-xs text-s-text-faint"
        >{{ (value ?? '').length }}/{{ schema.maxLength }}</span>
    </div>
</template>
