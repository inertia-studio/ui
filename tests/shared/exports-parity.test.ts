import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// We cannot import the Vue index directly because some .vue SFC files may have
// syntax that the default Vite/Babel transform cannot handle in this test
// environment. Instead we parse the export statements from the source files.

function extractNamedExports(filePath: string): string[] {
    const content = readFileSync(filePath, 'utf-8');
    const exports: string[] = [];

    // Match: export { Foo, Bar } from '...'
    const reExportRegex = /export\s*\{([^}]+)\}\s*from/g;
    let match;
    while ((match = reExportRegex.exec(content)) !== null) {
        const names = match[1].split(',').map((s) => s.trim().split(/\s+as\s+/).pop()!.trim()).filter(Boolean);
        exports.push(...names);
    }

    // Match: export type { Foo } from '...' — skip type-only exports
    // (they were already captured above, but we'll keep them for completeness)

    return exports.filter((e) => !e.startsWith('*'));
}

const reactIndexPath = resolve(__dirname, '../../src/react/index.ts');
const vueIndexPath = resolve(__dirname, '../../src/vue/index.ts');

const reactExportNames = extractNamedExports(reactIndexPath);
const vueExportNames = extractNamedExports(vueIndexPath);

describe('exports parity between React and Vue adapters', () => {
    describe('shared utilities', () => {
        const sharedUtils = [
            'cn',
            'formatDate',
            'formatDateTime',
            'formatMoney',
            'formatNumber',
            'formatPercent',
            'studioPreset',
            'generateCssVariables',
        ];

        it.each(sharedUtils)('both export "%s"', (name) => {
            expect(reactExportNames).toContain(name);
            expect(vueExportNames).toContain(name);
        });
    });

    describe('context/provider', () => {
        it('both export StudioProvider', () => {
            expect(reactExportNames).toContain('StudioProvider');
            expect(vueExportNames).toContain('StudioProvider');
        });

        it('Vue exports useStudioContext (React does not from top-level)', () => {
            expect(vueExportNames).toContain('useStudioContext');
            // React does not re-export useStudioContext from its index
            expect(reactExportNames).not.toContain('useStudioContext');
        });
    });

    describe('hooks/composables', () => {
        const hooks = ['usePanel', 'useTheme', 'useStudioHooks', 'useFormState'];

        it.each(hooks)('both export "%s"', (name) => {
            expect(reactExportNames).toContain(name);
            expect(vueExportNames).toContain(name);
        });
    });

    describe('pages', () => {
        const pages = [
            'ListPage',
            'CreatePage',
            'EditPage',
            'ViewPage',
            'LoginPage',
            'RegisterPage',
            'ForgotPasswordPage',
            'ResetPasswordPage',
            'VerifyEmailPage',
            'DashboardPage',
            'ProfilePage',
        ];

        it.each(pages)('both export "%s"', (name) => {
            expect(reactExportNames).toContain(name);
            expect(vueExportNames).toContain(name);
        });
    });

    describe('common components', () => {
        const commonComponents = [
            'Icon',
            'SchemaIcon',
            'PanelLayout',
            'Sidebar',
            'Topbar',
            'Breadcrumbs',
            'UserMenu',
            'GlobalSearch',
            'FormRenderer',
            'FieldWrapper',
            'Section',
            'DataTable',
            'SearchBar',
            'Pagination',
            'FilterPanel',
            'ColumnToggle',
            'BulkActionBar',
            'ToastContainer',
            'toast',
            'DatePicker',
            'DateRangePicker',
            'Select',
            'ActionButton',
            'ActionDropdown',
            'ConfirmationModal',
            'DetailView',
            'TextEntry',
            'BadgeEntry',
            'BooleanEntry',
            'ImageEntry',
            'DateEntry',
            'MoneyEntry',
            'detailEntryMap',
            'TabGroup',
            'TabPanel',
            'Chart',
            'Sparkline',
        ];

        it.each(commonComponents)('both export "%s"', (name) => {
            expect(reactExportNames).toContain(name);
            expect(vueExportNames).toContain(name);
        });
    });

    describe('Vue-only exports (documented differences)', () => {
        it('Vue exports individual field components that React does not', () => {
            const vueOnlyFields = [
                'TextField', 'EmailField', 'PasswordField', 'UrlField', 'TelField',
                'NumberField', 'StepperField', 'TextareaField', 'SelectField',
                'ToggleField', 'CheckboxField', 'CheckboxListField', 'RadioField',
                'ToggleButtonsField', 'DateField', 'TimeField', 'DateRangeField',
                'ColorPickerField', 'FileUploadField', 'ImageUploadField', 'TagsField',
                'KeyValueField', 'RepeaterField', 'HiddenField', 'PlaceholderField',
                'SlugField', 'MoneyField', 'PercentField', 'BelongsToField',
                'RichEditorField', 'OtpField', 'MaskedField', 'RatingField',
                'CodeField', 'MarkdownEditorField', 'fieldComponentMap',
            ];

            for (const name of vueOnlyFields) {
                expect(vueExportNames).toContain(name);
                expect(reactExportNames).not.toContain(name);
            }
        });

        it('Vue exports individual cell components that React does not', () => {
            const vueOnlyCells = [
                'TextCell', 'BadgeCell', 'BooleanCell', 'ImageCell',
                'IconCell', 'ColorCell', 'DateCell', 'MoneyCell', 'cellComponentMap',
            ];

            for (const name of vueOnlyCells) {
                expect(vueExportNames).toContain(name);
                expect(reactExportNames).not.toContain(name);
            }
        });

        it('Vue exports individual filter components that React does not', () => {
            const vueOnlyFilters = [
                'SelectFilter', 'TernaryFilter', 'DateFilter',
                'BooleanFilter', 'filterComponentMap',
            ];

            for (const name of vueOnlyFilters) {
                expect(vueExportNames).toContain(name);
                expect(reactExportNames).not.toContain(name);
            }
        });

        it('Vue exports additional components that React does not', () => {
            const vueOnlyComponents = [
                'NotificationBell', 'LoadingBar', 'InlineTable',
                'FormTabs', 'Wizard', 'InlineForm', 'SimpleFormModal', 'FormComponents',
            ];

            for (const name of vueOnlyComponents) {
                expect(vueExportNames).toContain(name);
                expect(reactExportNames).not.toContain(name);
            }
        });
    });
});
