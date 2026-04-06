// Types
export type * from '../shared/types';

// Utils
export { cn } from '../shared/utils/cn';
export { formatDate, formatDateTime, formatMoney, formatNumber, formatPercent } from '../shared/utils/formatters';

// Theme
export { studioPreset } from '../shared/theme';
export { generateCssVariables } from '../shared/theme';

// Context & Provider
export { StudioProvider } from './context/StudioContext';

// Hooks
export { usePanel } from './hooks/usePanel';
export { useTheme } from './hooks/useTheme';
export { useStudioHooks } from './hooks/useStudioHooks';
export { useFormState } from './hooks/useFormState';

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
} from './components/Layout';

// Form
export { FormRenderer } from './components/Form';
export { FieldWrapper } from './components/Form';
export { Section } from './components/Form';

// Table
export {
    DataTable,
    SearchBar,
    Pagination,
    FilterPanel,
    ColumnToggle,
    BulkActionBar,
} from './components/Table';

// Toast
export { ToastContainer, toast } from './components/Toast';

// Primitives
export { DatePicker, DateRangePicker } from './components/DatePicker';
export { Select } from './components/Select';

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

// Pages (used by resolveStudioPage in the Vite plugin)
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
