import React, { useState, useEffect } from 'react';
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
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { WeeklyRoutine, DayWorkout, WeekDay } from '@/types';
import { routinesApi } from '@/api/routines';

const { width } = Dimensions.get('window');

const WorkoutsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [routines, setRoutines] = useState<WeeklyRoutine[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<WeeklyRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      setRoutines(routinesData);
      setActiveRoutine(activeRoutineData);
    } catch (error) {
      console.error('Error loading routines:', error);
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
          onPress: async () => {
            try {
              await routinesApi.deleteRoutine(routineId);
              await loadData();
              Alert.alert('Éxito', 'Rutina eliminada correctamente');
            } catch (error) {
              console.error('Error deleting routine:', error);
              Alert.alert('Error', 'No se pudo eliminar la rutina');
            }
          }
        },
      ]
    );
  };

  const handleDayPress = (day: WeekDay, workout?: DayWorkout) => {
    if (!activeRoutine) {
      Alert.alert('Sin rutina activa', 'Primero activa una rutina para poder entrenar');
      return;
    }

    if (workout) {
      navigation.navigate('DayWorkout' as never, { 
        dayWorkout: workout, 
        dayName: weekDays.find(d => d.key === day)?.label || day,
        routineId: activeRoutine.id
      } as never);
    } else {
      navigation.navigate('CreateDayWorkout' as never, { 
        day, 
        routineId: activeRoutine.id 
      } as never);
    }
  };

  const getMuscleGroupIcon = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('pecho') || lowerName.includes('chest')) return 'body-outline';
    if (lowerName.includes('espalda') || lowerName.includes('back')) return 'chevron-back-outline';
    if (lowerName.includes('pierna') || lowerName.includes('leg')) return 'walk-outline';
    if (lowerName.includes('hombro') || lowerName.includes('shoulder')) return 'triangle-outline';
    if (lowerName.includes('brazo') || lowerName.includes('arm') || lowerName.includes('bíceps') || lowerName.includes('tríceps')) return 'hand-right-outline';
    if (lowerName.includes('push')) return 'arrow-up-outline';
    if (lowerName.includes('pull')) return 'arrow-down-outline';
    if (lowerName.includes('upper')) return 'chevron-up-outline';
    if (lowerName.includes('lower')) return 'chevron-down-outline';
    return 'fitness-outline';
  };

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
        title="Rutinas de Entrenamiento"
        rightComponent={
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateRoutine' as never)}
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
        {/* Active Routine Section */}
        {activeRoutine && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Rutina Activa
            </Text>
            <Card style={styles.activeRoutineCard}>
              <View style={styles.routineHeader}>
                <View style={styles.routineInfo}>
                  <Text style={[styles.routineName, { color: colors.text }]}>
                    {activeRoutine.name}
                  </Text>
                  <Text style={[styles.routineDescription, { color: colors.textSecondary }]}>
                    {activeRoutine.description}
                  </Text>
                </View>
                <View style={[styles.activeIndicator, { backgroundColor: colors.success }]}>
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              </View>

              {/* Weekly Calendar */}
              <View style={styles.weeklyCalendar}>
                <Text style={[styles.calendarTitle, { color: colors.text }]}>
                  Esta Semana
                </Text>
                <View style={styles.weekDays}>
                  {weekDays.map(day => {
                    const workout = activeRoutine.weeklyPlan[day.key];
                    const isToday = getCurrentDay() === day.key;
                    
                    return (
                      <TouchableOpacity
                        key={day.key}
                        style={[
                          styles.dayCard,
                          { backgroundColor: colors.surface },
                          isToday && { backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 2 },
                          workout && { backgroundColor: colors.success + '20' }
                        ]}
                        onPress={() => handleDayPress(day.key, workout)}
                      >
                        <Text style={[
                          styles.dayShort, 
                          { color: isToday ? colors.primary : colors.text }
                        ]}>
                          {day.short}
                        </Text>
                        {workout ? (
                          <View style={styles.workoutIndicator}>
                            <Ionicons 
                              name={getMuscleGroupIcon(workout.name)} 
                              size={20} 
                              color={colors.primary} 
                            />
                            <Text 
                              style={[styles.exerciseCount, { color: colors.textSecondary }]}
                              numberOfLines={1}
                            >
                              {workout.exercises.length}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.emptyDay}>
                            <Ionicons name="add-circle-outline" size={20} color={colors.textSecondary} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* All Routines Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Todas las Rutinas ({routines.length})
          </Text>
          
          {routines.length === 0 ? (
            <Card style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No hay rutinas creadas
              </Text>
              <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                Crea tu primera rutina semanal para organizar tus entrenamientos
              </Text>
              <Button
                title="Crear Primera Rutina"
                onPress={() => navigation.navigate('CreateRoutine' as never)}
                style={styles.createButton}
              />
            </Card>
          ) : (
            <View style={styles.routinesList}>
              {routines.map((routine: WeeklyRoutine) => (
                <Card key={routine.id} style={styles.routineCard}>
                  <View style={styles.routineHeader}>
                    <View style={styles.routineInfo}>
                      <Text style={[styles.routineName, { color: colors.text }]}>
                        {routine.name}
                      </Text>
                      <Text style={[styles.routineDescription, { color: colors.textSecondary }]}>
                        {routine.description}
                      </Text>
                      <View style={styles.routineStats}>
                        <View style={styles.statItem}>
                          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                          <Text style={[styles.statText, { color: colors.textSecondary }]}>
                            {Object.keys(routine.weeklyPlan).length} días
                          </Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="barbell-outline" size={16} color={colors.textSecondary} />
                          <Text style={[styles.statText, { color: colors.textSecondary }]}>
                            {Object.values(routine.weeklyPlan).reduce((total, day) => {
                              const dayWorkout = day as DayWorkout | undefined;
                              return total + (dayWorkout?.exercises?.length || 0);
                            }, 0)} ejercicios
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.routineActions}>
                      {routine.isActive ? (
                        <View style={[styles.activeIndicator, { backgroundColor: colors.success }]}>
                          <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                          onPress={() => handleSetActiveRoutine(routine.id)}
                        >
                          <Ionicons name="play" size={16} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.textSecondary + '20' }]}
                        onPress={() => navigation.navigate('EditRoutine' as never, { routineId: routine.id } as never)}
                      >
                        <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                        onPress={() => handleDeleteRoutine(routine.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  activeRoutineCard: {
    marginBottom: 8,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  routineDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  routineStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  activeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weeklyCalendar: {
    marginTop: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCard: {
    width: (width - 64) / 7,
    aspectRatio: 1,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayShort: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutIndicator: {
    alignItems: 'center',
  },
  exerciseCount: {
    fontSize: 10,
    marginTop: 2,
  },
  emptyDay: {
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createButton: {
    marginTop: 8,
  },
  routinesList: {
    gap: 12,
  },
  routineCard: {
    // Card styles already applied by Card component
  },
  routineActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WorkoutsScreen;