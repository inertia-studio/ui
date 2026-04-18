import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { StudioProvider } from '../../src/react/context/StudioContext';
import { usePanel } from '../../src/react/hooks/usePanel';
import { useTheme } from '../../src/react/hooks/useTheme';
import { useFormState } from '../../src/react/hooks/useFormState';
import { useStudioHooks } from '../../src/react/hooks/useStudioHooks';

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

function createWrapper(panel = minimalPanel, hooks = {}) {
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <StudioProvider panel={panel} hooks={hooks as any}>
                {children}
            </StudioProvider>
        );
    };
}

describe('usePanel', () => {
    it('returns the panel from context', () => {
        const { result } = renderHook(() => usePanel(), {
            wrapper: createWrapper(),
        });

        expect(result.current.panel).toBe(minimalPanel);
    });

    it('returns theme from panel', () => {
        const { result } = renderHook(() => usePanel(), {
            wrapper: createWrapper(),
        });

        expect(result.current.theme).toBe(minimalPanel.theme);
        expect(result.current.theme.primary).toBe('#2563eb');
    });

    it('returns layout from panel', () => {
        const { result } = renderHook(() => usePanel(), {
            wrapper: createWrapper(),
        });

        expect(result.current.layout).toBe(minimalPanel.layout);
        expect(result.current.layout.maxWidth).toBe('80rem');
    });

    it('returns empty navigation when panel has none', () => {
        const { result } = renderHook(() => usePanel(), {
            wrapper: createWrapper(),
        });

        expect(result.current.navigation).toEqual([]);
    });

    it('returns empty modules when panel has none', () => {
        const { result } = renderHook(() => usePanel(), {
            wrapper: createWrapper(),
        });

        expect(result.current.modules).toEqual([]);
    });

    it('returns null user when panel has no user', () => {
        const { result } = renderHook(() => usePanel(), {
            wrapper: createWrapper(),
        });

        expect(result.current.user).toBeNull();
    });

    it('provides defaults when panel fields are missing', () => {
        const sparsePanel = {
            id: 'sparse',
            path: '/sparse',
            brandName: 'Sparse',
            brandLogo: null,
            brandLogoCollapsed: null,
            favicon: null,
            theme: undefined as any,
            layout: undefined as any,
            navigation: undefined as any,
            modules: undefined as any,
            tenancy: null,
            user: undefined as any,
        };

        const { result } = renderHook(() => usePanel(), {
            wrapper: createWrapper(sparsePanel),
        });

        // Should fall back to default theme and layout
        expect(result.current.theme.primary).toBe('#2563eb');
        expect(result.current.layout.maxWidth).toBe('80rem');
        expect(result.current.navigation).toEqual([]);
        expect(result.current.modules).toEqual([]);
        expect(result.current.user).toBeNull();
    });
});

describe('useTheme', () => {
    it('returns resolved theme with cssVariables', () => {
        const { result } = renderHook(() => useTheme(), {
            wrapper: createWrapper(),
        });

        expect(result.current.cssVariables).toBeDefined();
        expect(result.current.cssVariables['--studio-primary']).toBe('37 99 235');
    });

    it('includes theme properties in the resolved theme', () => {
        const { result } = renderHook(() => useTheme(), {
            wrapper: createWrapper(),
        });

        expect(result.current.primary).toBe('#2563eb');
        expect(result.current.fontFamily).toBe('Inter, system-ui, sans-serif');
        expect(result.current.borderRadius).toBe('lg');
    });

    it('applies theme:resolved hook if provided', () => {
        const hookFn = vi.fn((resolved) => ({
            ...resolved,
            fontFamily: 'Custom Font',
        }));

        const { result } = renderHook(() => useTheme(), {
            wrapper: createWrapper(minimalPanel, { 'theme:resolved': hookFn }),
        });

        expect(hookFn).toHaveBeenCalled();
        expect(result.current.fontFamily).toBe('Custom Font');
    });
});

describe('useFormState', () => {
    function createStore(initialData: Record<string, unknown> = {}, initialErrors: Record<string, string> = {}) {
        const store = {
            data: { ...initialData },
            errors: { ...initialErrors },
            setData: vi.fn((key: string, value: unknown) => {
                store.data[key] = value;
            }),
            setError: vi.fn((key: string, error: string | null) => {
                if (error === null) {
                    delete store.errors[key];
                } else {
                    store.errors[key] = error;
                }
            }),
        };
        return store;
    }

    it('returns current value from store', () => {
        const store = createStore({ name: 'John' });

        const { result } = renderHook(() => useFormState('name', store));

        expect(result.current.value).toBe('John');
    });

    it('returns null when field has no value', () => {
        const store = createStore({});

        const { result } = renderHook(() => useFormState('name', store));

        expect(result.current.value).toBeNull();
    });

    it('returns error from store', () => {
        const store = createStore({}, { name: 'Name is required' });

        const { result } = renderHook(() => useFormState('name', store));

        expect(result.current.error).toBe('Name is required');
    });

    it('returns null error when no error exists', () => {
        const store = createStore({});

        const { result } = renderHook(() => useFormState('name', store));

        expect(result.current.error).toBeNull();
    });

    it('starts as untouched', () => {
        const store = createStore({ name: '' });

        const { result } = renderHook(() => useFormState('name', store));

        expect(result.current.touched).toBe(false);
    });

    it('marks as touched when setValue is called', () => {
        const store = createStore({ name: '' });

        const { result } = renderHook(() => useFormState('name', store));

        act(() => {
            result.current.setValue('Jane');
        });

        expect(result.current.touched).toBe(true);
        expect(store.setData).toHaveBeenCalledWith('name', 'Jane');
    });

    it('setError calls store.setError', () => {
        const store = createStore({});

        const { result } = renderHook(() => useFormState('name', store));

        act(() => {
            result.current.setError('Field is required');
        });

        expect(store.setError).toHaveBeenCalledWith('name', 'Field is required');
    });

    it('setError with null clears the error', () => {
        const store = createStore({}, { name: 'Error' });

        const { result } = renderHook(() => useFormState('name', store));

        act(() => {
            result.current.setError(null);
        });

        expect(store.setError).toHaveBeenCalledWith('name', null);
    });
});

describe('useStudioHooks', () => {
    it('has() returns false for unregistered hooks', () => {
        const { result } = renderHook(() => useStudioHooks(), {
            wrapper: createWrapper(),
        });

        expect(result.current.has('theme:resolved')).toBe(false);
    });

    it('has() returns true for registered hooks', () => {
        const hooks = {
            'theme:resolved': vi.fn(),
        };

        const { result } = renderHook(() => useStudioHooks(), {
            wrapper: createWrapper(minimalPanel, hooks),
        });

        expect(result.current.has('theme:resolved')).toBe(true);
    });

    it('invoke() returns null for unregistered hooks', () => {
        const { result } = renderHook(() => useStudioHooks(), {
            wrapper: createWrapper(),
        });

        const invokeResult = result.current.invoke('theme:resolved', {} as any);
        expect(invokeResult).toBeNull();
    });

    it('invoke() calls the registered hook and returns its result', () => {
        const hookFn = vi.fn((theme) => ({ ...theme, modified: true }));
        const hooks = { 'theme:resolved': hookFn };

        const { result } = renderHook(() => useStudioHooks(), {
            wrapper: createWrapper(minimalPanel, hooks),
        });

        const input = { primary: '#000', cssVariables: {} } as any;
        const invokeResult = result.current.invoke('theme:resolved', input);

        expect(hookFn).toHaveBeenCalledWith(input);
        expect(invokeResult).toEqual({ ...input, modified: true });
    });
});
