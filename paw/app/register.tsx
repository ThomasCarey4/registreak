import React, { useState } from "react";
import { Alert, Button, Switch, TextInput, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth-context";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isStaff, setIsStaff] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function submit() {
    (async () => {
      try {
        setIsLoading(true);
        if (!email || !password) {
          Alert.alert("Validation", "Email and password are required");
          return;
        }
        await register(email, password, email, isStaff);
        Alert.alert("Registered", "Account created successfully");
        router.push("/");
      } catch (err) {
        Alert.alert("Register failed", String(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }

  return (
    <View className="flex-1 gap-3 bg-background p-4">
      <Text className="text-foreground text-3xl font-bold">Register</Text>

      <Text className="text-foreground text-lg font-semibold">Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        className="rounded-md border border-divider p-2 text-foreground"
        placeholder="Full name"
        editable={!isLoading}
      />

      <Text className="text-foreground text-lg font-semibold">Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        className="rounded-md border border-divider p-2 text-foreground"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
        editable={!isLoading}
      />

      <Text className="text-foreground text-lg font-semibold">Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        className="rounded-md border border-divider p-2 text-foreground"
        secureTextEntry
        placeholder="••••••••"
        editable={!isLoading}
      />

      <View className="my-2 flex-row items-center justify-between border-y border-divider py-3">
        <View className="mr-4 flex-1">
          <Text className="text-foreground text-lg font-semibold">Create as Instructor</Text>
          <Text className="text-foreground/60 mt-1 text-xs">Instructors can view and manage attendance codes</Text>
        </View>
        <Switch value={isStaff} onValueChange={setIsStaff} disabled={isLoading} />
      </View>

      <Button title={isLoading ? "Creating account..." : "Create account"} onPress={submit} disabled={isLoading} />
    </View>
  );
}
