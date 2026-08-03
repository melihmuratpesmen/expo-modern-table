# Example app (Expo Go · SDK 54)

Playground for `expo-modern-table`. Targets **Expo SDK 54** so it opens in the current Expo Go store build.

No custom native modules — FlashList / Gesture Handler / Reanimated / SVG are all Expo Go compatible.

## Why `localhost` does not show a QR

`http://localhost:8082` is the Metro bundler. **QR code is in the terminal**, not that web page.

Use one of:

1. Terminal QR (best on the machine running Expo)
2. Expo Go → **Enter URL manually** → `exp://YOUR_LAN_IP:8082`
3. Same Wi‑Fi phone camera / Expo Go scan of the terminal QR
4. Different network → `npm run tunnel` (uses ngrok-style tunnel + QR)

## Run locally (you / contributors)

```bash
git clone https://github.com/melihmuratpesmen/expo-modern-table.git
cd expo-modern-table/example
npm install
npm run start:go
```

Then open with **Expo Go (SDK 54)** on the same Wi‑Fi.

From repo root:

```bash
npm run example:go
```

Tunnel (friend on another network):

```bash
cd example && npm run tunnel
```

## What other people need (checklist)

| Step | Detail |
|------|--------|
| 1. Expo Go | App Store / Play Store — must be **SDK 54** (project SDK) |
| 2. Node 20+ | To install & start Metro |
| 3. Clone + install | `git clone` → `cd example` → `npm install` |
| 4. Start | `npm run start:go` (or `npm run tunnel`) |
| 5. Open | Scan terminal QR, or enter `exp://…` URL in Expo Go |

They do **not** need Xcode/Android Studio for Expo Go.

Simulator (optional, macOS):

```bash
npm run ios
```

## Demo features

- `useTable` + `getTableProps()`
- Search, sort, filters, pagination, selection
- Column / row reorder, inline edit, light/dark, grouping

## Dev notes

- Linked via `"expo-modern-table": "file:.."`
- Metro watches `../src`, blocks `../node_modules`
- Library edits hot-reload in Expo Go

## Troubleshooting

| Problem | Fix |
|---------|-----|
| “Project is incompatible with this version of Expo Go” | Example is SDK **54**. Update Expo Go or don’t use a newer example SDK. |
| QR / connection fails on Wi‑Fi | `npm run tunnel` |
| Port busy (myexamy on 8081) | `npx expo start --go --port 8082` |
| Blank / red box after open | Shake device → Reload; or restart Metro with `-c` |
