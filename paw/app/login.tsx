import React, { useState } from "react";
import { Alert, Pressable, TextInput, View, Text } from "react-native";
import { useAuth } from "@/context/auth-context";
import { themeColors } from "@/constants/colors";
import { useColorScheme } from "nativewind";

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { colorScheme } = useColorScheme();
  const colors = themeColors[colorScheme ?? "light"];

  async function submit() {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }
    try {
      setIsLoading(true);
      await login(username, password);
    } catch (err) {
      Alert.alert("Login failed", String(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center bg-background p-6">
      <View className="w-full items-center gap-3">
        <Text className="mb-1 text-[56px]">🐱</Text>
        <Text className="text-foreground text-[28px] font-bold">Lucky Cat</Text>
        <Text className="text-subtle mb-4 text-[15px]">Sign in to mark attendance</Text>

        <TextInput
          value={username}
          onChangeText={setUsername}
          className="w-full rounded-xl border border-divider bg-card p-3.5 text-base text-foreground"
          autoCapitalize="none"
          placeholder="Username or Student ID"
          placeholderTextColor={colors.subtle}
          editable={!isLoading}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          className="w-full rounded-xl border border-divider bg-card p-3.5 text-base text-foreground"
          secureTextEntry
          placeholder="Password"
          placeholderTextColor={colors.subtle}
          editable={!isLoading}
          onSubmitEditing={submit}
        />

        <Pressable
          onPress={submit}
          disabled={isLoading}
          className="mt-2 w-full items-center rounded-xl p-4 bg-foreground"
        >
          <Text className="text-[17px] font-semibold text-background">{isLoading ? "Signing in..." : "Sign In"}</Text>
        </Pressable>
      </View>
    </View>
  );
}
