# Changelog

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

### Added

- `screenOrientation`, `onFullscreenChange` props.
- `useTable`: `isSomeSelected`, `clearSelection`.
- Theme tokens (optional): `markedBackground`, `markedHeaderBackground`, `overlay`.
- ESLint, Prettier, Jest (96 tests) and GitHub Actions CI.

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
