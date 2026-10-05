import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { TableTheme } from './theme/tokens';
import { useStableCallback } from './hooks/useStableCallback';

/** Long-press before a header drag starts, so horizontal scrolling over headers still works. */
const DRAG_ACTIVATION_DELAY_MS = 250;

interface DraggableHeaderProps {
  width: number;
  height: number;
  index: number;
  theme: TableTheme;
  /** Called with the header's index and total horizontal drag distance. */
  onDragEnd: (index: number, translationX: number) => void;
  children: React.ReactNode;
  /** Gesture test id, for `react-native-gesture-handler/jest-utils`. */
  testID?: string;
}

export function DraggableHeader({
  width,
  height,
  index,
  theme,
  onDragEnd,
  children,
  testID,
}: DraggableHeaderProps) {
  const translationX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const zIndex = useSharedValue(1);
  const scale = useSharedValue(1);

  // Reads the latest index, so the gesture below never has to be rebuilt mid-drag (a rebuilt
  // gesture loses its finalize callback and leaves the header stuck in the lifted state).
  const handleDragEnd = useStableCallback((dx: number) => onDragEnd(index, dx));

  // Shared values are mutable by design inside worklets; the compiler rule doesn't know that.
  /* eslint-disable react-hooks/immutability */
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .withTestId(testID ?? '')
        .activateAfterLongPress(DRAG_ACTIVATION_DELAY_MS)
        .onStart(() => {
          isDragging.value = true;
          zIndex.value = 100;
          scale.value = 1.05;
        })
        .onUpdate(e => {
          translationX.value = e.translationX;
        })
        .onEnd(e => {
          if (e.translationX !== 0) runOnJS(handleDragEnd)(e.translationX);
        })
        .onFinalize(() => {
          // Runs for taps and cancelled gestures too, so the header never stays "lifted".
          isDragging.value = false;
          zIndex.value = 1;
          scale.value = 1;
          translationX.value = withSpring(0);
        }),
    [testID, handleDragEnd, isDragging, zIndex, scale, translationX]
  );
  /* eslint-enable react-hooks/immutability */

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }, { scale: scale.value }],
    zIndex: zIndex.value,
    shadowOpacity: isDragging.value ? 0.2 : 0,
    shadowRadius: 10,
    elevation: isDragging.value ? 5 : 0,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.container,
          { width, height, backgroundColor: theme.headerBackground },
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
});
