import React, { ReactNode, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { useTableIcons } from './icons';
import { Density, Column, TableTranslations } from './types';
import { TableTheme, themeFallbacks } from './theme/tokens';
import {
  ScreenOrientationModule,
  useFullscreenOrientation,
} from './hooks/useFullscreenOrientation';

/** Each control appears only when its handler is passed. */
interface TableToolbarProps<T> {
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  density: Density;
  onDensityChange?: (d: Density) => void;
  columns: Column<T>[];
  visibleColumns: string[];
  onToggleColumn?: (key: string) => void;
  stickyColumns?: string[];
  onToggleSticky?: (key: string) => void;
  theme: TableTheme;
  // Row Drag Mode
  enableRowReorder?: boolean;
  selectionMode?: 'select' | 'reorder';
  onToggleSelectionMode?: () => void;
  selectedCount?: number;
  translations: TableTranslations;
  screenOrientation?: ScreenOrientationModule;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  /** Extra buttons after the built-in ones. */
  actions?: ReactNode;
  /** Replaces the search field while rows are selected. */
  bulkActions?: ReactNode;
}

export function TableToolbar<T>({
  searchQuery,
  onSearchChange,
  density,
  onDensityChange,
  columns,
  visibleColumns,
  onToggleColumn,
  stickyColumns,
  onToggleSticky,
  theme,
  enableRowReorder,
  selectionMode = 'select',
  onToggleSelectionMode,
  selectedCount = 0,
  translations,
  screenOrientation,
  onFullscreenChange,
  actions,
  bulkActions,
}: TableToolbarProps<T>) {
  const icons = useTableIcons();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    isFullscreen,
    toggleFullscreen,
    isAvailable: canToggleFullscreen,
  } = useFullscreenOrientation(screenOrientation, onFullscreenChange);

  const styles = React.useMemo(() => createStyles(theme), [theme]);

  // Density cycle: compact -> standard -> comfortable -> compact
  const cycleDensity = () => {
    const next: Record<Density, Density> = {
      compact: 'standard',
      standard: 'comfortable',
      comfortable: 'compact',
    };
    onDensityChange?.(next[density]);
  };

  const selectionBadge = (
    <View style={styles.selectionBadge}>
      <Text style={styles.selectionText}>{selectedCount}</Text>
    </View>
  );

  // Contextual bar: while rows are selected, bulk actions take the whole toolbar — on a
  // phone there is no room for them next to the regular buttons.
  const showBulkBar = selectedCount > 0 && !!bulkActions;

  const renderLeft = () => {
    if (showBulkBar) {
      return (
        <View style={styles.bulkBar}>
          {selectionBadge}
          <Text style={styles.bulkLabel} numberOfLines={1}>
            {translations.selected}
          </Text>
          <View style={styles.bulkActions}>{bulkActions}</View>
        </View>
      );
    }
    if (onSearchChange) {
      return (
        <View style={styles.searchContainer}>
          {selectedCount > 0 ? (
            selectionBadge
          ) : (
            <icons.search size={20} color={theme.textSecondary} style={styles.searchIcon} />
          )}
          <TextInput
            style={styles.input}
            placeholder={selectedCount > 0 ? translations.selected : translations.searchPlaceholder}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery ?? ''}
            onChangeText={onSearchChange}
          />
        </View>
      );
    }
    return (
      <View style={styles.bulkBar}>
        {selectedCount > 0 && (
          <>
            {selectionBadge}
            <Text style={styles.bulkLabel}>{translations.selected}</Text>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderLeft()}

      {/* ACTION BUTTONS */}
      {!showBulkBar && (
        <View style={styles.actions}>
          {/* Fullscreen toggle — shown when `screenOrientation` is passed */}
          {canToggleFullscreen && (
            <TouchableOpacity
              onPress={toggleFullscreen}
              style={styles.iconButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Fullscreen"
              accessibilityState={{ selected: isFullscreen }}
            >
              {isFullscreen ? (
                <icons.exitFullscreen size={20} color={theme.text} />
              ) : (
                <icons.fullscreen size={20} color={theme.text} />
              )}
            </TouchableOpacity>
          )}

          {/* Row Reorder Toggle */}
          {enableRowReorder && onToggleSelectionMode && (
            <TouchableOpacity
              onPress={onToggleSelectionMode}
              style={[styles.iconButton, selectionMode === 'reorder' && styles.activeModeButton]}
              activeOpacity={0.7}
            >
              {selectionMode === 'select' ? (
                <icons.selectMode size={20} color={theme.text} />
              ) : (
                <icons.reorderMode size={20} color={theme.primary} />
              )}
            </TouchableOpacity>
          )}

          {onDensityChange && (
            <TouchableOpacity onPress={cycleDensity} style={styles.iconButton} activeOpacity={0.7}>
              <icons.density size={20} color={theme.text} />
            </TouchableOpacity>
          )}

          {onToggleColumn && (
            <TouchableOpacity
              onPress={() => setIsMenuOpen(true)}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <icons.columns size={20} color={theme.text} />
            </TouchableOpacity>
          )}

          {actions}
        </View>
      )}

      {/* COLUMN VISIBILITY MODAL */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{translations.columns}</Text>
              <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                <icons.close size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {columns.map(col => (
                <View key={col.key as string} style={styles.switchRow}>
                  <Text style={styles.switchLabel}>{col.title}</Text>

                  <View style={styles.switchActions}>
                    {/* Sticky Toggle with Pin Icon */}
                    {onToggleSticky && (
                      <TouchableOpacity
                        onPress={() => onToggleSticky(col.key as string)}
                        style={[
                          styles.pinButton,
                          stickyColumns?.includes(col.key as string) && styles.pinActive,
                        ]}
                      >
                        <icons.pin
                          size={18}
                          color={
                            stickyColumns?.includes(col.key as string)
                              ? theme.textInverse
                              : theme.textSecondary
                          }
                        />
                      </TouchableOpacity>
                    )}

                    <Switch
                      value={visibleColumns.includes(col.key as string)}
                      onValueChange={() => onToggleColumn?.(col.key as string)}
                      trackColor={{
                        false: theme.border,
                        true: theme.primaryLight,
                      }}
                      thumbColor={
                        visibleColumns.includes(col.key as string) ? theme.primary : '#f4f3f4'
                      }
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: TableTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.background,
      gap: 12,
      alignItems: 'center',
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surfaceHighlight, // Lighter background
      borderRadius: 12, // Improved rounded corners
      borderWidth: 1,
      borderColor: 'transparent', // Cleaner look
      paddingHorizontal: 12,
      height: 44, // Taller touch target
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    searchIcon: {
      marginRight: 8,
      opacity: 0.5,
    },
    input: {
      flex: 1,
      height: '100%',
      color: theme.text,
      fontSize: 14,
      fontFamily: theme.fontFamily.medium,
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    iconButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border, // Subtle border
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    activeModeButton: {
      borderColor: theme.primary,
      backgroundColor: theme.surfaceHighlight,
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay ?? themeFallbacks.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '85%',
      maxHeight: '70%',
      backgroundColor: theme.surface,
      borderRadius: 24, // Much rounder
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20, // Hero shadow
      elevation: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: theme.fontFamily.bold,
      color: theme.text,
      letterSpacing: -0.5,
    },
    modalList: {
      flexGrow: 0,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    switchLabel: {
      fontSize: 15,
      fontFamily: theme.fontFamily.medium,
      color: theme.text,
    },
    switchActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    pinButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.surfaceHighlight,
    },
    pinActive: {
      backgroundColor: theme.primary, // Indigo 600
    },
    bulkBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 44,
      gap: 4,
    },
    bulkLabel: {
      flexShrink: 1,
      color: theme.text,
      fontSize: 14,
      fontFamily: theme.fontFamily.medium,
    },
    bulkActions: {
      marginLeft: 'auto',
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    selectionBadge: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginRight: 8,
    },
    selectionText: {
      color: theme.textInverse,
      fontSize: 12,
      fontFamily: theme.fontFamily.bold,
    },
  });
