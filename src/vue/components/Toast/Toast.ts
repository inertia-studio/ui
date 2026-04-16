export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    body?: string;
    duration?: number;
}

type Listener = (t: ToastMessage) => void;
let listeners: Listener[] = [];

/** Imperative toast API — call from anywhere */
export function toast(msg: Omit<ToastMessage, 'id'>): void {
    const t: ToastMessage = { ...msg, id: Math.random().toString(36).slice(2) };
    listeners.forEach((fn) => fn(t));
}

export function subscribeToasts(handler: Listener): () => void {
    listeners.push(handler);
    return () => {
        listeners = listeners.filter((fn) => fn !== handler);
    };
}
