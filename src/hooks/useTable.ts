import { useState, useMemo, useCallback, useDeferredValue, useEffect } from 'react';
import {
  SortDirection,
  Column,
  Density,
  FilterValue,
  RowId,
  RowIdAccessor,
  TableRow,
  ModernTableBaseProps,
} from '../types';
import { nextSortDirection, sortRows, SortState } from '../core/sort';
import { buildSearchIndex, filterRows, isEmptyFilterValue, searchRows } from '../core/filter';
import { clampPage, getTotalPages, paginateRows } from '../core/pagination';
import { getSelectionState, toggleId, toggleIds } from '../core/selection';
import { reconcileOrder } from '../core/columns';
import { CsvOptions, toCsv } from '../core/csv';
import { useDebouncedValue } from './useDebouncedValue';
import { useStableCallback } from './useStableCallback';

/** The data-shaping state — what a server needs to fetch the current page in manual mode. */
export interface TableState {
  searchQuery: string;
  sort: SortState;
  filters: Record<string, FilterValue>;
  /** 1-based. */
  page: number;
  pageSize: number;
}

/**
 * User layout choices worth persisting (e.g. in AsyncStorage). Visibility and pinning are
 * stored as overrides, so columns added in a later app version still get their defaults.
 */
export interface TablePreferences {
  /** Column key → visible, where it differs from the column's `hidden` default. */
  columnVisibility: Record<string, boolean>;
  /** Column key → pinned, where it differs from the column's `isSticky` default. */
  columnPinning: Record<string, boolean>;
  columnOrder: string[];
  columnWidths: Record<string, number>;
  density: Density;
  pageSize: number;
}

export interface UseTableOptions<T> {
  /** Rows per page. Default 10. */
  pageSize?: number;
  /** Choices in the page-size selector. Default `[10, 20, 50]`. */
  pageSizeOptions?: number[];
  /** Hide the pagination bar (e.g. for infinite scroll). Default true. */
  pagination?: boolean;
  initialState?: Partial<TableState>;
  initialDensity?: Density;
  /** Show checkboxes. Default true. */
  enableSelection?: boolean;
  /** What "select all" covers: the current page (default) or every row matching the filters. */
  selectAllScope?: 'page' | 'filtered';
  /** Row identity when rows have no `id` field. Memoize it. */
  getRowId?: (row: T) => RowId;
  /** Collation locale(s) for sorting text, e.g. `'tr'`. Defaults to the device locale. */
  locale?: string | string[];
  /**
   * Server-side mode: `data` is already the current page, sorted and filtered. The hook only
   * manages state — read `state` (or use `onStateChange`) to fetch.
   */
  manual?: boolean;
  /** Manual mode: total matching rows, for the page count. Without it "next" is enabled while pages are full. */
  rowCount?: number;
  /** Delay before search changes reach `state`. Default 300 ms in manual mode, 0 otherwise. */
  searchDebounceMs?: number;
  /** Called on mount and whenever `state` changes. */
  onStateChange?: (state: TableState) => void;
  /** Restore saved preferences (see `table.preferences`). */
  initialPreferences?: Partial<TablePreferences>;
  /** Called on mount and whenever `preferences` change — persist them here. */
  onPreferencesChange?: (preferences: TablePreferences) => void;
}

/** Which rows `getCsv` exports. */
export type CsvRows = 'filtered' | 'page' | 'selected' | 'all';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];
const defaultGetRowId = (row: object) => (row as TableRow).id;

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

type TablePropKeys =
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
  | 'columnWidths'
  | 'onColumnResize'
  | 'footerData';

/** What `getTableProps()` returns — spread it onto `ModernTable`. */
export type TableProps<T extends object> = Pick<ModernTableBaseProps<T>, TablePropKeys> &
  RowIdAccessor<T>;

function useTableImpl<T extends object>(
  data: T[],
  columns: Column<T>[],
  options: number | UseTableOptions<T> = {}
) {
  const opts: UseTableOptions<T> = typeof options === 'number' ? { pageSize: options } : options;
  const {
    initialState,
    manual = false,
    rowCount,
    selectAllScope = 'page',
    enableSelection = true,
    pagination: showPagination = true,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    getRowId: getRowIdOption,
    locale,
    searchDebounceMs = manual ? 300 : 0,
  } = opts;
  const getRowId = getRowIdOption ?? defaultGetRowId;

  const initialPreferences = opts.initialPreferences;
  const [itemsPerPage, setItemsPerPageState] = useState(
    () => initialPreferences?.pageSize ?? initialState?.pageSize ?? opts.pageSize ?? 10
  );
  const [searchQuery, setSearchQuery] = useState(() => initialState?.searchQuery ?? '');
  const [selectedIds, setSelectedIds] = useState<Set<RowId>>(() => new Set());
  const [filters, setFilters] = useState<Record<string, FilterValue>>(
    () => initialState?.filters ?? {}
  );
  const [density, setDensity] = useState<Density>(
    () => initialPreferences?.density ?? opts.initialDensity ?? 'standard'
  );
  const [visibilityOverrides, setVisibilityOverrides] = useState<Record<string, boolean>>(
    () => initialPreferences?.columnVisibility ?? {}
  );
  const [stickyOverrides, setStickyOverrides] = useState<Record<string, boolean>>(
    () => initialPreferences?.columnPinning ?? {}
  );
  const [storedColumnOrder, setColumnOrder] = useState<string[]>(
    () => initialPreferences?.columnOrder ?? []
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    () => initialPreferences?.columnWidths ?? {}
  );
  const [sortConfig, setSortConfig] = useState<SortState>(
    () => initialState?.sort ?? { key: '', direction: null }
  );

  // Search as it reaches `state` (debounced in manual mode, so the server isn't hit per key).
  const effectiveQuery = useDebouncedValue(searchQuery, searchDebounceMs);

  // The page belongs to the query it was chosen for: when the (debounced) query changes, go
  // back to page 1 during render rather than in an effect, so manual mode fetches once.
  const [pageState, setPageState] = useState(() => ({
    page: initialState?.page ?? 1,
    query: effectiveQuery,
  }));
  if (pageState.query !== effectiveQuery) {
    setPageState({ page: 1, query: effectiveQuery });
  }
  const requestedPage = pageState.query === effectiveQuery ? pageState.page : 1;

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
  const columnOrder = useMemo(
    () =>
      reconcileOrder(
        storedColumnOrder,
        columns.map(c => c.key as string)
      ),
    [storedColumnOrder, columns]
  );

  const localeKey = Array.isArray(locale) ? locale.join(',') : (locale ?? '');
  const collator = useMemo(
    () =>
      new Intl.Collator(localeKey ? localeKey.split(',') : undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    [localeKey]
  );

  // Client mode: the input shows `searchQuery` immediately; filtering follows at lower
  // priority so typing stays responsive on large data sets.
  const deferredQuery = useDeferredValue(effectiveQuery);
  const isSearching = !manual && deferredQuery.trim() !== '';
  // Visible, searchable columns; a column's `getValue` is searched instead of `row[key]`.
  const searchFields = useMemo(() => {
    const visible = new Set(visibleColumns);
    return columns
      .filter(c => c.searchable !== false && visible.has(c.key as string))
      .map(c => c.getValue ?? (c.key as string));
  }, [columns, visibleColumns]);
  const searchIndex = useMemo(
    () => (isSearching ? buildSearchIndex(data, searchFields) : undefined),
    [isSearching, data, searchFields]
  );

  const filteredData = useMemo(
    () =>
      manual
        ? data
        : filterRows(searchRows(data, deferredQuery, searchFields, searchIndex), filters, columns),
    [manual, data, deferredQuery, searchFields, searchIndex, filters, columns]
  );

  const sortedData = useMemo(
    () => (manual ? data : sortRows(filteredData, sortConfig, collator, columns)),
    [manual, data, filteredData, sortConfig, collator, columns]
  );

  let totalPages: number;
  if (!manual) totalPages = getTotalPages(filteredData.length, itemsPerPage);
  else if (rowCount !== undefined) totalPages = getTotalPages(rowCount, itemsPerPage);
  // Unknown total: allow "next" while the server returns full pages.
  else totalPages = Math.max(1, requestedPage + (data.length >= itemsPerPage ? 1 : 0));

  const currentPage = clampPage(requestedPage, totalPages);

  const paginatedData = useMemo(
    () => (manual ? data : paginateRows(sortedData, currentPage, itemsPerPage)),
    [manual, data, sortedData, currentPage, itemsPerPage]
  );

  const state = useMemo<TableState>(
    () => ({
      searchQuery: effectiveQuery,
      sort: sortConfig,
      filters,
      page: currentPage,
      pageSize: itemsPerPage,
    }),
    [effectiveQuery, sortConfig, filters, currentPage, itemsPerPage]
  );

  const notifyStateChange = useStableCallback(opts.onStateChange);
  useEffect(() => {
    notifyStateChange(state);
  }, [state, notifyStateChange]);

  const setCurrentPage = useCallback(
    (page: number) => setPageState({ page, query: effectiveQuery }),
    [effectiveQuery]
  );

  const setItemsPerPage = useCallback(
    (size: number) => {
      setItemsPerPageState(size);
      setPageState({ page: 1, query: effectiveQuery });
    },
    [effectiveQuery]
  );

  const handleSort = useCallback((key: string, direction?: SortDirection) => {
    setSortConfig(prev => {
      const next =
        direction !== undefined ? direction : nextSortDirection(prev.key, prev.direction, key);
      return { key: next === null ? '' : key, direction: next };
    });
  }, []);

  const setColumnFilter = useCallback(
    (key: string, value: FilterValue) => {
      setFilters(prev => {
        const next = { ...prev };
        if (isEmptyFilterValue(value)) delete next[key];
        else next[key] = value;
        return next;
      });
      setPageState({ page: 1, query: effectiveQuery });
    },
    [effectiveQuery]
  );

  const toggleSelection = useCallback((id: RowId) => {
    setSelectedIds(prev => toggleId(prev, id));
  }, []);

  const selectAllIds = useMemo(
    () => (selectAllScope === 'filtered' ? filteredData : paginatedData).map(getRowId),
    [selectAllScope, filteredData, paginatedData, getRowId]
  );

  /** Selects / deselects the select-all scope. Selections outside it are kept. */
  const toggleAllSelection = useCallback(() => {
    setSelectedIds(prev => toggleIds(prev, selectAllIds));
  }, [selectAllIds]);

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

  const selection = getSelectionState(selectedIds, selectAllIds);
  const isAllSelected = selection === 'all';
  const isSomeSelected = selection === 'some';

  const setColumnWidth = useCallback((key: string, width: number) => {
    setColumnWidths(prev => ({ ...prev, [key]: width }));
  }, []);

  const preferences = useMemo<TablePreferences>(
    () => ({
      columnVisibility: visibilityOverrides,
      columnPinning: stickyOverrides,
      columnOrder,
      columnWidths,
      density,
      pageSize: itemsPerPage,
    }),
    [visibilityOverrides, stickyOverrides, columnOrder, columnWidths, density, itemsPerPage]
  );

  const notifyPreferencesChange = useStableCallback(opts.onPreferencesChange);
  useEffect(() => {
    notifyPreferencesChange(preferences);
  }, [preferences, notifyPreferencesChange]);

  /** Apply saved preferences later, e.g. after they finish loading from storage. */
  const setPreferences = useCallback(
    (next: Partial<TablePreferences>) => {
      if (next.columnVisibility) setVisibilityOverrides(next.columnVisibility);
      if (next.columnPinning) setStickyOverrides(next.columnPinning);
      if (next.columnOrder) setColumnOrder(next.columnOrder);
      if (next.columnWidths) setColumnWidths(next.columnWidths);
      if (next.density) setDensity(next.density);
      if (next.pageSize) {
        setItemsPerPageState(next.pageSize);
        setPageState({ page: 1, query: effectiveQuery });
      }
    },
    [effectiveQuery]
  );

  /** CSV of the visible columns in on-screen order. Default rows: everything matching the filters. */
  const getCsv = useCallback(
    (options: CsvOptions<T> & { rows?: CsvRows } = {}) => {
      const { rows: scope = 'filtered', ...csvOptions } = options;
      const visible = new Set(visibleColumns);
      const position = new Map(columnOrder.map((key, index) => [key, index]));
      const exportColumns = columns
        .filter(c => visible.has(c.key as string))
        .sort(
          (a, b) => (position.get(a.key as string) ?? 0) - (position.get(b.key as string) ?? 0)
        );
      const rows =
        scope === 'page'
          ? paginatedData
          : scope === 'all'
            ? data
            : scope === 'selected'
              ? sortedData.filter(row => selectedIds.has(getRowId(row)))
              : sortedData;
      return toCsv(rows, exportColumns, csvOptions);
    },
    [visibleColumns, columnOrder, columns, paginatedData, data, sortedData, selectedIds, getRowId]
  );

  const getTableProps = useCallback(
    (): TableProps<T> =>
      ({
        data: paginatedData,
        getRowId,
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
        footerData: sortedData,
        columnOrder,
        onColumnReorder: setColumnOrder,
        columnWidths,
        onColumnResize: setColumnWidth,
        pagination: showPagination
          ? {
              currentPage,
              totalPages,
              itemsPerPage,
              onPageChange: setCurrentPage,
              itemsPerPageOptions: pageSizeOptions,
              onItemsPerPageChange: setItemsPerPage,
            }
          : undefined,
      }) as unknown as TableProps<T>,
    [
      paginatedData,
      getRowId,
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
      showPagination,
      sortedData,
      columnOrder,
      columnWidths,
      setColumnWidth,
      currentPage,
      totalPages,
      itemsPerPage,
      setCurrentPage,
      pageSizeOptions,
      setItemsPerPage,
    ]
  );

  return {
    /** Search, sort, filters and page as they currently apply (search debounced in manual mode). */
    state,

    // Data pipeline (in manual mode all three are `data` as given)
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

    // Column layout
    columnOrder,
    setColumnOrder,
    columnWidths,
    setColumnWidth,

    // Persistence / export
    preferences,
    setPreferences,
    getCsv,

    /** Spread onto `<ModernTable columns={columns} {...getTableProps()} />` */
    getTableProps,
  };
}

export type UseTableResult<T extends object> = ReturnType<typeof useTableImpl<T>>;

/**
 * Client-side table state (search, sort, filters, pagination, selection, column visibility)
 * for `ModernTable`, or state-only for server-side data with `manual: true`.
 *
 * The third argument is the page size or an options object.
 */
export function useTable<T extends TableRow>(
  data: T[],
  columns: Column<T>[],
  options?: number | UseTableOptions<T>
): UseTableResult<T>;
export function useTable<T extends object>(
  data: T[],
  columns: Column<T>[],
  options: UseTableOptions<T> & { getRowId: (row: T) => RowId }
): UseTableResult<T>;
export function useTable<T extends object>(
  data: T[],
  columns: Column<T>[],
  options?: number | UseTableOptions<T>
): UseTableResult<T> {
  return useTableImpl(data, columns, options);
}
