import "@/global.css";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import * as Linking from "expo-linking";

import { useColorScheme } from "nativewind";
import { AuthProvider, useAuth } from "@/context/auth-context";
import LoginScreen from "@/app/login";
import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";

export const unstable_settings = {
  anchor: "(tabs)",
};

function AppContent() {
  const { colorScheme } = useColorScheme();
  const { token, isLoading } = useAuth();
  const router = useRouter();

  // Handle deep links for QR code scanning
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const parsed = Linking.parse(event.url);

      // Check if it's the attend deep link with a code parameter
      if (parsed.hostname === 'attend' && parsed.queryParams?.code) {
        const code = parsed.queryParams.code as string;

        // Validate code is exactly 4 digits
        if (/^\d{4}$/.test(code)) {
          // Navigate to attendance screen with code parameter
          router.push({
            pathname: '/(tabs)',
            params: { code }
          });
        }
      }
    };

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [router]);

  if (colorScheme === undefined) {
    return null;
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!token) {
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <LoginScreen />
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
