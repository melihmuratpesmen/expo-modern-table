# Deferred & removed API

Track props, features, and half-finished structures removed or postponed during the
`0.1` public API polish. Revisit these before `1.0`.

## Removed from public API (were typed but unimplemented / unused)

| Item | Notes | Suggested later work |
|------|-------|----------------------|
| `stickyHeader` | Declared on `ModernTableProps`, never applied to header/list. | Pin header while body scrolls vertically (FlashList sticky header / absolute header). |
| `enableGlobalSearch` | Declared; toolbar search already gated by `onSearchChange` presence. | Use `showSearch` (`0.2.0`) to show/hide independently. |
| `isLoading` | Declared; no loading UI. | **Done in 0.2.0.** |
| `onSelectionChange` | Declared; selection used `onToggleOne` / `onToggleAll` only. | **Done in 0.2.0.** |
| `emptyMessage` | Replaced by `translations.empty`. | — (done via i18n) |

## Renamed (breaking in `0.x`)

| Old | New | Why |
|-----|-----|-----|
| `onToggleOne` | `onToggleRow` | Clearer naming |
| `onToggleSelectionMode` | `onSelectionModeChange` | Matches controlled `(mode) => void` pattern |

## Demoted from public exports (still used internally)

These remain in `src/` and are used by `ModernTable`, but are no longer barrel-exported:

- `Checkbox`
- `ColumnFilterModal`
- `DraggableHeader`
- `DraggableRow`
- `TableToolbar`

Re-export later only if we want a headless / compose-your-own API.

## Half-finished / fragile areas to finish later

### Sort header → direction
Previously header always called `onSort(key, 'asc')`. Fixed in polish to cycle
`null → asc → desc → null`. Optional `enableSortClear` and per-column `sortable`
shipped in `0.2.0`.

### Column order sync
Internal `columnOrder` only resynced when `columns.length` changed. `0.2.0`
diffs the key set (keeps existing order, appends new keys) in both `ModernTable`
and `useTable`.

### `selectionMode` was props-ignored
Props `selectionMode` / `onToggleSelectionMode` existed but ModernTable always used
internal state. Polish wires semi-controlled `selectionMode` + `onSelectionModeChange`.

### Toolbar show condition
Toolbar appears only when `onSearchChange && onDensityChange && onToggleColumn` are
all set. Too all-or-nothing — later: `showToolbar?: boolean` or per-slot flags
(`showSearch`, `showDensity`, `showColumnMenu`). **Done in 0.2.0.**

### Pagination theming
Chevron colors were hardcoded (`#ccc` / `#333`). Moved to theme tokens; pagination
still has no `translations` for a11y labels (prev/next). **Done in 0.2.0** (`previousPage` / `nextPage`).

### `useTable` gaps
- No controlled mode for individual slices (always owns state).
- `toggleAllSelection` scopes to **current page** only — document or add
  `selectAllScope: 'page' | 'filtered'`. **Done in 0.2.0.**
- No `columnOrder` state in `useTable` yet (table manages it). **Done in 0.2.0.**
- No `getRowId` override — requires `T extends { id }`. **Done in 0.2.0** (`getRowId` option; rows still typed with `id`).

### Filter modal
Boolean filters historically mixed `true`/`false` with stringly values. Typed as
`FilterValue` now; still no date-range / multi-select filter types.

### BasicTable
Left in MyExamy app (depends on `ExView` / `ExText`). Not part of this package.
Consider a minimal unstyled `SimpleTable` later if needed.

### Loading / empty / error triad
Only empty copy exists. Loading and error states were never started. **Done in 0.2.0.**

### Server-side / remote data
All filter/sort/paginate are client-side via `useTable`. Remote mode
(`manualSorting`, `manualPagination`, total count) not started.

### Accessibility
No `accessibilityLabel` / role wiring on sort headers, checkboxes, or toolbar actions.
**Done in 0.2.0.**

### Fullscreen
Depends on optional `expo-screen-orientation`. No bare-RN fallback beyond hiding the button.

## Intentionally postponed features (not started)

- Column resize
- Column pin presets / persistence (AsyncStorage)
- CSV / export
- Virtualized horizontal sticky improvements


## When picking work up

1. Check this file first.
2. Prefer additive minor versions (`0.2`, `0.3`) while in `0.x`.
3. Move an item to “Done” section below when shipped, with version number.

## Done

| Item | Version | Notes |
|------|---------|-------|
| Extract to `expo-modern-table` | `0.1.0` | Separate repo |
| Public API polish | `0.1.0` | Controlled model, renames, i18n `empty`, typed filters, narrowed exports, `getTableProps()` |
| Example Expo app (SDK 54) | `0.1.0` | Expo Go–compatible playground |
| npm publish | `0.1.0` | https://www.npmjs.com/package/expo-modern-table |
| Docs / media / README landing | `0.1.1` | Badges, previews, docs index synced to npm |
| Loading / error / toolbar slots / a11y / tests | `0.2.0` | `isLoading`+`error`, independent toolbar, `useTable` options, Vitest + CI |
