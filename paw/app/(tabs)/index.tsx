import { SuccessOverlay } from "@/components/success-overlay";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { apiService } from "@/services/api";

export default function AttendScreen() {
  const [cells, setCells] = useState<(string | null)[]>([null, null, null, null]);
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isError, setIsError] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const toastAnim = useRef(new Animated.Value(-120)).current;
  const toastProgress = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const params = useLocalSearchParams();
  const hasProcessedDeepLink = useRef(false);

  // Handle deep link code parameter
  useEffect(() => {
    if (params.code && typeof params.code === 'string' && !hasProcessedDeepLink.current) {
      const code = params.code;

      // Validate it's exactly 4 digits
      if (/^\d{4}$/.test(code)) {
        hasProcessedDeepLink.current = true;

        // Auto-populate cells
        const digits = code.split('');
        setCells([digits[0], digits[1], digits[2], digits[3]]);

        // Auto-submit after a short delay to show the UI
        setTimeout(() => {
          submitCode(code);
        }, 500);
      }
    }
  }, [params.code]);

  // Auto-open keyboard only on initial app launch
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
          toValue: -120,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          setShowToast(false);
        });
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const firstEmpty = cells.findIndex((c) => c === null);
  const activeIndex = editIndex ?? (firstEmpty === -1 ? 4 : firstEmpty);

  const submitCode = async (finalCode: string) => {
    setEditIndex(null);
    
    try {
      // Call the API to verify attendance
      await apiService.verifyAttendance(finalCode);
      
      // Success - show success overlay
      setIsError(false);
      setSubmitted(true);
      Keyboard.dismiss();
      setShowSuccess(true);
      
      setTimeout(() => {
        setCells([null, null, null, null]);
        setSubmitted(false);
      }, 400);
    } catch (error) {
      // Failed - show error toast
      setIsError(true);
      setSubmitted(true);
      setShowToast(true);
    }
  };

  const handleCodeChange = (text: string) => {
    // Clear error state once user starts typing
    if (submitted && isError) {
      setSubmitted(false);
      setIsError(false);
    }

    if (text.length > 1) {
      // Digit typed (text is sentinel "x" + new char)
      const newDigit = text.slice(1).replace(/[^0-9]/g, "")[0];
      if (!newDigit || activeIndex > 3) return;

      const newCells = [...cells];
      newCells[activeIndex] = newDigit;
      setCells(newCells);

      if (newCells.every((c) => c !== null)) {
        submitCode(newCells.join(""));
        return;
      }

      if (editIndex !== null) {
        const next = editIndex + 1;
        setEditIndex(next < 4 ? next : null);
      }
    } else if (text.length === 0) {
      // Backspace
      if (editIndex !== null) {
        if (cells[editIndex] !== null) {
          const newCells = [...cells];
          newCells[editIndex] = null;
          setCells(newCells);
          // If no digits after this cell, go back instead of staying
          const hasDigitsAfter = newCells.slice(editIndex + 1).some((c) => c !== null);
          if (!hasDigitsAfter) {
            // Move back to previous filled cell, or exit edit mode
            let prev = editIndex - 1;
            while (prev >= 0 && newCells[prev] === null) prev--;
            setEditIndex(prev >= 0 ? prev : null);
          }
        }
      } else {
        // Normal mode: clear rightmost filled cell
        for (let i = 3; i >= 0; i--) {
          if (cells[i] !== null) {
            const newCells = [...cells];
            newCells[i] = null;
            setCells(newCells);
            break;
          }
        }
      }
    }
  };

  const handleTapDigit = (i: number) => {
    if (submitted) {
      setSubmitted(false);
      setIsError(false);
    }
    setEditIndex(i);
    inputRef.current?.focus();
  };

  const handleReset = () => {
    setSubmitted(false);
  };

  return (
    <Pressable onPress={Keyboard.dismiss} className={`flex-1 ${isDark ? "bg-[#151718]" : "bg-white"}`}>
      <SuccessOverlay
        visible={showSuccess}
        onFadeStart={() => {
          handleReset();
          router.push({ pathname: "/(tabs)/streaks", params: { celebrate: "true" } });
        }}
        onComplete={() => {
          setShowSuccess(false);
        }}
      />

      {showToast && (
        <Animated.View
          pointerEvents="none"
          style={{
            transform: [{ translateY: toastAnim }],
            position: "absolute",
            top: 60,
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
        </Animated.View>
      )}

      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center mb-12">
          <Text className={`text-[32px] font-bold mb-2 text-center ${isDark ? "text-[#ECEDEE]" : "text-[#374151]"}`}>
            Mark Attendance
          </Text>
          <Text
            className={`text-base text-center leading-[22px] ${isDark ? "text-[#ECEDEE]/50" : "text-[#374151]/50"}`}
          >
            Enter the 4-digit code shown in your lecture
          </Text>
        </View>

        <View className="flex-row gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Pressable
              key={i}
              onPress={() => handleTapDigit(i)}
              className="w-[68px] h-[84px] rounded-2xl border-2 justify-center items-center"
              style={{
                borderColor: submitted
                  ? isError
                    ? "#F44336"
                    : "#4CAF50"
                  : activeIndex === i
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
                className={`text-4xl font-bold ${isDark ? "text-[#ECEDEE]" : "text-[#374151]"}`}
                style={submitted ? { color: isError ? "#F44336" : "#4CAF50" } : undefined}
              >
                {cells[i] || ""}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          ref={inputRef}
          value="x"
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={2}
          className="absolute opacity-0 h-0 w-0"
          caretHidden
        />
      </View>
    </Pressable>
  );
}
