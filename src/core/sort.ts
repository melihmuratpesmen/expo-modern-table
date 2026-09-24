import { SortDirection } from '../types';

export interface SortState {
  key: string;
  direction: SortDirection;
}

/** Header press cycle: none → asc → desc → none. Pressing another column starts at asc. */
export function nextSortDirection(
  currentKey: string | undefined,
  currentDirection: SortDirection | undefined,
  pressedKey: string
): SortDirection {
  if (currentKey !== pressedKey || !currentDirection) return 'asc';
  if (currentDirection === 'asc') return 'desc';
  return null;
}

const defaultCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Ascending comparison for cell values.
 *
 * Numbers (and numeric strings) compare numerically, dates by time, booleans false → true,
 * everything else with a locale-aware collator. Blank values (null / undefined / '') are
 * not handled here — `sortRows` always puts them last.
 */
export function compareValues(
  a: unknown,
  b: unknown,
  collator: Intl.Collator = defaultCollator
): number {
  const numA = toNumber(a);
  const numB = toNumber(b);
  if (numA !== null && numB !== null) return numA - numB;

  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);

  return collator.compare(String(a), String(b));
}

/** Returns a new, stably sorted array. Blank values always sort last, in either direction. */
export function sortRows<T>(
  rows: readonly T[],
  sort: SortState,
  collator: Intl.Collator = defaultCollator
): T[] {
  const result = [...rows];
  if (!sort.key || sort.direction === null) return result;

  const key = sort.key as keyof T;
  const factor = sort.direction === 'asc' ? 1 : -1;

  return result.sort((rowA, rowB) => {
    const a = rowA[key];
    const b = rowB[key];
    const blankA = isBlank(a);
    const blankB = isBlank(b);
    if (blankA || blankB) return blankA === blankB ? 0 : blankA ? 1 : -1;
    return compareValues(a, b, collator) * factor;
  });
}
