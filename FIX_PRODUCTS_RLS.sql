-- Verificar y ajustar RLS en tabla products

-- 1. VERIFICAR las políticas actuales
-- Ve a Supabase > Authentication > Policies > products Table
-- y revisa qué políticas están activas

-- 2. Si tienes este policy, ACTUALÍZALO para permitir UPDATE:
-- Policy name: "Allow users to UPDATE products"
-- Con esta configuración:

CREATE POLICY "Allow authenticated users to update products"
ON products
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 3. Si el policy anterior no existe, AGRÉGALO:
-- Supabase > SQL Editor > Ejecuta el código de arriba

-- 4. Si quieres permitir UPDATES sin restricciones (para desarrollo):
-- Borra los policies restrictivos y agrega este más permisivo:

ALTER TABLE products DISABLE ROW LEVEL SECURITY;
-- Después re-habilítalo cuando tengas los policies correctos:
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 5. O crea un policy sin restricciones:
CREATE POLICY "Allow all updates on products" ON products
FOR UPDATE
USING (true);

-- EL PROBLEMA PROBABLEMENTE ES:
-- - El policy de UPDATE no existe
-- - O está muy restrictivo
-- - Por eso el UPDATE "aparentemente" funciona pero no se guarda en la BD
