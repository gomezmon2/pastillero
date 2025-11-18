-- ============================================
-- Migración: Agregar campo imagen_url
-- Fecha: 2025-11-18
-- Descripción: Agrega el campo para almacenar
--              la URL de la imagen del medicamento
-- ============================================

-- Agregar la columna imagen_url a la tabla medicamentos
ALTER TABLE medicamentos
ADD COLUMN IF NOT EXISTS imagen_url TEXT;

-- Comentario para documentar la columna
COMMENT ON COLUMN medicamentos.imagen_url IS 'URL de la imagen del medicamento almacenada en Supabase Storage';

-- Verificar que la columna se agregó correctamente
-- Ejecuta esto para ver la estructura de la tabla:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'medicamentos'
-- ORDER BY ordinal_position;
