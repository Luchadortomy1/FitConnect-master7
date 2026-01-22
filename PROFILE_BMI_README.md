# FitConnect - Documentación del Sistema de Perfil y BMI

## 📱 Funcionalidad del Perfil con Calculadora IMC

### ✅ **CARACTERÍSTICAS IMPLEMENTADAS:**

#### 🏠 **Pantalla de Perfil Principal** (`ProfileScreen.tsx`)

**Campos de Información Personal:**
- ✅ **Nombre de usuario** - Campo de texto editable
- ✅ **Edad (años)** - Campo numérico (1-120 años)
- ✅ **Peso (kg)** - Campo decimal (20-300 kg)
- ✅ **Altura (cm)** - Campo numérico (100-250 cm)
- ✅ **Objetivos** - Selección entre: perder peso, ganar músculo, mantener, mejorar resistencia
- ✅ **Nivel de actividad** - Desde sedentario hasta extremadamente activo

#### 📊 **Calculadora IMC Automática**

**Fórmula Implementada:**
```
IMC = peso (kg) / (altura (m))²
```

**Interpretaciones del IMC:**
- 🔵 **Bajo peso** (< 18.5) - Color azul
- 🟢 **Peso normal** (18.5 - 24.9) - Color verde 
- 🟡 **Sobrepeso** (25.0 - 29.9) - Color amarillo
- 🔴 **Obesidad** (≥ 30.0) - Color rojo

**Características visuales:**
- ✅ Cálculo automático en tiempo real
- ✅ Interpretación con colores y descripciones
- ✅ Barra visual con rangos de IMC
- ✅ Muestra la fórmula y cálculo detallado
- ✅ Recomendaciones personalizadas

#### 🎨 **Diseño y UX**

**Interfaz:**
- ✅ **Modo edición** - Botón "Editar" activa campos
- ✅ **Validación en tiempo real** - Rangos válidos para cada campo
- ✅ **Avatar personalizable** - Icono de cámara para cambiar foto
- ✅ **Tema oscuro/claro** - Compatible con sistema de temas
- ✅ **Botones de acción** - Guardar/Cancelar con confirmación
- ✅ **Feedback visual** - Colores según interpretación IMC

**Secciones organizadas:**
1. **Foto de perfil** con opción de editar
2. **Información Personal** (campos editables)
3. **Cálculo IMC** (automático con visualización)
4. **Objetivos y Actividad** (configuración actual)
5. **Objetivos Nutricionales** (calorías, macros)

### 🔧 **DATOS MOCK UTILIZADOS**

#### **Usuario por defecto (Login):**
```typescript
{
  id: '1',
  email: 'usuario@ejemplo.com',
  name: 'Carlos Rodriguez',
  age: 28,
  weight: 75,           // kg
  height: 175,          // cm
  goal: 'gain_muscle',
  activityLevel: 'moderate',
  targetCalories: 2500,
  targetProtein: 150,   // gramos
  targetCarbs: 300,     // gramos
  targetFat: 85,        // gramos
}
```

**IMC calculado:** 24.5 (Peso normal) 🟢

#### **Usuario por defecto (Signup):**
```typescript
{
  id: '1',
  email: 'nuevo@ejemplo.com',
  name: '[Nombre ingresado]',
  age: 25,
  weight: 68,           // kg
  height: 170,          // cm
  goal: 'maintain',
  activityLevel: 'moderate',
  targetCalories: 2000,
  targetProtein: 120,   // gramos
  targetCarbs: 250,     // gramos
  targetFat: 70,        // gramos
}
```

**IMC calculado:** 23.5 (Peso normal) 🟢

### ⚙️ **VALIDACIONES IMPLEMENTADAS**

#### **Campos requeridos:**
- ✅ **Nombre** - No puede estar vacío
- ✅ **Edad** - Número entre 1 y 120 años
- ✅ **Peso** - Número entre 20 y 300 kg
- ✅ **Altura** - Número entre 100 y 250 cm

#### **Errores mostrados:**
- ❌ "El nombre es requerido"
- ❌ "La edad debe ser un número válido entre 1 y 120"
- ❌ "El peso debe ser un número válido entre 20 y 300 kg"
- ❌ "La altura debe ser un número válido entre 100 y 250 cm"

### 💾 **PERSISTENCIA DE DATOS**

#### **Context API:**
- ✅ Datos almacenados en `AuthContext`
- ✅ Función `updateUser()` para actualizar perfil
- ✅ Persistencia durante la sesión
- ✅ Mock API simula llamadas al servidor (1 segundo delay)

#### **Estados manejados:**
- ✅ Loading states durante guardado
- ✅ Modo edición on/off
- ✅ Validación de formularios
- ✅ Mensajes de éxito/error

### 🧮 **ALGORITMO IMC**

#### **Función de cálculo:**
```typescript
const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};
```

#### **Función de interpretación:**
```typescript
const getBMIInterpretation = (bmi: number) => {
  if (bmi < 18.5) return {
    category: 'Bajo peso',
    color: '#3B82F6', // azul
    description: 'Es recomendable consultar con un profesional...'
  };
  // ... más rangos
};
```

### 🎯 **CASOS DE PRUEBA**

#### **Ejemplo 1: Usuario con sobrepeso**
- Peso: 85 kg, Altura: 170 cm
- IMC: 29.4
- Resultado: "Sobrepeso" (color amarillo)
- Recomendación: "Considera hacer ejercicio regular..."

#### **Ejemplo 2: Usuario con peso normal**
- Peso: 65 kg, Altura: 175 cm  
- IMC: 21.2
- Resultado: "Peso normal" (color verde)
- Recomendación: "¡Excelente! Mantén tus hábitos saludables..."

#### **Ejemplo 3: Usuario con bajo peso**
- Peso: 50 kg, Altura: 175 cm
- IMC: 16.3
- Resultado: "Bajo peso" (color azul)
- Recomendación: "Es recomendable consultar con un profesional..."

### 🚀 **PRÓXIMAS MEJORAS SUGERIDAS**

#### **Funcionalidades adicionales:**
- 📸 Integración real con cámara para avatar
- 📊 Historial de peso y seguimiento
- 🏃‍♂️ Cálculo de calorías según actividad
- 📈 Gráficos de progreso
- 🎯 Metas personalizadas de peso
- 💡 Consejos nutricionales personalizados
- 🔄 Sincronización con aplicaciones de salud

#### **Mejoras técnicas:**
- 💾 Persistencia local (AsyncStorage)
- 🌐 Integración con API real
- 📱 Notificaciones de seguimiento
- 🔐 Validación más robusta
- 📊 Analytics de uso

---

## 🎉 **¡Sistema de Perfil y BMI Completado!**

✅ **Funcionalidad completa** con cálculo automático de IMC
✅ **Interfaz intuitiva** con modo edición
✅ **Validaciones robustas** con mensajes claros
✅ **Diseño responsive** con tema oscuro/claro
✅ **Datos mock realistas** para demostración
✅ **Interpretaciones médicas** con recomendaciones

**El usuario puede ahora:**
1. ✅ Ingresar sus datos personales
2. ✅ Ver su IMC calculado automáticamente  
3. ✅ Recibir interpretación y recomendaciones
4. ✅ Editar información de forma segura
5. ✅ Visualizar datos nutricionales objetivo