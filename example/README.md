# Example app

Expo playground for developing and trying `expo-modern-table`.

## Run

```bash
# from repo root
npm run example

# or
cd example
npm start
```

Then press `i` / `a` / `w` for iOS simulator, Android emulator, or web.

## What it demos

- `useTable` + `getTableProps()`
- Search, sort, column filters, pagination
- Selection, density, column visibility / sticky
- Column & row reorder
- Inline edit (`average`)
- Light / dark theme toggle
- Row grouping by `group`

Library source is linked via `"expo-modern-table": "file:.."`. Metro watches the parent package, so edits under `../src` hot-reload.
