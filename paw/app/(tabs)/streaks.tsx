import { BottomFade, useBottomFade } from "@/components/bottom-fade";
import { RadialProgress } from "@/components/radial-progress";
import { Colors } from "@/constants/theme";
import rawData from "@/data/attendance-data.json";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Lecture {
  id: string;
  code: string;
  name: string;
  time: string;
  endTime: string;
  room: string;
  attended: boolean | null;
}

interface DayData {
  lectures: Lecture[];
}

const attendanceData = rawData.attendance as unknown as Record<string, DayData>;

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
    // Skip days with only scheduled (null) lectures
    if (dayLectures.every((l) => l.attended === null)) continue;
    const hasAttended = dayLectures.some((l) => l.attended === true);

    if (hasAttended) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateBestStreak(data: Record<string, DayData>): number {
  const dates = Object.keys(data).sort();
  let best = 0;
  let current = 0;

  for (const date of dates) {
    const lectures = data[date].lectures;
    // Skip days with only scheduled (null) lectures
    if (lectures.every((l) => l.attended === null)) continue;
    const hasAttended = lectures.some((l) => l.attended === true);
    if (hasAttended) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }

  return best;
}

function calculateOverallRate(data: Record<string, DayData>): number {
  let attended = 0;
  let total = 0;

  for (const date of Object.keys(data)) {
    for (const lecture of data[date].lectures) {
      if (lecture.attended === null) continue;
      total++;
      if (lecture.attended) attended++;
    }
  }

  return total > 0 ? Math.round((attended / total) * 100) : 0;
}

function calculatePerfectDays(data: Record<string, DayData>): number {
  let count = 0;

  for (const date of Object.keys(data)) {
    const lectures = data[date].lectures;
    const resolved = lectures.filter((l) => l.attended !== null);
    if (resolved.length > 0 && resolved.every((l) => l.attended)) {
      count++;
    }
  }

  return count;
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
  const bestStreak = useMemo(() => calculateBestStreak(attendanceData), []);
  const overallRate = useMemo(() => calculateOverallRate(attendanceData), []);
  const perfectDays = useMemo(() => calculatePerfectDays(attendanceData), []);
  const weeks = useMemo(() => getCalendarGrid(currentYear, currentMonth), [currentYear, currentMonth]);

  // Animated entrance for streak card
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

  const { opacity: fadeOpacity, onScroll: onFadeScroll } = useBottomFade();

  return (
    <View className={`flex-1 ${isDark ? "bg-[#151718]" : "bg-white"}`}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-5 pb-10"
          showsVerticalScrollIndicator={false}
          onScroll={onFadeScroll}
          scrollEventThrottle={16}
        >
          {/* Header */}
          <Text className={`text-[32px] font-bold mb-5 ${isDark ? "text-[#ECEDEE]" : "text-[#374151]"}`}>
            Attendance
          </Text>

          {/* Streak Counter */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View
              className="rounded-2xl mb-4 overflow-hidden shadow-sm"
              style={{
                backgroundColor: isDark ? "#1C1C1E" : "#F9FAFB",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0 : 0.08,
                shadowRadius: 12,
              }}
            >
              {/* Main streak display */}
              <View className="p-5 items-center">
                <Text
                  className="font-extrabold"
                  style={{
                    fontSize: 56,
                    lineHeight: 64,
                    color: isDark ? "#ECEDEE" : "#374151",
                  }}
                >
                  {streak}
                </Text>

                <Text
                  className="font-semibold uppercase tracking-[3px]"
                  style={{
                    fontSize: 13,
                    color: isDark ? "rgba(236,237,238,0.5)" : "rgba(55,65,81,0.4)",
                    marginTop: 2,
                  }}
                >
                  {streak === 1 ? "day streak" : "day streak"}
                </Text>

                {streak >= bestStreak && streak > 0 && (
                  <View
                    className="mt-3 rounded-full px-3 py-1"
                    style={{
                      backgroundColor: isDark ? "rgba(255,107,53,0.15)" : "rgba(255,107,53,0.1)",
                    }}
                  >
                    <Text className="text-xs font-bold" style={{ color: "#FF6B35" }}>
                      🏆 Personal Best!
                    </Text>
                  </View>
                )}
              </View>

              {/* Divider */}
              <View
                style={{
                  height: 1,
                  marginHorizontal: 20,
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                }}
              />

              {/* Stats row */}
              <View className="flex-row py-4 px-2">
                <View className="flex-1 items-center">
                  <Text
                    className="font-bold"
                    style={{
                      fontSize: 22,
                      color: isDark ? "#ECEDEE" : "#374151",
                    }}
                  >
                    {bestStreak}
                  </Text>
                  <Text
                    className="font-medium mt-0.5"
                    style={{
                      fontSize: 11,
                      color: isDark ? "rgba(236,237,238,0.4)" : "rgba(55,65,81,0.35)",
                    }}
                  >
                    Best Streak
                  </Text>
                </View>

                <View
                  style={{
                    width: 1,
                    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                  }}
                />

                <View className="flex-1 items-center">
                  <Text
                    className="font-bold"
                    style={{
                      fontSize: 22,
                      color: isDark ? "#ECEDEE" : "#374151",
                    }}
                  >
                    {overallRate}%
                  </Text>
                  <Text
                    className="font-medium mt-0.5"
                    style={{
                      fontSize: 11,
                      color: isDark ? "rgba(236,237,238,0.4)" : "rgba(55,65,81,0.35)",
                    }}
                  >
                    Attendance
                  </Text>
                </View>

                <View
                  style={{
                    width: 1,
                    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                  }}
                />

                <View className="flex-1 items-center">
                  <Text
                    className="font-bold"
                    style={{
                      fontSize: 22,
                      color: isDark ? "#ECEDEE" : "#374151",
                    }}
                  >
                    {perfectDays}
                  </Text>
                  <Text
                    className="font-medium mt-0.5"
                    style={{
                      fontSize: 11,
                      color: isDark ? "rgba(236,237,238,0.4)" : "rgba(55,65,81,0.35)",
                    }}
                  >
                    Perfect Days
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Calendar Card */}
          <View className={`rounded-2xl p-4 mb-4 ${isDark ? "bg-[#1C1C1E]" : "bg-[#F9FAFB]"}`}>
            {/* Month Navigation */}
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity onPress={goToPrevMonth} className="w-9 h-9 justify-center items-center">
                <Text className={`text-[28px] font-light leading-8 ${isDark ? "text-[#ECEDEE]" : "text-[#374151]"}`}>
                  ‹
                </Text>
              </TouchableOpacity>
              <Text className={`text-[17px] font-semibold ${isDark ? "text-[#ECEDEE]" : "text-[#374151]"}`}>
                {MONTHS[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity onPress={goToNextMonth} className="w-9 h-9 justify-center items-center">
                <Text className={`text-[28px] font-light leading-8 ${isDark ? "text-[#ECEDEE]" : "text-[#374151]"}`}>
                  ›
                </Text>
              </TouchableOpacity>
            </View>

            {/* Weekday Headers */}
            <View className="flex-row mb-2">
              {WEEKDAYS.map((day) => (
                <View key={day} className="flex-1 items-center">
                  <Text className="text-xs font-semibold uppercase text-[#8E8E93]">{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} className="flex-row mb-1">
                {week.map((day, dayIndex) => {
                  if (day === null) {
                    return <View key={dayIndex} className="flex-1 items-center justify-center h-[46px]" />;
                  }

                  const dateStr = formatDateKey(currentYear, currentMonth, day);
                  const dayData = attendanceData[dateStr];
                  const allLectures = dayData?.lectures || [];
                  const resolvedLectures = allLectures.filter((l) => l.attended !== null);
                  const hasOnlyScheduled = allLectures.length > 0 && resolvedLectures.length === 0;
                  const attended = resolvedLectures.filter((l) => l.attended).length;
                  const total = hasOnlyScheduled ? allLectures.length : resolvedLectures.length;
                  const progress = hasOnlyScheduled ? 0 : total > 0 ? attended / total : 0;
                  const segments = hasOnlyScheduled
                    ? allLectures.map(() => false)
                    : resolvedLectures.map((l) => !!l.attended);
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === todayStr;
                  const isFuture = new Date(currentYear, currentMonth, day) > today;

                  return (
                    <TouchableOpacity
                      key={dayIndex}
                      className="flex-1 items-center justify-center h-[50px]"
                      onPress={() => setSelectedDate(dateStr)}
                      activeOpacity={0.6}
                    >
                      <View className="items-center">
                        <View className="w-[38px] h-[38px] items-center justify-center relative">
                          {/* Radial progress ring – always visible */}
                          {total > 0 && (
                            <View className="absolute top-0 left-0">
                              <RadialProgress
                                size={38}
                                strokeWidth={3}
                                progress={progress}
                                progressColor={
                                  hasOnlyScheduled
                                    ? isDark
                                      ? "#3A3A3C"
                                      : "#D1D1D6"
                                    : getProgressColor(attended, total)
                                }
                                backgroundColor={isDark ? "#2C2C2E" : "#E5E5EA"}
                                segments={segments}
                              />
                            </View>
                          )}

                          {/* Subtle inner highlight for selected day */}
                          {isSelected && (
                            <View
                              className="absolute rounded-full"
                              style={{
                                width: 30,
                                height: 30,
                                backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                              }}
                            />
                          )}

                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: isSelected || isToday ? "700" : "500",
                              color: isFuture
                                ? isDark
                                  ? "#555"
                                  : "#C7C7CC"
                                : isToday
                                  ? colors.tint
                                  : isDark
                                    ? "#fff"
                                    : "#374151",
                            }}
                          >
                            {day}
                          </Text>
                        </View>

                        {/* Selection dot indicator */}
                        <View
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: 2.5,
                            marginTop: 2,
                            backgroundColor: isSelected ? colors.tint : "transparent",
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Lectures for Selected Day */}
          <View className="gap-2">
            <View className="flex-row items-baseline mb-2">
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: isDark ? "rgba(236,237,238,0.8)" : "rgba(55,65,81,0.7)",
                }}
              >
                {(() => {
                  const [y, m, d] = selectedDate.split("-").map(Number);
                  const date = new Date(y, m - 1, d);
                  return date.toLocaleDateString("en-GB", { weekday: "long" });
                })()}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "400",
                  color: isDark ? "rgba(236,237,238,0.35)" : "rgba(55,65,81,0.35)",
                  marginLeft: 6,
                }}
              >
                {(() => {
                  const [y, m, d] = selectedDate.split("-").map(Number);
                  const date = new Date(y, m - 1, d);
                  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
                })()}
              </Text>
            </View>

            {selectedDayData.length > 0 ? (
              <View
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: isDark ? "#1C1C1E" : "#fff",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isDark ? 0 : 0.06,
                  shadowRadius: 8,
                }}
              >
                {selectedDayData.map((lecture, index) => (
                  <View key={`${lecture.id}-${index}`}>
                    {index > 0 && (
                      <View
                        style={{
                          height: 1,
                          marginHorizontal: 16,
                          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                        }}
                      />
                    )}
                    <View className="px-4 py-3.5 flex-row items-center">
                      {/* Attendance dot */}
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          marginRight: 12,
                          backgroundColor:
                            lecture.attended === null
                              ? isDark
                                ? "#3A3A3C"
                                : "#C7C7CC"
                              : lecture.attended
                                ? "#4CAF50"
                                : "#F44336",
                        }}
                      />

                      {/* Lecture info */}
                      <View className="flex-1">
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: isDark ? "#ECEDEE" : "#374151",
                          }}
                          numberOfLines={1}
                        >
                          {lecture.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "400",
                            color: isDark ? "rgba(236,237,238,0.5)" : "rgba(55,65,81,0.5)",
                            marginTop: 2,
                          }}
                        >
                          {lecture.room}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "500",
                            color: isDark ? "rgba(236,237,238,0.3)" : "rgba(55,65,81,0.3)",
                            marginTop: 2,
                          }}
                          numberOfLines={1}
                        >
                          {lecture.code}
                        </Text>
                      </View>

                      {/* Time column */}
                      <View className="ml-3 items-end">
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            fontVariant: ["tabular-nums"],
                            color: isDark ? "rgba(236,237,238,0.7)" : "rgba(55,65,81,0.6)",
                          }}
                        >
                          {lecture.time}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            fontVariant: ["tabular-nums"],
                            color: isDark ? "rgba(236,237,238,0.3)" : "rgba(55,65,81,0.3)",
                            marginTop: 1,
                          }}
                        >
                          {lecture.endTime}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View
                className="rounded-2xl py-10 items-center"
                style={{
                  backgroundColor: isDark ? "#1C1C1E" : "#fff",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: isDark ? "rgba(236,237,238,0.3)" : "rgba(55,65,81,0.3)",
                  }}
                >
                  No lectures scheduled
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
        <BottomFade opacity={fadeOpacity} />
      </SafeAreaView>
    </View>
  );
}
