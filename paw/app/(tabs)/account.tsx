import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: isDark ? "#fff" : "#000",
            marginBottom: 32,
          }}
        >
          Account
        </Text>

        <View
          style={{
            backgroundColor: isDark ? "#1c1c1e" : "#f2f2f7",
            borderRadius: 12,
            padding: 16,
            marginBottom: 32,
          }}
        >
          <Text style={{ fontSize: 13, color: isDark ? "#8e8e93" : "#6e6e73", marginBottom: 4 }}>Username</Text>
          <Text style={{ fontSize: 20, fontWeight: "600", color: isDark ? "#fff" : "#000" }}>
            {user?.username ?? "—"}
          </Text>
        </View>

        <Pressable
          onPress={logout}
          style={({ pressed }) => ({
            backgroundColor: Colors[colorScheme].tint,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: "center",
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "600" }}>Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
