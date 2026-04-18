import { describe, it, expect } from 'vitest';
import { generateCssVariables } from '../../src/shared/theme/css-variables';

const baseTheme = {
    primary: '#2563eb',
    danger: '#dc2626',
    warning: '#d97706',
    success: '#16a34a',
    info: '#3b82f6',
    gray: '#64748b',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '0.875rem',
    borderRadius: 'lg',
    density: 'comfortable' as const,
};

const baseLayout = {
    maxWidth: '80rem',
    contentWidth: '100%',
    gutter: '1.5rem',
    sidebar: { style: 'dark' as const, width: '280px', collapsible: true, collapsedWidth: '64px', defaultCollapsed: false, mobileBreakpoint: 'lg' as const },
    topbar: { sticky: true, height: '64px', showBreadcrumbs: true, showSearch: true, showUserMenu: true },
    navigation: { style: 'sidebar' as const, groupStyle: 'collapsible' as const, iconSize: 'md' as const, activeStyle: 'highlight' as const },
    footer: { enabled: false, text: null, sticky: false },
};

describe('generateCssVariables', () => {
    it('returns all expected CSS variable keys', () => {
        const vars = generateCssVariables(baseTheme, baseLayout);

        const expectedKeys = [
            '--studio-primary',
            '--studio-primary-foreground',
            '--studio-danger',
            '--studio-warning',
            '--studio-success',
            '--studio-info',
            '--studio-gray',
            '--studio-font',
            '--studio-font-size',
            '--studio-radius',
            '--studio-density-x',
            '--studio-density-y',
            '--studio-max-width',
            '--studio-content-width',
            '--studio-gutter',
            '--studio-sidebar-width',
            '--studio-sidebar-collapsed-width',
            '--studio-topbar-height',
        ];

        for (const key of expectedKeys) {
            expect(vars).toHaveProperty(key);
        }
    });

    it('converts hex colors to space-separated RGB', () => {
        const vars = generateCssVariables(baseTheme, baseLayout);

        // #2563eb -> 37 99 235
        expect(vars['--studio-primary']).toBe('37 99 235');
        // #dc2626 -> 220 38 38
        expect(vars['--studio-danger']).toBe('220 38 38');
        // #16a34a -> 22 163 74
        expect(vars['--studio-success']).toBe('22 163 74');
    });

    it('generates contrast foreground for primary color', () => {
        const vars = generateCssVariables(baseTheme, baseLayout);
        // #2563eb is a blue, luminance < 0.5, so foreground should be white (255 255 255)
        expect(vars['--studio-primary-foreground']).toBe('255 255 255');
    });

    it('generates white foreground for light primary color', () => {
        const lightTheme = { ...baseTheme, primary: '#fbbf24' }; // yellow
        const vars = generateCssVariables(lightTheme, baseLayout);
        // #fbbf24 is light, luminance > 0.5, so foreground should be black (0 0 0)
        expect(vars['--studio-primary-foreground']).toBe('0 0 0');
    });

    describe('density mapping', () => {
        it('maps compact density', () => {
            const theme = { ...baseTheme, density: 'compact' as const };
            const vars = generateCssVariables(theme, baseLayout);
            expect(vars['--studio-density-x']).toBe('0.75rem');
            expect(vars['--studio-density-y']).toBe('0.375rem');
        });

        it('maps comfortable density', () => {
            const vars = generateCssVariables(baseTheme, baseLayout);
            expect(vars['--studio-density-x']).toBe('1rem');
            expect(vars['--studio-density-y']).toBe('0.625rem');
        });

        it('maps spacious density', () => {
            const theme = { ...baseTheme, density: 'spacious' as const };
            const vars = generateCssVariables(theme, baseLayout);
            expect(vars['--studio-density-x']).toBe('1.25rem');
            expect(vars['--studio-density-y']).toBe('0.875rem');
        });

        it('falls back to comfortable for unknown density', () => {
            const theme = { ...baseTheme, density: 'unknown' as unknown as typeof baseTheme.density };
            const vars = generateCssVariables(theme, baseLayout);
            expect(vars['--studio-density-x']).toBe('1rem');
            expect(vars['--studio-density-y']).toBe('0.625rem');
        });
    });

    describe('border radius mapping', () => {
        it.each([
            ['none', '0'],
            ['sm', '0.25rem'],
            ['md', '0.375rem'],
            ['lg', '0.5rem'],
            ['xl', '0.75rem'],
            ['full', '9999px'],
        ])('maps "%s" to "%s"', (radius, expected) => {
            const theme = { ...baseTheme, borderRadius: radius };
            const vars = generateCssVariables(theme, baseLayout);
            expect(vars['--studio-radius']).toBe(expected);
        });

        it('passes through custom border radius values', () => {
            const theme = { ...baseTheme, borderRadius: '1rem' };
            const vars = generateCssVariables(theme, baseLayout);
            expect(vars['--studio-radius']).toBe('1rem');
        });
    });

    describe('layout values', () => {
        it('sets layout CSS variables', () => {
            const vars = generateCssVariables(baseTheme, baseLayout);
            expect(vars['--studio-max-width']).toBe('80rem');
            expect(vars['--studio-content-width']).toBe('100%');
            expect(vars['--studio-gutter']).toBe('1.5rem');
            expect(vars['--studio-sidebar-width']).toBe('280px');
            expect(vars['--studio-sidebar-collapsed-width']).toBe('64px');
            expect(vars['--studio-topbar-height']).toBe('64px');
        });
    });

    describe('color overrides', () => {
        it('includes light color overrides', () => {
            const themeWithColors = {
                ...baseTheme,
                lightColors: {
                    bg: '#ffffff',
                    surface: '#f9fafb',
                    text: '#111827',
                },
            } as unknown as typeof baseTheme;

            const vars = generateCssVariables(themeWithColors, baseLayout);
            expect(vars['--studio-light-bg']).toBe('255 255 255');
            expect(vars['--studio-light-surface']).toBe('249 250 251');
            expect(vars['--studio-light-text']).toBe('17 24 39');
        });

        it('includes dark color overrides', () => {
            const themeWithColors = {
                ...baseTheme,
                darkColors: {
                    bg: '#111827',
                    border: '#374151',
                },
            } as unknown as typeof baseTheme;

            const vars = generateCssVariables(themeWithColors, baseLayout);
            expect(vars['--studio-dark-bg']).toBe('17 24 39');
            expect(vars['--studio-dark-border']).toBe('55 65 81');
        });

        it('supports pre-computed RGB triplet values', () => {
            const themeWithColors = {
                ...baseTheme,
                lightColors: {
                    bg: '249 250 251', // already RGB
                },
            } as unknown as typeof baseTheme;

            const vars = generateCssVariables(themeWithColors, baseLayout);
            expect(vars['--studio-light-bg']).toBe('249 250 251');
        });

        it('ignores unknown color keys', () => {
            const themeWithColors = {
                ...baseTheme,
                lightColors: {
                    unknownKey: '#ff0000',
                    bg: '#ffffff',
                },
            } as unknown as typeof baseTheme;

            const vars = generateCssVariables(themeWithColors, baseLayout);
            expect(vars['--studio-light-bg']).toBe('255 255 255');
            expect(vars).not.toHaveProperty('--studio-light-unknownKey');
            expect(vars).not.toHaveProperty('--studio-light-unknown-key');
        });

        it('omits overrides when no lightColors or darkColors', () => {
            const vars = generateCssVariables(baseTheme, baseLayout);
            const overrideKeys = Object.keys(vars).filter(
                (k) => k.startsWith('--studio-light-') || k.startsWith('--studio-dark-'),
            );
            expect(overrideKeys).toHaveLength(0);
        });
    });
});
