import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import rawData from "@/data/leaderboard-data.json";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
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
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <ThemedText type="title" style={styles.pageTitle}>
                        Leaderboard
                    </ThemedText>
                    <ThemedText style={[styles.courseSubtitle, { color: isDark ? "#8E8E93" : "#8E8E93" }]}>
                        {courseName} · {totalLectures} lectures
                    </ThemedText>

                    {/* Leaderboard List */}
                    <View style={styles.listContainer}>
                        {displayItems.map((item, index) => {
                            if (item.type === "separator") {
                                return (
                                    <View key={`sep-${index}`} style={styles.separatorRow}>
                                        <Text style={[styles.separatorDots, { color: isDark ? "#555" : "#C7C7CC" }]}>
                                            · · ·
                                        </Text>
                                    </View>
                                );
                            }

                            const { rank, student, isCurrentUser } = item;
                            if (!student || !rank) return null;

                            const percentage = Math.round((student.attended / totalLectures) * 100);
                            const medal = MEDALS[rank];
                            const barWidth = `${percentage}%` as const;

                            return (
                                <View
                                    key={student.id}
                                    style={[
                                        styles.studentRow,
                                        {
                                            backgroundColor: isCurrentUser
                                                ? isDark
                                                    ? "#1a2a3a"
                                                    : "#EBF5FF"
                                                : isDark
                                                  ? "#1C1C1E"
                                                  : "#fff",
                                            borderColor: isCurrentUser ? colors.tint : "transparent",
                                            borderWidth: isCurrentUser ? 1.5 : 0,
                                            shadowColor: isDark ? "transparent" : "#000",
                                        },
                                    ]}
                                >
                                    {/* Rank */}
                                    <View style={styles.rankContainer}>
                                        {medal ? (
                                            <Text style={styles.medal}>{medal}</Text>
                                        ) : (
                                            <Text style={[styles.rankText, { color: isDark ? "#8E8E93" : "#8E8E93" }]}>
                                                {rank}
                                            </Text>
                                        )}
                                    </View>

                                    {/* Student Info */}
                                    <View style={styles.studentInfo}>
                                        <View style={styles.nameRow}>
                                            <ThemedText
                                                style={[styles.studentName, isCurrentUser && { fontWeight: "700" }]}
                                            >
                                                {student.name}
                                            </ThemedText>
                                            {isCurrentUser && (
                                                <View style={[styles.youBadge, { backgroundColor: colors.tint }]}>
                                                    <Text style={styles.youBadgeText}>YOU</Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Progress Bar */}
                                        <View
                                            style={[
                                                styles.progressBarBg,
                                                {
                                                    backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
                                                },
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.progressBarFill,
                                                    {
                                                        width: barWidth,
                                                        backgroundColor:
                                                            percentage >= 90
                                                                ? "#4CAF50"
                                                                : percentage >= 70
                                                                  ? "#FF9800"
                                                                  : "#F44336",
                                                    },
                                                ]}
                                            />
                                        </View>
                                    </View>

                                    {/* Percentage */}
                                    <View style={styles.percentContainer}>
                                        <ThemedText style={styles.percentText}>{percentage}%</ThemedText>
                                        <Text style={[styles.attendedCount, { color: isDark ? "#666" : "#AEAEB2" }]}>
                                            {student.attended}/{totalLectures}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    pageTitle: {
        marginBottom: 4,
    },
    courseSubtitle: {
        fontSize: 15,
        marginBottom: 24,
    },

    // List
    listContainer: {
        gap: 8,
    },
    studentRow: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 14,
        padding: 14,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    rankContainer: {
        width: 36,
        alignItems: "center",
        marginRight: 12,
    },
    medal: {
        fontSize: 24,
    },
    rankText: {
        fontSize: 16,
        fontWeight: "700",
    },
    studentInfo: {
        flex: 1,
        marginRight: 12,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        gap: 8,
    },
    studentName: {
        fontSize: 15,
        fontWeight: "500",
    },
    youBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    youBadgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 3,
    },
    percentContainer: {
        alignItems: "flex-end",
        width: 48,
    },
    percentText: {
        fontSize: 16,
        fontWeight: "700",
    },
    attendedCount: {
        fontSize: 11,
        marginTop: 2,
    },
    separatorRow: {
        alignItems: "center",
        paddingVertical: 8,
    },
    separatorDots: {
        fontSize: 20,
        letterSpacing: 4,
        fontWeight: "700",
    },
});
