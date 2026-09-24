import React from 'react';
import { AccessibilityActionEvent, StyleSheet } from 'react-native';

/** Width change per screen-reader increment / decrement. */
const ACCESSIBILITY_STEP = 10;
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { TableTheme } from './theme/tokens';

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
 * Drag handle on a header cell's right edge. The guide follows the finger and the width is
 * committed once on release, so rows don't re-render on every frame.
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

  const gesture = Gesture.Pan()
    .withTestId(testID ?? '')
    // Horizontal only, and immediately — header reordering needs a long-press first.
    .activeOffsetX([-4, 4])
    .failOffsetY([-12, 12])
    .onStart(() => {
      isActive.value = true;
    })
    .onUpdate(e => {
      const next = Math.min(Math.max(width + e.translationX, minWidth), maxWidth);
      translationX.value = next - width;
    })
    .onEnd(e => {
      const next = Math.min(Math.max(width + e.translationX, minWidth), maxWidth);
      if (next !== width) runOnJS(onResizeEnd)(Math.round(next));
    })
    .onFinalize(() => {
      isActive.value = false;
      translationX.value = withTiming(0, { duration: 120 });
    });

  const handleAccessibilityAction = (e: AccessibilityActionEvent) => {
    const step =
      e.nativeEvent.actionName === 'increment' ? ACCESSIBILITY_STEP : -ACCESSIBILITY_STEP;
    const next = Math.min(Math.max(width + step, minWidth), maxWidth);
    if (next !== width) onResizeEnd(next);
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
    position: 'absolute',
    right: -6,
    top: 0,
    bottom: 0,
    width: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  guide: {
    width: 3,
    height: '60%',
    borderRadius: 2,
  },
});
