import { useCallback } from 'react';
import { useStudioContext } from '../context/StudioContext';
import type { StudioHookName, StudioHooks } from '../../shared/types/hooks';

export function useStudioHooks() {
    const { hooks } = useStudioContext();

    const invoke = useCallback(<K extends StudioHookName>(
        name: K,
        ...args: Parameters<StudioHooks[K]>
    ): ReturnType<StudioHooks[K]> | null => {
        const hookFn = hooks[name] as ((...a: unknown[]) => unknown) | undefined;
        if (!hookFn) return null;
        return hookFn(...args) as ReturnType<StudioHooks[K]>;
    }, [hooks]);

    const has = useCallback((name: StudioHookName): boolean => {
        return name in hooks && hooks[name] !== undefined;
    }, [hooks]);

    return { invoke, has };
}
