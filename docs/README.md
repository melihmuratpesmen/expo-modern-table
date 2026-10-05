# docs/

The documentation lives on the website:
**[melihmuratpesmen.github.io/expo-modern-table](https://melihmuratpesmen.github.io/expo-modern-table/)**
(source in [`website/`](../website), built with Astro Starlight and deployed by
[`.github/workflows/docs.yml`](../.github/workflows/docs.yml)).

This folder keeps the files that belong to the repository itself:

| File | Contents |
|------|----------|
| [`DEFERRED.md`](./DEFERRED.md) | Removed props, half-finished areas, roadmap |
| [`KNOWN_ISSUES.md`](./KNOWN_ISSUES.md) | iOS FlashList / sort consumer checklist |
| [`LAUNCH.md`](./LAUNCH.md) | Announcement copy (EN / TR) for Reddit, X, LinkedIn, dev.to, Discord |
| [`brand/`](./brand) | Logo (`logo.svg`, `logo-mono.svg`), colors, social preview image |
| [`media/`](./media) | README hero image and demo recordings (GIF + MP4) |

## Brand

| Token | Value | Use |
|-------|-------|-----|
| Indigo 600 | `#4F46E5` | Primary (matches the table's light theme `primary`) |
| Indigo 500 | `#6366F1` | Logo gradient start, dark theme `primary` |
| Violet 500 | `#8B5CF6` | Logo gradient end, accent |
| Ink | `#0B1020` | Dark backgrounds |
| Mist | `#EEF2FF` | Soft primary backgrounds |

Type: Inter (UI, headings), JetBrains Mono (code). The logo mark is a table: a header bar and a
pinned first column, with rows fading out to the right (horizontal scrolling).

`brand/social-preview.png` (1280×640) is the repository's social preview — upload it under
**Settings → General → Social preview**; GitHub has no API for it.

## Updating the media

Everything in `media/` is a real capture of the example app, not a mockup:

- **Screenshots** — the docs site build uses captures of the web demo
  (`website/src/assets/screens/`).
- **GIFs / MP4s** — `xcrun simctl io <device> recordVideo` of the example in Expo Go, cropped
  and with idle time shortened, then converted with ffmpeg (palette-optimized GIF, 720 px MP4).

## Mental model

```text
useTable(data, columns)
   │  owns: search · sort · filter · selection · density · columns · pagination
   ▼
getTableProps()
   │
   ▼
<ModernTable columns={columns} {...props} />
   │  owns: edit UI · filter modal
   │  semi-owns: selectionMode · columnOrder · expandedIds (unless controlled)
```
