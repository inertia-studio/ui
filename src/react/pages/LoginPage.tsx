import { type FormEvent, useCallback, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { StudioProvider } from '../context/StudioContext';
import { cn } from '../../shared/utils/cn';
import type { PanelSchema } from '../../shared/types/schema';

interface LoginPageProps {
    studio: {
        panel: PanelSchema;
    };
}

export default function LoginPage({ studio }: LoginPageProps) {
    const panel = useMemo<PanelSchema>(
        () => ({ ...studio.panel }),
        [studio.panel],
    );

    const panelPath = panel.path.startsWith('/') ? panel.path : `/${panel.path}`;

    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            form.post(`${panelPath}/login`, {
                preserveScroll: true,
            });
        },
        [form, panelPath],
    );

    return (
        <StudioProvider panel={panel}>
            <div className="flex min-h-screen items-center justify-center bg-s-bg px-4">
                <div className="w-full max-w-md">
                    {/* Brand */}
                    <div className="mb-8 text-center">
                        {panel.brandLogo ? (
                            <img
                                src={panel.brandLogo}
                                alt={panel.brandName}
                                className="mx-auto mb-4 h-12 w-auto"
                            />
                        ) : (
                            <h1 className="text-3xl font-bold text-s-text">
                                {panel.brandName}
                            </h1>
                        )}
                    </div>

                    {/* Login card */}
                    <div className="rounded-xl border border-s-border bg-s-surface p-8 shadow-sm">
                        <h2 className="mb-6 text-center text-xl font-semibold text-s-text">
                            Sign in to your account
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-sm font-medium text-s-text-secondary"
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className={cn(
                                        'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors',
                                        'placeholder:text-s-text-faint',
                                        'focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
                                        form.errors.email
                                            ? 'border-red-300 text-red-900'
                                            : 'border-s-border-strong text-s-text',
                                    )}
                                    placeholder="you@example.com"
                                />
                                {form.errors.email && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-1.5 block text-sm font-medium text-s-text-secondary"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    className={cn(
                                        'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors',
                                        'placeholder:text-s-text-faint',
                                        'focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30',
                                        form.errors.password
                                            ? 'border-red-300 text-red-900'
                                            : 'border-s-border-strong text-s-text',
                                    )}
                                    placeholder="Enter your password"
                                />
                                {form.errors.password && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {form.errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={form.data.remember}
                                    onChange={(e) => form.setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-s-border-strong text-s-accent focus:ring-s-accent/30"
                                />
                                <label
                                    htmlFor="remember"
                                    className="ml-2 text-sm text-s-text-muted"
                                >
                                    Remember me
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-s-accent px-4 py-2.5 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {form.processing && (
                                    <svg
                                        className="h-4 w-4 animate-spin"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                )}
                                {form.processing ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </StudioProvider>
    );
}
