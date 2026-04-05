import { useCallback, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { StudioProvider } from '../context/StudioContext';
import { PanelLayout } from '../components/Layout';
import { FormRenderer } from '../components/Form';
import type {
    PanelSchema,
    UserSchema,
    ModuleMetaSchema,
    FormSchema,
} from '../../shared/types/schema';

interface CreatePageProps {
    studio: {
        panel: PanelSchema;
        user: UserSchema | null;
        notifications: unknown[];
    };
    module: ModuleMetaSchema;
    formSchema: FormSchema;
}

export default function CreatePage({
    studio,
    module: moduleMeta,
    formSchema,
}: CreatePageProps) {
    const panel = useMemo<PanelSchema>(
        () => ({ ...studio.panel, user: studio.user ?? studio.panel.user }),
        [studio.panel, studio.user],
    );

    const panelPath = panel.path.startsWith('/') ? panel.path : `/${panel.path}`;

    const handleBack = useCallback(() => {
        router.visit(`${panelPath}/${moduleMeta.slug}`);
    }, [panelPath, moduleMeta.slug]);

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
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Back
                        </button>

                        <h1 className="text-xl font-semibold text-s-text">
                            Create {moduleMeta.label}
                        </h1>
                    </div>
                </div>

                {/* Form */}
                <div className="rounded-xl border border-s-border bg-s-surface p-5 sm:p-6">
                    <FormRenderer
                        schema={formSchema}
                        module={{ slug: moduleMeta.slug }}
                        panelPath={panelPath}
                    />
                </div>
            </PanelLayout>
        </StudioProvider>
    );
}
