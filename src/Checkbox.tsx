import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Check, Minus } from 'lucide-react-native';

interface CheckboxProps {
  checked: boolean;
  /** Some but not all items selected — shows a dash. */
  indeterminate?: boolean;
  onPress: () => void;
  activeColor?: string;
  borderColor?: string;
  checkColor?: string;
  accessibilityLabel?: string;
}

export function Checkbox({
  checked,
  indeterminate,
  onPress,
  activeColor = '#4f46e5',
  borderColor = '#cbd5e1',
  checkColor = '#fff',
  accessibilityLabel,
}: CheckboxProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? 'mixed' : checked }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      style={[
        styles.container,
        checked || indeterminate
          ? { backgroundColor: activeColor, borderColor: activeColor }
          : { backgroundColor: 'transparent', borderColor },
      ]}
    >
      {indeterminate ? (
        <Minus size={14} color={checkColor} strokeWidth={3} />
      ) : checked ? (
        <Check size={14} color={checkColor} strokeWidth={3} />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
