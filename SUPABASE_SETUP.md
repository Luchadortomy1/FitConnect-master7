# 🏋️ FitConnect - Configuración de Autenticación con Supabase

## 🚀 Configuración de Supabase

### Paso 1: Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Haz clic en "New Project"
3. Llena los detalles:
   - **Name**: FitConnect
   - **Database Password**: (Guarda esta contraseña, la necesitarás)
   - **Region**: Elige la más cercana a tus usuarios
4. Haz clic en "Create new project"

### Paso 2: Obtener las credenciales

1. Una vez creado el proyecto, ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** (ej: `https://abcdefgh.supabase.co`)
   - **API Key (anon, public)** (ej: `eyJ0eXAiOiJKV1QiLCJhbGciOi...`)

### Paso 3: Configurar las credenciales en la app

1. Abre el archivo `src/config/supabase.ts`
2. Reemplaza los valores:
   ```typescript
   export const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
   export const SUPABASE_ANON_KEY = 'tu-clave-anonima-aqui';
   ```

### Paso 4: Crear las tablas en Supabase

1. En tu dashboard de Supabase, ve a **SQL Editor**
2. Crea una nueva query y pega el siguiente código SQL:

```sql
-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    age INTEGER,
    weight DECIMAL,
    height DECIMAL,
    goal TEXT CHECK (goal IN ('lose_weight', 'gain_muscle', 'maintain', 'gain_weight')),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    target_calories INTEGER,
    target_protein DECIMAL,
    target_carbs DECIMAL,
    target_fat DECIMAL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Crear función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
        NEW.id, 
        NEW.raw_user_meta_data->>'full_name',
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para nueva cuenta
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

3. Haz clic en **Run** para ejecutar la query

### Paso 5: Configurar la autenticación por email

1. Ve a **Authentication** → **Settings**
2. En **Auth Settings**, configura:
   - **Site URL**: `exp://127.0.0.1:8081` (para desarrollo con Expo)
   - **Redirect URLs**: Agrega `exp://127.0.0.1:8081` si no está
3. En **Email Templates**, puedes personalizar los emails de confirmación

## ✅ Funcionalidades Implementadas

### 🔐 Sistema de Autenticación
- ✅ Registro de usuarios con email y contraseña
- ✅ Inicio de sesión seguro
- ✅ Almacenamiento seguro de tokens con `expo-secure-store`
- ✅ Cierre de sesión
- ✅ Persistencia de sesión (auto-login)
- ✅ Manejo de estados de carga

### 👤 Gestión de Perfiles
- ✅ Creación automática de perfil al registrarse
- ✅ Actualización de datos del perfil
- ✅ Almacenamiento de información fitness (peso, altura, objetivos, etc.)

### 🛡️ Seguridad
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de acceso por usuario
- ✅ Tokens encriptados y almacenados de forma segura
- ✅ Validación de formularios
- ✅ Manejo de errores

## 🎯 Cómo usar la autenticación

### Registro de usuario:
1. Abre la app
2. Ve a "Sign Up"
3. Completa: nombre, email y contraseña
4. Si tienes confirmación por email habilitada, revisa tu correo
5. ¡Listo! Ya puedes usar la app

### Inicio de sesión:
1. Ve a "Sign In"
2. Ingresa tu email y contraseña
3. ¡Acceso concedido!

## 🛠️ Estructura del código

```
src/
├── api/
│   └── auth.ts           # Funciones de autenticación con Supabase
├── config/
│   └── supabase.ts       # Configuración y credenciales
├── contexts/
│   └── AuthContext.tsx   # Context de autenticación global
├── screens/auth/
│   ├── AuthLoadingScreen.tsx   # Pantalla de carga
│   ├── LoginScreen.tsx         # Pantalla de inicio de sesión
│   └── SignupScreen.tsx        # Pantalla de registro
└── types/
    └── index.ts          # Tipos TypeScript
```

## 🔧 Desarrollo

### Comandos útiles:
```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npx expo start

# Ver logs en tiempo real
npx expo logs
```

### Para debugging:
- Los logs aparecen en la consola de Expo
- Puedes usar `console.log()` en cualquier parte del código
- Los errores de Supabase se muestran en la consola

## 📱 Testing

Para probar la autenticación:

1. **Registro**: Usa un email real si tienes confirmación habilitada
2. **Login**: Usa las credenciales que registraste
3. **Persistencia**: Cierra y abre la app, debería mantenerte logueado
4. **Logout**: Prueba cerrar sesión desde el perfil

## 🚨 Solución de problemas comunes

### Error: "Invalid API key"
- Verifica que copiaste bien la `SUPABASE_ANON_KEY`
- Asegúrate de no haber copiado espacios extra

### Error: "Failed to fetch"
- Verifica que la `SUPABASE_URL` sea correcta
- Revisa tu conexión a internet

### Error: "Email not confirmed"
- Revisa tu bandeja de entrada y spam
- Ve a Auth Settings y desactiva "Enable email confirmations" para desarrollo

### La app se cierra al hacer login/signup
- Revisa los logs con `npx expo logs`
- Verifica que las tablas estén creadas correctamente

---

¡Tu sistema de autenticación está listo! 🎉

Si necesitas ayuda, revisa los logs o pregunta en el equipo de desarrollo.