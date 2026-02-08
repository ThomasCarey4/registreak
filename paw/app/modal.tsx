import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center p-5 bg-background">
      <Text className="text-3xl font-bold text-foreground">This is a modal</Text>
      <Link href="/" dismissTo className="mt-4 py-4">
        <Text className="text-base leading-8 text-link">Go to home screen</Text>
      </Link>
    </View>
  );
}
