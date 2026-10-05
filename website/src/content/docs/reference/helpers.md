---
title: Helpers & exports
description: Everything the package exports — data helpers, CSV, themes, translations, icons and types.
sidebar:
  order: 4
---

## Components and hooks

| Export | Description |
| --- | --- |
| `ModernTable` | The table component. |
| `useTable` | State hook. |
| `useTableTheme(theme?, themeConfig?)` | Resolves `'light'` / `'dark'` / a theme object plus overrides into a `TableTheme` — handy for styling custom cells to match. |

## Data helpers

The same functions `useTable` uses internally. They are pure and have no React Native imports,
so they also run in Node (API mocks, server routes, tests).

| Export | Signature |
| --- | --- |
| `searchRows` | `(rows, query, fields, index?) => T[]` — `fields` are keys or `(row) => value` |
| `buildSearchIndex` | `(rows, fields) => string[]` — pre-normalized text for `searchRows` |
| `filterRows` | `(rows, filters, columns) => T[]` |
| `matchesFilter` | `(cellValue, filterValue, filterConfig?) => boolean` |
| `sortRows` | `(rows, sort, collator?, columns?) => T[]` — stable; blanks last |
| `compareValues` | `(a, b, collator?) => number` — numbers, dates, booleans, then text |
| `paginateRows` | `(rows, page, pageSize) => T[]` — 1-based page |
| `getTotalPages` | `(rowCount, pageSize) => number` |
| `toCsv` | `(rows, columns, options?) => string` — see [CSV export](/expo-modern-table/recipes/csv-export/) |
| `normalizeSearchText` | `(text) => string` — lower-case, accents removed, Turkish `İ I ı i` folded |
| `includesSearch` | `(haystack, needle) => boolean` |
| `matchesSearchFields` | `(fields, query) => boolean` |

```ts
// A mock API endpoint that behaves exactly like the client-side table
import {
  filterRows,
  paginateRows,
  searchRows,
  sortRows,
  type Column,
  type TableState,
} from 'expo-modern-table';

export function queryOrders(all: Order[], state: TableState, columns: Column<Order>[]) {
  const matching = sortRows(
    filterRows(searchRows(all, state.searchQuery, ['customer', 'email']), state.filters, columns),
    state.sort,
    undefined,
    columns
  );
  return { rows: paginateRows(matching, state.page, state.pageSize), total: matching.length };
}
```

## Themes, translations, icons

| Export | Description |
| --- | --- |
| `lightTheme`, `darkTheme` | Default `TableTheme` objects. |
| `defaultFontFamily` | System fonts for every weight. |
| `DEFAULT_TRANSLATIONS`, `TR_TRANSLATIONS` | English and Turkish `TableTranslations`. |
| `defaultIcons` | The built-in (lucide) `TableIcons`. |

## Types

`Column`, `ModernTableProps`, `ModernTableBaseProps`, `TableProps`, `UseTableOptions`,
`UseTableResult`, `TableState`, `TablePreferences`, `CsvRows`, `CsvOptions`, `SortState`,
`SortDirection`, `FilterConfig`, `FilterValue`, `Density`, `SelectionMode`, `RowId`, `TableRow`,
`RowIdAccessor`, `PaginationProps`, `TableTheme`, `TableFontFamily`, `TableTranslations`,
`TableIcons`, `TableIcon`, `ScreenOrientationModule`.

Every type is documented with TSDoc, so your editor shows the descriptions inline.
