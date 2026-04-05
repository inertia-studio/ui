// ============================================================================
// Panel Schema
// ============================================================================

export interface PanelSchema {
    id: string;
    path: string;
    brandName: string;
    brandLogo: string | null;
    brandLogoCollapsed: string | null;
    favicon: string | null;
    theme: ThemeSchema;
    layout: LayoutSchema;
    navigation: NavigationGroupSchema[];
    modules: ModuleMetaSchema[];
    tenancy: TenancySchema | null;
    user: UserSchema | null;
}

export interface ModuleMetaSchema {
    slug: string;
    label: string;
    pluralLabel: string;
    icon: IconSchema | null;
    simple: boolean;
    recordTitleAttribute: string;
}

export interface NavigationGroupSchema {
    label: string;
    icon: IconSchema | null;
    collapsible: boolean;
    collapsed: boolean;
    items: NavigationItemSchema[];
}

export interface NavigationItemSchema {
    label: string;
    icon: IconSchema | null;
    url: string;
    badge: string | number | null;
    isActive: boolean;
}

export interface UserSchema {
    name: string;
    email: string;
    avatar: string | null;
}

export interface TenancySchema {
    enabled: boolean;
    current: TenantSchema | null;
    available: TenantSchema[];
    switchUrl: string;
}

export interface TenantSchema {
    id: string | number;
    name: string;
    avatar: string | null;
}

// ============================================================================
// Theme & Layout
// ============================================================================

export interface ThemeSchema {
    primary: string;
    danger: string;
    warning: string;
    success: string;
    info: string;
    gray: string;
    fontFamily: string;
    fontSize: string;
    borderRadius: string;
    density: 'compact' | 'comfortable' | 'spacious';
}

export interface LayoutSchema {
    maxWidth: string;
    contentWidth: string;
    gutter: string;
    sidebar: SidebarSchema;
    topbar: TopbarSchema;
    navigation: NavigationStyleSchema;
    footer: FooterSchema;
}

export interface SidebarSchema {
    style: 'dark' | 'light' | 'transparent' | 'branded';
    width: string;
    collapsible: boolean;
    collapsedWidth: string;
    defaultCollapsed: boolean;
    mobileBreakpoint: 'sm' | 'md' | 'lg' | 'xl';
}

export interface TopbarSchema {
    sticky: boolean;
    height: string;
    showBreadcrumbs: boolean;
    showSearch: boolean;
    showUserMenu: boolean;
}

export interface NavigationStyleSchema {
    style: 'sidebar' | 'topbar' | 'both';
    groupStyle: 'collapsible' | 'flat' | 'separated';
    iconSize: 'sm' | 'md' | 'lg';
    activeStyle: 'highlight' | 'border-left' | 'pill';
}

export interface FooterSchema {
    enabled: boolean;
    text: string | null;
    sticky: boolean;
}

// ============================================================================
// Icons
// ============================================================================

export interface IconSchema {
    name: string;
    provider: string;
    variant: string | null;
}

// ============================================================================
// Form Schema
// ============================================================================

export interface FormSchema {
    type: 'form';
    operation: 'create' | 'edit';
    schema: FormComponentSchema[];
}

export type FormComponentSchema = FieldSchema | SectionSchema | TabsSchema;

export interface SectionSchema {
    type: 'section';
    heading: string;
    description: string | null;
    columns: number;
    collapsible: boolean;
    collapsed: boolean;
    aside: boolean;
    schema: FormComponentSchema[];
}

export interface TabsSchema {
    type: 'tabs';
    tabs: TabSchema[];
}

export interface TabSchema {
    label: string;
    icon: IconSchema | null;
    badge: string | number | null;
    schema: FormComponentSchema[];
}

// ============================================================================
// Field Types
// ============================================================================

interface BaseFieldSchema {
    name: string;
    label: string;
    placeholder: string | null;
    hint: string | null;
    helperText: string | null;
    required: boolean;
    disabled: boolean;
    hidden: boolean;
    columnSpan: number | 'full';
    prefix: string | null;
    suffix: string | null;
    default: unknown;
}

export interface TextFieldSchema extends BaseFieldSchema {
    type: 'text';
    maxLength: number | null;
    minLength: number | null;
}

export interface EmailFieldSchema extends BaseFieldSchema {
    type: 'email';
    maxLength: number | null;
}

export interface PasswordFieldSchema extends BaseFieldSchema {
    type: 'password';
    revealable: boolean;
}

export interface UrlFieldSchema extends BaseFieldSchema {
    type: 'url';
    maxLength: number | null;
}

export interface TelFieldSchema extends BaseFieldSchema {
    type: 'tel';
    maxLength: number | null;
}

export interface NumberFieldSchema extends BaseFieldSchema {
    type: 'number';
    min: number | null;
    max: number | null;
    step: number | null;
}

export interface StepperFieldSchema extends BaseFieldSchema {
    type: 'stepper';
    min: number | null;
    max: number | null;
    step: number;
}

export interface TextareaFieldSchema extends BaseFieldSchema {
    type: 'textarea';
    rows: number;
    autosize: boolean;
    maxLength: number | null;
}

export interface SelectFieldSchema extends BaseFieldSchema {
    type: 'select';
    options: Record<string, string> | Array<{ value: string; label: string }>;
    searchable: boolean;
    multiple: boolean;
    preload: boolean;
    native: boolean;
}

export interface ToggleFieldSchema extends BaseFieldSchema {
    type: 'toggle';
    onIcon: IconSchema | null;
    offIcon: IconSchema | null;
    onColor: string | null;
    offColor: string | null;
}

export interface CheckboxFieldSchema extends BaseFieldSchema {
    type: 'checkbox';
}

export interface CheckboxListFieldSchema extends BaseFieldSchema {
    type: 'checkboxList';
    options: Record<string, string>;
    columns: number;
    searchable: boolean;
}

export interface RadioFieldSchema extends BaseFieldSchema {
    type: 'radio';
    options: Record<string, string>;
    inline: boolean;
}

export interface ToggleButtonsFieldSchema extends BaseFieldSchema {
    type: 'toggleButtons';
    options: Record<string, string>;
    multiple: boolean;
    grouped: boolean;
}

export interface DateFieldSchema extends BaseFieldSchema {
    type: 'date';
    withTime: boolean;
    format: string | null;
    minDate: string | null;
    maxDate: string | null;
}

export interface TimeFieldSchema extends BaseFieldSchema {
    type: 'time';
    seconds: boolean;
    format: string | null;
}

export interface DateRangeFieldSchema extends BaseFieldSchema {
    type: 'dateRange';
    format: string | null;
    minDate: string | null;
    maxDate: string | null;
}

export interface ColorPickerFieldSchema extends BaseFieldSchema {
    type: 'colorPicker';
    swatches: string[];
    format: 'hex' | 'rgb' | 'hsl';
}

export interface FileUploadFieldSchema extends BaseFieldSchema {
    type: 'fileUpload';
    multiple: boolean;
    maxFiles: number | null;
    maxSize: number | null;
    acceptedFileTypes: string[];
    uploadUrl: string;
}

export interface ImageUploadFieldSchema extends BaseFieldSchema {
    type: 'imageUpload';
    multiple: boolean;
    maxFiles: number | null;
    maxSize: number | null;
    acceptedFileTypes: string[];
    uploadUrl: string;
    cropAspectRatio: string | null;
    resizeTargetWidth: number | null;
    resizeTargetHeight: number | null;
}

export interface TagsFieldSchema extends BaseFieldSchema {
    type: 'tags';
    suggestions: string[];
    separator: string;
}

export interface KeyValueFieldSchema extends BaseFieldSchema {
    type: 'keyValue';
    keyLabel: string;
    valueLabel: string;
    addable: boolean;
    deletable: boolean;
}

export interface RepeaterFieldSchema extends BaseFieldSchema {
    type: 'repeater';
    schema: FormComponentSchema[];
    addable: boolean;
    deletable: boolean;
    reorderable: boolean;
    maxItems: number | null;
    minItems: number | null;
    collapsible: boolean;
}

export interface HiddenFieldSchema extends BaseFieldSchema {
    type: 'hidden';
}

export interface PlaceholderFieldSchema extends BaseFieldSchema {
    type: 'placeholder';
    content: string;
}

export interface SlugFieldSchema extends BaseFieldSchema {
    type: 'slug';
    from: string;
}

export interface MoneyFieldSchema extends BaseFieldSchema {
    type: 'money';
    currency: string;
    locale: string | null;
}

export interface PercentFieldSchema extends BaseFieldSchema {
    type: 'percent';
    precision: number;
}

export interface BelongsToFieldSchema extends BaseFieldSchema {
    type: 'belongsTo';
    relationship: string;
    displayColumn: string;
    searchable: boolean;
    preload: boolean;
    multiple: boolean;
    createForm: FormComponentSchema[] | null;
    serverSearch: boolean;
}

export interface RichEditorFieldSchema extends BaseFieldSchema {
    type: 'richEditor';
    toolbarButtons: string[];
}

export type FieldSchema =
    | TextFieldSchema
    | EmailFieldSchema
    | PasswordFieldSchema
    | UrlFieldSchema
    | TelFieldSchema
    | NumberFieldSchema
    | StepperFieldSchema
    | TextareaFieldSchema
    | SelectFieldSchema
    | ToggleFieldSchema
    | CheckboxFieldSchema
    | CheckboxListFieldSchema
    | RadioFieldSchema
    | ToggleButtonsFieldSchema
    | DateFieldSchema
    | TimeFieldSchema
    | DateRangeFieldSchema
    | ColorPickerFieldSchema
    | FileUploadFieldSchema
    | ImageUploadFieldSchema
    | TagsFieldSchema
    | KeyValueFieldSchema
    | RepeaterFieldSchema
    | HiddenFieldSchema
    | PlaceholderFieldSchema
    | SlugFieldSchema
    | MoneyFieldSchema
    | PercentFieldSchema
    | BelongsToFieldSchema
    | RichEditorFieldSchema;

// ============================================================================
// Table Schema
// ============================================================================

export interface TableSchema {
    type: 'table';
    columns: ColumnSchema[];
    filters: FilterSchema[];
    actions: ActionSchema[];
    bulkActions: ActionSchema[];
    searchable: boolean;
    paginated: boolean;
    defaultSort: { column: string; direction: 'asc' | 'desc' } | null;
    filterColumns: number;
    poll: number;
}

// ============================================================================
// Column Types
// ============================================================================

interface BaseColumnSchema {
    name: string;
    label: string;
    sortable: boolean;
    searchable: boolean;
    toggleable: boolean;
    isToggledHiddenByDefault: boolean;
    copyable: boolean;
    alignment: 'start' | 'center' | 'end';
    wrap: boolean;
    hidden: boolean;
    url: string | null;
    description: string | null;
}

export interface TextColumnSchema extends BaseColumnSchema {
    type: 'text';
    limit: number | null;
    words: number | null;
    weight: string | null;
    size: string | null;
    color: string | null;
    formatAs: 'text' | 'dateTime' | 'date' | 'money' | null;
    formatOptions: Record<string, unknown> | null;
}

export interface BadgeColumnSchema extends BaseColumnSchema {
    type: 'badge';
    colors: Record<string, string>;
}

export interface BooleanColumnSchema extends BaseColumnSchema {
    type: 'boolean';
    trueIcon: IconSchema | null;
    falseIcon: IconSchema | null;
    trueColor: string | null;
    falseColor: string | null;
}

export interface ImageColumnSchema extends BaseColumnSchema {
    type: 'image';
    circular: boolean;
    square: boolean;
    width: string | null;
    height: string | null;
}

export interface IconColumnSchema extends BaseColumnSchema {
    type: 'icon';
    colors: Record<string, string>;
    size: string | null;
}

export interface ColorColumnSchema extends BaseColumnSchema {
    type: 'color';
}

export interface DateColumnSchema extends BaseColumnSchema {
    type: 'date';
    format: string | null;
    since: boolean;
    timezone: string | null;
}

export interface MoneyColumnSchema extends BaseColumnSchema {
    type: 'money';
    currency: string;
    locale: string | null;
}

export type ColumnSchema =
    | TextColumnSchema
    | BadgeColumnSchema
    | BooleanColumnSchema
    | ImageColumnSchema
    | IconColumnSchema
    | ColorColumnSchema
    | DateColumnSchema
    | MoneyColumnSchema;

// ============================================================================
// Filter Types
// ============================================================================

interface BaseFilterSchema {
    name: string;
    label: string;
    type: string;
}

export interface SelectFilterSchema extends BaseFilterSchema {
    type: 'select';
    options: Record<string, string>;
    searchable: boolean;
    multiple: boolean;
}

export interface TernaryFilterSchema extends BaseFilterSchema {
    type: 'ternary';
    trueLabel: string;
    falseLabel: string;
    nullable: boolean;
}

export interface DateFilterSchema extends BaseFilterSchema {
    type: 'date';
}

export interface BooleanFilterSchema extends BaseFilterSchema {
    type: 'boolean';
}

export interface QueryFilterSchema extends BaseFilterSchema {
    type: 'query';
}

export type FilterSchema =
    | SelectFilterSchema
    | TernaryFilterSchema
    | DateFilterSchema
    | BooleanFilterSchema
    | QueryFilterSchema;

// ============================================================================
// Action Schema
// ============================================================================

export interface ActionSchema {
    type: 'create' | 'view' | 'edit' | 'delete' | 'bulkDelete' | 'export' | 'import' | 'custom';
    name: string;
    label: string;
    icon: IconSchema | null;
    color: string | null;
    requiresConfirmation: boolean;
    confirmationHeading: string | null;
    confirmationMessage: string | null;
    url: string | null;
    authorized: boolean;
    form: FormComponentSchema[] | null;
}

// ============================================================================
// Detail Schema
// ============================================================================

export type DetailSchema = DetailEntrySchema | SectionSchema;

interface BaseDetailEntrySchema {
    name: string;
    label: string;
    copyable: boolean;
    icon: IconSchema | null;
    url: string | null;
    hidden: boolean;
    columnSpan: number | 'full';
}

export interface TextDetailSchema extends BaseDetailEntrySchema {
    type: 'text';
    formatAs: 'text' | 'dateTime' | 'date' | 'money' | null;
    formatOptions: Record<string, unknown> | null;
    limit: number | null;
    weight: string | null;
}

export interface BadgeDetailSchema extends BaseDetailEntrySchema {
    type: 'badge';
    colors: Record<string, string>;
}

export interface BooleanDetailSchema extends BaseDetailEntrySchema {
    type: 'boolean';
}

export interface ImageDetailSchema extends BaseDetailEntrySchema {
    type: 'image';
    circular: boolean;
    width: string | null;
    height: string | null;
}

export interface DateDetailSchema extends BaseDetailEntrySchema {
    type: 'date';
    format: string | null;
    since: boolean;
}

export interface MoneyDetailSchema extends BaseDetailEntrySchema {
    type: 'money';
    currency: string;
    locale: string | null;
}

export type DetailEntrySchema =
    | TextDetailSchema
    | BadgeDetailSchema
    | BooleanDetailSchema
    | ImageDetailSchema
    | DateDetailSchema
    | MoneyDetailSchema;

// ============================================================================
// List Page Tabs
// ============================================================================

export interface ListTabSchema {
    label: string;
    icon: IconSchema | null;
    badge: string | number | null;
    slug: string;
}

// ============================================================================
// Paginated Data
// ============================================================================

export interface PaginatedData<T = Record<string, unknown>> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}
