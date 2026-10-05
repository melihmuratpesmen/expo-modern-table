import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { usePalette } from '../appTheme';

interface Option<V extends string> {
  value: V;
  label: string;
  icon?: LucideIcon;
}

interface Props<V extends string> {
  options: readonly Option<V>[];
  value: V;
  onChange: (value: V) => void;
  size?: 'sm' | 'md';
  accessibilityLabel?: string;
}

export function Segmented<V extends string>({ options, value, onChange, size = 'md', accessibilityLabel }: Props<V>) {
  const palette = usePalette();
  const small = size === 'sm';
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}
    >
      {options.map(option => {
        const active = option.value === value;
        const Icon = option.icon;
        const color = active ? palette.text : palette.textMuted;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              small ? styles.segmentSmall : styles.segmentMedium,
              active && [styles.active, { backgroundColor: palette.surface }],
            ]}
          >
            {Icon && <Icon size={small ? 14 : 16} color={active ? palette.primary : palette.textMuted} />}
            <Text style={[small ? styles.labelSmall : styles.label, { color }]} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 3, borderRadius: 12, borderWidth: 1, gap: 2 },
  segment: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 9 },
  segmentMedium: { paddingHorizontal: 12, paddingVertical: 7, flexGrow: 1 },
  segmentSmall: { paddingHorizontal: 9, paddingVertical: 5 },
  active: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  label: { fontSize: 14, fontWeight: '600' },
  labelSmall: { fontSize: 12, fontWeight: '700' },
});
