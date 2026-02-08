import React, { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const FIRE_EMOJIS = ["🔥", "🔥", "🔥", "🔥", "🔥", "🔥", "🔥", "🔥", "🔥", "🔥", "🔥", "🔥"];
const NUM_PARTICLES = 14;

interface FireCelebrationProps {
  visible: boolean;
}

interface ParticleConfig {
  startX: number;
  startY: number;
  endY: number;
  driftX: number;
  delay: number;
  duration: number;
  emoji: string;
  size: number;
  rotation: number;
}

function generateParticles(): ParticleConfig[] {
  return Array.from({ length: NUM_PARTICLES }, (_, i) => ({
    startX: Math.random() * (SCREEN_WIDTH - 40),
    startY: SCREEN_HEIGHT * 0.3 + Math.random() * SCREEN_HEIGHT * 0.5,
    endY: -(60 + Math.random() * 100),
    driftX: (Math.random() - 0.5) * 80,
    delay: Math.random() * 600,
    duration: 1800 + Math.random() * 1200,
    emoji: FIRE_EMOJIS[i % FIRE_EMOJIS.length],
    size: 24 + Math.random() * 20,
    rotation: (Math.random() - 0.5) * 30,
  }));
}

export function FireCelebration({ visible }: FireCelebrationProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const particles = useMemo(() => generateParticles(), [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((config, index) => (
        <FireParticle key={`${index}-${visible}`} config={config} />
      ))}
    </View>
  );
}

interface FireParticleProps {
  config: ParticleConfig;
}

function FireParticle({ config }: FireParticleProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    // Fade in quickly, float up, then fade out
    opacity.value = withDelay(
      config.delay,
      withSequence(
        withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: config.duration * 0.5 }),
        withTiming(0, { duration: config.duration * 0.3, easing: Easing.in(Easing.quad) }),
      ),
    );

    // Scale up then slightly down
    scale.value = withDelay(
      config.delay,
      withSequence(
        withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(0.6, { duration: config.duration * 0.7, easing: Easing.in(Easing.quad) }),
      ),
    );

    // Float upward
    translateY.value = withDelay(
      config.delay,
      withTiming(config.endY - config.startY, {
        duration: config.duration,
        easing: Easing.out(Easing.quad),
      }),
    );

    // Horizontal drift
    translateX.value = withDelay(
      config.delay,
      withTiming(config.driftX, {
        duration: config.duration,
        easing: Easing.inOut(Easing.sin),
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
      { rotate: `${config.rotation}deg` },
    ],
  }));

  return (
    <Animated.Text
      style={[
        {
          position: "absolute",
          left: config.startX,
          top: config.startY,
          fontSize: config.size,
        },
        animStyle,
      ]}
    >
      {config.emoji}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    pointerEvents: "none",
  },
});
