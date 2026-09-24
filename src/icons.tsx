import { ComponentType, createContext, useContext } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import {
  AlignJustify,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  Hand,
  ListChecks,
  ListFilter,
  Maximize2,
  Minimize2,
  Minus,
  Pin,
  Scaling,
  Search,
  X,
} from 'lucide-react-native';

/** Any icon component taking lucide-style props (lucide, @expo/vector-icons wrappers, SVGs). */
export type TableIcon = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}>;

export interface TableIcons {
  sortAsc: TableIcon;
  sortDesc: TableIcon;
  filter: TableIcon;
  search: TableIcon;
  columns: TableIcon;
  pin: TableIcon;
  fullscreen: TableIcon;
  exitFullscreen: TableIcon;
  density: TableIcon;
  /** Toolbar button while in select mode (tap to switch to row reorder). */
  selectMode: TableIcon;
  /** Toolbar button while in row reorder mode. */
  reorderMode: TableIcon;
  dragHandle: TableIcon;
  /** Header of the drag-handle column in reorder mode. */
  reorderHeader: TableIcon;
  close: TableIcon;
  check: TableIcon;
  indeterminate: TableIcon;
  previousPage: TableIcon;
  nextPage: TableIcon;
}

export const defaultIcons: TableIcons = {
  sortAsc: ChevronUp,
  sortDesc: ChevronDown,
  filter: ListFilter,
  search: Search,
  columns: Eye,
  pin: Pin,
  fullscreen: Maximize2,
  exitFullscreen: Minimize2,
  density: Scaling,
  selectMode: ListChecks,
  reorderMode: ArrowUpDown,
  dragHandle: AlignJustify,
  reorderHeader: Hand,
  close: X,
  check: Check,
  indeterminate: Minus,
  previousPage: ChevronLeft,
  nextPage: ChevronRight,
};

const TableIconsContext = createContext<TableIcons>(defaultIcons);

export const TableIconsProvider = TableIconsContext.Provider;

export function useTableIcons(): TableIcons {
  return useContext(TableIconsContext);
}
