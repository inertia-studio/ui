import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { StudioProvider, useStudioContext } from '../../src/react/context/StudioContext';

const minimalPanel = {
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
});

describe('StudioProvider', () => {
    it('renders children', () => {
        render(
            <StudioProvider panel={minimalPanel}>
                <div data-testid="child">Hello</div>
            </StudioProvider>,
        );
        expect(screen.getByTestId('child')).toHaveTextContent('Hello');
    });

    it('sets data-studio-panel attribute', () => {
        const { container } = render(
            <StudioProvider panel={minimalPanel}>
                <span>content</span>
            </StudioProvider>,
        );
        const wrapper = container.querySelector('[data-studio-panel]');
        expect(wrapper).not.toBeNull();
        expect(wrapper!.getAttribute('data-studio-panel')).toBe('test-panel');
    });

    it('sets data-studio-theme attribute', () => {
        const { container } = render(
            <StudioProvider panel={minimalPanel}>
                <span>content</span>
            </StudioProvider>,
        );
        const wrapper = container.querySelector('[data-studio-theme]');
        expect(wrapper).not.toBeNull();
        // Default should be either 'light' or 'dark' (system pref in jsdom defaults to light)
        expect(['light', 'dark']).toContain(wrapper!.getAttribute('data-studio-theme'));
    });

    it('applies CSS variables as inline styles', () => {
        const { container } = render(
            <StudioProvider panel={minimalPanel}>
                <span>content</span>
            </StudioProvider>,
        );
        const wrapper = container.querySelector('[data-studio-panel]') as HTMLElement;
        expect(wrapper.style.getPropertyValue('--studio-primary')).toBe('37 99 235');
        expect(wrapper.style.getPropertyValue('--studio-font')).toBe('Inter, system-ui, sans-serif');
    });
});

describe('useStudioContext', () => {
    it('throws when used outside StudioProvider', () => {
        // Suppress React error boundary console output
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

        function BadComponent() {
            useStudioContext();
            return null;
        }

        expect(() => render(<BadComponent />)).toThrow(
            'useStudioContext must be used within a StudioProvider',
        );

        spy.mockRestore();
    });

    it('provides panel data', () => {
        const { result } = renderHook(() => useStudioContext(), {
            wrapper: ({ children }) => (
                <StudioProvider panel={minimalPanel}>{children}</StudioProvider>
            ),
        });

        expect(result.current.panel).toBe(minimalPanel);
    });

    it('provides hooks (empty by default)', () => {
        const { result } = renderHook(() => useStudioContext(), {
            wrapper: ({ children }) => (
                <StudioProvider panel={minimalPanel}>{children}</StudioProvider>
            ),
        });

        expect(result.current.hooks).toEqual({});
    });

    it('provides custom hooks when passed to provider', () => {
        const customHook = vi.fn((vars: Record<string, string>) => vars);
        const hooks = { 'theme:css-vars': customHook } as any;

        const { result } = renderHook(() => useStudioContext(), {
            wrapper: ({ children }) => (
                <StudioProvider panel={minimalPanel} hooks={hooks}>{children}</StudioProvider>
            ),
        });

        expect(result.current.hooks).toBe(hooks);
        expect(customHook).toHaveBeenCalled();
    });

    it('provides colorMode defaulting to auto', () => {
        const { result } = renderHook(() => useStudioContext(), {
            wrapper: ({ children }) => (
                <StudioProvider panel={minimalPanel}>{children}</StudioProvider>
            ),
        });

        expect(result.current.colorMode).toBe('auto');
    });

    it('provides resolvedColorMode based on system preference', () => {
        const { result } = renderHook(() => useStudioContext(), {
            wrapper: ({ children }) => (
                <StudioProvider panel={minimalPanel}>{children}</StudioProvider>
            ),
        });

        // jsdom doesn't match prefers-color-scheme: dark by default, so it should be 'light'
        expect(result.current.resolvedColorMode).toBe('light');
    });

    it('setColorMode updates localStorage and color mode', () => {
        const { result } = renderHook(() => useStudioContext(), {
            wrapper: ({ children }) => (
                <StudioProvider panel={minimalPanel}>{children}</StudioProvider>
            ),
        });

        act(() => {
            result.current.setColorMode('dark');
        });

        expect(result.current.colorMode).toBe('dark');
        expect(result.current.resolvedColorMode).toBe('dark');
        expect(localStorage.getItem('studio-color-mode')).toBe('dark');
    });

    it('setColorMode to light works correctly', () => {
        const { result } = renderHook(() => useStudioContext(), {
            wrapper: ({ children }) => (
                <StudioProvider panel={minimalPanel}>{children}</StudioProvider>
            ),
        });

        act(() => {
            result.current.setColorMode('light');
        });

        expect(result.current.colorMode).toBe('light');
        expect(result.current.resolvedColorMode).toBe('light');
        expect(localStorage.getItem('studio-color-mode')).toBe('light');
    });

    it('reads initial colorMode from localStorage', () => {
        localStorage.setItem('studio-color-mode', 'dark');

        const { result } = renderHook(() => useStudioContext(), {
            wrapper: ({ children }) => (
                <StudioProvider panel={minimalPanel}>{children}</StudioProvider>
            ),
        });

        expect(result.current.colorMode).toBe('dark');
        expect(result.current.resolvedColorMode).toBe('dark');
    });
});
