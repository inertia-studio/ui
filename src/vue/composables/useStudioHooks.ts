import { useStudioContext } from '../context/StudioContext';
import type { StudioHookName, StudioHooks } from '../../shared/types/hooks';

export interface UseStudioHooksReturn {
    invoke: <K extends StudioHookName>(
        name: K,
        ...args: Parameters<StudioHooks[K]>
    ) => ReturnType<StudioHooks[K]> | null;
    has: (name: StudioHookName) => boolean;
}

export function useStudioHooks(): UseStudioHooksReturn {
    const { hooks } = useStudioContext();

    const invoke = <K extends StudioHookName>(
        name: K,
        ...args: Parameters<StudioHooks[K]>
    ): ReturnType<StudioHooks[K]> | null => {
        const hookFn = hooks.value[name] as ((...a: unknown[]) => unknown) | undefined;
        if (!hookFn) return null;
        return hookFn(...args) as ReturnType<StudioHooks[K]>;
    };

    const has = (name: StudioHookName): boolean => {
        return name in hooks.value && hooks.value[name] !== undefined;
    };

    return { invoke, has };
}
