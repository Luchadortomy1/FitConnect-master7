import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { DayExercise } from '@/types';
import { workoutSessionsApi } from '@/api/workoutSessions';

const { width } = Dimensions.get('window');

interface RouteParams {
  dayName: string;
  dayWorkout: any;
  completedSets: Record<string, boolean[]>;
  elapsedTime: number;
  routineId: string;
  dayKey: string;
}

const WorkoutSummaryScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  
  const [isSaving, setIsSaving] = useState(false);

  const stats = {
    totalExercises: params.dayWorkout.exercises.length,
    completedExercises: params.dayWorkout.exercises.filter((ex: DayExercise) => {
      const sets = params.completedSets[ex.id] || [];
      return sets.every(Boolean);
    }).length,
    totalSets: params.dayWorkout.exercises.reduce((total: number, ex: DayExercise) => total + ex.sets, 0),
    completedSets: Object.values(params.completedSets).flat().filter(Boolean).length,
    elapsedTime: params.elapsedTime,
    completionRate: params.dayWorkout.exercises.length > 0
      ? Math.round(
          (params.dayWorkout.exercises.filter((ex: DayExercise) => {
            const sets = params.completedSets[ex.id] || [];
            return sets.every(Boolean);
          }).length / params.dayWorkout.exercises.length) * 100
        )
      : 0,
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getMotivationalMessage = () => {
    if (stats.completionRate === 100) {
      return '¡Excelente trabajo! ¡Completaste el entrenamiento!';
    }
    if (stats.completionRate >= 80) {
      return '¡Muy bien! Completaste la mayoría del entrenamiento';
    }
    if (stats.completionRate >= 50) {
      return 'Buen esfuerzo. Continúa así para mejorar';
    }
    return 'Cada entrenamiento cuenta. ¡Sigue adelante!';
  };

  const handleSaveAndFinish = async () => {
    console.log('handleSaveAndFinish called');
    setIsSaving(true);
    
    try {
      // Guardar la sesión de entrenamiento en la base de datos
      await workoutSessionsApi.saveSession({
        routine_id: params.routineId,
        day_key: params.dayKey,
        exercises_data: params.dayWorkout.exercises,
        completed_sets: stats.completedSets,
        total_sets: stats.totalSets,
        completion_rate: stats.completionRate,
        elapsed_time_seconds: stats.elapsedTime,
      });
      
      console.log('Workout session saved successfully');
    } catch (error) {
      console.error('Error saving workout:', error);
      // Mostrar error pero continuar de todas formas
      Alert.alert('Aviso', 'Tu entrenamiento se completó, pero hubo un problema al guardar. Intenta más tarde.');
    } finally {
      // Navegar siempre, haya éxito o no
      setIsSaving(false);
      // Volver a la lista de entrenamientos
      navigation.navigate('WorkoutsList' as never);
    }
  };

  const isCelebration = stats.completionRate === 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Resumen de Entrenamiento"
        showBack={false}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Celebration Animation */}
        {isCelebration && (
          <View style={styles.celebrationContainer}>
            <View style={styles.celebrationEmoji}>
              <Text style={styles.emoji}>🎉</Text>
              <Text style={styles.emoji}>🏆</Text>
              <Text style={styles.emoji}>💪</Text>
            </View>
            <Text style={[styles.celebrationTitle, { color: colors.text }]}>
              ¡Perfecto!
            </Text>
          </View>
        )}

        {/* Stats Card */}
        <View style={styles.section}>
          <Card style={{ ...styles.statsCard, backgroundColor: colors.primary + '10', borderColor: colors.primary, borderWidth: 1 }}>
            <View style={styles.mainStats}>
              <View style={styles.mainStat}>
                <Text style={[styles.mainStatValue, { color: stats.completionRate === 100 ? colors.success : colors.primary }]}>
                  {stats.completionRate}%
                </Text>
                <Text style={[styles.mainStatLabel, { color: colors.textSecondary }]}>
                  Completado
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.mainStat}>
                <Text style={[styles.mainStatValue, { color: colors.success }]}>
                  {formatTime(stats.elapsedTime)}
                </Text>
                <Text style={[styles.mainStatLabel, { color: colors.textSecondary }]}>
                  Tiempo
                </Text>
              </View>
            </View>

            <Text style={[styles.motivationalMessage, { color: colors.text }]}>
              {getMotivationalMessage()}
            </Text>
          </Card>
        </View>

        {/* Detailed Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Estadísticas Detalladas
          </Text>
          
          <Card style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Ejercicios Completados
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {stats.completedExercises} / {stats.totalExercises}
                </Text>
              </View>
              <Ionicons 
                name={stats.completedExercises === stats.totalExercises ? "checkmark-circle" : "ellipse"} 
                size={24} 
                color={stats.completedExercises === stats.totalExercises ? colors.success : colors.textSecondary}
              />
            </View>
          </Card>

          <Card style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Series Completadas
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {stats.completedSets} / {stats.totalSets}
                </Text>
              </View>
              <Text style={[styles.detailValue, { marginTop: 0, color: colors.primary }]}>
                {stats.totalSets}x
              </Text>
            </View>
          </Card>

          <Card style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Día de Entrenamiento
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {params.dayName}
                </Text>
              </View>
              <Ionicons 
                name="calendar" 
                size={24} 
                color={colors.primary}
              />
            </View>
          </Card>
        </View>

        {/* Exercise List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ejercicios del Día
          </Text>
          
          {params.dayWorkout.exercises.map((exercise: DayExercise) => {
            const sets = params.completedSets[exercise.id] || [];
            const completedCount = sets.filter(Boolean).length;
            const isComplete = sets.every(Boolean);

            return (
              <Card key={exercise.id} style={styles.exerciseItem}>
                <View style={styles.exerciseRow}>
                  <View style={styles.exerciseInfo}>
                    <View style={styles.exerciseHeader}>
                      <Text style={[styles.exerciseName, { color: colors.text }]}>
                        {exercise.name}
                      </Text>
                      {isComplete && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                      )}
                    </View>
                    <Text style={[styles.exerciseMuscle, { color: colors.textSecondary }]}>
                      {exercise.muscle}
                    </Text>
                    <Text style={[styles.exerciseSets, { color: colors.textSecondary }]}>
                      {completedCount}/{exercise.sets} series completadas
                    </Text>
                  </View>
                </View>
                
                {/* Progress Bar for Exercise */}
                <View style={[styles.exerciseProgressBar, { backgroundColor: colors.surface }]}>
                  <View 
                    style={[
                      styles.exerciseProgressFill,
                      { 
                        width: `${exercise.sets > 0 ? (completedCount / exercise.sets) * 100 : 0}%`,
                        backgroundColor: isComplete ? colors.success : colors.primary
                      }
                    ]} 
                  />
                </View>
              </Card>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsSection}>
          <Button
            title={isSaving ? 'Guardando...' : 'Guardar y Finalizar'}
            onPress={handleSaveAndFinish}
            disabled={isSaving}
            fullWidth
          />
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
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  celebrationContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  celebrationEmoji: {
    fontSize: 60,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  emoji: {
    fontSize: 48,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statsCard: {
    paddingVertical: 20,
  },
  mainStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainStat: {
    alignItems: 'center',
    flex: 1,
  },
  mainStatValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  mainStatLabel: {
    fontSize: 13,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  motivationalMessage: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailCard: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  exerciseItem: {
    marginBottom: 12,
  },
  exerciseRow: {
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  exerciseMuscle: {
    fontSize: 13,
    marginBottom: 4,
  },
  exerciseSets: {
    fontSize: 12,
  },
  exerciseProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  exerciseProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  buttonsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
});

export default WorkoutSummaryScreen;
