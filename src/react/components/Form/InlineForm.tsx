import { type FormEvent, type ReactNode, useCallback, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import type {
    FieldSchema,
    FormComponentSchema,
    SectionSchema,
    TabsSchema,
} from '../../../shared/types/schema';
import { FieldWrapper } from './FieldWrapper';
import { Section } from './Section';
import { Wizard } from './Wizard';
import { Tabs } from './Tabs';
import { fieldComponentMap } from './fields';

interface InlineFormProps {
    schema: FormComponentSchema[];
    label?: string;
    actionUrl?: string | null;
    method?: string;
}

function extractDefaults(components: FormComponentSchema[]): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    for (const component of components) {
        if (component.type === 'section') {
            Object.assign(data, extractDefaults((component as SectionSchema).schema));
        } else if (component.type === 'tabs') {
            for (const tab of (component as TabsSchema).tabs) {
                Object.assign(data, extractDefaults(tab.schema));
            }
        } else if (component.type === 'wizard') {
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

export function InlineForm({ schema, label, actionUrl, method = 'POST' }: InlineFormProps) {
    const initialData = useMemo(() => extractDefaults(schema), [schema]);
    const [data, setData] = useState<Record<string, unknown>>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleFieldChange = useCallback((name: string, value: unknown) => {
        setData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    }, []);

    const handleSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();

        if (!actionUrl) return;

        setProcessing(true);
        setSuccess(false);

        const routerMethod = method.toLowerCase() === 'put' ? 'put'
            : method.toLowerCase() === 'patch' ? 'patch'
            : method.toLowerCase() === 'delete' ? 'delete'
            : 'post';

        router[routerMethod](actionUrl, data as Record<string, string>, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            },
            onError: (validationErrors) => {
                setProcessing(false);
                setErrors(validationErrors as Record<string, string>);
            },
        });
    }, [actionUrl, data, method]);

    const renderComponents = useCallback(
        (components: FormComponentSchema[]): ReactNode => {
            return components.map((component, index) => {
                if (component.type === 'section') {
                    return (
                        <Section key={index} schema={component as SectionSchema}>
                            {renderComponents((component as SectionSchema).schema)}
                        </Section>
                    );
                }

                if (component.type === 'tabs') {
                    return (
                        <Tabs key={index} schema={component as TabsSchema}>
                            {(tabSchema) => renderComponents(tabSchema)}
                        </Tabs>
                    );
                }

                if (component.type === 'wizard') {
                    return (
                        <Wizard key={index} schema={component as unknown as { type: 'wizard'; showStepNumbers: boolean; allowSkip: boolean; steps: { label: string; description?: string | null; icon?: string | null; columns: number; schema: unknown[] }[] }}>
                            {(stepSchema) => renderComponents(stepSchema as FormComponentSchema[])}
                        </Wizard>
                    );
                }

                const field = component as FieldSchema;

                if (field.type === 'hidden') {
                    const HiddenComponent = fieldComponentMap.hidden;
                    return (
                        <HiddenComponent
                            key={field.name}
                            schema={field}
                            value={data[field.name]}
                            onChange={(val: unknown) => handleFieldChange(field.name, val)}
                        />
                    );
                }

                const FieldComponent = fieldComponentMap[field.type];

                if (!FieldComponent) {
                    return (
                        <FieldWrapper key={field.name} schema={field} error={null}>
                            <div className="rounded-lg border border-dashed border-s-border-strong px-3 py-2 text-xs text-s-text-faint">
                                Unknown field type: {field.type}
                            </div>
                        </FieldWrapper>
                    );
                }

                return (
                    <FieldWrapper key={field.name} schema={field} error={errors[field.name] ?? null}>
                        <FieldComponent
                            schema={field}
                            value={data[field.name]}
                            onChange={(val: unknown) => handleFieldChange(field.name, val)}
                            error={errors[field.name] ?? null}
                        />
                    </FieldWrapper>
                );
            });
        },
        [data, errors, handleFieldChange],
    );

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-s-border bg-s-surface overflow-hidden">
            {label && (
                <div className="border-b border-s-border px-5 py-3.5">
                    <h3 className="text-sm font-semibold text-s-text">{label}</h3>
                </div>
            )}

            <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    {renderComponents(schema)}
                </div>

                {actionUrl && (
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing && (
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            Submit
                        </button>

                        {success && (
                            <span className="text-sm text-emerald-600">Submitted successfully!</span>
                        )}
                    </div>
                )}
            </div>
        </form>
    );
}
