/**
 * Cálculo de macronutrientes basado en:
 * - Peso en kg
 * - Altura en cm
 * - Edad en años
 * - Género
 * - Nivel de actividad física
 * - Objetivo (pérdida de grasa, ganancia muscular, mantenimiento)
 */

export interface MacroCalculatorInput {
  weight: number; // kg
  height: number; // cm
  age: number; // años
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
  goal: 'lose_weight' | 'gain_muscle' | 'maintain';
}

export interface MacroResult {
  tdee: number; // Total Daily Energy Expenditure (calorías diarias)
  calories: number; // Calorías ajustadas según objetivo
  protein: number; // gramos
  carbs: number; // gramos
  fats: number; // gramos
  bmi: number;
  tmb: number; // Tasa Metabólica Basal
}

/**
 * Calcula la Tasa Metabólica Basal usando la fórmula de Harris-Benedict
 */
const calculateTMB = (weight: number, height: number, age: number, gender: 'male' | 'female'): number => {
  if (gender === 'male') {
    // Hombres: TMB = 88.362 + (13.397 × peso en kg) + (4.799 × altura en cm) - (5.677 × edad en años)
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    // Mujeres: TMB = 447.593 + (9.247 × peso en kg) + (3.098 × altura en cm) - (4.330 × edad en años)
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
};

/**
 * Obtiene el multiplicador de actividad física
 */
const getActivityMultiplier = (activityLevel: string): number => {
  switch (activityLevel) {
    case 'sedentary':
      return 1.2; // Poco o ningún ejercicio
    case 'light':
      return 1.375; // Ejercicio ligero 1-3 días por semana
    case 'moderate':
      return 1.55; // Ejercicio moderado 3-5 días por semana
    case 'very_active':
      return 1.725; // Ejercicio intenso 6-7 días por semana
    case 'extra_active':
      return 1.9; // Ejercicio muy intenso / trabajo físico
    default:
      return 1.55;
  }
};

/**
 * Calcula el macronutrientes según el objetivo
 */
const calculateMacroDistribution = (
  calories: number,
  goal: string,
  weight: number
): { protein: number; carbs: number; fats: number } => {
  // Proteína: depende del objetivo
  let proteinGramsPerKg = 1.6; // Default para mantenimiento
  
  switch (goal) {
    case 'lose_weight':
      proteinGramsPerKg = 2.0; // Mayor proteína para preservar músculo en déficit
      break;
    case 'gain_muscle':
      proteinGramsPerKg = 2.0; // Mayor proteína para síntesis muscular
      break;
    case 'maintain':
      proteinGramsPerKg = 1.6;
      break;
  }

  const protein = weight * proteinGramsPerKg;
  const proteinCalories = protein * 4; // Proteína: 4 calorías por gramo

  // Grasas: 25-30% de las calorías
  const fatPercentage = goal === 'lose_weight' ? 0.25 : 0.30;
  const fatCalories = calories * fatPercentage;
  const fats = fatCalories / 9; // Grasas: 9 calorías por gramo

  // Carbohidratos: el resto
  const carbCalories = calories - proteinCalories - fatCalories;
  const carbs = carbCalories / 4; // Carbohidratos: 4 calorías por gramo

  return {
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fats: Math.round(fats),
  };
};

/**
 * Calcula el ajuste calórico según el objetivo
 */
const getCalorieAdjustment = (goal: string): number => {
  switch (goal) {
    case 'lose_weight':
      return -500; // Déficit de 500 calorías (~ 0.5 kg por semana)
    case 'gain_muscle':
      return 300; // Superávit de 300 calorías
    case 'maintain':
      return 0;
    default:
      return 0;
  }
};

/**
 * Función principal para calcular todos los macros
 */
export const calculateMacrosForUser = (input: MacroCalculatorInput): MacroResult => {
  const { weight, height, age, gender, activityLevel, goal } = input;

  // Validaciones básicas
  if (weight < 20 || weight > 300) {
    throw new Error('El peso debe estar entre 20 y 300 kg');
  }
  if (height < 100 || height > 250) {
    throw new Error('La altura debe estar entre 100 y 250 cm');
  }
  if (age < 1 || age > 120) {
    throw new Error('La edad debe estar entre 1 y 120 años');
  }

  // Calcular TMB
  const tmb = calculateTMB(weight, height, age, gender);

  // Calcular TDEE (Total Daily Energy Expenditure)
  const activityMultiplier = getActivityMultiplier(activityLevel);
  const tdee = tmb * activityMultiplier;

  // Ajustar calorías según objetivo
  const calorieAdjustment = getCalorieAdjustment(goal);
  const calories = Math.max(tdee + calorieAdjustment, 1200); // Mínimo 1200 calorías

  // Calcular macros
  const macros = calculateMacroDistribution(calories, goal, weight);

  // Calcular IMC
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  return {
    tdee: Math.round(tdee),
    calories: Math.round(calories),
    protein: macros.protein,
    carbs: macros.carbs,
    fats: macros.fats,
    bmi: Math.round(bmi * 10) / 10, // Redondear a 1 decimal
    tmb: Math.round(tmb),
  };
};
