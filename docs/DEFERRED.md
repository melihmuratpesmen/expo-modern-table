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
Cycles `null → asc → desc → null` (`core/sort.ts`, unit-tested in `0.2.0`). Still open:
optional `enableSortClear` / per-column `sortable` flag.

### Column order sync
Done in `0.2.0`: order is reconciled with the current column keys on every render
(`core/columns.ts#reconcileOrder`), for both controlled and internal order.

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
- `toggleAllSelection` scopes to **current page** only (other pages' selections are
  kept since `0.2.0`) — consider `selectAllScope: 'page' | 'filtered'`.
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
Since `0.2.0` the module is injected via `screenOrientation` (no optional `require`).
Fullscreen = landscape lock only; hiding app chrome is left to `onFullscreenChange`.

## Intentionally postponed features (not started)

- Column resize
- Column pin presets / persistence (AsyncStorage)
- CSV / export
- Virtualized horizontal sticky improvements
- iOS list remount on sort (`key={listIdentityKey}`, see KNOWN_ISSUES): re-check on device with
  FlashList v2 whether it is still needed — it resets scroll position on every sort


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
| Tooling: ESLint, Prettier, Jest, CI | `0.2.0` | React Compiler lint rules partly downgraded to warnings until phase 4 |
| Pure core (`src/core`) + tests | `0.2.0` | sort / filter / search / paginate / selection / reorder / edit |
| Bug-fix pass | `0.2.0` | See CHANGELOG `0.2.0` |
| Compiled package (builder-bob, exports) | `0.2.0` | Strict consumers no longer type-check `src` |
| Row memoization, shared sticky interpolations, indexed search | `0.2.0` | Kept RN `Animated` (native driver) — a Reanimated migration wasn't needed |
