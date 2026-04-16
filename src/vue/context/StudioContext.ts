import {
    defineComponent,
    h,
    inject,
    onMounted,
    onBeforeUnmount,
    provide,
    ref,
    computed,
    type InjectionKey,
    type PropType,
    type Ref,
    type ComputedRef,
} from 'vue';
import type { PanelSchema } from '../../shared/types/schema';
import type { StudioHooks } from '../../shared/types/hooks';
import { generateCssVariables } from '../../shared/theme/css-variables';

export type ColorMode = 'light' | 'dark' | 'auto';

export interface StudioContextValue {
    panel: Ref<PanelSchema>;
    hooks: Ref<Partial<StudioHooks>>;
    colorMode: Ref<ColorMode>;
    resolvedColorMode: ComputedRef<'light' | 'dark'>;
    setColorMode: (mode: ColorMode) => void;
}

export const StudioContextKey: InjectionKey<StudioContextValue> = Symbol('StudioContext');

function getSystemPreference(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredColorMode(): ColorMode {
    if (typeof localStorage === 'undefined') return 'auto';
    return (localStorage.getItem('studio-color-mode') as ColorMode) ?? 'auto';
}

export const StudioProvider = defineComponent({
    name: 'StudioProvider',
    props: {
        panel: { type: Object as PropType<PanelSchema>, required: true },
        hooks: { type: Object as PropType<Partial<StudioHooks>>, default: () => ({}) },
    },
    setup(props, { slots }) {
        const colorMode = ref<ColorMode>(getStoredColorMode());
        const systemPref = ref<'light' | 'dark'>(getSystemPreference());

        const panelRef = computed(() => props.panel);
        const hooksRef = computed(() => props.hooks ?? {});

        const resolvedColorMode = computed<'light' | 'dark'>(() =>
            colorMode.value === 'auto' ? systemPref.value : colorMode.value,
        );

        const setColorMode = (mode: ColorMode) => {
            colorMode.value = mode;
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('studio-color-mode', mode);
            }
        };

        let mq: MediaQueryList | null = null;
        const mqHandler = (e: MediaQueryListEvent) => {
            systemPref.value = e.matches ? 'dark' : 'light';
        };

        onMounted(() => {
            if (typeof window === 'undefined') return;
            mq = window.matchMedia('(prefers-color-scheme: dark)');
            mq.addEventListener('change', mqHandler);
        });

        onBeforeUnmount(() => {
            mq?.removeEventListener('change', mqHandler);
        });

        const cssVariables = computed(() => {
            const panel = props.panel;
            if (!panel?.theme || !panel?.layout) return {} as Record<string, string>;
            const vars = generateCssVariables(
                panel.theme as Parameters<typeof generateCssVariables>[0],
                panel.layout as Parameters<typeof generateCssVariables>[1],
            );
            const hookFn = props.hooks?.['theme:css-vars'];
            return hookFn ? hookFn(vars) : vars;
        });

        const style = computed<Record<string, string>>(() => {
            const out: Record<string, string> = {};
            for (const [key, value] of Object.entries(cssVariables.value)) {
                out[key] = value;
            }
            return out;
        });

        provide(StudioContextKey, {
            panel: panelRef as unknown as Ref<PanelSchema>,
            hooks: hooksRef as unknown as Ref<Partial<StudioHooks>>,
            colorMode,
            resolvedColorMode,
            setColorMode,
        });

        return () =>
            h(
                'div',
                {
                    'data-studio-panel': props.panel.id,
                    'data-studio-theme': resolvedColorMode.value,
                    class: resolvedColorMode.value === 'dark' ? 'dark' : '',
                    style: style.value,
                },
                slots.default?.(),
            );
    },
});

export function useStudioContext(): StudioContextValue {
    const ctx = inject(StudioContextKey, null);
    if (!ctx) {
        throw new Error('useStudioContext must be used within a StudioProvider');
    }
    return ctx;
}
