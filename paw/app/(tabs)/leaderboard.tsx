import { BottomFade, useBottomFade } from "@/components/bottom-fade";
import { LeedsRed } from "@/constants/theme";
import { themeColors } from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { useColorScheme } from "nativewind";
import { apiService } from "@/services/api";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Student {
  id: string;
  name: string;
  attended: number;
  streak: number;
}

interface LeaderboardData {
  courseCode: string;
  courseName: string;
  totalLectures: number;
  currentUserId: string;
  showTop: number;
  students: Student[];
}

interface DisplayItem {
  type: "student";
  rank?: number;
  student?: Student;
  isCurrentUser?: boolean;
}

function buildLeaderboardDisplay(data: LeaderboardData): DisplayItem[] {
  const { students, currentUserId, showTop } = data;
  const sorted = [...students].sort((a, b) => b.streak - a.streak);
  const currentUserIndex = sorted.findIndex((s) => s.id === currentUserId);
  const items: DisplayItem[] = [];

  const topCount = Math.min(showTop, sorted.length);
  for (let i = 0; i < topCount; i++) {
    items.push({
      type: "student",
      rank: i + 1,
      student: sorted[i],
      isCurrentUser: sorted[i].id === currentUserId,
    });
  }

  // If user is already in the top list, we're done
  if (currentUserIndex < showTop) return items;

  // Otherwise add just the current user at their actual rank
  if (currentUserIndex >= 0) {
    items.push({
      type: "student",
      rank: currentUserIndex + 1,
      student: sorted[currentUserIndex],
      isCurrentUser: true,
    });
  }

  return items;
}

const MEDALS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

function StreakBadge({ streak, isDark }: { streak: number; isDark: boolean }) {
  if (streak <= 0) return null;

  const isHot = streak >= 7;
  const isOnFire = streak >= 14;

  const bgColor = isDark
    ? isOnFire
      ? "rgba(145,0,0,0.35)"
      : isHot
        ? "rgba(199,0,0,0.25)"
        : "rgba(255,78,54,0.15)"
    : isOnFire
      ? LeedsRed.faded
      : isHot
        ? "rgba(199,0,0,0.1)"
        : "rgba(255,78,54,0.08)";

  const textColor = isDark
    ? isOnFire
      ? LeedsRed.pastel
      : isHot
        ? LeedsRed.bright
        : "rgba(255,138,122,0.9)"
    : isOnFire
      ? LeedsRed.dark
      : isHot
        ? LeedsRed.base
        : LeedsRed.bright;

  const borderColor = isDark
    ? isOnFire
      ? "rgba(255,138,122,0.3)"
      : isHot
        ? "rgba(255,78,54,0.25)"
        : "rgba(255,78,54,0.18)"
    : isOnFire
      ? "rgba(145,0,0,0.2)"
      : isHot
        ? "rgba(199,0,0,0.15)"
        : "rgba(255,78,54,0.15)";

  return (
    <View
      className="flex-row items-center gap-0.5 px-2 py-1 rounded-full"
      style={{ backgroundColor: bgColor, borderWidth: 1, borderColor }}
    >
      <Text className="text-xs">🔥</Text>
      <Text className="font-bold text-xs" style={{ color: textColor }}>
        {streak}
      </Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = themeColors[colorScheme ?? "light"];
  const { user } = useAuth();

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [courses, setCourses] = useState<{ code: string; name: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch courses on mount, then leaderboard for first/selected course
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          const coursesRes = await apiService.getCourses();
          if (cancelled) return;
          const courseList = coursesRes.courses;
          setCourses(courseList);

          const courseCode = selectedCourse ?? courseList[0]?.code;
          if (!courseCode) {
            setLoading(false);
            return;
          }
          if (!selectedCourse) setSelectedCourse(courseCode);

          const lb = await apiService.getLeaderboard(courseCode);
          if (cancelled) return;
          setLeaderboardData(lb);
        } catch (e) {
          console.error("Failed to fetch leaderboard:", e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [selectedCourse]),
  );

  const showTop = leaderboardData?.showTop ?? 10;
  const displayItems = useMemo(
    () => (leaderboardData ? buildLeaderboardDisplay(leaderboardData) : []),
    [leaderboardData],
  );

  // Split: top 10 list vs current user if outside top 10
  const topItems = useMemo(
    () => displayItems.filter((i) => !i.isCurrentUser || (i.rank ?? 0) <= showTop),
    [displayItems, showTop],
  );
  const currentUserItem = useMemo(
    () => displayItems.find((i) => i.isCurrentUser && (i.rank ?? 0) > showTop),
    [displayItems, showTop],
  );

  const { opacity: fadeOpacity, onScroll: onFadeScroll } = useBottomFade();

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          onScroll={onFadeScroll}
          scrollEventThrottle={16}
        >
          {/* Header */}
          <View className="px-5 pt-5 pb-2">
            <Text className="text-[32px] font-bold mb-1 text-foreground">Leaderboard</Text>
            {leaderboardData ? (
              <Text className="text-[15px] text-subtle">{leaderboardData.courseName}</Text>
            ) : (
              !loading && <Text className="text-[15px] text-subtle">No course data available</Text>
            )}
          </View>

          {/* Top 10 List */}
          {!loading && (
            <View className="px-4 pt-3 gap-2">
              {topItems.map((item) => {
                const { rank, student, isCurrentUser } = item;
                if (!student || !rank) return null;

                const medal = MEDALS[rank];

                return (
                  <View
                    key={student.id}
                    className="flex-row items-center rounded-2xl p-3.5 bg-card"
                    style={{
                      borderWidth: isCurrentUser ? 1.5 : 0,
                      borderColor: isCurrentUser ? colors.tint : "transparent",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: isDark ? 0.2 : 0.04,
                      shadowRadius: 6,
                      elevation: 2,
                    }}
                  >
                    {/* Rank / Medal */}
                    <View className="w-9 items-center mr-3">
                      {medal ? (
                        <Text className="text-xl">{medal}</Text>
                      ) : (
                        <Text className="text-[15px] font-bold text-rank">{rank}</Text>
                      )}
                    </View>

                    {/* Name + YOU badge */}
                    <View className="flex-1 flex-row items-center gap-2 mr-2">
                      <Text
                        className={`text-[15px] text-foreground ${isCurrentUser ? "font-bold" : "font-medium"}`}
                        numberOfLines={1}
                      >
                        {student.name}
                      </Text>
                      {isCurrentUser && (
                        <View className="px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.tint }}>
                          <Text
                            className="text-[9px] font-extrabold tracking-wide"
                            style={{ color: isDark ? colors.background : "#ffffff" }}
                          >
                            YOU
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Streak */}
                    <StreakBadge streak={student.streak} isDark={isDark} />
                  </View>
                );
              })}
            </View>
          )}

          {/* Current user position (when outside top 10) */}
          {!loading && currentUserItem && currentUserItem.student && (
            <View className="px-4 pt-4 pb-10">
              {/* Divider with "Your Position" label */}
              <View className="flex-row items-center gap-3 mb-3 px-1">
                <View className="flex-1 h-[1px] bg-divider" />
                <Text className="text-[11px] font-semibold tracking-wider uppercase text-subtle">Your Position</Text>
                <View className="flex-1 h-[1px] bg-divider" />
              </View>

              <View
                className="flex-row items-center rounded-2xl p-4 bg-background"
                style={{
                  borderWidth: 1.5,
                  borderColor: colors.tint,
                  shadowColor: colors.tint,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                {/* Rank */}
                <View className="w-9 items-center mr-3">
                  <Text className="text-[17px] font-bold text-tint">{currentUserItem.rank}</Text>
                </View>

                {/* Name + YOU badge */}
                <View className="flex-1 flex-row items-center gap-2 mr-2">
                  <Text className="text-[15px] font-bold text-foreground" numberOfLines={1}>
                    {currentUserItem.student.name}
                  </Text>
                  <View className="px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.tint }}>
                    <Text
                      className="text-[9px] font-extrabold tracking-wide"
                      style={{ color: isDark ? colors.background : "#ffffff" }}
                    >
                      YOU
                    </Text>
                  </View>
                </View>

                {/* Streak */}
                <StreakBadge streak={currentUserItem.student.streak} isDark={isDark} />
              </View>
            </View>
          )}

          {/* Bottom padding when user is in top 10 */}
          {!loading && !currentUserItem && <View className="h-10" />}
        </ScrollView>
        <BottomFade opacity={fadeOpacity} />
      </SafeAreaView>
    </View>
  );
}
