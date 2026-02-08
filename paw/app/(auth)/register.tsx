import { useAuth } from "@/contexts/auth-context";
import { Fonts, LeedsRed, LeedsAlert } from "@/constants/theme";
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
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "center", paddingHorizontal: 28 }}
        >
          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: colors.foreground,
                fontFamily: Fonts.rounded,
                letterSpacing: -0.5,
              }}
            >
              Create account
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.subtle,
                marginTop: 6,
                fontFamily: Fonts.sans,
              }}
            >
              Join the attendance streak
            </Text>
          </View>

          {/* Error */}
          {error && (
            <View
              style={{
                backgroundColor: LeedsRed.faded,
                borderWidth: 1,
                borderColor: LeedsRed.pastel,
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: LeedsAlert.error,
                  fontSize: 14,
                  fontFamily: Fonts.sans,
                  textAlign: "center",
                }}
              >
                {error}
              </Text>
            </View>
          )}

          {/* Username */}
          <Text style={labelStyle(colors)}>Username</Text>
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
            style={inputStyle(colors)}
          />

          {/* Student ID */}
          <Text style={labelStyle(colors)}>Student ID</Text>
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
            style={inputStyle(colors)}
          />

          {/* Password */}
          <Text style={labelStyle(colors)}>Password</Text>
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
            style={inputStyle(colors)}
          />

          {/* Confirm password */}
          <Text style={labelStyle(colors)}>Confirm Password</Text>
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
            style={[inputStyle(colors), { marginBottom: 28 }]}
          />

          {/* Sign Up button */}
          <Pressable
            onPress={handleRegister}
            disabled={loading}
            style={({ pressed }) => ({
              height: 52,
              borderRadius: 12,
              backgroundColor: pressed ? colors.tint + "dd" : colors.tint,
              alignItems: "center",
              justifyContent: "center",
              opacity: loading ? 0.7 : 1,
            })}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 17,
                  fontWeight: "700",
                  fontFamily: Fonts.rounded,
                }}
              >
                Create Account
              </Text>
            )}
          </Pressable>

          {/* Login link */}
          <View style={{ alignItems: "center", marginTop: 24 }}>
            <Pressable onPress={() => router.back()}>
              <Text
                style={{
                  fontSize: 15,
                  color: colors.subtle,
                  fontFamily: Fonts.sans,
                }}
              >
                Already have an account? <Text style={{ color: LeedsRed.base, fontWeight: "600" }}>Sign In</Text>
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

// ─── Shared styles ────────────────────────────────────
type ThemeColors = (typeof themeColors)["light"] | (typeof themeColors)["dark"];

const labelStyle = (colors: ThemeColors) => ({
  fontSize: 13,
  fontWeight: "600" as const,
  color: colors.subtle,
  marginBottom: 6,
  fontFamily: Fonts.sans,
  textTransform: "uppercase" as const,
  letterSpacing: 0.5,
});

const inputStyle = (colors: ThemeColors) => ({
  height: 52,
  borderWidth: 1,
  borderColor: colors.divider,
  borderRadius: 12,
  paddingHorizontal: 16,
  fontSize: 16,
  color: colors.foreground,
  backgroundColor: colors.card,
  fontFamily: Fonts.sans,
  marginBottom: 16,
});
