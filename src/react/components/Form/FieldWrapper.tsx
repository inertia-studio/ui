import type { ReactNode } from 'react';
import { cn } from '../../../shared/utils/cn';
import type { FieldSchema } from '../../../shared/types/schema';
import { useStudioHooks } from '../../hooks/useStudioHooks';

interface FieldWrapperProps {
    schema: FieldSchema;
    error?: string | null;
    children: ReactNode;
}

export function FieldWrapper({ schema, error, children }: FieldWrapperProps) {
    const { invoke, has } = useStudioHooks();

    if (schema.hidden) {
        return null;
    }

    const colSpanClass =
        schema.columnSpan === 'full'
            ? 'col-span-full'
            : schema.columnSpan > 1
              ? `col-span-${schema.columnSpan}`
              : undefined;

    const content = (
        <div className={cn('space-y-1', colSpanClass)}>
            {schema.label && (
                <label
                    htmlFor={schema.name}
                    className="block text-sm font-medium text-s-text-secondary"
                >
                    {schema.label}
                    {schema.required && (
                        <span className="ml-0.5 text-red-500">*</span>
                    )}
                </label>
            )}

            {schema.hint && (
                <p className="text-xs text-s-text-muted">{schema.hint}</p>
            )}

            {children}

            {schema.helperText && (
                <p className="text-xs text-s-text-muted">{schema.helperText}</p>
            )}

            {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
        </div>
    );

    if (has('form:field-wrapper')) {
        const hooked = invoke('form:field-wrapper', schema, content);
        if (hooked !== null) {
            return <>{hooked}</>;
        }
    }

    return content;
}
