---
title: ModernTable props
description: Every prop of the ModernTable component, grouped by feature.
sidebar:
  order: 1
---

`ModernTable<T>` is controlled: `useTable().getTableProps()` provides the state props marked
**hook**; the rest are yours to add. `T` is your row type.

## Data

| Prop | Type | Description |
| --- | --- | --- |
| `data` **hook** | `T[]` | Rows to render (the current page). |
| `columns` | `Column<T>[]` | Column definitions — see [Column](/expo-modern-table/reference/column/). Keep the array stable. |
| `getRowId` | `(row: T) => RowId` | Row identity. Required by the types when `T` has no `id`. |
| `footerData` **hook** | `T[]` | Rows the summary row aggregates. Default `data`. |

## Search & sort

| Prop | Type | Description |
| --- | --- | --- |
| `searchQuery` **hook** | `string` | Search field text. |
| `onSearchChange` **hook** | `(text: string) => void` | Shows the search field. |
| `sortColumn` **hook** | `string` | Sorted column key. |
| `sortDirection` **hook** | `'asc' \| 'desc' \| null` | Sort direction. |
| `onSort` **hook** | `(key, direction) => void` | Makes headers sortable. |

## Filters

| Prop | Type | Description |
| --- | --- | --- |
| `filters` **hook** | `Record<string, FilterValue>` | Active filter values by column key. |
| `onFilterChange` **hook** | `(key, value) => void` | Enables the filter buttons of columns with `filterConfig`. |

## Selection

| Prop | Type | Description |
| --- | --- | --- |
| `enableSelection` **hook** | `boolean` | Show the checkbox column. |
| `selectedIds` **hook** | `Set<RowId>` | Selected rows. |
| `isAllSelected` **hook** | `boolean` | Header checkbox checked. |
| `isSomeSelected` **hook** | `boolean` | Header checkbox shows a dash. |
| `onToggleRow` **hook** | `(id: RowId) => void` | Row checkbox pressed. |
| `onToggleAll` **hook** | `() => void` | Header checkbox pressed. |
| `renderBulkActions` | `(ids: Set<RowId>) => ReactNode` | Contextual toolbar content while rows are selected. |

## Pagination & density

| Prop | Type | Description |
| --- | --- | --- |
| `pagination` **hook** | `PaginationProps` | `{ currentPage, totalPages, itemsPerPage, onPageChange, itemsPerPageOptions?, onItemsPerPageChange? }`. Omit to hide the bar. |
| `density` **hook** | `'compact' \| 'standard' \| 'comfortable'` | Row height: 36 / 48 / 64. |
| `onDensityChange` **hook** | `(density) => void` | Shows the density toggle. |

## Columns

| Prop | Type | Description |
| --- | --- | --- |
| `visibleColumns` **hook** | `string[]` | Keys of the shown columns. |
| `onToggleColumn` **hook** | `(key: string) => void` | Shows the column menu. |
| `stickyColumns` **hook** | `string[]` | Keys of the pinned columns. Defaults to columns with `isSticky`. |
| `onToggleSticky` **hook** | `(key: string) => void` | Pin / unpin from the column menu. |
| `enableColumnReorder` | `boolean` | Long-press and drag headers. |
| `columnOrder` **hook** | `string[]` | Controlled order. Internal when omitted. |
| `onColumnReorder` **hook** | `(order: string[]) => void` | Order changed. |
| `enableColumnResize` | `boolean` | Drag a header's right edge. |
| `columnWidths` **hook** | `Record<string, number>` | Controlled widths. Internal when omitted. |
| `onColumnResize` **hook** | `(key, width) => void` | Width changed. |

## Rows

| Prop | Type | Description |
| --- | --- | --- |
| `onRowPress` | `(row: T) => void` | Makes rows pressable. |
| `onRowChange` | `(row: T) => void` | Enables inline editing of `editable` columns. |
| `enableRowReorder` | `boolean` | Adds the reorder-mode toggle and drag handles. |
| `onRowReorder` | `(from: number, to: number) => void` | Indices in `data`. |
| `selectionMode` | `'select' \| 'reorder'` | Controlled mode. Internal when omitted. |
| `onSelectionModeChange` | `(mode) => void` | Mode toggled. |
| `rowGroupKey` | `keyof T` | Visually groups consecutive rows with the same value. |
| `renderExpandedRow` | `(row: T, index: number) => ReactNode` | Detail content; adds expand buttons. |
| `expandedIds` | `Set<RowId>` | Controlled open rows. Internal when omitted. |
| `onToggleExpand` | `(id: RowId) => void` | Expand button pressed. |

## States & lists

| Prop | Type | Description |
| --- | --- | --- |
| `isLoading` | `boolean` | Spinner when empty; dims rows while refetching. |
| `isLoadingMore` | `boolean` | Spinner below the rows. |
| `error` | `ReactNode` | Replaces the rows. String or `true` uses the built-in view. |
| `onRetry` | `() => void` | Retry button in the built-in error view. |
| `emptyComponent` | `ReactNode` | Replaces "No data found." |
| `refreshing` | `boolean` | Pull-to-refresh state. |
| `onRefresh` | `() => void` | Enables pull to refresh. |
| `onEndReached` | `() => void` | Infinite scroll. |
| `onEndReachedThreshold` | `number` | Distance from the end, in visible lengths. |
| `scrollEnabled` | `boolean` | Vertical scrolling of the rows. |

## Toolbar

| Prop | Type | Description |
| --- | --- | --- |
| `showToolbar` | `boolean` | Force the toolbar on or off. Default: shown when any control is available. |
| `toolbarActions` | `ReactNode` | Extra buttons at the end of the toolbar. |
| `screenOrientation` | `ScreenOrientationModule` | Pass `expo-screen-orientation` to show the fullscreen button. |
| `onFullscreenChange` | `(isFullscreen: boolean) => void` | Fullscreen toggled. |

## Appearance

| Prop | Type | Description |
| --- | --- | --- |
| `theme` | `'light' \| 'dark' \| TableTheme` | Base theme. Default `'light'`. |
| `themeConfig` | `Partial<TableTheme>` | Token overrides. Keep the object stable. |
| `translations` | `Partial<TableTranslations>` | UI and accessibility strings. |
| `icons` | `Partial<TableIcons>` | Replace built-in icons. |
| `containerStyle` | `StyleProp<ViewStyle>` | Outer card. |
| `headerStyle` | `StyleProp<ViewStyle>` | Header row. |
| `rowStyle` | `StyleProp<ViewStyle>` | Every row. |
| `getRowStyle` | `(row: T, index: number) => StyleProp<ViewStyle>` | Per-row style. Keep it stable. |

Types: `RowId = string | number`, `FilterValue = string | boolean | { min?: number; max?: number } | undefined`.
