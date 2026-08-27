import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  SortDirection,
  Column,
  Density,
  FilterValue,
  RowId,
  TableRow,
  ModernTableProps,
  UseTableOptions,
} from '../types';
import { processTableData } from '../utils/pipeline';
import { nextSortDirection } from '../utils/sort';
import { toggleSelectedId, toggleSelectedIds, isEveryIdSelected, isSomeIdSelected } from '../utils/selection';

function resolveOptions<T extends TableRow>(
  options?: number | UseTableOptions<T>
): UseTableOptions<T> {
  if (typeof options === 'number') return { initialItemsPerPage: options };
  return options ?? {};
}

const DEFAULT_PAGE_OPTIONS = [10, 20, 50];

export function useTable<T extends TableRow>(
  data: T[],
  columns: Column<T>[],
  options?: number | UseTableOptions<T>
) {
  const opts = resolveOptions(options);
  const initialItemsPerPage = opts.initialItemsPerPage ?? 10;
  const itemsPerPageOptions = opts.itemsPerPageOptions ?? DEFAULT_PAGE_OPTIONS;
  const getRowId = useCallback(
    (row: T) => (opts.getRowId ? opts.getRowId(row) : row.id),
    [opts.getRowId]
  );
  const selectAllScope = opts.selectAllScope ?? 'page';
  const enableSelection = opts.enableSelection ?? true;
  const searchKeys = opts.searchKeys as string[] | undefined;

  const onSelectionChangeRef = useRef(opts.onSelectionChange);
  onSelectionChangeRef.current = opts.onSelectionChange;

  const notifySelection = useCallback((next: Set<RowId>) => {
    onSelectionChangeRef.current?.(Array.from(next));
  }, []);

  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<RowId>>(new Set());
  const [filters, setFilters] = useState<Record<string, FilterValue>>(
    () => opts.initialFilters ?? {}
  );
  const [density, setDensity] = useState<Density>(opts.initialDensity ?? 'standard');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    columns.filter(c => !c.hidden).map(c => c.key as string)
  );
  const [stickyColumns, setStickyColumns] = useState<string[]>(() =>
    columns.filter(c => c.isSticky).map(c => c.key as string)
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map(c => c.key as string)
  );
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  }>(() => ({
    key: opts.initialSort?.key ?? '',
    direction: opts.initialSort?.direction ?? null,
  }));

  // Keep visibility / sticky / order in sync when column keys change
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

    setColumnOrder(prev => {
      const kept = prev.filter(k => keySet.has(k));
      const added = keys.filter(k => !kept.includes(k));
      const next = [...kept, ...added];
      if (next.length === prev.length && next.every((k, i) => k === prev[i])) {
        return prev;
      }
      return next;
    });
  }, [columns]);

  const processed = useMemo(
    () =>
      processTableData({
        data,
        columns,
        searchQuery,
        searchKeys,
        filters,
        sortKey: sortConfig.key,
        sortDirection: sortConfig.direction,
        currentPage,
        itemsPerPage,
      }),
    [data, columns, searchQuery, searchKeys, filters, sortConfig, currentPage, itemsPerPage]
  );

  const { filteredData, sortedData, paginatedData, totalPages } = processed;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSort = useCallback((key: string, direction?: SortDirection) => {
    setSortConfig(prev => {
      const nextDirection =
        direction !== undefined
          ? direction
          : nextSortDirection(prev.key, prev.direction, key);
      return {
        key: nextDirection === null ? '' : key,
        direction: nextDirection,
      };
    });
  }, []);

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

  const toggleSelection = useCallback(
    (id: RowId) => {
      setSelectedIds(prev => {
        const next = toggleSelectedId(prev, id);
        notifySelection(next);
        return next;
      });
    },
    [notifySelection]
  );

  const selectionPool = selectAllScope === 'filtered' ? filteredData : paginatedData;
  const selectionPoolIds = useMemo(
    () => selectionPool.map(item => getRowId(item)),
    [selectionPool, getRowId]
  );

  const toggleAllSelection = useCallback(() => {
    if (selectionPoolIds.length === 0) return;
    setSelectedIds(prev => {
      const next = toggleSelectedIds(prev, selectionPoolIds);
      notifySelection(next);
      return next;
    });
  }, [selectionPoolIds, notifySelection]);

  const clearSelection = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size === 0) return prev;
      const next = new Set<RowId>();
      notifySelection(next);
      return next;
    });
  }, [notifySelection]);

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

  const handleColumnReorder = useCallback((newOrder: string[]) => {
    setColumnOrder(newOrder);
  }, []);

  const isAllSelected = isEveryIdSelected(selectedIds, selectionPoolIds);
  const isSomeSelected = isSomeIdSelected(selectedIds, selectionPoolIds) && !isAllSelected;

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
    | 'isSomeSelected'
    | 'pagination'
    | 'columnOrder'
    | 'onColumnReorder'
    | 'getRowId'
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
      enableSelection,
      selectedIds,
      onToggleRow: toggleSelection,
      onToggleAll: toggleAllSelection,
      isAllSelected,
      isSomeSelected,
      getRowId,
      columnOrder,
      onColumnReorder: handleColumnReorder,
      pagination: {
        currentPage,
        totalPages,
        itemsPerPage,
        onPageChange: setCurrentPage,
        itemsPerPageOptions,
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
    enableSelection,
    selectedIds,
    toggleSelection,
    toggleAllSelection,
    isAllSelected,
    isSomeSelected,
    getRowId,
    columnOrder,
    handleColumnReorder,
    currentPage,
    totalPages,
    itemsPerPage,
    itemsPerPageOptions,
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
    columnOrder,
    setColumnOrder,

    // Pagination
    itemsPerPage,
    setItemsPerPage,

    // Filters
    filters,
    setColumnFilter,

    // Sticky
    stickyColumns,
    toggleStickyColumn,

    getRowId,

    /** Spread onto `<ModernTable columns={columns} {...getTableProps()} />` */
    getTableProps,
  };
}

export type UseTableResult<T extends TableRow> = ReturnType<typeof useTable<T>>;
