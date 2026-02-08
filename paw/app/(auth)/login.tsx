import { useAuth } from "@/contexts/auth-context";
import { Colors, Fonts, LeedsRed, LeedsAlert, LeedsBorder } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError(null);
    setLoading(true);
    try {
      await signIn(username.trim(), password);
    } catch (e: any) {
      setError(e.message ?? "Login failed");
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
          <View style={{ alignItems: "center", marginBottom: 48 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: colors.text,
                fontFamily: Fonts.rounded,
                letterSpacing: -0.5,
              }}
            >
              Welcome back
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.subtleText,
                marginTop: 6,
                fontFamily: Fonts.sans,
              }}
            >
              Sign in to continue
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
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.subtleText,
              marginBottom: 6,
              fontFamily: Fonts.sans,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Username
          </Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username or Student ID"
            placeholderTextColor={colors.subtleText}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!loading}
            style={{
              height: 52,
              borderWidth: 1,
              borderColor: colors.divider,
              borderRadius: 12,
              paddingHorizontal: 16,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.card,
              fontFamily: Fonts.sans,
              marginBottom: 18,
            }}
          />

          {/* Password */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.subtleText,
              marginBottom: 6,
              fontFamily: Fonts.sans,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Password
          </Text>
          <TextInput
            ref={passwordRef}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.subtleText}
            secureTextEntry
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            editable={!loading}
            style={{
              height: 52,
              borderWidth: 1,
              borderColor: colors.divider,
              borderRadius: 12,
              paddingHorizontal: 16,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.card,
              fontFamily: Fonts.sans,
              marginBottom: 28,
            }}
          />

          {/* Sign In button */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => ({
              height: 52,
              borderRadius: 12,
              backgroundColor: pressed ? LeedsRed.dark : LeedsRed.base,
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
                Sign In
              </Text>
            )}
          </Pressable>

          {/* Register link */}
          <View style={{ alignItems: "center", marginTop: 24 }}>
            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text
                style={{
                  fontSize: 15,
                  color: colors.subtleText,
                  fontFamily: Fonts.sans,
                }}
              >
                Don&apos;t have an account? <Text style={{ color: colors.text, fontWeight: "600" }}>Sign Up</Text>
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
