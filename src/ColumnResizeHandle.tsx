import React, { useEffect, useMemo } from 'react';
import { AccessibilityActionEvent, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { TableTheme } from './theme/tokens';
import { useStableCallback } from './hooks/useStableCallback';

/** Width change per screen-reader increment / decrement. */
const ACCESSIBILITY_STEP = 10;

interface ColumnResizeHandleProps {
  width: number;
  minWidth: number;
  maxWidth: number;
  theme: TableTheme;
  onResizeEnd: (width: number) => void;
  label: string;
  testID?: string;
}

/**
 * Drag handle for a column's right edge; fills its (absolutely positioned) parent. The guide
 * follows the finger and the width is committed once on release, so rows don't re-render on
 * every frame. The gesture is created once: rebuilding it mid-drag (e.g. when the committed
 * width re-renders the header) would drop its finalize callback and leave the guide stuck.
 */
export function ColumnResizeHandle({
  width,
  minWidth,
  maxWidth,
  theme,
  onResizeEnd,
  label,
  testID,
}: ColumnResizeHandleProps) {
  const translationX = useSharedValue(0);
  const isActive = useSharedValue(false);
  // Latest bounds for the worklet, without making them gesture dependencies.
  const bounds = useSharedValue({ width, minWidth, maxWidth });
  useEffect(() => {
    bounds.value = { width, minWidth, maxWidth };
  }, [bounds, width, minWidth, maxWidth]);

  const clamp = (next: number) => Math.min(Math.max(next, minWidth), maxWidth);

  const commit = useStableCallback((delta: number) => {
    const next = Math.round(clamp(width + delta));
    if (next !== width) onResizeEnd(next);
  });

  // Shared values are mutable by design inside worklets; the compiler rule doesn't know that.
  /* eslint-disable react-hooks/immutability */
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .withTestId(testID ?? '')
        // Horizontal only, and immediately — header reordering needs a long-press first.
        .activeOffsetX([-4, 4])
        .failOffsetY([-12, 12])
        .onStart(() => {
          isActive.value = true;
        })
        .onUpdate(e => {
          const b = bounds.value;
          const next = Math.min(Math.max(b.width + e.translationX, b.minWidth), b.maxWidth);
          translationX.value = next - b.width;
        })
        .onEnd(e => {
          runOnJS(commit)(e.translationX);
        })
        .onFinalize(() => {
          isActive.value = false;
          translationX.value = withTiming(0, { duration: 120 });
        }),
    [testID, commit, bounds, isActive, translationX]
  );
  /* eslint-enable react-hooks/immutability */

  const handleAccessibilityAction = (e: AccessibilityActionEvent) => {
    commit(e.nativeEvent.actionName === 'increment' ? ACCESSIBILITY_STEP : -ACCESSIBILITY_STEP);
  };

  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }],
    opacity: isActive.value ? 1 : 0.6,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.hitArea, guideStyle]}
        hitSlop={{ left: 6, right: 6 }}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ now: Math.round(width), min: minWidth, max: maxWidth }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={handleAccessibilityAction}
      >
        <Animated.View style={[styles.guide, { backgroundColor: theme.border }]} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guide: {
    width: 3,
    height: '60%',
    borderRadius: 2,
  },
});
