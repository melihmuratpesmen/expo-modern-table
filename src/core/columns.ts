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
