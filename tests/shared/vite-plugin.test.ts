import { describe, it, expect, vi } from 'vitest';

// We import only the synchronous helpers. The resolveStudioPage function
// triggers real dynamic imports (e.g. @inertia-studio/ui/svelte) which
// cause environment teardown errors. We test the page-map and framework
// detection logic via the exported studioPageMap and by passing custom
// page globs that short-circuit before any dynamic import.

import { resolveStudioPage, studioPageMap } from '../../src/vite.mjs';

describe('studioPageMap', () => {
    it('has correct page mappings', () => {
        expect(studioPageMap).toEqual({
            'Studio::ListRecords': 'ListPage',
            'Studio::CreateRecord': 'CreatePage',
            'Studio::EditRecord': 'EditPage',
            'Studio::ViewRecord': 'ViewPage',
            'Studio::Login': 'LoginPage',
            'Studio::Register': 'RegisterPage',
            'Studio::ForgotPassword': 'ForgotPasswordPage',
            'Studio::ResetPassword': 'ResetPasswordPage',
            'Studio::VerifyEmail': 'VerifyEmailPage',
            'Studio::Dashboard': 'DashboardPage',
            'Studio::Profile': 'ProfilePage',
        });
    });

    it('maps all 11 Studio pages', () => {
        expect(Object.keys(studioPageMap)).toHaveLength(11);
    });
});

describe('resolveStudioPage', () => {
    it('returns null for non-Studio pages', () => {
        expect(resolveStudioPage('Users/Index')).toBeNull();
        expect(resolveStudioPage('Dashboard')).toBeNull();
        expect(resolveStudioPage('')).toBeNull();
    });

    it('returns null for page names that do not start with Studio::', () => {
        expect(resolveStudioPage('MyApp::Login')).toBeNull();
        expect(resolveStudioPage('studio::Login')).toBeNull(); // case-sensitive
    });

    it('throws for unknown Studio pages', () => {
        expect(() => resolveStudioPage('Studio::NonExistent')).toThrow(
            '[Inertia Studio] Unknown page: Studio::NonExistent',
        );
    });

    it('throws with the list of known pages', () => {
        expect(() => resolveStudioPage('Studio::Unknown')).toThrow('Known pages:');
    });

    it('resolves from custom pages glob when .tsx key matches', () => {
        const mockComponent = { default: () => 'LoginComponent' };
        const pages = {
            './pages/LoginPage.tsx': vi.fn().mockResolvedValue(mockComponent),
            './pages/DashboardPage.tsx': vi.fn().mockResolvedValue({ default: () => 'Dashboard' }),
        };

        const result = resolveStudioPage('Studio::Login', pages);
        expect(pages['./pages/LoginPage.tsx']).toHaveBeenCalled();
        expect(result).toBeInstanceOf(Promise);
    });

    it('resolves from custom pages glob when .vue key matches', () => {
        const mockComponent = { default: {} };
        const pages = {
            './pages/LoginPage.vue': vi.fn().mockResolvedValue(mockComponent),
        };

        const result = resolveStudioPage('Studio::Login', pages);
        expect(pages['./pages/LoginPage.vue']).toHaveBeenCalled();
        expect(result).toBeInstanceOf(Promise);
    });

    it('resolves from custom pages glob when .svelte key matches', () => {
        const mockComponent = { default: {} };
        const pages = {
            './pages/LoginPage.svelte': vi.fn().mockResolvedValue(mockComponent),
        };

        const result = resolveStudioPage('Studio::Login', pages);
        expect(pages['./pages/LoginPage.svelte']).toHaveBeenCalled();
        expect(result).toBeInstanceOf(Promise);
    });

    it('resolves the correct page from glob based on Studio page name', () => {
        const loginComponent = { default: () => 'Login' };
        const dashComponent = { default: () => 'Dashboard' };
        const pages = {
            './pages/LoginPage.tsx': vi.fn().mockResolvedValue(loginComponent),
            './pages/DashboardPage.tsx': vi.fn().mockResolvedValue(dashComponent),
        };

        resolveStudioPage('Studio::Dashboard', pages);
        expect(pages['./pages/DashboardPage.tsx']).toHaveBeenCalled();
        expect(pages['./pages/LoginPage.tsx']).not.toHaveBeenCalled();
    });
});

describe('detectFramework (tested indirectly)', () => {
    // detectFramework is not exported directly, but we can verify its behavior
    // by observing which glob keys resolveStudioPage matches. When a glob has
    // keys but none match the requested page, the function falls through to
    // a dynamic import (which we can't test without triggering teardown errors).
    // So we focus on verifying that matching keys with various extensions work.

    it('matches .vue extension in custom glob', () => {
        const pages = {
            'src/pages/RegisterPage.vue': vi.fn().mockResolvedValue({ default: {} }),
        };
        const result = resolveStudioPage('Studio::Register', pages);
        expect(pages['src/pages/RegisterPage.vue']).toHaveBeenCalled();
        expect(result).toBeInstanceOf(Promise);
    });

    it('matches .svelte extension in custom glob', () => {
        const pages = {
            'src/pages/ProfilePage.svelte': vi.fn().mockResolvedValue({ default: {} }),
        };
        const result = resolveStudioPage('Studio::Profile', pages);
        expect(pages['src/pages/ProfilePage.svelte']).toHaveBeenCalled();
        expect(result).toBeInstanceOf(Promise);
    });

    it('matches .tsx extension in custom glob', () => {
        const pages = {
            'src/pages/EditPage.tsx': vi.fn().mockResolvedValue({ default: {} }),
        };
        const result = resolveStudioPage('Studio::EditRecord', pages);
        expect(pages['src/pages/EditPage.tsx']).toHaveBeenCalled();
        expect(result).toBeInstanceOf(Promise);
    });
});
