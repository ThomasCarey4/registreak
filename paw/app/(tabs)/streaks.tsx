import { RadialProgress } from "@/components/radial-progress";
import { Colors } from "@/constants/theme";
import rawData from "@/data/attendance-data.json";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
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
    <View className={`flex-1 ${isDark ? "bg-[#151718]" : "bg-white"}`}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView className="flex-1" contentContainerClassName="p-5 pb-10" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text className={`text-[32px] font-bold mb-5 ${isDark ? "text-[#ECEDEE]" : "text-[#11181C]"}`}>
            Attendance
          </Text>

          {/* Calendar Card */}
          <View className={`rounded-2xl p-4 mb-4 shadow-sm ${isDark ? "bg-[#1C1C1E]" : "bg-white shadow-black/10"}`}>
            {/* Month Navigation */}
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity onPress={goToPrevMonth} className="w-9 h-9 justify-center items-center">
                <Text className={`text-[28px] font-light leading-8 ${isDark ? "text-[#ECEDEE]" : "text-[#11181C]"}`}>
                  ‹
                </Text>
              </TouchableOpacity>
              <Text className={`text-[17px] font-semibold ${isDark ? "text-[#ECEDEE]" : "text-[#11181C]"}`}>
                {MONTHS[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity onPress={goToNextMonth} className="w-9 h-9 justify-center items-center">
                <Text className={`text-[28px] font-light leading-8 ${isDark ? "text-[#ECEDEE]" : "text-[#11181C]"}`}>
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
                  const attended = dayData?.lectures.filter((l) => l.attended).length || 0;
                  const total = dayData?.lectures.length || 0;
                  const progress = total > 0 ? attended / total : 0;
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === todayStr;
                  const isFuture = new Date(currentYear, currentMonth, day) > today;

                  return (
                    <TouchableOpacity
                      key={dayIndex}
                      className="flex-1 items-center justify-center h-[46px]"
                      onPress={() => setSelectedDate(dateStr)}
                      activeOpacity={0.6}
                    >
                      <View className="w-[38px] h-[38px] items-center justify-center relative">
                        {total > 0 && (
                          <View className="absolute top-0 left-0">
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
                          className="w-[38px] h-[38px] items-center justify-center"
                          style={[
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
                            className="text-[15px] font-medium"
                            style={{
                              color: isSelected
                                ? isDark
                                  ? "#0a0202"
                                  : "#fff"
                                : isFuture
                                  ? isDark
                                    ? "#555"
                                    : "#C7C7CC"
                                  : isDark
                                    ? "#fff"
                                    : "#1C1C1E",
                            }}
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
            className={`rounded-2xl p-5 flex-row items-center mb-6 shadow-sm ${isDark ? "bg-[#1C1C1E]" : "bg-white shadow-black/10"}`}
          >
            <Text className="text-[40px] mr-4">🔥</Text>
            <View className="flex-row items-baseline gap-2">
              <Text className={`text-[40px] font-extrabold ${isDark ? "text-[#ECEDEE]" : "text-[#11181C]"}`}>
                {streak}
              </Text>
              <Text className={`text-lg font-medium ${isDark ? "text-[#ECEDEE]/60" : "text-[#11181C]/60"}`}>
                day streak
              </Text>
            </View>
          </View>

          {/* Lectures for Selected Day */}
          <View className="gap-3">
            <Text className={`text-xl font-bold mb-1 ${isDark ? "text-[#ECEDEE]" : "text-[#11181C]"}`}>
              {formatDisplayDate(selectedDate)}
            </Text>

            {selectedDayData.length > 0 ? (
              selectedDayData.map((lecture, index) => (
                <View
                  key={`${lecture.id}-${index}`}
                  className={`rounded-xl p-4 flex-row items-center border-l-4 shadow-sm ${isDark ? "bg-[#1C1C1E]" : "bg-white shadow-black/5"}`}
                  style={{
                    borderLeftColor: lecture.attended ? "#4CAF50" : "#F44336",
                  }}
                >
                  <View className="mr-4 items-center w-12">
                    <Text className={`text-[15px] font-semibold ${isDark ? "text-[#ECEDEE]" : "text-[#11181C]"}`}>
                      {lecture.time}
                    </Text>
                    <Text className="text-xs mt-0.5 text-[#8E8E93]">{lecture.endTime}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`text-[15px] font-semibold mb-1 ${isDark ? "text-[#ECEDEE]" : "text-[#11181C]"}`}>
                      {lecture.name}
                    </Text>
                    <Text className="text-[13px] text-[#8E8E93]">📍 {lecture.room}</Text>
                  </View>
                  <View
                    className="w-8 h-8 rounded-full justify-center items-center ml-3"
                    style={{
                      backgroundColor: lecture.attended ? "#E8F5E9" : "#FFEBEE",
                    }}
                  >
                    <Text
                      className="text-base font-bold"
                      style={{
                        color: lecture.attended ? "#2E7D32" : "#C62828",
                      }}
                    >
                      {lecture.attended ? "✓" : "✗"}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View className={`rounded-xl p-8 items-center ${isDark ? "bg-[#1C1C1E]" : "bg-white"}`}>
                <Text className={`text-[15px] ${isDark ? "text-[#ECEDEE]/40" : "text-[#11181C]/40"}`}>
                  No lectures scheduled
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
