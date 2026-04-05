import { useCallback, useState } from 'react';

interface UseFormStateReturn {
    value: unknown;
    setValue: (value: unknown) => void;
    error: string | null;
    touched: boolean;
    setError: (error: string | null) => void;
}

interface FormStateStore {
    data: Record<string, unknown>;
    errors: Record<string, string>;
    setData: (key: string, value: unknown) => void;
    setError: (key: string, error: string | null) => void;
}

/**
 * Hook for individual field state management.
 * Designed to integrate with Inertia's useForm() in the FormRenderer.
 */
export function useFormState(
    name: string,
    store: FormStateStore,
): UseFormStateReturn {
    const [touched, setTouched] = useState(false);

    const value = store.data[name] ?? null;
    const error = store.errors[name] ?? null;

    const setValue = useCallback((newValue: unknown) => {
        setTouched(true);
        store.setData(name, newValue);
    }, [name, store]);

    const setError = useCallback((err: string | null) => {
        store.setError(name, err);
    }, [name, store]);

    return { value, setValue, error, touched, setError };
}
