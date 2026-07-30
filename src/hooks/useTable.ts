import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  SortDirection,
  Column,
  Density,
  FilterValue,
  RowId,
  TableRow,
  ModernTableProps,
} from '../types';
import { includesSearch, normalizeSearchText } from '../utils/search';

function cycleSortDirection(
  currentKey: string,
  currentDirection: SortDirection,
  nextKey: string
): SortDirection {
  if (currentKey !== nextKey || currentDirection === null) return 'asc';
  if (currentDirection === 'asc') return 'desc';
  return null;
}

export function useTable<T extends TableRow>(
  data: T[],
  columns: Column<T>[],
  initialItemsPerPage: number = 10
) {
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<RowId>>(new Set());
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});
  const [density, setDensity] = useState<Density>('standard');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    columns.filter(c => !c.hidden).map(c => c.key as string)
  );
  const [stickyColumns, setStickyColumns] = useState<string[]>(() =>
    columns.filter(c => c.isSticky).map(c => c.key as string)
  );
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  }>({ key: '', direction: null });

  // Keep visibility / sticky in sync when column keys change
  useEffect(() => {
    const keys = columns.map(c => c.key as string);
    const keySet = new Set(keys);

    setVisibleColumns(prev => {
      const kept = prev.filter(k => keySet.has(k));
      const added = columns
        .filter(c => !c.hidden && !kept.includes(c.key as string))
        .map(c => c.key as string);
      const next = [...kept, ...added];
      if (next.length === prev.length && next.every((k, i) => k === prev[i])) {
        return prev;
      }
      return next;
    });

    setStickyColumns(prev => {
      const kept = prev.filter(k => keySet.has(k));
      const added = columns
        .filter(c => c.isSticky && !kept.includes(c.key as string))
        .map(c => c.key as string);
      const next = [...kept, ...added];
      if (next.length === prev.length && next.every((k, i) => k === prev[i])) {
        return prev;
      }
      return next;
    });
  }, [columns]);

  const filteredData = useMemo(() => {
    let result = data;

    if (searchQuery) {
      const normalizedQuery = normalizeSearchText(searchQuery);
      result = result.filter(item =>
        Object.values(item).some(val => includesSearch(String(val), normalizedQuery))
      );
    }

    if (Object.keys(filters).length > 0) {
      result = result.filter(item =>
        Object.entries(filters).every(([key, filterValue]) => {
          if (filterValue === undefined || filterValue === '') return true;

          const itemValue = item[key as keyof T];
          const colConfig = columns.find(c => c.key === key)?.filterConfig;

          switch (colConfig?.type) {
            case 'text':
              return includesSearch(String(itemValue), String(filterValue));
            case 'select':
              return itemValue === filterValue;
            case 'boolean':
              return Boolean(itemValue) === (filterValue === true || filterValue === 'true');
            case 'number-range': {
              const range = filterValue as { min?: number; max?: number };
              const numVal = Number(itemValue);
              if (range.min !== undefined && numVal < range.min) return false;
              if (range.max !== undefined && numVal > range.max) return false;
              return true;
            }
            default:
              return true;
          }
        })
      );
    }

    return result;
  }, [data, searchQuery, filters, columns]);

  const sortedData = useMemo(() => {
    const sortableItems = [...filteredData];

    if (sortConfig.direction !== null && sortConfig.key) {
      const key = sortConfig.key as keyof T;
      sortableItems.sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];
        const isNum = !isNaN(Number(aValue)) && !isNaN(Number(bValue));

        if (isNum) {
          const numA = Number(aValue);
          const numB = Number(bValue);
          if (numA < numB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (numA > numB) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return sortableItems;
  }, [filteredData, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage) || 1);

  const paginatedData = useMemo(() => {
    if (filteredData.length === 0) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage, filteredData.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSort = useCallback(
    (key: string, direction?: SortDirection) => {
      const nextDirection =
        direction !== undefined
          ? direction
          : cycleSortDirection(sortConfig.key, sortConfig.direction, key);

      setSortConfig({
        key: nextDirection === null ? '' : key,
        direction: nextDirection,
      });
    },
    [sortConfig.key, sortConfig.direction]
  );

  const setColumnFilter = useCallback((key: string, value: FilterValue) => {
    setFilters(prev => {
      const next = { ...prev };
      if (value === null || value === undefined || value === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  }, []);

  const toggleSelection = useCallback((id: RowId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllSelection = useCallback(() => {
    if (paginatedData.length === 0) return;
    setSelectedIds(prev => {
      const allSelected = paginatedData.every(item => prev.has(item.id));
      if (allSelected) return new Set();
      return new Set(paginatedData.map(item => item.id));
    });
  }, [paginatedData]);

  const toggleColumnVisibility = useCallback((columnKey: string) => {
    setVisibleColumns(prev =>
      prev.includes(columnKey) ? prev.filter(c => c !== columnKey) : [...prev, columnKey]
    );
  }, []);

  const toggleStickyColumn = useCallback((columnKey: string) => {
    setStickyColumns(prev =>
      prev.includes(columnKey) ? prev.filter(c => c !== columnKey) : [...prev, columnKey]
    );
  }, []);

  const isAllSelected =
    paginatedData.length > 0 && paginatedData.every(item => selectedIds.has(item.id));

  const getTableProps = useCallback((): Pick<
    ModernTableProps<T>,
    | 'data'
    | 'searchQuery'
    | 'onSearchChange'
    | 'sortColumn'
    | 'sortDirection'
    | 'onSort'
    | 'density'
    | 'onDensityChange'
    | 'visibleColumns'
    | 'onToggleColumn'
    | 'stickyColumns'
    | 'onToggleSticky'
    | 'filters'
    | 'onFilterChange'
    | 'enableSelection'
    | 'selectedIds'
    | 'onToggleRow'
    | 'onToggleAll'
    | 'isAllSelected'
    | 'pagination'
  > => {
    return {
      data: paginatedData,
      searchQuery,
      onSearchChange: setSearchQuery,
      sortColumn: sortConfig.key || undefined,
      sortDirection: sortConfig.direction,
      onSort: handleSort,
      density,
      onDensityChange: setDensity,
      visibleColumns,
      onToggleColumn: toggleColumnVisibility,
      stickyColumns,
      onToggleSticky: toggleStickyColumn,
      filters,
      onFilterChange: setColumnFilter,
      enableSelection: true,
      selectedIds,
      onToggleRow: toggleSelection,
      onToggleAll: toggleAllSelection,
      isAllSelected,
      pagination: {
        currentPage,
        totalPages,
        itemsPerPage,
        onPageChange: setCurrentPage,
        itemsPerPageOptions: [10, 20, 50],
        onItemsPerPageChange: setItemsPerPage,
      },
    };
  }, [
    paginatedData,
    searchQuery,
    sortConfig.key,
    sortConfig.direction,
    handleSort,
    density,
    visibleColumns,
    toggleColumnVisibility,
    stickyColumns,
    toggleStickyColumn,
    filters,
    setColumnFilter,
    selectedIds,
    toggleSelection,
    toggleAllSelection,
    isAllSelected,
    currentPage,
    totalPages,
    itemsPerPage,
  ]);

  return {
    // Data pipeline
    filteredData,
    sortedData,
    paginatedData,
    totalPages,
    currentPage,
    setCurrentPage,

    // Search
    searchQuery,
    setSearchQuery,

    // Sort
    sortConfig,
    handleSort,

    // Selection
    selectedIds,
    toggleSelection,
    toggleAllSelection,
    isAllSelected,

    // Appearance
    density,
    setDensity,
    visibleColumns,
    toggleColumnVisibility,

    // Pagination
    itemsPerPage,
    setItemsPerPage,

    // Filters
    filters,
    setColumnFilter,

    // Sticky
    stickyColumns,
    toggleStickyColumn,

    /** Spread onto `<ModernTable columns={columns} {...getTableProps()} />` */
    getTableProps,
  };
}

export type UseTableResult<T extends TableRow> = ReturnType<typeof useTable<T>>;
