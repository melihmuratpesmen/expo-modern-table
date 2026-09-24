import { useState, useMemo, useCallback } from 'react';
import {
  SortDirection,
  Column,
  Density,
  FilterValue,
  RowId,
  TableRow,
  ModernTableProps,
} from '../types';
import { nextSortDirection, sortRows, SortState } from '../core/sort';
import { filterRows, isEmptyFilterValue, searchRows } from '../core/filter';
import { clampPage, getTotalPages, paginateRows } from '../core/pagination';
import { getSelectionState, toggleId, toggleIds } from '../core/selection';

/** Column keys whose flag is on: a user override wins, otherwise the column default. */
function resolveColumnFlags<T>(
  columns: readonly Column<T>[],
  overrides: Record<string, boolean>,
  getDefault: (column: Column<T>) => boolean
): string[] {
  return columns.filter(c => overrides[c.key as string] ?? getDefault(c)).map(c => c.key as string);
}

const isVisibleByDefault = <T>(c: Column<T>) => !c.hidden;
const isStickyByDefault = <T>(c: Column<T>) => !!c.isSticky;

export function useTable<T extends TableRow>(
  data: T[],
  columns: Column<T>[],
  initialItemsPerPage: number = 10
) {
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);
  const [requestedPage, setRequestedPage] = useState(1);
  const [searchQuery, setSearchQueryState] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<RowId>>(() => new Set());
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});
  const [density, setDensity] = useState<Density>('standard');
  const [visibilityOverrides, setVisibilityOverrides] = useState<Record<string, boolean>>({});
  const [stickyOverrides, setStickyOverrides] = useState<Record<string, boolean>>({});
  const [sortConfig, setSortConfig] = useState<SortState>({ key: '', direction: null });

  // Derived from `columns` on every change, so added / removed / re-flagged columns are
  // picked up without syncing state in an effect.
  const visibleColumns = useMemo(
    () => resolveColumnFlags(columns, visibilityOverrides, isVisibleByDefault),
    [columns, visibilityOverrides]
  );
  const stickyColumns = useMemo(
    () => resolveColumnFlags(columns, stickyOverrides, isStickyByDefault),
    [columns, stickyOverrides]
  );

  const filteredData = useMemo(
    () => filterRows(searchRows(data, searchQuery, visibleColumns), filters, columns),
    [data, searchQuery, visibleColumns, filters, columns]
  );

  const sortedData = useMemo(() => sortRows(filteredData, sortConfig), [filteredData, sortConfig]);

  const totalPages = getTotalPages(filteredData.length, itemsPerPage);
  const currentPage = clampPage(requestedPage, totalPages);

  const paginatedData = useMemo(
    () => paginateRows(sortedData, currentPage, itemsPerPage),
    [sortedData, currentPage, itemsPerPage]
  );

  const setCurrentPage = useCallback((page: number) => setRequestedPage(page), []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    setRequestedPage(1);
  }, []);

  const setItemsPerPage = useCallback((size: number) => {
    setItemsPerPageState(size);
    setRequestedPage(1);
  }, []);

  const handleSort = useCallback((key: string, direction?: SortDirection) => {
    setSortConfig(prev => {
      const next =
        direction !== undefined ? direction : nextSortDirection(prev.key, prev.direction, key);
      return { key: next === null ? '' : key, direction: next };
    });
  }, []);

  const setColumnFilter = useCallback((key: string, value: FilterValue) => {
    setFilters(prev => {
      const next = { ...prev };
      if (isEmptyFilterValue(value)) delete next[key];
      else next[key] = value;
      return next;
    });
    setRequestedPage(1);
  }, []);

  const toggleSelection = useCallback((id: RowId) => {
    setSelectedIds(prev => toggleId(prev, id));
  }, []);

  /** Selects / deselects the current page. Selections on other pages are kept. */
  const toggleAllSelection = useCallback(() => {
    const pageIds = paginatedData.map(item => item.id);
    setSelectedIds(prev => toggleIds(prev, pageIds));
  }, [paginatedData]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const toggleColumnVisibility = useCallback(
    (columnKey: string) => {
      setVisibilityOverrides(prev => {
        const column = columns.find(c => c.key === columnKey);
        const current = prev[columnKey] ?? (column ? isVisibleByDefault(column) : false);
        return { ...prev, [columnKey]: !current };
      });
    },
    [columns]
  );

  const toggleStickyColumn = useCallback(
    (columnKey: string) => {
      setStickyOverrides(prev => {
        const column = columns.find(c => c.key === columnKey);
        const current = prev[columnKey] ?? (column ? isStickyByDefault(column) : false);
        return { ...prev, [columnKey]: !current };
      });
    },
    [columns]
  );

  const pageSelection = getSelectionState(
    selectedIds,
    paginatedData.map(item => item.id)
  );
  const isAllSelected = pageSelection === 'all';
  const isSomeSelected = pageSelection === 'some';

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
    setSearchQuery,
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
    setCurrentPage,
    setItemsPerPage,
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
    clearSelection,
    isAllSelected,
    isSomeSelected,

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
