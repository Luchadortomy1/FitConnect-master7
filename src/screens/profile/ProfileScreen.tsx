import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input } from '@/components';
import { User } from '@/types';
import { calculateMacrosForUser, MacroCalculatorInput, MacroResult } from '@/utils/macroCalculator';
import { uploadAvatar } from '@/api/auth';

// BMI calculation function
const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

// BMI interpretation function
const getBMIInterpretation = (bmi: number): { category: string; color: string; description: string } => {
  if (bmi < 18.5) {
    return {
      category: 'Bajo peso',
      color: '#3B82F6', // blue
      description: 'Es recomendable consultar con un profesional para aumentar peso de forma saludable'
    };
  } else if (bmi >= 18.5 && bmi < 25) {
    return {
      category: 'Peso normal',
      color: '#10B981', // green
      description: '¡Excelente! Mantén tus hábitos saludables actuales'
    };
  } else if (bmi >= 25 && bmi < 30) {
    return {
      category: 'Sobrepeso',
      color: '#F59E0B', // yellow
      description: 'Considera hacer ejercicio regular y mantener una dieta balanceada'
    };
  } else {
    return {
      category: 'Obesidad',
      color: '#EF4444', // red
      description: 'Se recomienda consultar con un profesional de la salud'
    };
  }
};

const ProfileScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { user, updateUser, logout } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    weight: user?.weight?.toString() || '',
    height: user?.height?.toString() || '',
    gender: user?.gender || 'male',
    goal: user?.goal || 'maintain',
    activityLevel: user?.activityLevel || 'moderate',
  });
  const [loading, setLoading] = useState(false);
  const [macros, setMacros] = useState<MacroResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ weight?: string; height?: string; name?: string; age?: string }>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age?.toString() || '',
        weight: user.weight?.toString() || '',
        height: user.height?.toString() || '',
        gender: user.gender || 'male',
        goal: user.goal || 'maintain',
        activityLevel: user.activityLevel || 'moderate',
      });
    }
  }, [user]);

  // Calculate macros whenever weight, height, age, gender, goal, or activity level changes
  useEffect(() => {
    const age = Number.parseInt(formData.age, 10);
    const weight = Number.parseFloat(formData.weight);
    const height = Number.parseFloat(formData.height);

    const hasRequired = formData.weight.trim() && formData.height.trim() && formData.age.trim();
    const hasNumbers = !Number.isNaN(age) && !Number.isNaN(weight) && !Number.isNaN(height);
    const inRange = weight >= 20 && weight <= 300 && height >= 100 && height <= 250 && age >= 1 && age <= 120;

    if (!hasRequired || !hasNumbers || !inRange) {
      setMacros(null);
      return;
    }

    const macroResult = calculateMacrosForUser({
      weight,
      height,
      age,
      gender: formData.gender as 'male' | 'female',
      activityLevel: formData.activityLevel as 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active',
      goal: formData.goal as 'lose_weight' | 'gain_muscle' | 'maintain',
    });

    setMacros(macroResult);
  }, [formData.weight, formData.height, formData.age, formData.gender, formData.goal, formData.activityLevel]);

  const handleSave = async () => {
    setLoading(true);
    const errors: { weight?: string; height?: string; name?: string; age?: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }

    const age = formData.age ? Number.parseInt(formData.age, 10) : undefined;
    const weight = formData.weight ? Number.parseFloat(formData.weight) : undefined;
    const height = formData.height ? Number.parseFloat(formData.height) : undefined;

    if (formData.age && (Number.isNaN(age) || age < 1 || age > 120)) {
      errors.age = 'La edad debe ser entre 1 y 120';
    }

    if (!formData.weight.trim()) {
      errors.weight = 'El peso es obligatorio';
    } else if (Number.isNaN(weight!) || weight! < 20 || weight! > 300) {
      errors.weight = 'El peso debe ser entre 20 y 300 kg';
    }

    if (!formData.height.trim()) {
      errors.height = 'La altura es obligatoria';
    } else if (Number.isNaN(height!) || height! < 100 || height! > 250) {
      errors.height = 'La altura debe ser entre 100 y 250 cm';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    setValidationErrors({});

    try {
      const updatedUserData: Partial<User> = {
        name: formData.name.trim(),
        age: age,
        weight: weight,
        height: height,
        gender: formData.gender as 'male' | 'female',
        goal: formData.goal,
        activityLevel: formData.activityLevel,
      };

      const result = await updateUser(updatedUserData);
      
      if (result.success) {
        setEditing(false);
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      } else {
        Alert.alert('Error', result.error || 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age?.toString() || '',
        weight: user.weight?.toString() || '',
        height: user.height?.toString() || '',
        gender: user.gender || 'male',
        goal: user.goal || 'maintain',
        activityLevel: user.activityLevel || 'moderate',
      });
    }
    setEditing(false);
  };

  const ensureImagePermissions = async (mode: 'camera' | 'library') => {
    if (mode === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para tomar una foto.');
        return false;
      }
    }

    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (libraryStatus !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para elegir una imagen.');
      return false;
    }

    return true;
  };

  const handleAvatarUpload = async (uri: string) => {
    if (!user?.id) {
      Alert.alert('Sesión requerida', 'Necesitas iniciar sesión para actualizar tu foto.');
      return;
    }

    setAvatarUploading(true);
    try {
      const uploadResult = await uploadAvatar(user.id, uri);

      if (!uploadResult.success || !uploadResult.url) {
        Alert.alert('Error', uploadResult.error || 'No se pudo subir la imagen');
        return;
      }

      const updateResult = await updateUser({ avatar: uploadResult.url });
      if (!updateResult.success) {
        Alert.alert('Error', updateResult.error || 'No se pudo actualizar la foto de perfil');
        return;
      }

      Alert.alert('Listo', 'Foto de perfil actualizada');
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Error', 'No se pudo actualizar la foto de perfil');
    } finally {
      setAvatarUploading(false);
    }
  };

  const openImagePicker = async (mode: 'camera' | 'library') => {
    if (!user?.id) {
      Alert.alert('Sesión requerida', 'Necesitas iniciar sesión para actualizar tu foto.');
      return;
    }

    const hasPermission = await ensureImagePermissions(mode);
    if (!hasPermission) return;

    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    };

    const result = mode === 'camera'
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (result.canceled || !result.assets?.length) {
      return;
    }

    await handleAvatarUpload(result.assets[0].uri);
  };

  const handleAvatarPress = () => {
    Alert.alert(
      'Actualizar foto',
      'Elige una opción',
      [
        { text: 'Tomar foto', onPress: () => openImagePicker('camera') },
        { text: 'Elegir de galería', onPress: () => openImagePicker('library') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  // Calculate BMI if both weight and height are available
  const bmi = user?.weight && user?.height ? calculateBMI(user.weight, user.height) : null;
  const bmiInfo = bmi ? getBMIInterpretation(bmi) : null;

  const goalOptions = [
    { value: 'lose_weight', label: 'Pérdida de grasa' },
    { value: 'gain_muscle', label: 'Ganancia muscular' },
    { value: 'maintain', label: 'Mantenimiento' },
  ];

  const activityOptions = [
    { value: 'sedentary', label: 'Sedentario' },
    { value: 'light', label: 'Actividad ligera' },
    { value: 'moderate', label: 'Moderadamente activo' },
    { value: 'very_active', label: 'Muy activo' },
    { value: 'extra_active', label: 'Extremadamente activo' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Mi Perfil</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Progress' as never)}
          >
            <Ionicons name="trending-up-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={async () => {
              Alert.alert(
                'Cerrar sesión',
                '¿Estás seguro que deseas cerrar sesión?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Cerrar sesión',
                    style: 'destructive',
                    onPress: () => {
                      logout().catch((error) => {
                        console.error('Error al cerrar sesión:', error);
                        Alert.alert('Error', 'No se pudo cerrar la sesión');
                      });
                    }
                  }
                ]
              );
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.flex} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Picture Section */}
          <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={50} color="white" />
              )}
            </View>
            <TouchableOpacity
              style={[styles.editAvatarButton, { backgroundColor: colors.primary, opacity: avatarUploading ? 0.7 : 1 }]}
              onPress={handleAvatarPress}
              disabled={avatarUploading}
            >
              {avatarUploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="camera" size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {/* Personal Information */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Información Personal
              </Text>
              {!editing && (
                <TouchableOpacity 
                  style={[styles.editButton, { backgroundColor: colors.primary }]}
                  onPress={() => setEditing(true)}
                >
                  <Ionicons name="pencil" size={16} color="white" />
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.formContainer}>
              <Input
                label="Nombre de usuario"
                value={formData.name}
                onChangeText={(text) => {
                  setFormData({ ...formData, name: text });
                  if (validationErrors.name) {
                    setValidationErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                placeholder="Ingresa tu nombre"
                editable={editing}
                error={validationErrors.name}
              />

              <Input
                label="Edad (años)"
                value={formData.age}
                onChangeText={(text) => {
                  setFormData({ ...formData, age: text });
                  if (validationErrors.age) {
                    setValidationErrors((prev) => ({ ...prev, age: undefined }));
                  }
                }}
                placeholder="Ingresa tu edad"
                keyboardType="numeric"
                editable={editing}
                error={validationErrors.age}
              />

              <Input
                label="Peso (kg)"
                value={formData.weight}
                onChangeText={(text) => {
                  setFormData({ ...formData, weight: text });
                  if (validationErrors.weight) {
                    setValidationErrors((prev) => ({ ...prev, weight: undefined }));
                  }
                }}
                placeholder="Ingresa tu peso"
                keyboardType="decimal-pad"
                editable={editing}
                error={validationErrors.weight}
              />

              <Input
                label="Altura (cm)"
                value={formData.height}
                onChangeText={(text) => {
                  setFormData({ ...formData, height: text });
                  if (validationErrors.height) {
                    setValidationErrors((prev) => ({ ...prev, height: undefined }));
                  }
                }}
                placeholder="Ingresa tu altura"
                keyboardType="numeric"
                editable={editing}
                error={validationErrors.height}
              />

              {editing && (
                <>
                  {/* Gender Selector */}
                  <View style={styles.pickerContainer}>
                    <Text style={[styles.pickerLabel, { color: colors.text }]}>
                      Género
                    </Text>
                    <View style={[styles.pickerWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      <TouchableOpacity
                        style={[
                          styles.pickerOption,
                          formData.gender === 'male' && { backgroundColor: colors.primary + '20' },
                        ]}
                        onPress={() => setFormData({ ...formData, gender: 'male' })}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          { color: formData.gender === 'male' ? colors.primary : colors.text }
                        ]}>
                          Hombre
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.pickerOption,
                          formData.gender === 'female' && { backgroundColor: colors.primary + '20' },
                        ]}
                        onPress={() => setFormData({ ...formData, gender: 'female' })}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          { color: formData.gender === 'female' ? colors.primary : colors.text }
                        ]}>
                          Mujer
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Goal Selector */}
                  <View style={styles.pickerContainer}>
                    <Text style={[styles.pickerLabel, { color: colors.text }]}>
                      Objetivo
                    </Text>
                    <View style={[styles.pickerWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      {goalOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.pickerOption,
                            formData.goal === option.value && { backgroundColor: colors.primary + '20' },
                          ]}
                          onPress={() => setFormData({ ...formData, goal: option.value })}
                        >
                          <Text style={[
                            styles.pickerOptionText,
                            { color: formData.goal === option.value ? colors.primary : colors.text }
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Activity Level Selector */}
                  <View style={styles.pickerContainer}>
                    <Text style={[styles.pickerLabel, { color: colors.text }]}>
                      Nivel de actividad
                    </Text>
                    <View style={[styles.pickerWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                      {activityOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.pickerOption,
                            formData.activityLevel === option.value && { backgroundColor: colors.primary + '20' },
                          ]}
                          onPress={() => setFormData({ ...formData, activityLevel: option.value })}
                        >
                          <Text style={[
                            styles.pickerOptionText,
                            { color: formData.activityLevel === option.value ? colors.primary : colors.text }
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </View>

            {editing && (
              <View style={styles.actionButtons}>
                <View style={styles.actionButton}>
                  <Button
                    title="Cancelar"
                    onPress={handleCancel}
                    variant="outline"
                    fullWidth
                  />
                </View>
                <View style={styles.actionButton}>
                  <Button
                    title="Guardar"
                    onPress={handleSave}
                    loading={loading}
                    fullWidth
                  />
                </View>
              </View>
            )}
          </View>

          {/* Basic Info Display (when not editing) */}
          {!editing && (
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Datos Personales
              </Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Edad
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {user?.age ? `${user.age} años` : 'No definida'}
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Peso
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {user?.weight ? `${user.weight} kg` : 'No definido'}
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Altura
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {user?.height ? `${user.height} cm` : 'No definida'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* BMI Section */}
          {bmi && bmiInfo && (
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Índice de Masa Corporal (IMC)
              </Text>
              
              <View style={styles.bmiContainer}>
                <View style={styles.bmiValueContainer}>
                  <Text style={[styles.bmiValue, { color: bmiInfo.color }]}>
                    {bmi.toFixed(1)}
                  </Text>
                  <Text style={[styles.bmiLabel, { color: colors.textSecondary }]}>
                    IMC
                  </Text>
                </View>
                
                <View style={styles.bmiInfo}>
                  <Text style={[styles.bmiCategory, { color: bmiInfo.color }]}>
                    {bmiInfo.category}
                  </Text>
                  <Text style={[styles.bmiDescription, { color: colors.textSecondary }]}>
                    {bmiInfo.description}
                  </Text>
                </View>
              </View>

              {/* BMI Scale Visual */}
              <View style={styles.bmiScale}>
                <View style={styles.bmiScaleBar}>
                  <View style={[styles.bmiScaleSegment, { backgroundColor: '#3B82F6', flex: 18.5 }]} />
                  <View style={[styles.bmiScaleSegment, { backgroundColor: '#10B981', flex: 6.5 }]} />
                  <View style={[styles.bmiScaleSegment, { backgroundColor: '#F59E0B', flex: 5 }]} />
                  <View style={[styles.bmiScaleSegment, { backgroundColor: '#EF4444', flex: 10 }]} />
                </View>
                <View style={styles.bmiScaleLabels}>
                  <Text style={[styles.bmiScaleLabel, { color: colors.textSecondary }]}>
                    Bajo peso
                  </Text>
                  <Text style={[styles.bmiScaleLabel, { color: colors.textSecondary }]}>
                    Normal
                  </Text>
                  <Text style={[styles.bmiScaleLabel, { color: colors.textSecondary }]}>
                    Sobrepeso
                  </Text>
                  <Text style={[styles.bmiScaleLabel, { color: colors.textSecondary }]}>
                    Obesidad
                  </Text>
                </View>
              </View>

              {/* BMI Formula */}
              <View style={[styles.formulaContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.formulaTitle, { color: colors.text }]}>
                  Fórmula del IMC:
                </Text>
                <Text style={[styles.formula, { color: colors.textSecondary }]}>
                  IMC = peso (kg) / (altura (m))²
                </Text>
                {user?.weight && user?.height && (
                  <Text style={[styles.calculation, { color: colors.textSecondary }]}>
                    IMC = {user.weight} / ({(user.height / 100).toFixed(2)})² = {bmi.toFixed(1)}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Macros Section */}
          {macros && (
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Macronutrientes Diarios
              </Text>

              {/* Calories Display */}
              <View style={[styles.caloriesContainer, { backgroundColor: colors.primary + '15' }]}>
                <View style={styles.caloriesContent}>
                  <Text style={[styles.caloriesLabel, { color: colors.textSecondary }]}>
                    Calorías Diarias
                  </Text>
                  <Text style={[styles.caloriesValue, { color: colors.primary }]}>
                    {macros.calories}
                  </Text>
                  <Text style={[styles.caloriesUnit, { color: colors.textSecondary }]}>
                    kcal
                  </Text>
                </View>
                <View style={styles.tdeeInfo}>
                  <Text style={[styles.tdeeLabel, { color: colors.textSecondary }]}>
                    TDEE: {macros.tdee} kcal
                  </Text>
                  <Text style={[styles.tdeeLabel, { color: colors.textSecondary }]}>
                    Ajuste: {macros.calories - macros.tdee > 0 ? '+' : ''}{macros.calories - macros.tdee}
                  </Text>
                </View>
              </View>

              {/* Macros Distribution */}
              <View style={styles.macrosGrid}>
                {/* Protein */}
                <View style={[styles.macroCard, { backgroundColor: colors.background, borderLeftColor: '#EF4444', borderLeftWidth: 4 }]}>
                  <View style={styles.macroCardContent}>
                    <Ionicons name="nutrition" size={20} color="#EF4444" />
                    <Text style={[styles.macroName, { color: colors.text }]}>
                      Proteína
                    </Text>
                  </View>
                  <Text style={[styles.macroValue, { color: '#EF4444' }]}>
                    {macros.protein}g
                  </Text>
                  <Text style={[styles.macroCalories, { color: colors.textSecondary }]}>
                    {Math.round(macros.protein * 4)} kcal (16%)
                  </Text>
                </View>

                {/* Carbs */}
                <View style={[styles.macroCard, { backgroundColor: colors.background, borderLeftColor: '#F59E0B', borderLeftWidth: 4 }]}>
                  <View style={styles.macroCardContent}>
                    <Ionicons name="flame" size={20} color="#F59E0B" />
                    <Text style={[styles.macroName, { color: colors.text }]}>
                      Carbohidratos
                    </Text>
                  </View>
                  <Text style={[styles.macroValue, { color: '#F59E0B' }]}>
                    {macros.carbs}g
                  </Text>
                  <Text style={[styles.macroCalories, { color: colors.textSecondary }]}>
                    {Math.round(macros.carbs * 4)} kcal (47%)
                  </Text>
                </View>

                {/* Fats */}
                <View style={[styles.macroCard, { backgroundColor: colors.background, borderLeftColor: '#10B981', borderLeftWidth: 4 }]}>
                  <View style={styles.macroCardContent}>
                    <Ionicons name="water" size={20} color="#10B981" />
                    <Text style={[styles.macroName, { color: colors.text }]}>
                      Grasas
                    </Text>
                  </View>
                  <Text style={[styles.macroValue, { color: '#10B981' }]}>
                    {macros.fats}g
                  </Text>
                  <Text style={[styles.macroCalories, { color: colors.textSecondary }]}>
                    {Math.round(macros.fats * 9)} kcal (37%)
                  </Text>
                </View>
              </View>

              {/* Health Metrics */}
              <View style={[styles.metricsContainer, { backgroundColor: colors.background }]}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    TMB
                  </Text>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {macros.tmb} kcal
                  </Text>
                  <Text style={[styles.metricDesc, { color: colors.textSecondary }]}>
                    Tasa Metabólica Basal
                  </Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    TDEE
                  </Text>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {macros.tdee} kcal
                  </Text>
                  <Text style={[styles.metricDesc, { color: colors.textSecondary }]}>
                    Gasto Energético Total
                  </Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    IMC
                  </Text>
                  <Text style={[styles.metricValue, { color: colors.primary }]}>
                    {macros.bmi}
                  </Text>
                  <Text style={[styles.metricDesc, { color: colors.textSecondary }]}>
                    Índice de Masa Corporal
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Goals & Activity */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Objetivos y Actividad
            </Text>
            
            <View style={styles.goalContainer}>
              <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>
                Objetivo actual:
              </Text>
              <Text style={[styles.goalValue, { color: colors.primary }]}>
                {goalOptions.find(opt => opt.value === user?.goal)?.label || 'No definido'}
              </Text>
            </View>

            <View style={styles.goalContainer}>
              <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>
                Nivel de actividad:
              </Text>
              <Text style={[styles.goalValue, { color: colors.primary }]}>
                {activityOptions.find(opt => opt.value === user?.activityLevel)?.label || 'No definido'}
              </Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderRadius: 16,
    marginBottom: 16,
    position: 'relative',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 35,
    right: '50%',
    transform: [{ translateX: 30 }],
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    gap: 16,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    marginVertical: 8,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
  },
  pickerOption: {
    padding: 12,
    borderRadius: 6,
    marginVertical: 2,
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 20,
  },
  bmiValueContainer: {
    alignItems: 'center',
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  bmiLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  bmiInfo: {
    flex: 1,
  },
  bmiCategory: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  bmiDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  bmiScale: {
    marginBottom: 16,
  },
  bmiScaleBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  bmiScaleSegment: {
    height: '100%',
  },
  bmiScaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bmiScaleLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  formulaContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  formulaTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  formula: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  calculation: {
    fontSize: 14,
    fontWeight: '500',
  },
  goalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  goalLabel: {
    fontSize: 16,
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  caloriesContent: {
    alignItems: 'center',
    flex: 1,
  },
  caloriesLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  caloriesValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  caloriesUnit: {
    fontSize: 12,
  },
  tdeeInfo: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  tdeeLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  macrosGrid: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  macroCard: {
    padding: 14,
    borderRadius: 12,
  },
  macroCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  macroName: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    flexShrink: 1,
  },
  macroValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  macroCalories: {
    fontSize: 11,
    lineHeight: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  metricDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 16,
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  metricDesc: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  infoMessage: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoMessageText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    flexWrap: 'wrap',
  },
});

export default ProfileScreen;