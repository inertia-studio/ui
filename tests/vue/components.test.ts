import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

// Mock @inertiajs/vue3 before importing components that depend on it
vi.mock('@inertiajs/vue3', () => ({
    router: {
        on: vi.fn(() => vi.fn()),
    },
}));

import { Icon } from '../../src/vue/components/Icon';
import { TabPanel } from '../../src/vue/components/Tabs';
import { toast, subscribeToasts } from '../../src/vue/components/Toast/Toast';
import { ToastContainer } from '../../src/vue/components/Toast';
import { LoadingBar } from '../../src/vue/components/LoadingBar';

describe('Icon component', () => {
    it('renders an svg for a known icon name', () => {
        const wrapper = mount(Icon, {
            props: { name: 'home' },
        });

        const svg = wrapper.find('svg');
        expect(svg.exists()).toBe(true);
        expect(svg.attributes('viewBox')).toBe('0 0 24 24');
        expect(svg.attributes('fill')).toBe('none');
        expect(svg.attributes('stroke')).toBe('currentColor');
    });

    it('applies size classes based on size prop', () => {
        const wrapper = mount(Icon, {
            props: { name: 'home', size: 'lg' },
        });

        const svg = wrapper.find('svg');
        expect(svg.classes()).toContain('h-6');
        expect(svg.classes()).toContain('w-6');
    });

    it('uses default md size', () => {
        const wrapper = mount(Icon, {
            props: { name: 'home' },
        });

        const svg = wrapper.find('svg');
        expect(svg.classes()).toContain('h-5');
        expect(svg.classes()).toContain('w-5');
    });

    it('renders a placeholder span for unknown icon names', () => {
        const wrapper = mount(Icon, {
            props: { name: 'nonexistent-icon-xyz' },
        });

        expect(wrapper.find('svg').exists()).toBe(false);
        expect(wrapper.find('span').exists()).toBe(true);
    });

    it('renders known icon names: users, plus, check', () => {
        for (const name of ['users', 'plus', 'check']) {
            const wrapper = mount(Icon, { props: { name } });
            expect(wrapper.find('svg').exists()).toBe(true);
        }
    });
});

describe('TabPanel component', () => {
    it('renders slot content when active', () => {
        const wrapper = mount(TabPanel, {
            props: { active: true },
            slots: {
                default: () => h('p', 'Tab content'),
            },
        });

        expect(wrapper.text()).toContain('Tab content');
        expect(wrapper.find('[role="tabpanel"]').exists()).toBe(true);
    });

    it('does not render when inactive', () => {
        const wrapper = mount(TabPanel, {
            props: { active: false },
            slots: {
                default: () => h('p', 'Tab content'),
            },
        });

        expect(wrapper.text()).not.toContain('Tab content');
        expect(wrapper.find('[role="tabpanel"]').exists()).toBe(false);
    });
});

describe('Toast module', () => {
    it('exports a toast function', () => {
        expect(typeof toast).toBe('function');
    });

    it('toast notifies subscribers', () => {
        const handler = vi.fn();
        const unsubscribe = subscribeToasts(handler);

        toast({ type: 'success', title: 'Saved!' });

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'success',
                title: 'Saved!',
                id: expect.any(String),
            }),
        );

        unsubscribe();
    });

    it('unsubscribe stops notifications', () => {
        const handler = vi.fn();
        const unsubscribe = subscribeToasts(handler);
        unsubscribe();

        toast({ type: 'info', title: 'Hello' });

        expect(handler).not.toHaveBeenCalled();
    });

    it('supports multiple subscribers', () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        const unsub1 = subscribeToasts(handler1);
        const unsub2 = subscribeToasts(handler2);

        toast({ type: 'error', title: 'Oops' });

        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(1);

        unsub1();
        unsub2();
    });

    it('ToastContainer component is exported and mounts without error', () => {
        expect(ToastContainer).toBeDefined();
        const wrapper = mount(ToastContainer);
        // Initially, no toasts should be shown
        expect(wrapper.html()).not.toContain('toast');
    });
});

describe('LoadingBar component', () => {
    it('mounts without error', () => {
        const wrapper = mount(LoadingBar);
        // Initially not loading, so should not show progress bar
        expect(wrapper.find('.fixed').exists()).toBe(false);
    });

    it('is a valid Vue component', () => {
        expect(LoadingBar).toBeDefined();
        expect(typeof LoadingBar).toBe('object');
    });
});
