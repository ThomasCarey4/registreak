"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Clock, Users, BookOpen, Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { authFetch } from "@/lib/auth";

interface Lecture {
  lecture_id: number;
  module_id: number;
  module_name: string;
  start_time: string;
  end_time: string;
  code: string;
}

interface CodeResponse {
  success: boolean;
  lectures?: Lecture[];
  message?: string;
  error?: string;
}

export default function LecturerDashboard() {
  const { isAuthenticated, isLoading: authLoading, login, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  const fetchLectures = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Please log in to view lectures");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authFetch("/code");
      const data: CodeResponse = await response.json();

      if (response.ok && data.success && data.lectures) {
        setLectures(data.lectures);
        setIsActive(true);
        setError("");
      } else if (response.status === 401) {
        setError("Session expired. Please log in again.");
        await logout();
      } else {
        setError(data.message || data.error || "No active lectures found");
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
  }, [isAuthenticated, logout]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login({ username, password });
      setUsername("");
      setPassword("");
      setSessionEnded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Fetch lectures when authenticated
  useEffect(() => {
    if (isAuthenticated && !isActive && !sessionEnded) {
      fetchLectures();
    }
  }, [isAuthenticated, isActive, sessionEnded, fetchLectures]);

  // Auto-refresh codes every 30 seconds when active
  useEffect(() => {
    if (!isActive || !isAuthenticated) return;

    const interval = setInterval(() => {
      fetchLectures();
    }, 30000);

    return () => clearInterval(interval);
  }, [isActive, isAuthenticated, fetchLectures]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStop = async () => {
    setSessionEnded(true);
    setIsActive(false);
    setLectures([]);
    await logout();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center pt-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            🐱 Lucky Cat
          </h1>
          <p className="text-lg text-muted-foreground">
            Lecturer Dashboard
          </p>
        </div>

        {/* Loading State */}
        {authLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}

        {/* Login Card */}
        {!isAuthenticated && !authLoading && (
          <Card className="max-w-md mx-auto border-2 border-border rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-center text-foreground">Login</CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Enter your credentials to display attendance codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-8">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="h-12 rounded-xl border-2 border-border bg-secondary focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="h-12 rounded-xl border-2 border-border bg-secondary focus:border-primary transition-colors"
                />
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-12 rounded-xl font-semibold text-base bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Lectures Display */}
        {isActive && lectures.length > 0 && (
          <div className="space-y-8">
            <div className="flex justify-center mb-6">
              <Button
                variant="destructive"
                onClick={handleStop}
                size="lg"
                className="rounded-xl px-8 h-12 font-semibold bg-destructive hover:bg-destructive/90 transition-all"
              >
                <LogOut className="mr-2 h-5 w-5" />
                End Session
              </Button>
            </div>

            {lectures.map((lecture) => (
              <Card
                key={lecture.lecture_id}
                className="max-w-2xl mx-auto border-2 border-border rounded-3xl overflow-hidden shadow-sm"
              >
                <CardHeader className="bg-secondary px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-accent" />
                        </div>
                        {lecture.module_name}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatTime(lecture.start_time)} – {formatTime(lecture.end_time)}
                      </CardDescription>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-8 md:p-12">
                  <div className="text-center space-y-6">
                    <p className="text-muted-foreground">
                      Enter this code in the Lucky Cat app
                    </p>

                    {/* Code Display - matching paw app's digit boxes style */}
                    <div className="flex justify-center gap-3 md:gap-4">
                      {lecture.code.split("").map((digit, idx) => (
                        <div
                          key={idx}
                          className="w-16 h-20 md:w-20 md:h-24 rounded-2xl border-2 border-accent bg-accent/5 flex items-center justify-center"
                        >
                          <span className="text-4xl md:text-5xl font-bold text-foreground font-mono">
                            {digit}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <span className="h-2 w-2 bg-accent rounded-full animate-pulse"></span>
                      Auto-refreshing every 30 seconds
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Lectures Found */}
        {isActive && lectures.length === 0 && (
          <Card className="max-w-md mx-auto border-2 border-border rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">No Active Lectures</CardTitle>
              <CardDescription className="text-muted-foreground">
                You don&apos;t have any lectures scheduled right now
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <Button
                onClick={handleStop}
                variant="outline"
                className="w-full h-12 rounded-xl font-semibold border-2 border-border hover:bg-secondary transition-all"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

