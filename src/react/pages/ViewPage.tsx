import { useCallback, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { StudioProvider } from '../context/StudioContext';
import { PanelLayout } from '../components/Layout';
import { DetailView } from '../components/Infolist';
import { FormRenderer } from '../components/Form';
import { ActionButton } from '../components/Actions';
import type {
    PanelSchema,
    UserSchema,
    ModuleMetaSchema,
    DetailSchema,
    FormSchema,
} from '../../shared/types/schema';

interface ViewPageProps {
    studio: {
        panel: PanelSchema;
        user: UserSchema | null;
        notifications: unknown[];
    };
    module: ModuleMetaSchema;
    record: Record<string, unknown>;
    detailSchema?: DetailSchema[];
    formSchema?: FormSchema & { readonly?: boolean };
}

export default function ViewPage({
    studio,
    module: moduleMeta,
    record,
    detailSchema,
    formSchema,
}: ViewPageProps) {
    const panel = useMemo<PanelSchema>(
        () => ({ ...studio.panel, user: studio.user ?? studio.panel.user }),
        [studio.panel, studio.user],
    );

    const panelPath = panel.path.startsWith('/') ? panel.path : `/${panel.path}`;

    const recordTitle = record[moduleMeta.recordTitleAttribute]
        ? String(record[moduleMeta.recordTitleAttribute])
        : `#${record.id ?? ''}`;

    const handleBack = useCallback(() => {
        router.visit(`${panelPath}/${moduleMeta.slug}`);
    }, [panelPath, moduleMeta.slug]);

    // Determine which view to render
    const hasDetailSchema = detailSchema && detailSchema.length > 0;
    const hasReadonlyForm = formSchema?.readonly;

    return (
        <StudioProvider panel={panel}>
            <PanelLayout>
                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-s-border bg-s-surface px-3 py-1.5 text-sm text-s-text-secondary hover:bg-s-hover transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Back
                        </button>
                        <h1 className="text-xl font-semibold text-s-text">{recordTitle}</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => router.visit(`${panelPath}/${moduleMeta.slug}/${record.id}/edit`)}
                            className="inline-flex items-center gap-2 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                            Edit
                        </button>

                        <ActionButton
                            action={{
                                type: 'delete', name: 'delete', label: 'Delete', icon: null,
                                color: 'danger', requiresConfirmation: true,
                                confirmationHeading: 'Delete Record',
                                confirmationMessage: `Are you sure you want to delete "${recordTitle}"?`,
                                url: null, authorized: true, form: null,
                            }}
                            record={record}
                            panelPath={panelPath}
                            moduleSlug={moduleMeta.slug}
                            onAction={() => router.visit(`${panelPath}/${moduleMeta.slug}`)}
                        />
                    </div>
                </div>

                {/* Content — detail schema or readonly form */}
                {hasDetailSchema ? (
                    <DetailView schema={detailSchema!} record={record} />
                ) : hasReadonlyForm ? (
                    <div className="rounded-xl border border-s-border bg-s-surface overflow-hidden p-5 sm:p-6">
                        <div className="[&_button[type=submit]]:hidden [&_.border-t]:hidden [&_input]:bg-s-surface-alt [&_input]:cursor-default [&_textarea]:bg-s-surface-alt [&_textarea]:cursor-default [&_select]:bg-s-surface-alt [&_select]:cursor-default [&_input]:pointer-events-none [&_textarea]:pointer-events-none [&_select]:pointer-events-none">
                            <FormRenderer
                                schema={formSchema!}
                                record={record}
                                module={{ slug: moduleMeta.slug }}
                                panelPath={panelPath}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-s-border bg-s-surface p-8 text-center text-s-text-muted">
                        No detail view defined for this module.
                    </div>
                )}
            </PanelLayout>
        </StudioProvider>
    );
}
