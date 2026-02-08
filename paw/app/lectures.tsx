import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, RefreshControl, ActivityIndicator, Pressable, Image } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { apiService } from '@/services/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Redirect } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

interface Lecture {
  lecture_id: number;
  module_id: number;
  module_name: string;
  start_time: string;
  end_time: string;
  code: string;
}

export default function LecturesScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [sessionEnded, setSessionEnded] = useState(false);

  const fetchLectures = useCallback(async () => {
    try {
      setError('');
      const response = await apiService.getVerificationCode();

      if (response && response.lectures) {
        setLectures(response.lectures);
      } else {
        setLectures([]);
        setError(response?.message || response?.error || 'No active lectures found');
      }
    } catch {
      setError('Failed to fetch lectures');
      setLectures([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    if (!user?.is_staff || sessionEnded) return;

    fetchLectures();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLectures();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.is_staff, sessionEnded, fetchLectures]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLectures();
  }, [fetchLectures]);

  const handleEndSession = async () => {
    try {
      await logout();
      setSessionEnded(true);
      setLectures([]);
    } catch {
      setError('Failed to end session');
    }
  };

  const formatTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  if (!user?.is_staff) {
    return <Redirect href="/" />;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <ThemedText type="title">Active Lectures</ThemedText>
          <ThemedText style={styles.subtitle}>
            Share these codes with your students
          </ThemedText>
        </View>

        {error && (
          <View style={[styles.errorBox, { borderColor: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
            <ThemedText style={styles.loadingText}>Loading lectures...</ThemedText>
          </View>
        )}

        {!loading && lectures.length === 0 && !error && (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No active lectures</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              You don&apos;t have any lectures scheduled right now
            </ThemedText>
          </View>
        )}

        {lectures.map((lecture) => (
          <View key={lecture.lecture_id} style={styles.lectureCard}>
            <View style={styles.lectureHeader}>
              <View style={styles.moduleInfo}>
                <ThemedText type="subtitle">{lecture.module_name}</ThemedText>
                <ThemedText style={styles.timeText}>
                  {formatTime(lecture.start_time)} – {formatTime(lecture.end_time)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.codeContainer}>
              <ThemedText style={styles.codeLabel}>Verification Code</ThemedText>
              <View style={styles.codeDigits}>
                {lecture.code.split('').map((digit, idx) => (
                  <View key={idx} style={styles.digitBox}>
                    <ThemedText style={styles.digit}>{digit}</ThemedText>
                  </View>
                ))}
              </View>

              <View style={styles.qrContainer}>
                <View style={styles.qrWrapper}>
                  <QRCode
                    value={`paw://attend?code=${lecture.code}`}
                    size={180}
                    backgroundColor="white"
                    logo={require('@/assets/images/icon.png')}
                    logoSize={40}
                    logoBackgroundColor="white"
                    logoBorderRadius={8}
                  />
                </View>
                <ThemedText style={styles.qrLabel}>
                  Scan this QR code to mark attendance
                </ThemedText>
              </View>

              <View style={styles.autoRefreshIndicator}>
                <View style={styles.pulseDot} />
                <ThemedText style={styles.autoRefreshText}>
                  Auto-refreshing every 30 seconds
                </ThemedText>
              </View>
            </View>
          </View>
        ))}

        {lectures.length > 0 && (
          <Pressable
            style={[styles.endSessionButton, { marginBottom: 20 }]}
            onPress={handleEndSession}
          >
            <ThemedText style={styles.endSessionText}>End Session</ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
  lectureCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  lectureHeader: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  moduleInfo: {
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    opacity: 0.6,
  },
  codeContainer: {
    padding: 24,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeDigits: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  digitBox: {
    width: 56,
    height: 72,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digit: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Courier New',
    letterSpacing: 2,
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 12,
    textAlign: 'center',
  },
  autoRefreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  autoRefreshText: {
    fontSize: 12,
    opacity: 0.6,
  },
  endSessionButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  endSessionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});