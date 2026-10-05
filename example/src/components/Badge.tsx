import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tone, toneColors, usePalette } from '../appTheme';

export function Badge({ label, tone, dot = true }: { label: string; tone: Tone; dot?: boolean }) {
  const { fg, bg } = toneColors(usePalette(), tone);
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {dot && <View style={[styles.dot, { backgroundColor: fg }]} />}
      <Text style={[styles.text, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: '600' },
});
