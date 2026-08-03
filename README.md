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
      <img src="docs/media/demo.gif" alt="Desktop-style preview: light, filter, dark" width="100%" />
      <br />
      <sub>Preview · light / filter / dark</sub>
    </td>
    <td width="38%" align="center" valign="top">
      <img src="docs/media/demo-mobile.gif" alt="Mobile Expo Go preview" width="72%" />
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

Works with **Expo** and **bare React Native**. Optional `expo-screen-orientation` only powers the fullscreen toolbar action.

---

## Features

| Area | Capabilities |
|------|----------------|
| **Layout** | Horizontal scroll, sticky columns, sticky selection column, row grouping styles |
| **Data ops** | Sort (`asc` → `desc` → clear), global search, column filters (text / select / boolean / range) |
| **Selection** | Single-row toggle, select-all on page, selection count in toolbar |
| **Columns** | Show/hide, pin/unpin sticky, drag reorder |
| **Rows** | Drag reorder, inline cell edit, `onRowPress` |
| **UX** | Density (`compact` / `standard` / `comfortable`), pagination UI, empty state |
| **Design** | Light / dark themes, `themeConfig` overrides, custom `fontFamily` |
| **i18n** | Full `translations` map (search, filter, pagination, empty, …) |
| **Perf** | FlashList recycling + iOS sort remount safeguards |

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

**Required app setup**

1. Wrap the app in `GestureHandlerRootView`
2. Enable the Reanimated Babel plugin

### Peer dependencies

| Package | Required |
|---------|----------|
| `react`, `react-native` | Yes |
| `@shopify/flash-list` | Yes |
| `react-native-gesture-handler` | Yes |
| `react-native-reanimated` | Yes |
| `react-native-svg` | Yes |
| `lucide-react-native` | Yes |
| `expo-screen-orientation` | Optional |

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

### State ownership

| Concern | Owner |
|---------|--------|
| Search, sort, filters, selection, density, visible/sticky columns, pagination | `useTable` (or your own controlled props) |
| `selectionMode`, `columnOrder` | Semi-controlled — pass props to control, otherwise internal |
| Cell editing, open filter modal | Always internal to `ModernTable` |

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
| `normalizeSearchText` / `includesSearch` | Search helpers |

Toolbar, drag handles, checkbox, and filter modal are **internal** (not part of the stable public surface).

### Column essentials

```ts
type Column<T> = {
  key: string;
  title: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  isSticky?: boolean;
  hidden?: boolean;
  editable?: boolean;
  renderCell?: (item: T, index: number) => React.ReactNode;
  filterConfig?: {
    type: 'text' | 'select' | 'boolean' | 'number-range';
    options?: string[];
  };
};
```

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
| npm | [`expo-modern-table@0.1.0`](https://www.npmjs.com/package/expo-modern-table) |
| Stability | Early `0.x` — prefer additive changes; breaking changes possible before `1.0` |
| Example | Expo Go **SDK 54** (current App Store Expo Go) |

---

## License

[MIT](./LICENSE) © [melihmuratpesmen](https://github.com/melihmuratpesmen)
