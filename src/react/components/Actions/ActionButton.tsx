import { useCallback, useState } from 'react';
import { router } from '@inertiajs/react';
import { cn } from '../../../shared/utils/cn';
import { SchemaIcon } from '../Icon';
import { useStudioHooks } from '../../hooks/useStudioHooks';
import { ConfirmationModal } from './ConfirmationModal';
import type { ActionSchema } from '../../../shared/types/schema';

interface ActionButtonProps {
    action: ActionSchema;
    record?: Record<string, unknown>;
    panelPath: string;
    moduleSlug: string;
    onAction?: () => void;
}

const colorClasses: Record<string, { button: string; compact: string }> = {
    primary: {
        button: 'bg-s-accent text-white hover:opacity-90',
        compact: 'text-s-accent hover:bg-s-accent/10',
    },
    danger: {
        button: 'bg-red-600 text-white hover:bg-red-700',
        compact: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950',
    },
    warning: {
        button: 'bg-yellow-500 text-white hover:bg-yellow-600',
        compact: 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950',
    },
    success: {
        button: 'bg-green-600 text-white hover:bg-green-700',
        compact: 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950',
    },
    info: {
        button: 'bg-blue-600 text-white hover:bg-blue-700',
        compact: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950',
    },
    gray: {
        button: 'bg-gray-600 text-white hover:bg-gray-700',
        compact: 'text-s-text-muted hover:bg-s-hover',
    },
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

export function ActionButton({
    action,
    record,
    panelPath,
    moduleSlug,
    onAction,
}: ActionButtonProps) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [processing, setProcessing] = useState(false);
    const { invoke, has } = useStudioHooks();

    const color = resolveActionColor(action);
    const styles = colorClasses[color] ?? colorClasses.gray;

    const handleNavigate = useCallback(() => {
        if (!record) {
            return;
        }

        const recordId = record.id ?? record.key;
        const baseUrl = `${panelPath}/${moduleSlug}/${recordId}`;

        if (action.type === 'view') {
            router.visit(action.url ?? baseUrl);
        } else if (action.type === 'edit') {
            router.visit(action.url ?? `${baseUrl}/edit`);
        }
    }, [action, record, panelPath, moduleSlug]);

    const executeAction = useCallback(() => {
        if (has('action:before')) {
            const shouldProceed = invoke('action:before', action, record ? [record] : []);
            if (shouldProceed === false) {
                return;
            }
        }

        setProcessing(true);

        const onFinish = () => {
            setProcessing(false);
            setShowConfirmation(false);
            if (has('action:after')) {
                invoke('action:after', action, {
                    success: true,
                    message: null,
                    redirect: null,
                });
            }
            onAction?.();
        };

        if (action.type === 'delete') {
            const url =
                action.url ??
                `${panelPath}/${moduleSlug}${record?.id ? `/${record.id}` : ''}`;

            router.delete(url, {
                preserveState: true,
                preserveScroll: true,
                onFinish,
            });
        } else {
            const url =
                action.url ??
                `${panelPath}/${moduleSlug}${record?.id ? `/${record.id}` : ''}/action/${action.name}`;

            router.post(url, {
                id: record?.id ?? record?.key ?? null,
            } as never, {
                preserveState: true,
                preserveScroll: true,
                onFinish,
            });
        }
    }, [action, record, panelPath, moduleSlug, invoke, has, onAction]);

    const handleClick = useCallback(() => {
        if (action.type === 'view' || action.type === 'edit') {
            handleNavigate();
            return;
        }

        if (action.type === 'delete' || action.requiresConfirmation) {
            setShowConfirmation(true);
            return;
        }

        executeAction();
    }, [action, handleNavigate, executeAction]);

    if (!action.authorized) {
        return null;
    }

    const confirmationConfig = has('action:confirmation')
        ? invoke('action:confirmation', action)
        : null;

    const isDangerous = action.type === 'delete' || color === 'danger';

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                disabled={processing}
                className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50',
                    styles.button,
                )}
                title={action.label}
            >
                {action.icon && <SchemaIcon schema={action.icon} size="xs" />}
                {action.label}
            </button>

            <ConfirmationModal
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={executeAction}
                heading={
                    confirmationConfig?.heading ??
                    action.confirmationHeading ??
                    (isDangerous ? 'Delete Record' : 'Confirm Action')
                }
                message={
                    confirmationConfig?.message ??
                    action.confirmationMessage ??
                    (isDangerous
                        ? 'Are you sure you want to delete this record? This action cannot be undone.'
                        : 'Are you sure you want to perform this action?')
                }
                confirmLabel={confirmationConfig?.confirmLabel ?? (isDangerous ? 'Delete' : 'Confirm')}
                cancelLabel={confirmationConfig?.cancelLabel ?? 'Cancel'}
                isDangerous={confirmationConfig?.isDangerous ?? isDangerous}
                loading={processing}
            />
        </>
    );
}
