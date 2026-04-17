import { computed, type ComputedRef } from 'vue';
import { useStudioContext } from '../context/StudioContext';
import type {
    LayoutSchema,
    ModuleMetaSchema,
    NavigationGroupSchema,
    PanelSchema,
    ThemeSchema,
    UserSchema,
} from '../../shared/types/schema';

export interface UsePanelReturn {
    panel: ComputedRef<PanelSchema>;
    theme: ComputedRef<ThemeSchema>;
    layout: ComputedRef<LayoutSchema>;
    navigation: ComputedRef<NavigationGroupSchema[]>;
    modules: ComputedRef<ModuleMetaSchema[]>;
    user: ComputedRef<UserSchema | null>;
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

    return {
        panel: computed(() => panel.value),
        theme: computed(() => panel.value?.theme ?? defaultTheme),
        layout: computed(() => panel.value?.layout ?? defaultLayout),
        navigation: computed(() => panel.value?.navigation ?? []),
        modules: computed(() => panel.value?.modules ?? []),
        user: computed(() => panel.value?.user ?? null),
    };
}
