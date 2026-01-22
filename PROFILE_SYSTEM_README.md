# Sistema de Perfiles - FitConnect

## Funcionalidad Implementada

Se ha implementado un sistema completo de perfiles de usuario que permite al usuario gestionar su información personal, incluyendo:

### Campos del Perfil

1. **Nombre** - Obligatorio al registrarse
2. **Edad** - Opcional, en años (validación: 1-120)
3. **Peso** - Opcional, en kilogramos (validación: 20-300 kg)
4. **Altura** - Opcional, en centímetros (validación: 100-250 cm)
5. **Objetivo** - Opcional, opciones: Perder peso, Ganar músculo, Mantener peso, Mejorar resistencia
6. **Nivel de Actividad** - Opcional, opciones: Sedentario, Actividad ligera, Moderadamente activo, Muy activo, Extremadamente activo

### Características Principales

#### 1. **Visualización del Perfil**
- Muestra información personal en una sección dedicada cuando no está editando
- Calcula y muestra el Índice de Masa Corporal (IMC) si peso y altura están disponibles
- Incluye interpretación del IMC con colores y recomendaciones
- Fórmula del IMC visible con cálculo específico del usuario

#### 2. **Edición del Perfil**
- Modo de edición activable con botón "Editar"
- Campos de entrada para edad, peso y altura con validación
- Selectores interactivos para objetivo y nivel de actividad
- Botones "Cancelar" y "Guardar" para gestionar cambios

#### 3. **Persistencia en Base de Datos**
- Todos los datos se guardan automáticamente en Supabase
- Sistema de actualización con verificación de errores
- Estructura de base de datos preparada con tipos correctos

### Implementación Técnica

#### Base de Datos (Supabase)
```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    age INTEGER,
    weight DECIMAL,
    height DECIMAL,
    goal TEXT CHECK (goal IN ('lose_weight', 'gain_muscle', 'maintain', 'endurance')),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'very_active', 'extra_active')),
    -- ... otros campos
);
```

#### TypeScript Types
```typescript
interface User {
    id: string;
    email: string;
    name: string;
    age?: number;
    weight?: number;
    height?: number;
    goal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'endurance';
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
    // ... otros campos opcionales
}
```

#### Funciones API Principales
- `updateProfile()` - Actualiza perfil en base de datos
- `getCurrentUser()` - Obtiene perfil completo del usuario
- `updateUser()` - Actualiza contexto local y base de datos

### Flujo de Trabajo del Usuario

1. **Registro**: El usuario se registra solo con nombre y email
2. **Primer Login**: Puede acceder inmediatamente al perfil
3. **Completar Perfil**: Puede agregar edad, peso, altura, objetivo y nivel de actividad
4. **Cálculo Automático**: Si proporciona peso y altura, se calcula automáticamente el IMC
5. **Edición Posterior**: Puede modificar cualquier campo en cualquier momento

### Validaciones Implementadas

- **Edad**: 1-120 años
- **Peso**: 20-300 kg
- **Altura**: 100-250 cm
- **Campos requeridos**: Solo nombre es obligatorio
- **Formato numérico**: Validación automática con mensaje de error

### Cálculo del IMC

- **Fórmula**: IMC = peso (kg) / (altura (m))²
- **Categorías**:
  - Bajo peso: < 18.5 (Azul)
  - Normal: 18.5-24.9 (Verde)
  - Sobrepeso: 25-29.9 (Amarillo)
  - Obesidad: ≥ 30 (Rojo)
- **Visualización**: Escala de colores con recomendaciones personalizadas

### Próximas Mejoras Sugeridas

1. **Foto de Perfil**: Implementar carga de avatar
2. **Metas Nutricionales**: Cálculo automático basado en perfil
3. **Historial**: Tracking de cambios en peso y medidas
4. **Sincronización**: Integración con dispositivos de fitness
5. **Notificaciones**: Recordatorios para actualizar medidas

## Archivos Modificados

1. `src/api/auth.ts` - Funciones de actualización de perfil
2. `src/contexts/AuthContext.tsx` - Contexto de usuario con updateUser async
3. `src/screens/profile/ProfileScreen.tsx` - UI completa del perfil
4. `src/types/index.ts` - Tipos actualizados con campos opcionales
5. `src/config/supabase.ts` - Esquema de base de datos actualizado

## Instalación y Uso

1. La funcionalidad está lista para usar inmediatamente
2. Los usuarios existentes pueden completar su perfil la próxima vez que lo visiten
3. Los nuevos usuarios pueden agregar su información gradualmente
4. No se requiere migración de datos ya que todos los campos nuevos son opcionales