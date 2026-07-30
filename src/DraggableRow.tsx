import React from "react";
import { Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { TableTheme } from "./theme/tokens";

export interface DraggableRowChildrenProps {
  dragGesture: ReturnType<typeof Gesture.Pan>;
}

export interface DraggableRowProps {
  children: (props: DraggableRowChildrenProps) => React.ReactNode;
  rowHeight: number;
  index: number;
  theme: TableTheme;
  onReorder: (fromIndex: number, toIndex: number) => void;
  isDragEnabled: boolean;
}

export function DraggableRow({
  children,
  rowHeight,
  index,
  theme,
  onReorder,
  isDragEnabled,
}: DraggableRowProps) {
  const translationY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const zIndex = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .enabled(isDragEnabled)
    .onBegin(() => {
      isDragging.value = true;
      zIndex.value = 100;
    })
    .onUpdate((e) => {
      translationY.value = e.translationY;
    })
    .onEnd((e) => {
      isDragging.value = false;
      zIndex.value = 1;

      // Calculate approximate rows moved
      const movedSlots = Math.round(e.translationY / rowHeight);
      const newIndex = index + movedSlots;

      if (movedSlots !== 0) {
        runOnJS(onReorder)(index, newIndex);
      }

      translationY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translationY.value }],
    zIndex: zIndex.value,
    shadowOpacity: isDragging.value ? 0.2 : 0,
    shadowRadius: 10,
    elevation: isDragging.value ? 5 : 0,
    backgroundColor: isDragging.value ? theme.surfaceHighlight : "transparent",
  }));

  return (
    <Animated.View style={[animatedStyle]}>
      {children({ dragGesture: panGesture })}
    </Animated.View>
  );
}
