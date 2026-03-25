import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal as RNModal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { WeeklyRoutine, WeekDay } from '@/types';
import { routinesApi } from '@/api/routines';
import { getTemplateById, getTemplatesByGoal } from '@/utils/workoutTemplates';
import { useAuth } from '@/contexts/AuthContext';
import { userSubscriptionsApi } from '@/api';

// Funciones helper para etiquetas
const getGoalLabel = (goal: string): string => {
  const labels: Record<string, string> = {
    lose_weight: 'Perder Peso',
    gain_muscle: 'Ganar Músculo',
    maintain: 'Mantener Forma',
    endurance: 'Resistencia',
  };
  return labels[goal] || goal;
};

const getDifficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };
  return labels[difficulty] || difficulty;
};

const CreateRoutineScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [routineName, setRoutineName] = useState('');
  const [routineDescription, setRoutineDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState<Set<WeekDay>>(new Set());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [dialog, setDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    primary?: { label: string; onPress: () => void };
    secondary?: { label: string; onPress: () => void };
  }>({ visible: false, title: '', message: '' });

  const showDialog = (
    title: string,
    message: string,
    options?: {
      primary?: { label: string; onPress: () => void };
      secondary?: { label: string; onPress: () => void };
    }
  ) => {
    setDialog({ visible: true, title, message, ...options });
  };

  const availableTemplates = user?.goal ? getTemplatesByGoal(user.goal) : [];

  const weekDays: { key: WeekDay; label: string; short: string }[] = [
    { key: 'monday', label: 'Lunes', short: 'L' },
    { key: 'tuesday', label: 'Martes', short: 'M' },
    { key: 'wednesday', label: 'Miércoles', short: 'M' },
    { key: 'thursday', label: 'Jueves', short: 'J' },
    { key: 'friday', label: 'Viernes', short: 'V' },
    { key: 'saturday', label: 'Sábado', short: 'S' },
    { key: 'sunday', label: 'Domingo', short: 'D' },
  ];

  const toggleDaySelection = (day: WeekDay) => {
    const newSelectedDays = new Set(selectedDays);
    if (newSelectedDays.has(day)) {
      newSelectedDays.delete(day);
    } else {
      newSelectedDays.add(day);
    }
    setSelectedDays(newSelectedDays);

    if (selectedTemplateId) {
      const template = getTemplateById(selectedTemplateId);
      if (template) {
        const templateDays = new Set(template.days);
        if (newSelectedDays.size !== templateDays.size || ![...newSelectedDays].every(d => templateDays.has(d))) {
          setSelectedTemplateId(null);
        }
      }
    }
  };

  const selectTemplate = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (!template) return;

    setSelectedTemplateId(templateId);
    setRoutineName(template.name);
    setRoutineDescription(template.description);
    setSelectedDays(new Set(template.days));
  };

  const createRoutine = async () => {
    const activeSubscriptions = await userSubscriptionsApi.getUserAllActiveSubscriptions();
    if (activeSubscriptions.length === 0) {
      showDialog('Regístrate en un gimnasio', 'Debes suscribirte a un gimnasio antes de crear una rutina.', {
        primary: {
          label: 'Ver gimnasios',
          onPress: () => {
            setDialog(prev => ({ ...prev, visible: false }));
            navigation.navigate('Gyms' as never);
          },
        },
        secondary: {
          label: 'Cancelar',
          onPress: () => setDialog(prev => ({ ...prev, visible: false })),
        },
      });
      return;
    }

    if (!routineName.trim()) {
      showDialog('Nombre requerido', 'Por favor ingresa un nombre para la rutina.', {
        primary: { label: 'Entendido', onPress: () => setDialog(prev => ({ ...prev, visible: false })) },
      });
      return;
    }

    if (selectedDays.size === 0) {
      showDialog('Selecciona días', 'Elige al menos un día de entrenamiento para crear tu rutina.', {
        primary: { label: 'OK', onPress: () => setDialog(prev => ({ ...prev, visible: false })) },
      });
      return;
    }

    setIsCreating(true);

    try {
      const weeklyPlan: Partial<WeeklyRoutine['weeklyPlan']> = {};

      if (selectedTemplateId) {
        const template = getTemplateById(selectedTemplateId);
        if (template) {
          for (const day of selectedDays) {
            const templateDay = template.workouts[day];
            if (templateDay) {
              weeklyPlan[day] = {
                id: `day-${Date.now()}-${day}`,
                name: templateDay.name,
                exercises: templateDay.exercises,
                estimatedDuration: 60,
              };
            }
          }
        }
      } else {
        for (const day of selectedDays) {
          const dayLabel = weekDays.find(d => d.key === day)?.label || day;
          weeklyPlan[day] = {
            id: `day-${Date.now()}-${day}`,
            name: `Entrenamiento ${dayLabel}`,
            exercises: [],
            estimatedDuration: 60,
          };
        }
      }

      const newRoutine: Omit<WeeklyRoutine, 'id' | 'createdAt' | 'updatedAt'> = {
        name: routineName.trim(),
        description: routineDescription.trim() || undefined,
        weeklyPlan: weeklyPlan as WeeklyRoutine['weeklyPlan'],
        isActive: false,
      };

      await routinesApi.createRoutine(newRoutine);
      showDialog('Rutina creada', '¡Tu rutina se ha creado exitosamente! Ahora puedes agregar ejercicios.', {
        primary: {
          label: 'OK',
          onPress: () => {
            setDialog(prev => ({ ...prev, visible: false }));
            navigation.goBack();
          },
        },
      });
    } catch (error) {
      console.error('Error creating routine:', error);
      showDialog('Error', 'No se pudo crear la rutina. Inténtalo de nuevo.', {
        primary: { label: 'Entendido', onPress: () => setDialog(prev => ({ ...prev, visible: false })) },
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Crear Nueva Rutina"
        showBack
        rightAction={{
          icon: (
            <Text style={[styles.createText, { color: colors.primary }, isCreating && { color: colors.textSecondary }]}> 
              {isCreating ? 'Creando...' : 'Crear'}
            </Text>
          ),
          onPress: () => {
            void createRoutine();
          },
          accessibilityLabel: 'Crear rutina',
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Información Básica</Text>

          <Card style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Nombre de la Rutina *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={routineName}
                onChangeText={setRoutineName}
                placeholder="Ej: Mi rutina de fuerza"
                placeholderTextColor={colors.textSecondary}
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
                value={routineDescription}
                onChangeText={setRoutineDescription}
                placeholder="Describe tu rutina, objetivos, etc..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>
          </Card>
        </View>

        {/* Templates */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rutinas Recomendadas para Ti</Text>
          {user?.goal && (
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Rutinas diseñadas para tu objetivo: <Text style={{ fontWeight: '600', color: colors.primary }}>{getGoalLabel(user.goal)}</Text>
            </Text>
          )}

          {availableTemplates.length === 0 ? (
            <Card style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="information-circle-outline" size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay rutinas disponibles para tu objetivo actual.
              </Text>
              <Text style={[{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }]}>
                Por favor, actualiza tu objetivo en el perfil.
              </Text>
            </Card>
          ) : (
            <View style={styles.templatesList}>
              {availableTemplates.map(template => (
                <Card
                  key={template.id}
                  style={[styles.templateCard, selectedTemplateId === template.id && { borderWidth: 2, borderColor: colors.primary }]}
                >
                  <TouchableOpacity style={styles.templateContent} onPress={() => selectTemplate(template.id)}>
                    <View style={styles.templateInfo}>
                      <Text style={[styles.templateName, { color: colors.text }]}>{template.name}</Text>
                      <Text style={[styles.templateDescription, { color: colors.textSecondary }]}>{template.description}</Text>
                      <View style={styles.templateDays}>
                        <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.templateDaysText, { color: colors.textSecondary }]}>{template.days.length} días por semana</Text>
                      </View>
                      <View style={styles.templateDays}>
                        <Ionicons name="fitness-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.templateDaysText, { color: colors.textSecondary }]}>Nivel: {getDifficultyLabel(template.difficulty)}</Text>
                      </View>
                    </View>
                    {selectedTemplateId === template.id && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
                    {selectedTemplateId !== template.id && <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Day Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Días de Entrenamiento *</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Selecciona los días que entrenarás</Text>

          <Card style={styles.daysCard}>
            <View style={styles.daysList}>
              {weekDays.map(day => {
                const isSelected = selectedDays.has(day.key);
                return (
                  <TouchableOpacity
                    key={day.key}
                    style={[styles.dayButton, { backgroundColor: colors.surface }, isSelected && { backgroundColor: colors.primary }]}
                    onPress={() => toggleDaySelection(day.key)}
                  >
                    <Text style={[styles.dayShort, { color: isSelected ? 'white' : colors.text }]}>{day.short}</Text>
                    <Text style={[styles.dayLabel, { color: isSelected ? 'white' : colors.textSecondary }]}>{day.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </View>

        {/* Summary */}
        {selectedDays.size > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Resumen</Text>

            <Card style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Ionicons name="fitness-outline" size={20} color={colors.primary} />
                <Text style={[styles.summaryText, { color: colors.text }]}>{routineName || 'Nueva Rutina'}</Text>
              </View>

              <View style={styles.summaryItem}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={[styles.summaryText, { color: colors.text }]}>{selectedDays.size} días de entrenamiento</Text>
              </View>

              <View style={styles.summaryItem}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={[styles.summaryText, { color: colors.text }]}>Aproximadamente {selectedDays.size * 60} minutos por semana</Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomContainer, { backgroundColor: colors.surface }]}>
        <Button title="Crear Rutina" onPress={createRoutine} disabled={!routineName.trim() || selectedDays.size === 0 || isCreating} />
      </View>

      {/* Styled dialog */}
      <RNModal
        visible={dialog.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setDialog(prev => ({ ...prev, visible: false }))}
      >
        <View style={styles.dialogBackdrop}>
          <View style={[styles.dialogCard, { backgroundColor: colors.surface }]}>
            <View style={styles.dialogHeader}>
              <View style={[styles.dialogIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="information-circle" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.dialogTitle, { color: colors.text }]}>{dialog.title}</Text>
            </View>
            <Text style={[styles.dialogMessage, { color: colors.textSecondary }]}>{dialog.message}</Text>
            <View style={styles.dialogActions}>
              {dialog.secondary && (
                <TouchableOpacity
                  style={[styles.dialogButton, styles.dialogGhost]}
                  onPress={() => {
                    setDialog(prev => ({ ...prev, visible: false }));
                    dialog.secondary?.onPress?.();
                  }}
                >
                  <Text style={[styles.dialogGhostText, { color: colors.text }]}>{dialog.secondary.label}</Text>
                </TouchableOpacity>
              )}
              {dialog.primary && (
                <TouchableOpacity
                  style={[styles.dialogButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setDialog(prev => ({ ...prev, visible: false }));
                    dialog.primary?.onPress?.();
                  }}
                >
                  <Text style={styles.dialogPrimaryText}>{dialog.primary.label}</Text>
                </TouchableOpacity>
              )}
              {!dialog.primary && !dialog.secondary && (
                <TouchableOpacity
                  style={[styles.dialogButton, { backgroundColor: colors.primary }]}
                  onPress={() => setDialog(prev => ({ ...prev, visible: false }))}
                >
                  <Text style={styles.dialogPrimaryText}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </RNModal>
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
  createText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  formCard: {
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 20,
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
  templatesList: {
    gap: 12,
  },
  templateCard: {},
  templateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  templateDays: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  templateDaysText: {
    fontSize: 12,
  },
  daysCard: {
    marginBottom: 8,
  },
  daysList: {
    gap: 12,
  },
  dayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dayShort: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 30,
  },
  dayLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  summaryCard: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryText: {
    fontSize: 16,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  createButton: {
    marginBottom: 0,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    minHeight: 180,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '92%',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    gap: 12,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dialogIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
  },
  dialogMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogGhost: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  dialogGhostText: {
    textAlign: 'center',
    fontWeight: '700',
  },
  dialogPrimaryText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '700',
  },
});

export default CreateRoutineScreen;
