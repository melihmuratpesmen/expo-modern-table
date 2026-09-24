import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  LayoutChangeEvent,
  ActivityIndicator,
} from 'react-native';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { defaultIcons, TableIconsProvider } from './icons';
import { useShallowStable } from './hooks/useShallowStable';
import { ModernTableProps, RowId, SelectionMode, TableRow, DEFAULT_TRANSLATIONS } from './types';
import { TableToolbar } from './TableToolbar';
import { Checkbox } from './Checkbox';
import { ColumnFilterModal } from './ColumnFilterModal';
import { useTableTheme } from './hooks/useTableTheme';
import { useStableCallback } from './hooks/useStableCallback';
import { DraggableHeader } from './DraggableHeader';
import { ColumnResizeHandle } from './ColumnResizeHandle';
import { RowContext, TableBodyRow } from './TableBodyRow';
import { createTableStyles } from './tableStyles';
import {
  AnimatedViewStyle,
  EditingCell,
  GROUP_GAP,
  PositionedColumn,
  ROW_HEIGHTS,
  CHECKBOX_WIDTH,
  DEFAULT_COLUMN_WIDTH,
  getAlign,
  getColumnWidth,
  markedHeaderColor,
} from './layout';
import { nextSortDirection } from './core/sort';
import { isEmptyFilterValue } from './core/filter';
import { moveKey, reconcileOrder, resolveColumnWidths } from './core/columns';
import { getDropIndex } from './core/reorder';
import { INVALID_EDIT, parseEditedValue } from './core/edit';

const AnimatedGHScrollView = Animated.createAnimatedComponent(GHScrollView);

const defaultGetRowId = (row: object): RowId => (row as TableRow).id;

// Resize limits for columns without their own minWidth / maxWidth.
const MIN_RESIZE_WIDTH = 40;
const MAX_RESIZE_WIDTH = 1000;

export function ModernTable<T extends object>({
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
  getRowId,
  isLoading = false,
  isLoadingMore = false,
  error,
  onRetry,
  emptyComponent,
  refreshing,
  onRefresh,
  onEndReached,
  onEndReachedThreshold,
  enableColumnResize = false,
  columnWidths: columnWidthsProp,
  onColumnResize,
  isSomeSelected,
  showToolbar: showToolbarProp,
  toolbarActions,
  renderBulkActions,
  icons: iconsProp,
}: ModernTableProps<T>) {
  const iconOverrides = useShallowStable(iconsProp);
  const icons = useMemo(() => ({ ...defaultIcons, ...iconOverrides }), [iconOverrides]);
  // `RowIdAccessor` guarantees `getRowId` when rows have no `id`; widen it for internal use.
  const rowIdOf = (getRowId as ((row: T) => RowId) | undefined) ?? defaultGetRowId;
  const tableTheme = useTableTheme(theme, themeConfig);
  const styles = useMemo(() => createTableStyles(tableTheme), [tableTheme]);
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
  // Status views (empty / loading / error) span the visible width, not the full scroll width.
  const viewportStyle = viewportWidth > 0 ? { width: viewportWidth } : undefined;

  // One Animated value drives every sticky cell; interpolations are shared per column below.
  const [scrollX] = useState(() => new Animated.Value(0));
  const handleScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: true,
      }),
    [scrollX]
  );

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

  // --- COLUMN WIDTHS ---
  // Resized widths are controlled via `columnWidths`, otherwise internal.
  const [internalWidths, setInternalWidths] = useState<Record<string, number>>({});
  const widthOverrides = columnWidthsProp ?? internalWidths;
  const resolvedWidths = useMemo(
    () =>
      resolveColumnWidths(
        activeColumns,
        viewportWidth > 0 ? viewportWidth - leadingWidth : 0,
        widthOverrides,
        DEFAULT_COLUMN_WIDTH
      ),
    [activeColumns, viewportWidth, leadingWidth, widthOverrides]
  );

  const handleColumnResize = (key: string, width: number) => {
    if (columnWidthsProp === undefined) setInternalWidths(prev => ({ ...prev, [key]: width }));
    onColumnResize?.(key, width);
  };

  const columnsWithOffsets = useMemo<PositionedColumn<T>[]>(() => {
    const result: PositionedColumn<T>[] = [];
    let currentX = leadingWidth;
    let stickyAccumulator = leadingWidth;

    for (const col of activeColumns) {
      const width = resolvedWidths.get(col.key as string) ?? getColumnWidth(col);
      const isSticky = stickyColumns ? stickyColumns.includes(col.key as string) : col.isSticky;
      result.push({
        ...col,
        layoutWidth: width,
        offsetX: currentX,
        stickyOffset: stickyAccumulator,
        isSticky,
      });
      currentX += width;
      if (isSticky) stickyAccumulator += width;
    }
    return result;
  }, [activeColumns, resolvedWidths, leadingWidth, stickyColumns]);

  const columnWidths = useMemo(
    () => columnsWithOffsets.map(col => col.layoutWidth),
    [columnsWithOffsets]
  );
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

  // Event handlers from props get stable wrappers so memoized rows don't re-render when a
  // parent passes new inline functions. Render-affecting props (getRowStyle, rowStyle,
  // columns) are used as-is.
  const handleRowPress = useStableCallback(onRowPress);
  const handleToggleRow = useStableCallback(onToggleRow);
  const handleRowChange = useStableCallback(onRowChange);
  const handleRowReorder = useStableCallback(onRowReorder);

  const handleRowDragEnd = useCallback(
    (fromIndex: number, translationY: number) => {
      if (sortDirection) return; // Order is meaningless while a sort is applied
      const toIndex = getDropIndex(rowSizes, fromIndex, translationY);
      if (toIndex !== fromIndex) handleRowReorder(fromIndex, toIndex);
    },
    [sortDirection, rowSizes, handleRowReorder]
  );

  // --- EDIT LOGIC ---
  const startEdit = useCallback(
    (item: T, key: string) => {
      const value = item[key as keyof T];
      const cell: EditingCell = {
        id: rowIdOf(item),
        key,
        initialText: value === null || value === undefined ? '' : String(value),
      };
      editingRef.current = cell;
      editTextRef.current = cell.initialText;
      setEditingCell(cell);
    },
    [rowIdOf]
  );

  const handleEditTextChange = useCallback((text: string) => {
    editTextRef.current = text;
  }, []);

  /** Commits once per edit — submit also blurs, and the ref drops the second call. */
  const commitEdit = useCallback(
    (item: T, key: string) => {
      const cell = editingRef.current;
      if (!cell || cell.id !== rowIdOf(item) || cell.key !== key) return;
      editingRef.current = null;
      setEditingCell(null);

      const text = editTextRef.current;
      if (text === cell.initialText) return;
      const value = parseEditedValue(text, item[key as keyof T]);
      if (value === INVALID_EDIT) return;
      handleRowChange({ ...item, [key]: value });
    },
    [rowIdOf, handleRowChange]
  );

  // --- STICKY STYLES ---
  // Built once per layout change and shared by every row, instead of one interpolation per
  // cell per render.
  const leadingTransform = useMemo<AnimatedViewStyle>(
    () => ({
      transform: [
        { translateX: scrollX.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 0, 1] }) },
      ],
    }),
    [scrollX]
  );

  const stickyStyles = useMemo(() => {
    const map = new Map<string, AnimatedViewStyle>();
    columnsWithOffsets.forEach((col, index) => {
      if (!col.isSticky) return;
      const threshold = col.offsetX - col.stickyOffset;
      map.set(col.key as string, {
        position: 'relative',
        zIndex: 100 - index,
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
      });
    });
    return map;
  }, [columnsWithOffsets, scrollX, tableTheme.border]);

  // --- RENDERERS ---

  const renderHeaderLeadingCell = () => (
    <Animated.View
      style={[
        styles.stickyCheckbox,
        { height: currentRowHeight, backgroundColor: tableTheme.headerBackground },
        leadingTransform,
      ]}
    >
      {isReorderMode ? (
        <icons.reorderHeader size={20} color={tableTheme.textSecondary} />
      ) : (
        <Checkbox
          checked={!!isAllSelected}
          indeterminate={!isAllSelected && !!isSomeSelected}
          onPress={() => onToggleAll?.()}
          activeColor={tableTheme.primary}
          borderColor={tableTheme.textSecondary}
          checkColor={tableTheme.textInverse}
        />
      )}
    </Animated.View>
  );

  const renderHeaderCell = (col: PositionedColumn<T>, index: number) => {
    const key = col.key as string;
    const width = col.layoutWidth;
    const isSortable = !!onSort && col.sortable !== false;
    const isActiveSort = sortColumn === key;
    const isFiltered = !isEmptyFilterValue(filters?.[key]);

    const headerContent = (
      <View
        style={[
          styles.headerCell,
          { width, justifyContent: getAlign(col.align) },
          headerStyle,
          (col.isMarked || col.markedColor) && {
            backgroundColor: markedHeaderColor(col, tableTheme),
          },
          col.headerStyle,
        ]}
      >
        <TouchableOpacity
          style={[styles.headerContent, { justifyContent: getAlign(col.align) }]}
          onPress={() => onSort?.(key, nextSortDirection(sortColumn, sortDirection, key))}
          disabled={!isSortable}
        >
          {col.renderHeader ? (
            col.renderHeader(col)
          ) : (
            <Text style={styles.headerText}>{col.title}</Text>
          )}
          {isActiveSort &&
            (sortDirection === 'asc' ? (
              <icons.sortAsc size={16} color={tableTheme.text} />
            ) : (
              <icons.sortDesc size={16} color={tableTheme.text} />
            ))}
        </TouchableOpacity>

        {col.filterConfig && (
          <TouchableOpacity
            style={[styles.filterIcon, isFiltered && styles.filterIconActive]}
            onPress={() => setActiveFilterColumn(key)}
            accessibilityRole="button"
            accessibilityLabel={`${t.filter} ${col.title}`}
          >
            <icons.filter
              size={16}
              color={isFiltered ? tableTheme.primary : tableTheme.textSecondary}
            />
          </TouchableOpacity>
        )}

        {enableColumnResize && col.resizable !== false && (
          <ColumnResizeHandle
            width={width}
            minWidth={col.minWidth ?? MIN_RESIZE_WIDTH}
            maxWidth={col.maxWidth ?? MAX_RESIZE_WIDTH}
            theme={tableTheme}
            onResizeEnd={newWidth => handleColumnResize(key, newWidth)}
            label={col.title}
            testID={`resize-${key}`}
          />
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
          stickyStyles.get(key),
          col.isSticky && { backgroundColor: tableTheme.headerBackground },
        ]}
      >
        {headerContent}
      </Animated.View>
    );
  };

  // --- ROWS ---
  const canEdit = !!onRowChange;
  const isPressable = !!onRowPress;
  const rowContext = useMemo<RowContext<T>>(
    () => ({
      columns: columnsWithOffsets,
      rowHeight: currentRowHeight,
      showLeadingColumn,
      isReorderMode,
      isDragEnabled: !sortDirection,
      canEdit,
      isPressable,
      theme: tableTheme,
      styles,
      leadingTransform,
      stickyStyles,
      rowStyle,
      getRowStyle,
      onRowPress: handleRowPress,
      onToggleRow: handleToggleRow,
      onStartEdit: startEdit,
      onEditTextChange: handleEditTextChange,
      onCommitEdit: commitEdit,
      onDragEnd: handleRowDragEnd,
    }),
    [
      columnsWithOffsets,
      currentRowHeight,
      showLeadingColumn,
      isReorderMode,
      sortDirection,
      canEdit,
      isPressable,
      tableTheme,
      styles,
      leadingTransform,
      stickyStyles,
      rowStyle,
      getRowStyle,
      handleRowPress,
      handleToggleRow,
      startEdit,
      handleEditTextChange,
      commitEdit,
      handleRowDragEnd,
    ]
  );

  // FlashList calls this for every visible row when it changes, but TableBodyRow is memoized
  // on its props — so e.g. toggling one checkbox re-renders one row.
  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<T>) => {
      let isFirstInGroup = false;
      let isLastInGroup = false;
      if (rowGroupKey) {
        const group = item[rowGroupKey];
        isFirstInGroup = index === 0 || data[index - 1][rowGroupKey] !== group;
        isLastInGroup = index === data.length - 1 || data[index + 1][rowGroupKey] !== group;
      }
      const rowId = rowIdOf(item);
      return (
        <TableBodyRow
          item={item}
          rowId={rowId}
          index={index}
          isSelected={!!selectedIds?.has(rowId)}
          editing={editingCell?.id === rowId ? editingCell : null}
          isFirstInGroup={isFirstInGroup}
          isLastInGroup={isLastInGroup}
          ctx={rowContext}
        />
      );
    },
    [data, rowGroupKey, rowIdOf, selectedIds, editingCell, rowContext]
  );

  const keyExtractor = useCallback((item: T) => String(rowIdOf(item)), [rowIdOf]);

  const showToolbar =
    showToolbarProp ??
    !!(
      onSearchChange ||
      onDensityChange ||
      onToggleColumn ||
      enableRowReorder ||
      screenOrientation ||
      toolbarActions ||
      renderBulkActions
    );
  const activeFilterDef = activeFilterColumn
    ? columns.find(c => c.key === activeFilterColumn)
    : undefined;

  return (
    <TableIconsProvider value={icons}>
      <View style={[styles.container, containerStyle]}>
        {showToolbar && (
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            density={density}
            onDensityChange={onDensityChange}
            columns={columns}
            visibleColumns={visibleColumns ?? columns.map(c => c.key as string)}
            onToggleColumn={onToggleColumn}
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
            actions={toolbarActions}
            bulkActions={
              renderBulkActions && selectedIds && selectedIds.size > 0
                ? renderBulkActions(selectedIds)
                : undefined
            }
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
            onScroll={handleScroll}
          >
            {/*
            Fill the table's own width (not the screen's) so there is no phantom scroll.
            Width is explicit only: `flex: 1` would put this view under flex-basis rules on the
            scroll axis. Height comes from the default cross-axis stretch.
          */}
            <View style={{ width: Math.max(viewportWidth, totalWidth) }}>
              {/* HEADER */}
              <View style={[styles.header, headerStyle, { height: currentRowHeight }]}>
                {showLeadingColumn && renderHeaderLeadingCell()}
                {columnsWithOffsets.map((col, index) => renderHeaderCell(col, index))}
              </View>

              {/* BODY */}
              <View style={{ flex: 1, minHeight: 2 }}>
                {error ? (
                  <View style={[styles.statusContainer, viewportStyle]}>
                    {typeof error === 'string' || typeof error === 'boolean' ? (
                      <>
                        <Text style={styles.errorText}>
                          {typeof error === 'string' ? error : t.error}
                        </Text>
                        {onRetry && (
                          <TouchableOpacity
                            style={styles.retryButton}
                            onPress={onRetry}
                            accessibilityRole="button"
                          >
                            <Text style={styles.retryText}>{t.retry}</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    ) : (
                      error
                    )}
                  </View>
                ) : (
                  <FlashList
                    key={Platform.OS === 'ios' ? listIdentityKey : undefined}
                    data={data}
                    // renderItem's identity already tracks everything rows read; FlashList v1
                    // additionally needs it as extraData to re-render.
                    extraData={renderItem}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.listContent}
                    // FlashList v1 needs estimatedItemSize; v2 dropped it from its types. A
                    // ts-expect-error would break type-checking against v1, so ignore instead.
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    estimatedItemSize={currentRowHeight}
                    scrollEnabled={scrollEnabled}
                    refreshing={!!refreshing}
                    onRefresh={onRefresh}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={onEndReachedThreshold}
                    ListEmptyComponent={
                      isLoading ? (
                        <View style={[styles.statusContainer, viewportStyle]}>
                          <ActivityIndicator color={tableTheme.primary} />
                          <Text style={styles.emptyText}>{t.loading}</Text>
                        </View>
                      ) : emptyComponent !== undefined ? (
                        <View style={viewportStyle}>{emptyComponent}</View>
                      ) : (
                        <View style={[styles.emptyContainer, viewportStyle]}>
                          <Text style={styles.emptyText}>{t.empty}</Text>
                        </View>
                      )
                    }
                    ListFooterComponent={
                      isLoadingMore ? (
                        <View
                          style={[styles.footerLoading, viewportStyle]}
                          accessibilityRole="progressbar"
                          accessibilityLabel={t.loading}
                        >
                          <ActivityIndicator color={tableTheme.primary} />
                        </View>
                      ) : null
                    }
                  />
                )}
              </View>
            </View>
          </AnimatedGHScrollView>

          {/* Refetch over existing rows: dim the body and block touches, keep the header. */}
          {isLoading && data.length > 0 && !error && (
            <View
              style={[styles.loadingOverlay, { top: currentRowHeight }]}
              accessibilityRole="progressbar"
              accessibilityLabel={t.loading}
            >
              <View style={styles.loadingOverlayBackdrop} />
              <ActivityIndicator color={tableTheme.primary} />
            </View>
          )}
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
                  <icons.previousPage
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
                >
                  <icons.nextPage
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
    </TableIconsProvider>
  );
}
