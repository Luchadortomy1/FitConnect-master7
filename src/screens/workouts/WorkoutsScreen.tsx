import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { WeeklyRoutine, DayWorkout, WeekDay } from '@/types';
import { routinesApi } from '@/api/routines';
import { workoutSessionsApi } from '@/api/workoutSessions';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

// Helper para etiquetas
const getGoalLabel = (goal: string): string => {
  const labels: Record<string, string> = {
    'lose_weight': 'Perder Peso',
    'gain_muscle': 'Ganar Músculo',
    'maintain': 'Mantener Forma',
    'endurance': 'Resistencia'
  };
  return labels[goal] || goal;
};

const getGoalIcon = (goal: string): string => {
  const icons: Record<string, string> = {
    'lose_weight': 'flame-outline',
    'gain_muscle': 'barbell-outline',
    'maintain': 'checkmark-outline',
    'endurance': 'heart-outline'
  };
  return icons[goal] || 'fitness-outline';
};

const WorkoutsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [routines, setRoutines] = useState<WeeklyRoutine[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<WeeklyRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todaysSessions, setTodaysSessions] = useState<any[]>([]);
  const routinesSafe = Array.isArray(routines) ? routines : [];

  const handleCreateRoutinePress = () => {
    const routineCount = Array.isArray(routines) ? routines.length : 0;

    if (routineCount >= 2) {
      Alert.alert(
        'Límite alcanzado',
        'Recomendamos máximo 2 rutinas activas para no sobrecargar tu semana. Elimina una para crear otra.'
      );
      return;
    }

    if (routineCount >= 1) {
      Alert.alert(
        'Recomendación',
        'Es recomendable tener solo una rutina activa. Puedes crear una más si lo necesitas.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => navigation.navigate('CreateRoutine' as never) },
        ]
      );
      return;
    }

    navigation.navigate('CreateRoutine' as never);
  };

  const weekDays: { key: WeekDay; label: string; short: string }[] = [
    { key: 'monday', label: 'Lunes', short: 'L' },
    { key: 'tuesday', label: 'Martes', short: 'M' },
    { key: 'wednesday', label: 'Miércoles', short: 'X' },
    { key: 'thursday', label: 'Jueves', short: 'J' },
    { key: 'friday', label: 'Viernes', short: 'V' },
    { key: 'saturday', label: 'Sábado', short: 'S' },
    { key: 'sunday', label: 'Domingo', short: 'D' },
  ];

  const loadData = async () => {
    try {
      const [routinesData, activeRoutineData] = await Promise.all([
        routinesApi.getRoutines(),
        routinesApi.getActiveRoutine(),
      ]);
      setRoutines(Array.isArray(routinesData) ? routinesData : []);
      setActiveRoutine(activeRoutineData || null);

      // Cargar sesiones de hoy
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      try {
        const sessions = await workoutSessionsApi.getSessions(1);
        const todaysSessionsList = sessions.filter((s: any) => 
          s.completed_at?.split('T')[0] === today
        );
        setTodaysSessions(todaysSessionsList);
      } catch (error) {
        console.warn('Error loading todays sessions:', error);
        setTodaysSessions([]);
      }
    } catch (error) {
      console.error('Error loading routines:', error);
      setRoutines([]);
      setActiveRoutine(null);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recargar datos cuando la pantalla se enfoca (después de crear rutina)
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const getCurrentDay = (): WeekDay => {
    const today = new Date().getDay();
    const dayMap: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return dayMap[today];
  };

  const handleSetActiveRoutine = async (routineId: string) => {
    try {
      await routinesApi.setActiveRoutine(routineId);
      await loadData(); // Reload to get updated data
      Alert.alert('Éxito', 'Rutina activada correctamente');
    } catch (error) {
      console.error('Error setting active routine:', error);
      Alert.alert('Error', 'No se pudo activar la rutina');
    }
  };

  const handleDeleteRoutine = (routineId: string) => {
    Alert.alert(
      'Eliminar Rutina',
      '¿Estás seguro de que quieres eliminar esta rutina?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            routinesApi.deleteRoutine(routineId)
              .then(() => {
                loadData();
                Alert.alert('Éxito', 'Rutina eliminada correctamente');
              })
              .catch((error) => {
                console.error('Error deleting routine:', error);
                Alert.alert('Error', 'No se pudo eliminar la rutina');
              });
          }
        },
      ]
    );
  };

  const handleDayPress = (day: WeekDay, workout?: DayWorkout) => {
    const today = getCurrentDay();
    
    if (!activeRoutine) {
      Alert.alert('Sin rutina activa', 'Primero activa una rutina para poder entrenar');
      return;
    }

    // Validar que solo se pueda entrenar en el día actual
    if (day !== today) {
      Alert.alert('Día no permitido', 'Solo puedes entrenar el día de hoy');
      return;
    }

    // Validar que no se haya completado ya hoy
    if (todaysSessions.length > 0) {
      Alert.alert('Entrenamiento completado', 'Ya completaste el entrenamiento de hoy. Vuelve mañana');
      return;
    }

    if (workout) {
      navigation.navigate('DayWorkout' as never, { 
        dayWorkout: workout, 
        dayName: weekDays.find(d => d.key === day)?.label || day,
        routineId: activeRoutine.id,
        dayKey: day
      } as never);
    }
  };

  const getMuscleGroupIcon = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('pecho') || lowerName.includes('chest') || lowerName.includes('push')) return 'body-outline';
    if (lowerName.includes('espalda') || lowerName.includes('back') || lowerName.includes('pull')) return 'chevron-back-outline';
    if (lowerName.includes('pierna') || lowerName.includes('leg')) return 'walk-outline';
    if (lowerName.includes('hombro') || lowerName.includes('shoulder')) return 'triangle-outline';
    if (lowerName.includes('brazo') || lowerName.includes('arm') || lowerName.includes('bíceps') || lowerName.includes('tríceps')) return 'hand-right-outline';
    if (lowerName.includes('upper')) return 'chevron-up-outline';
    if (lowerName.includes('lower')) return 'chevron-down-outline';
    return 'fitness-outline';
  };

  const getButtonTitle = (): string => {
    if (todaysSessions.length > 0) return '✓ Completado';
    if (todayWorkout) return 'Empezar';
    return 'Ver semana';
  };

  const getDaySubtitle = (isCompleted: boolean, workout?: DayWorkout): string => {
    if (isCompleted) return '✓ Completado';
    if (workout) return `${workout.exercises.length} ejercicios`;
    return 'Libre';
  };

  const today = useMemo(() => getCurrentDay(), []);
  const todayWorkout = activeRoutine?.weeklyPlan[today];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Rutinas de Entrenamiento" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando rutinas...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title="Entrenamientos"
        rightComponent={
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleCreateRoutinePress}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* User Goal Info */}
        {user?.goal && (
          <View style={styles.section}>
            <Card style={[styles.goalCard, { backgroundColor: colors.primary + '15', borderColor: colors.primary, borderWidth: 1 }]}>
              <View style={styles.goalContent}>
                <View style={[styles.goalIcon, { backgroundColor: colors.primary }]}>
                  <Ionicons name={getGoalIcon(user.goal)} size={24} color="white" />
                </View>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>Tu Objetivo</Text>
                  <Text style={[styles.goalValue, { color: colors.text }]}>
                    {getGoalLabel(user.goal)}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Active Routine / Today */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tu día</Text>
          {activeRoutine ? (
            <Card style={[styles.heroCard, { backgroundColor: colors.primary + '08' }]}> 
              <View style={styles.heroHeader}>
                <View style={styles.heroBadge}>
                  <Ionicons name="flame" size={16} color={colors.primary} />
                  <Text style={[styles.heroBadgeText, { color: colors.primary }]}>Rutina activa</Text>
                </View>
                  <TouchableOpacity onPress={handleCreateRoutinePress}>
                  <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.heroTitle, { color: colors.text }]}>{activeRoutine.name}</Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                {activeRoutine.description || 'Entrena con constancia esta semana'}
              </Text>

              <View style={styles.heroRow}>
                <View style={styles.heroStat}>
                  <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.heroStatText, { color: colors.textSecondary }]}>7 días</Text>
                </View>
                <View style={styles.heroStat}>
                  <Ionicons name="barbell-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.heroStatText, { color: colors.textSecondary }]}>
                    {Object.values(activeRoutine.weeklyPlan).reduce((t, d) => t + (d?.exercises.length || 0), 0)} ejercicios
                  </Text>
                </View>
              </View>

              <Card style={[styles.todayCard, { backgroundColor: colors.surface }]}> 
                <View style={styles.todayLeft}>
                  <View style={[styles.todayIcon, { backgroundColor: colors.primary + '15' }]}> 
                    <Ionicons name={todayWorkout ? getMuscleGroupIcon(todayWorkout.name) : 'sunny-outline'} size={22} color={colors.primary} />
                  </View>
                  <View style={styles.todayInfo}>
                    <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>Hoy</Text>
                    <Text style={[styles.todayName, { color: colors.text }]} numberOfLines={1}>
                      {todayWorkout ? todayWorkout.name : 'Sin sesión asignada'}
                    </Text>
                    {todayWorkout && (
                      <Text style={[styles.todayMeta, { color: colors.textSecondary }]}>{todayWorkout.exercises.length} ejercicios · {todayWorkout.estimatedDuration || 60} min</Text>
                    )}
                    {todaysSessions.length > 0 && (
                      <View style={[styles.completedBadge, { backgroundColor: colors.success + '20' }]}>
                        <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                        <Text style={[styles.completedText, { color: colors.success }]}>Completado hoy</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Button
                  title={getButtonTitle()}
                  size="small"
                  disabled={todaysSessions.length > 0}
                  onPress={() => {
                    if (todayWorkout && todaysSessions.length === 0) {
                      handleDayPress(today, todayWorkout);
                    }
                  }}
                />
              </Card>
            </Card>
          ) : (
            <Card style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Crea tu primera rutina</Text>
              <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>Organiza tus entrenos semanales y sigue el plan del mock</Text>
              <Button title="Crear rutina" onPress={handleCreateRoutinePress} style={styles.createButton} />
            </Card>
          )}
        </View>

        {/* Semana visual */}
        {activeRoutine && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Semana</Text>
              <TouchableOpacity onPress={() => navigation.navigate('EditRoutine' as never, { routineId: activeRoutine.id } as never)}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>Editar rutina</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekRow}>
              {weekDays.map(day => {
                const workout = activeRoutine.weeklyPlan[day.key];
                const isToday = today === day.key;
                const isCompleted = todaysSessions.length > 0 && isToday;
                
                return (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayPill,
                      { backgroundColor: colors.surface },
                      isToday && { borderColor: colors.primary, borderWidth: 1.5 },
                      workout && !isToday && { backgroundColor: colors.surface, opacity: 0.5 },
                      workout && isToday && { backgroundColor: colors.primary + '12' },
                      isCompleted && { backgroundColor: colors.success + '15' }
                    ]}
                    onPress={() => {
                      if (isToday) {
                        handleDayPress(day.key, workout);
                      } else {
                        Alert.alert('Día no permitido', 'Solo puedes entrenar el día de hoy');
                      }
                    }}
                    disabled={!isToday}
                  >
                    <View style={styles.dayPillHeader}>
                      <Text style={[styles.dayLabel, { 
                        color: isToday ? colors.primary : colors.text,
                        opacity: isToday ? 1 : 0.5
                      }]}>{day.label}</Text>
                      {isCompleted && <Ionicons name="checkmark-circle" size={16} color={colors.success} />}
                    </View>
                    <Text style={[styles.daySub, { 
                      color: colors.textSecondary,
                      opacity: isToday ? 1 : 0.5
                    }]} numberOfLines={2}>
                      {getDaySubtitle(isCompleted, workout)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* All Routines Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tus rutinas ({routinesSafe.length})</Text>
          {routinesSafe.length === 0 ? (
            <Card style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No hay rutinas</Text>
              <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>Crea una rutina o activa la que viene en Supabase</Text>
              <Button title="Crear rutina" onPress={handleCreateRoutinePress} style={styles.createButton} />
            </Card>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4, gap: 12 }}>
              {routinesSafe.map((routine: WeeklyRoutine) => {
                const totalExercises = Object.values(routine.weeklyPlan).reduce((total, day) => total + ((day as DayWorkout | undefined)?.exercises?.length || 0), 0);
                return (
                  <Card key={routine.id} style={[styles.routineCardWide, { width: width * 0.78 }]}> 
                    <View style={styles.routineHeaderRow}>
                      <View style={styles.routineTag}>
                        <Ionicons name="barbell-outline" size={14} color={colors.primary} />
                        <Text style={[styles.routineTagText, { color: colors.primary }]}>{totalExercises} ej.</Text>
                      </View>
                      {routine.isActive ? (
                        <View style={[styles.activePill, { backgroundColor: colors.success + '20' }]}>
                          <Ionicons name="checkmark" size={14} color={colors.success} />
                          <Text style={[styles.activePillText, { color: colors.success }]}>Activa</Text>
                        </View>
                      ) : (
                        <TouchableOpacity style={[styles.activateBtn, { borderColor: colors.primary }]} onPress={() => handleSetActiveRoutine(routine.id)}>
                          <Ionicons name="play" size={14} color={colors.primary} />
                          <Text style={[styles.activateText, { color: colors.primary }]}>Activar</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={[styles.routineTitle, { color: colors.text }]} numberOfLines={1}>{routine.name}</Text>
                    <Text style={[styles.routineSub, { color: colors.textSecondary }]} numberOfLines={2}>{routine.description || 'Enfoque semanal'}</Text>
                    <View style={styles.routineChipsRow}>
                      {weekDays.slice(0,3).map(d => (
                        <View key={d.key} style={[styles.chip, { backgroundColor: colors.background }]}> 
                          <Text style={[styles.chipText, { color: colors.textSecondary }]}>{d.short}</Text>
                        </View>
                      ))}
                      <Text style={[styles.moreText, { color: colors.textSecondary }]}>+{Math.max(0, Object.keys(routine.weeklyPlan).length - 3)}</Text>
                    </View>
                    <View style={styles.cardFooterRow}>
                      <TouchableOpacity onPress={() => navigation.navigate('EditRoutine' as never, { routineId: routine.id } as never)}>
                        <Text style={[styles.linkText, { color: colors.primary }]}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteRoutine(routine.id)}>
                        <Text style={[styles.linkText, { color: colors.error }]}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroCard: {
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF10',
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStatText: {
    fontSize: 13,
  },
  todayCard: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  todayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  todayIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayInfo: { flex: 1 },
  todayLabel: { fontSize: 12, fontWeight: '600' },
  todayName: { fontSize: 16, fontWeight: '700' },
  todayMeta: { fontSize: 13 },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  completedText: { fontSize: 12, fontWeight: '600' },
  weekRow: { paddingRight: 16, gap: 10 },
  dayPill: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  dayPillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayLabel: { fontSize: 14, fontWeight: '700' },
  daySub: { fontSize: 12 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: { marginTop: 4 },
  routineCardWide: {
    padding: 14,
    borderRadius: 14,
    gap: 6,
  },
  routineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF10',
  },
  routineTagText: { fontSize: 12, fontWeight: '600' },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  activePillText: { fontSize: 12, fontWeight: '700' },
  activateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  activateText: { fontSize: 12, fontWeight: '700' },
  routineTitle: { fontSize: 18, fontWeight: '800' },
  routineSub: { fontSize: 13, lineHeight: 18 },
  routineChipsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10 },
  chipText: { fontSize: 12, fontWeight: '600' },
  moreText: { fontSize: 12, fontWeight: '600' },
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  linkText: { fontSize: 13, fontWeight: '700' },
  routinesList: {},
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkoutsScreen;