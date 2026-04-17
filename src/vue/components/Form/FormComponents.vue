<script setup lang="ts">
import type {
    FieldSchema,
    FormComponentSchema,
    SectionSchema,
    TabsSchema,
} from '../../../shared/types/schema';
import { useStudioHooks } from '../../composables/useStudioHooks';
import FieldWrapper from './FieldWrapper.vue';
import Section from './Section.vue';
import FormTabs from './FormTabs.vue';
import Wizard, { type WizardSchema } from './Wizard.vue';
import { fieldComponentMap } from './fields';

interface Props {
    components: FormComponentSchema[];
    data: Record<string, unknown>;
    errors: Record<string, string>;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'field-change': [name: string, value: unknown] }>();

const { invoke, has } = useStudioHooks();

function onFieldChange(name: string, value: unknown) {
    emit('field-change', name, value);
}

function isSection(c: FormComponentSchema): c is SectionSchema {
    return c.type === 'section';
}
function isTabs(c: FormComponentSchema): c is TabsSchema {
    return c.type === 'tabs';
}
function isWizard(c: FormComponentSchema): c is unknown as WizardSchema {
    return (c as unknown as { type: string }).type === 'wizard';
}
function asField(c: FormComponentSchema): FieldSchema {
    return c as FieldSchema;
}

function fieldComponent(type: string) {
    return fieldComponentMap[type];
}

function renderFieldHook(field: FieldSchema) {
    return has('form:render-field') ? invoke('form:render-field', field) : null;
}

// Exposed for recursive use in template
defineOptions({ name: 'FormComponents' });

// For repeater, we pass the props as object
void props;
void fieldComponent;
</script>

<template>
    <template v-for="(component, index) in components" :key="index">
        <Section v-if="component.type === 'section'" :schema="component as SectionSchema">
            <FormComponents
                :components="(component as SectionSchema).schema"
                :data="data"
                :errors="errors"
                @field-change="onFieldChange"
            />
        </Section>
        <FormTabs v-else-if="component.type === 'tabs'" :schema="component as TabsSchema">
            <template #default="{ schema: tabSchema }">
                <FormComponents
                    :components="tabSchema"
                    :data="data"
                    :errors="errors"
                    @field-change="onFieldChange"
                />
            </template>
        </FormTabs>
        <Wizard
            v-else-if="(component as unknown as {type: string}).type === 'wizard'"
            :schema="component as unknown as WizardSchema"
        >
            <template #default="{ schema: stepSchema }">
                <FormComponents
                    :components="stepSchema as FormComponentSchema[]"
                    :data="data"
                    :errors="errors"
                    @field-change="onFieldChange"
                />
            </template>
        </Wizard>
        <template v-else>
            <FieldWrapper
                v-if="renderFieldHook(asField(component))"
                :schema="asField(component)"
                :error="errors[asField(component).name] ?? null"
            >
                <component :is="renderFieldHook(asField(component))" />
            </FieldWrapper>
            <component
                v-else-if="asField(component).type === 'hidden' && fieldComponent('hidden')"
                :is="fieldComponent('hidden')"
                :schema="asField(component)"
                :value="data[asField(component).name]"
                @change="(v: unknown) => onFieldChange(asField(component).name, v)"
            />
            <FieldWrapper
                v-else-if="!fieldComponent(asField(component).type)"
                :schema="asField(component)"
                :error="errors[asField(component).name] ?? null"
            >
                <div class="rounded-lg border border-dashed border-s-border-strong px-3 py-2 text-xs text-s-text-faint">
                    Unknown field type: {{ asField(component).type }}
                </div>
            </FieldWrapper>
            <FieldWrapper
                v-else
                :schema="asField(component)"
                :error="errors[asField(component).name] ?? null"
            >
                <component
                    :is="fieldComponent(asField(component).type)"
                    :schema="asField(component)"
                    :value="data[asField(component).name]"
                    :error="errors[asField(component).name] ?? null"
                    @change="(v: unknown) => onFieldChange(asField(component).name, v)"
                />
            </FieldWrapper>
        </template>
    </template>
</template>
