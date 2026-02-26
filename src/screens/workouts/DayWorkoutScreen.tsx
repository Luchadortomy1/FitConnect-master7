import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { DayWorkout, DayExercise } from '@/types';
import { routinesApi } from '@/api/routines';
import { getExerciseImageSource, buildYoutubeSearchUrl, slugifyExercise } from '@/utils/exerciseMedia';
import { fetchExerciseImage } from '@/api/exerciseMediaApi';

interface RouteParams {
  dayWorkout: DayWorkout;
  dayName: string;
  routineId: string;
  dayKey: WeekDay;
}

type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const DayWorkoutScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { dayWorkout, dayName, routineId, dayKey } = route.params as RouteParams;
  
  const [workout, setWorkout] = useState<DayWorkout>(dayWorkout);
  const [isTrainingMode, setIsTrainingMode] = useState(false);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempExercise, setTempExercise] = useState<DayExercise | null>(null);
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [trainingStartTime, setTrainingStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [remoteMedia, setRemoteMedia] = useState<Record<string, string | null>>({});
  const [remoteLoading, setRemoteLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize completed sets tracking
    const initialSets: Record<string, boolean[]> = {};
    workout.exercises.forEach((exercise: DayExercise) => {
      initialSets[exercise.id] = new Array(exercise.sets).fill(false);
    });
    setCompletedSets(initialSets);
  }, [workout]);

  // Timer effect - actualizar tiempo transcurrido cada segundo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTrainingMode && trainingStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const time = Math.floor((now.getTime() - trainingStartTime.getTime()) / 1000);
        setElapsedTime(time);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTrainingMode, trainingStartTime]);

  // Reload routine data when screen is focused (after adding exercises)
  useFocusEffect(
    React.useCallback(() => {
      const loadUpdatedRoutine = async () => {
        try {
          const updatedRoutine = await routinesApi.getRoutineById(routineId);
          if (updatedRoutine && updatedRoutine.weeklyPlan[dayKey]) {
            const updatedDayWorkout = updatedRoutine.weeklyPlan[dayKey];
            setWorkout(updatedDayWorkout);
          }
        } catch (error) {
          console.error('Error loading updated routine:', error);
        }
      };

      loadUpdatedRoutine();
    }, [routineId, dayKey])
  );

  const handleStartTraining = () => {
    setIsTrainingMode(true);
    setTrainingStartTime(new Date());
    Alert.alert(
      'Entrenamiento iniciado',
      'Marca cada serie como completada cuando termines'
    );
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getProgressStats = () => {
    const totalSets = workout.exercises.reduce((total: number, ex: DayExercise) => total + ex.sets, 0);
    const completedSetsCount = Object.values(completedSets).flat().filter(Boolean).length;
    const completionRate = totalSets > 0 ? Math.round((completedSetsCount / totalSets) * 100) : 0;
    
    const completedExercises = workout.exercises.filter((ex: DayExercise) => {
      const sets = completedSets[ex.id] || [];
      return sets.every((completed: boolean) => completed);
    }).length;

    return {
      totalSets,
      completedSetsCount,
      completionRate,
      completedExercises,
      totalExercises: workout.exercises.length
    };
  };

  const handleFinishTraining = () => {
    const stats = getProgressStats();

    navigation.navigate('WorkoutSummary' as never, {
      dayName,
      dayWorkout: workout,
      completedSets,
      elapsedTime,
      routineId,
      dayKey
    } as never);
  };

  const toggleSetCompleted = (exerciseId: string, setIndex: number) => {
    setCompletedSets((prev: Record<string, boolean[]>) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((completed: boolean, idx: number) => 
        idx === setIndex ? !completed : completed
      )
    }));
  };

  const handleEditExercise = (exercise: DayExercise) => {
    setTempExercise({ ...exercise });
    setEditingExercise(exercise.id);
    setEditModalVisible(true);
  };

  const saveExerciseEdit = async () => {
    if (!tempExercise) return;

    try {
      const updatedExercises = workout.exercises.map((ex: DayExercise) =>
        ex.id === tempExercise.id ? tempExercise : ex
      );
      
      const updatedWorkout = { ...workout, exercises: updatedExercises };
      setWorkout(updatedWorkout);
      
      // Here you would typically save to the backend
      Alert.alert('Éxito', 'Ejercicio actualizado correctamente');
      setEditModalVisible(false);
      setEditingExercise(null);
      setTempExercise(null);
    } catch (error) {
      console.error('Error updating exercise:', error);
      Alert.alert('Error', 'No se pudo actualizar el ejercicio');
    }
  };

  const handleDeleteExercise = (exerciseId: string) => {
    Alert.alert(
      'Eliminar Ejercicio',
      '¿Estás seguro de que quieres eliminar este ejercicio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            const updatedExercises = workout.exercises.filter((ex: DayExercise) => ex.id !== exerciseId);
            setWorkout({ ...workout, exercises: updatedExercises });
            
            // Remove from completed sets
            const newCompletedSets = { ...completedSets };
            delete newCompletedSets[exerciseId];
            setCompletedSets(newCompletedSets);
          }
        },
      ]
    );
  };

  const toggleExerciseExpanded = (exerciseId: string) => {
    setExpandedExerciseId(prev => (prev === exerciseId ? null : exerciseId));
  };

  useEffect(() => {
    const loadRemoteMedia = async () => {
      if (!expandedExerciseId) return;
      const exercise = workout.exercises.find(ex => ex.id === expandedExerciseId);
      if (!exercise) return;
      // If there is a local image, skip remote fetch
      const hasLocal = Boolean(getExerciseImageSource(exercise.name));
      if (hasLocal) return;

      const slug = slugifyExercise(exercise.name);
      if (remoteMedia.hasOwnProperty(slug)) return;

      setRemoteLoading(prev => ({ ...prev, [slug]: true }));
      const imgUrl = await fetchExerciseImage(exercise.name);
      setRemoteMedia(prev => ({ ...prev, [slug]: imgUrl }));
      setRemoteLoading(prev => ({ ...prev, [slug]: false }));
    };

    loadRemoteMedia();
  }, [expandedExerciseId, workout.exercises, remoteMedia]);

  const getMuscleGroupColor = (muscle: string): string => {
    const lowerMuscle = muscle.toLowerCase();
    if (lowerMuscle.includes('pecho')) return colors.error;
    if (lowerMuscle.includes('espalda')) return colors.info;
    if (lowerMuscle.includes('pierna') || lowerMuscle.includes('cuádriceps') || lowerMuscle.includes('femorales')) return colors.warning;
    if (lowerMuscle.includes('hombro')) return colors.secondary;
    if (lowerMuscle.includes('bíceps') || lowerMuscle.includes('tríceps')) return colors.success;
    return colors.primary;
  };

  const renderExercise = (exercise: DayExercise, index: number) => {
    const exerciseSets = completedSets[exercise.id] || [];
    const completedCount = exerciseSets.filter(Boolean).length;
    const isExpanded = expandedExerciseId === exercise.id;
    const imageSource = getExerciseImageSource(exercise.name);
    const slug = slugifyExercise(exercise.name);
    const remoteUrl = remoteMedia[slug];
    const isRemoteLoading = remoteLoading[slug];
    
    return (
      <Card key={exercise.id} style={[styles.exerciseCard, { overflow: 'hidden' as any }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => toggleExerciseExpanded(exercise.id)}
          style={styles.exerciseHeader}
        >
          <View style={styles.exerciseInfo}>
            <View style={styles.exerciseTitleRow}>
              <View style={[
                styles.muscleIndicator, 
                { backgroundColor: getMuscleGroupColor(exercise.muscle) }
              ]} />
              <Text style={[styles.exerciseName, { color: colors.text }]}>
                {exercise.name}
              </Text>
            </View>
            <Text style={[styles.exerciseMuscle, { color: colors.textSecondary }]}>
              {exercise.muscle}
            </Text>
            <View style={styles.exerciseDetails}>
              <Text style={[styles.exerciseDetail, { color: colors.textSecondary }]}>
                {exercise.sets} series × {exercise.reps} reps
              </Text>
              {exercise.weight && (
                <Text style={[styles.exerciseDetail, { color: colors.textSecondary }]}>
                  • {exercise.weight}kg
                </Text>
              )}
              {exercise.equipment && (
                <Text style={[styles.exerciseDetail, { color: colors.textSecondary }]}>
                  • {exercise.equipment}
                </Text>
              )}
            </View>
            {exercise.notes && (
              <Text style={[styles.exerciseNotes, { color: colors.textSecondary }]}>
                {exercise.notes}
              </Text>
            )}
          </View>
          
          {!isTrainingMode && (
            <View style={styles.exerciseActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.info + '20' }]}
                onPress={() => handleEditExercise(exercise)}
              >
                <Ionicons name="create-outline" size={16} color={colors.info} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                onPress={() => handleDeleteExercise(exercise.id)}
              >
                <Ionicons name="trash-outline" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.exerciseExtra}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.exerciseImage}
                resizeMode="cover"
              />
            ) : remoteUrl ? (
              <Image
                source={{ uri: remoteUrl }}
                style={styles.exerciseImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.imagePlaceholder, { borderColor: colors.surface, backgroundColor: colors.surface }]}>
                {isRemoteLoading ? (
                  <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>Buscando imagen...</Text>
                ) : (
                  <>
                    <Ionicons name="image-outline" size={20} color={colors.textSecondary} />
                    <Text style={[styles.imagePlaceholderText, { color: colors.textSecondary }]}>
                      Sin imagen disponible
                    </Text>
                  </>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.youtubeButton, { borderColor: colors.error }]}
              onPress={() => Linking.openURL(buildYoutubeSearchUrl(exercise.name))}
            >
              <Ionicons name="logo-youtube" size={18} color={colors.error} />
              <Text style={[styles.youtubeText, { color: colors.error }]}>Ver en YouTube</Text>
            </TouchableOpacity>
          </View>
        )}

        {isTrainingMode && (
          <View style={styles.setsContainer}>
            <Text style={[styles.setsTitle, { color: colors.text }]}>
              Series ({completedCount}/{exercise.sets})
            </Text>
            <View style={styles.setsGrid}>
              {Array.from({ length: exercise.sets }, (_, setIndex) => (
                <TouchableOpacity
                  key={setIndex}
                  style={[
                    styles.setButton,
                    { backgroundColor: colors.surface },
                    exerciseSets[setIndex] && { backgroundColor: colors.success }
                  ]}
                  onPress={() => toggleSetCompleted(exercise.id, setIndex)}
                >
                  <Text style={[
                    styles.setNumber,
                    { color: exerciseSets[setIndex] ? 'white' : colors.text }
                  ]}>
                    {setIndex + 1}
                  </Text>
                  {exerciseSets[setIndex] && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={dayName}
        showBack
        rightComponent={
          !isTrainingMode ? (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('AddExercise' as never, { 
                dayWorkout: workout, 
                routineId,
                dayKey
              } as never)}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Workout Info */}
        <View style={styles.section}>
          <Card style={styles.workoutInfoCard}>
            <View style={styles.workoutStats}>
              <View style={styles.statItem}>
                <Ionicons name="barbell-outline" size={20} color={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {workout.exercises.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Ejercicios
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {workout.estimatedDuration || 60}min
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Duración
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="layers-outline" size={20} color={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {workout.exercises.reduce((total: number, ex: DayExercise) => total + ex.sets, 0)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Series
                </Text>
              </View>
            </View>
            
            {workout.notes && (
              <Text style={[styles.workoutNotes, { color: colors.textSecondary }]}>
                {workout.notes}
              </Text>
            )}
          </Card>
        </View>
        {/* Training Progress - Only in Training Mode */}
        {isTrainingMode && (
          <View style={styles.section}>
            <Card style={[styles.progressCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary, borderWidth: 1 }]}>
              <View style={styles.progressHeader}>
                <View>
                  <Text style={[styles.progressTitle, { color: colors.text }]}>
                    Progreso del Entrenamiento
                  </Text>
                  <Text style={[styles.progressSubtitle, { color: colors.textSecondary }]}>
                    {getProgressStats().completedSetsCount} / {getProgressStats().totalSets} series completadas
                  </Text>
                </View>
                <View style={[styles.timerBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="time" size={14} color="white" />
                  <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={[styles.progressBarContainer, { backgroundColor: colors.surface }]}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${getProgressStats().completionRate}%`,
                      backgroundColor: getProgressStats().completionRate === 100 ? colors.success : colors.primary
                    }
                  ]} 
                />
              </View>

              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <Text style={[styles.progressStatValue, { color: colors.text }]}>
                    {getProgressStats().completedExercises}/{getProgressStats().totalExercises}
                  </Text>
                  <Text style={[styles.progressStatLabel, { color: colors.textSecondary }]}>
                    Ejercicios
                  </Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={[styles.progressStatValue, { color: colors.text }]}>
                    {getProgressStats().completionRate}%
                  </Text>
                  <Text style={[styles.progressStatLabel, { color: colors.textSecondary }]}>
                    Completado
                  </Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={[styles.progressStatValue, { color: colors.text }]}>
                    {Math.max(0, getProgressStats().totalSets - getProgressStats().completedSetsCount)}
                  </Text>
                  <Text style={[styles.progressStatLabel, { color: colors.textSecondary }]}>
                    Pendientes
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}
        {/* Exercises */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ejercicios
          </Text>
          
          {workout.exercises.length === 0 ? (
            <Card style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No hay ejercicios
              </Text>
              <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                Agrega ejercicios para crear tu rutina de entrenamiento
              </Text>
              <Button
                title="Agregar Ejercicio"
                onPress={() => navigation.navigate('AddExercise' as never, { 
                  dayWorkout: workout, 
                  routineId,
                  dayKey
                } as never)}
                style={styles.addExerciseButton}
              />
            </Card>
          ) : (
            <View style={styles.exercisesList}>
              {workout.exercises.map((exercise: DayExercise, index: number) => renderExercise(exercise, index))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Training Controls */}
      {workout.exercises.length > 0 && (
        <View style={[styles.trainingControls, { backgroundColor: colors.surface }]}>
          {!isTrainingMode ? (
            <Button
              title="Comenzar Entrenamiento"
              onPress={handleStartTraining}
              style={styles.trainingButton}
              icon={<Ionicons name="play" size={16} color="white" />}
            />
          ) : (
            <View style={styles.trainingButtonsRow}>
              <Button
                title="Pausar"
                onPress={() => setIsTrainingMode(false)}
                style={[styles.trainingButton, { backgroundColor: colors.warning }]}
                icon={<Ionicons name="pause" size={16} color="white" />}
              />
              <Button
                title="Finalizar"
                onPress={handleFinishTraining}
                style={[styles.trainingButton, { backgroundColor: colors.success }]}
                icon={<Ionicons name="checkmark" size={16} color="white" />}
              />
            </View>
          )}
        </View>
      )}

      {/* Edit Exercise Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <Header
            title="Editar Ejercicio"
            showBack={false}
            rightComponent={
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={[styles.cancelText, { color: colors.primary }]}>Cancelar</Text>
              </TouchableOpacity>
            }
          />
          
          {tempExercise && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Nombre del Ejercicio</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={tempExercise.name}
                  onChangeText={(text: string) => setTempExercise({ ...tempExercise, name: text })}
                  placeholder="Nombre del ejercicio"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Grupo Muscular</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={tempExercise.muscle}
                  onChangeText={(text: string) => setTempExercise({ ...tempExercise, muscle: text })}
                  placeholder="Grupo muscular"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Series</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                    value={tempExercise.sets.toString()}
                    onChangeText={(text: string) => setTempExercise({ ...tempExercise, sets: Number.parseInt(text) || 0 })}
                    placeholder="Series"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.inputHalf}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Repeticiones</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                    value={tempExercise.reps}
                    onChangeText={(text: string) => setTempExercise({ ...tempExercise, reps: text })}
                    placeholder="8-12"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Peso (kg)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                    value={tempExercise.weight?.toString() || ''}
                    onChangeText={(text: string) => setTempExercise({ ...tempExercise, weight: Number.parseFloat(text) || undefined })}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.inputHalf}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Equipamiento</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                    value={tempExercise.equipment || ''}
                    onChangeText={(text: string) => setTempExercise({ ...tempExercise, equipment: text })}
                    placeholder="Barra, mancuernas..."
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Notas (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
                  value={tempExercise.notes || ''}
                  onChangeText={(text: string) => setTempExercise({ ...tempExercise, notes: text })}
                  placeholder="Notas sobre el ejercicio..."
                  multiline
                  numberOfLines={3}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.modalButtons}>
                <Button
                  title="Guardar Cambios"
                  onPress={saveExerciseEdit}
                  style={styles.saveButton}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
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
  workoutInfoCard: {
    marginBottom: 8,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  workoutNotes: {
    marginTop: 12,
    fontSize: 14,
    fontStyle: 'italic',
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    // Card styles already applied
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  muscleIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  exerciseMuscle: {
    fontSize: 12,
    marginLeft: 16,
    marginBottom: 8,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 16,
  },
  exerciseDetail: {
    fontSize: 12,
    marginRight: 8,
  },
  exerciseNotes: {
    fontSize: 12,
    marginLeft: 16,
    marginTop: 4,
    fontStyle: 'italic',
  },
  exerciseExtra: {
    marginTop: 12,
    gap: 12,
  },
  exerciseImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  imagePlaceholder: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 12,
  },
  youtubeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 12,
  },
  youtubeText: {
    fontWeight: '600',
  },
  exerciseActions: {
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
  setsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  setsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  setsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  setButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressCard: {
    paddingVertical: 16,
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 13,
  },
  timerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 11,
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
  addExerciseButton: {
    marginTop: 8,
  },
  trainingControls: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  trainingButton: {
    marginBottom: 0,
  },
  trainingButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  cancelText: {
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    paddingVertical: 20,
  },
  saveButton: {
    marginBottom: 0,
  },
});

export default DayWorkoutScreen;