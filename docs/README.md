# Documentation

Guides and reference for `expo-modern-table`. Start here, then jump to the piece you need.

## Guides

| Guide | Description |
|-------|-------------|
| [Root README](../README.md) | Install, quick start, features, theming |
| [Example app](../example/README.md) | Run the Expo Go playground (SDK 54) |
| [Known issues](./KNOWN_ISSUES.md) | iOS FlashList / sort consumer checklist |
| [Deferred API](./DEFERRED.md) | Removed props, half-finished areas, roadmap |

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
   │  semi-owns: selectionMode · columnOrder (unless controlled)
```

## When to add a docs site

Stay with this `docs/` folder while the surface is small. Consider Docusaurus / Nextra / Expo Docs-style hosting when you need:

- Versioned API pages
- Searchable multi-page guides
- Interactive playground beyond the Expo example

Until then, GitHub + npm README remain the primary surface.
