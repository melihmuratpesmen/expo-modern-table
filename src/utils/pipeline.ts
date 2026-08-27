import { Column, FilterValue, SortDirection } from '../types';
import { applyFilters } from './filter';
import { includesSearch, normalizeSearchText } from './search';
import { sortRows } from './sort';

export interface ProcessTableDataInput<T> {
  data: T[];
  columns: Column<T>[];
  searchQuery?: string;
  /** Limit global search to these keys. Defaults to every enumerable value on the row. */
  searchKeys?: string[];
  filters?: Record<string, FilterValue>;
  sortKey?: string;
  sortDirection?: SortDirection;
  currentPage?: number;
  itemsPerPage?: number;
}

export interface ProcessTableDataResult<T> {
  filteredData: T[];
  sortedData: T[];
  paginatedData: T[];
  totalPages: number;
  currentPage: number;
}

export function applySearch<T>(data: T[], searchQuery: string | undefined, searchKeys?: string[]): T[] {
  if (!searchQuery) return data;
  const normalizedQuery = normalizeSearchText(searchQuery);
  if (!normalizedQuery) return data;

  return data.filter(item => {
    if (searchKeys && searchKeys.length > 0) {
      return searchKeys.some(key => includesSearch(String(item[key as keyof T] ?? ''), normalizedQuery));
    }
    return Object.values(item as object).some(val => includesSearch(String(val ?? ''), normalizedQuery));
  });
}

export function paginateRows<T>(
  data: T[],
  currentPage: number,
  itemsPerPage: number
): { paginatedData: T[]; totalPages: number; currentPage: number } {
  const perPage = Math.max(1, itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(data.length / perPage) || 1);
  const page = Math.min(Math.max(1, currentPage), totalPages);
  if (data.length === 0) {
    return { paginatedData: [], totalPages, currentPage: page };
  }
  const startIndex = (page - 1) * perPage;
  return {
    paginatedData: data.slice(startIndex, startIndex + perPage),
    totalPages,
    currentPage: page,
  };
}

/** Headless client-side search → filter → sort → paginate pipeline. */
export function processTableData<T>(input: ProcessTableDataInput<T>): ProcessTableDataResult<T> {
  const searched = applySearch(input.data, input.searchQuery, input.searchKeys);
  const filteredData = applyFilters(searched, input.filters, input.columns);
  const sortedData = sortRows(filteredData, input.sortKey ?? '', input.sortDirection ?? null);
  const paged = paginateRows(sortedData, input.currentPage ?? 1, input.itemsPerPage ?? 10);

  return {
    filteredData,
    sortedData,
    ...paged,
  };
}
