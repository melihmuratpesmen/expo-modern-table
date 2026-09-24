import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
  TextInput,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import {
  GestureDetector,
  GestureType,
  ScrollView as GHScrollView,
} from 'react-native-gesture-handler';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Hand,
  AlignJustify,
} from 'lucide-react-native';
import {
  ModernTableProps,
  Column,
  Density,
  RowId,
  SelectionMode,
  TableRow,
  DEFAULT_TRANSLATIONS,
} from './types';
import { TableToolbar } from './TableToolbar';
import { Checkbox } from './Checkbox';
import { ColumnFilterModal } from './ColumnFilterModal';
import { useTableTheme } from './hooks/useTableTheme';
import { TableTheme, themeFallbacks } from './theme/tokens';
import { DraggableHeader } from './DraggableHeader';
import { DraggableRow } from './DraggableRow';
import { nextSortDirection } from './core/sort';
import { isEmptyFilterValue } from './core/filter';
import { moveKey, reconcileOrder } from './core/columns';
import { getDropIndex } from './core/reorder';
import { INVALID_EDIT, parseEditedValue } from './core/edit';
import { darkenColor } from './utils/color';
import { SIGNED_DECIMAL_KEYBOARD } from './utils/keyboard';

const CHECKBOX_WIDTH = 50;
const DEFAULT_COLUMN_WIDTH = 100;
/** Space above the first row of each group when `rowGroupKey` is set. */
const GROUP_GAP = 4;

const ROW_HEIGHTS: Record<Density, number> = {
  compact: 36,
  standard: 48,
  comfortable: 64,
};

const AnimatedGHScrollView = Animated.createAnimatedComponent(GHScrollView);

type PositionedColumn<T> = Column<T> & {
  offsetX: number;
  stickyOffset: number;
  isSticky?: boolean;
};

type EditingCell = { id: RowId; key: string; initialText: string };

const getColumnWidth = <T,>(col: Column<T>) => col.width || DEFAULT_COLUMN_WIDTH;

const getAlign = (align?: 'left' | 'center' | 'right') => {
  switch (align) {
    case 'center':
      return 'center';
    case 'right':
      return 'flex-end';
    default:
      return 'flex-start';
  }
};

export function ModernTable<T extends TableRow>({
  data,
  columns,
  onSort,
  sortColumn,
  sortDirection,
  pagination,
  containerStyle,
  headerStyle,
  rowStyle,
  searchQuery,
  onSearchChange,
  density = 'standard',
  onDensityChange,
  visibleColumns,
  onToggleColumn,
  enableSelection,
  selectedIds,
  onToggleRow,
  onToggleAll,
  isAllSelected,
  onRowChange,
  stickyColumns,
  onToggleSticky,
  filters,
  onFilterChange,
  theme = 'light',
  themeConfig,
  columnOrder: columnOrderProp,
  onColumnReorder,
  enableRowReorder,
  enableColumnReorder = false,
  onRowReorder,
  rowGroupKey,
  translations,
  getRowStyle,
  scrollEnabled = true,
  onRowPress,
  selectionMode: selectionModeProp,
  onSelectionModeChange,
  screenOrientation,
  onFullscreenChange,
}: ModernTableProps<T>) {
  const tableTheme = useTableTheme(theme, themeConfig);
  const styles = useMemo(() => createStyles(tableTheme), [tableTheme]);
  const t = useMemo(() => ({ ...DEFAULT_TRANSLATIONS, ...translations }), [translations]);

  // --- COLUMN ORDER ---
  // Controlled via `columnOrder`, otherwise internal. Either way it is reconciled with the
  // current column keys, so added / removed columns never need an effect to sync.
  const columnKeys = useMemo(() => columns.map(c => c.key as string), [columns]);
  const [internalColumnOrder, setInternalColumnOrder] = useState<string[]>(columnKeys);
  const isColumnOrderControlled = columnOrderProp !== undefined;
  const columnOrder = useMemo(
    () => reconcileOrder(columnOrderProp ?? internalColumnOrder, columnKeys),
    [columnOrderProp, internalColumnOrder, columnKeys]
  );

  // --- SELECTION / REORDER MODE ---
  const [internalSelectionMode, setInternalSelectionMode] = useState<SelectionMode>('select');
  const isSelectionModeControlled = selectionModeProp !== undefined;
  const selectionMode = isSelectionModeControlled ? selectionModeProp : internalSelectionMode;
  const isReorderMode = selectionMode === 'reorder';
  // The leading column holds checkboxes, or drag handles in reorder mode — so it is also
  // needed for row reordering when selection itself is disabled.
  const showLeadingColumn = !!enableSelection || isReorderMode;
  const leadingWidth = showLeadingColumn ? CHECKBOX_WIDTH : 0;

  const toggleSelectionMode = () => {
    const next: SelectionMode = isReorderMode ? 'select' : 'reorder';
    if (!isSelectionModeControlled) setInternalSelectionMode(next);
    onSelectionModeChange?.(next);
  };

  const [viewportWidth, setViewportWidth] = useState(0);
  const handleViewportLayout = (e: LayoutChangeEvent) =>
    setViewportWidth(e.nativeEvent.layout.width);

  const scrollX = useRef(new Animated.Value(0)).current;

  // --- EDIT STATE ---
  // The input is uncontrolled: typed text lives in a ref so rows don't re-render per keystroke.
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const editingRef = useRef<EditingCell | null>(null);
  const editTextRef = useRef('');

  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);

  // --- COLUMN LAYOUT ---
  const activeColumns = useMemo(() => {
    const visible = visibleColumns ? new Set(visibleColumns) : null;
    const position = new Map(columnOrder.map((key, index) => [key, index]));
    return columns
      .filter(col => !visible || visible.has(col.key as string))
      .sort((a, b) => (position.get(a.key as string) ?? 0) - (position.get(b.key as string) ?? 0));
  }, [columns, visibleColumns, columnOrder]);

  const columnsWithOffsets = useMemo<PositionedColumn<T>[]>(() => {
    const result: PositionedColumn<T>[] = [];
    let currentX = leadingWidth;
    let stickyAccumulator = leadingWidth;

    for (const col of activeColumns) {
      const width = getColumnWidth(col);
      const isSticky = stickyColumns ? stickyColumns.includes(col.key as string) : col.isSticky;
      result.push({ ...col, offsetX: currentX, stickyOffset: stickyAccumulator, isSticky });
      currentX += width;
      if (isSticky) stickyAccumulator += width;
    }
    return result;
  }, [activeColumns, leadingWidth, stickyColumns]);

  const columnWidths = useMemo(() => activeColumns.map(getColumnWidth), [activeColumns]);
  const totalWidth = leadingWidth + columnWidths.reduce((acc, width) => acc + width, 0);
  const currentRowHeight = ROW_HEIGHTS[density];
  // iOS + FlashList can keep stale recycled cells after rapid sort/order switches.
  // Remount list on identity changes to force consistent redraw.
  const listIdentityKey = `${sortColumn ?? 'nosort'}-${sortDirection ?? 'none'}-${columnOrder.join('|')}`;

  // --- REORDER ---
  const handleHeaderDragEnd = (fromIndex: number, translationX: number) => {
    const toIndex = getDropIndex(columnWidths, fromIndex, translationX);
    const fromKey = columnsWithOffsets[fromIndex]?.key as string | undefined;
    const toKey = columnsWithOffsets[toIndex]?.key as string | undefined;
    if (toIndex === fromIndex || !fromKey || !toKey) return;

    // Move by key within the full order, so hidden columns don't shift the target.
    const next = moveKey(columnOrder, fromKey, toKey);
    if (!isColumnOrderControlled) setInternalColumnOrder(next);
    onColumnReorder?.(next);
  };

  const rowSizes = useMemo(() => {
    if (!isReorderMode) return [];
    return data.map((item, index) => {
      const startsGroup =
        !!rowGroupKey && index > 0 && item[rowGroupKey] !== data[index - 1][rowGroupKey];
      return currentRowHeight + (startsGroup ? GROUP_GAP : 0);
    });
  }, [isReorderMode, data, rowGroupKey, currentRowHeight]);

  const handleRowDragEnd = (fromIndex: number, translationY: number) => {
    if (sortDirection) return; // Order is meaningless while a sort is applied
    const toIndex = getDropIndex(rowSizes, fromIndex, translationY);
    if (toIndex !== fromIndex) onRowReorder?.(fromIndex, toIndex);
  };

  // --- EDIT LOGIC ---
  const startEdit = (item: T, key: string) => {
    const value = item[key as keyof T];
    const cell: EditingCell = {
      id: item.id,
      key,
      initialText: value === null || value === undefined ? '' : String(value),
    };
    editingRef.current = cell;
    editTextRef.current = cell.initialText;
    setEditingCell(cell);
  };

  /** Commits once per edit — submit also blurs, and the ref drops the second call. */
  const commitEdit = (item: T, key: string) => {
    const cell = editingRef.current;
    if (!cell || cell.id !== item.id || cell.key !== key) return;
    editingRef.current = null;
    setEditingCell(null);

    const text = editTextRef.current;
    if (!onRowChange || text === cell.initialText) return;
    const value = parseEditedValue(text, item[key as keyof T]);
    if (value === INVALID_EDIT) return;
    onRowChange({ ...item, [key]: value });
  };

  // --- STICKY STYLE GENERATOR ---
  const getStickyStyle = (col: PositionedColumn<T>, index: number, backgroundColor: string) => {
    if (!col.isSticky) return {};

    const threshold = col.offsetX - col.stickyOffset;

    return {
      position: 'relative',
      zIndex: 100 - index,
      backgroundColor,
      transform: [
        {
          translateX: scrollX.interpolate({
            inputRange: [-1, threshold, threshold + 1],
            outputRange: [0, 0, 1],
            extrapolateLeft: 'clamp',
          }),
        },
      ],
      borderRightWidth: 1,
      borderRightColor: tableTheme.border,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 3,
    } as unknown as StyleProp<ViewStyle>;
  };

  const markedHeaderColor = (col: Column<T>) =>
    col.markedColor
      ? darkenColor(col.markedColor, 20)
      : (tableTheme.markedHeaderBackground ?? themeFallbacks.markedHeaderBackground);

  const markedCellColor = (col: Column<T>) =>
    col.markedColor || (tableTheme.markedBackground ?? themeFallbacks.markedBackground);

  // --- RENDERERS ---

  const renderLeadingCell = (
    type: 'header' | 'row',
    item?: T,
    bgColor: string = tableTheme.background,
    dragGesture?: GestureType
  ) => {
    const isHeader = type === 'header';

    if (isReorderMode) {
      if (isHeader) {
        return (
          <View
            style={[styles.stickyCheckbox, { height: currentRowHeight, backgroundColor: bgColor }]}
          >
            <Hand size={20} color={tableTheme.textSecondary} />
          </View>
        );
      }

      const DragHandle = (
        <View style={{ opacity: 0.5 }}>
          <AlignJustify size={20} color={tableTheme.text} />
        </View>
      );

      return (
        <Animated.View
          style={[
            styles.stickyCheckbox,
            {
              height: currentRowHeight,
              backgroundColor: bgColor,
              transform: [
                {
                  translateX: scrollX.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [0, 0, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {dragGesture ? (
            <GestureDetector gesture={dragGesture}>{DragHandle}</GestureDetector>
          ) : (
            DragHandle
          )}
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.stickyCheckbox,
          {
            height: currentRowHeight,
            backgroundColor: bgColor,
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [0, 0, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Checkbox
          checked={isHeader ? !!isAllSelected : item ? selectedIds?.has(item.id) || false : false}
          onPress={() => (isHeader ? onToggleAll?.() : item && onToggleRow?.(item.id))}
          activeColor={tableTheme.primary}
          borderColor={tableTheme.textSecondary}
          checkColor={tableTheme.textInverse}
        />
      </Animated.View>
    );
  };

  const renderHeaderCell = (col: PositionedColumn<T>, index: number) => {
    const key = col.key as string;
    const width = getColumnWidth(col);
    const isActiveSort = sortColumn === key;
    const isFiltered = !isEmptyFilterValue(filters?.[key]);

    const headerContent = (
      <View
        style={[
          styles.headerCell,
          { width, justifyContent: getAlign(col.align) },
          headerStyle,
          (col.isMarked || col.markedColor) && { backgroundColor: markedHeaderColor(col) },
          col.headerStyle,
        ]}
      >
        <TouchableOpacity
          style={[styles.headerContent, { justifyContent: getAlign(col.align) }]}
          onPress={() => onSort?.(key, nextSortDirection(sortColumn, sortDirection, key))}
          disabled={!onSort}
        >
          <Text style={styles.headerText}>{col.title}</Text>
          {isActiveSort &&
            (sortDirection === 'asc' ? (
              <ChevronUp size={16} color={tableTheme.text} />
            ) : (
              <ChevronDown size={16} color={tableTheme.text} />
            ))}
        </TouchableOpacity>

        {col.filterConfig && (
          <TouchableOpacity
            style={[styles.filterIcon, isFiltered && styles.filterIconActive]}
            onPress={() => setActiveFilterColumn(key)}
            accessibilityRole="button"
            accessibilityLabel={`${t.filter} ${col.title}`}
          >
            <ListFilter
              size={16}
              color={isFiltered ? tableTheme.primary : tableTheme.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    );

    if (!col.isSticky && enableColumnReorder) {
      return (
        <DraggableHeader
          key={key}
          width={width}
          height={currentRowHeight}
          index={index}
          theme={tableTheme}
          onDragEnd={handleHeaderDragEnd}
          testID={`header-drag-${key}`}
        >
          {headerContent}
        </DraggableHeader>
      );
    }

    return (
      <Animated.View
        key={key}
        style={[
          styles.headerCellContainer,
          { width },
          getStickyStyle(col, index, tableTheme.headerBackground),
        ]}
      >
        {headerContent}
      </Animated.View>
    );
  };

  const renderRow = ({ item, index }: ListRenderItemInfo<T>) => {
    const isEven = index % 2 === 0;
    const isSelected = selectedIds?.has(item.id);
    const rowBgColor = isSelected
      ? tableTheme.rowSelected
      : isEven
        ? tableTheme.rowEven
        : tableTheme.rowOdd;

    let isFirstInGroup = false;
    let isLastInGroup = false;

    if (rowGroupKey) {
      const currentGroup = item[rowGroupKey];
      const prevGroup = index > 0 ? data[index - 1][rowGroupKey] : undefined;
      const nextGroup = index < data.length - 1 ? data[index + 1][rowGroupKey] : undefined;

      isFirstInGroup = currentGroup !== prevGroup;
      isLastInGroup = currentGroup !== nextGroup;
    }

    const renderRowContent = (dragGesture?: GestureType) => {
      const RowComponent = onRowPress ? TouchableOpacity : View;
      return (
        <RowComponent
          onPress={onRowPress ? () => onRowPress(item) : undefined}
          activeOpacity={onRowPress ? 0.7 : 1}
          style={[
            styles.row,
            { backgroundColor: rowBgColor, height: currentRowHeight },
            isFirstInGroup && {
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              marginTop: index === 0 ? 0 : GROUP_GAP,
            },
            isLastInGroup && {
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
            },
            rowStyle,
            getRowStyle?.(item, index),
          ]}
        >
          {showLeadingColumn && renderLeadingCell('row', item, rowBgColor, dragGesture)}

          {columnsWithOffsets.map((col, colIndex) => {
            const key = col.key as string;
            const value = item[key as keyof T];
            const isEditing = editingCell?.id === item.id && editingCell?.key === key;
            const canEdit = !!col.editable && !!onRowChange;

            return (
              <Animated.View
                key={key}
                style={[
                  styles.cellBase,
                  {
                    width: getColumnWidth(col),
                    justifyContent: getAlign(col.align),
                    height: currentRowHeight,
                  },
                  getStickyStyle(col, colIndex, rowBgColor),
                  (col.isMarked || col.markedColor) && { backgroundColor: markedCellColor(col) },
                  col.style,
                ]}
              >
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    defaultValue={editingCell.initialText}
                    onChangeText={text => {
                      editTextRef.current = text;
                    }}
                    onBlur={() => commitEdit(item, key)}
                    keyboardType={typeof value === 'number' ? SIGNED_DECIMAL_KEYBOARD : 'default'}
                    selectTextOnFocus
                    autoFocus
                    placeholderTextColor={tableTheme.textSecondary}
                  />
                ) : (
                  <TouchableOpacity
                    disabled={!canEdit}
                    onPress={() => startEdit(item, key)}
                    style={[styles.cellTouchable, { alignItems: getAlign(col.align) }]}
                  >
                    {col.renderCell ? (
                      col.renderCell(item, index)
                    ) : (
                      <Text
                        style={[
                          styles.cellText,
                          canEdit && styles.editableText,
                          { textAlign: col.align || 'left' },
                        ]}
                        numberOfLines={1}
                      >
                        {String(value)}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </Animated.View>
            );
          })}
        </RowComponent>
      );
    };

    if (isReorderMode) {
      return (
        <DraggableRow
          key={String(item.id)}
          index={index}
          theme={tableTheme}
          isDragEnabled={!sortDirection}
          onDragEnd={handleRowDragEnd}
          testID={`row-drag-${item.id}`}
        >
          {({ dragGesture }) => renderRowContent(dragGesture)}
        </DraggableRow>
      );
    }

    return renderRowContent();
  };

  // Everything renderRow reads besides `data`, so FlashList re-renders rows exactly when needed.
  const extraData = useMemo(
    () => ({
      selectedIds,
      editingCell,
      columnsWithOffsets,
      currentRowHeight,
      showLeadingColumn,
      isReorderMode,
      sortDirection,
      tableTheme,
      rowStyle,
      getRowStyle,
      rowGroupKey,
      onRowPress,
      onRowChange,
      onToggleRow,
      onRowReorder,
      rowSizes,
    }),
    [
      selectedIds,
      editingCell,
      columnsWithOffsets,
      currentRowHeight,
      showLeadingColumn,
      isReorderMode,
      sortDirection,
      tableTheme,
      rowStyle,
      getRowStyle,
      rowGroupKey,
      onRowPress,
      onRowChange,
      onToggleRow,
      onRowReorder,
      rowSizes,
    ]
  );

  const showToolbar = !!(onSearchChange && onDensityChange && onToggleColumn);
  const activeFilterDef = activeFilterColumn
    ? columns.find(c => c.key === activeFilterColumn)
    : undefined;

  return (
    <View style={[styles.container, containerStyle]}>
      {showToolbar && (
        <TableToolbar
          searchQuery={searchQuery || ''}
          onSearchChange={onSearchChange!}
          density={density}
          onDensityChange={onDensityChange!}
          columns={columns}
          visibleColumns={visibleColumns || []}
          onToggleColumn={onToggleColumn!}
          stickyColumns={stickyColumns}
          onToggleSticky={onToggleSticky}
          theme={tableTheme}
          enableRowReorder={enableRowReorder}
          selectionMode={selectionMode}
          onToggleSelectionMode={toggleSelectionMode}
          selectedCount={selectedIds?.size || 0}
          translations={t}
          screenOrientation={screenOrientation}
          onFullscreenChange={onFullscreenChange}
        />
      )}

      <View style={styles.viewport} onLayout={handleViewportLayout}>
        <AnimatedGHScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          bounces={false}
          scrollEventThrottle={16}
          contentContainerStyle={{ flexGrow: 1 }}
          nestedScrollEnabled={true}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: true,
          })}
        >
          {/*
            Fill the table's own width (not the screen's) so there is no phantom scroll.
            Width is explicit only: `flex: 1` would put this view under flex-basis rules on the
            scroll axis. Height comes from the default cross-axis stretch.
          */}
          <View style={{ width: Math.max(viewportWidth, totalWidth) }}>
            {/* HEADER */}
            <View style={[styles.header, headerStyle, { height: currentRowHeight }]}>
              {showLeadingColumn &&
                renderLeadingCell('header', undefined, tableTheme.headerBackground)}
              {columnsWithOffsets.map((col, index) => renderHeaderCell(col, index))}
            </View>

            {/* BODY */}
            <View style={{ flex: 1, minHeight: 2 }}>
              <FlashList
                key={Platform.OS === 'ios' ? listIdentityKey : undefined}
                data={data}
                extraData={extraData}
                renderItem={renderRow}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={styles.listContent}
                // FlashList v1 needs estimatedItemSize; v2 dropped it from its types. A
                // ts-expect-error would break type-checking against v1, so ignore instead.
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                estimatedItemSize={currentRowHeight}
                scrollEnabled={scrollEnabled}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t.empty}</Text>
                  </View>
                }
              />
            </View>
          </View>
        </AnimatedGHScrollView>
      </View>

      {pagination && (
        <View style={styles.paginationContainer}>
          <View style={styles.paginationLeft}>
            {pagination.itemsPerPageOptions && pagination.onItemsPerPageChange && (
              <View style={styles.perPageContainer}>
                <Text style={styles.perPageLabel}>{t.show}</Text>
                <View style={styles.perPageButtons}>
                  {pagination.itemsPerPageOptions.map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.perPageButton,
                        pagination.itemsPerPage === option && styles.perPageButtonActive,
                      ]}
                      onPress={() => pagination.onItemsPerPageChange?.(option)}
                    >
                      <Text
                        style={[
                          styles.perPageButtonText,
                          pagination.itemsPerPage === option && styles.perPageButtonTextActive,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.paginationRight}>
            <Text style={styles.pageInfo}>
              {t.page} {pagination.currentPage} / {pagination.totalPages}
            </Text>
            <View style={styles.paginationButtons}>
              <TouchableOpacity
                disabled={pagination.currentPage === 1}
                onPress={() => pagination.onPageChange(pagination.currentPage - 1)}
                style={[styles.pageButton, pagination.currentPage === 1 && styles.disabledButton]}
              >
                <ChevronLeft
                  size={20}
                  color={pagination.currentPage === 1 ? tableTheme.textSecondary : tableTheme.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                disabled={pagination.currentPage === pagination.totalPages}
                onPress={() => pagination.onPageChange(pagination.currentPage + 1)}
                style={[
                  styles.pageButton,
                  pagination.currentPage === pagination.totalPages && styles.disabledButton,
                ]}
              >
                <ChevronRight
                  size={20}
                  color={
                    pagination.currentPage === pagination.totalPages
                      ? tableTheme.textSecondary
                      : tableTheme.text
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {activeFilterDef?.filterConfig && (
        <ColumnFilterModal
          key={activeFilterColumn}
          onClose={() => setActiveFilterColumn(null)}
          columnTitle={activeFilterDef.title}
          filterConfig={activeFilterDef.filterConfig}
          currentValue={filters?.[activeFilterDef.key as string]}
          onApply={value => {
            onFilterChange?.(activeFilterDef.key as string, value);
            setActiveFilterColumn(null);
          }}
          theme={tableTheme}
          translations={t}
        />
      )}
    </View>
  );
}

function createStyles(theme: TableTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1, // Softer shadow
      shadowRadius: 12, // Larger spread
      elevation: 5,
    },
    viewport: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      backgroundColor: theme.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      alignItems: 'center',
    },
    headerCellContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: '100%',
    },
    headerCell: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8, // More breathing room
      borderRightWidth: 0, // Removed vertical borders for cleaner look
      height: '100%',
      justifyContent: 'space-between',
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      height: '100%',
      gap: 6,
    },
    filterIcon: {
      padding: 6,
      borderRadius: 6,
      backgroundColor: theme.surfaceHighlight,
    },
    filterIconActive: {
      backgroundColor: theme.primaryLight,
    },
    cellBase: {
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderRightWidth: 0, // Removing vertical borders
    },
    // Fills the whole cell so the tap target is the cell, not just the text line.
    cellTouchable: {
      flex: 1,
      alignSelf: 'stretch',
      justifyContent: 'center',
    },
    headerText: {
      fontFamily: theme.fontFamily.bold,
      color: theme.headerText,
      fontSize: 11,
      textTransform: 'uppercase', // Modern touch
      letterSpacing: 0.5,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    cellText: {
      fontSize: 14,
      color: theme.text,
      fontFamily: theme.fontFamily.medium,
    },
    editableText: {
      color: theme.primary,
      fontFamily: theme.fontFamily.semibold,
    },
    stickyCheckbox: {
      width: CHECKBOX_WIDTH,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      zIndex: 101,
      borderRightWidth: 1, // Keep border for sticky separator
      borderRightColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 0 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    editInput: {
      flex: 1,
      height: 36,
      padding: 0,
      borderWidth: 1.5,
      borderColor: theme.primary,
      borderRadius: 6,
      paddingHorizontal: 10,
      backgroundColor: theme.background,
      fontSize: 14,
      color: theme.text,
    },
    listContent: {
      paddingBottom: 0,
    },
    emptyContainer: {
      padding: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 16,
      marginTop: 12,
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.background,
      zIndex: 200,
    },
    paginationLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    paginationRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    perPageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.surfaceHighlight,
      padding: 4,
      borderRadius: 8,
    },
    perPageLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: 4,
    },
    perPageButtons: {
      flexDirection: 'row',
      gap: 2,
    },
    perPageButton: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
    },
    perPageButtonActive: {
      backgroundColor: theme.background,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    perPageButtonText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    perPageButtonTextActive: {
      color: theme.primary,
      fontFamily: theme.fontFamily.bold,
    },
    pageInfo: {
      fontSize: 13,
      color: theme.textSecondary,
      fontFamily: theme.fontFamily.medium,
    },
    paginationButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    pageButton: {
      padding: 6,
      borderRadius: 8,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    disabledButton: {
      opacity: 0.4,
      backgroundColor: theme.surfaceHighlight,
    },
  });
}
