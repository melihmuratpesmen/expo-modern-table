import { RowId } from '../types';

export function toggleSelectedId(selected: Set<RowId>, id: RowId): Set<RowId> {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function toggleSelectedIds(selected: Set<RowId>, poolIds: RowId[]): Set<RowId> {
  if (poolIds.length === 0) return selected;
  const allSelected = poolIds.every(id => selected.has(id));
  const next = new Set(selected);
  if (allSelected) {
    for (const id of poolIds) next.delete(id);
  } else {
    for (const id of poolIds) next.add(id);
  }
  return next;
}

export function isEveryIdSelected(selected: Set<RowId> | undefined, poolIds: RowId[]): boolean {
  if (!selected || poolIds.length === 0) return false;
  return poolIds.every(id => selected.has(id));
}

export function isSomeIdSelected(selected: Set<RowId> | undefined, poolIds: RowId[]): boolean {
  if (!selected || poolIds.length === 0) return false;
  return poolIds.some(id => selected.has(id));
}
