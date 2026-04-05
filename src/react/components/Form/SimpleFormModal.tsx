import { useCallback, useEffect } from 'react';
import { FormRenderer } from './FormRenderer';
import type { FormSchema } from '../../../shared/types/schema';

interface SimpleFormModalProps {
    open: boolean;
    onClose: () => void;
    schema: FormSchema;
    record?: Record<string, unknown>;
    panelPath: string;
    moduleSlug: string;
}

export function SimpleFormModal({
    open,
    onClose,
    schema,
    record,
    panelPath,
    moduleSlug,
}: SimpleFormModalProps) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        },
        [onClose],
    );

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [open, handleKeyDown]);

    if (!open) {
        return null;
    }

    const isEditing = !!record;
    const heading = isEditing ? 'Edit Record' : 'Create Record';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-s-surface p-6 shadow-2xl dark:shadow-gray-900/50">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-s-text">
                        {heading}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-s-text-faint transition-colors hover:bg-s-hover hover:text-s-text-muted"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <FormRenderer
                    schema={schema}
                    record={record}
                    module={{ slug: moduleSlug }}
                    panelPath={panelPath}
                    onSuccess={onClose}
                />
            </div>
        </div>
    );
}
