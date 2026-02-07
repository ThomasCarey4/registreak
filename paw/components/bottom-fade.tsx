import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCallback, useRef, useState } from "react";
import { Animated, NativeScrollEvent, NativeSyntheticEvent } from "react-native";

/** How close to the bottom (in px) before we hide the fade */
const THRESHOLD = 10;

export function useBottomFade() {
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
      const shouldShow = distanceFromBottom > THRESHOLD;

      if (shouldShow !== visible) {
        setVisible(shouldShow);
        Animated.timing(opacity, {
          toValue: shouldShow ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    },
    [visible, opacity],
  );

  return { opacity, onScroll };
}

export function BottomFade({ opacity }: { opacity?: Animated.Value }) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const bg = isDark ? "rgba(21,23,24," : "rgba(255,255,255,";

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        opacity: opacity ?? 1,
      }}
      pointerEvents="none"
    >
      <LinearGradient colors={[`${bg}0)`, `${bg}0.9)`, `${bg}1)`]} style={{ flex: 1 }} />
    </Animated.View>
  );
}
