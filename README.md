# Inertia Studio — UI

Frontend components for Inertia Studio admin panels. One package, three frameworks.

## Installation

```bash
npm install @inertia-studio/ui
```

## Usage

Import from your framework's subpath:

```tsx
// React
import { DataTable, PanelLayout, FormRenderer } from '@inertia-studio/ui/react'

// Vue
import { DataTable, PanelLayout, FormRenderer } from '@inertia-studio/ui/vue'

// Svelte
import { DataTable, PanelLayout, FormRenderer } from '@inertia-studio/ui/svelte'
```

## What's Included

- **30 form field components** — text, select, date, file upload, rich editor, repeater, and more
- **8 table cell renderers** — text, badge, boolean, image, icon, color, date, money
- **4 filter components** — select, ternary, date, boolean
- **Layout** — PanelLayout, Sidebar, Topbar, Breadcrumbs, GlobalSearch
- **Utilities** — Toast notifications, LoadingBar, DatePicker, DateRangePicker, Select
- **8 pages** — List, Create, Edit, View, Login, Profile, Dashboard, Custom
- **Hooks** — usePanel, useFormState, useTheme, useStudioHooks
- **Design system** — Semantic color tokens, dark mode, 10 theme presets

## How It Works

The PHP package (`inertia-studio/laravel-adapter`) defines admin panels as JSON schemas. This package receives those schemas via Inertia props and renders the full admin UI.

You write PHP. This package handles the frontend.

## Requirements

- Inertia.js v3
- Tailwind CSS 4
- React 19 / Vue 3 / Svelte 5 (depending on your framework)

## Documentation

[inertia-studio.github.io](https://inertia-studio.github.io)

## License

MIT
