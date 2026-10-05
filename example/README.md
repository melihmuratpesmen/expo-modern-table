# expo-modern-table showcase (Expo SDK 57)

The example app is also the [live demo](https://melihmuratpesmen.github.io/expo-modern-table/demo/).
Three realistic scenarios, English / Turkish, light / dark:

| Scenario | What it shows |
|----------|---------------|
| **Orders** | 25,000 orders from a mock API in `manual` (server-side) mode: debounced search, sort and filters on the "server", pagination, bulk actions (mark shipped, CSV export), expandable line items, server totals in the summary row |
| **Team** | Client-side `useTable`: row grouping by department, inline editing, row reorder, column resize / reorder, avatar and progress cells, summary row with averages, bulk remove with undo |
| **Markets** | Simulated live prices: flashing price cells, sparklines, a sticky symbol column, a summary row that updates on every tick, editable holdings |

All demo data is generated (seeded) on the device. Market prices are simulated.

## Run it

Expo Go from the App Store / Play Store opens **SDK 57** projects.

```bash
git clone https://github.com/melihmuratpesmen/expo-modern-table.git
cd expo-modern-table/example
npm install
npm run start:go     # scan the QR code in the terminal with Expo Go
```

Other ways to open it:

| Command | Opens |
|---------|-------|
| `npm run ios` / `npm run android` | Simulator / emulator with Expo Go |
| `npm run web` | Browser |
| `npm run tunnel` | Expo Go on another network |

From the repository root: `npm run example:go` (port 8082), `npm run example:web`.

### Deep links on the web

`?scenario=orders|team|markets`, `&theme=light|dark`, `&lang=en|tr`, and `&embed=1` (hides the
descriptions — used for the docs site embed).

## How it's wired

- `expo-modern-table` resolves to `../src/index.ts` (see `metro.config.js`), so library edits
  hot-reload. Smoke-test the built package instead with `npm run build` in the root, then
  `EXAMPLE_USE_LIB=1 npm run start:go -- --clear`.
- Metro only resolves native packages from this folder's `node_modules`.
- `npm run export:web` builds the static web demo (tree-shaken). The docs workflow sets
  `EXPO_BASE_URL=/expo-modern-table/demo` so it can be served from GitHub Pages.

```text
App.tsx                 shell: brand bar, scenario tabs, EN/TR, theme
src/scenarios/          Orders (server-side), Team (client-side), Markets (live)
src/data/               seeded generators + the mock orders API
src/components/         Avatar, Badge, Sparkline, Segmented, Toast, Logo…
src/i18n.tsx            EN / TR strings and Intl formatters
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Project is incompatible with this version of Expo Go" | Update Expo Go — the example targets SDK 57 |
| QR / connection fails on Wi-Fi | `npm run tunnel` |
| Port busy | `npx expo start --go --port 8084` |
| Blank screen or red box after opening | Restart Metro with `--clear` |
