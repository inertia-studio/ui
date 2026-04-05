import { useCallback, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { StudioProvider } from '../context/StudioContext';
import { PanelLayout } from '../components/Layout';
import { DataTable } from '../components/Table';
import { SimpleFormModal } from '../components/Form';
import { TabGroup } from '../components/Tabs';
import type {
    PanelSchema,
    UserSchema,
    ModuleMetaSchema,
    TableSchema,
    FormSchema,
    PaginatedData,
    ListTabSchema,
} from '../../shared/types/schema';

interface ListPageProps {
    studio: {
        panel: PanelSchema;
        user: UserSchema | null;
        notifications: unknown[];
    };
    module: ModuleMetaSchema;
    tableSchema: TableSchema;
    records: PaginatedData;
    tabs?: ListTabSchema[];
    simpleFormSchema?: FormSchema;
}

function resolveActiveTab(tabs: ListTabSchema[]): string {
    if (typeof window === 'undefined') {
        return tabs[0]?.slug ?? '';
    }
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get('tab');
    if (tabParam && tabs.some((t) => t.slug === tabParam)) {
        return tabParam;
    }
    return tabs[0]?.slug ?? '';
}

export default function ListPage({
    studio,
    module: moduleMeta,
    tableSchema,
    records,
    tabs,
    simpleFormSchema,
}: ListPageProps) {
    const panel = useMemo<PanelSchema>(
        () => ({ ...studio.panel, user: studio.user ?? studio.panel.user }),
        [studio.panel, studio.user],
    );

    const panelPath = panel.path.startsWith('/') ? panel.path : `/${panel.path}`;

    const [simpleModalOpen, setSimpleModalOpen] = useState(false);
    const [simpleEditRecord, setSimpleEditRecord] = useState<Record<string, unknown> | undefined>(undefined);

    const handleTabChange = useCallback(
        (slug: string) => {
            router.visit(window.location.pathname, {
                data: { tab: slug },
                preserveState: true,
                preserveScroll: true,
                only: ['records', 'tabs'],
            });
        },
        [],
    );

    const handleCreate = useCallback(() => {
        if (moduleMeta.simple && simpleFormSchema) {
            setSimpleEditRecord(undefined);
            setSimpleModalOpen(true);
        } else {
            router.visit(`${panelPath}/${moduleMeta.slug}/create`);
        }
    }, [panelPath, moduleMeta.slug, moduleMeta.simple, simpleFormSchema]);

    const handleSimpleEdit = useCallback((record: Record<string, unknown>) => {
        setSimpleEditRecord(record);
        setSimpleModalOpen(true);
    }, []);

    const handleSimpleModalClose = useCallback(() => {
        setSimpleModalOpen(false);
        setSimpleEditRecord(undefined);
    }, []);

    const simpleEditSchema = useMemo<FormSchema | undefined>(() => {
        if (!simpleFormSchema || !simpleEditRecord) {
            return undefined;
        }
        return {
            ...simpleFormSchema,
            operation: 'edit',
        };
    }, [simpleFormSchema, simpleEditRecord]);

    return (
        <StudioProvider panel={panel}>
            <PanelLayout>
                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-xl font-semibold text-s-text">{moduleMeta.pluralLabel}</h1>
                        <p className="text-sm text-s-text-muted mt-0.5">Manage your {moduleMeta.pluralLabel.toLowerCase()}.</p>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Create {moduleMeta.label}
                    </button>
                </div>

                {/* Tabs + table or plain table */}
                {tabs && tabs.length > 0 && (
                    <div className="mb-4">
                        <TabGroup
                            tabs={tabs}
                            activeTab={resolveActiveTab(tabs)}
                            onTabChange={handleTabChange}
                        />
                    </div>
                )}

                <DataTable
                    schema={tableSchema}
                    data={records}
                    module={{ slug: moduleMeta.slug }}
                    panelPath={panelPath}
                    onSimpleEdit={moduleMeta.simple ? handleSimpleEdit : undefined}
                />

                {/* Simple module modal */}
                {moduleMeta.simple && simpleFormSchema && (
                    <SimpleFormModal
                        open={simpleModalOpen}
                        onClose={handleSimpleModalClose}
                        schema={simpleEditRecord ? (simpleEditSchema as FormSchema) : simpleFormSchema}
                        record={simpleEditRecord}
                        panelPath={panelPath}
                        moduleSlug={moduleMeta.slug}
                    />
                )}
            </PanelLayout>
        </StudioProvider>
    );
}
