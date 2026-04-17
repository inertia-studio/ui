<script setup lang="ts">
import { cn } from '../../../../shared/utils/cn';
import type { ColorPickerFieldSchema } from '../../../../shared/types/schema';
import { inputClasses } from './_shared';

interface Props {
    schema: ColorPickerFieldSchema;
    value: string | null;
    error?: string | null;
}

defineProps<Props>();
const emit = defineEmits<{ change: [value: string] }>();
</script>

<template>
    <div class="space-y-2">
        <div class="flex items-center gap-2">
            <input
                type="color"
                :value="value ?? '#000000'"
                :disabled="schema.disabled"
                class="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-s-border-strong p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                @input="emit('change', ($event.target as HTMLInputElement).value)"
            />
            <input
                :id="schema.name"
                type="text"
                :value="value ?? ''"
                :placeholder="schema.format === 'hex' ? '#000000' : schema.format"
                :disabled="schema.disabled"
                :class="cn(inputClasses, error && 'border-red-500 focus:border-red-500 focus:ring-red-500')"
                @input="emit('change', ($event.target as HTMLInputElement).value)"
            />
        </div>
        <div v-if="schema.swatches.length > 0" class="flex flex-wrap gap-1.5">
            <button
                v-for="swatch in schema.swatches"
                :key="swatch"
                type="button"
                :disabled="schema.disabled"
                :class="cn(
                    'h-6 w-6 rounded border-2 transition-transform hover:scale-110',
                    value === swatch ? 'border-s-accent ring-1 ring-s-accent' : 'border-s-border',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                )"
                :style="{ backgroundColor: swatch }"
                :title="swatch"
                :aria-label="`Select color ${swatch}`"
                @click="emit('change', swatch)"
            />
        </div>
    </div>
</template>
