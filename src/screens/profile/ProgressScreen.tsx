import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { workoutSessionsApi } from '@/api/workoutSessions';

const { width } = Dimensions.get('window');

interface WorkoutSession {
  id: string;
  completed_at: string;
  completion_rate: number;
  elapsed_time_seconds: number;
  day_key: string;
}

interface DailyStats {
  date: string;
  day: string;
  completed: boolean;
}

const ProgressScreen = () => {
  const { colors } = useTheme();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalTime: 0,
    avgCompletion: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const sessionStats = await workoutSessionsApi.getStats(30);
      setSessions(sessionStats.sessions || []);
      
      setStats({
        totalWorkouts: sessionStats.totalSessions,
        totalTime: sessionStats.totalTimeSeconds,
        avgCompletion: sessionStats.averageCompletion,
        currentStreak: calculateStreak(sessionStats.sessions || []),
      });
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (sessions: WorkoutSession[]): number => {
    if (sessions.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateString = checkDate.toISOString().split('T')[0];
      
      const hasWorkout = sessions.some(s => s.completed_at.split('T')[0] === dateString);
      if (hasWorkout) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const getLast7Days = (): DailyStats[] => {
    const days: DailyStats[] = [];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const hasWorkout = sessions.some(s => s.completed_at.split('T')[0] === dateString);
      days.push({
        date: dateString,
        day: dayNames[date.getDay()],
        completed: hasWorkout,
      });
    }
    
    return days;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const last7Days = getLast7Days();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Mi Progreso" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando progreso...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Mi Progreso" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            {/* Total Workouts */}
            <Card style={{ ...styles.statCard, backgroundColor: colors.primary + '15' }}>
              <View style={[styles.statIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="fitness-outline" size={24} color="white" />
              </View>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {stats.totalWorkouts}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Entrenamientos
              </Text>
            </Card>

            {/* Total Time */}
            <Card style={{ ...styles.statCard, backgroundColor: colors.success + '15' }}>
              <View style={[styles.statIcon, { backgroundColor: colors.success }]}>
                <Ionicons name="timer-outline" size={24} color="white" />
              </View>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {formatTime(stats.totalTime)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Tiempo Total
              </Text>
            </Card>

            {/* Avg Completion */}
            <Card style={{ ...styles.statCard, backgroundColor: colors.warning + '15' }}>
              <View style={[styles.statIcon, { backgroundColor: colors.warning }]}>
                <Ionicons name="trending-up-outline" size={24} color="white" />
              </View>
              <Text style={[styles.statValue, { color: colors.warning }]}>
                {stats.avgCompletion}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Promedio
              </Text>
            </Card>

            {/* Current Streak */}
            <Card style={{ ...styles.statCard, backgroundColor: colors.error + '15' }}>
              <View style={{ ...styles.statIcon, backgroundColor: colors.error }}>
                <Ionicons name="flame-outline" size={24} color="white" />
              </View>
              <Text style={[styles.statValue, { color: colors.error }]}>
                {stats.currentStreak}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Racha actual
              </Text>
            </Card>
          </View>
        </View>

        {/* Weekly Activity Chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Últimos 7 días
          </Text>
          
          <Card style={{ ...styles.chartCard, backgroundColor: colors.surface }}>
            <View style={styles.weekChart}>
              {last7Days.map((day, index) => (
                <View key={`day-${day.date}`} style={styles.dayColumn}>
                  <View
                    style={[
                      styles.dayBar,
                      {
                        backgroundColor: day.completed ? colors.success : colors.surface,
                        borderColor: day.completed ? colors.success : colors.border,
                      },
                    ]}
                  >
                    {day.completed && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                    {day.day}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Recent Workouts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Entrenamientos Recientes
          </Text>
          
          {sessions.length === 0 ? (
            <Card style={{ ...styles.emptyState, backgroundColor: colors.surface }}>
              <Ionicons name="barbell-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay entrenamientos registrados
              </Text>
            </Card>
          ) : (
            sessions.slice(0, 10).map((session, index) => {
              const date = new Date(session.completed_at);
              const dateStr = date.toLocaleDateString('es-ES', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              
              return (
                <Card key={session.id} style={{ ...styles.workoutCard, backgroundColor: colors.surface }}>
                  <View style={styles.workoutContent}>
                    <View style={styles.workoutHeader}>
                      <View style={styles.workoutLeft}>
                        <View style={[styles.workoutIcon, { backgroundColor: colors.primary + '15' }]}>
                          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        </View>
                        <View>
                          <Text style={[styles.workoutDate, { color: colors.text }]}>
                            {dateStr}
                          </Text>
                          <Text style={[styles.workoutTime, { color: colors.textSecondary }]}>
                            {formatTime(session.elapsed_time_seconds)}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.completionBadge, { backgroundColor: colors.success + '20' }]}>
                        <Text style={[styles.completionText, { color: colors.success }]}>
                          {session.completion_rate}%
                        </Text>
                      </View>
                    </View>

                    {/* Progress bar */}
                    <View
                      style={[
                        styles.progressBar,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${session.completion_rate}%`,
                            backgroundColor:
                              session.completion_rate === 100
                                ? colors.success
                                : colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>

        {/* Summary */}
        <View style={[styles.section, styles.bottomSection]}>
          <Card style={{ ...styles.summaryCard, backgroundColor: colors.primary + '10', borderColor: colors.primary, borderWidth: 1 }}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              📈 Tu progreso
            </Text>
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              Has completado {stats.totalWorkouts} entrenamientos en los últimos 30 días.
              {stats.currentStreak > 0 && ` ¡Mantén tu racha de ${stats.currentStreak} días!`}
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bottomSection: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 56) / 2,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartCard: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  weekChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    gap: 8,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  dayBar: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  workoutCard: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  workoutContent: {
    gap: 10,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutDate: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  workoutTime: {
    fontSize: 12,
    marginTop: 2,
  },
  completionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  completionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  summaryCard: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default ProgressScreen;
