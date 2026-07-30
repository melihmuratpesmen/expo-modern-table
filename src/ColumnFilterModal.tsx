import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { X, Check } from "lucide-react-native";
import { FilterConfig, TableTranslations } from "./types";
import { TableTheme } from "./theme/tokens";
import { useTableTheme } from "./hooks/useTableTheme";

interface ColumnFilterModalProps {
  visible: boolean;
  onClose: () => void;
  columnTitle: string;
  filterConfig: FilterConfig;
  currentValue: any;
  onApply: (value: any) => void;
  theme?: TableTheme;
  translations: TableTranslations;
}

export function ColumnFilterModal({
  visible,
  onClose,
  columnTitle,
  filterConfig,
  currentValue,
  onApply,
  theme,
  translations,
}: ColumnFilterModalProps) {
  const [tempValue, setTempValue] = useState<any>(currentValue);
  const tableTheme = theme || useTableTheme(); // Fallback if not provided directly
  const styles = React.useMemo(() => createStyles(tableTheme), [tableTheme]);

  // Modal açıldığında değeri senkronize et
  useEffect(() => {
    setTempValue(currentValue);
  }, [visible, currentValue]);

  const handleApply = () => {
    onApply(tempValue);
    onClose();
  };

  const cleanFilter = () => {
    onApply(undefined);
    onClose();
  };

  const renderFilterInput = () => {
    switch (filterConfig.type) {
      case "text":
        return (
          <TextInput
            style={styles.input}
            placeholder={translations.searchPlaceholder}
            placeholderTextColor={tableTheme.textSecondary}
            value={tempValue || ""}
            onChangeText={setTempValue}
            autoFocus
          />
        );

      case "select":
        return (
          <ScrollView style={styles.optionsList}>
            <TouchableOpacity
              style={[styles.optionItem, !tempValue && styles.optionItemActive]}
              onPress={() => setTempValue(undefined)}
            >
              <Text
                style={[
                  styles.optionText,
                  !tempValue && styles.optionTextActive,
                ]}
              >
                {translations.all}
              </Text>
              {!tempValue && <Check size={16} color="white" />}
            </TouchableOpacity>

            {filterConfig.options?.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  tempValue === option && styles.optionItemActive,
                ]}
                onPress={() =>
                  setTempValue(option === tempValue ? undefined : option)
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    tempValue === option && styles.optionTextActive,
                  ]}
                >
                  {option}
                </Text>
                {tempValue === option && <Check size={16} color="white" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        );

      case "boolean":
        return (
          <View style={styles.booleanContainer}>
            <TouchableOpacity
              style={[
                styles.booleanButton,
                tempValue === true && styles.booleanButtonActive,
              ]}
              onPress={() => setTempValue(true)}
            >
              <Text
                style={[
                  styles.booleanText,
                  tempValue === true && styles.booleanTextActive,
                ]}
              >
                {translations.yesActive}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.booleanButton,
                tempValue === false && styles.booleanButtonActive,
              ]}
              onPress={() => setTempValue(false)}
            >
              <Text
                style={[
                  styles.booleanText,
                  tempValue === false && styles.booleanTextActive,
                ]}
              >
                {translations.noPassive}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "number-range":
        return (
          <View style={styles.rangeContainer}>
            <View style={styles.rangeInputWrapper}>
              <Text style={styles.rangeLabel}>{translations.min}</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={
                  tempValue?.min !== undefined ? String(tempValue.min) : ""
                }
                onChangeText={(text) =>
                  setTempValue({
                    ...tempValue,
                    min: text ? Number(text) : undefined,
                  })
                }
              />
            </View>
            <View style={styles.rangeInputWrapper}>
              <Text style={styles.rangeLabel}>{translations.max}</Text>
              <TextInput
                style={styles.input}
                placeholder="100"
                keyboardType="numeric"
                value={
                  tempValue?.max !== undefined ? String(tempValue.max) : ""
                }
                onChangeText={(text) =>
                  setTempValue({
                    ...tempValue,
                    max: text ? Number(text) : undefined,
                  })
                }
              />
            </View>
          </View>
        );

      default:
        return <Text>{translations.unknownFilter}</Text>;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      supportedOrientations={["portrait", "landscape"]}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {translations.filter} {columnTitle}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={tableTheme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>{renderFilterInput()}</View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={cleanFilter}>
              <Text style={styles.clearButtonText}>{translations.clear}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>{translations.apply}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: TableTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(17, 24, 39, 0.4)", // Darker, smoother overlay
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      width: "90%",
      maxWidth: 400,
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontFamily: theme.fontFamily.bold, 
      color: theme.text,
    },
    body: {
      marginBottom: 24,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 12,
      fontSize: 16,
      backgroundColor: theme.surfaceHighlight,
      color: theme.text,
    },
    optionsList: {
      maxHeight: 200,
    },
    optionItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    optionItemActive: {
      backgroundColor: theme.primary, // Indigo
      borderRadius: 8,
      borderBottomWidth: 0,
      marginVertical: 2,
    },
    optionText: {
      fontSize: 14,
      color: theme.text,
      fontFamily: theme.fontFamily.medium, 
    },
    optionTextActive: {
      color: theme.textInverse,
      fontFamily: theme.fontFamily.semibold, 
    },
    booleanContainer: {
      flexDirection: "row",
      gap: 12,
    },
    booleanButton: {
      flex: 1,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12, // Rounder
      alignItems: "center",
    },
    booleanButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    booleanText: {
      color: theme.text,
      fontFamily: theme.fontFamily.medium, 
    },
    booleanTextActive: {
      color: theme.textInverse,
      fontFamily: theme.fontFamily.semibold, 
    },
    rangeContainer: {
      flexDirection: "row",
      gap: 12,
    },
    rangeInputWrapper: {
      flex: 1,
    },
    rangeLabel: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 6,
      fontFamily: theme.fontFamily.medium, 
    },
    footer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
    },
    clearButton: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    clearButtonText: {
      color: theme.textSecondary,
      fontFamily: theme.fontFamily.semibold, 
    },

    applyButton: {
      backgroundColor: theme.primary, // Indigo Match
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    applyButtonText: {
      color: theme.textInverse,
      fontFamily: theme.fontFamily.semibold, 
    },
  });
