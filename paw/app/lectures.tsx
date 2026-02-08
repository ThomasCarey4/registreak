import React, { useEffect, useState, useCallback, useRef } from "react";
import { ScrollView, View, RefreshControl, ActivityIndicator, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth-context";
import { apiService } from "@/services/api";
import { themeColors } from "@/constants/colors";
import { useColorScheme } from "nativewind";
import { Redirect } from "expo-router";
import QRCode from "react-native-qrcode-svg";

const REFRESH_INTERVAL = 30;

interface Lecture {
  lecture_id: number;
  module_id: number;
  module_code: string;
  module_name: string;
  start_time: string;
  end_time: string;
  code: string;
}

export default function LecturesScreen() {
  const { user, logout } = useAuth();
  const { colorScheme } = useColorScheme();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sessionEnded, setSessionEnded] = useState(false);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetCountdown = useCallback(() => {
    setCountdown(REFRESH_INTERVAL);
  }, []);

  const fetchLectures = useCallback(async () => {
    try {
      setError("");
      const response = await apiService.getVerificationCode();

      if (response && response.lectures) {
        setLectures(response.lectures);
      } else {
        setLectures([]);
        setError(response?.message || response?.error || "No active lectures found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch lectures");
      setLectures([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      resetCountdown();
    }
  }, [resetCountdown]);

  // Countdown timer — ticks every second
  useEffect(() => {
    if (!user?.is_staff || sessionEnded) return;

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchLectures();
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [user?.is_staff, sessionEnded, fetchLectures]);

  // Initial fetch
  useEffect(() => {
    if (!user?.is_staff || sessionEnded) return;
    fetchLectures();
  }, [user?.is_staff, sessionEnded, fetchLectures]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLectures();
  }, [fetchLectures]);

  const handleEndSession = async () => {
    try {
      await logout();
      setSessionEnded(true);
      setLectures([]);
    } catch {
      setError("Failed to end session");
    }
  };

  const formatTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  if (!user?.is_staff) {
    return <Redirect href="/" />;
  }

  const colors = themeColors[colorScheme ?? "light"];
  const progressRatio = countdown / REFRESH_INTERVAL;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {error && (
          <View className="mb-4 rounded-xl bg-error/10 p-3">
            <Text className="text-error text-sm">{error}</Text>
          </View>
        )}

        {loading && (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color={colors.tint} />
            <Text className="text-foreground/60 mt-3 text-sm">Loading lectures…</Text>
          </View>
        )}

        {!loading && lectures.length === 0 && !error && (
          <View className="flex-1 items-center justify-center py-10">
            <Text className="text-foreground mb-2 text-lg font-semibold">No active lectures</Text>
            <Text className="text-foreground/60 text-sm">You don't have any lectures scheduled right now</Text>
          </View>
        )}

        {lectures.map((lecture) => (
          <View key={lecture.lecture_id} className="mb-6 overflow-hidden rounded-2xl border border-divider">
            <View className="bg-foreground/5 px-5 py-4">
              <Text className="text-foreground text-[20px] font-bold">
                {lecture.module_code} - {lecture.module_name}
              </Text>
              <Text className="text-foreground/50 mt-1 text-[13px]">
                {formatTime(lecture.start_time)} – {formatTime(lecture.end_time)}
              </Text>
            </View>

            <View className="mt-6 items-center">
              <View className="rounded-2xl bg-white p-4">
                <QRCode value={`paw://attend?code=${lecture.code}`} size={180} />
              </View>
            </View>
            <View className="items-center px-5 pb-6 pt-8">
              <View className="mb-6 flex-row justify-center gap-3">
                {lecture.code.split("").map((digit, idx) => (
                  <View
                    key={idx}
                    className="h-[88px] w-[68px] items-center justify-center rounded-2xl bg-foreground/[0.06]"
                  >
                    <Text className="text-foreground text-[42px] font-bold">{digit}</Text>
                  </View>
                ))}
              </View>

              {/* Countdown bar */}
              <View className="w-full max-w-[300px] mb-1">
                <View className="h-[3px] w-full rounded-full bg-foreground/10 overflow-hidden">
                  <View className="h-full rounded-full bg-foreground/30" style={{ width: `${progressRatio * 100}%` }} />
                </View>
                <Text className="text-foreground/40 mt-2 text-center text-[11px]">New code in {countdown}s</Text>
              </View>
            </View>
          </View>
        ))}

        {lectures.length > 0 && (
          <Pressable
            className="mt-2 items-center rounded-xl py-4 active:opacity-80 bg-foreground"
            onPress={handleEndSession}
          >
            <Text className="text-background text-[17px] font-semibold">End Session</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
