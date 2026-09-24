import { StyleSheet } from 'react-native';
import { TableTheme } from './theme/tokens';
import { CHECKBOX_WIDTH } from './layout';

export function createTableStyles(theme: TableTheme) {
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

export type TableStyles = ReturnType<typeof createTableStyles>;
