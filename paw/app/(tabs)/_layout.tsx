import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/context/auth-context";
import LecturesScreen from "./lectures";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  // If user is an instructor, render the Lectures screen full-screen (no bottom tabs)
  if (user?.is_staff) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LecturesScreen />
      </SafeAreaView>
    );
  }

  // Otherwise render the regular tab layout for students
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: 8,
          height: 90,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Attend",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="number.square.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="streaks"
        options={{
          title: "Streaks",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="flame.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="trophy.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
