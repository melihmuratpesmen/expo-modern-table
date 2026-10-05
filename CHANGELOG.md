# Changelog

## 0.5.0

First release after 0.1.2. The 0.2.0–0.4.0 entries below were developed in the same branch and
were not published separately — upgrading from 0.1.x, read all of them (breaking changes are
listed under 0.2.0, 0.3.0 and 0.4.0).

### Fixed (found on device)

- FlashList v2 kept the first visible row anchored when data changed
  (`maintainVisibleContentPosition`, on by default), so moving a row — or sorting / filtering
  on Android — scrolled the top rows out of view. It is now turned off (v2 only).
- Resizing a column no longer starts the header's reorder drag or leaves the header stuck in
  the lifted state: resize handles sit beside the header cells, and drag / resize gestures are
  memoized so a re-render can't drop their finalize callback.
- The fullscreen exit button stays in the bulk-action bar while in fullscreen.
- Reordering columns no longer remounts the iOS list (which scrolled it to the top).
- Header titles stay on one line and truncate.

### Added

- Summary row: `Column.footer` (`'sum' | 'avg' | 'min' | 'max' | 'count'` or a function) and
  `footerData` (useTable passes every filtered row).
- Expandable rows: `renderExpandedRow`, `expandedIds`, `onToggleExpand`.
- CSV export: `table.getCsv({ rows, delimiter, bom, … })` and `toCsv(rows, columns, options)`,
  with CSV-injection escaping.
- Persistable layout: `table.preferences`, `initialPreferences`, `onPreferencesChange`,
  `setPreferences` (visibility, pinning, column order, widths, density, page size).
- `useTable` now owns column order and widths (`setColumnOrder`, `setColumnWidth`, passed via
  `getTableProps`).
- `TR_TRANSLATIONS`; accessibility roles, labels and states throughout (sort direction, checkbox
  mixed state, drag handles, toolbar, filter modal, pagination, expand buttons).
- Icons: `expand`, `collapse`.

### Changed

- `TableTranslations` has 15 new required keys (screen-reader labels). `translations` stays
  `Partial`.
- `getTableProps()` also returns `columnOrder`, `onColumnReorder`, `columnWidths`,
  `onColumnResize` and `footerData`. If you pass your own `onColumnReorder` / `onColumnResize`
  after the spread, call `table.setColumnOrder` / `table.setColumnWidth` from it.

## 0.4.0

### Added

- Columns: `getValue` (computed / nested values for sort, filter, search and cell text),
  `sortable`, `sortFn`, `searchable`, `renderHeader`, `flex`, `minWidth`, `maxWidth`,
  `resizable`.
- Column resizing: `enableColumnResize`, `columnWidths` / `onColumnResize` (controlled or
  internal). Also adjustable with screen-reader increment / decrement.
- Toolbar: `showToolbar`, `toolbarActions`, `renderBulkActions` (a contextual bar that replaces
  the toolbar while rows are selected).
- Partial-selection header checkbox: `isSomeSelected` (passed by `getTableProps()`).
- `icons` prop to replace any built-in icon; `defaultIcons`, `TableIcons`, `TableIcon` exports.
- Checkbox accessibility role and checked / mixed state.

### Changed

- Toolbar controls are independent: search, density and the column menu each appear when their
  handler is passed. Previously the toolbar needed all three, so tables passing only some of
  them now show a toolbar.
- `searchRows` / `buildSearchIndex` accept value getters as well as keys; `sortRows` takes
  optional column definitions.

## 0.3.0

### Added

- `useTable(data, columns, options)` — the third argument may now be an options object
  (a number still works as the page size): `pageSize`, `pageSizeOptions`, `pagination`,
  `initialState`, `initialDensity`, `enableSelection`, `selectAllScope`, `getRowId`, `locale`.
- Server-side mode: `manual`, `rowCount`, `searchDebounceMs`, `onStateChange`, and
  `table.state` (`{ searchQuery, sort, filters, page, pageSize }`). A new debounced query
  resets the page without a double fetch.
- `getRowId` on `useTable` and `ModernTable` — rows no longer need an `id` field. TypeScript
  requires it when they don't.
- `ModernTable`: `isLoading`, `isLoadingMore`, `error`, `onRetry`, `emptyComponent`,
  `refreshing`, `onRefresh`, `onEndReached`, `onEndReachedThreshold`.
- Translations: `loading`, `error`, `retry`.
- Exports: `UseTableOptions`, `TableState`, `TableProps`, `ScreenOrientationModule`,
  `RowIdAccessor`, `ModernTableBaseProps`, and the data helpers (`sortRows`, `filterRows`,
  `searchRows`, `buildSearchIndex`, `paginateRows`, `getTotalPages`, `compareValues`,
  `matchesFilter`).

### Changed

- `TableTranslations` has three new required keys. `translations` stays `Partial`, so only code
  that builds a complete `TableTranslations` object needs them.
- `ModernTableProps` is now a type alias (`ModernTableBaseProps<T> & RowIdAccessor<T>`) and
  accepts any object row type.
- Clearing the search no longer returns to the page you were on before searching.

## 0.2.0

### Breaking

- The fullscreen toolbar button is no longer auto-detected. The package no longer
  `require`s `expo-screen-orientation` (that broke bundling in bare React Native apps
  without it). Pass the module to show the button:
  `import * as ScreenOrientation from 'expo-screen-orientation'` →
  `<ModernTable screenOrientation={ScreenOrientation} />`.
- Header drag (with `enableColumnReorder`) now starts after a short long-press, so
  horizontal scrolling over the header works again.
- The package now ships compiled ES modules (`lib/module`) and type declarations
  (`lib/typescript`) through an `exports` map instead of raw TypeScript. Deep imports such
  as `expo-modern-table/src/...` are no longer allowed — import from `expo-modern-table`.
- `expo-screen-orientation` and `react-native-svg` are no longer peer dependencies
  (the package imports neither; `react-native-svg` is still needed by `lucide-react-native`).

### Fixes

- Column drag moved the wrong column when some columns were hidden.
- Column drag drop target now follows real column widths instead of the dragged column's.
- Row reorder works without `enableSelection` (the drag handle column was missing).
- Tapping a draggable header no longer leaves it stuck in the lifted/scaled state.
- Table fills its own width instead of the screen width (no phantom horizontal scroll
  inside padded containers); rotation no longer remounts the table.
- Inline edit keeps number columns numeric (accepts `7,5`), commits once, ignores unchanged
  or invalid input, and only activates when `onRowChange` is set.
- Header cells no longer render stale height / translations (removed a broken `useCallback`).
- Editable cells are tappable over the full cell height (the tap target was only the text line).
- `align: 'right' | 'center'` now also aligns custom `renderCell` content.
- The orientation lock is restored when the table unmounts in fullscreen.
- Number-range filter accepts decimals (`1.5` / `1,5`) and negative numbers.
- Sorting is locale-aware and natural (`Çorum` < `Zonguldak`, `2` < `10`); blank values sort last.
- Global search only matches visible columns (not `id`, hidden fields or nested objects).
- Page "select all" keeps selections made on other pages.
- `select` filters match numeric cells; `number-range` excludes blank cells.
- Visible / sticky columns follow `columns` prop changes.
- Marked columns, modal backdrop and checkbox tick use theme colors (dark mode).

### Packaging

- Built with `react-native-builder-bob`; consumers no longer type-check the library source
  with their own compiler settings (strict flags such as `exactOptionalPropertyTypes` used
  to report errors inside the package).
- `sideEffects: false`; tests are excluded from the tarball.

### Performance

- Rows are a memoized component: toggling a checkbox or editing a cell re-renders that
  row only, not every visible row. New inline `onRowPress` / `onToggleRow` / `onRowChange` /
  `onRowReorder` functions no longer re-render rows (they are called through stable wrappers).
- Sticky-column interpolations are created once per column instead of per cell per render.
- Global search uses a pre-normalized index and `useDeferredValue`, so typing stays responsive
  on large data sets.

### Added

- `screenOrientation`, `onFullscreenChange` props.
- `useTable`: `isSomeSelected`, `clearSelection`.
- Theme tokens (optional): `markedBackground`, `markedHeaderBackground`, `overlay`.
- ESLint (incl. React Compiler rules), Prettier, Jest (102 tests) and GitHub Actions CI.
- Example app runs on web (`npm run example:web`).

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
