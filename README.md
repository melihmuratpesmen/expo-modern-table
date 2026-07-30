# expo-modern-table

A modern, feature-rich data table for **Expo** and **React Native**.

> Extracted from production use in [MyExamy](https://myexamy.com). Early `0.x` — API may evolve.

## Features

- Horizontal sticky columns + sticky selection column
- Column sorting, filtering (text / select / boolean / number-range)
- Global search with Turkish-aware normalization
- Row selection (single / all)
- Column visibility + sticky toggles via toolbar
- Column reorder & row reorder (drag)
- Density modes: compact / standard / comfortable
- Light / dark themes + `themeConfig` overrides
- Custom fonts via theme (`fontFamily`)
- Pagination UI
- Inline cell editing
- Row grouping visual styles
- i18n via `translations` prop
- Built on [`@shopify/flash-list`](https://shopify.github.io/flash-list/)

## Install

```bash
npx expo install expo-modern-table @shopify/flash-list react-native-gesture-handler react-native-reanimated react-native-svg
npm install lucide-react-native
```

Optional (toolbar fullscreen / landscape lock):

```bash
npx expo install expo-screen-orientation
```

Make sure `GestureHandlerRootView` wraps your app and Reanimated babel plugin is enabled.

## Quick start

```tsx
import { ModernTable, useTable, Column } from 'expo-modern-table';

type Row = { id: string; name: string; score: number };

const columns: Column<Row>[] = [
  { key: 'name', title: 'Name', width: 160 },
  { key: 'score', title: 'Score', width: 100, align: 'right' },
];

export function ScoresTable({ data }: { data: Row[] }) {
  const table = useTable(data, columns, 20);

  return (
    <ModernTable
      data={table.paginatedData}
      columns={columns}
      searchQuery={table.searchQuery}
      onSearchChange={table.setSearchQuery}
      sortColumn={table.sortConfig.key as string}
      sortDirection={table.sortConfig.direction}
      onSort={(key) => table.handleSort(key as keyof Row)}
      density={table.density}
      onDensityChange={table.setDensity}
      visibleColumns={table.visibleColumns}
      onToggleColumn={table.toggleColumnVisibility}
      enableSelection
      selectedIds={table.selectedIds}
      onToggleOne={table.toggleSelection}
      onToggleAll={table.toggleAllSelection}
      isAllSelected={table.isAllSelected}
      pagination={{
        currentPage: table.currentPage,
        totalPages: table.totalPages,
        itemsPerPage: table.itemsPerPage,
        onPageChange: table.setCurrentPage,
        itemsPerPageOptions: [10, 20, 50],
        onItemsPerPageChange: table.setItemsPerPage,
      }}
    />
  );
}
```

## Theming

```tsx
<ModernTable
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
  // ...
/>
```

## Peer dependencies

| Package | Required |
|---------|----------|
| `react` / `react-native` | yes |
| `@shopify/flash-list` | yes |
| `react-native-gesture-handler` | yes |
| `react-native-reanimated` | yes |
| `react-native-svg` | yes (for lucide icons) |
| `lucide-react-native` | yes |
| `expo-screen-orientation` | optional |

## Status

This is the **extract** phase: source lifted from MyExamy mobile, app-specific imports removed, package scaffolding in place.

Next: API polish, example Expo app, docs site, npm publish.

## License

MIT
