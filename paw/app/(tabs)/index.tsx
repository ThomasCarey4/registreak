import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";

export default function AttendScreen() {
  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme() ?? "light";
  const tintColor = Colors[colorScheme].tint;
  const isDark = colorScheme === "dark";

  useFocusEffect(
    useCallback(() => {
      setCode("");
      setSubmitted(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }, []),
  );

  const handleCodeChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "").slice(0, 4);
    setCode(digits);
    if (digits.length === 4) {
      Keyboard.dismiss();
      setSubmitted(true);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center items-center px-6"
      >
        <View className="items-center mb-12">
          <Text className="text-[56px] mb-4">🐾</Text>
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
                borderColor: submitted ? "#4CAF50" : code.length === i ? tintColor : isDark ? "#333" : "#D0D5DD",
                backgroundColor: submitted ? (isDark ? "#1a3a1a" : "#E8F5E9") : isDark ? "#1C1C1E" : "#F9FAFB",
              }}
            >
              <Text
                className={`text-4xl font-bold ${isDark ? "text-[#ECEDEE]" : "text-[#11181C]"}`}
                style={submitted ? { color: "#4CAF50" } : undefined}
              >
                {code[i] || ""}
              </Text>
            </View>
          ))}
        </Pressable>

        {submitted && (
          <View className="items-center mt-9">
            <View className="w-14 h-14 rounded-full bg-[#E8F5E9] justify-center items-center mb-3">
              <Text className="text-[28px] font-bold text-[#4CAF50]">✓</Text>
            </View>
            <Text className="text-xl font-semibold mb-5 text-[#4CAF50]">Attendance Recorded!</Text>
            <Pressable
              onPress={handleReset}
              className="px-6 py-3 rounded-[10px]"
              style={{ backgroundColor: tintColor }}
            >
              <Text className="text-white font-semibold text-[15px]">Enter Another Code</Text>
            </Pressable>
          </View>
        )}

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
