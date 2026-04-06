import { type FormEvent, type ReactNode, useCallback, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import type {
    FieldSchema,
    FormComponentSchema,
    FormSchema,
    SectionSchema,
    TabsSchema,
} from '../../../shared/types/schema';
import { useStudioHooks } from '../../hooks/useStudioHooks';
import { FieldWrapper } from './FieldWrapper';
import { Section } from './Section';
import { fieldComponentMap } from './fields';
import { Tabs } from './Tabs';
import { Wizard } from './Wizard';

interface FormRendererProps {
    schema: FormSchema;
    record?: Record<string, unknown>;
    module: { slug: string };
    panelPath: string;
    onSuccess?: () => void;
}

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
        } else if (component.type === 'wizard') {
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

export function FormRenderer({
    schema,
    record,
    module,
    panelPath,
    onSuccess,
}: FormRendererProps) {
    const { invoke, has } = useStudioHooks();

    const initialData = useMemo(
        () => extractDefaults(schema.schema, record),
        [schema.schema, record],
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm(initialData as any);

    const url = useMemo(() => {
        const base = `${panelPath}/${module.slug}`;
        if (schema.operation === 'edit' && record?.id) {
            return `${base}/${record.id}`;
        }
        return base;
    }, [panelPath, module.slug, schema.operation, record]);

    const handleSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault();

            if (has('form:before-submit')) {
                const transformed = invoke('form:before-submit', { ...form.data }, schema.operation);
                if (transformed) {
                    for (const [key, val] of Object.entries(transformed)) {
                        form.setData(key, val);
                    }
                }
            }

            const submitOptions = {
                onSuccess: () => {
                    if (has('form:after-submit')) {
                        invoke('form:after-submit', {
                            success: true,
                            message: null,
                            redirect: null,
                        });
                    }
                    onSuccess?.();
                },
            };

            if (schema.operation === 'edit') {
                form.put(url, submitOptions);
            } else {
                form.post(url, submitOptions);
            }
        },
        [form, schema.operation, url, invoke, has, onSuccess],
    );

    const renderComponents = useCallback(
        (
            components: FormComponentSchema[],
            data: Record<string, unknown>,
            onFieldChange: (name: string, val: unknown) => void,
            errors: Record<string, string>,
        ): ReactNode => {
            return components.map((component, index) => {
                if (component.type === 'section') {
                    return (
                        <Section key={index} schema={component as SectionSchema}>
                            {renderComponents(
                                (component as SectionSchema).schema,
                                data,
                                onFieldChange,
                                errors,
                            )}
                        </Section>
                    );
                }

                if (component.type === 'tabs') {
                    return (
                        <Tabs key={index} schema={component as TabsSchema}>
                            {(tabSchema) =>
                                renderComponents(tabSchema, data, onFieldChange, errors)
                            }
                        </Tabs>
                    );
                }

                if (component.type === 'wizard') {
                    return (
                        <Wizard key={index} schema={component as unknown as { type: 'wizard'; showStepNumbers: boolean; allowSkip: boolean; steps: { label: string; description?: string | null; icon?: string | null; columns: number; schema: unknown[] }[] }}>
                            {(stepSchema) =>
                                renderComponents(stepSchema as FormComponentSchema[], data, onFieldChange, errors)
                            }
                        </Wizard>
                    );
                }

                const field = component as FieldSchema;

                if (has('form:render-field')) {
                    const custom = invoke('form:render-field', field);
                    if (custom !== null) {
                        return (
                            <FieldWrapper
                                key={field.name}
                                schema={field}
                                error={errors[field.name] ?? null}
                            >
                                {custom}
                            </FieldWrapper>
                        );
                    }
                }

                if (field.type === 'hidden') {
                    const HiddenComponent = fieldComponentMap.hidden;
                    return (
                        <HiddenComponent
                            key={field.name}
                            schema={field}
                            value={data[field.name]}
                            onChange={(val: unknown) => onFieldChange(field.name, val)}
                        />
                    );
                }

                const FieldComponent = fieldComponentMap[field.type];

                if (!FieldComponent) {
                    return (
                        <FieldWrapper
                            key={field.name}
                            schema={field}
                            error={errors[field.name] ?? null}
                        >
                            <div className="rounded-lg border border-dashed border-s-border-strong px-3 py-2 text-xs text-s-text-faint">
                                Unknown field type: {field.type}
                            </div>
                        </FieldWrapper>
                    );
                }

                const fieldProps: Record<string, unknown> = {
                    schema: field,
                    value: data[field.name],
                    onChange: (val: unknown) => onFieldChange(field.name, val),
                    error: errors[field.name] ?? null,
                };

                if (field.type === 'repeater') {
                    fieldProps.renderComponents = (
                        nestedSchema: FormComponentSchema[],
                        nestedData: Record<string, unknown>,
                        nestedOnChange: (name: string, val: unknown) => void,
                        nestedErrors: Record<string, string>,
                    ) => renderComponents(nestedSchema, nestedData, nestedOnChange, nestedErrors);
                }

                return (
                    <FieldWrapper
                        key={field.name}
                        schema={field}
                        error={errors[field.name] ?? null}
                    >
                        <FieldComponent {...fieldProps} />
                    </FieldWrapper>
                );
            });
        },
        [has, invoke],
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {renderComponents(
                    schema.schema,
                    form.data,
                    (name, val) => form.setData(name as never, val as never),
                    form.errors,
                )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-s-border pt-4">
                <button
                    type="submit"
                    disabled={form.processing}
                    className="inline-flex items-center gap-2 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {form.processing && (
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    )}
                    {schema.operation === 'edit' ? 'Save changes' : 'Create'}
                </button>
            </div>
        </form>
    );
}
