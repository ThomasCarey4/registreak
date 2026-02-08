import { BottomFade, useBottomFade } from "@/components/bottom-fade";
import { useAuth } from "@/context/auth-context";
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

function StreakBadge({ streak }: { streak: number }) {
  if (streak <= 0) return null;

  const isHot = streak >= 7;
  const isOnFire = streak >= 14;

  const tierClass = isOnFire
    ? "bg-leeds-red-faded dark:bg-[rgba(145,0,0,0.35)] border-[rgba(145,0,0,0.2)] dark:border-[rgba(255,138,122,0.3)]"
    : isHot
      ? "bg-[rgba(199,0,0,0.1)] dark:bg-[rgba(199,0,0,0.25)] border-[rgba(199,0,0,0.15)] dark:border-[rgba(255,78,54,0.25)]"
      : "bg-[rgba(255,78,54,0.08)] dark:bg-[rgba(255,78,54,0.15)] border-[rgba(255,78,54,0.15)] dark:border-[rgba(255,78,54,0.18)]";

  const textClass = isOnFire
    ? "text-leeds-red-dark dark:text-leeds-red-pastel"
    : isHot
      ? "text-leeds-red dark:text-leeds-red-bright"
      : "text-leeds-red-bright dark:text-[rgba(255,138,122,0.9)]";

  return (
    <View className={`flex-row items-center gap-0.5 px-2 py-1 rounded-full border ${tierClass}`}>
      <Text className="text-xs">🔥</Text>
      <Text className={`font-bold text-xs ${textClass}`}>{streak}</Text>
    </View>
  );
}

export default function LeaderboardScreen() {
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
                    className={`flex-row items-center rounded-2xl p-3.5 bg-card shadow-md shadow-black/[0.04] dark:shadow-black/20 ${isCurrentUser ? "border-[1.5px] border-tint" : ""}`}
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
                        <View className="px-1.5 py-0.5 rounded bg-tint">
                          <Text className="text-[9px] font-extrabold tracking-wide text-background">YOU</Text>
                        </View>
                      )}
                    </View>

                    {/* Streak */}
                    <StreakBadge streak={student.streak} />
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

              <View className="flex-row items-center rounded-2xl p-4 bg-background border-[1.5px] border-tint shadow-lg shadow-tint/15">
                {/* Rank */}
                <View className="w-9 items-center mr-3">
                  <Text className="text-[17px] font-bold text-tint">{currentUserItem.rank}</Text>
                </View>

                {/* Name + YOU badge */}
                <View className="flex-1 flex-row items-center gap-2 mr-2">
                  <Text className="text-[15px] font-bold text-foreground" numberOfLines={1}>
                    {currentUserItem.student.name}
                  </Text>
                  <View className="px-1.5 py-0.5 rounded bg-tint">
                    <Text className="text-[9px] font-extrabold tracking-wide text-background">YOU</Text>
                  </View>
                </View>

                {/* Streak */}
                <StreakBadge streak={currentUserItem.student.streak} />
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
