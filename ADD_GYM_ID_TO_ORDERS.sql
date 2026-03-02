-- Agregar columna gym_id a la tabla orders si no existe
-- Esta columna permite vincular una orden a un gym específico

ALTER TABLE orders
ADD COLUMN gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL;

-- Crear índice para mejorar performance
CREATE INDEX idx_orders_gym_id ON orders(gym_id);

-- Opcional: Si quieres que sea NOT NULL en el futuro:
-- ALTER TABLE orders ALTER COLUMN gym_id SET NOT NULL;
