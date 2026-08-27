import { Column, FilterValue } from '../types';
import { includesSearch } from './search';

export function matchesColumnFilter<T>(
  item: T,
  key: string,
  filterValue: FilterValue,
  columns: Column<T>[]
): boolean {
  if (filterValue === undefined || filterValue === '') return true;

  const itemValue = item[key as keyof T];
  const colConfig = columns.find(c => c.key === key)?.filterConfig;

  switch (colConfig?.type) {
    case 'text':
      return includesSearch(String(itemValue ?? ''), String(filterValue));
    case 'select':
      return itemValue === filterValue;
    case 'boolean':
      return Boolean(itemValue) === (filterValue === true || filterValue === 'true');
    case 'number-range': {
      const range = filterValue as { min?: number; max?: number };
      const numVal = Number(itemValue);
      if (Number.isNaN(numVal)) return false;
      if (range.min !== undefined && numVal < range.min) return false;
      if (range.max !== undefined && numVal > range.max) return false;
      return true;
    }
    default:
      return true;
  }
}

export function applyFilters<T>(
  data: T[],
  filters: Record<string, FilterValue> | undefined,
  columns: Column<T>[]
): T[] {
  if (!filters) return data;
  const entries = Object.entries(filters);
  if (entries.length === 0) return data;

  return data.filter(item =>
    entries.every(([key, filterValue]) => matchesColumnFilter(item, key, filterValue, columns))
  );
}
