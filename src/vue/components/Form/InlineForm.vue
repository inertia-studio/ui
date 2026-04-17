<script setup lang="ts">
import { reactive, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import type {
    FieldSchema,
    FormComponentSchema,
    SectionSchema,
    TabsSchema,
} from '../../../shared/types/schema';
import FormComponents from './FormComponents.vue';

interface Props {
    schema: FormComponentSchema[];
    label?: string;
    actionUrl?: string | null;
    method?: string;
}

const props = withDefaults(defineProps<Props>(), { method: 'POST' });

function extractDefaults(components: FormComponentSchema[]): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const component of components) {
        if (component.type === 'section') {
            Object.assign(data, extractDefaults((component as SectionSchema).schema));
        } else if (component.type === 'tabs') {
            for (const tab of (component as TabsSchema).tabs) {
                Object.assign(data, extractDefaults(tab.schema));
            }
        } else if ((component as unknown as { type: string }).type === 'wizard') {
            const steps = (component as unknown as { steps: { schema: FormComponentSchema[] }[] }).steps ?? [];
            for (const step of steps) {
                Object.assign(data, extractDefaults(step.schema));
            }
        } else {
            const field = component as FieldSchema;
            data[field.name] = field.default ?? null;
        }
    }
    return data;
}

const data = reactive<Record<string, unknown>>(extractDefaults(props.schema));
const errors = reactive<Record<string, string>>({});
const processing = ref(false);
const success = ref(false);

function handleFieldChange(name: string, value: unknown) {
    data[name] = value;
    if (errors[name]) delete errors[name];
}

function handleSubmit(e: Event) {
    e.preventDefault();
    if (!props.actionUrl) return;

    processing.value = true;
    success.value = false;

    const methodLower = props.method.toLowerCase();
    const routerMethod =
        methodLower === 'put' ? 'put' :
        methodLower === 'patch' ? 'patch' :
        methodLower === 'delete' ? 'delete' :
        'post';

    (router[routerMethod] as (url: string, data: Record<string, unknown>, opts: unknown) => void)(
        props.actionUrl,
        { ...data },
        {
            preserveScroll: true,
            onSuccess: () => {
                processing.value = false;
                success.value = true;
                setTimeout(() => (success.value = false), 3000);
            },
            onError: (validationErrors: Record<string, string>) => {
                processing.value = false;
                for (const [k, v] of Object.entries(validationErrors)) {
                    errors[k] = v;
                }
            },
        },
    );
}
</script>

<template>
    <form class="rounded-xl border border-s-border bg-s-surface overflow-hidden" @submit="handleSubmit">
        <div v-if="label" class="border-b border-s-border px-5 py-3.5">
            <h3 class="text-sm font-semibold text-s-text">{{ label }}</h3>
        </div>

        <div class="p-5 space-y-4">
            <div class="grid grid-cols-1 gap-4">
                <FormComponents
                    :components="schema"
                    :data="data"
                    :errors="errors"
                    @field-change="handleFieldChange"
                />
            </div>

            <div v-if="actionUrl" class="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    :disabled="processing"
                    class="inline-flex items-center gap-2 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg v-if="processing" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submit
                </button>
                <span v-if="success" class="text-sm text-emerald-600">Submitted successfully!</span>
            </div>
        </div>
    </form>
</template>
