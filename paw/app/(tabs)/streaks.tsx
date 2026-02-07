import { RadialProgress } from "@/components/radial-progress";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import rawData from "@/data/attendance-data.json";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Lecture {
    id: string;
    name: string;
    time: string;
    endTime: string;
    room: string;
    attended: boolean;
}

interface DayData {
    lectures: Lecture[];
}

const attendanceData = rawData.attendance as Record<string, DayData>;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function formatDateKey(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDisplayDate(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function calculateStreak(data: Record<string, DayData>): number {
    const dates = Object.keys(data).sort().reverse();
    let streak = 0;

    for (const date of dates) {
        const dayLectures = data[date].lectures;
        const hasAttended = dayLectures.some((l) => l.attended);

        if (hasAttended) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function getCalendarGrid(year: number, month: number): (number | null)[][] {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = new Array(firstDayOfWeek).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }

    return weeks;
}

export default function StreaksScreen() {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState(
        formatDateKey(today.getFullYear(), today.getMonth(), today.getDate()),
    );

    const colorScheme = useColorScheme() ?? "light";
    const isDark = colorScheme === "dark";
    const colors = Colors[colorScheme];

    const streak = useMemo(() => calculateStreak(attendanceData), []);
    const weeks = useMemo(() => getCalendarGrid(currentYear, currentMonth), [currentYear, currentMonth]);

    const selectedDayData = attendanceData[selectedDate]?.lectures || [];
    const todayStr = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

    const goToPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const getProgressColor = (attended: number, total: number): string => {
        if (total === 0) return "transparent";
        const ratio = attended / total;
        if (ratio >= 1) return "#4CAF50";
        if (ratio >= 0.5) return "#FF9800";
        return "#F44336";
    };

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
                        Attendance
                    </ThemedText>

                    {/* Calendar */}
                    <View
                        style={[
                            styles.calendarCard,
                            {
                                backgroundColor: isDark ? "#1C1C1E" : "#fff",
                                shadowColor: isDark ? "transparent" : "#000",
                            },
                        ]}
                    >
                        {/* Month Navigation */}
                        <View style={styles.monthNav}>
                            <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
                                <ThemedText style={styles.navArrow}>‹</ThemedText>
                            </TouchableOpacity>
                            <ThemedText style={styles.monthTitle}>
                                {MONTHS[currentMonth]} {currentYear}
                            </ThemedText>
                            <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                                <ThemedText style={styles.navArrow}>›</ThemedText>
                            </TouchableOpacity>
                        </View>

                        {/* Weekday Headers */}
                        <View style={styles.weekdayRow}>
                            {WEEKDAYS.map((day) => (
                                <View key={day} style={styles.weekdayCell}>
                                    <Text style={[styles.weekdayText, { color: isDark ? "#8E8E93" : "#8E8E93" }]}>
                                        {day}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Calendar Grid */}
                        {weeks.map((week, weekIndex) => (
                            <View key={weekIndex} style={styles.weekRow}>
                                {week.map((day, dayIndex) => {
                                    if (day === null) {
                                        return <View key={dayIndex} style={styles.dayCell} />;
                                    }

                                    const dateStr = formatDateKey(currentYear, currentMonth, day);
                                    const dayData = attendanceData[dateStr];
                                    const attended = dayData?.lectures.filter((l) => l.attended).length || 0;
                                    const total = dayData?.lectures.length || 0;
                                    const progress = total > 0 ? attended / total : 0;
                                    const isSelected = dateStr === selectedDate;
                                    const isToday = dateStr === todayStr;
                                    const isFuture = new Date(currentYear, currentMonth, day) > today;

                                    return (
                                        <TouchableOpacity
                                            key={dayIndex}
                                            style={styles.dayCell}
                                            onPress={() => setSelectedDate(dateStr)}
                                            activeOpacity={0.6}
                                        >
                                            <View style={styles.dayCellInner}>
                                                {total > 0 && (
                                                    <View style={styles.progressRing}>
                                                        <RadialProgress
                                                            size={38}
                                                            strokeWidth={3}
                                                            progress={progress}
                                                            progressColor={getProgressColor(attended, total)}
                                                            backgroundColor={isDark ? "#2C2C2E" : "#E5E5EA"}
                                                        />
                                                    </View>
                                                )}
                                                <View
                                                    style={[
                                                        styles.dayTextContainer,
                                                        isSelected && {
                                                            backgroundColor: colors.tint,
                                                            borderRadius: 19,
                                                        },
                                                        isToday &&
                                                            !isSelected && {
                                                                borderWidth: 1.5,
                                                                borderColor: colors.tint,
                                                                borderRadius: 19,
                                                            },
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.dayText,
                                                            {
                                                                color: isSelected
                                                                    ? "#fff"
                                                                    : isFuture
                                                                      ? isDark
                                                                          ? "#555"
                                                                          : "#C7C7CC"
                                                                      : isDark
                                                                        ? "#fff"
                                                                        : "#1C1C1E",
                                                            },
                                                        ]}
                                                    >
                                                        {day}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </View>

                    {/* Streak Counter */}
                    <View
                        style={[
                            styles.streakCard,
                            {
                                backgroundColor: isDark ? "#1C1C1E" : "#fff",
                                shadowColor: isDark ? "transparent" : "#000",
                            },
                        ]}
                    >
                        <Text style={styles.streakEmoji}>🔥</Text>
                        <View style={styles.streakInfo}>
                            <ThemedText style={styles.streakNumber}>{streak}</ThemedText>
                            <ThemedText style={styles.streakLabel}>day streak</ThemedText>
                        </View>
                    </View>

                    {/* Lectures for Selected Day */}
                    <View style={styles.lecturesSection}>
                        <ThemedText type="subtitle" style={styles.lecturesTitle}>
                            {formatDisplayDate(selectedDate)}
                        </ThemedText>

                        {selectedDayData.length > 0 ? (
                            selectedDayData.map((lecture, index) => (
                                <View
                                    key={`${lecture.id}-${index}`}
                                    style={[
                                        styles.lectureCard,
                                        {
                                            backgroundColor: isDark ? "#1C1C1E" : "#fff",
                                            shadowColor: isDark ? "transparent" : "#000",
                                            borderLeftColor: lecture.attended ? "#4CAF50" : "#F44336",
                                        },
                                    ]}
                                >
                                    <View style={styles.lectureTime}>
                                        <ThemedText style={styles.lectureTimeText}>{lecture.time}</ThemedText>
                                        <ThemedText
                                            style={[styles.lectureEndTime, { color: isDark ? "#8E8E93" : "#8E8E93" }]}
                                        >
                                            {lecture.endTime}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.lectureInfo}>
                                        <ThemedText style={styles.lectureName}>{lecture.name}</ThemedText>
                                        <ThemedText
                                            style={[styles.lectureRoom, { color: isDark ? "#8E8E93" : "#8E8E93" }]}
                                        >
                                            📍 {lecture.room}
                                        </ThemedText>
                                    </View>
                                    <View
                                        style={[
                                            styles.attendBadge,
                                            {
                                                backgroundColor: lecture.attended ? "#E8F5E9" : "#FFEBEE",
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.attendBadgeText,
                                                {
                                                    color: lecture.attended ? "#2E7D32" : "#C62828",
                                                },
                                            ]}
                                        >
                                            {lecture.attended ? "✓" : "✗"}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View
                                style={[
                                    styles.emptyCard,
                                    {
                                        backgroundColor: isDark ? "#1C1C1E" : "#fff",
                                    },
                                ]}
                            >
                                <ThemedText style={styles.emptyText}>No lectures scheduled</ThemedText>
                            </View>
                        )}
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
        marginBottom: 20,
    },

    // Calendar Card
    calendarCard: {
        borderRadius: 16,
        padding: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        marginBottom: 16,
    },
    monthNav: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    navButton: {
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
    },
    navArrow: {
        fontSize: 28,
        fontWeight: "300",
        lineHeight: 32,
    },
    monthTitle: {
        fontSize: 17,
        fontWeight: "600",
    },
    weekdayRow: {
        flexDirection: "row",
        marginBottom: 8,
    },
    weekdayCell: {
        flex: 1,
        alignItems: "center",
    },
    weekdayText: {
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    weekRow: {
        flexDirection: "row",
        marginBottom: 4,
    },
    dayCell: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: 46,
    },
    dayCellInner: {
        width: 38,
        height: 38,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    progressRing: {
        position: "absolute",
        top: 0,
        left: 0,
    },
    dayTextContainer: {
        width: 38,
        height: 38,
        alignItems: "center",
        justifyContent: "center",
    },
    dayText: {
        fontSize: 15,
        fontWeight: "500",
    },

    // Streak Card
    streakCard: {
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        marginBottom: 24,
    },
    streakEmoji: {
        fontSize: 40,
        marginRight: 16,
    },
    streakInfo: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 8,
    },
    streakNumber: {
        fontSize: 40,
        fontWeight: "800",
    },
    streakLabel: {
        fontSize: 18,
        fontWeight: "500",
        opacity: 0.6,
    },

    // Lectures Section
    lecturesSection: {
        gap: 12,
    },
    lecturesTitle: {
        marginBottom: 4,
    },
    lectureCard: {
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderLeftWidth: 4,
    },
    lectureTime: {
        marginRight: 16,
        alignItems: "center",
        width: 48,
    },
    lectureTimeText: {
        fontSize: 15,
        fontWeight: "600",
    },
    lectureEndTime: {
        fontSize: 12,
        marginTop: 2,
    },
    lectureInfo: {
        flex: 1,
    },
    lectureName: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 4,
    },
    lectureRoom: {
        fontSize: 13,
    },
    attendBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 12,
    },
    attendBadgeText: {
        fontSize: 16,
        fontWeight: "700",
    },
    emptyCard: {
        borderRadius: 12,
        padding: 32,
        alignItems: "center",
    },
    emptyText: {
        opacity: 0.4,
        fontSize: 15,
    },
});
