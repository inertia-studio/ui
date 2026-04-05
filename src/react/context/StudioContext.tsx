import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { PanelSchema } from '../../shared/types/schema';
import type { StudioHooks } from '../../shared/types/hooks';
import { generateCssVariables } from '../../shared/theme/css-variables';

export type ColorMode = 'light' | 'dark' | 'auto';

interface StudioContextValue {
    panel: PanelSchema;
    hooks: Partial<StudioHooks>;
    colorMode: ColorMode;
    resolvedColorMode: 'light' | 'dark';
    setColorMode: (mode: ColorMode) => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

interface StudioProviderProps {
    panel: PanelSchema;
    hooks?: Partial<StudioHooks>;
    children: ReactNode;
}

function getSystemPreference(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredColorMode(): ColorMode {
    if (typeof localStorage === 'undefined') return 'auto';
    return (localStorage.getItem('studio-color-mode') as ColorMode) ?? 'auto';
}

export function StudioProvider({ panel, hooks = {}, children }: StudioProviderProps) {
    const [colorMode, setColorModeState] = useState<ColorMode>(getStoredColorMode);
    const [systemPref, setSystemPref] = useState<'light' | 'dark'>(getSystemPreference);

    // Listen for system preference changes
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setSystemPref(e.matches ? 'dark' : 'light');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const resolvedColorMode = colorMode === 'auto' ? systemPref : colorMode;

    const setColorMode = useCallback((mode: ColorMode) => {
        setColorModeState(mode);
        localStorage.setItem('studio-color-mode', mode);
    }, []);

    const cssVariables = useMemo(() => {
        if (!panel?.theme || !panel?.layout) return {};

        const vars = generateCssVariables(
            panel.theme as Parameters<typeof generateCssVariables>[0],
            panel.layout as Parameters<typeof generateCssVariables>[1],
        );

        const hookFn = hooks['theme:css-vars'];
        return hookFn ? hookFn(vars) : vars;
    }, [panel.theme, panel.layout, hooks]);

    const style = useMemo(() => {
        const s: Record<string, string> = {};
        for (const [key, value] of Object.entries(cssVariables)) {
            s[key] = value;
        }
        return s;
    }, [cssVariables]);

    const value = useMemo<StudioContextValue>(() => ({
        panel,
        hooks,
        colorMode,
        resolvedColorMode,
        setColorMode,
    }), [panel, hooks, colorMode, resolvedColorMode, setColorMode]);

    return (
        <StudioContext.Provider value={value}>
            <div data-studio-panel={panel.id} data-studio-theme={resolvedColorMode} className={resolvedColorMode === 'dark' ? 'dark' : ''} style={style}>
                {children}
            </div>
        </StudioContext.Provider>
    );
}

export function useStudioContext(): StudioContextValue {
    const context = useContext(StudioContext);
    if (!context) {
        throw new Error('useStudioContext must be used within a StudioProvider');
    }
    return context;
}
