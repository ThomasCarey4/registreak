import { Colors } from "@/constants/theme";
import rawData from "@/data/leaderboard-data.json";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Student {
  id: string;
  name: string;
  attended: number;
}

interface DisplayItem {
  type: "student" | "separator";
  rank?: number;
  student?: Student;
  isCurrentUser?: boolean;
}

const { students, totalLectures, currentUserId, showTop, courseName } = rawData;

function buildLeaderboardDisplay(): DisplayItem[] {
  const sorted = [...students].sort((a, b) => b.attended - a.attended);
  const currentUserIndex = sorted.findIndex((s) => s.id === currentUserId);
  const items: DisplayItem[] = [];

  // Top entries
  const topCount = Math.min(showTop, sorted.length);
  for (let i = 0; i < topCount; i++) {
    items.push({
      type: "student",
      rank: i + 1,
      student: sorted[i],
      isCurrentUser: sorted[i].id === currentUserId,
    });
  }

  // If user is in top, done
  if (currentUserIndex < showTop) {
    return items;
  }

  // Separator
  items.push({ type: "separator" });

  // Context around user: 2 above, user, 2 below
  const contextStart = Math.max(showTop, currentUserIndex - 2);
  const contextEnd = Math.min(sorted.length - 1, currentUserIndex + 2);

  for (let i = contextStart; i <= contextEnd; i++) {
    items.push({
      type: "student",
      rank: i + 1,
      student: sorted[i],
      isCurrentUser: sorted[i].id === currentUserId,
    });
  }

  // Trailing separator if more entries exist
  if (contextEnd < sorted.length - 1) {
    items.push({ type: "separator" });
  }

  return items;
}

const MEDALS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export default function LeaderboardScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme];

  const displayItems = useMemo(() => buildLeaderboardDisplay(), []);

  return (
    <View className={`flex-1 ${isDark ? "bg-[#151718]" : "bg-white"}`}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView className="flex-1" contentContainerClassName="p-5 pb-10" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text className={`text-[32px] font-bold mb-1 ${isDark ? "text-[#ECEDEE]" : "text-[#11181C]"}`}>
            Leaderboard
          </Text>
          <Text className="text-[15px] text-[#8E8E93] mb-6">
            {courseName} · {totalLectures} lectures
          </Text>

          {/* Leaderboard List */}
          <View className="gap-2">
            {displayItems.map((item, index) => {
              if (item.type === "separator") {
                return (
                  <View key={`sep-${index}`} className="items-center py-2">
                    <Text className={`text-xl tracking-widest font-bold ${isDark ? "text-[#555]" : "text-[#C7C7CC]"}`}>
                      · · ·
                    </Text>
                  </View>
                );
              }

              const { rank, student, isCurrentUser } = item;
              if (!student || !rank) return null;

              const percentage = Math.round((student.attended / totalLectures) * 100);
              const medal = MEDALS[rank];

              return (
                <View
                  key={student.id}
                  className={`flex-row items-center rounded-[14px] p-3.5 shadow-sm ${
                    isCurrentUser
                      ? isDark
                        ? "bg-[#1a2a3a]"
                        : "bg-[#EBF5FF]"
                      : isDark
                        ? "bg-[#1C1C1E]"
                        : "bg-white shadow-black/5"
                  }`}
                  style={isCurrentUser ? { borderWidth: 1.5, borderColor: colors.tint } : undefined}
                >
                  {/* Rank */}
                  <View className="w-9 items-center mr-3">
                    {medal ? (
                      <Text className="text-2xl">{medal}</Text>
                    ) : (
                      <Text className="text-base font-bold text-[#8E8E93]">{rank}</Text>
                    )}
                  </View>

                  {/* Student Info */}
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-1.5 gap-2">
                      <Text
                        className={`text-[15px] ${isCurrentUser ? "font-bold" : "font-medium"} ${isDark ? "text-[#ECEDEE]" : "text-[#11181C]"}`}
                      >
                        {student.name}
                      </Text>
                      {isCurrentUser && (
                        <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: colors.tint }}>
                          <Text className="text-white text-[10px] font-extrabold tracking-wide">YOU</Text>
                        </View>
                      )}
                    </View>

                    {/* Progress Bar */}
                    <View className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-[#2C2C2E]" : "bg-[#F2F2F7]"}`}>
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: percentage >= 90 ? "#4CAF50" : percentage >= 70 ? "#FF9800" : "#F44336",
                        }}
                      />
                    </View>
                  </View>

                  {/* Percentage */}
                  <View className="items-end w-12">
                    <Text className={`text-base font-bold ${isDark ? "text-[#ECEDEE]" : "text-[#11181C]"}`}>
                      {percentage}%
                    </Text>
                    <Text className={`text-[11px] mt-0.5 ${isDark ? "text-[#666]" : "text-[#AEAEB2]"}`}>
                      {student.attended}/{totalLectures}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
