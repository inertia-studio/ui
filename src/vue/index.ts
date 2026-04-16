// Types
export type * from '../shared/types';

// Utils
export { cn } from '../shared/utils/cn';
export {
    formatDate,
    formatDateTime,
    formatMoney,
    formatNumber,
    formatPercent,
} from '../shared/utils/formatters';

// Theme
export { studioPreset } from '../shared/theme';
export { generateCssVariables } from '../shared/theme';

// Context & Provider
export { StudioProvider, useStudioContext } from './context/StudioContext';
export type { ColorMode, StudioContextValue } from './context/StudioContext';

// Composables (hooks)
export { usePanel } from './composables/usePanel';
export { useTheme } from './composables/useTheme';
export { useStudioHooks } from './composables/useStudioHooks';
export { useFormState } from './composables/useFormState';

// Icon
export { Icon, SchemaIcon } from './components/Icon';

// Layout
export {
    PanelLayout,
    Sidebar,
    Topbar,
    Breadcrumbs,
    UserMenu,
    GlobalSearch,
    NotificationBell,
} from './components/Layout';
export type { BreadcrumbItem } from './components/Layout/types';

// Form
export {
    FormRenderer,
    FieldWrapper,
    Section,
    FormTabs,
    Wizard,
    InlineForm,
    SimpleFormModal,
    FormComponents,
} from './components/Form';
export {
    TextField,
    EmailField,
    PasswordField,
    UrlField,
    TelField,
    NumberField,
    StepperField,
    TextareaField,
    SelectField,
    ToggleField,
    CheckboxField,
    CheckboxListField,
    RadioField,
    ToggleButtonsField,
    DateField,
    TimeField,
    DateRangeField,
    ColorPickerField,
    FileUploadField,
    ImageUploadField,
    TagsField,
    KeyValueField,
    RepeaterField,
    HiddenField,
    PlaceholderField,
    SlugField,
    MoneyField,
    PercentField,
    BelongsToField,
    RichEditorField,
    OtpField,
    MaskedField,
    RatingField,
    CodeField,
    MarkdownEditorField,
    fieldComponentMap,
} from './components/Form';

// Table
export {
    DataTable,
    InlineTable,
    SearchBar,
    Pagination,
    FilterPanel,
    ColumnToggle,
    BulkActionBar,
    TextCell,
    BadgeCell,
    BooleanCell,
    ImageCell,
    IconCell,
    ColorCell,
    DateCell,
    MoneyCell,
    cellComponentMap,
    SelectFilter,
    TernaryFilter,
    DateFilter,
    BooleanFilter,
    filterComponentMap,
} from './components/Table';

// Toast
export { ToastContainer, toast } from './components/Toast';
export type { ToastMessage } from './components/Toast';

// LoadingBar
export { LoadingBar } from './components/LoadingBar';

// Primitives
export { DatePicker, DateRangePicker } from './components/DatePicker';
export type { DateRange } from './components/DatePicker';
export { Select } from './components/Select';
export type { SelectOption } from './components/Select';

// Actions
export {
    ActionButton,
    ActionDropdown,
    ConfirmationModal,
} from './components/Actions';

// Infolist / Detail
export {
    DetailView,
    TextEntry,
    BadgeEntry,
    BooleanEntry,
    ImageEntry,
    DateEntry,
    MoneyEntry,
    detailEntryMap,
} from './components/Infolist';

// Tabs
export { TabGroup, TabPanel } from './components/Tabs';

// Charts
export { Chart, Sparkline } from './components/Charts';

// Pages
export {
    ListPage,
    CreatePage,
    EditPage,
    ViewPage,
    LoginPage,
    RegisterPage,
    ForgotPasswordPage,
    ResetPasswordPage,
    VerifyEmailPage,
    DashboardPage,
    ProfilePage,
} from './pages';
