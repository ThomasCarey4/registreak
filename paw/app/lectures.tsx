import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, View, RefreshControl, ActivityIndicator, Pressable, Text } from "react-native";
import { useAuth } from "@/context/auth-context";
import { apiService } from "@/services/api";
import { themeColors } from "@/constants/colors";
import { useColorScheme } from "nativewind";
import { Redirect } from "expo-router";

interface Lecture {
  lecture_id: number;
  module_id: number;
  module_name: string;
  start_time: string;
  end_time: string;
  code: string;
}

interface CodeResponse {
  success: boolean;
  lectures?: Lecture[];
  message?: string;
  error?: string;
}

export default function LecturesScreen() {
  const { user, logout } = useAuth();
  const { colorScheme } = useColorScheme();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sessionEnded, setSessionEnded] = useState(false);

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
    }
  }, []);

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    if (!user?.is_staff || sessionEnded) return;

    fetchLectures();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLectures();
    }, 30000);

    return () => clearInterval(interval);
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
    } catch (err) {
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

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="mb-6 items-center">
          <Text className="text-foreground text-3xl font-bold">Active Lectures</Text>
          <Text className="text-foreground/70 mt-2 text-sm">Share these codes with your students</Text>
        </View>

        {error && (
          <View className="mb-4 rounded-lg border border-error/30 bg-error/5 p-3">
            <Text className="text-error text-sm">{error}</Text>
          </View>
        )}

        {loading && (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color={colors.tint} />
            <Text className="text-foreground mt-3 text-sm">Loading lectures...</Text>
          </View>
        )}

        {!loading && lectures.length === 0 && !error && (
          <View className="flex-1 items-center justify-center py-10">
            <Text className="text-foreground mb-2 text-lg font-semibold">No active lectures</Text>
            <Text className="text-foreground/60 text-sm">You don't have any lectures scheduled right now</Text>
          </View>
        )}

        {lectures.map((lecture) => (
          <View key={lecture.lecture_id} className="mb-5 overflow-hidden rounded-xl border border-divider">
            <View className="bg-foreground/5 p-4">
              <View className="gap-1">
                <Text className="text-foreground text-lg font-semibold">{lecture.module_name}</Text>
                <Text className="text-foreground/60 text-xs">
                  {formatTime(lecture.start_time)} – {formatTime(lecture.end_time)}
                </Text>
              </View>
            </View>

            <View className="items-center p-6">
              <Text className="text-foreground/60 mb-4 text-xs uppercase tracking-wider">Verification Code</Text>
              <View className="mb-4 flex-row justify-center gap-3">
                {lecture.code.split("").map((digit, idx) => (
                  <View
                    key={idx}
                    className="h-[72px] w-[56px] items-center justify-center rounded-lg border-2 border-success bg-success/10"
                  >
                    <Text
                      className="text-foreground text-[32px] font-bold"
                      style={{ fontFamily: "Courier New", letterSpacing: 2 }}
                    >
                      {digit}
                    </Text>
                  </View>
                ))}
              </View>
              <View className="flex-row items-center gap-2">
                <View className="h-1.5 w-1.5 rounded-full bg-success" />
                <Text className="text-foreground/60 text-xs">Auto-refreshing every 30 seconds</Text>
              </View>
            </View>
          </View>
        ))}

        {lectures.length > 0 && (
          <Pressable className="mb-5 mt-2 items-center rounded-lg bg-error px-6 py-3.5" onPress={handleEndSession}>
            <Text className="text-base font-semibold text-white">End Session</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
