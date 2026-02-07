import { SuccessOverlay } from "@/components/success-overlay";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";

export default function AttendScreen() {
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isError, setIsError] = useState(false);
  const toastAnim = useRef(new Animated.Value(120)).current;
  const toastProgress = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;
  const isDark = colorScheme === "dark";

  useFocusEffect(
    useCallback(() => {
      setCode("");
      setSubmitted(false);
      setShowSuccess(false);
      setShowToast(false);
      setIsError(false);
      toastAnim.setValue(120);
      toastProgress.setValue(1);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }, []),
  );

  useEffect(() => {
    if (showToast) {
      toastProgress.setValue(1);

      Animated.spring(toastAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();

      Animated.timing(toastProgress, {
        toValue: 0,
        duration: 2200,
        useNativeDriver: false,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: 120,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setShowToast(false);
          handleReset();
        });
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleCodeChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "").slice(0, 4);
    setCode(digits);
    if (digits.length === 4) {
      Keyboard.dismiss();
      const correct = digits === "1234";
      setIsError(!correct);
      setSubmitted(true);
      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowSuccess(true);
        // Clear digits immediately so they're gone behind the overlay
        setTimeout(() => {
          setCode("");
          setSubmitted(false);
        }, 400);
      } else {
        setShowToast(true);
      }
    }
  };

  const handleTapDigits = () => {
    if (!submitted) {
      inputRef.current?.focus();
    }
  };

  const handleReset = () => {
    setCode("");
    setSubmitted(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-[#151718]" : "bg-white"}`}>
      <SuccessOverlay
        visible={showSuccess}
        onComplete={() => {
          setShowSuccess(false);
          handleReset();
        }}
      />

      {showToast && (
        <Animated.View
          style={{
            transform: [{ translateY: toastAnim }],
            position: "absolute",
            bottom: 12,
            left: 16,
            right: 16,
            zIndex: 50,
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: isDark ? "#2B1C1C" : "#FFF5F5",
            borderWidth: 1,
            borderColor: isDark ? "#4A2D2D" : "#FFCDD2",
          }}
        >
          <Animated.View
            style={{
              height: 3,
              backgroundColor: isDark ? "#F44336" : "#EF5350",
              opacity: 0.5,
              width: toastProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            }}
          />
          <View className="flex-row items-center px-4 py-3.5">
            <View
              className="w-9 h-9 rounded-xl justify-center items-center mr-3"
              style={{
                backgroundColor: isDark ? "#4A2D2D" : "#FFCDD2",
              }}
            >
              <Text className="text-base" style={{ color: "#F44336" }}>
                ✕
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-semibold" style={{ color: isDark ? "#EF9A9A" : "#C62828" }}>
                Invalid Code
              </Text>
              <Text
                className="text-[12px] mt-0.5"
                style={{
                  color: isDark ? "#EF9A9A" : "#E57373",
                  opacity: 0.8,
                }}
              >
                Please check the code and try again
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center items-center px-6"
      >
        <View className="items-center mb-12">
          <Text className={`text-[32px] font-bold mb-2 text-center ${isDark ? "text-[#ECEDEE]" : "text-[#11181C]"}`}>
            Mark Attendance
          </Text>
          <Text
            className={`text-base text-center leading-[22px] ${isDark ? "text-[#ECEDEE]/50" : "text-[#11181C]/50"}`}
          >
            Enter the 4-digit code shown in your lecture
          </Text>
        </View>

        <Pressable onPress={handleTapDigits} className="flex-row gap-3">
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              className="w-[68px] h-[84px] rounded-2xl border-2 justify-center items-center"
              style={{
                borderColor: submitted
                  ? isError
                    ? "#F44336"
                    : "#4CAF50"
                  : code.length === i
                    ? tintColor
                    : isDark
                      ? "#333"
                      : "#D0D5DD",
                backgroundColor: submitted
                  ? isError
                    ? isDark
                      ? "#3a1a1a"
                      : "#FBE9E7"
                    : isDark
                      ? "#1a3a1a"
                      : "#E8F5E9"
                  : isDark
                    ? "#1C1C1E"
                    : "#F9FAFB",
              }}
            >
              <Text
                className={`text-4xl font-bold ${isDark ? "text-[#ECEDEE]" : "text-[#11181C]"}`}
                style={submitted ? { color: isError ? "#F44336" : "#4CAF50" } : undefined}
              >
                {code[i] || ""}
              </Text>
            </View>
          ))}
        </Pressable>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={4}
          autoFocus
          className="absolute opacity-0 h-0 w-0"
          caretHidden
        />
      </KeyboardAvoidingView>
    </View>
  );
}
