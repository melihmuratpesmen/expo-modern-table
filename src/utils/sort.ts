import { SortDirection } from '../types';

export function nextSortDirection(
  currentColumn: string | undefined,
  currentDirection: SortDirection | undefined,
  pressedKey: string,
  enableSortClear: boolean = true
): SortDirection {
  if (currentColumn !== pressedKey || !currentDirection) return 'asc';
  if (currentDirection === 'asc') return 'desc';
  return enableSortClear ? null : 'asc';
}

export function isNumericValue(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false;
  return !Number.isNaN(Number(value));
}

export function compareTableValues(a: unknown, b: unknown, direction: 'asc' | 'desc'): number {
  const sign = direction === 'asc' ? 1 : -1;

  if (isNumericValue(a) && isNumericValue(b)) {
    const numA = Number(a);
    const numB = Number(b);
    if (numA < numB) return -1 * sign;
    if (numA > numB) return 1 * sign;
    return 0;
  }

  if (a == null && b == null) return 0;
  if (a == null) return -1 * sign;
  if (b == null) return 1 * sign;

  if (a < b) return -1 * sign;
  if (a > b) return 1 * sign;
  return 0;
}

export function sortRows<T>(
  data: T[],
  key: string,
  direction: SortDirection
): T[] {
  if (!key || !direction) return data;
  const items = [...data];
  items.sort((a, b) =>
    compareTableValues(a[key as keyof T], b[key as keyof T], direction)
  );
  return items;
}
