# Deferred & removed API

Track props, features, and half-finished structures removed or postponed during the
`0.1` public API polish. Revisit these before `1.0`.

## Removed from public API (were typed but unimplemented / unused)

| Item | Notes | Suggested later work |
|------|-------|----------------------|
| `stickyHeader` | Declared on `ModernTableProps`, never applied to header/list. | Pin header while body scrolls vertically (FlashList sticky header / absolute header). |
| `enableGlobalSearch` | Declared; toolbar search already gated by `onSearchChange` presence. | Explicit flag to show/hide search independently of other toolbar controls. |
| `isLoading` | Declared; no loading UI. | Overlay / skeleton / `ListEmptyComponent` loading state. |
| `onSelectionChange` | Declared; selection used `onToggleOne` / `onToggleAll` only. | Optional bulk callback `(ids: RowId[]) => void` fired after each toggle, or replace toggle API. |
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
`null → asc → desc → null`. Still worth a dedicated unit test and optional
`enableSortClear` / per-column `sortable` flag.

### Column order sync
Internal `columnOrder` only resynced when `columns.length` changed. Polish adds
optional controlled `columnOrder` prop. Still weak when keys change without length
change — improve key-set diff sync.

### `selectionMode` was props-ignored
Props `selectionMode` / `onToggleSelectionMode` existed but ModernTable always used
internal state. Polish wires semi-controlled `selectionMode` + `onSelectionModeChange`.

### Toolbar show condition
Toolbar appears only when `onSearchChange && onDensityChange && onToggleColumn` are
all set. Too all-or-nothing — later: `showToolbar?: boolean` or per-slot flags
(`showSearch`, `showDensity`, `showColumnMenu`).

### Pagination theming
Chevron colors were hardcoded (`#ccc` / `#333`). Moved to theme tokens; pagination
still has no `translations` for a11y labels (prev/next).

### `useTable` gaps
- No controlled mode for individual slices (always owns state).
- `toggleAllSelection` scopes to **current page** only — document or add
  `selectAllScope: 'page' | 'filtered'`.
- No `columnOrder` state in `useTable` yet (table manages it).
- No `getRowId` override — requires `T extends { id }`.

### Filter modal
Boolean filters historically mixed `true`/`false` with stringly values. Typed as
`FilterValue` now; still no date-range / multi-select filter types.

### BasicTable
Left in MyExamy app (depends on `ExView` / `ExText`). Not part of this package.
Consider a minimal unstyled `SimpleTable` later if needed.

### Loading / empty / error triad
Only empty copy exists. Loading and error states were never started.

### Server-side / remote data
All filter/sort/paginate are client-side via `useTable`. Remote mode
(`manualSorting`, `manualPagination`, total count) not started.

### Accessibility
No `accessibilityLabel` / role wiring on sort headers, checkboxes, or toolbar actions.

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
