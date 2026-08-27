# Changelog

## 0.2.0

Quality pass: production states, independent toolbar, accessibility, testable pipeline.

- **Loading / error** — `isLoading`, `error`, `onRetry` empty and overlay states
- **Toolbar slots** — `showToolbar`, `showSearch`, `showDensity`, `showColumnMenu` (no longer all-or-nothing)
- **Accessibility** — labels/roles on sort, filter, selection, toolbar, pagination
- **`useTable` options** — 3rd arg can be a number (as before) or `{ getRowId, selectAllScope, searchKeys, columnOrder, enableSelection, initialSort, … }`
- **Selection** — `selectAllScope: 'page' | 'filtered'`, indeterminate checkbox, `onSelectionChange`, `clearSelection`
- **Columns** — `sortable: false`, `enableSortClear`, `columnOrder` owned by `useTable`
- **Headless pipeline** — `processTableData`, `nextSortDirection`, `applyFilters` exported and unit-tested
- **CI** — `npm test` (Vitest) + GitHub Actions typecheck/test

## 0.1.2

- Slim publish footprint: drop `docs/` (demo media) from the npm tarball
- Package size ~2.5 MB → ~22 KB; README previews still load from GitHub
- No runtime API changes

## 0.1.1

- Professional README landing (features table, API overview, docs index)
- Preview media: desktop + mobile GIFs/stills
- GitHub topics and documentation index (`docs/README.md`)
- No runtime API changes

## 0.1.0

- Initial public release
- `ModernTable` + `useTable` / `getTableProps()`
- Sort, filter, search, selection, sticky columns, reorder, theming, i18n
- Expo Go example app (SDK 54)
