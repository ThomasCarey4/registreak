import { SuccessOverlay } from "@/components/success-overlay";
import { themeColors } from "@/constants/colors";
import { useColorScheme } from "nativewind";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { apiService } from "@/services/api";
import { useAuth } from "@/context/auth-context";

export default function AttendScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [cells, setCells] = useState<(string | null)[]>([null, null, null, null]);
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isError, setIsError] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const toastAnim = useRef(new Animated.Value(-120)).current;
  const toastProgress = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);
  const { colorScheme } = useColorScheme();
  const colors = themeColors[colorScheme ?? "light"];
  const router = useRouter();
  const hasProcessedDeepLink = useRef(false);

  // Handle deep link code parameter
  useEffect(() => {
    if (params.code && typeof params.code === "string" && !hasProcessedDeepLink.current) {
      hasProcessedDeepLink.current = true;
      const code = params.code.replace(/[^0-9]/g, "").slice(0, 4);
      
      if (code.length === 4) {
        const digits = code.split("");
        setCells(digits);
        submitCode(code);
      }
    }
  }, [params.code]);

  // Auto-open keyboard only on initial app launch
  useEffect(() => {
    if (!params.code) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [params.code]);

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
      await apiService.verifyAttendance(finalCode);

      setIsError(false);
      setSubmitted(true);
      Keyboard.dismiss();
      setShowSuccess(true);

      setTimeout(() => {
        setCells([null, null, null, null]);
        setSubmitted(false);
        hasProcessedDeepLink.current = false;
      }, 400);
    } catch (error) {
      setIsError(true);
      setSubmitted(true);
      setShowToast(true);
      hasProcessedDeepLink.current = false;
    }
  };

  const handleCodeChange = (text: string) => {
    if (submitted && isError) {
      setSubmitted(false);
      setIsError(false);
    }

    if (text.length > 1) {
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
      if (editIndex !== null) {
        if (cells[editIndex] !== null) {
          const newCells = [...cells];
          newCells[editIndex] = null;
          setCells(newCells);
          const hasDigitsAfter = newCells.slice(editIndex + 1).some((c) => c !== null);
          if (!hasDigitsAfter) {
            let prev = editIndex - 1;
            while (prev >= 0 && newCells[prev] === null) prev--;
            setEditIndex(prev >= 0 ? prev : null);
          }
        }
      } else {
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

  if (user?.is_staff) {
    return <Redirect href="/lectures" />;
  }

  return (
    <Pressable onPress={Keyboard.dismiss} className="flex-1 bg-background">
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
          }}
          className="bg-toast-bg border border-toast-border"
        >
          <View className="flex-row items-center px-4 py-3.5">
            <View className="w-9 h-9 rounded-xl justify-center items-center mr-3 bg-toast-icon-bg">
              <Text className="text-base text-error">✕</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-toast-title">Invalid Code</Text>
              <Text className="text-[12px] mt-0.5 text-toast-subtitle/80">Please check the code and try again</Text>
            </View>
          </View>
          <Animated.View
            style={{
              height: 3,
              opacity: 0.5,
              width: toastProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            }}
            className="bg-toast-progress"
          />
        </Animated.View>
      )}

      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center mb-12">
          <Text className="text-[32px] font-bold mb-2 text-center text-foreground">Mark Attendance</Text>
          <Text className="text-base text-center leading-[22px] text-foreground/50">
            Enter the 4-digit code shown in your lecture
          </Text>
        </View>

        <View className="flex-row gap-3">
          {[0, 1, 2, 3].map((i) => {
            const isActive = activeIndex === i;
            const cellBorder = submitted
              ? isError
                ? colors.error
                : colors.success
              : isActive
                ? colors.tint
                : undefined;
            const bgClass = submitted ? (isError ? "bg-error-cell-bg" : "bg-success-cell-bg") : "bg-digit-bg";
            const borderClass = !submitted && !isActive ? "border-digit-border" : "";

            return (
              <Pressable
                key={i}
                onPress={() => handleTapDigit(i)}
                className={`w-[68px] h-[84px] rounded-2xl border-2 justify-center items-center ${bgClass} ${borderClass}`}
                style={cellBorder ? { borderColor: cellBorder } : undefined}
              >
                <Text
                  className="text-4xl font-bold text-foreground"
                  style={submitted ? { color: isError ? colors.error : colors.success } : undefined}
                >
                  {cells[i] || ""}
                </Text>
              </Pressable>
            );
          })}
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