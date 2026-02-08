import { Tabs } from "expo-router";
import React from "react";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { themeColors } from "@/constants/colors";
import { useColorScheme } from "nativewind";
import { useAuth } from "@/context/auth-context";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const { user } = useAuth();

  // Otherwise render the regular tab layout for students
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors[colorScheme ?? "light"].tint,
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
        name="attend"
        options={{
          title: "Attend",
          href: user?.is_staff ? null : "/attend",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="number.square.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="lectures"
        options={{
          title: "Lectures",
          href: !user?.is_staff ? null : "/lectures",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="graduationcap.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="streaks"
        options={{
          title: "Streaks",
          href: user?.is_staff ? null : "/streaks",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="flame.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          href: user?.is_staff ? null : "/leaderboard",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="trophy.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
