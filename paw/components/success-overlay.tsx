import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Dimensions, Modal, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { status } from "@/constants/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SuccessOverlayProps {
  visible: boolean;
  onComplete: () => void;
  onFadeStart?: () => void;
}

export function SuccessOverlay({ visible, onComplete, onFadeStart }: SuccessOverlayProps) {
  const circleScale = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0);
  const ring2Scale = useSharedValue(1);
  const ring2Opacity = useSharedValue(0);
  const ring3Scale = useSharedValue(1);
  const ring3Opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(24);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(18);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Reset all values
      circleScale.value = 0;
      iconScale.value = 0;
      ring1Scale.value = 1;
      ring1Opacity.value = 0;
      ring2Scale.value = 1;
      ring2Opacity.value = 0;
      ring3Scale.value = 1;
      ring3Opacity.value = 0;
      textOpacity.value = 0;
      textTranslateY.value = 24;
      subtitleOpacity.value = 0;
      subtitleTranslateY.value = 18;
      overlayOpacity.value = 0;

      // Background fade in
      overlayOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });

      // Circle scale up with spring
      circleScale.value = withDelay(250, withSpring(1, { damping: 13, stiffness: 140, mass: 0.9 }));

      // Icon container scale — bouncy pop
      iconScale.value = withDelay(450, withSpring(1, { damping: 8, stiffness: 160, mass: 0.7 }));

      // Haptic feedback — timed with the first ripple pulse
      const hapticTimer = setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 700);

      // Ripple 1 — starts right after tick lands (from circle outward)
      ring1Scale.value = withDelay(700, withTiming(3.5, { duration: 900, easing: Easing.out(Easing.quad) }));
      ring1Opacity.value = withDelay(
        700,
        withSequence(withTiming(0.45, { duration: 120 }), withTiming(0, { duration: 780 })),
      );

      // Ripple 2 — staggered
      ring2Scale.value = withDelay(850, withTiming(4.2, { duration: 1000, easing: Easing.out(Easing.quad) }));
      ring2Opacity.value = withDelay(
        850,
        withSequence(withTiming(0.3, { duration: 120 }), withTiming(0, { duration: 880 })),
      );

      // Ripple 3 — final, largest
      ring3Scale.value = withDelay(1000, withTiming(5.0, { duration: 1100, easing: Easing.out(Easing.quad) }));
      ring3Opacity.value = withDelay(
        1000,
        withSequence(withTiming(0.2, { duration: 120 }), withTiming(0, { duration: 980 })),
      );

      // Text animations — after ripples start
      textOpacity.value = withDelay(900, withTiming(1, { duration: 450 }));
      textTranslateY.value = withDelay(900, withSpring(0, { damping: 14, stiffness: 100 }));

      subtitleOpacity.value = withDelay(1100, withTiming(1, { duration: 450 }));
      subtitleTranslateY.value = withDelay(1100, withSpring(0, { damping: 14, stiffness: 100 }));

      // Auto dismiss — fade everything out together
      const timer = setTimeout(() => {
        onFadeStart?.();
        textOpacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) });
        circleScale.value = withTiming(0.8, { duration: 200, easing: Easing.in(Easing.cubic) });
        iconScale.value = withTiming(0.8, { duration: 200, easing: Easing.in(Easing.cubic) });
        overlayOpacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) });
        setTimeout(onComplete, 220);
      }, 2000);

      return () => {
        clearTimeout(timer);
        clearTimeout(hapticTimer);
      };
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  const ring3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring3Scale.value }],
    opacity: ring3Opacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        {/* Background */}
        <View style={styles.bgLayer1} />
        <View style={styles.bgLayer2} />

        <View style={styles.content}>
          {/* Circle + tick + ripples all centered together */}
          <View style={styles.iconArea}>
            {/* Ripple rings — same center as the circle/tick */}
            <Animated.View style={[styles.ripple, ring1Style]} />
            <Animated.View style={[styles.ripple, ring2Style]} />
            <Animated.View style={[styles.ripple, ring3Style]} />

            {/* Circle background */}
            <Animated.View style={[styles.circleOuter, circleStyle]}>
              <View style={styles.circleGlow} />
              <View style={styles.circleInner}>
                {/* Checkmark SVG */}
                <Animated.View style={iconContainerStyle}>
                  <Svg width={56} height={56} viewBox="0 0 56 56" fill="none">
                    <Path
                      d="M15 28.5L24 37.5L41 18.5"
                      stroke="white"
                      strokeWidth={4.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </Svg>
                </Animated.View>
              </View>
            </Animated.View>
          </View>

          {/* Text */}
          <Animated.Text style={[styles.title, titleStyle]}>Attendance Recorded</Animated.Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const CIRCLE_SIZE = 120;
const RIPPLE_BASE = CIRCLE_SIZE;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  bgLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: status.successOverlay,
  },
  bgLayer2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconArea: {
    width: CIRCLE_SIZE + 16,
    height: CIRCLE_SIZE + 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  ripple: {
    position: "absolute",
    width: RIPPLE_BASE,
    height: RIPPLE_BASE,
    borderRadius: RIPPLE_BASE / 2,
    borderWidth: 2.5,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  circleOuter: {
    width: CIRCLE_SIZE + 16,
    height: CIRCLE_SIZE + 16,
    borderRadius: (CIRCLE_SIZE + 16) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  circleGlow: {
    position: "absolute",
    width: CIRCLE_SIZE + 16,
    height: CIRCLE_SIZE + 16,
    borderRadius: (CIRCLE_SIZE + 16) / 2,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  circleInner: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: -0.3,
  },
});
