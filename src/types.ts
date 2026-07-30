import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { TableTheme } from './theme/tokens';

export type RowId = string | number;
export type TableRow = { id: RowId };

export type SortDirection = 'asc' | 'desc' | null;
export type Density = 'compact' | 'standard' | 'comfortable';
export type SelectionMode = 'select' | 'reorder';

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
}
