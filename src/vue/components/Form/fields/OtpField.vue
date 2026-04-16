<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FieldSchema } from '../../../../shared/types/schema';

interface Props {
    schema: FieldSchema;
    value: unknown;
    error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ change: [value: unknown] }>();

const length = computed(() => ((props.schema as Record<string, unknown>).length as number) ?? 6);
const numericOnly = computed(() => ((props.schema as Record<string, unknown>).numericOnly as boolean) ?? true);

const digits = computed(() => String(props.value ?? '').padEnd(length.value, '').slice(0, length.value).split(''));

const inputsRef = ref<(HTMLInputElement | null)[]>([]);

function setInputRef(el: Element | null, i: number) {
    inputsRef.value[i] = el as HTMLInputElement | null;
}

function updateValue(newDigits: string[]) {
    emit('change', newDigits.join(''));
}

function handleInput(index: number, e: Event) {
    const char = (e.target as HTMLInputElement).value.slice(-1);
    if (!char) return;
    if (numericOnly.value && !/^\d$/.test(char)) return;
    if (!numericOnly.value && !/^[a-zA-Z0-9]$/.test(char)) return;

    const newDigits = [...digits.value];
    newDigits[index] = char;
    updateValue(newDigits);

    if (index < length.value - 1) {
        inputsRef.value[index + 1]?.focus();
    }
}

function handleKeyDown(index: number, e: KeyboardEvent) {
    if (e.key === 'Backspace') {
        e.preventDefault();
        const newDigits = [...digits.value];
        if (newDigits[index]) {
            newDigits[index] = '';
            updateValue(newDigits);
        } else if (index > 0) {
            newDigits[index - 1] = '';
            updateValue(newDigits);
            inputsRef.value[index - 1]?.focus();
        }
    } else if (e.key === 'ArrowLeft' && index > 0) {
        inputsRef.value[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length.value - 1) {
        inputsRef.value[index + 1]?.focus();
    }
}

function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const pasted = (e.clipboardData?.getData('text') ?? '').slice(0, length.value);
    const filtered = numericOnly.value ? pasted.replace(/\D/g, '') : pasted.replace(/[^a-zA-Z0-9]/g, '');
    const newDigits = filtered.padEnd(length.value, '').slice(0, length.value).split('');
    updateValue(newDigits);
    inputsRef.value[Math.min(filtered.length, length.value - 1)]?.focus();
}

function handleFocus(e: FocusEvent) {
    (e.target as HTMLInputElement).select();
}
</script>

<template>
    <div class="flex gap-2" @paste="handlePaste">
        <input
            v-for="(_, i) in length"
            :key="i"
            :ref="(el) => setInputRef(el as Element | null, i)"
            type="text"
            :inputmode="numericOnly ? 'numeric' : 'text'"
            :maxlength="1"
            :value="digits[i] || ''"
            class="w-10 h-11 text-center text-lg font-mono font-semibold rounded-lg border border-s-border-strong bg-s-input text-s-text focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30 transition-colors"
            autocomplete="one-time-code"
            @input="handleInput(i, $event)"
            @keydown="handleKeyDown(i, $event)"
            @focus="handleFocus"
        />
    </div>
</template>
