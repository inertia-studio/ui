import { useMemo } from 'react';
import { useStudioContext } from '../context/StudioContext';
import { generateCssVariables } from '../../shared/theme/css-variables';
import type { ResolvedTheme } from '../../shared/types/hooks';
import type { LayoutSchema, ThemeSchema } from '../../shared/types/schema';

export function useTheme(): ResolvedTheme {
    const { panel, hooks } = useStudioContext();

    return useMemo(() => {
        const cssVariables = generateCssVariables(
            panel.theme as Parameters<typeof generateCssVariables>[0],
            panel.layout as Parameters<typeof generateCssVariables>[1],
        );

        const resolved: ResolvedTheme = {
            ...panel.theme,
            cssVariables,
        };

        const hookFn = hooks['theme:resolved'];
        return hookFn ? hookFn(resolved) : resolved;
    }, [panel.theme, panel.layout, hooks]);
}
