import { useAuth } from "@/contexts/auth-context";
import { themeColors } from "@/constants/colors";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const colors = themeColors[colorScheme ?? "light"];

  const [username, setUsername] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const studentIdRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    Keyboard.dismiss();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signUp(username.trim(), studentId.trim(), password);
    } catch (e: any) {
      setError(e.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center bg-background px-7"
      >
        {/* Header */}
        <View className="items-center mb-10">
          <Text className="text-[28px] font-bold text-foreground tracking-tight">Create account</Text>
          <Text className="text-[16px] text-subtle mt-1.5">Join the attendance streak</Text>
        </View>

        {/* Error */}
        {error && (
          <View className="mb-5 rounded-xl border border-leeds-red-pastel bg-leeds-red-faded p-3.5">
            <Text className="text-[14px] text-center text-leeds-alert-error">{error}</Text>
          </View>
        )}

        {/* Username */}
        <Text className="text-[13px] font-semibold uppercase tracking-wide text-subtle mb-1.5">Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Choose a username"
          placeholderTextColor={colors.subtle}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="username"
          returnKeyType="next"
          onSubmitEditing={() => studentIdRef.current?.focus()}
          editable={!loading}
          className="h-[52px] rounded-xl border border-divider bg-card px-4 text-base text-foreground mb-4"
        />

        {/* Student ID */}
        <Text className="text-[13px] font-semibold uppercase tracking-wide text-subtle mb-1.5">Student ID</Text>
        <TextInput
          ref={studentIdRef}
          value={studentId}
          onChangeText={setStudentId}
          placeholder="e.g. S12345678"
          placeholderTextColor={colors.subtle}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!loading}
          className="h-[52px] rounded-xl border border-divider bg-card px-4 text-base text-foreground mb-4"
        />

        {/* Password */}
        <Text className="text-[13px] font-semibold uppercase tracking-wide text-subtle mb-1.5">Password</Text>
        <TextInput
          ref={passwordRef}
          value={password}
          onChangeText={setPassword}
          placeholder="Min. 6 characters"
          placeholderTextColor={colors.subtle}
          secureTextEntry
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
          editable={!loading}
          className="h-[52px] rounded-xl border border-divider bg-card px-4 text-base text-foreground mb-4"
        />

        {/* Confirm password */}
        <Text className="text-[13px] font-semibold uppercase tracking-wide text-subtle mb-1.5">Confirm Password</Text>
        <TextInput
          ref={confirmRef}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          placeholderTextColor={colors.subtle}
          secureTextEntry
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={handleRegister}
          editable={!loading}
          className="h-[52px] rounded-xl border border-divider bg-card px-4 text-base text-foreground mb-7"
        />

        {/* Sign Up button */}
        <Pressable
          onPress={handleRegister}
          disabled={loading}
          className={`h-[52px] rounded-xl items-center justify-center bg-foreground ${loading ? "opacity-70" : ""}`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[17px] font-bold text-background">Create Account</Text>
          )}
        </Pressable>

        {/* Login link */}
        <View className="items-center mt-6">
          <Pressable onPress={() => router.back()}>
            <Text className="text-[15px] text-subtle">
              Already have an account? <Text className="text-leeds-red font-semibold">Sign In</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
