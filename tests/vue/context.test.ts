import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, inject } from 'vue';
import {
    StudioProvider,
    StudioContextKey,
    useStudioContext,
    type StudioContextValue,
    type ColorMode,
} from '../../src/vue/context/StudioContext';
import type { PanelSchema } from '../../src/shared/types/schema';

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

// Consumer component that reads context and exposes it via data attributes
const ContextConsumer = defineComponent({
    name: 'ContextConsumer',
    setup() {
        const ctx = useStudioContext();
        return { ctx };
    },
    render() {
        return h('div', { class: 'consumer' }, [
            h('span', { 'data-panel-id': this.ctx.panel.value.id }),
            h('span', { 'data-color-mode': this.ctx.colorMode.value }),
            h('span', { 'data-resolved-mode': this.ctx.resolvedColorMode.value }),
        ]);
    },
});

describe('StudioProvider', () => {
    beforeEach(() => {
        localStorage.clear();
        // Reset matchMedia to default (light mode)
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

    it('renders slot content', () => {
        const wrapper = mount(StudioProvider, {
            props: { panel: minimalPanel },
            slots: {
                default: () => h('p', 'Hello World'),
            },
        });

        expect(wrapper.text()).toContain('Hello World');
    });

    it('sets data-studio-panel attribute on wrapper div', () => {
        const wrapper = mount(StudioProvider, {
            props: { panel: minimalPanel },
            slots: { default: () => h('span') },
        });

        expect(wrapper.find('[data-studio-panel]').exists()).toBe(true);
        expect(wrapper.attributes('data-studio-panel')).toBe('test-panel');
    });

    it('sets data-studio-theme attribute on wrapper div', () => {
        const wrapper = mount(StudioProvider, {
            props: { panel: minimalPanel },
            slots: { default: () => h('span') },
        });

        // Default color mode is 'auto', and with matchMedia returning false (light), resolved should be 'light'
        expect(wrapper.attributes('data-studio-theme')).toBe('light');
    });

    it('provides context values to child components', () => {
        const wrapper = mount(StudioProvider, {
            props: { panel: minimalPanel },
            slots: {
                default: () => h(ContextConsumer),
            },
        });

        expect(wrapper.find('[data-panel-id="test-panel"]').exists()).toBe(true);
        expect(wrapper.find('[data-color-mode="auto"]').exists()).toBe(true);
        expect(wrapper.find('[data-resolved-mode="light"]').exists()).toBe(true);
    });

    it('provides hooks from props', () => {
        const hookFn = vi.fn(() => ({}));
        const hooks = { 'theme:resolved': hookFn };

        // Create a consumer that checks hooks are provided
        const HooksChecker = defineComponent({
            setup() {
                const ctx = useStudioContext();
                return { hasHook: 'theme:resolved' in ctx.hooks.value };
            },
            render() {
                return h('span', { 'data-has-hook': String(this.hasHook) });
            },
        });

        const wrapper = mount(StudioProvider, {
            props: { panel: minimalPanel, hooks },
            slots: { default: () => h(HooksChecker) },
        });

        expect(wrapper.find('[data-has-hook="true"]').exists()).toBe(true);
    });

    it('defaults color mode to auto', () => {
        const wrapper = mount(StudioProvider, {
            props: { panel: minimalPanel },
            slots: { default: () => h(ContextConsumer) },
        });

        expect(wrapper.find('[data-color-mode="auto"]').exists()).toBe(true);
    });

    it('resolves auto color mode to system preference (light)', () => {
        // matchMedia returns false for dark => light
        const wrapper = mount(StudioProvider, {
            props: { panel: minimalPanel },
            slots: { default: () => h(ContextConsumer) },
        });

        expect(wrapper.find('[data-resolved-mode="light"]').exists()).toBe(true);
    });

    it('resolves auto color mode to system preference (dark)', () => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query: string) => ({
                matches: true,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        const wrapper = mount(StudioProvider, {
            props: { panel: minimalPanel },
            slots: { default: () => h(ContextConsumer) },
        });

        expect(wrapper.find('[data-resolved-mode="dark"]').exists()).toBe(true);
    });

    it('setColorMode persists to localStorage and updates mode', async () => {
        // Consumer that calls setColorMode
        const ModeChanger = defineComponent({
            setup() {
                const ctx = useStudioContext();
                ctx.setColorMode('dark');
                return { ctx };
            },
            render() {
                return h('span', {
                    'data-color-mode': this.ctx.colorMode.value,
                    'data-resolved': this.ctx.resolvedColorMode.value,
                });
            },
        });

        const wrapper = mount(StudioProvider, {
            props: { panel: minimalPanel },
            slots: { default: () => h(ModeChanger) },
        });

        expect(localStorage.getItem('studio-color-mode')).toBe('dark');
        expect(wrapper.find('[data-color-mode="dark"]').exists()).toBe(true);
        expect(wrapper.find('[data-resolved="dark"]').exists()).toBe(true);
    });

    it('reads stored color mode from localStorage', () => {
        localStorage.setItem('studio-color-mode', 'dark');

        const wrapper = mount(StudioProvider, {
            props: { panel: minimalPanel },
            slots: { default: () => h(ContextConsumer) },
        });

        expect(wrapper.find('[data-color-mode="dark"]').exists()).toBe(true);
    });

    it('adds dark class when resolved mode is dark', () => {
        localStorage.setItem('studio-color-mode', 'dark');

        const wrapper = mount(StudioProvider, {
            props: { panel: minimalPanel },
            slots: { default: () => h('span') },
        });

        expect(wrapper.classes()).toContain('dark');
    });

    it('does not add dark class when resolved mode is light', () => {
        const wrapper = mount(StudioProvider, {
            props: { panel: minimalPanel },
            slots: { default: () => h('span') },
        });

        expect(wrapper.classes()).not.toContain('dark');
    });

    it('listens for system color scheme changes', async () => {
        let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation((query: string) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn().mockImplementation((_event: string, handler: (e: MediaQueryListEvent) => void) => {
                    changeHandler = handler;
                }),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        const wrapper = mount(StudioProvider, {
            props: { panel: minimalPanel },
            slots: { default: () => h(ContextConsumer) },
        });

        // Initially light
        expect(wrapper.attributes('data-studio-theme')).toBe('light');

        // Simulate system change to dark
        expect(changeHandler).not.toBeNull();
        changeHandler!({ matches: true } as MediaQueryListEvent);
        await wrapper.vm.$nextTick();

        expect(wrapper.attributes('data-studio-theme')).toBe('dark');
    });

    it('applies css variables as inline styles', () => {
        const wrapper = mount(StudioProvider, {
            props: { panel: minimalPanel },
            slots: { default: () => h('span') },
        });

        // The provider generates css variables from the theme/layout
        const style = wrapper.attributes('style');
        expect(style).toBeDefined();
        // Should contain at least one css variable
        expect(style).toContain('--');
    });
});

describe('useStudioContext', () => {
    it('throws when used outside provider', () => {
        const ThrowingComponent = defineComponent({
            setup() {
                // This should throw
                useStudioContext();
                return {};
            },
            render() {
                return h('div');
            },
        });

        expect(() => {
            mount(ThrowingComponent);
        }).toThrow('useStudioContext must be used within a StudioProvider');
    });
});
