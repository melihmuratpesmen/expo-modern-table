---
title: Column
description: Every property of a column definition.
sidebar:
  order: 2
---

```ts
import type { Column } from 'expo-modern-table';

const columns: Column<Order>[] = [/* … */];
```

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `key` | `keyof T \| string` | — | Field of the row, or any unique key when using `getValue` / `renderCell`. |
| `title` | `string` | — | Header text (also used in the column menu and CSV header). |
| `width` | `number` | `100` | Fixed width, or the starting width of a `flex` column. |
| `flex` | `number` | — | Share of the leftover horizontal space. |
| `minWidth` | `number` | — | Lower bound for `flex` and resizing. |
| `maxWidth` | `number` | — | Upper bound for `flex` and resizing. |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Header and cell alignment. |
| `isSticky` | `boolean` | `false` | Pinned to the left by default. |
| `hidden` | `boolean` | `false` | Hidden by default (can be shown from the column menu). |
| `getValue` | `(row: T) => unknown` | `row[key]` | Value for sorting, filtering, search, CSV and default text. |
| `sortable` | `boolean` | `true` | Allow sorting (when the table has `onSort`). |
| `sortFn` | `(a: T, b: T) => number` | — | Ascending comparator. |
| `searchable` | `boolean` | `true` | Include in the global search. |
| `resizable` | `boolean` | `true` | Allow resizing (with `enableColumnResize`). |
| `editable` | `boolean` | `false` | Tap to edit (needs `onRowChange`). |
| `filterConfig` | `{ type, options? }` | — | `type`: `'text'`, `'select'`, `'boolean'` or `'number-range'`; `options` for `'select'`. |
| `footer` | `'sum' \| 'avg' \| 'min' \| 'max' \| 'count' \| (rows: T[]) => ReactNode` | — | Summary row cell. |
| `renderCell` | `(row: T, index: number) => ReactNode` | — | Custom cell content. |
| `renderHeader` | `(column: Column<T>) => ReactNode` | — | Custom header content (sort / filter icons stay). |
| `isMarked` | `boolean` | `false` | Highlight with the theme's marked colors. |
| `markedColor` | `string` | — | Highlight with a custom color. |
| `style` | `StyleProp<ViewStyle>` | — | Extra style for the column's cells. |
| `headerStyle` | `StyleProp<ViewStyle>` | — | Extra style for the header cell. |
