import { type FormEvent, useCallback, useMemo } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { StudioProvider } from '../context/StudioContext';
import { AuthLayout } from '../components/Auth/AuthLayout';
import { cn } from '../../shared/utils/cn';
import type { PanelSchema } from '../../shared/types/schema';

interface RegisterPageProps {
    studio: {
        panel: PanelSchema;
    };
}

export default function RegisterPage({ studio }: RegisterPageProps) {
    const panel = useMemo<PanelSchema>(() => ({ ...studio.panel }), [studio.panel]);
    const panelPath = panel.path.startsWith('/') ? panel.path : `/${panel.path}`;

    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            form.post(`${panelPath}/register`, { preserveScroll: true });
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
                    <h2 className="mb-6 text-center text-xl font-semibold text-s-text">Create an account</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-s-text-secondary">Name</label>
                            <input id="name" type="text" autoComplete="name" required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className={inputClass('name')} placeholder="Your name" />
                            {form.errors.name && <p className="mt-1 text-xs text-red-600">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-s-text-secondary">Email address</label>
                            <input id="email" type="email" autoComplete="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className={inputClass('email')} placeholder="you@example.com" />
                            {form.errors.email && <p className="mt-1 text-xs text-red-600">{form.errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-s-text-secondary">Password</label>
                            <input id="password" type="password" autoComplete="new-password" required value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} className={inputClass('password')} placeholder="Create a password" />
                            {form.errors.password && <p className="mt-1 text-xs text-red-600">{form.errors.password}</p>}
                        </div>
                        <div>
                            <label htmlFor="password_confirmation" className="mb-1.5 block text-sm font-medium text-s-text-secondary">Confirm password</label>
                            <input id="password_confirmation" type="password" autoComplete="new-password" required value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} className={inputClass('password_confirmation')} placeholder="Confirm your password" />
                        </div>

                        <button type="submit" disabled={form.processing} className="flex w-full items-center justify-center gap-2 rounded-lg bg-s-accent px-4 py-2.5 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50">
                            {form.processing ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-sm text-s-text-muted">
                        Already have an account?{' '}
                        <Link href={`${panelPath}/login`} className="font-medium text-s-accent hover:underline">Sign in</Link>
                    </p>
                </div>
            </AuthLayout>
        </StudioProvider>
    );
}
