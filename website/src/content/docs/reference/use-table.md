---
title: useTable
description: Signature, options and return value of the useTable hook.
sidebar:
  order: 3
---

```ts
function useTable<T>(
  data: T[],
  columns: Column<T>[],
  options?: number | UseTableOptions<T>
): UseTableResult<T>;
```

A number is shorthand for `{ pageSize }`. When `T` has no `id` field, `options.getRowId` is
required. The [useTable guide](/expo-modern-table/guides/use-table/) explains each option with examples.

## Options — `UseTableOptions<T>`

| Option | Type | Default |
| --- | --- | --- |
| `pageSize` | `number` | `10` |
| `pageSizeOptions` | `number[]` | `[10, 20, 50]` |
| `pagination` | `boolean` | `true` |
| `initialState` | `Partial<TableState>` | — |
| `initialDensity` | `Density` | `'standard'` |
| `enableSelection` | `boolean` | `true` |
| `selectAllScope` | `'page' \| 'filtered'` | `'page'` |
| `getRowId` | `(row: T) => RowId` | `row => row.id` |
| `locale` | `string \| string[]` | device locale |
| `manual` | `boolean` | `false` |
| `rowCount` | `number` | — |
| `searchDebounceMs` | `number` | `300` in manual mode, else `0` |
| `onStateChange` | `(state: TableState) => void` | — |
| `initialPreferences` | `Partial<TablePreferences>` | — |
| `onPreferencesChange` | `(prefs: TablePreferences) => void` | — |

## Types

```ts
interface TableState {
  searchQuery: string;
  sort: { key: string; direction: 'asc' | 'desc' | null };
  filters: Record<string, FilterValue>;
  page: number; // 1-based
  pageSize: number;
}

interface TablePreferences {
  columnVisibility: Record<string, boolean>;
  columnPinning: Record<string, boolean>;
  columnOrder: string[];
  columnWidths: Record<string, number>;
  density: Density;
  pageSize: number;
}

type CsvRows = 'filtered' | 'page' | 'selected' | 'all';
```

## Return value — `UseTableResult<T>`

| Member | Type |
| --- | --- |
| `state` | `TableState` |
| `filteredData`, `sortedData`, `paginatedData` | `T[]` |
| `currentPage`, `totalPages` | `number` |
| `setCurrentPage` | `(page: number) => void` |
| `searchQuery` / `setSearchQuery` | `string` / `(text: string) => void` |
| `sortConfig` / `handleSort` | `SortState` / `(key: string, direction?: SortDirection) => void` |
| `filters` / `setColumnFilter` | `Record<string, FilterValue>` / `(key, value) => void` |
| `selectedIds` | `Set<RowId>` |
| `toggleSelection` / `toggleAllSelection` / `clearSelection` | `(id) => void` / `() => void` / `() => void` |
| `isAllSelected` / `isSomeSelected` | `boolean` |
| `density` / `setDensity` | `Density` / `(density) => void` |
| `itemsPerPage` / `setItemsPerPage` | `number` / `(size) => void` |
| `visibleColumns` / `toggleColumnVisibility` | `string[]` / `(key) => void` |
| `stickyColumns` / `toggleStickyColumn` | `string[]` / `(key) => void` |
| `columnOrder` / `setColumnOrder` | `string[]` / `(order) => void` |
| `columnWidths` / `setColumnWidth` | `Record<string, number>` / `(key, width) => void` |
| `preferences` / `setPreferences` | `TablePreferences` / `(prefs: Partial<TablePreferences>) => void` |
| `getCsv` | `(options?: CsvOptions<T> & { rows?: CsvRows }) => string` |
| `getTableProps` | `() => TableProps<T>` — spread onto `ModernTable` |
