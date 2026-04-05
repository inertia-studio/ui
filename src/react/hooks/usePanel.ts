import { useMemo } from 'react';
import { useStudioContext } from '../context/StudioContext';
import type { LayoutSchema, ModuleMetaSchema, NavigationGroupSchema, PanelSchema, ThemeSchema, UserSchema } from '../../shared/types/schema';

interface UsePanelReturn {
    panel: PanelSchema;
    theme: ThemeSchema;
    layout: LayoutSchema;
    navigation: NavigationGroupSchema[];
    modules: ModuleMetaSchema[];
    user: UserSchema | null;
}

const defaultLayout: LayoutSchema = {
    maxWidth: '80rem',
    contentWidth: '100%',
    gutter: '1.5rem',
    sidebar: { style: 'dark', width: '280px', collapsible: true, collapsedWidth: '64px', defaultCollapsed: false, mobileBreakpoint: 'lg' },
    topbar: { sticky: true, height: '64px', showBreadcrumbs: true, showSearch: true, showUserMenu: true },
    navigation: { style: 'sidebar', groupStyle: 'collapsible', iconSize: 'md', activeStyle: 'highlight' },
    footer: { enabled: false, text: null, sticky: false },
};

const defaultTheme: ThemeSchema = {
    primary: '#2563eb', danger: '#dc2626', warning: '#d97706', success: '#16a34a',
    info: '#3b82f6', gray: '#64748b', fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '0.875rem', borderRadius: 'lg', density: 'comfortable',
};

export function usePanel(): UsePanelReturn {
    const { panel } = useStudioContext();

    return useMemo(() => ({
        panel,
        theme: panel?.theme ?? defaultTheme,
        layout: panel?.layout ?? defaultLayout,
        navigation: panel?.navigation ?? [],
        modules: panel?.modules ?? [],
        user: panel?.user ?? null,
    }), [panel]);
}
