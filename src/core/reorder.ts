/**
 * Index an item lands on after being dragged by `translation` along a list of items with
 * the given sizes (widths for columns, heights for rows). The dragged item's center decides
 * the slot, so items of different sizes are handled correctly.
 */
export function getDropIndex(
  sizes: readonly number[],
  fromIndex: number,
  translation: number
): number {
  if (sizes.length === 0 || fromIndex < 0 || fromIndex >= sizes.length) return fromIndex;

  let start = 0;
  for (let i = 0; i < fromIndex; i++) start += sizes[i];
  const center = start + sizes[fromIndex] / 2 + translation;

  if (center < 0) return 0;
  let edge = 0;
  for (let i = 0; i < sizes.length; i++) {
    edge += sizes[i];
    if (center < edge) return i;
  }
  return sizes.length - 1;
}

/** Returns a copy of `items` with the element at `from` moved to `to`. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items];
  if (from === to || from < 0 || from >= next.length) return next;
  const [moved] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(next.length, to)), 0, moved);
  return next;
}
