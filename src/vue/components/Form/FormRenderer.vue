<script setup lang="ts">
import { computed } from 'vue';
import { useForm } from '@inertiajs/vue3';
import type {
    FieldSchema,
    FormComponentSchema,
    FormSchema,
    SectionSchema,
    TabsSchema,
} from '../../../shared/types/schema';
import { useStudioHooks } from '../../composables/useStudioHooks';
import FormComponents from './FormComponents.vue';

interface Props {
    schema: FormSchema;
    record?: Record<string, unknown>;
    module: { slug: string };
    panelPath: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ success: [] }>();

const { invoke, has } = useStudioHooks();

function extractDefaults(
    components: FormComponentSchema[],
    record?: Record<string, unknown>,
): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const component of components) {
        if (component.type === 'section') {
            Object.assign(data, extractDefaults((component as SectionSchema).schema, record));
        } else if (component.type === 'tabs') {
            for (const tab of (component as TabsSchema).tabs) {
                Object.assign(data, extractDefaults(tab.schema, record));
            }
        } else if ((component as unknown as { type: string }).type === 'wizard') {
            const steps = (component as unknown as { steps: { schema: FormComponentSchema[] }[] }).steps ?? [];
            for (const step of steps) {
                Object.assign(data, extractDefaults(step.schema, record));
            }
        } else {
            const field = component as FieldSchema;
            data[field.name] = record?.[field.name] ?? field.default ?? null;
        }
    }
    return data;
}

const initialData = extractDefaults(props.schema.schema, props.record);
const form = useForm(initialData as Record<string, unknown>);

const url = computed(() => {
    const base = `${props.panelPath}/${props.module.slug}`;
    if (props.schema.operation === 'edit' && props.record?.id) {
        return `${base}/${props.record.id}`;
    }
    return base;
});

function handleSubmit(e: Event) {
    e.preventDefault();

    if (has('form:before-submit')) {
        const transformed = invoke('form:before-submit', { ...form.data }, props.schema.operation);
        if (transformed) {
            for (const [key, val] of Object.entries(transformed)) {
                (form as unknown as { [k: string]: unknown })[key] = val;
            }
        }
    }

    const submitOptions = {
        onSuccess: () => {
            if (has('form:after-submit')) {
                invoke('form:after-submit', { success: true, message: null, redirect: null });
            }
            emit('success');
        },
    };

    if (props.schema.operation === 'edit') {
        form.put(url.value, submitOptions);
    } else {
        form.post(url.value, submitOptions);
    }
}

function onFieldChange(name: string, value: unknown) {
    (form as unknown as Record<string, unknown>)[name] = value;
}
</script>

<template>
    <form class="space-y-6" @submit="handleSubmit">
        <div class="grid grid-cols-1 gap-4">
            <FormComponents
                :components="schema.schema"
                :data="form.data as Record<string, unknown>"
                :errors="form.errors as Record<string, string>"
                @field-change="onFieldChange"
            />
        </div>

        <div class="flex items-center justify-end gap-3 border-t border-s-border pt-4">
            <button
                type="submit"
                :disabled="form.processing"
                class="inline-flex items-center gap-2 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg v-if="form.processing" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {{ schema.operation === 'edit' ? 'Save changes' : 'Create' }}
            </button>
        </div>
    </form>
</template>
