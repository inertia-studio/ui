import { useState } from 'react';
import { router } from '@inertiajs/react';
import { cn } from '../../../shared/utils/cn';
import { SchemaIcon } from '../Icon';
import type { ActionSchema } from '../../../shared/types/schema';

interface BulkActionBarProps {
    selectedIds: Array<string | number>;
    actions: ActionSchema[];
    panelPath: string;
    module: { slug: string };
    onClearSelection: () => void;
}

const colorClasses: Record<string, string> = {
    primary: 'bg-s-accent text-white hover:opacity-90',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
    success: 'bg-green-600 text-white hover:bg-green-700',
    info: 'bg-blue-600 text-white hover:bg-blue-700',
    gray: 'bg-gray-600 text-white hover:bg-gray-700',
};

export function BulkActionBar({ selectedIds, actions, panelPath, module, onClearSelection }: BulkActionBarProps) {
    const [confirmingAction, setConfirmingAction] = useState<ActionSchema | null>(null);
    const [processing, setProcessing] = useState(false);

    if (selectedIds.length === 0 || actions.length === 0) {
        return null;
    }

    function executeAction(action: ActionSchema) {
        if (action.requiresConfirmation && !confirmingAction) {
            setConfirmingAction(action);
            return;
        }

        setProcessing(true);
        setConfirmingAction(null);

        const url = action.url ?? `${panelPath}/${module.slug}/bulk-actions/${action.name}`;

        router.post(url, {
            ids: selectedIds,
        } as never, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                onClearSelection();
            },
        });
    }

    return (
        <>
            <div className="fixed inset-x-0 bottom-6 z-30 flex justify-center">
                <div className="flex items-center gap-3 rounded-xl border border-s-border bg-s-surface px-4 py-3 shadow-xl dark:shadow-gray-900/50">
                    <span className="text-sm font-medium text-s-text-secondary">
                        {selectedIds.length} selected
                    </span>

                    <div className="h-5 w-px bg-s-border" />

                    <div className="flex items-center gap-2">
                        {actions.map((action) => (
                            <button
                                key={action.name}
                                type="button"
                                onClick={() => executeAction(action)}
                                disabled={processing}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50',
                                    colorClasses[action.color ?? 'primary'] ?? colorClasses.primary,
                                )}
                            >
                                {action.icon && (
                                    <SchemaIcon schema={action.icon} size="xs" />
                                )}
                                {action.label}
                            </button>
                        ))}
                    </div>

                    <div className="h-5 w-px bg-s-border" />

                    <button
                        type="button"
                        onClick={onClearSelection}
                        className="text-sm text-s-text-muted transition-colors hover:text-s-text-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* Confirmation modal */}
            {confirmingAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setConfirmingAction(null)}
                        aria-hidden="true"
                    />
                    <div className="relative z-10 w-full max-w-md rounded-xl bg-s-surface p-6 shadow-2xl dark:shadow-gray-900/50">
                        <h3 className="text-lg font-semibold text-s-text">
                            {confirmingAction.confirmationHeading ?? 'Confirm Action'}
                        </h3>
                        <p className="mt-2 text-sm text-s-text-muted">
                            {confirmingAction.confirmationMessage ??
                                `Are you sure you want to perform this action on ${selectedIds.length} record${selectedIds.length !== 1 ? 's' : ''}?`}
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmingAction(null)}
                                className="rounded-lg border border-s-border-strong bg-s-input px-4 py-2 text-sm font-medium text-s-text-secondary transition-colors hover:bg-s-hover"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => executeAction(confirmingAction)}
                                disabled={processing}
                                className={cn(
                                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
                                    confirmingAction.color === 'danger'
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-s-accent text-white hover:opacity-90',
                                )}
                            >
                                {processing ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
