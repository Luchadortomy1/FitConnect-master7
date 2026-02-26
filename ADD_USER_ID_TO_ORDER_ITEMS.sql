-- Agregar columna user_id a la tabla order_items si no existe
-- Esto es necesario para las políticas RLS

ALTER TABLE order_items
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Crear índice para mejorar performance
CREATE INDEX idx_order_items_user_id ON order_items(user_id);

-- Opcional: Si quieres hacer esta columna NOT NULL en el futuro:
-- ALTER TABLE order_items ALTER COLUMN user_id SET NOT NULL;
