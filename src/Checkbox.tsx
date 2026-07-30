// components/Checkbox.tsx
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Check, Minus } from "lucide-react-native";

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean; // Tümü seçili değil ama bazıları seçiliyse (Tire işareti)
  onPress: () => void;
  activeColor?: string;
  borderColor?: string;
}

export function Checkbox({
  checked,
  indeterminate,
  onPress,
  activeColor = "#4f46e5",
  borderColor = "#cbd5e1",
}: CheckboxProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        checked || indeterminate
          ? { backgroundColor: activeColor, borderColor: activeColor }
          : { backgroundColor: "transparent", borderColor: borderColor },
      ]}
    >
      {indeterminate ? (
        <Minus size={14} color="#fff" strokeWidth={3} />
      ) : checked ? (
        <Check size={14} color="#fff" strokeWidth={3} />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    borderRadius: 6, // Softer corners
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  active: {
    // backgroundColor and borderColor handled inline for dynamic support
  },
  inactive: {
    backgroundColor: "#ffffff",
    // borderColor handled inline
  },
});
