import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref, computed, nextTick, provide } from 'vue';
import { StudioProvider, StudioContextKey, type StudioContextValue } from '../../src/vue/context/StudioContext';
import { usePanel } from '../../src/vue/composables/usePanel';
import { useTheme } from '../../src/vue/composables/useTheme';
import { useFormState, type FormStateStore } from '../../src/vue/composables/useFormState';
import { useStudioHooks } from '../../src/vue/composables/useStudioHooks';
import type { PanelSchema } from '../../src/shared/types/schema';
import type { StudioHooks, ResolvedTheme } from '../../src/shared/types/hooks';

const minimalPanel: PanelSchema = {
    id: 'test-panel',
    path: '/admin',
    brandName: 'Test',
    brandLogo: null,
    brandLogoCollapsed: null,
    favicon: null,
    theme: {
        primary: '#2563eb', danger: '#dc2626', warning: '#d97706', success: '#16a34a',
        info: '#3b82f6', gray: '#64748b', fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '0.875rem', borderRadius: 'lg', density: 'comfortable',
    },
    layout: {
        maxWidth: '80rem', contentWidth: '100%', gutter: '1.5rem',
        sidebar: { style: 'dark' as const, width: '280px', collapsible: true, collapsedWidth: '64px', defaultCollapsed: false, mobileBreakpoint: 'lg' as const },
        topbar: { sticky: true, height: '64px', showBreadcrumbs: true, showSearch: true, showUserMenu: true },
        navigation: { style: 'sidebar' as const, groupStyle: 'collapsible' as const, iconSize: 'md' as const, activeStyle: 'highlight' as const },
        footer: { enabled: false, text: null, sticky: false },
    },
    navigation: [],
    modules: [],
    tenancy: null,
    user: null,
};

beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
});

/**
 * Helper: mount a component inside StudioProvider with the given panel/hooks,
 * and return the wrapper.
 */
function mountWithProvider(
    childComponent: ReturnType<typeof defineComponent>,
    panel: PanelSchema = minimalPanel,
    hooks: Partial<StudioHooks> = {},
) {
    return mount(StudioProvider, {
        props: { panel, hooks },
        slots: {
            default: () => h(childComponent),
        },
    });
}

// ============================================================================
// usePanel
// ============================================================================

describe('usePanel', () => {
    it('returns panel from context', () => {
        let result: ReturnType<typeof usePanel> | null = null;

        const Consumer = defineComponent({
            setup() {
                result = usePanel();
                return {};
            },
            render() {
                return h('div');
            },
        });

        mountWithProvider(Consumer);

        expect(result).not.toBeNull();
        expect(result!.panel.value.id).toBe('test-panel');
    });

    it('returns theme from panel', () => {
        let result: ReturnType<typeof usePanel> | null = null;

        const Consumer = defineComponent({
            setup() {
                result = usePanel();
                return {};
            },
            render() {
                return h('div');
            },
        });

        mountWithProvider(Consumer);

        expect(result!.theme.value.primary).toBe('#2563eb');
        expect(result!.theme.value.fontFamily).toBe('Inter, system-ui, sans-serif');
    });

    it('returns layout from panel', () => {
        let result: ReturnType<typeof usePanel> | null = null;

        const Consumer = defineComponent({
            setup() {
                result = usePanel();
                return {};
            },
            render() {
                return h('div');
            },
        });

        mountWithProvider(Consumer);

        expect(result!.layout.value.maxWidth).toBe('80rem');
        expect(result!.layout.value.sidebar.width).toBe('280px');
    });

    it('returns navigation from panel', () => {
        let result: ReturnType<typeof usePanel> | null = null;

        const Consumer = defineComponent({
            setup() {
                result = usePanel();
                return {};
            },
            render() {
                return h('div');
            },
        });

        mountWithProvider(Consumer);

        expect(result!.navigation.value).toEqual([]);
    });

    it('returns modules from panel', () => {
        let result: ReturnType<typeof usePanel> | null = null;

        const Consumer = defineComponent({
            setup() {
                result = usePanel();
                return {};
            },
            render() {
                return h('div');
            },
        });

        mountWithProvider(Consumer);

        expect(result!.modules.value).toEqual([]);
    });

    it('returns user as null when not provided', () => {
        let result: ReturnType<typeof usePanel> | null = null;

        const Consumer = defineComponent({
            setup() {
                result = usePanel();
                return {};
            },
            render() {
                return h('div');
            },
        });

        mountWithProvider(Consumer);

        expect(result!.user.value).toBeNull();
    });

    it('falls back to default theme when panel theme is missing', () => {
        let result: ReturnType<typeof usePanel> | null = null;

        const Consumer = defineComponent({
            setup() {
                result = usePanel();
                return {};
            },
            render() {
                return h('div');
            },
        });

        // Provide a panel-like context without theme
        const panelWithoutTheme = { ...minimalPanel, theme: undefined } as unknown as PanelSchema;

        // Provide context directly to test fallback behavior
        const Wrapper = defineComponent({
            setup(_, { slots }) {
                provide(StudioContextKey, {
                    panel: ref(panelWithoutTheme) as any,
                    hooks: ref({}) as any,
                    colorMode: ref('auto' as const),
                    resolvedColorMode: computed(() => 'light' as const),
                    setColorMode: () => {},
                });
                return () => slots.default?.();
            },
        });

        mount(Wrapper, {
            slots: { default: () => h(Consumer) },
        });

        // Should fall back to default theme
        expect(result!.theme.value.primary).toBe('#2563eb');
    });

    it('falls back to default layout when panel layout is missing', () => {
        let result: ReturnType<typeof usePanel> | null = null;

        const Consumer = defineComponent({
            setup() {
                result = usePanel();
                return {};
            },
            render() {
                return h('div');
            },
        });

        const panelWithoutLayout = { ...minimalPanel, layout: undefined } as unknown as PanelSchema;

        const Wrapper = defineComponent({
            setup(_, { slots }) {
                provide(StudioContextKey, {
                    panel: ref(panelWithoutLayout) as any,
                    hooks: ref({}) as any,
                    colorMode: ref('auto' as const),
                    resolvedColorMode: computed(() => 'light' as const),
                    setColorMode: () => {},
                });
                return () => slots.default?.();
            },
        });

        mount(Wrapper, {
            slots: { default: () => h(Consumer) },
        });

        expect(result!.layout.value.maxWidth).toBe('80rem');
    });
});

// ============================================================================
// useTheme
// ============================================================================

describe('useTheme', () => {
    it('returns resolved theme with cssVariables', () => {
        let resolvedTheme: ResolvedTheme | null = null;

        const Consumer = defineComponent({
            setup() {
                const theme = useTheme();
                resolvedTheme = theme.value;
                return {};
            },
            render() {
                return h('div');
            },
        });

        mountWithProvider(Consumer);

        expect(resolvedTheme).not.toBeNull();
        expect(resolvedTheme!.cssVariables).toBeDefined();
        expect(typeof resolvedTheme!.cssVariables).toBe('object');
        // Theme properties should be spread onto resolved
        expect(resolvedTheme!.primary).toBe('#2563eb');
    });

    it('calls theme:resolved hook if provided', () => {
        const hookFn = vi.fn((theme: ResolvedTheme) => ({
            ...theme,
            primary: '#ff0000',
        }));

        let resolvedTheme: ResolvedTheme | null = null;

        const Consumer = defineComponent({
            setup() {
                const theme = useTheme();
                resolvedTheme = theme.value;
                return {};
            },
            render() {
                return h('div');
            },
        });

        mountWithProvider(Consumer, minimalPanel, { 'theme:resolved': hookFn });

        expect(hookFn).toHaveBeenCalledTimes(1);
        expect(resolvedTheme!.primary).toBe('#ff0000');
    });

    it('returns unmodified theme when no hook is provided', () => {
        let resolvedTheme: ResolvedTheme | null = null;

        const Consumer = defineComponent({
            setup() {
                const theme = useTheme();
                resolvedTheme = theme.value;
                return {};
            },
            render() {
                return h('div');
            },
        });

        mountWithProvider(Consumer, minimalPanel, {});

        expect(resolvedTheme!.primary).toBe('#2563eb');
        expect(resolvedTheme!.danger).toBe('#dc2626');
    });
});

// ============================================================================
// useFormState
// ============================================================================

describe('useFormState', () => {
    function createStore(initialData: Record<string, unknown> = {}, initialErrors: Record<string, string> = {}): FormStateStore {
        return {
            data: { ...initialData },
            errors: { ...initialErrors },
            setData: vi.fn(function (this: FormStateStore, key: string, value: unknown) {
                this.data[key] = value;
            }),
            setError: vi.fn(function (this: FormStateStore, key: string, error: string | null) {
                if (error === null) {
                    delete this.errors[key];
                } else {
                    this.errors[key] = error;
                }
            }),
        };
    }

    it('returns reactive value from store', () => {
        const store = createStore({ name: 'John' });
        const state = useFormState('name', store);

        expect(state.value.value).toBe('John');
    });

    it('returns null when value is missing from store', () => {
        const store = createStore({});
        const state = useFormState('name', store);

        expect(state.value.value).toBeNull();
    });

    it('returns error from store', () => {
        const store = createStore({}, { name: 'Name is required' });
        const state = useFormState('name', store);

        expect(state.error.value).toBe('Name is required');
    });

    it('returns null error when no error exists', () => {
        const store = createStore({});
        const state = useFormState('name', store);

        expect(state.error.value).toBeNull();
    });

    it('starts with touched as false', () => {
        const store = createStore({ name: 'John' });
        const state = useFormState('name', store);

        expect(state.touched.value).toBe(false);
    });

    it('setValue marks touched as true', () => {
        const store = createStore({ name: 'John' });
        const state = useFormState('name', store);

        state.setValue('Jane');

        expect(state.touched.value).toBe(true);
    });

    it('setValue calls store.setData', () => {
        const store = createStore({ name: 'John' });
        const state = useFormState('name', store);

        state.setValue('Jane');

        expect(store.setData).toHaveBeenCalledWith('name', 'Jane');
    });

    it('setError calls store.setError', () => {
        const store = createStore({});
        const state = useFormState('name', store);

        state.setError('This field is required');

        expect(store.setError).toHaveBeenCalledWith('name', 'This field is required');
    });

    it('setError with null clears the error', () => {
        const store = createStore({}, { name: 'Error' });
        const state = useFormState('name', store);

        state.setError(null);

        expect(store.setError).toHaveBeenCalledWith('name', null);
    });
});

// ============================================================================
// useStudioHooks
// ============================================================================

describe('useStudioHooks', () => {
    it('invoke calls the hook function with correct args', () => {
        const cssVarsHook = vi.fn((vars: Record<string, string>) => ({
            ...vars,
            '--custom': 'value',
        }));

        let hooksApi: ReturnType<typeof useStudioHooks> | null = null;

        const Consumer = defineComponent({
            setup() {
                hooksApi = useStudioHooks();
                return {};
            },
            render() {
                return h('div');
            },
        });

        mountWithProvider(Consumer, minimalPanel, { 'theme:css-vars': cssVarsHook });

        const input = { '--color': 'red' };
        const result = hooksApi!.invoke('theme:css-vars', input);

        expect(cssVarsHook).toHaveBeenCalledWith(input);
        expect(result).toEqual({ '--color': 'red', '--custom': 'value' });
    });

    it('invoke returns null when hook does not exist', () => {
        let hooksApi: ReturnType<typeof useStudioHooks> | null = null;

        const Consumer = defineComponent({
            setup() {
                hooksApi = useStudioHooks();
                return {};
            },
            render() {
                return h('div');
            },
        });

        mountWithProvider(Consumer, minimalPanel, {});

        const result = hooksApi!.invoke('theme:css-vars', {});
        expect(result).toBeNull();
    });

    it('has returns true for registered hooks', () => {
        const hookFn = vi.fn(() => ({}));

        let hooksApi: ReturnType<typeof useStudioHooks> | null = null;

        const Consumer = defineComponent({
            setup() {
                hooksApi = useStudioHooks();
                return {};
            },
            render() {
                return h('div');
            },
        });

        mountWithProvider(Consumer, minimalPanel, { 'theme:css-vars': hookFn });

        expect(hooksApi!.has('theme:css-vars')).toBe(true);
    });

    it('has returns false for unregistered hooks', () => {
        let hooksApi: ReturnType<typeof useStudioHooks> | null = null;

        const Consumer = defineComponent({
            setup() {
                hooksApi = useStudioHooks();
                return {};
            },
            render() {
                return h('div');
            },
        });

        mountWithProvider(Consumer, minimalPanel, {});

        expect(hooksApi!.has('theme:css-vars')).toBe(false);
    });
});
