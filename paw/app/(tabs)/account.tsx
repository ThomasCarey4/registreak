import { themeColors } from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { useColorScheme } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const { colorScheme } = useColorScheme();
  const colors = themeColors[colorScheme ?? "light"];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 pt-8">
        <Text className="text-[28px] font-bold text-foreground mb-8">Account</Text>

        <View className="bg-account-card rounded-xl p-4 mb-8">
          <Text className="text-[13px] text-account-label mb-1">Username</Text>
          <Text className="text-[20px] font-semibold text-foreground">{user?.username ?? "—"}</Text>
        </View>

        <Pressable
          onPress={logout}
          style={({ pressed }) => ({
            backgroundColor: colors.tint,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: "center",
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text className="text-white text-[17px] font-semibold">Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
