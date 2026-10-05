<p align="center">
  <a href="https://melihmuratpesmen.github.io/expo-modern-table/">
    <img src="https://raw.githubusercontent.com/melihmuratpesmen/expo-modern-table/main/docs/brand/logo.svg" alt="" width="72" height="72" />
  </a>
</p>

<h1 align="center">expo-modern-table</h1>

<p align="center">
  <b>Serious data tables, built for mobile.</b><br />
  Pinned columns, sorting, filters, server-side paging, selection and inline editing<br />
  for <b>Expo</b> and <b>React Native</b> — on iOS, Android and the web.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/expo-modern-table"><img src="https://img.shields.io/npm/v/expo-modern-table.svg?color=4f46e5&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/expo-modern-table"><img src="https://img.shields.io/npm/dm/expo-modern-table.svg?color=8b5cf6" alt="downloads" /></a>
  <a href="https://github.com/melihmuratpesmen/expo-modern-table/actions/workflows/ci.yml"><img src="https://github.com/melihmuratpesmen/expo-modern-table/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <img src="https://img.shields.io/badge/platforms-iOS%20%7C%20Android%20%7C%20Web-0f172a" alt="iOS, Android, Web" />
  <img src="https://img.shields.io/badge/Expo%20Go-ready-000020?logo=expo" alt="Expo Go ready" />
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/expo-modern-table.svg?color=0f172a" alt="MIT license" /></a>
</p>

<p align="center">
  <a href="https://melihmuratpesmen.github.io/expo-modern-table/demo/"><b>Live demo</b></a> ·
  <a href="https://melihmuratpesmen.github.io/expo-modern-table/getting-started/introduction/"><b>Documentation</b></a> ·
  <a href="https://melihmuratpesmen.github.io/expo-modern-table/reference/modern-table/"><b>API</b></a> ·
  <a href="https://melihmuratpesmen.github.io/expo-modern-table/comparison/"><b>Comparison</b></a> ·
  <a href="./example/README.md"><b>Example app</b></a>
</p>

<p align="center">
  <a href="https://melihmuratpesmen.github.io/expo-modern-table/demo/">
    <img src="https://raw.githubusercontent.com/melihmuratpesmen/expo-modern-table/main/docs/media/hero.png" alt="expo-modern-table in the browser and on a phone: an orders table with selection and expandable rows, and a team directory in dark mode" width="100%" />
  </a>
</p>

---

## Why

Most React Native tables are either a few styled rows or a headless toolkit that leaves the UI,
gestures and virtualization to you. **expo-modern-table** is the whole table: a polished,
themeable component plus a `useTable` hook that handles search, sorting, filters, pagination and
selection — on the device, or through your API.

```tsx
const table = useTable(orders, columns, 20);

return <ModernTable columns={columns} {...table.getTableProps()} />;
```

<table>
  <tr>
    <td align="center" width="33%">
      <img src="https://raw.githubusercontent.com/melihmuratpesmen/expo-modern-table/main/docs/media/demo-orders.gif" alt="Selecting orders, expanding a row and scrolling past a pinned column on iOS" width="100%" /><br />
      <sub><b>Server-side orders</b><br />selection · bulk actions · expandable rows</sub>
    </td>
    <td align="center" width="33%">
      <img src="https://raw.githubusercontent.com/melihmuratpesmen/expo-modern-table/main/docs/media/demo-team.gif" alt="Resizing a column and dragging a row to reorder it on iOS" width="100%" /><br />
      <sub><b>Team directory</b><br />column resize · drag to reorder</sub>
    </td>
    <td align="center" width="33%">
      <img src="https://raw.githubusercontent.com/melihmuratpesmen/expo-modern-table/main/docs/media/demo-markets.gif" alt="Live prices flashing and re-sorting by 24 hour change on iOS" width="100%" /><br />
      <sub><b>Live markets</b><br />live updates · custom cells · summary row</sub>
    </td>
  </tr>
</table>

<p align="center"><sub>Recorded in Expo Go on an iPhone simulator. All data is generated; prices are simulated.</sub></p>

## Features

| | |
| --- | --- |
| **Layout** | Horizontal scrolling with sticky (pinned) columns · `flex` / min / max widths · drag to resize and reorder columns · show / hide · three densities |
| **Data** | Locale-aware sorting and custom comparators · accent- and Turkish-aware global search · text / select / boolean / range filters · computed columns |
| **Server-side** | `manual` mode: your API sorts, filters and pages; debounced search; `table.state` is a ready query key |
| **Rows** | Selection with select-all and a bulk-action bar · inline editing · drag to reorder · expandable detail rows · grouping · summary row |
| **States** | Loading, refetching, error-with-retry and empty states · pull to refresh · infinite scroll |
| **Design** | Light / dark themes · token overrides · custom fonts · replaceable icons · every string translatable (English + Turkish included) |
| **Quality** | FlashList virtualization · memoized rows · indexed search · accessibility roles and labels · TypeScript-first · 169 tests |
| **Extras** | CSV export · persistable layout preferences · fullscreen (landscape) button |

## Installation

```bash
npx expo install expo-modern-table @shopify/flash-list react-native-gesture-handler react-native-reanimated react-native-worklets react-native-svg lucide-react-native
```

Wrap your app in `GestureHandlerRootView` once. That's all for Expo — it runs in **Expo Go**,
no custom native code. Bare React Native apps also add the Reanimated / worklets Babel plugin.
→ [Installation guide](https://melihmuratpesmen.github.io/expo-modern-table/getting-started/installation/)

| Peer | Supported | Tested with |
| --- | --- | --- |
| `react`, `react-native` | `>=18`, `>=0.73` | React 19.2 · RN 0.86 (Expo SDK 57) |
| `@shopify/flash-list` | v1 (`>=1.6`) or v2 | 2.0 |
| `react-native-gesture-handler` | `>=2.14` | 2.32 |
| `react-native-reanimated` | `>=3.6` | 4.5 |
| `lucide-react-native` + `react-native-svg` | default icons, [replaceable](https://melihmuratpesmen.github.io/expo-modern-table/guides/theming/#icons) | 0.556 · 15.15 |
| `expo-screen-orientation` | optional — fullscreen button | 57 |

## Quick start

```tsx
import { ModernTable, useTable, type Column } from 'expo-modern-table';

type Order = { id: string; customer: string; status: string; total: number };

const columns: Column<Order>[] = [
  { key: 'id', title: 'Order', width: 100, isSticky: true },
  { key: 'customer', title: 'Customer', width: 200 },
  {
    key: 'status',
    title: 'Status',
    filterConfig: { type: 'select', options: ['paid', 'pending', 'refunded'] },
  },
  { key: 'total', title: 'Total', align: 'right', footer: 'sum' },
];

export function OrdersTable({ orders }: { orders: Order[] }) {
  const table = useTable(orders, columns, 20);

  return <ModernTable columns={columns} {...table.getTableProps()} />;
}
```

That's a searchable, sortable, filterable, paginated table with a pinned first column, row
selection, a column menu and a totals row. Add features with props:

```tsx
<ModernTable
  columns={columns}
  {...table.getTableProps()}
  theme="dark"
  enableColumnResize
  enableColumnReorder
  renderExpandedRow={order => <OrderDetails order={order} />}
  renderBulkActions={ids => <ExportButton ids={ids} />}
  onRowPress={order => router.push(`/orders/${order.id}`)}
/>
```

### Server-side data

```tsx
const table = useTable(page.rows, columns, { manual: true, rowCount: page.total });

const query = useQuery({
  queryKey: ['orders', table.state], // { searchQuery, sort, filters, page, pageSize }
  queryFn: () => fetchOrders(table.state),
});
```

Recipes: [TanStack Query](https://melihmuratpesmen.github.io/expo-modern-table/recipes/tanstack-query/) ·
[Supabase](https://melihmuratpesmen.github.io/expo-modern-table/recipes/supabase/) ·
[Persist layout](https://melihmuratpesmen.github.io/expo-modern-table/recipes/persist-layout/) ·
[CSV export & sharing](https://melihmuratpesmen.github.io/expo-modern-table/recipes/csv-export/) ·
[Custom cells](https://melihmuratpesmen.github.io/expo-modern-table/recipes/custom-cells/)

## How it compares

| | expo-modern-table | Paper `DataTable` | TanStack Table |
| --- | :---: | :---: | :---: |
| Ready-made, themed UI | ✅ | ✅ | — (headless) |
| Virtualized rows | ✅ FlashList | — | build it |
| Sticky / pinned columns | ✅ | — | logic only |
| Sorting, filters, search | ✅ | sort arrow only | logic only |
| Server-side mode | ✅ | build it | ✅ |
| Column resize & reorder | ✅ | — | logic only |
| Inline edit, row reorder | ✅ | — | build it |
| Expandable rows, summary row | ✅ | — | logic only |

Paper's DataTable is great for small static tables; TanStack Table is the pick for fully custom
designs and shared web logic. The [full comparison](https://melihmuratpesmen.github.io/expo-modern-table/comparison/)
says when to choose which.

## Documentation

**[melihmuratpesmen.github.io/expo-modern-table](https://melihmuratpesmen.github.io/expo-modern-table/)** —
guides for [useTable](https://melihmuratpesmen.github.io/expo-modern-table/guides/use-table/),
[columns](https://melihmuratpesmen.github.io/expo-modern-table/guides/columns/),
[server-side data](https://melihmuratpesmen.github.io/expo-modern-table/guides/server-side/),
[selection](https://melihmuratpesmen.github.io/expo-modern-table/guides/selection/),
[editing](https://melihmuratpesmen.github.io/expo-modern-table/guides/editing/),
[theming](https://melihmuratpesmen.github.io/expo-modern-table/guides/theming/),
[translations](https://melihmuratpesmen.github.io/expo-modern-table/guides/i18n/) and
[accessibility](https://melihmuratpesmen.github.io/expo-modern-table/guides/accessibility/), plus the
full [props](https://melihmuratpesmen.github.io/expo-modern-table/reference/modern-table/),
[column](https://melihmuratpesmen.github.io/expo-modern-table/reference/column/) and
[hook](https://melihmuratpesmen.github.io/expo-modern-table/reference/use-table/) reference.

## Try the example

The [live demo](https://melihmuratpesmen.github.io/expo-modern-table/demo/) is the example app
exported for the web. To run it on your phone with **Expo Go (SDK 57)**:

```bash
git clone https://github.com/melihmuratpesmen/expo-modern-table.git
cd expo-modern-table/example && npm install && npm run start:go
```

## Status

`0.x` — the API is settling; breaking changes are possible before `1.0` and always listed in the
[changelog](./CHANGELOG.md). Used in production at [MyExamy](https://myexamy.com). Removed and
planned APIs: [`docs/DEFERRED.md`](./docs/DEFERRED.md) · known issues:
[`docs/KNOWN_ISSUES.md`](./docs/KNOWN_ISSUES.md).

Issues and pull requests are welcome — especially translations for new languages.

## License

[MIT](./LICENSE) © [Melih Murat Peşmen](https://github.com/melihmuratpesmen)
