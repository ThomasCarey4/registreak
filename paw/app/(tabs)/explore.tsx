import { Image } from "expo-image";
import { Platform, StyleSheet, Text, View } from "react-native";

import { ExternalLink } from "@/components/external-link";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { Collapsible } from "@/components/ui/collapsible";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fonts, palette } from "@/constants/colors";

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: palette.light.surface, dark: palette.dark.card }}
      headerImage={
        <IconSymbol
          size={310}
          color={palette.light.foregroundMuted}
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <View className="flex-row gap-2">
        <Text className="text-3xl font-bold text-foreground" style={{ fontFamily: fonts.rounded }}>
          Explore
        </Text>
      </View>
      <Text className="text-base leading-6 text-foreground">
        This app includes example code to help you get started.
      </Text>
      <Collapsible title="File-based routing">
        <Text className="text-base leading-6 text-foreground">
          This app has two screens:{" "}
          <Text className="text-base leading-6 font-semibold text-foreground">app/(tabs)/index.tsx</Text> and{" "}
          <Text className="text-base leading-6 font-semibold text-foreground">app/(tabs)/explore.tsx</Text>
        </Text>
        <Text className="text-base leading-6 text-foreground">
          The layout file in{" "}
          <Text className="text-base leading-6 font-semibold text-foreground">app/(tabs)/_layout.tsx</Text> sets up the
          tab navigator.
        </Text>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <Text className="text-base leading-8 text-link">Learn more</Text>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <Text className="text-base leading-6 text-foreground">
          You can open this project on Android, iOS, and the web. To open the web version, press{" "}
          <Text className="text-base leading-6 font-semibold text-foreground">w</Text> in the terminal running this
          project.
        </Text>
      </Collapsible>
      <Collapsible title="Images">
        <Text className="text-base leading-6 text-foreground">
          For static images, you can use the{" "}
          <Text className="text-base leading-6 font-semibold text-foreground">@2x</Text> and{" "}
          <Text className="text-base leading-6 font-semibold text-foreground">@3x</Text> suffixes to provide files for
          different screen densities
        </Text>
        <Image
          source={require("@/assets/images/react-logo.png")}
          style={{ width: 100, height: 100, alignSelf: "center" }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <Text className="text-base leading-8 text-link">Learn more</Text>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <Text className="text-base leading-6 text-foreground">
          This template has light and dark mode support. The{" "}
          <Text className="text-base leading-6 font-semibold text-foreground">useColorScheme()</Text> hook lets you
          inspect what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </Text>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <Text className="text-base leading-8 text-link">Learn more</Text>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <Text className="text-base leading-6 text-foreground">
          This template includes an example of an animated component. The{" "}
          <Text className="text-base leading-6 font-semibold text-foreground">components/HelloWave.tsx</Text> component
          uses the powerful{" "}
          <Text className="text-base leading-6 font-semibold text-foreground" style={{ fontFamily: fonts.mono }}>
            react-native-reanimated
          </Text>{" "}
          library to create a waving hand animation.
        </Text>
        {Platform.select({
          ios: (
            <Text className="text-base leading-6 text-foreground">
              The{" "}
              <Text className="text-base leading-6 font-semibold text-foreground">
                components/ParallaxScrollView.tsx
              </Text>{" "}
              component provides a parallax effect for the header image.
            </Text>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
});
