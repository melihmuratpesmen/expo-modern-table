import React, { memo, ReactNode } from 'react';
import {
  Animated,
  StyleProp,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { GestureDetector, GestureType } from 'react-native-gesture-handler';
import { useTableIcons } from './icons';
import { RowId } from './types';
import { TableTheme } from './theme/tokens';
import { TableStyles } from './tableStyles';
import { Checkbox } from './Checkbox';
import { DraggableRow } from './DraggableRow';
import {
  AnimatedViewStyle,
  EditingCell,
  GROUP_GAP,
  PositionedColumn,
  getAlign,
  markedCellColor,
} from './layout';
import { SIGNED_DECIMAL_KEYBOARD } from './utils/keyboard';
import { getCellValue } from './core/values';

/**
 * Everything a row needs that is shared by all rows. ModernTable memoizes it, so rows only
 * re-render when something that affects them changes.
 */
export interface RowContext<T extends object> {
  columns: PositionedColumn<T>[];
  rowHeight: number;
  showLeadingColumn: boolean;
  isReorderMode: boolean;
  isDragEnabled: boolean;
  canEdit: boolean;
  isPressable: boolean;
  theme: TableTheme;
  styles: TableStyles;
  leadingTransform: AnimatedViewStyle;
  stickyStyles: Map<string, AnimatedViewStyle>;
  rowStyle?: StyleProp<ViewStyle>;
  getRowStyle?: (item: T, index: number) => StyleProp<ViewStyle>;
  onRowPress: (item: T) => void;
  onToggleRow: (id: RowId) => void;
  onStartEdit: (item: T, key: string) => void;
  onEditTextChange: (text: string) => void;
  onCommitEdit: (item: T, key: string) => void;
  onDragEnd: (index: number, translationY: number) => void;
  labels: { selectRow: string; dragToReorder: string; expandRow: string; collapseRow: string };
  renderExpandedRow?: (item: T, index: number) => ReactNode;
  onToggleExpand: (id: RowId) => void;
  expandedWidth: number;
}

export interface TableBodyRowProps<T extends object> {
  item: T;
  rowId: RowId;
  index: number;
  isSelected: boolean;
  isExpanded: boolean;
  /** The cell being edited, only when it belongs to this row. */
  editing: EditingCell | null;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  ctx: RowContext<T>;
}

function TableBodyRowImpl<T extends object>({
  item,
  rowId,
  index,
  isSelected,
  isExpanded,
  editing,
  isFirstInGroup,
  isLastInGroup,
  ctx,
}: TableBodyRowProps<T>) {
  const { theme, styles, rowHeight } = ctx;
  const rowBgColor = isSelected
    ? theme.rowSelected
    : index % 2 === 0
      ? theme.rowEven
      : theme.rowOdd;

  const renderLeadingCell = (dragGesture?: GestureType) => (
    <Animated.View
      style={[
        styles.stickyCheckbox,
        { height: rowHeight, backgroundColor: rowBgColor },
        ctx.leadingTransform,
      ]}
    >
      {ctx.isReorderMode ? (
        <DragHandle gesture={dragGesture} color={theme.text} label={ctx.labels.dragToReorder} />
      ) : (
        <Checkbox
          checked={isSelected}
          onPress={() => ctx.onToggleRow(rowId)}
          accessibilityLabel={ctx.labels.selectRow}
          activeColor={theme.primary}
          borderColor={theme.textSecondary}
          checkColor={theme.textInverse}
        />
      )}
    </Animated.View>
  );

  const renderContent = (dragGesture?: GestureType) => {
    const RowComponent = ctx.isPressable ? TouchableOpacity : View;
    return (
      <RowComponent
        onPress={ctx.isPressable ? () => ctx.onRowPress(item) : undefined}
        activeOpacity={ctx.isPressable ? 0.7 : 1}
        style={[
          styles.row,
          { backgroundColor: rowBgColor, height: rowHeight },
          isFirstInGroup && {
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            marginTop: index === 0 ? 0 : GROUP_GAP,
          },
          isLastInGroup && {
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          },
          ctx.rowStyle,
          ctx.getRowStyle?.(item, index),
        ]}
      >
        {ctx.showLeadingColumn && renderLeadingCell(dragGesture)}
        {ctx.renderExpandedRow && (
          <Animated.View
            style={[
              styles.expanderCell,
              { height: rowHeight, backgroundColor: rowBgColor },
              ctx.leadingTransform,
            ]}
          >
            <ExpandButton
              isExpanded={isExpanded}
              onPress={() => ctx.onToggleExpand(rowId)}
              color={theme.textSecondary}
              label={isExpanded ? ctx.labels.collapseRow : ctx.labels.expandRow}
            />
          </Animated.View>
        )}

        {ctx.columns.map(col => {
          const key = col.key as string;
          const rawValue = item[key as keyof T];
          const isEditing = editing?.key === key;
          const canEdit = !!col.editable && ctx.canEdit;
          const stickyStyle = ctx.stickyStyles.get(key);

          return (
            <Animated.View
              key={key}
              style={[
                styles.cellBase,
                {
                  width: col.layoutWidth,
                  justifyContent: getAlign(col.align),
                  height: rowHeight,
                },
                stickyStyle,
                stickyStyle && { backgroundColor: rowBgColor },
                (col.isMarked || col.markedColor) && {
                  backgroundColor: markedCellColor(col, theme),
                },
                col.style,
              ]}
            >
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  defaultValue={editing.initialText}
                  onChangeText={ctx.onEditTextChange}
                  onBlur={() => ctx.onCommitEdit(item, key)}
                  keyboardType={typeof rawValue === 'number' ? SIGNED_DECIMAL_KEYBOARD : 'default'}
                  selectTextOnFocus
                  autoFocus
                  placeholderTextColor={theme.textSecondary}
                />
              ) : (
                <TouchableOpacity
                  disabled={!canEdit}
                  onPress={() => ctx.onStartEdit(item, key)}
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
                      {String(getCellValue(item, col))}
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

  if (ctx.isReorderMode) {
    return (
      <DraggableRow
        index={index}
        theme={theme}
        isDragEnabled={ctx.isDragEnabled}
        onDragEnd={ctx.onDragEnd}
        testID={`row-drag-${rowId}`}
      >
        {({ dragGesture }) => renderContent(dragGesture)}
      </DraggableRow>
    );
  }

  if (isExpanded && ctx.renderExpandedRow) {
    return (
      <View>
        {renderContent()}
        <Animated.View
          style={[styles.expandedContent, { width: ctx.expandedWidth }, ctx.leadingTransform]}
        >
          {ctx.renderExpandedRow(item, index)}
        </Animated.View>
      </View>
    );
  }

  return renderContent();
}

function ExpandButton({
  isExpanded,
  onPress,
  color,
  label,
}: {
  isExpanded: boolean;
  onPress: () => void;
  color: string;
  label: string;
}) {
  const icons = useTableIcons();
  const Icon = isExpanded ? icons.collapse : icons.expand;
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ expanded: isExpanded }}
    >
      <Icon size={18} color={color} />
    </TouchableOpacity>
  );
}

function DragHandle({
  gesture,
  color,
  label,
}: {
  gesture?: GestureType;
  color: string;
  label: string;
}) {
  const icons = useTableIcons();
  const handle = (
    <View style={{ opacity: 0.5 }} accessible accessibilityLabel={label}>
      <icons.dragHandle size={20} color={color} />
    </View>
  );
  return gesture ? <GestureDetector gesture={gesture}>{handle}</GestureDetector> : handle;
}

/** Memoized: re-renders only when its own props change (selection, edit, data, context). */
export const TableBodyRow = memo(TableBodyRowImpl) as typeof TableBodyRowImpl;
