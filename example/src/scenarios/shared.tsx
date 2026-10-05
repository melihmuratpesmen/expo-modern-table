import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type { ScreenOrientationModule } from 'expo-modern-table';
import type { ToastMessage } from '../components/Toast';
import { usePalette } from '../appTheme';

export interface ScenarioProps {
  mode: 'light' | 'dark';
  /** Phone-width layout: narrower sticky columns. */
  compact: boolean;
  showToast: (message: Omit<ToastMessage, 'id'>) => void;
  screenOrientation?: ScreenOrientationModule;
}

export const MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
});

/** Thin status line above a table (request log, live indicator…). */
export function StatusLine({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  const palette = usePalette();
  return (
    <View style={[styles.line, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <View style={styles.left}>{children}</View>
      {right}
    </View>
  );
}

export function Dot({ color, pulse }: { color: string; pulse?: boolean }) {
  return (
    <View style={styles.dotWrap}>
      {pulse && <View style={[styles.halo, { backgroundColor: color }]} />}
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

export function MutedText({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  const palette = usePalette();
  return (
    <Text numberOfLines={1} style={[styles.muted, { color: palette.textMuted }, mono && { fontFamily: MONO }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  dotWrap: { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  halo: { position: 'absolute', width: 10, height: 10, borderRadius: 5, opacity: 0.35 },
  muted: { fontSize: 12, flexShrink: 1 },
});
