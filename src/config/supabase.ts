/**
 * Configuración de Supabase
 * 
 * INSTRUCCIONES PARA CONFIGURAR SUPABASE:
 * 
 * 1. Ve a https://supabase.com y crea una cuenta
 * 2. Crea un nuevo proyecto
 * 3. Ve a Settings > API
 * 4. Copia la URL y la clave anónima aquí
 * 5. Ve a SQL Editor y ejecuta las siguientes queries:
 */

// TODO: Reemplaza estas URLs con las tuyas de Supabase
// CONFIGURADO - Credenciales de FitConnect
export const SUPABASE_URL = 'https://asepjaidwuzkxdtczbqj.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzZXBqYWlkd3V6a3hkdGN6YnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NzkxMDUsImV4cCI6MjA4NDQ1NTEwNX0.CkU_mJV9j5fUbi7XJ6BVwRK_5WPs0fqKLRfgrNLHrVw';

/*
SQL PARA CREAR TABLAS (Ejecutar en SQL Editor de Supabase):

-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    age INTEGER,
    weight DECIMAL,
    height DECIMAL,
    goal TEXT CHECK (goal IN ('lose_weight', 'gain_muscle', 'maintain', 'endurance')),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'very_active', 'extra_active')),
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
*/