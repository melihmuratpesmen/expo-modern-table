export { ModernTable } from './ModernTable';
export { useTable } from './hooks/useTable';
export type { UseTableResult, UseTableOptions, TableState, TableProps } from './hooks/useTable';
export { useTableTheme } from './hooks/useTableTheme';
export type { ScreenOrientationModule } from './hooks/useFullscreenOrientation';
export { defaultIcons } from './icons';
export type { TableIcons, TableIcon } from './icons';

export { lightTheme, darkTheme, defaultFontFamily } from './theme/tokens';
export type { TableTheme, TableFontFamily } from './theme/tokens';

export type {
  RowId,
  TableRow,
  RowIdAccessor,
  SortDirection,
  Density,
  SelectionMode,
  FilterConfig,
  FilterValue,
  TableTranslations,
  Column,
  PaginationProps,
  ModernTableProps,
  ModernTableBaseProps,
} from './types';
export { DEFAULT_TRANSLATIONS, TR_TRANSLATIONS } from './types';

export { normalizeSearchText, includesSearch, matchesSearchFields } from './utils/search';

// Data helpers used by `useTable` — for custom pipelines or server-side mocks.
export {
  sortRows,
  compareValues,
  filterRows,
  matchesFilter,
  searchRows,
  buildSearchIndex,
  paginateRows,
  getTotalPages,
} from './core';
export type { SortState } from './core';
