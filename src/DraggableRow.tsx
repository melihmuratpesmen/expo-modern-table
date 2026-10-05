import React, { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { TableTheme } from './theme/tokens';
import { useStableCallback } from './hooks/useStableCallback';

export interface DraggableRowChildrenProps {
  dragGesture: ReturnType<typeof Gesture.Pan>;
}

export interface DraggableRowProps {
  children: (props: DraggableRowChildrenProps) => React.ReactNode;
  index: number;
  theme: TableTheme;
  /** Called with the row's index and total vertical drag distance. */
  onDragEnd: (index: number, translationY: number) => void;
  isDragEnabled: boolean;
  /** Gesture test id, for `react-native-gesture-handler/jest-utils`. */
  testID?: string;
}

export function DraggableRow({
  children,
  index,
  theme,
  onDragEnd,
  isDragEnabled,
  testID,
}: DraggableRowProps) {
  const translationY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const zIndex = useSharedValue(1);

  // Reads the latest index, so the gesture is only rebuilt when it is enabled / disabled.
  const handleDragEnd = useStableCallback((dy: number) => onDragEnd(index, dy));

  // Shared values are mutable by design inside worklets; the compiler rule doesn't know that.
  /* eslint-disable react-hooks/immutability */
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .withTestId(testID ?? '')
        .enabled(isDragEnabled)
        .onStart(() => {
          isDragging.value = true;
          zIndex.value = 100;
        })
        .onUpdate(e => {
          translationY.value = e.translationY;
        })
        .onEnd(e => {
          if (e.translationY !== 0) runOnJS(handleDragEnd)(e.translationY);
        })
        .onFinalize(() => {
          isDragging.value = false;
          zIndex.value = 1;
          translationY.value = withSpring(0);
        }),
    [testID, isDragEnabled, handleDragEnd, isDragging, zIndex, translationY]
  );
  /* eslint-enable react-hooks/immutability */

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translationY.value }],
    zIndex: zIndex.value,
    shadowOpacity: isDragging.value ? 0.2 : 0,
    shadowRadius: 10,
    elevation: isDragging.value ? 5 : 0,
    backgroundColor: isDragging.value ? theme.surfaceHighlight : 'transparent',
  }));

  return (
    <Animated.View style={animatedStyle}>{children({ dragGesture: panGesture })}</Animated.View>
  );
}
