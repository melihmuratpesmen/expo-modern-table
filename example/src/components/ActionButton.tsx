import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Tone, toneColors, usePalette } from '../appTheme';

interface Props {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  tone?: Tone;
  compact?: boolean;
}

export function ActionButton({ label, onPress, icon: Icon, tone = 'primary', compact }: Props) {
  const { fg, bg } = toneColors(usePalette(), tone);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: bg, opacity: pressed ? 0.7 : 1 }]}
    >
      {Icon && <Icon size={15} color={fg} />}
      {!compact && <Text style={[styles.text, { color: fg }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  text: { fontSize: 13, fontWeight: '600' },
});
