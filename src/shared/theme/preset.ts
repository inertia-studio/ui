/**
 * Tailwind CSS preset for Inertia Studio.
 *
 * Add to your tailwind config:
 *   import studioPreset from '@inertia-studio/ui/preset'
 *   export default { presets: [studioPreset] }
 */
export default {
    theme: {
        extend: {
            colors: {
                studio: {
                    primary: 'rgb(var(--studio-primary) / <alpha-value>)',
                    'primary-foreground': 'rgb(var(--studio-primary-foreground) / <alpha-value>)',
                    danger: 'rgb(var(--studio-danger) / <alpha-value>)',
                    warning: 'rgb(var(--studio-warning) / <alpha-value>)',
                    success: 'rgb(var(--studio-success) / <alpha-value>)',
                    info: 'rgb(var(--studio-info) / <alpha-value>)',
                    gray: 'rgb(var(--studio-gray) / <alpha-value>)',
                    sidebar: {
                        bg: 'rgb(var(--studio-sidebar-bg) / <alpha-value>)',
                        fg: 'rgb(var(--studio-sidebar-fg) / <alpha-value>)',
                        accent: 'rgb(var(--studio-sidebar-accent) / <alpha-value>)',
                    },
                },
            },
            borderRadius: {
                studio: 'var(--studio-radius)',
            },
            fontFamily: {
                studio: 'var(--studio-font)',
            },
            fontSize: {
                studio: 'var(--studio-font-size)',
            },
            maxWidth: {
                studio: 'var(--studio-max-width)',
            },
            spacing: {
                'studio-gutter': 'var(--studio-gutter)',
                'studio-density-x': 'var(--studio-density-x)',
                'studio-density-y': 'var(--studio-density-y)',
                'studio-sidebar': 'var(--studio-sidebar-width)',
                'studio-sidebar-collapsed': 'var(--studio-sidebar-collapsed-width)',
                'studio-topbar': 'var(--studio-topbar-height)',
            },
        },
    },
};
