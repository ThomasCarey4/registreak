import { BottomFade, useBottomFade } from "@/components/bottom-fade";
import { FireCelebration } from "@/components/fire-celebration";
import { RadialProgress } from "@/components/radial-progress";
import { RollingNumber } from "@/components/rolling-number";
import { accent, palette, status } from "@/constants/colors";
import rawData from "@/data/attendance-data.json";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  const colors = palette[colorScheme];
  const { celebrate } = useLocalSearchParams<{ celebrate?: string }>();
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (celebrate === "true") {
      setShowCelebration(true);
      // Clear the param so re-visiting doesn't re-trigger
      router.setParams({ celebrate: "" });
      // Auto-hide fire after animation completes
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [celebrate]);

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
    if (ratio >= 1) return accent.progressGood;
    if (ratio >= 0.5) return accent.progressMid;
    return accent.progressLow;
  };

  const { opacity: fadeOpacity, onScroll: onFadeScroll } = useBottomFade();

  return (
    <View className="flex-1 bg-background">
      <FireCelebration visible={showCelebration} />
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-5 pb-10"
          showsVerticalScrollIndicator={false}
          onScroll={onFadeScroll}
          scrollEventThrottle={16}
        >
          {/* Header */}
          <Text className="text-[32px] font-bold mb-5 text-foreground">Attendance</Text>

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
                backgroundColor: colors.card,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0 : 0.08,
                shadowRadius: 12,
              }}
            >
              {/* Main streak display */}
              <View className="p-5 items-center">
                <RollingNumber
                  value={streak}
                  animate={showCelebration}
                  fontSize={56}
                  color={colors.foreground}
                  fontWeight="800"
                  delay={300}
                />

                <Text
                  className="font-semibold uppercase tracking-[3px]"
                  style={{
                    fontSize: 13,
                    color: colors.streakLabel,
                    marginTop: 2,
                  }}
                >
                  {streak === 1 ? "day streak" : "day streak"}
                </Text>

                {streak >= bestStreak && streak > 0 && (
                  <View className="mt-3 rounded-full px-3 py-1 bg-badge-best-bg">
                    <Text className="text-xs font-bold text-badge-best-text">🏆 Personal Best!</Text>
                  </View>
                )}
              </View>

              {/* Divider */}
              <View
                style={{
                  height: 1,
                  marginHorizontal: 20,
                  backgroundColor: colors.dividerSubtle,
                }}
              />

              {/* Stats row */}
              <View className="flex-row py-4 px-2">
                <View className="flex-1 items-center">
                  <Text
                    className="font-bold"
                    style={{
                      fontSize: 22,
                      color: colors.foreground,
                    }}
                  >
                    {bestStreak}
                  </Text>
                  <Text
                    className="font-medium mt-0.5"
                    style={{
                      fontSize: 11,
                      color: colors.statsLabel,
                    }}
                  >
                    Best Streak
                  </Text>
                </View>

                <View
                  style={{
                    width: 1,
                    backgroundColor: colors.dividerSubtle,
                  }}
                />

                <View className="flex-1 items-center">
                  <Text
                    className="font-bold"
                    style={{
                      fontSize: 22,
                      color: colors.foreground,
                    }}
                  >
                    {overallRate}%
                  </Text>
                  <Text
                    className="font-medium mt-0.5"
                    style={{
                      fontSize: 11,
                      color: colors.statsLabel,
                    }}
                  >
                    Attendance
                  </Text>
                </View>

                <View
                  style={{
                    width: 1,
                    backgroundColor: colors.dividerSubtle,
                  }}
                />

                <View className="flex-1 items-center">
                  <Text
                    className="font-bold"
                    style={{
                      fontSize: 22,
                      color: colors.foreground,
                    }}
                  >
                    {perfectDays}
                  </Text>
                  <Text
                    className="font-medium mt-0.5"
                    style={{
                      fontSize: 11,
                      color: colors.statsLabel,
                    }}
                  >
                    Perfect Days
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Calendar Card */}
          <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.card }}>
            {/* Month Navigation */}
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity onPress={goToPrevMonth} className="w-9 h-9 justify-center items-center">
                <Text className="text-[28px] font-light leading-8 text-foreground">‹</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setCurrentMonth(today.getMonth());
                  setCurrentYear(today.getFullYear());
                  setSelectedDate(formatDateKey(today.getFullYear(), today.getMonth(), today.getDate()));
                }}
                activeOpacity={0.6}
              >
                <Text className="text-[17px] font-semibold text-foreground">
                  {MONTHS[currentMonth]} {currentYear}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={goToNextMonth} className="w-9 h-9 justify-center items-center">
                <Text className="text-[28px] font-light leading-8 text-foreground">›</Text>
              </TouchableOpacity>
            </View>

            {/* Weekday Headers */}
            <View className="flex-row mb-2">
              {WEEKDAYS.map((day) => (
                <View key={day} className="flex-1 items-center">
                  <Text className="text-xs font-semibold uppercase text-calendar-weekday">{day}</Text>
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
                                  hasOnlyScheduled ? colors.calendarCellMuted : getProgressColor(attended, total)
                                }
                                backgroundColor={colors.calendarCell}
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
                                backgroundColor: colors.selectionHighlight,
                              }}
                            />
                          )}

                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: isSelected || isToday ? "700" : "500",
                              color: isFuture ? colors.calendarFuture : isToday ? colors.tint : colors.foreground,
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
                  color: colors.lectureDatePrimary,
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
                  color: colors.lectureDateSecondary,
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
                  backgroundColor: colors.lectureCardBg,
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
                          backgroundColor: colors.dividerSubtle,
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
                              ? colors.calendarCellMuted
                              : lecture.attended
                                ? status.success
                                : status.error,
                        }}
                      />

                      {/* Lecture info */}
                      <View className="flex-1">
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: colors.foreground,
                          }}
                          numberOfLines={1}
                        >
                          {lecture.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "400",
                            color: colors.lectureSubtitle,
                            marginTop: 2,
                          }}
                        >
                          {lecture.room}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "500",
                            color: colors.lectureCode,
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
                            color: colors.lectureTime,
                          }}
                        >
                          {lecture.time}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            fontVariant: ["tabular-nums"],
                            color: colors.lectureTimeEnd,
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
                  backgroundColor: colors.lectureCardBg,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.noLecturesText,
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
