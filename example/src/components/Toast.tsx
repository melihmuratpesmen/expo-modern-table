import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

export interface ToastMessage {
  id: number;
  text: string;
  action?: { label: string; onPress: () => void };
}

/** One message at a time, bottom-centre, auto-hides after 3.5 s. */
export function Toast({ message, onHide }: { message: ToastMessage | null; onHide: () => void }) {
  const [opacity] = useState(() => new Animated.Value(0));
  const hideRef = useRef(onHide);
  useEffect(() => {
    hideRef.current = onHide;
  });

  useEffect(() => {
    if (!message) return;
    Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    const id = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
        hideRef.current()
      );
    }, 3500);
    return () => clearTimeout(id);
  }, [message, opacity]);

  if (!message) return null;
  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.toast, { opacity }]} accessibilityLiveRegion="polite">
        <CheckCircle2 size={16} color="#34D399" />
        <Text style={styles.text}>{message.text}</Text>
        {message.action && (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              message.action?.onPress();
              onHide();
            }}
          >
            <Text style={styles.action}>{message.action.label}</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 80, alignItems: 'center', pointerEvents: 'box-none' },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    maxWidth: 520,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  text: { color: '#F8FAFC', fontSize: 14, fontWeight: '500', flexShrink: 1 },
  action: { color: '#A5B4FC', fontSize: 14, fontWeight: '700', marginLeft: 4 },
});
