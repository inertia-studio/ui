import { computed, type ComputedRef } from 'vue';
import { useStudioContext } from '../context/StudioContext';
import { generateCssVariables } from '../../shared/theme/css-variables';
import type { ResolvedTheme } from '../../shared/types/hooks';

export function useTheme(): ComputedRef<ResolvedTheme> {
    const { panel, hooks } = useStudioContext();

    return computed<ResolvedTheme>(() => {
        const cssVariables = generateCssVariables(
            panel.value.theme as Parameters<typeof generateCssVariables>[0],
            panel.value.layout as Parameters<typeof generateCssVariables>[1],
        );

        const resolved: ResolvedTheme = {
            ...panel.value.theme,
            cssVariables,
        };

        const hookFn = hooks.value['theme:resolved'];
        return hookFn ? hookFn(resolved) : resolved;
    });
}
