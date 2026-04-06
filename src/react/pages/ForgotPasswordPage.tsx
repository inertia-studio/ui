import { type FormEvent, useCallback, useMemo } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { StudioProvider } from '../context/StudioContext';
import { AuthLayout } from '../components/Auth/AuthLayout';
import { cn } from '../../shared/utils/cn';
import type { PanelSchema } from '../../shared/types/schema';

interface ForgotPasswordPageProps {
    studio: {
        panel: PanelSchema;
    };
}

export default function ForgotPasswordPage({ studio }: ForgotPasswordPageProps) {
    const panel = useMemo<PanelSchema>(() => ({ ...studio.panel }), [studio.panel]);
    const panelPath = panel.path.startsWith('/') ? panel.path : `/${panel.path}`;
    const { flash } = usePage<{ flash: { success?: string } }>().props;

    const form = useForm({ email: '' });

    const handleSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            form.post(`${panelPath}/forgot-password`, { preserveScroll: true });
        },
        [form, panelPath],
    );

    return (
        <StudioProvider panel={panel}>
            <AuthLayout panel={panel}>
                <div className="rounded-xl border border-s-border bg-s-surface p-8 shadow-sm">
                    <h2 className="mb-2 text-center text-xl font-semibold text-s-text">Forgot your password?</h2>
                    <p className="mb-6 text-center text-sm text-s-text-muted">
                        Enter your email and we'll send you a reset link.
                    </p>

                    {flash?.success && (
                        <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-s-text-secondary">Email address</label>
                            <input
                                id="email" type="email" autoComplete="email" required autoFocus
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                className={cn(
                                    'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors bg-s-input',
                                    'placeholder:text-s-text-faint text-s-text',
                                    'focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
                                    form.errors.email ? 'border-red-300' : 'border-s-border-strong',
                                )}
                                placeholder="you@example.com"
                            />
                            {form.errors.email && <p className="mt-1 text-xs text-red-600">{form.errors.email}</p>}
                        </div>

                        <button type="submit" disabled={form.processing} className="flex w-full items-center justify-center gap-2 rounded-lg bg-s-accent px-4 py-2.5 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50">
                            {form.processing ? 'Sending...' : 'Send reset link'}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-sm text-s-text-muted">
                        <Link href={`${panelPath}/login`} className="font-medium text-s-accent hover:underline">Back to sign in</Link>
                    </p>
                </div>
            </AuthLayout>
        </StudioProvider>
    );
}
