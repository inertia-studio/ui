/** @typedef {{ viewTransition?: boolean }} StudioOptions */

const STUDIO_PAGE_MAP = {
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
};

/**
 * Inertia Studio Vite plugin.
 *
 * Intercepts page resolution in createInertiaApp to handle Studio:: pages.
 * Works with @inertiajs/vite's automatic resolution — no manual resolve needed.
 *
 * @param {StudioOptions} [options]
 * @returns {import('vite').Plugin}
 */
export default function studio(options = {}) {
    return {
        name: 'inertia-studio',
        enforce: 'pre',

        transform(code, id) {
            // Only transform the app entry file
            if (!id.match(/app\.(tsx?|jsx?)$/)) return null;
            if (!code.includes('createInertiaApp')) return null;

            // Inject the Studio page resolver import and the __resolveStudioPage helper
            // This runs BEFORE @inertiajs/vite transforms the code
            const injection = `
import { resolveStudioPage as __resolveStudioPage } from '@inertia-studio/ui/vite';
`;
            return {
                code: injection + code,
                map: null,
            };
        },

        config() {
            return {
                optimizeDeps: {
                    include: ['@inertia-studio/ui'],
                },
            };
        },
    };
}

/**
 * Resolve a Studio page component by its Inertia page name.
 * Returns a Promise for the page module, or null if not a Studio page.
 *
 * @param {string} name - The Inertia page name (e.g. 'Studio::Login')
 * @param {Record<string, () => Promise<{default: any}>>} [pages] - Optional glob of page components
 * @returns {Promise<{default: any}> | null}
 */
export function resolveStudioPage(name, pages) {
    if (!name.startsWith('Studio::')) return null;

    const pageName = STUDIO_PAGE_MAP[name];
    if (!pageName) {
        throw new Error(
            `[Inertia Studio] Unknown page: ${name}. Known pages: ${Object.keys(STUDIO_PAGE_MAP).join(', ')}`,
        );
    }

    // If custom pages glob provided (for published/overridden pages), use it
    if (pages) {
        const key = Object.keys(pages).find(
            (k) => k.endsWith(`/${pageName}.tsx`) || k.endsWith(`/${pageName}.vue`) || k.endsWith(`/${pageName}.svelte`),
        );
        if (key) return pages[key]();
    }

    // Dynamic import from the package
    return import('@inertia-studio/ui/react').then((mod) => {
        const Component = mod[pageName];
        if (!Component) {
            throw new Error(`[Inertia Studio] Page component "${pageName}" not found in @inertia-studio/ui/react`);
        }
        return { default: Component };
    });
}

/**
 * The Studio page name mapping.
 */
export const studioPageMap = STUDIO_PAGE_MAP;
