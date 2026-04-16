import { computed, ref, type ComputedRef, type Ref } from 'vue';

export interface UseFormStateReturn {
    value: ComputedRef<unknown>;
    setValue: (value: unknown) => void;
    error: ComputedRef<string | null>;
    touched: Ref<boolean>;
    setError: (error: string | null) => void;
}

export interface FormStateStore {
    data: Record<string, unknown>;
    errors: Record<string, string>;
    setData: (key: string, value: unknown) => void;
    setError: (key: string, error: string | null) => void;
}

/**
 * Per-field state management, mirrors React adapter's useFormState.
 * Expects a reactive `store` (e.g. Inertia's `useForm()` result wrapped in an adapter).
 */
export function useFormState(name: string, store: FormStateStore): UseFormStateReturn {
    const touched = ref(false);

    const value = computed(() => store.data[name] ?? null);
    const error = computed(() => store.errors[name] ?? null);

    const setValue = (newValue: unknown) => {
        touched.value = true;
        store.setData(name, newValue);
    };

    const setError = (err: string | null) => {
        store.setError(name, err);
    };

    return { value, setValue, error, touched, setError };
}
