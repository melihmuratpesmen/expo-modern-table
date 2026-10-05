# Known issues & consumer checklist

## iOS: rows appear missing after rapid sort

### Symptom
On iOS, after repeated header sorts (especially after switching datasets/tabs), some rows can look missing. Android is usually fine.

### Root causes
0. **FlashList v2 content anchoring** — v2 enables `maintainVisibleContentPosition` by default and
   keeps the first visible row in place when data changes, so after a sort or row move the rows
   above it are scrolled out of view and look missing. `ModernTable` disables it since `0.5.0`
   (found while testing row reorder on an iOS simulator); this is the most likely cause of the
   reports below with FlashList v2.
1. **Unstable row ids** — index-based ids (`row-${index}`) break FlashList recycling when order changes.
2. **Shared sort state across datasets** — tabs sharing the same `sortColumn` / `sortDirection` cause bleed.
3. **iOS recycle sensitivity** — rapid order changes can leave stale recycled cells.

### Library mitigation
`ModernTable` remounts the iOS `FlashList` when `sortColumn` or `sortDirection` change (`key`), which also scrolls the list back to the top. Since `0.5.0` column reordering no longer remounts it.

### Consumer checklist
- Use **stable ids** (never index-based).
- Isolate sort state per dataset/tab.
- Keep data arrays immutable when sorting/filtering.
- Optionally reset sort on tab change.
