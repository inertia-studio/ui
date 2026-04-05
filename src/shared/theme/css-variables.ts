import type { LayoutSchema, ThemeSchema } from '../types/schema';

/**
 * Converts a hex color (#2563eb) to space-separated RGB (37 99 235).
 */
function hexToRgb(hex: string): string {
    const cleaned = hex.replace('#', '');
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);

    return `${r} ${g} ${b}`;
}

/**
 * Returns a foreground color (white or black) based on luminance.
 */
function contrastForeground(hex: string): string {
    const cleaned = hex.replace('#', '');
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '0 0 0' : '255 255 255';
}

const densityMap: Record<string, { x: string; y: string }> = {
    compact: { x: '0.75rem', y: '0.375rem' },
    comfortable: { x: '1rem', y: '0.625rem' },
    spacious: { x: '1.25rem', y: '0.875rem' },
};

const borderRadiusMap: Record<string, string> = {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
};

/**
 * Generates CSS custom properties from theme and layout config.
 * Used by StudioProvider to inject styles into the DOM.
 */
export function generateCssVariables(
    theme: ThemeSchema,
    layout: LayoutSchema,
): Record<string, string> {
    const density = densityMap[theme.density] ?? densityMap.comfortable;
    const radius = borderRadiusMap[theme.borderRadius] ?? theme.borderRadius;

    return {
        // Colors
        '--studio-primary': hexToRgb(theme.primary),
        '--studio-primary-foreground': contrastForeground(theme.primary),
        '--studio-danger': hexToRgb(theme.danger),
        '--studio-warning': hexToRgb(theme.warning),
        '--studio-success': hexToRgb(theme.success),
        '--studio-info': hexToRgb(theme.info),
        '--studio-gray': hexToRgb(theme.gray),

        // Typography
        '--studio-font': theme.fontFamily,
        '--studio-font-size': theme.fontSize,

        // Shape
        '--studio-radius': radius,

        // Density
        '--studio-density-x': density.x,
        '--studio-density-y': density.y,

        // Layout
        '--studio-max-width': layout.maxWidth,
        '--studio-content-width': layout.contentWidth,
        '--studio-gutter': layout.gutter,

        // Sidebar
        '--studio-sidebar-width': layout.sidebar.width,
        '--studio-sidebar-collapsed-width': layout.sidebar.collapsedWidth,

        // Topbar
        '--studio-topbar-height': layout.topbar.height,

        // Light/dark color overrides from PHP Theme
        ...mapColorOverrides('light', (theme as unknown as Record<string, unknown>).lightColors as Record<string, string> | undefined),
        ...mapColorOverrides('dark', (theme as unknown as Record<string, unknown>).darkColors as Record<string, string> | undefined),
    };
}

const colorKeyMap: Record<string, string> = {
    bg: 'bg',
    surface: 'surface',
    surfaceAlt: 'surface-alt',
    border: 'border',
    borderStrong: 'border-strong',
    text: 'text',
    textSecondary: 'text-secondary',
    textMuted: 'text-muted',
    textFaint: 'text-faint',
    input: 'input',
    hover: 'hover',
};

function mapColorOverrides(
    mode: 'light' | 'dark',
    colors?: Record<string, string>,
): Record<string, string> {
    if (!colors) return {};

    const vars: Record<string, string> = {};

    for (const [key, value] of Object.entries(colors)) {
        const cssKey = colorKeyMap[key];
        if (!cssKey) continue;

        // Support both hex (#f9fafb) and RGB triplet (249 250 251)
        const rgbValue = value.startsWith('#') ? hexToRgb(value) : value;
        vars[`--studio-${mode}-${cssKey}`] = rgbValue;
    }

    return vars;
}
