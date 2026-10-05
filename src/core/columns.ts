/**
 * Brings a stored column order in line with the current column keys: keys that still exist
 * keep their relative order, new keys are appended. Returns `order` itself when nothing
 * changed so memoized consumers stay stable.
 */
export function reconcileOrder(order: readonly string[], keys: readonly string[]): string[] {
  const keySet = new Set(keys);
  const kept = order.filter(k => keySet.has(k));
  const keptSet = new Set(kept);
  const added = keys.filter(k => !keptSet.has(k));
  if (added.length === 0 && kept.length === order.length) return order as string[];
  return [...kept, ...added];
}

/**
 * Moves `fromKey` to where `toKey` is in the full order. Works on keys rather than indices
 * so hidden columns (present in `order` but not on screen) don't shift the target.
 */
export function moveKey(order: readonly string[], fromKey: string, toKey: string): string[] {
  const fromIndex = order.indexOf(fromKey);
  const toIndex = order.indexOf(toKey);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return [...order];

  const next = order.filter(k => k !== fromKey);
  const targetIndex = next.indexOf(toKey) + (fromIndex < toIndex ? 1 : 0);
  next.splice(targetIndex, 0, fromKey);
  return next;
}

export interface ColumnWidthSpec {
  key: string;
  width?: number;
  flex?: number;
  minWidth?: number;
  maxWidth?: number;
}

const clampWidth = (width: number, spec: ColumnWidthSpec) =>
  Math.min(Math.max(width, spec.minWidth ?? 0), spec.maxWidth ?? Infinity);

/**
 * Final column widths. Fixed columns use `width` (default `defaultWidth`); `flex` columns start
 * at `width ?? minWidth ?? defaultWidth` and share whatever is left of `availableWidth`
 * in proportion to `flex`, capped by `maxWidth`. A user-resized width (`overrides`) is always
 * fixed. Widths never shrink below their basis — wider tables scroll horizontally.
 */
export function resolveColumnWidths(
  columns: readonly ColumnWidthSpec[],
  availableWidth: number,
  overrides: Record<string, number> = {},
  defaultWidth = 100
): Map<string, number> {
  const widths = new Map<string, number>();
  let growing: ColumnWidthSpec[] = [];

  for (const col of columns) {
    const override = overrides[col.key];
    if (override !== undefined) {
      widths.set(col.key, clampWidth(override, col));
      continue;
    }
    const basis = col.flex
      ? (col.width ?? col.minWidth ?? defaultWidth)
      : col.width || defaultWidth;
    widths.set(col.key, clampWidth(basis, col));
    if (col.flex && col.flex > 0) growing.push(col);
  }

  let leftover = availableWidth;
  widths.forEach(width => (leftover -= width));

  // Distribute; a column that hits maxWidth is frozen and the rest is shared again.
  while (leftover >= 1 && growing.length > 0) {
    const totalFlex = growing.reduce((sum, col) => sum + (col.flex ?? 0), 0);
    const next: ColumnWidthSpec[] = [];
    let used = 0;
    for (const col of growing) {
      const current = widths.get(col.key) ?? 0;
      const share = Math.floor((leftover * (col.flex ?? 0)) / totalFlex);
      const target = clampWidth(current + share, col);
      used += target - current;
      widths.set(col.key, target);
      if (target === current + share && share > 0) next.push(col);
    }
    if (used < 1) break;
    leftover -= used;
    growing = next;
  }

  return widths;
}
