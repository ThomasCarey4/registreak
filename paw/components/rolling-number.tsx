import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from "react-native-reanimated";

interface RollingNumberProps {
  value: number;
  animate: boolean;
  fontSize?: number;
  color?: string;
  fontWeight?: string;
  delay?: number;
}

const DIGIT_HEIGHT_RATIO = 1.3; // ratio of lineHeight to fontSize
const DIGIT_WIDTH_RATIO = 0.65; // approximate width of a digit relative to fontSize

export function RollingNumber({
  value,
  animate,
  fontSize = 56,
  color = "#374151",
  fontWeight = "800",
  delay = 0,
}: RollingNumberProps) {
  const digitHeight = fontSize * DIGIT_HEIGHT_RATIO;
  const digits = String(value).split("");
  const prevDigits = String(Math.max(0, value - 1)).split("");

  // Pad to same length
  while (prevDigits.length < digits.length) {
    prevDigits.unshift("0");
  }

  const digitWidth = fontSize * DIGIT_WIDTH_RATIO;

  return (
    <View style={[styles.container, { height: digitHeight }]}>
      {digits.map((digit, index) => {
        const prevDigit = prevDigits[index] || "0";
        const changed = prevDigit !== digit;
        return (
          <SingleDigitRoll
            key={`${index}-${digits.length}`}
            newDigit={digit}
            oldDigit={prevDigit}
            animate={animate && changed}
            fontSize={fontSize}
            color={color}
            fontWeight={fontWeight}
            digitHeight={digitHeight}
            digitWidth={digitWidth}
            delay={delay + index * 80}
          />
        );
      })}
    </View>
  );
}

interface SingleDigitRollProps {
  newDigit: string;
  oldDigit: string;
  animate: boolean;
  fontSize: number;
  color: string;
  fontWeight: string;
  digitHeight: number;
  digitWidth: number;
  delay: number;
}

function SingleDigitRoll({
  newDigit,
  oldDigit,
  animate,
  fontSize,
  color,
  fontWeight,
  digitHeight,
  digitWidth,
  delay,
}: SingleDigitRollProps) {
  const translateY = useSharedValue(0);
  const [showOld, setShowOld] = useState(animate);

  useEffect(() => {
    if (animate) {
      setShowOld(true);
      translateY.value = 0;

      // Roll down: old goes from 0 to +digitHeight (exits bottom)
      // new goes from -digitHeight to 0 (enters from top)
      translateY.value = withDelay(
        delay,
        withSpring(digitHeight, {
          damping: 18,
          stiffness: 90,
          mass: 0.8,
        }),
      );

      // Hide old digit after animation
      const timer = setTimeout(() => {
        setShowOld(false);
      }, delay + 600);

      return () => clearTimeout(timer);
    } else {
      translateY.value = digitHeight;
      setShowOld(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  const oldStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const newStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value - digitHeight }],
  }));

  const textStyle = {
    fontSize,
    color,
    fontWeight: fontWeight as any,
    lineHeight: digitHeight,
    textAlign: "center" as const,
  };

  if (!animate && !showOld) {
    // Static display
    return (
      <View style={[styles.digitContainer, { height: digitHeight, width: digitWidth }]}>
        <Animated.Text style={textStyle}>{newDigit}</Animated.Text>
      </View>
    );
  }

  return (
    <View style={[styles.digitContainer, { height: digitHeight, width: digitWidth }]}>
      {/* Old digit (starts visible, rolls down and out) */}
      {showOld && <Animated.Text style={[textStyle, styles.absoluteDigit, oldStyle]}>{oldDigit}</Animated.Text>}
      {/* New digit (starts above, rolls down into view) */}
      <Animated.Text style={[textStyle, styles.absoluteDigit, newStyle]}>{newDigit}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  digitContainer: {
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  absoluteDigit: {
    position: "absolute",
  },
});
