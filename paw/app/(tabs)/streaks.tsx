import { BottomFade, useBottomFade } from "@/components/bottom-fade";
import { FireCelebration } from "@/components/fire-celebration";
import { RadialProgress } from "@/components/radial-progress";
import { RollingNumber } from "@/components/rolling-number";
import { themeColors } from "@/constants/colors";
import { useAuth } from "@/context/auth-context";
import { useColorScheme } from "nativewind";
import { apiService } from "@/services/api";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Lecture {
  id: string;
  code: string;
  name: string;
  time: string;
  endTime: string;
  room: string | null;
  attended: boolean | null;
}

interface DayData {
  lectures: Lecture[];
}

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

  const { colorScheme } = useColorScheme();
  const colors = themeColors[colorScheme ?? "light"];
  const { user } = useAuth();
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

  // Live data from the backend
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [attendanceData, setAttendanceData] = useState<Record<string, DayData>>({});
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  // Fetch streak + attendance data every time this tab is focused
  useFocusEffect(
    useCallback(() => {
      if (!user?.student_id) return;
      let cancelled = false;
      (async () => {
        try {
          setLoadingAttendance(true);
          const [userDetails, attendanceRes] = await Promise.all([
            apiService.getUserDetails(user.student_id) as Promise<{
              current_streak: number;
              longest_streak: number;
            }>,
            apiService.getAttendance(),
          ]);
          if (cancelled) return;
          setStreak(userDetails.current_streak);
          setBestStreak(userDetails.longest_streak);
          setAttendanceData(attendanceRes.attendance as unknown as Record<string, DayData>);
        } catch (e) {
          console.error("Failed to fetch attendance data:", e);
        } finally {
          if (!cancelled) setLoadingAttendance(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [user?.student_id]),
  );

  const overallRate = useMemo(() => calculateOverallRate(attendanceData), [attendanceData]);
  const perfectDays = useMemo(() => calculatePerfectDays(attendanceData), [attendanceData]);
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
    if (attended >= total) return "#4CAF50";
    return "#FF9800";
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
            <View className="rounded-2xl mb-4 overflow-hidden bg-card shadow-sm shadow-black/10">
              {/* Main streak display */}
              <View className="p-5 items-center">
                <View className="flex-row items-center">
                  <RollingNumber
                    value={streak}
                    animate={showCelebration}
                    fontSize={56}
                    color={colors.foreground}
                    fontWeight="800"
                    delay={300}
                  />
                  <Text className="text-[56px] ml-2">{streak === 1 ? "" : "🔥"}</Text>
                </View>

                <Text className="text-[13px] font-semibold uppercase tracking-[3px] text-foreground/45 mt-0.5">
                  {streak === 1 ? "day streak" : "day streak"}
                </Text>

                {streak >= bestStreak && streak > 0 && (
                  <View className="mt-3 rounded-full px-3 py-1 bg-[#FF6B351F]">
                    <Text className="text-xs font-bold text-[#FF6B35]">🏆 Personal Best!</Text>
                  </View>
                )}
              </View>

              {/* Divider */}
              <View className="h-[1px] mx-5 bg-foreground/5" />

              {/* Stats row */}
              <View className="flex-row py-4 px-2">
                <View className="flex-1 items-center">
                  <Text className="font-bold text-[22px] text-foreground">{bestStreak}</Text>
                  <Text className="font-medium mt-0.5 text-[11px] text-foreground">Best Streak</Text>
                </View>

                <View className="w-[1px] bg-foreground/5" />

                <View className="flex-1 items-center">
                  <Text className="font-bold text-[22px] text-foreground">{overallRate}%</Text>
                  <Text className="font-medium mt-0.5 text-[11px] text-foreground">Attendance</Text>
                </View>

                <View className="w-[1px] bg-foreground/5" />

                <View className="flex-1 items-center">
                  <Text className="font-bold text-[22px] text-foreground">{perfectDays}</Text>
                  <Text className="font-medium mt-0.5 text-[11px] text-foreground">Perfect Days</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Calendar Card */}
          <View className="rounded-2xl p-4 mb-4 bg-card">
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
                  <Text className="text-xs font-semibold uppercase text-muted">{day}</Text>
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
                                  hasOnlyScheduled ? colors.calScheduled : getProgressColor(attended, total)
                                }
                                backgroundColor={colors.calRingBg}
                                segments={segments}
                              />
                            </View>
                          )}

                          {/* Subtle inner highlight for selected day */}
                          {isSelected && <View className="absolute w-[30px] h-[30px] rounded-full bg-foreground/6" />}

                          <Text
                            className={`text-[15px] ${isSelected || isToday ? "font-bold" : "font-medium"} ${isFuture ? "text-cal-future" : isToday ? "text-tint" : "text-foreground"}`}
                          >
                            {day}
                          </Text>
                        </View>

                        {/* Selection dot indicator */}
                        <View
                          className={`w-[5px] h-[5px] rounded-full mt-0.5 ${isSelected ? "bg-tint" : "bg-transparent"}`}
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
              <Text className="text-[15px] font-semibold text-foreground/75">
                {(() => {
                  const [y, m, d] = selectedDate.split("-").map(Number);
                  const date = new Date(y, m - 1, d);
                  return date.toLocaleDateString("en-GB", { weekday: "long" });
                })()}
              </Text>
              <Text className="text-[13px] font-normal text-foreground/35 ml-1.5">
                {(() => {
                  const [y, m, d] = selectedDate.split("-").map(Number);
                  const date = new Date(y, m - 1, d);
                  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
                })()}
              </Text>
            </View>

            {selectedDayData.length > 0 ? (
              <View className="rounded-2xl overflow-hidden bg-card shadow-sm shadow-black/5 dark:shadow-none">
                {selectedDayData.map((lecture, index) => (
                  <View key={`${lecture.id}-${index}`}>
                    {index > 0 && <View className="h-[1px] mx-4 bg-foreground/5" />}
                    <View className="px-4 py-3.5 flex-row items-center">
                      {/* Attendance dot */}
                      <View
                        className={`w-2 h-2 rounded-full mr-3 ${lecture.attended === null ? "bg-cal-dot-null" : lecture.attended ? "bg-success" : "bg-error"}`}
                      />

                      {/* Lecture info */}
                      <View className="flex-1">
                        <Text className="text-[14px] font-semibold text-foreground" numberOfLines={1}>
                          {lecture.name}
                        </Text>
                        <Text className="text-[13px] font-normal text-foreground/50 mt-0.5">{lecture.room}</Text>
                        <Text className="text-[11px] font-medium text-foreground/30 mt-0.5" numberOfLines={1}>
                          {lecture.code}
                        </Text>
                      </View>

                      {/* Time column */}
                      <View className="ml-3 items-end">
                        <Text
                          className="text-[13px] font-semibold text-foreground/65"
                          style={{ fontVariant: ["tabular-nums"] }}
                        >
                          {lecture.time}
                        </Text>
                        <Text
                          className="text-[11px] text-foreground/30 mt-0.5"
                          style={{ fontVariant: ["tabular-nums"] }}
                        >
                          {lecture.endTime}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="rounded-2xl py-10 items-center bg-card">
                <Text className="text-[13px] text-foreground/30">No lectures scheduled</Text>
              </View>
            )}
          </View>
        </ScrollView>
        <BottomFade opacity={fadeOpacity} />
      </SafeAreaView>
    </View>
  );
}
