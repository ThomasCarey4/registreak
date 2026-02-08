import { Link } from "expo-router";
import { View, Text } from "react-native";

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-5">
      <Text className="text-foreground text-3xl font-bold">This is a modal</Text>
      <Link href="/" dismissTo style={{ marginTop: 15, paddingVertical: 15 }}>
        <Text className="text-tint text-base">Go to home screen</Text>
      </Link>
    </View>
  );
}
