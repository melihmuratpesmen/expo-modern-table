import { RowId } from '../types';

export type SelectionState = 'all' | 'some' | 'none';

export function toggleId(selected: ReadonlySet<RowId>, id: RowId): Set<RowId> {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/**
 * Select-all for a group of rows (e.g. the current page). If every id is already selected
 * they are all deselected; otherwise all are added. Ids outside the group are kept.
 */
export function toggleIds(selected: ReadonlySet<RowId>, ids: readonly RowId[]): Set<RowId> {
  const next = new Set(selected);
  if (ids.length === 0) return next;
  const allSelected = ids.every(id => next.has(id));
  for (const id of ids) {
    if (allSelected) next.delete(id);
    else next.add(id);
  }
  return next;
}

export function getSelectionState(
  selected: ReadonlySet<RowId>,
  ids: readonly RowId[]
): SelectionState {
  if (ids.length === 0) return 'none';
  let count = 0;
  for (const id of ids) if (selected.has(id)) count++;
  if (count === 0) return 'none';
  return count === ids.length ? 'all' : 'some';
}
