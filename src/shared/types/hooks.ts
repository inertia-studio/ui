import type { ReactNode } from 'react';
import type {
    ActionSchema,
    ColumnSchema,
    FieldSchema,
    IconSchema,
    ModuleMetaSchema,
    TenantSchema,
    ThemeSchema,
    UserSchema,
} from './schema';

// ============================================================================
// Component Slot
// ============================================================================

export type ComponentSlot = ReactNode;

// ============================================================================
// Hook Contexts
// ============================================================================

export interface PageContext {
    panel: string;
    module: ModuleMetaSchema | null;
    operation: 'list' | 'create' | 'edit' | 'view' | 'dashboard' | 'custom';
    record: Record<string, unknown> | null;
}

export interface ActionResult {
    success: boolean;
    message: string | null;
    redirect: string | null;
}

export interface ConfirmationConfig {
    heading: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    isDangerous: boolean;
}

export interface StudioNotification {
    id: string;
    title: string;
    body: string | null;
    type: 'success' | 'danger' | 'warning' | 'info';
    actions: Array<{ label: string; url: string | null }>;
    duration: number;
}

export interface ResolvedTheme extends ThemeSchema {
    cssVariables: Record<string, string>;
}

// ============================================================================
// Hook System
// ============================================================================

export interface StudioHooks {
    // Theme
    'theme:resolved': (theme: ResolvedTheme) => ResolvedTheme;
    'theme:css-vars': (vars: Record<string, string>) => Record<string, string>;

    // Layout slots
    'layout:sidebar-header': () => ComponentSlot;
    'layout:sidebar-footer': () => ComponentSlot;
    'layout:topbar-start': () => ComponentSlot;
    'layout:topbar-end': () => ComponentSlot;
    'layout:user-menu': (user: UserSchema) => ComponentSlot;
    'layout:user-menu-items': () => ComponentSlot;
    'layout:mobile-menu': () => ComponentSlot;
    'layout:tenant-switcher': (
        current: TenantSchema,
        available: TenantSchema[],
        onSwitch: (id: string | number) => void,
    ) => ComponentSlot;

    // Page slots
    'page:before-content': (context: PageContext) => ComponentSlot;
    'page:after-content': (context: PageContext) => ComponentSlot;
    'page:header-actions': (context: PageContext) => ComponentSlot[];

    // Form hooks
    'form:field-wrapper': (field: FieldSchema, children: ComponentSlot) => ComponentSlot;
    'form:before-submit': (data: Record<string, unknown>, operation: string) => Record<string, unknown>;
    'form:after-submit': (result: ActionResult) => void;
    'form:render-field': (field: FieldSchema) => ComponentSlot | null;

    // Table hooks
    'table:row-class': (record: Record<string, unknown>, index: number) => string;
    'table:cell': (column: ColumnSchema, value: unknown, record: Record<string, unknown>) => ComponentSlot | null;
    'table:empty-state': () => ComponentSlot;
    'table:header-actions': () => ComponentSlot[];

    // Action hooks
    'action:before': (action: ActionSchema, records: Record<string, unknown>[]) => boolean | void;
    'action:after': (action: ActionSchema, result: ActionResult) => void;
    'action:confirmation': (action: ActionSchema) => ConfirmationConfig | null;

    // Notification hooks
    'notification:render': (notification: StudioNotification) => ComponentSlot | null;
    'notification:position': () => 'top-right' | 'bottom-right' | 'top-center' | 'bottom-center';
}

export type StudioHookName = keyof StudioHooks;
