import { type FormEvent, useCallback, useMemo } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { StudioProvider } from '../context/StudioContext';
import { AuthLayout } from '../components/Auth/AuthLayout';
import { cn } from '../../shared/utils/cn';
import type { PanelSchema } from '../../shared/types/schema';

interface LoginPageProps {
    studio: {
        panel: PanelSchema;
    };
}

export default function LoginPage({ studio }: LoginPageProps) {
    const panel = useMemo<PanelSchema>(() => ({ ...studio.panel }), [studio.panel]);
    const panelPath = panel.path.startsWith('/') ? panel.path : `/${panel.path}`;
    const authConfig = (panel as Record<string, unknown>).auth as { registration?: boolean; passwordReset?: boolean } | undefined;
    const { flash } = usePage<{ flash: { success?: string } }>().props;

    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            form.post(`${panelPath}/login`, { preserveScroll: true });
        },
        [form, panelPath],
    );

    return (
        <StudioProvider panel={panel}>
            <AuthLayout panel={panel}>
                <div className="rounded-xl border border-s-border bg-s-surface p-8 shadow-sm">
                    <h2 className="mb-6 text-center text-xl font-semibold text-s-text">
                        Sign in to your account
                    </h2>

                    {flash?.success && (
                        <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-s-text-secondary">
                                Email address
                            </label>
                            <input
                                id="email" type="email" autoComplete="email" required
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                className={cn(
                                    'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors bg-s-input',
                                    'placeholder:text-s-text-faint',
                                    'focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
                                    form.errors.email ? 'border-red-300 text-red-900' : 'border-s-border-strong text-s-text',
                                )}
                                placeholder="you@example.com"
                            />
                            {form.errors.email && <p className="mt-1 text-xs text-red-600">{form.errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-s-text-secondary">
                                Password
                            </label>
                            <input
                                id="password" type="password" autoComplete="current-password" required
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                className={cn(
                                    'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors bg-s-input',
                                    'placeholder:text-s-text-faint',
                                    'focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
                                    form.errors.password ? 'border-red-300 text-red-900' : 'border-s-border-strong text-s-text',
                                )}
                                placeholder="Enter your password"
                            />
                            {form.errors.password && <p className="mt-1 text-xs text-red-600">{form.errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember" type="checkbox"
                                    checked={form.data.remember}
                                    onChange={(e) => form.setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-s-border-strong text-s-accent focus:ring-s-accent/30"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-s-text-muted">Remember me</label>
                            </div>
                            {authConfig?.passwordReset !== false && (
                                <Link href={`${panelPath}/forgot-password`} className="text-sm font-medium text-s-accent hover:underline">
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-s-accent px-4 py-2.5 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {form.processing ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    {authConfig?.registration && (
                        <p className="mt-5 text-center text-sm text-s-text-muted">
                            Don't have an account?{' '}
                            <Link href={`${panelPath}/register`} className="font-medium text-s-accent hover:underline">Sign up</Link>
                        </p>
                    )}
                </div>
            </AuthLayout>
        </StudioProvider>
    );
}
