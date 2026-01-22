import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { DayWorkout, DayExercise } from '@/types';
import { routinesApi, exercisesDatabase } from '@/api/routines';

interface RouteParams {
  dayWorkout: DayWorkout;
  routineId: string;
}

const SeparatorComponent = () => <View style={styles.separator} />;

const AddExerciseScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { dayWorkout } = route.params as RouteParams;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [filteredExercises, setFilteredExercises] = useState(exercisesDatabase);
  const [customExercise, setCustomExercise] = useState<Partial<DayExercise>>({
    name: '',
    muscle: '',
    sets: 3,
    reps: '10-12',
    weight: undefined,
    equipment: '',
    notes: '',
  });
  const [showCustomForm, setShowCustomForm] = useState(false);

  const muscleGroups = [
    { key: 'all', label: 'Todos' },
    { key: 'Pecho', label: 'Pecho' },
    { key: 'Espalda', label: 'Espalda' },
    { key: 'Hombros', label: 'Hombros' },
    { key: 'Bíceps', label: 'Bíceps' },
    { key: 'Tríceps', label: 'Tríceps' },
    { key: 'Cuádriceps', label: 'Cuádriceps' },
    { key: 'Femorales', label: 'Femorales' },
    { key: 'Glúteos', label: 'Glúteos' },
    { key: 'Pantorrillas', label: 'Pantorrillas' },
    { key: 'Core', label: 'Core' },
  ];

  useEffect(() => {
    filterExercises();
  }, [searchQuery, selectedMuscle]);

  const filterExercises = async () => {
    try {
      const filtered = await routinesApi.searchExercises(searchQuery, selectedMuscle);
      setFilteredExercises(filtered);
    } catch (error) {
      console.error('Error filtering exercises:', error);
    }
  };

  const addExerciseFromDatabase = (exercise: typeof exercisesDatabase[0]) => {
    // Here you would typically save to the routine
    Alert.alert(
      'Ejercicio agregado',
      `${exercise.name} ha sido agregado a tu rutina`,
      [
        { text: 'Agregar otro', style: 'default' },
        { 
          text: 'Ver rutina', 
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const addCustomExercise = () => {
    if (!customExercise.name?.trim() || !customExercise.muscle?.trim()) {
      Alert.alert('Error', 'Ingresa al menos el nombre y grupo muscular del ejercicio');
      return;
    }

    const newExercise: DayExercise = {
      id: `custom-${Date.now()}-${Math.random()}`,
      name: customExercise.name.trim(),
      muscle: customExercise.muscle.trim(),
      sets: customExercise.sets || 3,
      reps: customExercise.reps || '10-12',
      weight: customExercise.weight,
      equipment: customExercise.equipment?.trim(),
      notes: customExercise.notes?.trim(),
    };

    // Here you would typically save to the routine
    Alert.alert(
      'Ejercicio personalizado agregado',
      `${newExercise.name} ha sido agregado a tu rutina`,
      [
        { text: 'Agregar otro', onPress: () => {
          setCustomExercise({
            name: '',
            muscle: '',
            sets: 3,
            reps: '10-12',
            weight: undefined,
            equipment: '',
            notes: '',
          });
        }},
        { 
          text: 'Ver rutina', 
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const getMuscleGroupColor = (muscle: string): string => {
    const lowerMuscle = muscle.toLowerCase();
    if (lowerMuscle.includes('pecho')) return colors.error;
    if (lowerMuscle.includes('espalda')) return colors.info;
    if (lowerMuscle.includes('pierna') || lowerMuscle.includes('cuádriceps') || lowerMuscle.includes('femorales')) return colors.warning;
    if (lowerMuscle.includes('hombro')) return colors.secondary;
    if (lowerMuscle.includes('bíceps') || lowerMuscle.includes('tríceps')) return colors.success;
    return colors.primary;
  };

  const renderExerciseItem = ({ item }: { item: typeof exercisesDatabase[0] }) => (
    <Card style={styles.exerciseCard}>
      <TouchableOpacity
        style={styles.exerciseContent}
        onPress={() => addExerciseFromDatabase(item)}
      >
        <View style={styles.exerciseInfo}>
          <View style={styles.exerciseHeader}>
            <View style={[
              styles.muscleIndicator,
              { backgroundColor: getMuscleGroupColor(item.muscle) }
            ]} />
            <Text style={[styles.exerciseName, { color: colors.text }]}>
              {item.name}
            </Text>
          </View>
          <Text style={[styles.exerciseMuscle, { color: colors.textSecondary }]}>
            {item.muscle}
          </Text>
          {Boolean(item.equipment) && (
            <Text style={[styles.exerciseEquipment, { color: colors.textSecondary }]}>
              {item.equipment}
            </Text>
          )}
        </View>
        <Ionicons name="add-circle" size={24} color={colors.primary} />
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header 
        title={`Agregar Ejercicio`}
        subtitle={dayWorkout.name}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            showCustomForm === false && { backgroundColor: colors.primary }
          ]}
          onPress={() => setShowCustomForm(false)}
        >
          <Text style={[
            styles.tabText,
            { color: showCustomForm === false ? 'white' : colors.textSecondary }
          ]}>
            Base de Datos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            showCustomForm && { backgroundColor: colors.primary }
          ]}
          onPress={() => setShowCustomForm(true)}
        >
          <Text style={[
            styles.tabText,
            { color: showCustomForm ? 'white' : colors.textSecondary }
          ]}>
            Personalizado
          </Text>
        </TouchableOpacity>
      </View>

      {showCustomForm === false ? (
        // Database Exercises
        <View style={styles.content}>
          {/* Search and Filters */}
          <View style={styles.filtersContainer}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar ejercicios..."
                placeholderTextColor={colors.textSecondary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.muscleFilters}
            >
              {muscleGroups.map(muscle => (
                <TouchableOpacity
                  key={muscle.key}
                  style={[
                    styles.muscleFilter,
                    { backgroundColor: colors.surface },
                    selectedMuscle === muscle.key && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setSelectedMuscle(muscle.key)}
                >
                  <Text style={[
                    styles.muscleFilterText,
                    { color: selectedMuscle === muscle.key ? 'white' : colors.text }
                  ]}>
                    {muscle.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Results */}
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
              {filteredExercises.length} ejercicios encontrados
            </Text>
          </View>

          {/* Exercises List */}
          <FlatList
            data={filteredExercises}
            renderItem={renderExerciseItem}
            keyExtractor={(item) => item.id}
            style={styles.exercisesList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={SeparatorComponent}
            ListEmptyComponent={
              <Card style={styles.emptyState}>
                <Ionicons name="search" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No se encontraron ejercicios
                </Text>
                <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                  Intenta con otros términos de búsqueda o crea un ejercicio personalizado
                </Text>
              </Card>
            }
          />
        </View>
      ) : (
        // Custom Exercise Form
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.formCard}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              Crear Ejercicio Personalizado
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Nombre del Ejercicio *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={customExercise.name}
                onChangeText={(text: string) => setCustomExercise({ ...customExercise, name: text })}
                placeholder="Ej: Press de banca inclinado"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Grupo Muscular *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={customExercise.muscle}
                onChangeText={(text: string) => setCustomExercise({ ...customExercise, muscle: text })}
                placeholder="Ej: Pecho"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Series</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={customExercise.sets?.toString()}
                  onChangeText={(text: string) => setCustomExercise({ ...customExercise, sets: Number.parseInt(text) || 3 })}
                  placeholder="3"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputHalf}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Repeticiones</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={customExercise.reps}
                  onChangeText={(text: string) => setCustomExercise({ ...customExercise, reps: text })}
                  placeholder="10-12"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Peso (kg)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={customExercise.weight?.toString() || ''}
                  onChangeText={(text: string) => setCustomExercise({ ...customExercise, weight: Number.parseFloat(text) || undefined })}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputHalf}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Equipamiento</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={customExercise.equipment}
                  onChangeText={(text: string) => setCustomExercise({ ...customExercise, equipment: text })}
                  placeholder="Barra, mancuernas..."
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Notas (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
                value={customExercise.notes}
                onChangeText={(text: string) => setCustomExercise({ ...customExercise, notes: text })}
                placeholder="Técnica, consejos, etc..."
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <Button
              title="Agregar Ejercicio Personalizado"
              onPress={addCustomExercise}
              disabled={!customExercise.name?.trim() || !customExercise.muscle?.trim()}
            />
          </Card>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    margin: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 16,
  },
  muscleFilters: {
    flexDirection: 'row',
  },
  muscleFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  muscleFilterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultsContainer: {
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 14,
  },
  exercisesList: {
    flex: 1,
  },
  exerciseCard: {
    marginBottom: 8,
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseHeader: {
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
    marginBottom: 2,
  },
  exerciseEquipment: {
    fontSize: 12,
    marginLeft: 16,
    fontStyle: 'italic',
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
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
    lineHeight: 20,
  },
  formCard: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
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
});

export default AddExerciseScreen;