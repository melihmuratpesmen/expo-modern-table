import { Animated, StyleProp, ViewStyle } from 'react-native';
import { Column, Density, RowId } from './types';
import { TableTheme, themeFallbacks } from './theme/tokens';
import { darkenColor } from './utils/color';

export const CHECKBOX_WIDTH = 50;
export const EXPANDER_WIDTH = 40;
export const DEFAULT_COLUMN_WIDTH = 100;
/** Space above the first row of each group when `rowGroupKey` is set. */
export const GROUP_GAP = 4;

export const ROW_HEIGHTS: Record<Density, number> = {
  compact: 36,
  standard: 48,
  comfortable: 64,
};

/** A visible column with its resolved width and horizontal position (for sticky offsets). */
export type PositionedColumn<T> = Column<T> & {
  /** Final width after flex / resize resolution. */
  layoutWidth: number;
  offsetX: number;
  stickyOffset: number;
  isSticky?: boolean;
};

export type EditingCell = { id: RowId; key: string; initialText: string };

/** Style that may contain Animated values (sticky translateX). */
export type AnimatedViewStyle = Animated.WithAnimatedValue<StyleProp<ViewStyle>>;

export const getColumnWidth = <T>(col: Column<T>) => col.width || DEFAULT_COLUMN_WIDTH;

export const getAlign = (align?: 'left' | 'center' | 'right') => {
  switch (align) {
    case 'center':
      return 'center';
    case 'right':
      return 'flex-end';
    default:
      return 'flex-start';
  }
};

export const markedHeaderColor = <T>(col: Column<T>, theme: TableTheme) =>
  col.markedColor
    ? darkenColor(col.markedColor, 20)
    : (theme.markedHeaderBackground ?? themeFallbacks.markedHeaderBackground);

export const markedCellColor = <T>(col: Column<T>, theme: TableTheme) =>
  col.markedColor || (theme.markedBackground ?? themeFallbacks.markedBackground);
