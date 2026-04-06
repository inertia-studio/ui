import { type FormEvent, useCallback, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { StudioProvider } from '../context/StudioContext';
import { AuthLayout } from '../components/Auth/AuthLayout';
import { cn } from '../../shared/utils/cn';
import type { PanelSchema } from '../../shared/types/schema';

interface ResetPasswordPageProps {
    studio: {
        panel: PanelSchema;
    };
    token: string;
    email: string;
}

export default function ResetPasswordPage({ studio, token, email }: ResetPasswordPageProps) {
    const panel = useMemo<PanelSchema>(() => ({ ...studio.panel }), [studio.panel]);
    const panelPath = panel.path.startsWith('/') ? panel.path : `/${panel.path}`;

    const form = useForm({ token, email, password: '', password_confirmation: '' });

    const handleSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            form.post(`${panelPath}/reset-password`, { preserveScroll: true });
        },
        [form, panelPath],
    );

    const inputClass = (field: string) =>
        cn(
            'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors bg-s-input',
            'placeholder:text-s-text-faint text-s-text',
            'focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
            (form.errors as Record<string, string>)[field] ? 'border-red-300' : 'border-s-border-strong',
        );

    return (
        <StudioProvider panel={panel}>
            <AuthLayout panel={panel}>
                <div className="rounded-xl border border-s-border bg-s-surface p-8 shadow-sm">
                    <h2 className="mb-6 text-center text-xl font-semibold text-s-text">Reset your password</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-s-text-secondary">Email address</label>
                            <input id="email" type="email" required readOnly value={form.data.email} className={cn(inputClass('email'), 'bg-s-surface-alt cursor-not-allowed')} />
                            {form.errors.email && <p className="mt-1 text-xs text-red-600">{form.errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-s-text-secondary">New password</label>
                            <input id="password" type="password" autoComplete="new-password" required autoFocus value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} className={inputClass('password')} placeholder="Enter new password" />
                            {form.errors.password && <p className="mt-1 text-xs text-red-600">{form.errors.password}</p>}
                        </div>
                        <div>
                            <label htmlFor="password_confirmation" className="mb-1.5 block text-sm font-medium text-s-text-secondary">Confirm password</label>
                            <input id="password_confirmation" type="password" autoComplete="new-password" required value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} className={inputClass('password_confirmation')} placeholder="Confirm new password" />
                        </div>

                        <button type="submit" disabled={form.processing} className="flex w-full items-center justify-center gap-2 rounded-lg bg-s-accent px-4 py-2.5 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50">
                            {form.processing ? 'Resetting...' : 'Reset password'}
                        </button>
                    </form>
                </div>
            </AuthLayout>
        </StudioProvider>
    );
}
