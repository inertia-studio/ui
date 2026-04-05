import { type FormEvent, useCallback, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { StudioProvider } from '../context/StudioContext';
import { PanelLayout } from '../components/Layout';
import type { PanelSchema, UserSchema } from '../../shared/types/schema';

interface ProfilePageProps {
    studio: {
        panel: PanelSchema;
        user: UserSchema | null;
        notifications: unknown[];
    };
    user: {
        id: number;
        name: string;
        email: string;
        avatar: string | null;
        created_at: string | null;
    };
}

export default function ProfilePage({ studio, user }: ProfilePageProps) {
    const panel = useMemo<PanelSchema>(
        () => ({ ...studio.panel, user: studio.user ?? studio.panel.user }),
        [studio.panel, studio.user],
    );

    const panelPath = panel.path.startsWith('/') ? panel.path : `/${panel.path}`;

    // Profile form
    const profileForm = useForm({
        name: user.name,
        email: user.email,
    });

    const handleProfileSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();
        profileForm.put(`${panelPath}/profile`);
    }, [profileForm, panelPath]);

    // Password form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handlePasswordSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();
        passwordForm.put(`${panelPath}/profile/password`, {
            onSuccess: () => passwordForm.reset(),
        });
    }, [passwordForm, panelPath]);

    return (
        <StudioProvider panel={panel}>
            <PanelLayout>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-xl font-semibold text-s-text">Profile</h1>
                        <p className="text-sm text-s-text-muted mt-0.5">Manage your account settings.</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Profile Information */}
                    <div className="rounded-xl border border-s-border bg-s-surface">
                        <div className="border-b border-s-border px-6 py-4">
                            <h2 className="text-base font-semibold text-s-text">Profile Information</h2>
                            <p className="mt-0.5 text-sm text-s-text-muted">Update your name and email address.</p>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="px-6 py-5">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-s-text-secondary">
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={profileForm.data.name}
                                        onChange={(e) => profileForm.setData('name', e.target.value)}
                                        className="block w-full rounded-lg border border-s-border-strong bg-s-input text-s-text px-3 py-2 text-sm shadow-sm placeholder:text-s-text-faint focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30"
                                    />
                                    {profileForm.errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{profileForm.errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-s-text-secondary">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={profileForm.data.email}
                                        onChange={(e) => profileForm.setData('email', e.target.value)}
                                        className="block w-full rounded-lg border border-s-border-strong bg-s-input text-s-text px-3 py-2 text-sm shadow-sm placeholder:text-s-text-faint focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30"
                                    />
                                    {profileForm.errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{profileForm.errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {profileForm.processing ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className="rounded-xl border border-s-border bg-s-surface">
                        <div className="border-b border-s-border px-6 py-4">
                            <h2 className="text-base font-semibold text-s-text">Change Password</h2>
                            <p className="mt-0.5 text-sm text-s-text-muted">Ensure your account uses a strong password.</p>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="px-6 py-5">
                            <div className="max-w-xl space-y-5">
                                <div>
                                    <label htmlFor="current_password" className="mb-1.5 block text-sm font-medium text-s-text-secondary">
                                        Current Password
                                    </label>
                                    <input
                                        id="current_password"
                                        type="password"
                                        value={passwordForm.data.current_password}
                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                        className="block w-full rounded-lg border border-s-border-strong bg-s-input text-s-text px-3 py-2 text-sm shadow-sm placeholder:text-s-text-faint focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30"
                                    />
                                    {passwordForm.errors.current_password && (
                                        <p className="mt-1 text-sm text-red-600">{passwordForm.errors.current_password}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-s-text-secondary">
                                        New Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        className="block w-full rounded-lg border border-s-border-strong bg-s-input text-s-text px-3 py-2 text-sm shadow-sm placeholder:text-s-text-faint focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30"
                                    />
                                    {passwordForm.errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{passwordForm.errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password_confirmation" className="mb-1.5 block text-sm font-medium text-s-text-secondary">
                                        Confirm New Password
                                    </label>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        className="block w-full rounded-lg border border-s-border-strong bg-s-input text-s-text px-3 py-2 text-sm shadow-sm placeholder:text-s-text-faint focus:border-s-accent focus:outline-none focus:ring-1 focus:ring-s-accent/30"
                                    />
                                </div>
                            </div>

                            <div className="mt-5 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-s-accent px-4 py-2 text-sm font-medium text-s-accent-fg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </PanelLayout>
        </StudioProvider>
    );
}
