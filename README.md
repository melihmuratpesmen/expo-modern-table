# expo-modern-table

Performance-minded data tables for **Expo** and **React Native**.

[![npm](https://img.shields.io/npm/v/expo-modern-table.svg?color=4f46e5)](https://www.npmjs.com/package/expo-modern-table)
[![downloads](https://img.shields.io/npm/dm/expo-modern-table.svg)](https://www.npmjs.com/package/expo-modern-table)
[![license](https://img.shields.io/npm/l/expo-modern-table.svg)](./LICENSE)
[![Expo Go](https://img.shields.io/badge/Expo%20Go-SDK%2054-000020?logo=expo)](./example/README.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6?logo=typescript&logoColor=white)](./src/types.ts)

Built on [`@shopify/flash-list`](https://shopify.github.io/flash-list/). Battle-tested in production at [MyExamy](https://myexamy.com).  
`0.x` — public API may evolve; see [changelog intent](#status).

<br />

<table>
  <tr>
    <td width="62%" align="center" valign="top">
      <img src="https://raw.githubusercontent.com/melihmuratpesmen/expo-modern-table/main/docs/media/demo.gif" alt="Desktop-style preview: light, filter, dark" width="100%" />
      <br />
      <sub>Preview · light / filter / dark</sub>
    </td>
    <td width="38%" align="center" valign="top">
      <img src="https://raw.githubusercontent.com/melihmuratpesmen/expo-modern-table/main/docs/media/demo-mobile.gif" alt="Mobile Expo Go preview" width="72%" />
      <br />
      <sub>Mobile · Expo Go</sub>
    </td>
  </tr>
</table>

<p align="center">
  <a href="#installation"><b>Install</b></a> ·
  <a href="#quick-start"><b>Quick start</b></a> ·
  <a href="#features"><b>Features</b></a> ·
  <a href="#api-overview"><b>API</b></a> ·
  <a href="./docs/README.md"><b>Docs</b></a> ·
  <a href="./example/README.md"><b>Example</b></a>
</p>

---

## Why this library

Most RN tables are either too minimal or too web-centric. `expo-modern-table` focuses on **mobile-first data work**: sticky columns, toolbar controls, client-side filter/sort/paginate via `useTable`, and theming that fits Expo apps — without locking you into Expo-only APIs.

Works with **Expo** and **bare React Native**. The package never imports `expo-screen-orientation` itself — pass it via `screenOrientation` to enable the fullscreen toolbar action.

---

## Features

| Area | Capabilities |
|------|----------------|
| **Layout** | Horizontal scroll, sticky columns, sticky selection column, row grouping styles, `flex` / min / max widths |
| **Data ops** | Locale-aware sort (`asc` → `desc` → clear, custom `sortFn`), Turkish-aware global search, column filters (text / select / boolean / range), computed columns (`getValue`) |
| **Server data** | `manual` mode with debounced search, `rowCount`, `table.state` for fetching |
| **Selection** | Row toggle, select-all (page or filtered), partial-selection header, bulk-action bar |
| **Columns** | Show/hide, pin/unpin sticky, drag reorder, drag resize, custom headers |
| **Rows** | Drag reorder, inline cell edit, `onRowPress`, `getRowId` |
| **UX** | Density, pagination, loading / error / empty states, pull to refresh, infinite scroll |
| **Design** | Light / dark themes, `themeConfig` overrides, custom `fontFamily`, replaceable icons |
| **i18n** | Full `translations` map (search, filter, pagination, empty, loading, …) |
| **Perf** | Memoized rows, shared sticky animations, indexed search, FlashList recycling |

---

## Installation

```bash
npx expo install expo-modern-table @shopify/flash-list react-native-gesture-handler react-native-reanimated react-native-svg
npm install lucide-react-native
```

**Optional** (toolbar landscape / fullscreen):

```bash
npx expo install expo-screen-orientation
```

```tsx
import * as ScreenOrientation from 'expo-screen-orientation';

<ModernTable screenOrientation={ScreenOrientation} onFullscreenChange={setFullscreen} … />
```

The previous orientation lock is restored when leaving fullscreen or when the table unmounts.

**Required app setup**

1. Wrap the app in `GestureHandlerRootView`
2. Enable the Reanimated Babel plugin

### Peer dependencies

| Package | Required | Tested with |
|---------|----------|-------------|
| `react`, `react-native` | Yes | React 19.1 · RN 0.81 (Expo SDK 54) |
| `@shopify/flash-list` | Yes — v1 (`>=1.6`) or v2 | 2.x |
| `react-native-gesture-handler` | Yes | 2.28 |
| `react-native-reanimated` | Yes | 4.1 |
| `lucide-react-native` | Yes (icons) | 0.556 |
| `react-native-svg` | Yes, via `lucide-react-native` | 15.12 |
| `expo-screen-orientation` | No — only if you pass `screenOrientation` | 9.0 |

### Jest

The package ships ES modules (`lib/module`). If your Jest setup does not already transform
React Native packages from `node_modules`, add `expo-modern-table` to `transformIgnorePatterns`
(`jest-expo` and the `react-native` preset need the same for `lucide-react-native`,
`react-native-reanimated`, etc.).

---

## Quick start

`useTable` owns client-side state. `ModernTable` is presentational — spread `getTableProps()` and pass `columns`.

```tsx
import { ModernTable, useTable, type Column } from 'expo-modern-table';

type Row = { id: string; name: string; score: number };

const columns: Column<Row>[] = [
  { key: 'name', title: 'Name', width: 160, isSticky: true },
  { key: 'score', title: 'Score', width: 100, align: 'right' },
];

export function ScoresTable({ data }: { data: Row[] }) {
  const table = useTable(data, columns, 20);

  return <ModernTable columns={columns} {...table.getTableProps()} />;
}
```

### `useTable` options

The third argument is a page size (`useTable(data, columns, 20)`) or an options object:

```tsx
const table = useTable(data, columns, {
  pageSize: 20,
  pageSizeOptions: [20, 50, 100],
  initialState: { sort: { key: 'score', direction: 'desc' } },
  locale: 'tr', // collation for sorting text
  selectAllScope: 'filtered', // or 'page' (default)
  getRowId: row => row.studentNo, // when rows have no `id`
});
```

Rows need an `id` field or a `getRowId` — TypeScript enforces this for both `useTable` and
`ModernTable`. Memoize `getRowId` and `columns` (a new function / array re-renders every row).

### Server-side data

With `manual: true` the hook stops sorting, filtering and paginating — `data` is the page your
API returned — and only manages state. Fetch whenever `table.state` changes (search is debounced
300 ms by default):

```tsx
const [page, setPage] = useState<{ rows: Row[]; total: number }>({ rows: [], total: 0 });
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string>();

const table = useTable(page.rows, columns, { manual: true, rowCount: page.total });

useEffect(() => {
  let cancelled = false;
  setLoading(true);
  fetchStudents(table.state) // { searchQuery, sort, filters, page, pageSize }
    .then(res => !cancelled && setPage(res))
    .catch(e => !cancelled && setError(String(e)))
    .finally(() => !cancelled && setLoading(false));
  return () => {
    cancelled = true;
  };
}, [table.state]);

<ModernTable
  columns={columns}
  {...table.getTableProps()}
  isLoading={loading}
  error={error}
  onRetry={() => setError(undefined)}
/>;
```

Without `rowCount`, "next page" stays enabled while the API returns full pages. For infinite
scroll use `pagination: false` with `onEndReached` / `isLoadingMore`.

### Loading, error, empty, refresh

| Prop | Behaviour |
|------|-----------|
| `isLoading` | Spinner instead of the empty state; dims existing rows while refetching |
| `isLoadingMore` | Spinner below the rows |
| `error` / `onRetry` | Replaces the rows; a string (or `true`) uses the built-in view with a retry button |
| `emptyComponent` | Replaces the built-in "No data found." |
| `refreshing` / `onRefresh` | Pull to refresh |
| `onEndReached` / `onEndReachedThreshold` | Infinite scroll |

### State ownership

| Concern | Owner |
|---------|--------|
| Search, sort, filters, selection, density, visible/sticky columns, column order and widths, pagination | `useTable` (or your own controlled props) |
| `selectionMode`, `expandedIds`, and `columnOrder` / `columnWidths` without `useTable` | Semi-controlled — pass props to control, otherwise internal |
| Cell editing, open filter modal | Always internal to `ModernTable` |

If you pass your own `onColumnReorder` / `onColumnResize` after spreading `getTableProps()`,
call `table.setColumnOrder` / `table.setColumnWidth` from them — or use `onPreferencesChange`.

### Summary row

```tsx
const columns: Column<Row>[] = [
  { key: 'name', title: 'Subject', footer: () => 'Total' },
  { key: 'net', title: 'Net', footer: 'sum' }, // 'sum' | 'avg' | 'min' | 'max' | 'count' | (rows) => node
];
```

With `useTable` the footer covers every row matching the filters (`footerData`), not just the
current page. In `manual` mode only the current page is on the device, so built-in aggregations
would cover that page alone — show totals from your API with a function footer instead:
`footer: () => formatNumber(response.totals.net)`.

### Expandable rows

```tsx
<ModernTable
  columns={columns}
  {...table.getTableProps()}
  renderExpandedRow={row => <StudentDetails student={row} />}
  // optional: expandedIds / onToggleExpand to control which rows are open
/>
```

### Export to CSV

```tsx
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const csv = table.getCsv({ delimiter: ';', bom: true }); // Excel-friendly for tr / European locales
const uri = FileSystem.cacheDirectory + 'students.csv';
await FileSystem.writeAsStringAsync(uri, csv);
await Sharing.shareAsync(uri, { mimeType: 'text/csv' });
```

`getCsv({ rows })` exports `'filtered'` (default), `'page'`, `'selected'` or `'all'` rows with the
visible columns in on-screen order. Text that looks like a spreadsheet formula is escaped.
`toCsv(rows, columns, options)` is exported for use without `useTable`.

### Persisting layout

```tsx
const table = useTable(data, columns, {
  onPreferencesChange: prefs => AsyncStorage.setItem('students-table', JSON.stringify(prefs)),
});

useEffect(() => {
  AsyncStorage.getItem('students-table').then(saved => {
    if (saved) table.setPreferences(JSON.parse(saved));
  });
}, []);
```

Preferences cover column visibility and pinning, order, widths, density and page size. Columns
added in a later version of your app still appear with their defaults.

---

## API overview

### Public exports

| Export | Role |
|--------|------|
| `ModernTable` | Table UI |
| `useTable` | State + `getTableProps()` |
| `useTableTheme` | Resolve light/dark + overrides |
| `lightTheme` / `darkTheme` / `defaultFontFamily` | Theme tokens |
| `Column`, `ModernTableProps`, `FilterConfig`, … | Types |
| `DEFAULT_TRANSLATIONS` / `TR_TRANSLATIONS` | English / Turkish strings |
| `defaultIcons`, `TableIcons` | Built-in icon set, for `icons` overrides |
| `toCsv` | CSV export without `useTable` |
| `normalizeSearchText` / `includesSearch` | Search helpers |
| `sortRows`, `filterRows`, `searchRows`, `paginateRows`, … | The data helpers `useTable` uses, for custom pipelines or API mocks |

Toolbar, drag handles, checkbox, and filter modal are **internal** (not part of the stable public surface).

### Column essentials

```ts
type Column<T> = {
  key: string;
  title: string;
  width?: number; // default 100; starting width of a flex column
  flex?: number; // share of leftover width
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  isSticky?: boolean;
  hidden?: boolean;
  getValue?: (row: T) => unknown; // computed / nested value for sort, filter, search, text
  sortable?: boolean; // default true
  sortFn?: (a: T, b: T) => number;
  searchable?: boolean; // default true
  resizable?: boolean; // default true (with enableColumnResize)
  editable?: boolean; // needs onRowChange; numbers stay numbers
  renderHeader?: (column: Column<T>) => React.ReactNode;
  renderCell?: (item: T, index: number) => React.ReactNode;
  filterConfig?: {
    type: 'text' | 'select' | 'boolean' | 'number-range';
    options?: string[];
  };
};
```

### Toolbar, bulk actions, resize, icons

```tsx
<ModernTable
  columns={columns}
  {...table.getTableProps()}
  enableColumnResize // drag a header's right edge; controlled via columnWidths / onColumnResize
  toolbarActions={<ExportButton />}
  renderBulkActions={ids => <DeleteButton ids={ids} />} // replaces the toolbar while rows are selected
  icons={{ search: MySearchIcon }} // any slot of TableIcons; lucide by default
/>
```

Each toolbar control appears when its handler is passed (`onSearchChange`, `onDensityChange`,
`onToggleColumn`, …); `showToolbar={false}` hides the toolbar entirely.

Deeper notes: [`docs/README.md`](./docs/README.md) · deferred / removed props: [`docs/DEFERRED.md`](./docs/DEFERRED.md)

---

## Theming & i18n

```tsx
<ModernTable
  columns={columns}
  {...table.getTableProps()}
  theme="dark"
  themeConfig={{
    primary: '#0ea5e9',
    fontFamily: {
      regular: 'Poppins_400Regular',
      medium: 'Poppins_500Medium',
      semibold: 'Poppins_600SemiBold',
      bold: 'Poppins_700Bold',
    },
  }}
  translations={{
    searchPlaceholder: 'Search…',
    empty: 'No rows yet',
    page: 'Page',
  }}
/>
```

Turkish: `translations={TR_TRANSLATIONS}` (or spread it and override a few keys). Sorting follows
the device locale unless `useTable` gets `locale: 'tr'`; search always folds Turkish letters
(`İ/I/ı/i`, `ş/s`, …).

### Accessibility

Sort headers announce their direction, checkboxes report checked / mixed, drag handles, expand
buttons, toolbar and pagination buttons have labels (all translatable), and column widths can be
changed with screen-reader increment / decrement.

### Web

Works with `react-native-web` (the example runs with `npm run example:web`). Row and column
drag-reordering depend on gesture-handler's web support.

---

## Example app

Try the playground on a phone with **Expo Go (SDK 54)**:

```bash
git clone https://github.com/melihmuratpesmen/expo-modern-table.git
cd expo-modern-table
npm run example:go          # QR is in the terminal (not localhost)
# or: npm run example:tunnel
```

Details: [`example/README.md`](./example/README.md)

---

## Documentation

| Doc | Contents |
|-----|----------|
| [`docs/README.md`](./docs/README.md) | Documentation index |
| [`docs/DEFERRED.md`](./docs/DEFERRED.md) | Removed / planned APIs |
| [`docs/KNOWN_ISSUES.md`](./docs/KNOWN_ISSUES.md) | iOS sort / FlashList notes |
| [`example/README.md`](./example/README.md) | Expo Go testing guide |

A dedicated docs site (Docusaurus / Nextra) is **not** required for `0.1.x`. When the API grows (remote pagination, column resize, etc.), we can promote `docs/` into a site without changing the package surface.

---

## Status

| | |
|--|--|
| npm | [`expo-modern-table`](https://www.npmjs.com/package/expo-modern-table) — see [CHANGELOG](./CHANGELOG.md) |
| Stability | Early `0.x` — prefer additive changes; breaking changes possible before `1.0` |
| Example | Expo Go **SDK 54** (current App Store Expo Go) |

---

## License

[MIT](./LICENSE) © [melihmuratpesmen](https://github.com/melihmuratpesmen)
