import React, { useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
  TextInput,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { GestureDetector, ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Hand, // Added Hand
  AlignJustify, // Added AlignJustify for drag handle
} from 'lucide-react-native';
import {
  ModernTableProps,
  Column,
  Density,
  SelectionMode,
  TableRow,
  RowId,
  DEFAULT_TRANSLATIONS,
} from './types';
import { TableToolbar } from './TableToolbar';
import { Checkbox } from './Checkbox';
import { ColumnFilterModal } from './ColumnFilterModal';
import { useTableTheme } from './hooks/useTableTheme';
import { TableTheme } from './theme/tokens';
import { DraggableHeader } from './DraggableHeader';
import { DraggableRow } from './DraggableRow';
import type { DraggableRowChildrenProps } from './DraggableRow';
import { nextSortDirection } from './utils/sort';
import { formatTranslation } from './utils/i18n';
import { toggleSelectedId, toggleSelectedIds } from './utils/selection';

const CHECKBOX_WIDTH = 50;

const ROW_HEIGHTS: Record<Density, number> = {
  compact: 36,
  standard: 48,
  comfortable: 64,
};

type OffsetColumn<T> = Column<T> & {
  offsetX: number;
  stickyOffset: number;
  isSticky?: boolean;
};

function resolveErrorMessage(
  error: string | boolean | Error | null | undefined,
  fallback: string
): string | null {
  if (error == null || error === false) return null;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

// Helper: Darken hex color by amount (0-100)
const darkenHex = (color: string | undefined, amount: number) => {
  if (!color) return undefined;
  let useColor = color;
  if (useColor.length === 4) {
    useColor =
      '#' + useColor[1] + useColor[1] + useColor[2] + useColor[2] + useColor[3] + useColor[3];
  }

  const num = parseInt(useColor.replace('#', ''), 16);
  const r = (num >> 16) - amount;
  const g = ((num >> 8) & 0x00ff) - amount;
  const b = (num & 0x00ff) - amount;

  return (
    '#' +
    (0x1000000 + (r < 0 ? 0 : r) * 0x10000 + (g < 0 ? 0 : g) * 0x100 + (b < 0 ? 0 : b))
      .toString(16)
      .slice(1)
  );
};

const AnimatedGHScrollView = Animated.createAnimatedComponent(GHScrollView);

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
  getRowId: getRowIdProp,
  isLoading = false,
  error,
  onRetry,
  showToolbar: showToolbarProp,
  showSearch: showSearchProp,
  showDensity: showDensityProp,
  showColumnMenu: showColumnMenuProp,
  enableSortClear = true,
  isSomeSelected,
  onSelectionChange,
}: ModernTableProps<T>) {
  const tableTheme = useTableTheme(theme, themeConfig);
  const styles = useMemo(() => createStyles(tableTheme), [tableTheme]);
  const t = { ...DEFAULT_TRANSLATIONS, ...translations };
  const resolveRowId = useCallback(
    (item: T) => (getRowIdProp ? getRowIdProp(item) : item.id),
    [getRowIdProp]
  );

  const [internalColumnOrder, setInternalColumnOrder] = useState<string[]>(() =>
    columns.map(c => c.key as string)
  );
  const isColumnOrderControlled = columnOrderProp !== undefined;
  const columnOrder = isColumnOrderControlled ? columnOrderProp : internalColumnOrder;

  React.useEffect(() => {
    if (isColumnOrderControlled) return;
    const keys = columns.map(c => c.key as string);
    setInternalColumnOrder(prev => {
      if (prev.length === keys.length && prev.every((k, i) => k === keys[i])) return prev;
      // Preserve relative order for keys that still exist, append new keys
      const keySet = new Set(keys);
      const kept = prev.filter(k => keySet.has(k));
      const added = keys.filter(k => !kept.includes(k));
      return [...kept, ...added];
    });
  }, [columns, isColumnOrderControlled]);

  const [internalSelectionMode, setInternalSelectionMode] = useState<SelectionMode>('select');
  const isSelectionModeControlled = selectionModeProp !== undefined;
  const selectionMode = isSelectionModeControlled ? selectionModeProp : internalSelectionMode;

  const toggleSelectionMode = () => {
    const next: SelectionMode = selectionMode === 'select' ? 'reorder' : 'select';
    if (!isSelectionModeControlled) {
      setInternalSelectionMode(next);
    }
    onSelectionModeChange?.(next);
  };

  const handleColumnReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newOrder = [...columnOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    const targetIndex = Math.max(0, Math.min(newOrder.length, toIndex));
    newOrder.splice(targetIndex, 0, movedItem);

    if (!isColumnOrderControlled) {
      setInternalColumnOrder(newOrder);
    }
    onColumnReorder?.(newOrder);
  };

  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;

  // Edit Mode State
  const [editingCell, setEditingCell] = useState<{
    id: string | number;
    key: string;
  } | null>(null);

  const [tempValue, setTempValue] = useState('');
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);

  // 1. Prepare Active Columns
  // 1. Prepare Active Columns based on Order
  const activeColumns = useMemo(() => {
    // Filter visible columns first
    const visibleCols = columns.filter(col =>
      visibleColumns ? visibleColumns.includes(col.key as string) : true
    );

    // Sort according to columnOrder
    return visibleCols.sort(
      (a, b) => columnOrder.indexOf(a.key as string) - columnOrder.indexOf(b.key as string)
    );
  }, [columns, visibleColumns, columnOrder]);

  // 2. Pre-calculate Offsets (Memoized)
  const columnsWithOffsets = useMemo(() => {
    let currentX = enableSelection ? CHECKBOX_WIDTH : 0;
    let stickyAccumulator = enableSelection ? CHECKBOX_WIDTH : 0;

    return activeColumns.map(col => {
      const width = col.width || 100;
      const colData = {
        ...col,
        offsetX: currentX,
        stickyOffset: stickyAccumulator,
      };

      currentX += width;

      const isSticky = stickyColumns ? stickyColumns.includes(col.key as string) : col.isSticky;

      if (isSticky) {
        stickyAccumulator += width;
      }

      return { ...colData, isSticky };
    });
  }, [activeColumns, enableSelection, stickyColumns]);

  const contentWidth = activeColumns.reduce((acc, col) => acc + (col.width || 100), 0);
  const totalWidth = enableSelection ? contentWidth + CHECKBOX_WIDTH : contentWidth;
  const currentRowHeight = ROW_HEIGHTS[density];
  // iOS + FlashList can keep stale recycled cells after rapid sort/order switches.
  // Remount list on identity changes to force consistent redraw.
  const listIdentityKey = `${sortColumn ?? 'nosort'}-${sortDirection ?? 'none'}-${columnOrder.join('|')}`;

  // --- EDIT LOGIC ---
  const handleStartEdit = (item: T, key: string, value: unknown) => {
    setEditingCell({ id: resolveRowId(item), key });
    setTempValue(String(value ?? ''));
  };

  const handleFinishEdit = (item: T, key: string) => {
    if (editingCell && onRowChange) {
      const newItem = { ...item, [key]: tempValue };
      onRowChange(newItem);
    }
    setEditingCell(null);
  };

  const handleToggleRow = (id: RowId) => {
    onToggleRow?.(id);
    if (onSelectionChange && selectedIds) {
      onSelectionChange(Array.from(toggleSelectedId(selectedIds, id)));
    }
  };

  const handleToggleAll = () => {
    onToggleAll?.();
    if (onSelectionChange && selectedIds) {
      const poolIds = data.map(item => resolveRowId(item));
      onSelectionChange(Array.from(toggleSelectedIds(selectedIds, poolIds)));
    }
  };

  // --- STICKY STYLE GENERATOR ---
  const getStickyStyle = (col: OffsetColumn<T>, index: number, backgroundColor: string) => {
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

  // --- RENDERERS ---

  const renderCheckboxColumn = (
    type: 'header' | 'row',
    item?: T,
    bgColor: string = tableTheme.background,
    dragGesture?: DraggableRowChildrenProps['dragGesture']
  ) => {
    const isHeader = type === 'header';

    // If in Reorder mode, render nothing in Header, or a placeholder
    // In Row, render Drag Handle
    if (selectionMode === 'reorder') {
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
          {/* Visual Only - Drag logic is on the row wrapper */}
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
          checked={isHeader ? !!isAllSelected : item ? selectedIds?.has(resolveRowId(item)) || false : false}
          indeterminate={isHeader ? !!isSomeSelected : false}
          onPress={() => (isHeader ? handleToggleAll() : item && handleToggleRow(resolveRowId(item)))}
          activeColor={tableTheme.primary}
          borderColor={tableTheme.textSecondary}
          accessibilityLabel={isHeader ? t.selectAll : t.selectRow}
        />
      </Animated.View>
    );
  };

  const renderHeaderCell = useCallback(
    (col: OffsetColumn<T>, index: number) => {
      const stickyStyle = getStickyStyle(col, index, tableTheme.headerBackground);
      const isSortable = !!onSort && col.sortable !== false;
      const isActiveSort = sortColumn === col.key;
      const isFiltered = filters && filters[col.key as string] !== undefined;
      const isSticky = col.isSticky || (stickyColumns && stickyColumns.includes(col.key as string));

      const headerContent = (
        <View
          style={[
            styles.headerCell, // Inner style for the content
            { width: col.width || 100 },
            col.align && {
              justifyContent:
                col.align === 'right'
                  ? 'flex-end'
                  : col.align === 'center'
                    ? 'center'
                    : 'flex-start',
            },
            headerStyle,
            (col.isMarked || col.markedColor) && {
              backgroundColor: col.markedColor
                ? darkenHex(col.markedColor, 20) // Darken custom color for header
                : '#FDE68A', // Default marked header style
            },
            col.headerStyle, // New: Apply Header Style from Column
          ]}
        >
          <TouchableOpacity
            style={[
              styles.headerContent,
              col.align === 'center' && { justifyContent: 'center' },
              col.align === 'right' && { justifyContent: 'flex-end' },
            ]}
            onPress={() => {
              if (!isSortable || !onSort) return;
              const key = col.key as string;
              onSort(key, nextSortDirection(sortColumn, sortDirection, key, enableSortClear));
            }}
            disabled={!isSortable}
            accessibilityRole="button"
            accessibilityLabel={formatTranslation(t.sortColumn, { title: col.title })}
            accessibilityState={{ selected: isActiveSort, disabled: !isSortable }}
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
              onPress={() => setActiveFilterColumn(col.key as string)}
              accessibilityRole="button"
              accessibilityLabel={formatTranslation(t.filterColumn, { title: col.title })}
              accessibilityState={{ selected: !!isFiltered }}
            >
              <ListFilter
                size={16}
                color={isFiltered ? tableTheme.primary : tableTheme.textSecondary}
              />
            </TouchableOpacity>
          )}

          {activeFilterColumn === col.key && col.filterConfig && (
            <ColumnFilterModal
              visible={true}
              onClose={() => setActiveFilterColumn(null)}
              columnTitle={col.title}
              filterConfig={col.filterConfig}
              currentValue={filters?.[col.key as string]}
              onApply={val => {
                onFilterChange?.(col.key as string, val);
                setActiveFilterColumn(null);
              }}
              theme={tableTheme}
              translations={t}
            />
          )}
        </View>
      );

      // Wrap in DraggableHeader if not sticky AND enabled
      if (!isSticky && enableColumnReorder) {
        return (
          <DraggableHeader
            key={col.key as string}
            width={col.width || 100}
            height={currentRowHeight}
            index={index}
            columnKey={col.key as string}
            title={col.title}
            theme={tableTheme}
            onReorder={handleColumnReorder}
          >
            {headerContent}
          </DraggableHeader>
        );
      }

      // Static render for sticky or if logic prevents drag
      return (
        <Animated.View
          key={col.key as string}
          style={[
            styles.headerCellContainer, // Container style
            { width: col.width || 100 },
            stickyStyle,
          ]}
        >
          {headerContent}
        </Animated.View>
      );
    },
    [
      onSort,
      sortColumn,
      sortDirection,
      enableSortClear,
      headerStyle,
      filters,
      activeFilterColumn,
      onFilterChange,
      columnOrder,
      tableTheme,
      enableColumnReorder,
      t,
    ]
  );

  const renderRow = ({ item, index }: ListRenderItemInfo<T>) => {
    const isEven = index % 2 === 0;
    const isSelected = selectedIds?.has(resolveRowId(item));
    const rowBgColor = isSelected
      ? tableTheme.rowSelected
      : isEven
        ? tableTheme.rowEven
        : tableTheme.rowOdd;

    // Grouping Logic
    let isFirstInGroup = false;
    let isLastInGroup = false;

    if (rowGroupKey) {
      const currentGroup = item[rowGroupKey];
      const prevGroup = index > 0 ? data[index - 1][rowGroupKey] : undefined;
      const nextGroup = index < data.length - 1 ? data[index + 1][rowGroupKey] : undefined;

      isFirstInGroup = currentGroup !== prevGroup;
      isLastInGroup = currentGroup !== nextGroup;
    }

    const renderRowContent = (dragGesture?: DraggableRowChildrenProps['dragGesture']) => {
      const RowComponent = onRowPress ? TouchableOpacity : View;
      return (
        <RowComponent
          onPress={onRowPress ? () => onRowPress(item) : undefined}
          activeOpacity={onRowPress ? 0.7 : 1}
          style={[
            styles.row,
            { backgroundColor: rowBgColor, height: currentRowHeight },
            rowGroupKey && { backgroundColor: rowBgColor }, // Ensure bg color applies for radius
            isFirstInGroup && {
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              marginTop: index === 0 ? 0 : 4,
            }, // Top Radius + optional margin? Use margin only on last to simplify
            isLastInGroup && {
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
            }, // Gap after group
            rowStyle,
            getRowStyle?.(item, index),
          ]}
        >
          {enableSelection && renderCheckboxColumn('row', item, rowBgColor, dragGesture)}

          {columnsWithOffsets.map((col, colIndex) => {
            const stickyStyle = getStickyStyle(col, colIndex, rowBgColor);
            const isEditing = editingCell?.id === resolveRowId(item) && editingCell?.key === col.key;

            return (
              <Animated.View
                key={col.key as string}
                style={[
                  styles.cellBase,
                  {
                    width: col.width || 100,
                    justifyContent: getAlign(col.align),
                    height: currentRowHeight,
                  },

                  stickyStyle,
                  (col.isMarked || col.markedColor) && {
                    backgroundColor: col.markedColor || '#FEF3C7',
                  }, // Custom or Default marked cell style
                  col.style, // New: Apply Cell Style from Column
                ]}
              >
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    value={tempValue}
                    onChangeText={setTempValue}
                    onBlur={() => handleFinishEdit(item, col.key as string)}
                    onSubmitEditing={() => handleFinishEdit(item, col.key as string)}
                    autoFocus
                    placeholderTextColor="#9ca3af"
                  />
                ) : (
                  <TouchableOpacity
                    disabled={!col.editable}
                    onPress={() =>
                      handleStartEdit(item, col.key as string, item[col.key as keyof T])
                    }
                    style={{
                      flex: 1,
                      justifyContent: getAlign(col.align) || 'center',
                      width: '100%',
                    }}
                  >
                    {col.renderCell ? (
                      col.renderCell(item, index)
                    ) : (
                      <Text
                        style={[
                          styles.cellText,
                          col.editable && styles.editableText,
                          { textAlign: col.align || 'left' },
                        ]}
                        numberOfLines={1}
                      >
                        {String(item[col.key as keyof T])}
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

    if (selectionMode === 'reorder') {
      return (
        <DraggableRow
          key={String(resolveRowId(item))}
          index={index}
          rowHeight={currentRowHeight}
          theme={tableTheme}
          isDragEnabled={!sortDirection} // Disable drag if sorted
          onReorder={(from, to) => {
            if (sortDirection) return; // Double protection
            onRowReorder?.(from, to);
          }}
        >
          {({ dragGesture }) => renderRowContent(dragGesture)}
        </DraggableRow>
      );
    }

    return renderRowContent();
  };

  const showSearch = showSearchProp ?? !!onSearchChange;
  const showDensity = showDensityProp ?? !!onDensityChange;
  const showColumnMenu = showColumnMenuProp ?? !!onToggleColumn;
  const showToolbar =
    showToolbarProp ??
    (showSearch || showDensity || showColumnMenu || !!enableRowReorder);

  const errorMessage = resolveErrorMessage(error, t.error);

  const renderEmpty = () => {
    if (errorMessage) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{errorMessage}</Text>
          {onRetry ? (
            <TouchableOpacity
              onPress={onRetry}
              style={styles.retryButton}
              accessibilityRole="button"
              accessibilityLabel={t.retry}
            >
              <Text style={styles.retryText}>{t.retry}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={tableTheme.primary} />
          <Text style={styles.emptyText}>{t.loading}</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t.empty}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {showToolbar && (
        <TableToolbar
          searchQuery={searchQuery || ''}
          onSearchChange={onSearchChange}
          density={density}
          onDensityChange={onDensityChange}
          columns={columns}
          visibleColumns={visibleColumns || []}
          onToggleColumn={onToggleColumn}
          stickyColumns={stickyColumns}
          onToggleSticky={onToggleSticky}
          theme={tableTheme}
          enableRowReorder={enableRowReorder}
          selectionMode={selectionMode}
          onToggleSelectionMode={toggleSelectionMode}
          selectedCount={selectedIds?.size || 0}
          translations={t}
          showSearch={showSearch}
          showDensity={showDensity}
          showColumnMenu={showColumnMenu}
        />
      )}

      <View style={{ flex: 1 }}>
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
          <View style={{ flex: 1 }}>
            <View
              key={SCREEN_WIDTH} // Force re-render on orientation change
              style={{ width: Math.max(SCREEN_WIDTH, totalWidth), flex: 1 }}
            >
              {/* HEADER */}
              <View style={[styles.header, headerStyle, { height: currentRowHeight }]}>
                {enableSelection &&
                  renderCheckboxColumn('header', undefined, tableTheme.headerBackground)}
                {columnsWithOffsets.map((col, index) => renderHeaderCell(col, index))}
              </View>

              {/* BODY */}
              <View style={{ flex: 1, minHeight: 2 }}>
                <FlashList
                  key={Platform.OS === 'ios' ? listIdentityKey : undefined}
                  data={data}
                  extraData={[
                    SCREEN_WIDTH,
                    selectedIds,
                    editingCell,
                    sortColumn,
                    sortDirection,
                    isLoading,
                    errorMessage,
                  ]}
                  renderItem={renderRow}
                  keyExtractor={item => String(resolveRowId(item))}
                  contentContainerStyle={styles.listContent}
                  // @ts-ignore: estimatedItemSize missing in types
                  estimatedItemSize={currentRowHeight}
                  scrollEnabled={scrollEnabled}
                  ListEmptyComponent={renderEmpty}
                />
                {isLoading && data.length > 0 ? (
                  <View style={styles.loadingOverlay} pointerEvents="none">
                    <View
                      style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: tableTheme.background, opacity: 0.72 },
                      ]}
                    />
                    <ActivityIndicator color={tableTheme.primary} />
                    <Text style={styles.loadingOverlayText}>{t.loading}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </AnimatedGHScrollView>
      </View>

      {pagination && (
        <View style={styles.paginationContainer}>
          <View style={styles.paginationLeft}>
            {/* Items Per Page Selector */}
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
                accessibilityRole="button"
                accessibilityLabel={t.previousPage}
                accessibilityState={{ disabled: pagination.currentPage === 1 }}
              >
                <ChevronLeft
                  size={20}
                  color={
                    pagination.currentPage === 1 ? tableTheme.textSecondary : tableTheme.text
                  }
                />
              </TouchableOpacity>
              <TouchableOpacity
                disabled={pagination.currentPage === pagination.totalPages}
                onPress={() => pagination.onPageChange(pagination.currentPage + 1)}
                style={[
                  styles.pageButton,
                  pagination.currentPage === pagination.totalPages && styles.disabledButton,
                ]}
                accessibilityRole="button"
                accessibilityLabel={t.nextPage}
                accessibilityState={{ disabled: pagination.currentPage === pagination.totalPages }}
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
    retryButton: {
      marginTop: 16,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: theme.primary,
    },
    retryText: {
      color: theme.textInverse,
      fontFamily: theme.fontFamily.semibold,
      fontSize: 14,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    loadingOverlayText: {
      color: theme.textSecondary,
      fontSize: 13,
      fontFamily: theme.fontFamily.medium,
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
