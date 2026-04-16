<script lang="ts">
export interface WizardStep {
    label: string;
    description?: string | null;
    icon?: string | null;
    columns: number;
    schema: unknown[];
}

export interface WizardSchema {
    type: 'wizard';
    showStepNumbers: boolean;
    allowSkip: boolean;
    steps: WizardStep[];
}
</script>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { cn } from '../../../shared/utils/cn';

const props = defineProps<{ schema: WizardSchema }>();

defineSlots<{
    default(props: { schema: unknown[]; columns: number }): unknown;
}>();

const currentStep = ref(0);
const isFirst = computed(() => currentStep.value === 0);
const isLast = computed(() => currentStep.value === props.schema.steps.length - 1);
const step = computed(() => props.schema.steps[currentStep.value]);

function goTo(i: number) {
    if (props.schema.allowSkip || i <= currentStep.value) currentStep.value = i;
}
function goPrev() {
    currentStep.value = Math.max(0, currentStep.value - 1);
}
function goNext() {
    currentStep.value = Math.min(props.schema.steps.length - 1, currentStep.value + 1);
}
</script>

<template>
    <div class="col-span-full">
        <nav class="mb-8">
            <ol class="flex items-center">
                <li
                    v-for="(s, i) in schema.steps"
                    :key="i"
                    :class="cn('flex items-center', i < schema.steps.length - 1 && 'flex-1')"
                >
                    <button
                        type="button"
                        :disabled="!schema.allowSkip && i > currentStep"
                        :class="cn('flex items-center gap-3 group', !schema.allowSkip && i > currentStep && 'cursor-not-allowed')"
                        @click="goTo(i)"
                    >
                        <div
                            :class="cn(
                                'flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 transition-colors',
                                i === currentStep && 'bg-s-accent text-s-accent-fg',
                                i < currentStep && 'bg-s-accent/10 text-s-accent',
                                i !== currentStep && i >= currentStep && 'bg-s-surface-alt text-s-text-faint',
                            )"
                        >
                            <svg
                                v-if="i < currentStep"
                                class="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                :stroke-width="2.5"
                                stroke="currentColor"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            <template v-else-if="schema.showStepNumbers">{{ i + 1 }}</template>
                            <div v-else class="w-2 h-2 rounded-full bg-current" />
                        </div>

                        <div class="hidden sm:block text-left">
                            <p :class="cn('text-sm font-medium transition-colors', i === currentStep ? 'text-s-text' : 'text-s-text-muted')">
                                {{ s.label }}
                            </p>
                            <p v-if="s.description" class="text-xs text-s-text-faint">{{ s.description }}</p>
                        </div>
                    </button>

                    <div
                        v-if="i < schema.steps.length - 1"
                        :class="cn('flex-1 h-px mx-4 transition-colors', i < currentStep ? 'bg-s-accent/30' : 'bg-s-border')"
                    />
                </li>
            </ol>
        </nav>

        <div
            :class="cn(
                'grid gap-4',
                step.columns === 1 && 'grid-cols-1',
                step.columns === 2 && 'grid-cols-2',
                step.columns === 3 && 'grid-cols-3',
                step.columns === 4 && 'grid-cols-4',
            )"
        >
            <slot :schema="step.schema" :columns="step.columns" />
        </div>

        <div class="flex items-center justify-between mt-6 pt-4 border-t border-s-border col-span-full">
            <button
                type="button"
                :disabled="isFirst"
                :class="cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    isFirst
                        ? 'text-s-text-faint cursor-not-allowed'
                        : 'text-s-text-secondary border border-s-border hover:bg-s-hover',
                )"
                @click="goPrev"
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" :stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                Back
            </button>

            <button
                v-if="isLast"
                type="submit"
                class="inline-flex items-center gap-1.5 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-s-accent-fg hover:opacity-90 transition-opacity"
            >Submit</button>
            <button
                v-else
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-s-accent-fg hover:opacity-90 transition-opacity"
                @click="goNext"
            >
                Next
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" :stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </div>
    </div>
</template>
