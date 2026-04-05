import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { cn } from '../../../shared/utils/cn';
import { SchemaIcon } from '../Icon';
import { useStudioHooks } from '../../hooks/useStudioHooks';
import { ConfirmationModal } from './ConfirmationModal';
import type { ActionSchema } from '../../../shared/types/schema';

interface ActionDropdownProps {
    actions: ActionSchema[];
    record: Record<string, unknown>;
    panelPath: string;
    moduleSlug: string;
}

const itemColorClasses: Record<string, string> = {
    primary: 'text-s-text-secondary hover:bg-s-hover',
    danger: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950',
    warning: 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950',
    success: 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950',
    info: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950',
    gray: 'text-s-text-secondary hover:bg-s-hover',
};

function resolveActionColor(action: ActionSchema): string {
    if (action.color) {
        return action.color;
    }
    if (action.type === 'delete') {
        return 'danger';
    }
    return 'gray';
}

export function ActionDropdown({
    actions,
    record,
    panelPath,
    moduleSlug,
}: ActionDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmingAction, setConfirmingAction] = useState<ActionSchema | null>(null);
    const [processing, setProcessing] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { invoke, has } = useStudioHooks();

    const authorizedActions = actions.filter((action) => action.authorized);

    const handleClickOutside = useCallback(
        (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        },
        [],
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        },
        [],
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, handleClickOutside, handleKeyDown]);

    const handleNavigate = useCallback(
        (action: ActionSchema) => {
            const recordId = record.id ?? record.key;
            const baseUrl = `${panelPath}/${moduleSlug}/${recordId}`;

            if (action.type === 'view') {
                router.visit(action.url ?? baseUrl);
            } else if (action.type === 'edit') {
                router.visit(action.url ?? `${baseUrl}/edit`);
            }

            setIsOpen(false);
        },
        [record, panelPath, moduleSlug],
    );

    const executeAction = useCallback(
        (action: ActionSchema) => {
            if (has('action:before')) {
                const shouldProceed = invoke('action:before', action, [record]);
                if (shouldProceed === false) {
                    return;
                }
            }

            setProcessing(true);

            const recordId = record.id ?? record.key;
            const onFinish = () => {
                setProcessing(false);
                setConfirmingAction(null);
                setIsOpen(false);
                if (has('action:after')) {
                    invoke('action:after', action, {
                        success: true,
                        message: null,
                        redirect: null,
                    });
                }
            };

            if (action.type === 'delete') {
                const url = action.url ?? `${panelPath}/${moduleSlug}/${recordId}`;

                router.delete(url, {
                    preserveState: true,
                    preserveScroll: true,
                    onFinish,
                });
            } else {
                const url =
                    action.url ??
                    `${panelPath}/${moduleSlug}/${recordId}/action/${action.name}`;

                router.post(url, {
                    id: recordId,
                } as never, {
                    preserveState: true,
                    preserveScroll: true,
                    onFinish,
                });
            }
        },
        [record, panelPath, moduleSlug, invoke, has],
    );

    const handleActionClick = useCallback(
        (action: ActionSchema) => {
            if (action.type === 'view' || action.type === 'edit') {
                handleNavigate(action);
                return;
            }

            if (action.type === 'delete' || action.requiresConfirmation) {
                setConfirmingAction(action);
                setIsOpen(false);
                return;
            }

            executeAction(action);
        },
        [handleNavigate, executeAction],
    );

    if (authorizedActions.length === 0) {
        return null;
    }

    const confirmationConfig =
        confirmingAction && has('action:confirmation')
            ? invoke('action:confirmation', confirmingAction)
            : null;

    const isDangerous =
        confirmingAction?.type === 'delete' ||
        (confirmingAction?.color != null && confirmingAction.color === 'danger');

    return (
        <>
            <div ref={dropdownRef} className="relative inline-block text-left">
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="inline-flex items-center justify-center rounded-lg p-1.5 text-s-text-faint transition-colors hover:bg-s-hover hover:text-s-text-muted"
                    aria-label="Actions"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                        />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute right-0 z-20 mt-1 w-48 origin-top-right rounded-lg border border-s-border bg-s-surface py-1 shadow-lg">
                        {authorizedActions.map((action) => {
                            const color = resolveActionColor(action);
                            const itemClasses = itemColorClasses[color] ?? itemColorClasses.gray;

                            return (
                                <button
                                    key={action.name}
                                    type="button"
                                    onClick={() => handleActionClick(action)}
                                    disabled={processing}
                                    className={cn(
                                        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors disabled:opacity-50',
                                        itemClasses,
                                    )}
                                >
                                    {action.icon && (
                                        <SchemaIcon schema={action.icon} size="sm" />
                                    )}
                                    {action.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {confirmingAction && (
                <ConfirmationModal
                    open={true}
                    onClose={() => setConfirmingAction(null)}
                    onConfirm={() => executeAction(confirmingAction)}
                    heading={
                        confirmationConfig?.heading ??
                        confirmingAction.confirmationHeading ??
                        (isDangerous ? 'Delete Record' : 'Confirm Action')
                    }
                    message={
                        confirmationConfig?.message ??
                        confirmingAction.confirmationMessage ??
                        (isDangerous
                            ? 'Are you sure you want to delete this record? This action cannot be undone.'
                            : 'Are you sure you want to perform this action?')
                    }
                    confirmLabel={
                        confirmationConfig?.confirmLabel ?? (isDangerous ? 'Delete' : 'Confirm')
                    }
                    cancelLabel={confirmationConfig?.cancelLabel ?? 'Cancel'}
                    isDangerous={confirmationConfig?.isDangerous ?? isDangerous}
                    loading={processing}
                />
            )}
        </>
    );
}
