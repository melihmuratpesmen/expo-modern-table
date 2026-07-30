import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { TableTheme } from './theme/tokens';

export type SortDirection = 'asc' | 'desc' | null;
export type Density = 'compact' | 'standard' | 'comfortable';

export interface FilterConfig {
  type: 'text' | 'select' | 'boolean' | 'number-range';
  options?: string[];
}

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
};

export interface Column<T> {
  key: keyof T | string; // keyof T is better, but string allowed for flexibility
  title: string;
  width?: number;
  isSticky?: boolean;
  align?: 'left' | 'center' | 'right';
  renderCell?: (item: T, index: number) => ReactNode;
  editable?: boolean;
  hidden?: boolean;

  // Styling & Config
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

export interface ModernTableProps<T> {
  data: T[];
  columns: Column<T>[];
  stickyHeader?: boolean;

  // Selection
  enableSelection?: boolean;
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  selectedIds?: Set<string | number>;
  isAllSelected?: boolean;
  onToggleAll?: () => void;
  onToggleOne?: (id: string | number) => void;

  // Search
  enableGlobalSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;

  // Loading
  isLoading?: boolean;

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
  onColumnReorder?: (newOrder: string[]) => void;
  enableColumnReorder?: boolean;

  // Sticky
  stickyColumns?: string[];
  onToggleSticky?: (key: string) => void;

  // Filters
  filters?: Record<string, any>;
  onFilterChange?: (key: string, value: any) => void;

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
  emptyMessage?: string;

  // Theme & I18n
  theme?: TableTheme | 'light' | 'dark';
  themeConfig?: Partial<TableTheme>;
  translations?: Partial<TableTranslations>;

  // Toolbar specific
  selectionMode?: 'select' | 'reorder';
  onToggleSelectionMode?: () => void;
  scrollEnabled?: boolean;
  onRowPress?: (item: T) => void;
}
