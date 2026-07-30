# Known issues & consumer checklist

## iOS: rows appear missing after rapid sort

### Symptom
On iOS, after repeated header sorts (especially after switching datasets/tabs), some rows can look missing. Android is usually fine.

### Root causes
1. **Unstable row ids** — index-based ids (`row-${index}`) break FlashList recycling when order changes.
2. **Shared sort state across datasets** — tabs sharing the same `sortColumn` / `sortDirection` cause bleed.
3. **iOS recycle sensitivity** — rapid order changes can leave stale recycled cells.

### Library mitigation
`ModernTable` remounts the iOS `FlashList` when `sortColumn`, `sortDirection`, or `columnOrder` change (`key` + `extraData`).

### Consumer checklist
- Use **stable ids** (never index-based).
- Isolate sort state per dataset/tab.
- Keep data arrays immutable when sorting/filtering.
- Optionally reset sort on tab change.
