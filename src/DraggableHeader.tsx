import React from "react";
import { StyleSheet } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { TableTheme } from "./theme/tokens";

interface DraggableHeaderProps {
  title: string;
  width: number;
  height: number;
  index: number;
  columnKey: string;
  theme: TableTheme;
  onReorder: (fromIndex: number, toIndex: number) => void;
  children: React.ReactNode;
}

export function DraggableHeader({
  width,
  height,
  index,
  theme,
  onReorder,
  children,
}: DraggableHeaderProps) {
  const translationX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const zIndex = useSharedValue(1);
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
      zIndex.value = 100;
      scale.value = 1.05;
    })
    .onUpdate((e) => {
      translationX.value = e.translationX;
    })
    .onEnd((e) => {
      isDragging.value = false;
      zIndex.value = 1;
      scale.value = 1;

      // Calculate the approximate index moved based on width
      const movedSlots = Math.round(e.translationX / width);
      const newIndex = index + movedSlots;

      if (movedSlots !== 0) {
        runOnJS(onReorder)(index, newIndex);
      }

      translationX.value = withSpring(0);
    });

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
    justifyContent: "center",
    // positioning will be handled by the parent list layout,
    // but the transform moves it relative to that slot
  },
});
