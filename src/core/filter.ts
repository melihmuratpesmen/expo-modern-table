import { Column, FilterConfig, FilterValue } from '../types';
import { includesSearch, normalizeSearchText } from '../utils/search';

function isPrimitive(value: unknown): value is string | number | boolean | bigint {
  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'boolean' || type === 'bigint';
}

function isActiveBound(bound: number | undefined): bound is number {
  return typeof bound === 'number' && Number.isFinite(bound);
}

/** A filter value that should not restrict anything (cleared / empty input). */
export function isEmptyFilterValue(value: FilterValue | null): boolean {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value === 'object') return !isActiveBound(value.min) && !isActiveBound(value.max);
  return false;
}

export function matchesFilter(
  cellValue: unknown,
  filterValue: FilterValue,
  config: FilterConfig | undefined
): boolean {
  if (isEmptyFilterValue(filterValue)) return true;

  switch (config?.type) {
    case 'text':
      return includesSearch(isPrimitive(cellValue) ? String(cellValue) : '', String(filterValue));
    case 'select':
      return cellValue !== null && cellValue !== undefined && String(cellValue) === filterValue;
    case 'boolean':
      return Boolean(cellValue) === (filterValue === true || filterValue === 'true');
    case 'number-range': {
      if (typeof filterValue !== 'object') return true;
      // Number(null) and Number('') are 0 — blank cells must not satisfy a range.
      const num = Number(cellValue);
      if (cellValue === null || cellValue === '' || !Number.isFinite(num)) return false;
      if (isActiveBound(filterValue.min) && num < filterValue.min) return false;
      if (isActiveBound(filterValue.max) && num > filterValue.max) return false;
      return true;
    }
    default:
      return true;
  }
}

export function filterRows<T>(
  rows: readonly T[],
  filters: Record<string, FilterValue>,
  columns: readonly Column<T>[]
): T[] {
  const active = Object.entries(filters).filter(([, value]) => !isEmptyFilterValue(value));
  if (active.length === 0) return [...rows];

  const configs = active.map(([key, value]) => ({
    key: key as keyof T,
    value,
    config: columns.find(c => c.key === key)?.filterConfig,
  }));

  return rows.filter(row => configs.every(f => matchesFilter(row[f.key], f.value, f.config)));
}

/** Joins normalized fields; never produced by `normalizeSearchText` for typed queries. */
const FIELD_SEPARATOR = '\u0000';

/**
 * Pre-normalizes the searchable text of every row, so each keystroke is a plain substring
 * check instead of re-normalizing every field. Rebuild when rows or keys change.
 */
export function buildSearchIndex<T>(rows: readonly T[], keys: readonly string[]): string[] {
  return rows.map(row =>
    keys
      .map(key => {
        const value = row[key as keyof T];
        return isPrimitive(value) ? normalizeSearchText(String(value)) : '';
      })
      .join(FIELD_SEPARATOR)
  );
}

/**
 * Global search over the given column keys. Only primitive cell values are searched —
 * objects, arrays and functions are skipped. Pass an index from `buildSearchIndex` (built
 * from the same rows and keys) to avoid normalizing fields on every call.
 */
export function searchRows<T>(
  rows: readonly T[],
  query: string,
  keys: readonly string[],
  index?: readonly string[]
): T[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [...rows];

  if (index) return rows.filter((_, i) => index[i].includes(normalizedQuery));

  return rows.filter(row =>
    keys.some(key => {
      const value = row[key as keyof T];
      return isPrimitive(value) && normalizeSearchText(String(value)).includes(normalizedQuery);
    })
  );
}
