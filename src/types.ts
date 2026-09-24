import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { TableTheme } from './theme/tokens';
import type { ScreenOrientationModule } from './hooks/useFullscreenOrientation';

export type RowId = string | number;
export type TableRow = { id: RowId };

/** `getRowId` is optional when rows have an `id` field and required otherwise. */
export type RowIdAccessor<T> = T extends TableRow
  ? { getRowId?: (row: T) => RowId }
  : { getRowId: (row: T) => RowId };

export type SortDirection = 'asc' | 'desc' | null;
export type Density = 'compact' | 'standard' | 'comfortable';
export type SelectionMode = 'select' | 'reorder';

export interface FilterConfig {
  type: 'text' | 'select' | 'boolean' | 'number-range';
  options?: string[];
}

export type FilterValue = string | boolean | { min?: number; max?: number } | undefined;

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
};

export interface Column<T> {
  key: Extract<keyof T, string> | (string & {});
  title: string;
  /** Fixed width, or the starting width of a `flex` column. Default 100. */
  width?: number;
  /** Share of the leftover horizontal space (like flex-grow). */
  flex?: number;
  minWidth?: number;
  maxWidth?: number;
  isSticky?: boolean;
  align?: 'left' | 'center' | 'right';
  /**
   * The value used for sorting, filtering, search and the default cell text. Defaults to
   * `row[key]` — use it for computed or nested values.
   */
  getValue?: (row: T) => unknown;
  /** Default true (when the table has `onSort`). */
  sortable?: boolean;
  /** Ascending comparator; replaces the built-in comparison for this column. */
  sortFn?: (a: T, b: T) => number;
  /** Include in the toolbar search. Default true. */
  searchable?: boolean;
  /** Allow drag-resizing when the table has `enableColumnResize`. Default true. */
  resizable?: boolean;
  /** Custom header content in place of the title (sort / filter icons stay). */
  renderHeader?: (column: Column<T>) => ReactNode;
  renderCell?: (item: T, index: number) => ReactNode;
  /** Tap-to-edit text cell. Needs `onRowChange`; numeric values are written back as numbers. */
  editable?: boolean;
  hidden?: boolean;

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
export interface ModernTableBaseProps<T extends object> {
  data: T[];
  columns: Column<T>[];

  // Selection
  enableSelection?: boolean;
  selectedIds?: Set<RowId>;
  isAllSelected?: boolean;
  /** Some (not all) rows selected — the header checkbox shows a dash. */
  isSomeSelected?: boolean;
  onToggleAll?: () => void;
  onToggleRow?: (id: RowId) => void;

  // Search
  searchQuery?: string;
  onSearchChange?: (text: string) => void;

  // Sort
  onSort?: (columnKey: string, direction: SortDirection) => void;
  sortColumn?: string;
  sortDirection?: SortDirection;

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

  /** Drag the right edge of a header to resize its column. */
  enableColumnResize?: boolean;
  /** Controlled column widths (key → width) set by resizing. Internal when omitted. */
  columnWidths?: Record<string, number>;
  onColumnResize?: (key: string, width: number) => void;

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

  // Toolbar
  /**
   * Default: shown when any toolbar control is available (search, density, column menu, row
   * reorder, fullscreen, custom or bulk actions). Each control needs its handler.
   */
  showToolbar?: boolean;
  /** Extra buttons at the end of the toolbar. */
  toolbarActions?: ReactNode;
  /** Replaces the search field while rows are selected, e.g. delete / export buttons. */
  renderBulkActions?: (selectedIds: Set<RowId>) => ReactNode;

  // Loading / error / empty
  /** Blocking load: a spinner replaces the empty state, or dims the rows while refetching. */
  isLoading?: boolean;
  /** Non-blocking load (e.g. next page of an infinite list): a spinner below the rows. */
  isLoadingMore?: boolean;
  /** Shown instead of the rows. A string uses the built-in error view. */
  error?: ReactNode;
  /** Shows a retry button in the built-in error view. */
  onRetry?: () => void;
  /** Replaces the built-in "no data" view. */
  emptyComponent?: ReactNode;

  // Pull to refresh / infinite scroll (passed to FlashList)
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;

  /**
   * Pass `expo-screen-orientation` (`import * as ScreenOrientation from 'expo-screen-orientation'`)
   * to show the toolbar fullscreen (landscape) button.
   */
  screenOrientation?: ScreenOrientationModule;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

/**
 * Props of `ModernTable`. Rows need an `id` field, or pass `getRowId` (memoize it — a new
 * function re-renders every row).
 */
export type ModernTableProps<T extends object> = ModernTableBaseProps<T> & RowIdAccessor<T>;
