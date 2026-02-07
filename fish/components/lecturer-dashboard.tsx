"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Clock, Users, BookOpen, Loader2 } from "lucide-react";

interface Lecture {
  lecture_id: number;
  module_id: number;
  module_name: string;
  start_time: string;
  end_time: string;
  code: string;
}

interface LectureResponse {
  success: boolean;
  lectures?: Lecture[];
  message?: string;
}

export default function LecturerDashboard() {
  const [lecturerId, setLecturerId] = useState("");
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isActive, setIsActive] = useState(false);

  const fetchLectures = useCallback(async () => {
    if (!lecturerId.trim()) {
      setError("Please enter your lecturer ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(
        `${apiUrl}/code/${lecturerId}`
      );
      const data: LectureResponse = await response.json();

      if (data.success && data.lectures) {
        setLectures(data.lectures);
        setIsActive(true);
        setError("");
      } else {
        setError(data.message || "No active lectures found");
        setLectures([]);
        setIsActive(false);
      }
    } catch {
      setError("Failed to connect to server. Is the API running?");
      setLectures([]);
      setIsActive(false);
    } finally {
      setLoading(false);
    }
  }, [lecturerId]);

  // Auto-refresh codes every 30 seconds when active
  useEffect(() => {
    if (!isActive || !lecturerId.trim()) return;

    const interval = setInterval(() => {
      fetchLectures();
    }, 30000);

    return () => clearInterval(interval);
  }, [isActive, lecturerId, fetchLectures]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStop = () => {
    setIsActive(false);
    setLectures([]);
    setLecturerId("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🐱 Lucky Cat Attendance
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Display your attendance code for students
          </p>
        </div>

        {/* Login Card */}
        {!isActive && (
          <Card className="max-w-md mx-auto shadow-lg">
            <CardHeader>
              <CardTitle>Start Lecture Session</CardTitle>
              <CardDescription>
                Enter your lecturer ID to display attendance codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lecturerId">Lecturer ID</Label>
                <Input
                  id="lecturerId"
                  placeholder="e.g., LECT001"
                  value={lecturerId}
                  onChange={(e) => setLecturerId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchLectures()}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button
                onClick={fetchLectures}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Start Session"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Lectures Display */}
        {isActive && lectures.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <Button variant="destructive" onClick={handleStop} size="lg">
                End Session
              </Button>
            </div>

            {lectures.map((lecture) => (
              <Card
                key={lecture.lecture_id}
                className="max-w-4xl mx-auto shadow-2xl border-2"
              >
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <BookOpen className="h-6 w-6" />
                        {lecture.module_name}
                      </CardTitle>
                      <CardDescription className="text-blue-100 mt-2">
                        <Clock className="inline h-4 w-4 mr-1" />
                        {formatTime(lecture.start_time)} -{" "}
                        {formatTime(lecture.end_time)}
                      </CardDescription>
                    </div>
                    <Users className="h-8 w-8 opacity-80" />
                  </div>
                </CardHeader>

                <CardContent className="p-12">
                  <div className="text-center space-y-6">
                    <div>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                        Enter this code in the Lucky Cat app
                      </p>
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-12 shadow-xl inline-block">
                        <div className="text-[10rem] font-bold tracking-[0.3em] font-mono leading-none">
                          {lecture.code}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                        Code refreshes every 30 seconds
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Auto-refresh indicator */}
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                Live — auto-refreshing
              </p>
            </div>
          </div>
        )}

        {/* No Lectures Found */}
        {isActive && lectures.length === 0 && (
          <Card className="max-w-md mx-auto shadow-lg">
            <CardHeader>
              <CardTitle>No Active Lectures</CardTitle>
              <CardDescription>
                You don&apos;t have any lectures scheduled right now
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleStop} variant="outline" className="w-full">
                Go Back
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

