import React from 'react';
import { Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { TableTheme } from './theme/tokens';

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

  const panGesture = Gesture.Pan()
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
      if (e.translationY !== 0) runOnJS(onDragEnd)(index, e.translationY);
    })
    .onFinalize(() => {
      isDragging.value = false;
      zIndex.value = 1;
      translationY.value = withSpring(0);
    });

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
