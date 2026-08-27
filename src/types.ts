import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { TableTheme } from './theme/tokens';

export type RowId = string | number;
export type TableRow = { id: RowId };

export type SortDirection = 'asc' | 'desc' | null;
export type Density = 'compact' | 'standard' | 'comfortable';
export type SelectionMode = 'select' | 'reorder';
export type SelectAllScope = 'page' | 'filtered';

export interface FilterConfig {
  type: 'text' | 'select' | 'boolean' | 'number-range';
  options?: string[];
}

export type FilterValue =
  | string
  | boolean
  | { min?: number; max?: number }
  | undefined;

export interface TableTranslations {
  searchPlaceholder: string;
  all: string;
  yesActive: string;
  noPassive: string;
  min: string;
  max: string;
  unknownFilter: string;
  filter: string;
  clear: string;
  apply: string;
  selected: string;
  columns: string;
  show: string;
  page: string;
  empty: string;
  loading: string;
  error: string;
  retry: string;
  previousPage: string;
  nextPage: string;
  selectAll: string;
  selectRow: string;
  sortColumn: string;
  filterColumn: string;
  changeDensity: string;
  manageColumns: string;
  enterFullscreen: string;
  exitFullscreen: string;
  reorderRows: string;
  selectRows: string;
  close: string;
  pinColumn: string;
  unpinColumn: string;
}

export const DEFAULT_TRANSLATIONS: TableTranslations = {
  searchPlaceholder: 'Search...',
  all: 'All',
  yesActive: 'Yes',
  noPassive: 'No',
  min: 'Min',
  max: 'Max',
  unknownFilter: 'Unknown Filter',
  filter: 'Filter',
  clear: 'Clear',
  apply: 'Apply',
  selected: 'Selected',
  columns: 'Columns',
  show: 'Show:',
  page: 'Page',
  empty: 'No data found.',
  loading: 'Loading…',
  error: 'Something went wrong.',
  retry: 'Retry',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  selectAll: 'Select all',
  selectRow: 'Select row',
  sortColumn: 'Sort {title}',
  filterColumn: 'Filter {title}',
  changeDensity: 'Change row density',
  manageColumns: 'Show or hide columns',
  enterFullscreen: 'Enter fullscreen',
  exitFullscreen: 'Exit fullscreen',
  reorderRows: 'Reorder rows',
  selectRows: 'Select rows',
  close: 'Close',
  pinColumn: 'Pin column',
  unpinColumn: 'Unpin column',
};

export interface Column<T> {
  key: Extract<keyof T, string> | (string & {});
  title: string;
  width?: number;
  isSticky?: boolean;
  align?: 'left' | 'center' | 'right';
  renderCell?: (item: T, index: number) => ReactNode;
  editable?: boolean;
  hidden?: boolean;
  /** When `false`, the header is not clickable for sort. Default: `true` if `onSort` is set. */
  sortable?: boolean;

  isMarked?: boolean;
  markedColor?: string;
  headerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  filterConfig?: FilterConfig;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemsPerPageOptions?: number[];
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

/**
 * ModernTable is primarily a controlled presentational component.
 * Use `useTable()` for state, or pass props yourself.
 *
 * Internal-only UI state (not in this interface): cell editing, open filter modal.
 * Semi-controlled: `selectionMode`, `columnOrder` — controlled when provided, else internal.
 */
export interface ModernTableProps<T extends TableRow> {
  data: T[];
  columns: Column<T>[];

  // Selection
  enableSelection?: boolean;
  selectedIds?: Set<RowId>;
  isAllSelected?: boolean;
  /** True when some, but not all, rows in the current select-all scope are selected. */
  isSomeSelected?: boolean;
  onToggleAll?: () => void;
  onToggleRow?: (id: RowId) => void;
  /** Fired after a toggle with the predicted next selected ids (does not require `useTable`). */
  onSelectionChange?: (ids: RowId[]) => void;
  /** Override row identity. Defaults to `item.id`. */
  getRowId?: (item: T) => RowId;

  // Search
  searchQuery?: string;
  onSearchChange?: (text: string) => void;

  // Sort
  onSort?: (columnKey: string, direction: SortDirection) => void;
  sortColumn?: string;
  sortDirection?: SortDirection;
  /** When `false`, cycling sort skips the cleared (`null`) state. Default: `true`. */
  enableSortClear?: boolean;

  // Pagination
  pagination?: PaginationProps;

  // Density
  density?: Density;
  onDensityChange?: (d: Density) => void;

  // Column Visibility & Order
  visibleColumns?: string[];
  onToggleColumn?: (key: string) => void;
  /** Controlled column order. When omitted, order is managed internally. */
  columnOrder?: string[];
  onColumnReorder?: (newOrder: string[]) => void;
  enableColumnReorder?: boolean;

  // Sticky
  stickyColumns?: string[];
  onToggleSticky?: (key: string) => void;

  // Filters
  filters?: Record<string, FilterValue>;
  onFilterChange?: (key: string, value: FilterValue) => void;

  // Row Operations
  onRowChange?: (newItem: T) => void;
  onRowReorder?: (fromIndex: number, toIndex: number) => void;
  enableRowReorder?: boolean;
  rowGroupKey?: keyof T;

  // Styling
  containerStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  rowStyle?: StyleProp<ViewStyle>;
  getRowStyle?: (item: T, index: number) => StyleProp<ViewStyle>;

  // Theme & I18n
  theme?: TableTheme | 'light' | 'dark';
  themeConfig?: Partial<TableTheme>;
  translations?: Partial<TableTranslations>;

  // Selection vs reorder mode (semi-controlled)
  selectionMode?: SelectionMode;
  onSelectionModeChange?: (mode: SelectionMode) => void;

  scrollEnabled?: boolean;
  onRowPress?: (item: T) => void;

  // Loading / error
  isLoading?: boolean;
  error?: string | boolean | Error | null;
  onRetry?: () => void;

  // Toolbar slots (independent — any subset can show)
  /** Force toolbar on/off. Default: shown when any slot has a handler. */
  showToolbar?: boolean;
  showSearch?: boolean;
  showDensity?: boolean;
  showColumnMenu?: boolean;
}

/**
 * Optional 3rd argument to `useTable`. A number is still accepted as `initialItemsPerPage`.
 */
export interface UseTableOptions<T extends TableRow> {
  initialItemsPerPage?: number;
  itemsPerPageOptions?: number[];
  getRowId?: (item: T) => RowId;
  selectAllScope?: SelectAllScope;
  enableSelection?: boolean;
  searchKeys?: Array<Extract<keyof T, string> | string>;
  initialSort?: { key: string; direction: SortDirection };
  initialDensity?: Density;
  initialFilters?: Record<string, FilterValue>;
  onSelectionChange?: (ids: RowId[]) => void;
}
